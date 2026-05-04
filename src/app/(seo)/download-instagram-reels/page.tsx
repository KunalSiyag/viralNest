import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import ContentGrid from '@/components/ui/ContentGrid';
import { ContentGridSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Instagram Reels — Free HD Reel Downloader',
  description: 'Download Instagram Reels in HD quality for free. Save viral Instagram videos, reels, and stories to your device instantly.',
  openGraph: {
    title: 'Download Instagram Reels — Free HD Reel Downloader | viralNest',
    description: 'Download Instagram Reels in HD quality for free. Save viral Instagram videos, reels, and stories to your device instantly.',
  },
  alternates: {
    canonical: '/download-instagram-reels',
  },
};

async function InstagramContent() {
  const content = await prisma.content.findMany({
    where: { platform: 'instagram' },
    orderBy: [{ popularity_score: 'desc' }, { created_at: 'desc' }],
    take: 20,
  });

  return (
    <ContentGrid
      initialContent={content.map(item => ({
        id: item.id,
        platform: item.platform,
        caption: item.caption,
        thumbnail_url: item.thumbnail_url,
        media_type: item.media_type,
        view_count: item.view_count,
        download_count: item.download_count,
      }))}
      fetchParams={{ platform: 'instagram', sort: 'trending' }}
    />
  );
}

export default function DownloadInstagramReelsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Download <span className="text-gradient">Instagram Reels</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Save Instagram Reels, videos, and stories in HD quality. Just paste the link and download instantly — no login required.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/" className="px-5 py-2.5 bg-[var(--brand)] text-white font-semibold rounded-xl hover:bg-[var(--brand-dark)] transition-colors text-sm">
            Paste a Link
          </Link>
          <Link href="/feed" className="px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold rounded-xl hover:bg-[var(--bg-tertiary)] border border-[var(--border)] transition-colors text-sm">
            Browse Trending
          </Link>
        </div>
      </div>

      {/* SEO Content Section */}
      <section className="max-w-3xl mx-auto mb-12 space-y-6">
        <h2 className="text-xl font-bold">How to Download Instagram Reels</h2>
        <ol className="space-y-3 text-[var(--text-secondary)]">
          <li className="flex gap-3"><span className="font-bold text-[var(--brand)]">1.</span> Open Instagram and find the Reel you want to save</li>
          <li className="flex gap-3"><span className="font-bold text-[var(--brand)]">2.</span> Tap the share button and copy the link</li>
          <li className="flex gap-3"><span className="font-bold text-[var(--brand)]">3.</span> Paste the link in viralNest&apos;s search bar above</li>
          <li className="flex gap-3"><span className="font-bold text-[var(--brand)]">4.</span> Click Download — that&apos;s it!</li>
        </ol>
      </section>

      {/* Related Content */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Instagram Reels</h2>
        <Suspense fallback={<ContentGridSkeleton count={8} />}>
          <InstagramContent />
        </Suspense>
      </section>

      {/* Internal Links */}
      <nav className="mt-16 pt-8 border-t border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Explore More</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/pinterest-video-download" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Pinterest Videos</Link>
          <Link href="/fitness-reels-download" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Fitness Reels</Link>
          <Link href="/startup-reels-ideas" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Startup Reels</Link>
          <Link href="/feed" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">All Trending</Link>
        </div>
      </nav>
    </div>
  );
}
