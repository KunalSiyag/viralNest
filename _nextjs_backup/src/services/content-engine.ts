/**
 * Category Taxonomy Service
 *
 * Maps extracted tags to content categories using keyword matching.
 * This is the "Content Engine" moat — normalizes and categorizes
 * all incoming content automatically.
 */

import { CATEGORIES, type CategoryDef } from '@/lib/constants';

/**
 * Normalize a list of raw tags:
 * - Lowercase
 * - Strip special characters
 * - Remove duplicates
 * - Remove very short tags (< 2 chars)
 */
export function normalizeTags(rawTags: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of rawTags) {
    const clean = tag
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

    if (clean.length >= 2 && !seen.has(clean)) {
      seen.add(clean);
      normalized.push(clean);
    }
  }

  return normalized;
}

/**
 * Extract tags from text content (caption, title, description).
 * Finds hashtags and also extracts significant words.
 */
export function extractTagsFromText(text: string): string[] {
  if (!text) return [];

  const tags: string[] = [];

  // Extract hashtags
  const hashtagMatches = text.match(/#[a-zA-Z0-9_]+/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(h => h.replace('#', '')));
  }

  // Extract significant words (3+ chars, not common stop words)
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'has', 'have', 'this', 'that', 'with',
    'they', 'been', 'from', 'will', 'would', 'could', 'should', 'what', 'when',
    'where', 'which', 'their', 'there', 'these', 'those', 'about', 'into',
    'just', 'like', 'more', 'some', 'your', 'than', 'them', 'then', 'each',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !stopWords.has(w));

  tags.push(...words);

  return normalizeTags(tags);
}

/**
 * Determine the best category for content based on its tags.
 * Uses a scoring system: each matching keyword adds to the category score.
 * Returns the highest-scoring category, or 'uncategorized' if no match.
 */
export function categorizeContent(tags: string[]): CategoryDef {
  if (!tags.length) {
    return CATEGORIES[0]; // Default to first category
  }

  const normalizedTags = new Set(tags.map(t => t.toLowerCase()));
  let bestCategory: CategoryDef | null = null;
  let bestScore = 0;

  for (const category of CATEGORIES) {
    let score = 0;
    for (const keyword of category.keywords) {
      if (normalizedTags.has(keyword)) {
        score++;
      }
      // Also check partial matches for compound tags
      for (const tag of normalizedTags) {
        if (tag.includes(keyword) || keyword.includes(tag)) {
          score += 0.5;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Require at least 1 full keyword match
  if (bestScore >= 1 && bestCategory) {
    return bestCategory;
  }

  // Return a default "uncategorized" definition
  return {
    slug: 'uncategorized',
    name: 'Uncategorized',
    description: 'Content that hasn\'t been categorized yet',
    keywords: [],
    icon: 'folder',
    gradient: 'from-gray-500 to-gray-600',
  };
}
