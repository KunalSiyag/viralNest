import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import { CATEGORIES } from '@/lib/constants';
import ContentGrid from '@/components/ui/ContentGrid';
import { ContentGridSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find(c => c.slug === category.toLowerCase());
  const title = cat ? cat.name : `${category.charAt(0).toUpperCase() + category.slice(1)} Content`;
  const description = cat?.description || `Discover trending ${category} content from across the internet.`;

  return {
    title,
    description,
    openGraph: { title: `${title} | viralNest`, description },
  };
}

export function generateStaticParams() {
  return CATEGORIES.map(cat => ({ category: cat.slug }));
}

async function CategoryContent({ category }: { category: string }) {
  const content = await prisma.content.findMany({
    where: {
      OR: [
        { category: category.toLowerCase() },
        { tags: { contains: category.toLowerCase() } },
      ],
    },
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
      fetchParams={{ category: category.toLowerCase(), sort: 'trending' }}
      infiniteScroll={true}
    />
  );
}

export default async function CategoryFeedPage({ params }: PageProps) {
  const { category } = await params;
  const cat = CATEGORIES.find(c => c.slug === category.toLowerCase());
  const title = cat ? cat.name : `${category.charAt(0).toUpperCase() + category.slice(1)}`;
  const description = cat?.description || `Discover top content in ${category}.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto">
          {description}
        </p>
      </div>

      <Suspense fallback={<ContentGridSkeleton count={8} />}>
        <CategoryContent category={category} />
      </Suspense>

      {/* Empty state handled by ContentGrid, but add a CTA */}
      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          Extract More Content
        </Link>
      </div>
    </div>
  );
}