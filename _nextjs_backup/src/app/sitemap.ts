import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';
import { CATEGORIES, SEO_PAGES } from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${BASE_URL}/feed/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // SEO landing pages
  const seoPages: MetadataRoute.Sitemap = SEO_PAGES.map(page => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic content pages (latest 500)
  const content = await prisma.content.findMany({
    select: { id: true, updated_at: true },
    orderBy: { updated_at: 'desc' },
    take: 500,
  });

  const contentPages: MetadataRoute.Sitemap = content.map(item => ({
    url: `${BASE_URL}/preview/${item.id}`,
    lastModified: item.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...seoPages, ...contentPages];
}
