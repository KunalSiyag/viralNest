import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// Environment Variables
const WP_SITE_URL = process.env.WP_SITE_URL; // e.g. https://pinmediahub.wordpress.com or https://yourblog.com
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID;
const BLOGGER_API_TOKEN = process.env.BLOGGER_API_TOKEN;

function cleanErrorMessage(rawText) {
  if (!rawText) return 'Empty response';
  if (rawText.trim().startsWith('<')) {
    const titleMatch = rawText.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) return `HTML Error: ${titleMatch[1].trim()}`;
    const stripped = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped.substring(0, 150) + '...';
  }
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.error && typeof parsed.error === 'object') {
      return parsed.error.message || JSON.stringify(parsed.error).substring(0, 200);
    }
    return parsed.message || parsed.error_description || parsed.error || JSON.stringify(parsed).substring(0, 200);
  } catch {
    return rawText.substring(0, 200);
  }
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function publishToWordPressXMLRPC(cleanDomain, username, password, post) {
  const url = `https://${cleanDomain}/xmlrpc.php`;
  console.log(`📡 Publishing post to WordPress XML-RPC endpoint (${url})...`);

  const tagsXml = post.tags && post.tags.length > 0
    ? `<member><name>terms_names</name><value><struct><member><name>post_tag</name><value><array><data>${post.tags.map(t => `<value><string>${escapeXml(t)}</string></value>`).join('')}</data></array></value></member></struct></value></member>`
    : '';

  const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.newPost</methodName>
  <params>
    <param><value><int>0</int></value></param>
    <param><value><string>${escapeXml(username)}</string></value></param>
    <param><value><string>${escapeXml(password)}</string></value></param>
    <param>
      <value>
        <struct>
          <member><name>post_type</name><value><string>post</string></value></member>
          <member><name>post_status</name><value><string>publish</string></value></member>
          <member><name>post_title</name><value><string>${escapeXml(post.title)}</string></value></member>
          <member><name>post_content</name><value><string>${escapeXml(post.contentHtml)}</string></value></member>
          ${tagsXml}
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: xmlPayload,
    });

    const text = await res.text();
    if (res.ok && text.includes('<methodResponse>') && !text.includes('<fault>')) {
      const match = text.match(/<string>(\d+)<\/string>/) || text.match(/<int>(\d+)<\/int>/);
      const postId = match ? match[1] : 'created';
      console.log(`✅ Successfully published to WordPress via XML-RPC! Post ID: ${postId}`);
      return true;
    } else {
      const faultMatch = text.match(/<faultString><string>(.*?)<\/string><\/faultString>/s);
      const errReason = faultMatch ? faultMatch[1].trim() : text.substring(0, 150);
      console.error(`⚠️ XML-RPC endpoint (${url}) returned Error: ${errReason}`);
      return false;
    }
  } catch (err) {
    console.error(`⚠️ XML-RPC request error for ${url}:`, err.message);
    return false;
  }
}

async function publishToWordPress(post) {
  if (!WP_SITE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
    console.log('⚠️ Skipping WordPress publishing: WP credentials missing from environment (WP_SITE_URL, WP_USERNAME, or WP_APP_PASSWORD).');
    return false;
  }

  // Extract clean hostname ONLY (e.g. pinmediahub.wordpress.com) even if user pasted full path
  const cleanDomain = WP_SITE_URL.replace(/^https?:\/\//, '').split('/')[0].trim();
  const rawPass = WP_APP_PASSWORD.trim();
  const strippedPass = rawPass.replace(/\s+/g, '');

  // 1. First try XML-RPC (most reliable on free WordPress.com subdomains)
  console.log(`📡 Trying WordPress XML-RPC publishing for ${cleanDomain}...`);
  if (await publishToWordPressXMLRPC(cleanDomain, WP_USERNAME.trim(), rawPass, post)) return true;
  if (rawPass !== strippedPass) {
    if (await publishToWordPressXMLRPC(cleanDomain, WP_USERNAME.trim(), strippedPass, post)) return true;
  }

  // 2. Fallback to WordPress REST APIs
  const authHeaders = [
    { name: 'Basic (raw password)', value: 'Basic ' + Buffer.from(`${WP_USERNAME.trim()}:${rawPass}`).toString('base64') },
    { name: 'Basic (stripped spaces)', value: 'Basic ' + Buffer.from(`${WP_USERNAME.trim()}:${strippedPass}`).toString('base64') },
    { name: 'Bearer Token', value: `Bearer ${strippedPass}` }
  ];

  const endpoints = [];
  if (cleanDomain.endsWith('wordpress.com')) {
    endpoints.push(`https://public-api.wordpress.com/wp/v2/sites/${cleanDomain}/posts`);
    endpoints.push(`https://public-api.wordpress.com/rest/v1.1/sites/${cleanDomain}/posts/new`);
  }
  endpoints.push(`https://${cleanDomain}/wp-json/wp/v2/posts`);

  for (const url of endpoints) {
    const isV1 = url.includes('/rest/v1.1/');
    const bodyPayload = isV1 ? {
      title: post.title,
      content: post.contentHtml,
      status: 'publish',
      tags: post.tags ? post.tags.join(',') : '',
    } : {
      title: post.title,
      content: post.contentHtml,
      status: 'publish',
    };

    for (const auth of authHeaders) {
      try {
        console.log(`📡 Publishing post to WordPress endpoint (${url}) using ${auth.name}...`);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth.value,
          },
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok) {
          const data = await res.json();
          console.log(`✅ Successfully published to WordPress! Post ID: ${data.id || data.ID}, Link: ${data.link || data.URL}`);
          return true;
        } else {
          const errText = await res.text();
          const cleanErr = cleanErrorMessage(errText);
          console.error(`⚠️ Endpoint (${url}) [${auth.name}] returned Status ${res.status}: ${cleanErr}`);
        }
      } catch (err) {
        console.error(`⚠️ Request error for ${url} [${auth.name}]:`, err.message);
      }
    }
  }

  console.error(`❌ Failed to publish to WordPress across XML-RPC and REST endpoints.`);
  return false;
}

