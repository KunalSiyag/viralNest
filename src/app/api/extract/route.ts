import { NextRequest, NextResponse } from "next/server";
import { extractMediaData } from "@/services/extractor";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
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
        source_url: extractedData.source_url,
        media_url: extractedData.media_url,
        thumbnail_url: extractedData.thumbnail_url,
        caption: extractedData.caption,
        tags: JSON.stringify(extractedData.tags),
        category: "uncategorized",
        created_at: new Date(),
        popularity_score: 0
      };
    }

    return NextResponse.json({ success: true, data: savedContent });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
