/**
 * Browser-based Extractor
 *
 * Uses a real headless Chrome (via playwright-core) to load Instagram pages.
 * Instagram loads the actual video/image in the background even with the
 * login wall showing. We intercept network requests to capture:
 *   - The actual video/image media URL (from CDN responses)
 *   - The page title and any visible caption text
 *   - Thumbnail images
 *
 * Flow:
 *   1. Launch headless Chrome
 *   2. Set up network request interception to capture media URLs
 *   3. Navigate to the Instagram URL
 *   4. Dismiss the login popup if it appears
 *   5. Wait for media requests to appear in the network log
 *   6. Extract caption from page content
 *   7. Return the captured media URL + metadata
 */

import { chromium, type Browser, type Page } from 'playwright-core';
import { parseEngagementCount, type PlatformMetrics } from '../media-capabilities';

const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome';

// Singleton browser instance — reuse across requests to avoid cold-start cost
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance?.isConnected()) {
    return browserInstance;
  }

  // Prevent multiple concurrent launches
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--no-first-run',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  try {
    browserInstance = await browserLaunchPromise;

    // Clean up on disconnect
    browserInstance.on('disconnected', () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });

    return browserInstance;
  } finally {
    browserLaunchPromise = null;
  }
}

export interface BrowserExtractResult {
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  caption: string | null;
  author: string | null;
  platformMetrics: PlatformMetrics;
}

/**
 * Extract Instagram content by loading the page in a real browser
 * and intercepting the network requests for media files.
 */
export async function extractWithBrowser(url: string): Promise<BrowserExtractResult> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    locale: 'en-US',
  });

  const page = await context.newPage();

  // Collected media URLs from network interception
  const capturedMedia: { url: string; type: string; size: number }[] = [];
  let thumbnailUrl: string | null = null;

  // Intercept network responses to find video/image media
  page.on('response', async (response) => {
    const resUrl = response.url();
    const contentType = response.headers()['content-type'] || '';
    const contentLength = parseInt(response.headers()['content-length'] || '0', 10);

    // Capture video files from Instagram CDN
    if (
      contentType.includes('video/') &&
      (resUrl.includes('cdninstagram.com') ||
        resUrl.includes('fbcdn.net') ||
        resUrl.includes('scontent'))
    ) {
      capturedMedia.push({ url: resUrl, type: 'video', size: contentLength });
    }

    // Capture large images (likely the post image, not UI elements)
    if (
      contentType.includes('image/') &&
      contentLength > 50000 && // >50KB — skip small icons/avatars
      (resUrl.includes('cdninstagram.com') ||
        resUrl.includes('fbcdn.net') ||
        resUrl.includes('scontent'))
    ) {
      if (!thumbnailUrl) {
        thumbnailUrl = resUrl;
      }
      capturedMedia.push({ url: resUrl, type: 'image', size: contentLength });
    }

    // Also capture from GraphQL/API JSON responses
    if (resUrl.includes('graphql') || resUrl.includes('/api/')) {
      try {
        const body = await response.text();
        const json = JSON.parse(body);
        const found = findMediaInJson(json);
        for (const f of found) {
          // Add a high size so these are preferred over smaller CDN segments
          capturedMedia.push({ url: f.url, type: f.type, size: 999999 });
        }
      } catch {
        // Ignore errors (not JSON, body unavailable, etc.)
      }
    }
  });

  try {
    // Navigate to the Instagram URL
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    // Dismiss login popup — Instagram shows various login modals
    await dismissLoginPopup(page);

    // Wait for media to load via network (the video/images load in background)
    await page.waitForTimeout(5000);

    // Try to extract caption from the page
    const caption = await extractCaption(page);
    const author = await extractAuthor(page);

    // If we haven't captured a thumbnail yet, try to get it from the page
    if (!thumbnailUrl) {
      thumbnailUrl = await extractThumbnailFromPage(page);
    }

    // Find the best video URL (largest file = highest quality)
    // Exclude URLs that are very likely to be short-lived chunks.
    const videos = capturedMedia
      .filter((m) => {
        if (m.type !== 'video') return false;
        const lowerUrl = m.url.toLowerCase();
        if (lowerUrl.includes('.m3u8')) return false;
        if (lowerUrl.includes('/dash/')) return false;
        if (lowerUrl.includes('/hls/')) return false;
        return true;
      })
      .sort((a, b) => b.size - a.size);

    const bestVideo = videos.length > 0 ? videos[0].url : null;

    // If no video was captured, check for images
    if (!bestVideo && !thumbnailUrl) {
      const images = capturedMedia
        .filter((m) => m.type === 'image')
        .sort((a, b) => b.size - a.size);
      if (images.length > 0) {
        thumbnailUrl = images[0].url;
      }
    }

    const platformMetrics = await extractPlatformMetrics(page);

    return {
      mediaUrl: bestVideo,
      thumbnailUrl,
      caption,
      author,
      platformMetrics,
    };
  } finally {
    await context.close();
  }
}

