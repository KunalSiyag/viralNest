import type { APIRoute } from 'astro';
import { getIndexablePosts, BLOG_AUTHOR, BLOG_PUBLISHER } from '../data/blog';
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
  // RSS only includes indexable posts — matches sitemap + noindex policy
  const posts = getIndexablePosts();
  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${post.slug}`);
      const image = post.coverImage.startsWith('http')
        ? post.coverImage
        : absoluteUrl(post.coverImage);
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.datePublished + 'T12:00:00Z').toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <dc:creator>${escapeXml(BLOG_AUTHOR.name)}</dc:creator>
      <author>${escapeXml(BLOG_AUTHOR.name)}</author>
      <enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />
    </item>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>PintDownload Blog — Pinterest Download Guides</title>
    <link>https://pintdownload.app/blog</link>
    <description>Tips, guides, and troubleshooting for Pinterest pin, video, board ZIP, and profile ZIP downloads. By the PintDownload Team.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://pintdownload.app/rss.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>${escapeXml(BLOG_AUTHOR.name)}</managingEditor>
    <webMaster>${escapeXml(BLOG_PUBLISHER.name)}</webMaster>
    ${items}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex, follow',
    },
  });
};
