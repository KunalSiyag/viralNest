import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// Environment Variables
const WP_SITE_URL = process.env.WP_SITE_URL; // e.g. https://pinmediahub.wordpress.com or https://yourblog.com
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID;
const BLOGGER_API_TOKEN = process.env.BLOGGER_API_TOKEN;

async function publishToWordPress(post) {
  if (!WP_SITE_URL || !WP_USERNAME || !WP_APP_PASSWORD) {
    console.log('⚠️ Skipping WordPress publishing: WP credentials missing from environment (WP_SITE_URL, WP_USERNAME, or WP_APP_PASSWORD).');
    return false;
  }

  // Extract clean hostname ONLY (e.g. pinmediahub.wordpress.com) even if user pasted full path
  const cleanDomain = WP_SITE_URL.replace(/^https?:\/\//, '').split('/')[0].trim();
  const authHeader = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');

  // Candidate endpoints for WordPress.com vs Self-Hosted WordPress
  const endpoints = [];
  if (cleanDomain.endsWith('wordpress.com')) {
    endpoints.push(`https://public-api.wordpress.com/wp/v2/sites/${cleanDomain}/posts`);
    endpoints.push(`https://public-api.wordpress.com/rest/v1.1/sites/${cleanDomain}/posts/new`);
  }
  endpoints.push(`https://${cleanDomain}/wp-json/wp/v2/posts`);

  for (const url of endpoints) {
    try {
      console.log(`📡 Publishing post to WordPress endpoint (${url})...`);
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
        tags: post.tags,
      };

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
        console.error(`⚠️ Endpoint (${url}) returned Status ${res.status}: ${errText.substring(0, 200)}`);
      }
    } catch (err) {
      console.error(`⚠️ Request error for ${url}:`, err.message);
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
      console.error(`❌ Blogger publish failed (Status ${res.status}): ${errText}`);
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
    return;
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

  const wpSuccess = await publishToWordPress(targetPost);
  const bloggerSuccess = await publishToBlogger(targetPost);

  if (wpSuccess || bloggerSuccess) {
    targetPost.published = true;
    targetPost.publishedAt = new Date().toISOString();
    fs.writeFileSync(targetPostFile, JSON.stringify(targetPost, null, 2), 'utf-8');
    console.log(`💾 Updated ${path.basename(targetPostFile)} status to published: true`);
  } else {
    console.log('ℹ️ No platforms updated. Check credentials in GitHub repository secrets.');
  }
}

runDripPublisher();
