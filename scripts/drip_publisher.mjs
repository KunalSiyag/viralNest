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
    return parsed.message || parsed.error_description || parsed.error || JSON.stringify(parsed).substring(0, 200);
  } catch {
    return rawText.substring(0, 200);
  }
}

async function publishToWordPress(post) {
  if (!WP_SITE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
    console.log('⚠️ Skipping WordPress publishing: WP credentials missing from environment (WP_SITE_URL, WP_USERNAME, or WP_APP_PASSWORD).');
    return false;
  }

  // Extract clean hostname ONLY (e.g. pinmediahub.wordpress.com) even if user pasted full path
  const cleanDomain = WP_SITE_URL.replace(/^https?:\/\//, '').split('/')[0].trim();
  const basicAuth = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
  const bearerAuth = `Bearer ${WP_APP_PASSWORD}`;

  // Candidate endpoints for WordPress.com vs Self-Hosted WordPress
  const endpoints = [];
  if (cleanDomain.endsWith('wordpress.com')) {
    endpoints.push(`https://public-api.wordpress.com/wp/v2/sites/${cleanDomain}/posts`);
    endpoints.push(`https://public-api.wordpress.com/rest/v1.1/sites/${cleanDomain}/posts/new`);
  }
  endpoints.push(`https://${cleanDomain}/wp-json/wp/v2/posts`);

  for (const url of endpoints) {
    const isV1 = url.includes('/rest/v1.1/');
    // Standard /wp/v2/posts expects integer IDs for tags; omit string tag names to prevent 400 rest_invalid_param
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

    // Try Basic Auth first, fallback to Bearer Auth if unauthorized
    const authHeaders = [basicAuth, bearerAuth];
    for (const authHeader of authHeaders) {
      try {
        console.log(`📡 Publishing post to WordPress endpoint (${url})...`);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
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
          console.error(`⚠️ Endpoint (${url}) returned Status ${res.status}: ${cleanErr}`);
          // If authorization failed, try next auth scheme (Bearer) for same endpoint
          if ((res.status === 401 || res.status === 403) && authHeader === basicAuth) {
            console.log(`🔄 Retrying endpoint with Bearer auth token...`);
            continue;
          }
        }
      } catch (err) {
        console.error(`⚠️ Request error for ${url}:`, err.message);
      }
      break; // Move to next endpoint if this auth attempt was not 401/403
    }
  }

  console.error(`❌ Failed to publish to WordPress across all candidate endpoints.`);
  return false;
}

async function publishToBlogger(post) {
  if (!BLOGGER_BLOG_ID || !BLOGGER_API_TOKEN) {
    console.log('⚠️ Skipping Blogger API publishing: BLOGGER_BLOG_ID or BLOGGER_API_TOKEN missing from environment.');
    return false;
  }

  const endpoint = `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts/`;

  try {
    console.log(`📡 Publishing post to Blogger API (Blog ID: ${BLOGGER_BLOG_ID})...`);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLOGGER_API_TOKEN}`,
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
