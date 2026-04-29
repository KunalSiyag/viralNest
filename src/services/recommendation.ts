/**
 * Recommendation Engine v1
 *
 * Tag-based Jaccard similarity + recency + popularity weighting.
 * Simple but effective: finds content with overlapping tags
 * and scores by overlap ratio × popularity × time_decay.
 */

import { prisma } from '@/lib/db/prisma';

interface ScoredContent {
  id: string;
  score: number;
}

/**
 * Find similar content to a given item.
 *
 * Algorithm:
 * 1. Get the source item's tags and category
 * 2. Find candidate items (same category or platform, excluding self)
 * 3. Score each candidate by tag overlap (Jaccard similarity)
 * 4. Apply popularity + recency weighting
 * 5. Return top N
 */
export async function findSimilarContent(
  contentId: string,
  limit: number = 6
) {
  const source = await prisma.content.findUnique({
    where: { id: contentId },
  });

  if (!source) return [];

  let sourceTags: string[];
  try {
    sourceTags = JSON.parse(source.tags || '[]');
  } catch {
    sourceTags = [];
  }

  const sourceTagSet = new Set(sourceTags.map(t => t.toLowerCase()));

  // Get candidates: same category or same platform, exclude self
  const candidates = await prisma.content.findMany({
    where: {
      id: { not: contentId },
      OR: [
        { category: source.category },
        { platform: source.platform },
      ],
    },
    take: 50, // Get more candidates than needed, then score
    orderBy: [
      { popularity_score: 'desc' },
      { created_at: 'desc' },
    ],
  });

  if (candidates.length === 0) return [];

  // Score each candidate
  const scored: ScoredContent[] = candidates.map(candidate => {
    let candidateTags: string[];
    try {
      candidateTags = JSON.parse(candidate.tags || '[]');
    } catch {
      candidateTags = [];
    }

    const candidateTagSet = new Set(candidateTags.map(t => t.toLowerCase()));

    // Jaccard similarity: |intersection| / |union|
    let intersection = 0;
    for (const tag of sourceTagSet) {
      if (candidateTagSet.has(tag)) intersection++;
    }
    const union = new Set([...sourceTagSet, ...candidateTagSet]).size;
    const jaccard = union > 0 ? intersection / union : 0;

    // Category bonus: same category gets a boost
    const categoryBonus = candidate.category === source.category ? 0.3 : 0;

    // Popularity factor (log scale to avoid domination by very popular items)
    const popularityFactor = Math.log2(Math.max(candidate.popularity_score, 1) + 1) / 10;

    // Recency factor: items from the last 7 days get a boost
    const ageInDays = (Date.now() - candidate.created_at.getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0, 1 - ageInDays / 30); // Decay over 30 days

    // Combined score
    const score = (jaccard * 0.5) + (categoryBonus * 0.2) + (popularityFactor * 0.15) + (recencyFactor * 0.15);

    return { id: candidate.id, score };
  });

  // Sort by score descending, return top N
  scored.sort((a, b) => b.score - a.score);
  const topIds = scored.slice(0, limit).map(s => s.id);

  // Fetch full content for top results, preserving order
  const results = await prisma.content.findMany({
    where: { id: { in: topIds } },
  });

  // Preserve score ordering
  const resultMap = new Map(results.map(r => [r.id, r]));
  return topIds.map(id => resultMap.get(id)).filter(Boolean);
}
