import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://pintdownload.app';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function generateWordPressWxrXml() {
  const pubDate = new Date().toUTCString();
  const nowGmt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json')).sort();

  const itemsXml = files.map((file, idx) => {
    const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8'));
    const postId = 100 + idx + 1;

    return `    <item>
      <title>${post.title}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[admin]]></dc:creator>
      <category domain="category" nicename="${post.category.toLowerCase().replace(/\s+/g, '-')}"><![CDATA[${post.category}]]></category>
      ${post.tags.map(t => `<category domain="post_tag" nicename="${t.toLowerCase().replace(/\s+/g, '-')}"><![CDATA[${t}]]></category>`).join('\n      ')}
      <guid isPermaLink="false">${SITE_URL}/?p=${postId}</guid>
      <description></description>
      <content:encoded><![CDATA[${post.contentHtml}]]></content:encoded>
      <excerpt:encoded><![CDATA[]]></excerpt:encoded>
      <wp:post_id>${postId}</wp:post_id>
      <wp:post_date><![CDATA[${nowGmt}]]></wp:post_date>
      <wp:post_date_gmt><![CDATA[${nowGmt}]]></wp:post_date_gmt>
      <wp:comment_status><![CDATA[open]]></wp:comment_status>
      <wp:ping_status><![CDATA[open]]></wp:ping_status>
      <wp:post_name><![CDATA[${post.slug}]]></wp:post_name>
      <wp:status><![CDATA[publish]]></wp:status>
      <wp:post_parent>0</wp:post_parent>
      <wp:menu_order>0</wp:menu_order>
      <wp:post_type><![CDATA[post]]></wp:post_type>
      <wp:post_password><![CDATA[]]></wp:post_password>
      <wp:is_sticky>0</wp:is_sticky>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
	xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:wp="http://wordpress.org/export/1.2/"
>
<channel>
	<title>PintDownload 20-Post WordPress Off-Page Campaign</title>
	<link>${SITE_URL}</link>
	<description>20 DMCA Safe Image-Embedded WordPress Satellite Posts</description>
	<pubDate>${pubDate}</pubDate>
	<language>en-US</language>
	<wp:wxr_version>1.2</wp:wxr_version>
${itemsXml}
</channel>
</rss>`;
}

const outputPath = path.join(process.cwd(), 'scripts', 'wordpress_import.xml');
const xmlContent = generateWordPressWxrXml();
fs.writeFileSync(outputPath, xmlContent, 'utf-8');
console.log(`✅ WordPress WXR XML Import file updated with ALL 20 posts at: ${outputPath}`);
