import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractMediaData } from "@/services/extractor";
import { categorizeContent, normalizeTags, extractTagsFromText } from "@/services/content-engine";
import { prisma } from "@/lib/db/prisma";

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

    // Extract data using our scraper
    const extractedData = await extractMediaData(url);

    let savedContent;

    try {
      // Attempt to save metadata to Prisma (works locally)
      savedContent = await prisma.content.create({
        data: {
          platform: extractedData.platform,
          source_url: extractedData.source_url,
          media_url: extractedData.media_url,
          thumbnail_url: extractedData.thumbnail_url,
          caption: extractedData.caption,
          tags: JSON.stringify(extractedData.tags),
          category: "uncategorized",
        },
      });
    } catch (dbError) {
      // Vercel serverless environments have a read-only filesystem.
      // SQLite writes will fail with Error 14.
      // If the database write fails, we fall back to returning the data directly statelessly
      // so the user can still proceed to the preview page.
      console.warn("Database write failed (likely read-only environment). Returning stateless data.", dbError);

      // Generate a mock ID for the stateless preview
      savedContent = {
        id: "stateless-" + Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10),
        platform: extractedData.platform,
        source_url: url.split('?')[0], // Clean URL
        media_url: extractedData.media_url,
        thumbnail_url: extractedData.thumbnail_url,
        caption: extractedData.caption,
        tags: JSON.stringify(extractedData.tags),
        category: "uncategorized",
        created_at: new Date(),
        popularity_score: 0
      };
    }

    return NextResponse.json({
      success: true,
      data: savedContent,
      category: { name: category.name, slug: category.slug },
      cached: false,
    });
  } catch (error: unknown) {
    console.error('Extraction error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
