import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractMediaData } from "@/services/extractor";
import { categorizeContent, normalizeTags, extractTagsFromText } from "@/services/content-engine";
import { prisma } from "@/lib/db/prisma";
import { normalizeSourceUrl } from "@/services/url-normalizer";

const extractSchema = z.object({
  url: z.string().url('Please provide a valid URL'),
});

// Simple in-memory rate limiter (per-IP, 10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 10) return false;

  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = extractSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { url } = parsed.data;
    const normalizedInputUrl = normalizeSourceUrl(url);

    // Check for duplicate — return existing if already extracted
    const existing = await prisma.content.findUnique({
      where: { source_url: normalizedInputUrl },
    });

    // If existing has a media_url, or if it's a platform that genuinely doesn't have one, return cache.
    // But if media_url is null and we're expecting one (like Instagram), we should try to re-extract.
    if (existing && existing.media_url) {
      await prisma.content.update({
        where: { id: existing.id },
        data: { view_count: { increment: 1 } },
      });
      return NextResponse.json({
        success: true,
        data: {
          ...existing,
          platform_metrics: null,
          preview_mode: null,
          download_available: false,
        },
        cached: true,
      });
    }

    // Extract data using modular pipeline
    const extractedData = await extractMediaData(normalizedInputUrl);
    const normalizedSourceUrl = normalizeSourceUrl(extractedData.source_url || normalizedInputUrl);

    // Process through content engine
    const allTags = normalizeTags([
      ...extractedData.tags,
      ...extractTagsFromText(extractedData.caption || ''),
    ]);

    const category = categorizeContent(allTags);

    // Save to database
    let savedContent;
    
    if (existing) {
      // Update existing record with newly extracted media_url
      savedContent = await prisma.content.update({
        where: { id: existing.id },
        data: {
          media_url: extractedData.media_url,
          thumbnail_url: extractedData.thumbnail_url || existing.thumbnail_url,
          caption: extractedData.caption || existing.caption,
          media_type: extractedData.media_type || existing.media_type,
          tags: JSON.stringify(allTags),
          category: category.slug,
          view_count: { increment: 1 }
        },
      });
    } else {
      savedContent = await prisma.content.create({
        data: {
          platform: extractedData.platform,
          source_url: normalizedSourceUrl,
          media_url: extractedData.media_url,
          thumbnail_url: extractedData.thumbnail_url,
          caption: extractedData.caption,
          tags: JSON.stringify(allTags),
          category: category.slug,
          media_type: extractedData.media_type,
          view_count: 1,
        },
      });
    }

    const responseData = {
      ...savedContent,
      platform_metrics: extractedData.platform_metrics || null,
      preview_mode: extractedData.preview_mode || null,
      download_available: extractedData.download_available ?? false,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      category: { name: category.name, slug: category.slug },
      cached: false,
    });
  } catch (error: unknown) {
    console.error('Extraction error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