/**
 * Dismiss Instagram's login popup/modal.
 * Instagram uses various selectors for the login wall:
 * - "Not Now" button
 * - Close (X) button on modals
 * - Cookie consent dialogs
 */
async function dismissLoginPopup(page: Page): Promise<void> {
  const dismissSelectors = [
    // "Not Now" button on login prompt
    'button:has-text("Not Now")',
    'button:has-text("Not now")',
    // Close button (X) on modals
    '[aria-label="Close"]',
    '[aria-label="Dismiss"]',
    // Cookie consent
    'button:has-text("Allow all cookies")',
    'button:has-text("Accept All")',
    'button:has-text("Allow essential and optional cookies")',
    // Generic close/dismiss
    'button:has-text("Decline optional cookies")',
  ];

  for (const selector of dismissSelectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.isVisible({ timeout: 1000 })) {
        await el.click({ timeout: 2000 });
        await page.waitForTimeout(500);
      }
    } catch {
      // Selector not found, continue to next
    }
  }

  // Also try pressing Escape to close any modal
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch {
    // Ignore
  }
}

/**
 * Extract caption text from the loaded Instagram page
 */
async function extractCaption(page: Page): Promise<string | null> {
  // Try multiple selectors for caption text
  const captionSelectors = [
    // Standard post caption
    'h1',
    'span[dir="auto"]',
    '[data-testid="post-comment-root"] span',
    'article span[dir="auto"]',
    // Meta description (sometimes populated after JS loads)
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[name="description"]',
  ];

  for (const selector of captionSelectors) {
    try {
      if (selector.startsWith('meta')) {
        const content = await page.getAttribute(selector, 'content');
        if (content && content.length > 10 && content.toLowerCase() !== 'instagram') {
          return content;
        }
      } else {
        const el = page.locator(selector).first();
        const text = await el.textContent({ timeout: 1000 });
        if (text && text.length > 15 && !text.toLowerCase().includes('log in')) {
          return text.slice(0, 500).trim();
        }
      }
    } catch {
      // Selector not found
    }
  }

  return null;
}

/**
 * Extract author/username from the page
 */
