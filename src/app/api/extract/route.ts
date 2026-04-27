import { NextRequest, NextResponse } from "next/server";
import { extractMediaData } from "@/services/extractor";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract data using yt-dlp
    const extractedData = await extractMediaData(url);

    // Save metadata to Prisma
    const savedContent = await prisma.content.create({
      data: {
        platform: extractedData.platform,
        source_url: extractedData.source_url,
        media_url: extractedData.media_url,
        thumbnail_url: extractedData.thumbnail_url,
        caption: extractedData.caption,
        tags: JSON.stringify(extractedData.tags),
        category: "uncategorized", // We can enhance this with a category mapping logic later
      },
    });

    return NextResponse.json({ success: true, data: savedContent });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
