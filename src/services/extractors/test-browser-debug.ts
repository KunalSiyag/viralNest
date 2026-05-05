/**
 * Quick diagnostic — capture ALL network requests from an Instagram reel page.
 * Run with: npx tsx src/services/extractors/test-browser-debug.ts
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
  const allRequests: string[] = [];

  page.on('response', (response) => {
    const url = response.url();
    const ct = response.headers()['content-type'] || '';
    const cl = response.headers()['content-length'] || '?';
    const status = response.status();
    
    // Log all media and API requests
    if (
      ct.includes('video') || 
      ct.includes('image/') ||
      url.includes('/api/') ||
      url.includes('graphql') ||
      url.includes('scontent') ||
      url.includes('cdninstagram')
    ) {
      allRequests.push(`[${status}] ${ct.padEnd(25)} size=${cl.toString().padStart(8)} ${url.slice(0, 150)}`);
    }
  });

  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  
  console.log('\nPage title:', await page.title());
  
  // Wait for content to load
  await page.waitForTimeout(3000);
  
  // Check what's visible
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 500));
  console.log('\nVisible text (first 500 chars):');
  console.log(bodyText);
  
  // Try dismissing login
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch {}
  
  // Wait more
  await page.waitForTimeout(3000);
  
  // Check again after dismissing
  const bodyText2 = await page.evaluate(() => document.body?.innerText?.slice(0, 500));
  if (bodyText2 !== bodyText) {
    console.log('\nAfter dismiss:');
    console.log(bodyText2);
  }

  console.log('\n=== Network requests (media/API) ===');
  for (const req of allRequests) {
    console.log(req);
  }
  console.log(`Total captured: ${allRequests.length}`);

  // Also try screenshot
  await page.screenshot({ path: '/home/kunalsiyag/Projects/viralNest/ig-debug.png' });
  console.log('\nScreenshot saved to ig-debug.png');

  await browser.close();
}

main().catch(console.error);
