import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getIndexablePosts } from '../data/blog';
import { SITEMAP_ROUTES, localizedSitemapEntries, sitemapAlternatesFor, type SitemapEntry } from '../lib/seo';
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

export const GET: APIRoute = async () => {
  const entries: SitemapEntry[] = [];

  for (const route of SITEMAP_ROUTES) {
    entries.push({
      loc: absoluteUrl(route.path),
      // Do not stamp "today" on every build — Google treats a sitemap
      // whose lastmod always moves as untrustworthy and may ignore it.
      changefreq: route.changefreq,
      priority: route.priority,
      // Same hreflang cluster as the page's HTML <link>s (src/i18n/routes.ts).
      alternates: sitemapAlternatesFor(route.path),
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

  // Every live localized URL once; lastmod is the content's dateModified.
  const lastmods = Object.fromEntries(
    (await getCollection('i18nPages')).map((e) => [`${e.data.locale}/${e.data.pageId}`, e.data.dateModified]),
  );
  entries.push(...localizedSitemapEntries(lastmods));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map((e) => {
    const lastmod = e.lastmod ? `\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>` : '';
    const links = (e.alternates ?? [])
      .map((a) => `\n    <xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}"/>`)
      .join('');
    return `  <url>
    <loc>${escapeXml(e.loc)}</loc>${lastmod}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>${links}
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
