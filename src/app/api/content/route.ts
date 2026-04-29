import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ITEMS_PER_PAGE } from "@/lib/constants";

/**
 * GET /api/content
 *
 * Paginated content listing. Powers the feed pages and infinite scroll.
 *
 * Query params:
 *   - category: filter by category slug
 *   - platform: filter by platform
 *   - page: page number (1-indexed)
 *   - limit: items per page (default 20, max 50)
 *   - sort: 'trending' | 'newest' | 'popular' (default 'newest')
 *   - search: search in caption/tags
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const platform = searchParams.get('platform');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE), 10)));
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (platform) {
      where.platform = platform;
    }

    if (search) {
      where.OR = [
        { caption: { contains: search } },
        { tags: { contains: search.toLowerCase() } },
      ];
    }

    // Build orderBy
    type OrderByField = 'created_at' | 'popularity_score' | 'download_count';
    type OrderByDirection = 'asc' | 'desc';
    let orderBy: Record<OrderByField, OrderByDirection>[];

    switch (sort) {
      case 'trending':
        orderBy = [
          { popularity_score: 'desc' },
          { created_at: 'desc' },
        ];
        break;
      case 'popular':
        orderBy = [
          { download_count: 'desc' },
          { popularity_score: 'desc' },
        ];
        break;
      case 'newest':
      default:
        orderBy = [{ created_at: 'desc' }];
        break;
    }

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      data: content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + content.length < total,
      },
    });
  } catch (error) {
    console.error('Content listing error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
