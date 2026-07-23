import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', res => {
    const url = res.url();
    const type = res.headers()['content-type'] || '';
    if (type.includes('video/') || url.includes('.mp4')) {
      console.log('VIDEO RESPONSE:', url);
    }
  });

  console.log('Navigating...');
  await page.goto('https://www.instagram.com/p/DIxUdkPy0ga/embed/', { waitUntil: 'networkidle', timeout: 15000 }).catch(e => console.log('Goto timeout', e.message));
  
  // Wait for page to initialize
  await page.waitForTimeout(3000);
  
  // Try to click play if there is a play button
  try {
    await page.click('button', { timeout: 2000 });
    console.log('Clicked a button');
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('No button clicked');
  }

  const videos = await page.evaluate(() => Array.from(document.querySelectorAll('video')).map(v => v.src));
  console.log('Videos in DOM:', videos);

  await browser.close();
}
main().catch(console.error);
