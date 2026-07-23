/**
 * Debug script — try the Instagram EMBED page instead of the main page.
 * The embed page sometimes loads media without requiring login.
 * Run with: npx tsx src/services/extractors/test-embed.ts
 */

import { chromium } from 'playwright-core';

async function main() {
  const shortcode = 'DIxUdkPy0ga';
  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
  const embedUrl2 = `https://www.instagram.com/reel/${shortcode}/embed/`;
  
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 540, height: 700 },
  });

  const page = await context.newPage();
  const mediaUrls: string[] = [];

  page.on('response', async (response) => {
    const url = response.url();
    const ct = response.headers()['content-type'] || '';
    const cl = parseInt(response.headers()['content-length'] || '0', 10);
    
    if (ct.includes('video/') || (ct.includes('image/') && cl > 50000)) {
      if (url.includes('cdninstagram') || url.includes('fbcdn') || url.includes('scontent')) {
        const type = ct.includes('video') ? '🎬 VIDEO' : '🖼️  IMAGE';
        console.log(`${type}: size=${cl} ${url.slice(0, 180)}`);
        mediaUrls.push(url);
      }
    }

    // Also intercept any GraphQL or API calls
    if (url.includes('graphql') || url.includes('/api/v1/')) {
      try {
        const body = await response.text();
        if (body.includes('video_url') || body.includes('display_url')) {
          console.log(`\n📡 API with media data: ${url}`);
          // Extract video_url
          const videoMatch = body.match(/"video_url":"([^"]+)"/);
          if (videoMatch) {
            const decoded = videoMatch[1].replace(/\\u0026/g, '&');
            console.log(`  🎬 video_url: ${decoded.slice(0, 180)}`);
            mediaUrls.push(decoded);
          }
          const displayMatch = body.match(/"display_url":"([^"]+)"/);
          if (displayMatch) {
            const decoded = displayMatch[1].replace(/\\u0026/g, '&');
            console.log(`  🖼️  display_url: ${decoded.slice(0, 180)}`);
            mediaUrls.push(decoded);
          }
        }
      } catch {}
    }
  });

  // Try embed/captioned first
  console.log('=== Trying embed/captioned ===');
  console.log('URL:', embedUrl);
  await page.goto(embedUrl, { waitUntil: 'networkidle', timeout: 20000 });
  
  const text = await page.evaluate(() => document.body?.innerText?.slice(0, 500));
  console.log('\nPage text:', text?.slice(0, 300));
  
  // Check for caption in the embed
  const caption = await page.evaluate(() => {
    const captionEl = document.querySelector('.Caption, .CaptionUsername, [class*="caption"]');
    return captionEl?.textContent || null;
  });
  console.log('Caption element:', caption);
  
  // Check for image/video elements
  const mediaSrcs = await page.evaluate(() => {
    const results: string[] = [];
    // Videos
    document.querySelectorAll('video source, video').forEach(el => {
      const src = (el as HTMLVideoElement).src || (el as HTMLSourceElement).src;
      if (src) results.push(`video: ${src}`);
    });
    // Images (large ones only)
    document.querySelectorAll('img').forEach(el => {
      if (el.naturalWidth > 200 || el.width > 200) {
        results.push(`img: ${el.src}`);
      }
    });
    return results;
  });
  console.log('\nDOM media elements:');
  for (const src of mediaSrcs) {
    console.log(`  ${src.slice(0, 180)}`);
  }

  // Now try the regular embed URL
  console.log('\n\n=== Trying regular embed ===');
  console.log('URL:', embedUrl2);
  await page.goto(embedUrl2, { waitUntil: 'networkidle', timeout: 20000 });
  
  const text2 = await page.evaluate(() => document.body?.innerText?.slice(0, 500));
  console.log('\nPage text:', text2?.slice(0, 300));
  
  const mediaSrcs2 = await page.evaluate(() => {
    const results: string[] = [];
    document.querySelectorAll('video source, video').forEach(el => {
      const src = (el as HTMLVideoElement).src || (el as HTMLSourceElement).src;
      if (src) results.push(`video: ${src}`);
    });
    document.querySelectorAll('img').forEach(el => {
      if (el.naturalWidth > 100 || el.width > 100) {
        results.push(`img[${el.naturalWidth}x${el.naturalHeight}]: ${el.src}`);
      }
    });
    return results;
  });
  console.log('\nDOM media elements:');
  for (const src of mediaSrcs2) {
    console.log(`  ${src.slice(0, 180)}`);
  }

  console.log('\n\n=== Summary ===');
  console.log(`Total media URLs captured: ${mediaUrls.length}`);
  for (const url of mediaUrls) {
    console.log(`  ${url.slice(0, 180)}`);
  }

  await browser.close();
}

main().catch(console.error);