async function extractAuthor(page: Page): Promise<string | null> {
  try {
    // Try the page URL pattern first
    const url = page.url();
    const match = url.match(/instagram\.com\/([^/?]+)/);
    if (match && !['p', 'reel', 'tv', 'reels', 'stories'].includes(match[1])) {
      return match[1];
    }

    // Try page selectors
    const authorEl = page.locator('header a[href^="/"] span, a[role="link"] span').first();
    const author = await authorEl.textContent({ timeout: 1000 });
    if (author && author.length > 1) {
      return author.trim();
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Try to extract a thumbnail from the page's visible images
 */
async function extractThumbnailFromPage(page: Page): Promise<string | null> {
  try {
    // Look for the main post image/video poster
    const src = await page.evaluate(() => {
      // Find the largest visible image that's from Instagram CDN
      const images = Array.from(document.querySelectorAll('img'));
      const cdnImages = images
        .filter((img) => {
          const src = img.src || '';
          return (
            (src.includes('cdninstagram.com') || src.includes('fbcdn.net') || src.includes('scontent')) &&
            img.naturalWidth > 200
          );
        })
        .sort((a, b) => b.naturalWidth * b.naturalHeight - a.naturalWidth * a.naturalHeight);

      return cdnImages.length > 0 ? cdnImages[0].src : null;
    });

    return src;
  } catch {
    return null;
  }
}

async function extractPlatformMetrics(page: Page): Promise<PlatformMetrics> {
  try {
    const metricData = await page.evaluate(() => {
      const details: {
        description?: string;
        ldJsonTexts: string[];
      } = {
        description: undefined,
        ldJsonTexts: [],
      };

      const descriptionMeta = document.querySelector('meta[property="og:description"], meta[name="description"]') as HTMLMetaElement | null;
      if (descriptionMeta?.content) {
        details.description = descriptionMeta.content;
      }

      const ldJsonScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      details.ldJsonTexts = ldJsonScripts
        .map(node => node.textContent || '')
        .filter(Boolean);

      return details;
    });

    const metrics: PlatformMetrics = {};

    if (metricData.description) {
      const compact = metricData.description.toLowerCase().replace(/\s+/g, ' ');
      const likesMatch = compact.match(/([\d.,]+(?:\s*[km])?)\s+likes?/);
      const commentsMatch = compact.match(/([\d.,]+(?:\s*[km])?)\s+comments?/);
      const viewsMatch = compact.match(/([\d.,]+(?:\s*[km])?)\s+views?/);

      if (likesMatch) metrics.likes = parseEngagementCount(likesMatch[1]);
      if (commentsMatch) metrics.comments = parseEngagementCount(commentsMatch[1]);
      if (viewsMatch) metrics.views = parseEngagementCount(viewsMatch[1]);
    }

    for (const text of metricData.ldJsonTexts) {
      try {
        const parsed = JSON.parse(text);
        const entries = Array.isArray(parsed) ? parsed : [parsed];

        for (const entry of entries) {
          if (!entry || typeof entry !== 'object') continue;
          const interactions = Array.isArray(entry.interactionStatistic)
            ? entry.interactionStatistic
            : entry.interactionStatistic
              ? [entry.interactionStatistic]
              : [];

          for (const interaction of interactions) {
            const interactionType =
              typeof interaction?.interactionType === 'string'
                ? interaction.interactionType
                : typeof interaction?.interactionType?.['@type'] === 'string'
                  ? interaction.interactionType['@type']
                  : '';
            const count = typeof interaction?.userInteractionCount === 'number'
              ? interaction.userInteractionCount
              : Number.parseInt(String(interaction?.userInteractionCount || ''), 10);

            if (Number.isNaN(count)) continue;

            const normalizedType = interactionType.toLowerCase();
            if (normalizedType.includes('like')) metrics.likes = count;
            if (normalizedType.includes('comment')) metrics.comments = count;
            if (normalizedType.includes('watch') || normalizedType.includes('view')) metrics.views = count;
          }
        }
      } catch {
        // Ignore malformed JSON-LD blobs.
      }
    }

    return metrics;
  } catch {
    return {};
  }
}

/**
 * Recursively find video/image URLs in JSON responses
 */
function findMediaInJson(obj: unknown, depth = 0): { type: string; url: string }[] {
  if (depth > 20 || !obj) return [];
  const results: { type: string; url: string }[] = [];
  
  if (typeof obj === 'string') {
    if (obj.includes('cdninstagram.com') || obj.includes('fbcdn.net') || obj.includes('scontent')) {
      if (obj.includes('.mp4') || obj.includes('video')) {
        results.push({ type: 'video', url: obj });
      } else if (obj.match(/\.(jpg|jpeg|png|webp)/i)) {
        results.push({ type: 'image', url: obj });
      }
    }
    
    // Attempt to parse stringified JSON
    if (obj.trim().startsWith('{') || obj.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(obj);
        results.push(...findMediaInJson(parsed, depth + 1));
      } catch {
        // Not valid JSON, ignore
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

/**
 * Gracefully shut down the browser (for cleanup on server shutdown)
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
