import { chromium } from 'playwright-core';

async function main() {
  const url = 'https://www.instagram.com/reel/DIxUdkPy0ga/embed/';

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', async (response) => {
    const resUrl = response.url();
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('video/')) {
      console.log('🎬 FOUND VIDEO URL:', resUrl);
    }
    
    if (resUrl.includes('graphql') || resUrl.includes('/api/')) {
      try {
        const body = await response.text();
        if (body.includes('.mp4')) {
          console.log('FOUND API response with mp4');
        }
      } catch {}
    }
  });

  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(3000);
  
  // Also check if we can evaluate the page for video tags
  const videos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('video')).map(v => v.src);
  });
  console.log('Videos in DOM:', videos);

  await browser.close();
}

main().catch(console.error);
