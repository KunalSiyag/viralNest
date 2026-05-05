/**
 * Debug script — intercept GraphQL responses from Instagram page load.
 * Run with: npx tsx src/services/extractors/test-graphql-intercept.ts
 */

import { chromium } from 'playwright-core';

async function main() {
  const url = 'https://www.instagram.com/reel/DIxUdkPy0ga/';

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  // Intercept ALL responses and capture GraphQL ones
  page.on('response', async (response) => {
    const resUrl = response.url();
    
    if (resUrl.includes('graphql') || resUrl.includes('/api/')) {
      try {
        const body = await response.text();
        console.log(`\n=== GraphQL/API Response [${response.status()}] ===`);
        console.log(`URL: ${resUrl}`);
        console.log(`Size: ${body.length}`);
        
        // Try to parse as JSON and look for media data
        try {
          const json = JSON.parse(body);
          
          // Recursively find video/image URLs in the JSON
          const found = findMediaInJson(json);
          if (found.length > 0) {
            console.log('🎬 FOUND MEDIA URLS:');
            for (const f of found) {
              console.log(`  ${f.type}: ${f.url.slice(0, 150)}`);
            }
          }
          
          // Also look for caption
          const captions = findCaptionsInJson(json);
          if (captions.length > 0) {
            console.log('📝 FOUND CAPTIONS:');
            for (const c of captions) {
              console.log(`  ${c.slice(0, 200)}`);
            }
          }
          
          // Print structure keys at top level
          if (typeof json === 'object' && json !== null) {
            console.log('Top-level keys:', Object.keys(json).join(', '));
          }
        } catch {
          console.log('(not JSON)');
          console.log(body.slice(0, 300));
        }
      } catch {
        console.log(`Could not read response body for ${resUrl}`);
      }
    }
  });

  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
  
  await page.waitForTimeout(3000);
  
  await browser.close();
}

function findMediaInJson(obj: unknown, depth = 0): { type: string; url: string }[] {
  if (depth > 15 || !obj) return [];
  const results: { type: string; url: string }[] = [];
  
  if (typeof obj === 'string') {
    if (obj.includes('cdninstagram.com') || obj.includes('fbcdn.net') || obj.includes('scontent')) {
      if (obj.includes('.mp4') || obj.includes('video')) {
        results.push({ type: 'video', url: obj });
      } else if (obj.match(/\.(jpg|jpeg|png|webp)/i)) {
        results.push({ type: 'image', url: obj });
      }
    }
    return results;
  }
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      results.push(...findMediaInJson(item, depth + 1));
    }
    return results;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      // Special keys that indicate media
      if (['video_url', 'display_url', 'thumbnail_src', 'image_versions2', 'video_versions'].includes(key)) {
        if (typeof value === 'string') {
          results.push({ type: key.includes('video') ? 'video' : 'image', url: value });
        }
      }
      results.push(...findMediaInJson(value, depth + 1));
    }
  }
  
  return results;
}

function findCaptionsInJson(obj: unknown, depth = 0): string[] {
  if (depth > 15 || !obj) return [];
  const results: string[] = [];
  
  if (typeof obj !== 'object' || obj === null) return [];
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      results.push(...findCaptionsInJson(item, depth + 1));
    }
    return results;
  }
  
  for (const [key, value] of Object.entries(obj)) {
    if (['text', 'caption', 'title'].includes(key) && typeof value === 'string' && value.length > 10) {
      results.push(value);
    }
    if (typeof value === 'object') {
      results.push(...findCaptionsInJson(value, depth + 1));
    }
  }
  
  return results;
}

main().catch(console.error);
