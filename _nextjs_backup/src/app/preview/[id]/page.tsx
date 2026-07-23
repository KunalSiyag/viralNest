import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { findSimilarContent } from '@/services/recommendation';
import PreviewClient from './PreviewClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await prisma.content.findUnique({ where: { id } });

  if (!content) return { title: 'Content Not Found' };

  return {
    title: content.caption || 'Content Preview',
    description: `Preview and download ${content.platform} content. ${content.caption || ''}`.slice(0, 160),
    openGraph: {
      title: content.caption || 'viralNest Content',
      description: `Download this ${content.platform} content on viralNest`,
      images: content.thumbnail_url ? [{ url: content.thumbnail_url }] : [],
    },
  };
}

export default async function PreviewPage({ params }: PageProps) {
  const { id } = await params;

  const content = await prisma.content.findUnique({ where: { id } });
  if (!content) notFound();

  // Increment view
  await prisma.content.update({
    where: { id },
    data: {
      view_count: { increment: 1 },
      popularity_score: { increment: 1 },
    },
  });

  // Get recommendations
  const similar = await findSimilarContent(id, 6);

  // Parse tags
  let tags: string[] = [];
  try { tags = JSON.parse(content.tags || '[]'); } catch { /* ignore */ }

  // Serialize for client component
  const contentData = {
    id: content.id,
    platform: content.platform,
    source_url: content.source_url,
    media_url: content.media_url,
    thumbnail_url: content.thumbnail_url,
    caption: content.caption,
    category: content.category,
    media_type: content.media_type,
    view_count: content.view_count + 1,
    download_count: content.download_count,
    tags,
  };

  const similarData = similar
    .filter((s): s is NonNullable<typeof s> => s != null)
    .map(s => ({
      id: s.id,
      platform: s.platform,
      caption: s.caption,
      thumbnail_url: s.thumbnail_url,
      media_type: s.media_type,
      view_count: s.view_count,
      download_count: s.download_count,
    }));

  return <PreviewClient content={contentData} similar={similarData} />;
}