const BLOGGER_CLIENT_ID = process.env.BLOGGER_CLIENT_ID;
const BLOGGER_CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET;
const BLOGGER_REFRESH_TOKEN = process.env.BLOGGER_REFRESH_TOKEN;

async function getBloggerAccessToken() {
  if (BLOGGER_CLIENT_ID && BLOGGER_CLIENT_SECRET && BLOGGER_REFRESH_TOKEN) {
    try {
      console.log('🔄 Refreshing Google Blogger OAuth2 access token...');
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: BLOGGER_CLIENT_ID.trim(),
          client_secret: BLOGGER_CLIENT_SECRET.trim(),
          refresh_token: BLOGGER_REFRESH_TOKEN.trim(),
          grant_type: 'refresh_token',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Successfully refreshed Blogger access token!');
        return data.access_token;
      } else {
        const errText = await res.text();
        console.error('⚠️ Blogger token refresh failed:', cleanErrorMessage(errText));
      }
    } catch (err) {
      console.error('⚠️ Blogger token refresh error:', err.message);
    }
  }
  return BLOGGER_API_TOKEN ? BLOGGER_API_TOKEN.trim() : null;
}

async function publishToBlogger(post) {
  const activeToken = await getBloggerAccessToken();

  if (!BLOGGER_BLOG_ID || !activeToken) {
    console.log('⚠️ Skipping Blogger API publishing: BLOGGER_BLOG_ID or valid token missing from environment.');
    return false;
  }

  const endpoint = `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts/`;

  try {
    console.log(`📡 Publishing post to Blogger API (Blog ID: ${BLOGGER_BLOG_ID})...`);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`,
      },
      body: JSON.stringify({
        kind: 'blogger#post',
        title: post.title,
        content: post.contentHtml,
        labels: post.tags,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Successfully published to Blogger! Post ID: ${data.id}, URL: ${data.url}`);
      return true;
    } else {
      const errText = await res.text();
      const cleanErr = cleanErrorMessage(errText);
      console.error(`❌ Blogger publish failed (Status ${res.status}): ${cleanErr}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Blogger publish error:`, err.message);
    return false;
  }
}

async function runDripPublisher() {
  console.log('🚀 Running GitHub Drip Publisher...');

  if (!fs.existsSync(POSTS_DIR)) {
    console.log(`❌ Posts directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json')).sort();
  let targetPostFile = null;
  let targetPost = null;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!content.published) {
      targetPostFile = filePath;
      targetPost = content;
      break;
    }
  }

  if (!targetPost) {
    console.log('🎉 No unpublished posts remaining in queue. All scheduled posts are published!');
    return;
  }

  console.log(`📌 Found queued post to publish: "${targetPost.title}" (${path.basename(targetPostFile)})`);

  const wpConfigured = Boolean(WP_SITE_URL && WP_USERNAME && WP_APP_PASSWORD);
  const bloggerConfigured = Boolean(BLOGGER_BLOG_ID && BLOGGER_API_TOKEN);

  const wpSuccess = await publishToWordPress(targetPost);
  const bloggerSuccess = await publishToBlogger(targetPost);

  if (wpSuccess || bloggerSuccess) {
    targetPost.published = true;
    targetPost.publishedAt = new Date().toISOString();
    fs.writeFileSync(targetPostFile, JSON.stringify(targetPost, null, 2), 'utf-8');
    console.log(`💾 Updated ${path.basename(targetPostFile)} status to published: true`);
  } else if (wpConfigured || bloggerConfigured) {
    console.error('❌ Failed to publish to configured platforms. Check API credentials in GitHub secrets.');
    process.exit(1);
  } else {
    console.log('ℹ️ No platforms configured in GitHub repository secrets.');
  }
}

runDripPublisher();
