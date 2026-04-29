import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import ContentGrid from '@/components/ui/ContentGrid';
import { ContentGridSkeleton } from '@/components/ui/Skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trending Content',
  description: 'Browse the most viral and trending content from Instagram, YouTube, Pinterest, and TikTok.',
};

async function FeedContent() {
  const content = await prisma.content.findMany({
    orderBy: [
      { popularity_score: 'desc' },
      { created_at: 'desc' },
    ],
    take: 20,
  });

  const serialized = content.map(item => ({
    id: item.id,
    platform: item.platform,
    caption: item.caption,
    thumbnail_url: item.thumbnail_url,
    media_type: item.media_type,
    view_count: item.view_count,
    download_count: item.download_count,
  }));

  return (
    <ContentGrid
      initialContent={serialized}
      fetchParams={{ sort: 'trending' }}
      infiniteScroll={true}
    />
  );
}

export default function FeedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Trending <span className="text-gradient">Now</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto">
          The most viral content across the internet, updated in real-time.
        </p>
      </div>

      {/* Content Grid */}
      <Suspense fallback={<ContentGridSkeleton count={8} />}>
        <FeedContent />
      </Suspense>
    </div>
  );
}
