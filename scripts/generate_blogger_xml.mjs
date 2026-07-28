import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://pintdownload.app';
const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function generateBloggerAtomXml() {
  const blogId = '9000000000000000000';
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json')).sort();

  const entriesXml = files.map((file, idx) => {
    const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8'));
    const postId = `10000000000000000${String(idx + 1).padStart(2, '0')}`;

    return `  <entry>
    <id>tag:blogger.com,1999:blog-${blogId}.post-${postId}</id>
    <published>${now}</published>
    <updated>${now}</updated>
    <category scheme='http://schemas.google.com/g/2005#kind' term='http://schemas.google.com/blogger/2008/kind#post'/>
    <category scheme='http://www.blogger.com/atom/ns#' term='${post.category}'/>
${post.tags.map(t => `    <category scheme='http://www.blogger.com/atom/ns#' term='${t}'/>`).join('\n')}
    <title type='text'>${escapeXml(post.title)}</title>
    <content type='html'>${escapeXml(post.contentHtml)}</content>
    <link rel='edit' type='application/atom+xml' href='http://www.blogger.com/feeds/${blogId}/posts/default/${postId}'/>
    <link rel='self' type='application/atom+xml' href='http://www.blogger.com/feeds/${blogId}/posts/default/${postId}'/>
    <author>
      <name>DazzBuilds Admin</name>
      <email>noreply@blogger.com</email>
    </author>
  </entry>`;
  }).join('\n');

  return `<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:openSearch='http://a9.com/-/spec/opensearch/1.1/' xmlns:gd='http://schemas.google.com/g/2005' xmlns:thr='http://purl.org/syndication/thread/1.0'>
  <id>tag:blogger.com,1999:blog-${blogId}.export</id>
  <updated>${now}</updated>
  <title type='text'>PintDownload 20-Post Blogger Off-Page Campaign</title>
  <subtitle type='text'>20 DMCA Safe Image-Embedded Blogspot Articles</subtitle>
  <generator uri='http://www.blogger.com' version='7.00'>Blogger</generator>
${entriesXml}
</feed>`;
}

const outputPath = path.join(process.cwd(), 'scripts', 'blogger_import.xml');
const xmlContent = generateBloggerAtomXml();
fs.writeFileSync(outputPath, xmlContent, 'utf-8');
console.log(`✅ Blogger XML Import file updated with ALL 20 posts at: ${outputPath}`);
