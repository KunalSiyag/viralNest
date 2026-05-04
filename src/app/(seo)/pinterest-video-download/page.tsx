import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import ContentGrid from '@/components/ui/ContentGrid';
import { ContentGridSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Pinterest Videos — Save Pins & Idea Pins',
  description: 'Download Pinterest videos and Idea Pins in full quality. Save creative pins, recipes, and DIY videos for offline viewing.',
  alternates: { canonical: '/pinterest-video-download' },
};

async function PinterestContent() {
  const content = await prisma.content.findMany({
    where: { platform: 'pinterest' },
    orderBy: [{ popularity_score: 'desc' }, { created_at: 'desc' }],
    take: 20,
  });

  return (
    <ContentGrid
      initialContent={content.map(item => ({
        id: item.id, platform: item.platform, caption: item.caption,
        thumbnail_url: item.thumbnail_url, media_type: item.media_type,
        view_count: item.view_count, download_count: item.download_count,
      }))}
      fetchParams={{ platform: 'pinterest', sort: 'trending' }}
    />
  );
}

export default function PinterestVideoDownloadPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Download <span className="text-gradient">Pinterest Videos</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Save Pinterest videos, Idea Pins, and creative content in full quality. Paste a link and download instantly.
        </p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-[var(--brand)] text-white font-semibold rounded-xl hover:bg-[var(--brand-dark)] transition-colors text-sm">
          Paste a Link
        </Link>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Pinterest Content</h2>
        <Suspense fallback={<ContentGridSkeleton count={8} />}>
          <PinterestContent />
        </Suspense>
      </section>

      <nav className="mt-16 pt-8 border-t border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Explore More</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/download-instagram-reels" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Instagram Reels</Link>
          <Link href="/fitness-reels-download" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Fitness Reels</Link>
          <Link href="/feed" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">All Trending</Link>
        </div>
      </nav>
    </div>
  );
}
