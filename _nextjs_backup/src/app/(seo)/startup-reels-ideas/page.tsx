import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import ContentGrid from '@/components/ui/ContentGrid';
import { ContentGridSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Startup Reels — Founder Tips & Business Insights',
  description: 'Discover trending startup and business reels. Get founder advice, SaaS tips, and entrepreneurial motivation from top creators.',
  alternates: { canonical: '/startup-reels-ideas' },
};

async function StartupContent() {
  const content = await prisma.content.findMany({
    where: { OR: [{ category: 'startup' }, { tags: { contains: 'startup' } }] },
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
      fetchParams={{ category: 'startup', sort: 'trending' }}
    />
  );
}

export default function StartupReelsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span className="text-gradient">Startup Reels</span> & Founder Tips
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Curated startup content, founder advice, SaaS insights, and entrepreneurial motivation from the best creators.
        </p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-[var(--brand)] text-white font-semibold rounded-xl hover:bg-[var(--brand-dark)] transition-colors text-sm">
          Extract Startup Content
        </Link>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Startup Content</h2>
        <Suspense fallback={<ContentGridSkeleton count={8} />}>
          <StartupContent />
        </Suspense>
      </section>

      <nav className="mt-16 pt-8 border-t border-[var(--border)]">
        <h3 className="text-lg font-semibold mb-4">Explore More</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/download-instagram-reels" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Instagram Reels</Link>
          <Link href="/fitness-reels-download" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Fitness Reels</Link>
          <Link href="/feed/technology" className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] border border-[var(--border)] transition-colors">Technology</Link>
        </div>
      </nav>
    </div>
  );
}
