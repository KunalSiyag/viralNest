import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

/**
 * GET /api/content/[id]
 * Get single content item by ID
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.content.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });

    return NextResponse.json({ data: content });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

/**
 * PATCH /api/content/[id]
 * Update content stats (popularity, downloads)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    if (body.action === 'download') {
      updateData.download_count = { increment: 1 };
      updateData.popularity_score = { increment: 2 };
    } else if (body.action === 'view') {
      updateData.view_count = { increment: 1 };
      updateData.popularity_score = { increment: 1 };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
    }

    const updated = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
