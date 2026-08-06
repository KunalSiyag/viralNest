import type { APIRoute } from 'astro';
import { getIndexablePosts } from '../data/blog';
import { SITEMAP_ROUTES } from '../lib/seo';
import { absoluteUrl } from '../lib/urls';

export const prerender = true;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: number;
};

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const entries: UrlEntry[] = [];

  for (const route of SITEMAP_ROUTES) {
    entries.push({
      loc: absoluteUrl(route.path),
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  // Only indexable blog posts (noindex posts are excluded from the sitemap)
  for (const post of getIndexablePosts()) {
    entries.push({
      loc: absoluteUrl(`/blog/${post.slug}`),
      lastmod: post.dateModified || post.datePublished,
      changefreq: 'monthly',
      priority: 0.72,
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => {
    const lastmod = e.lastmod ? `\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : '';
    return `  <url>
    <loc>${escapeXml(e.loc)}</loc>${lastmod}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
