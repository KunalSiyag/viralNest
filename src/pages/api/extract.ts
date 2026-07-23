import type { APIRoute } from 'astro';

export const prerender = false;

// Helper to generate 5 harmonious colors from a dominant hex color
function generatePalette(baseHex?: string | null): string[] {
  let hex = (baseHex || '#E60023').replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (!/^[0-[#30]]{6}$/i.test(hex)) hex = 'E60023';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const toHex = (num: number) => Math.min(255, Math.max(0, Math.round(num))).toString(16).padStart(2, '0');

  // Generate 5 shades: Base, Light Tint, Dark Shade, Soft Accent, Muted Neutral
  const c1 = `#${hex.toUpperCase()}`;
  const c2 = `#${toHex(r + (255 - r) * 0.45)}${toHex(g + (255 - g) * 0.45)}${toHex(b + (255 - b) * 0.45)}`.toUpperCase();
  const c3 = `#${toHex(r * 0.55)}${toHex(g * 0.55)}${toHex(b * 0.55)}`.toUpperCase();
  const c4 = `#${toHex(255 - r * 0.75)}${toHex(255 - g * 0.75)}${toHex(255 - b * 0.75)}`.toUpperCase();
  const c5 = `#${toHex((r + 240) / 2)}${toHex((g + 240) / 2)}${toHex((b + 240) / 2)}`.toUpperCase();

  return [c1, c2, c3, c4, c5];
}

// Helper to extract clean hashtag tokens from text
function extractTagsFromText(text?: string | null): string[] {
  if (!text) return [];
  const found: string[] = [];

  // Extract explicit #hashtags
  const hashtagMatches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(tag => found.push(tag.replace('#', '').toLowerCase()));
  }

  // Extract key words (> 3 chars, alphanumeric)
  const words = text
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['http', 'https', 'www', 'pinterest', 'com', 'this', 'that', 'with', 'from', 'your', 'have', 'more', 'about'].includes(w.toLowerCase()));

  words.forEach(w => found.push(w.toLowerCase()));
  return Array.from(new Set(found)).slice(0, 10);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return new Response(JSON.stringify({ error: 'Please enter a valid Pinterest link.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Clean and normalize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Verify domain is Pinterest or pin.it shortlink
    const isPinterestUrl = /^https?:\/\/(www\.|in\.|uk\.|br\.|id\.|jp\.|de\.|fr\.|es\.|it\.|ca\.|au\.)?(pinterest\.[a-z.]+|pin\.it)\//i.test(targetUrl);
    if (!isPinterestUrl) {
      return new Response(JSON.stringify({ error: 'Invalid link. Please enter a valid Pinterest link (e.g., https://pinterest.com/pin/... or https://pin.it/...)' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Resolve pin.it shortlink or follow redirects
    if (targetUrl.includes('pin.it')) {
      try {
        const shortRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          }
        });
        if (shortRes.url) {
          targetUrl = shortRes.url;
        }
      } catch (e) {
        console.warn('Shortlink resolution warning:', e);
      }
    }

    // Fetch Pinterest page HTML
    let html = '';
    let responseStatus = 200;
    try {
      const fetchResponse = await fetch(targetUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        }
      });
      responseStatus = fetchResponse.status;
      if (fetchResponse.ok) {
        html = await fetchResponse.text();
        if (fetchResponse.url && fetchResponse.url.includes('/pin/')) {
          targetUrl = fetchResponse.url;
        }
      }
    } catch (fetchErr: any) {
      console.error('Fetch error for Pinterest URL:', fetchErr);
    }

    // Check if link is a Board URL
    const isBoardUrl = !targetUrl.includes('/pin/') && !targetUrl.includes('pin.it');
    if (isBoardUrl && html) {
      const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i);
      const boardTitle = ogTitleMatch ? ogTitleMatch[1].replace(/&amp;/g, '&') : 'Pinterest Board';

      const pinIdMatches = [...html.matchAll(/\/pin\/(\d+)\//g)].map(m => m[1]);
      const uniquePinIds = Array.from(new Set(pinIdMatches)).slice(0, 16);

      if (uniquePinIds.length > 0) {
        const boardPins = uniquePinIds.map(id => ({
          pin_id: id,
          url: `https://www.pinterest.com/pin/${id}/`,
          title: `${boardTitle} - Pin #${id.slice(-4)}`,
          image_url: `https://i.pinimg.com/736x/${id.slice(0,2)}/${id.slice(2,4)}/${id.slice(4,6)}/${id}.jpg`,
          thumbnail_url: `https://i.pinimg.com/236x/${id.slice(0,2)}/${id.slice(2,4)}/${id.slice(4,6)}/${id}.jpg`,
          is_video: false,
        }));

        return new Response(JSON.stringify({
          platform: 'pinterest',
          is_board: true,
          board_title: boardTitle,
          board_url: targetUrl,
          pins: boardPins,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let imageUrl: string | null = null;
    let title: string | null = null;
    let description: string | null = null;
    let dominantColor: string | null = null;
    let videoQualities: { label: string; url: string; width?: number; height?: number }[] = [];
    let tagsSet = new Set<string>();

    if (html) {
      // Strategy 1: Parse window.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__
      const relayMatches = [...html.matchAll(/window\.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__\s*\(\s*"([^"]+)"\s*,\s*(\{[\s\S]*?\})\s*\)/g)];
      for (const match of relayMatches) {
        try {
          const payload = JSON.parse(match[2]);
          const pinData = payload?.data?.v3GetPinQueryv2?.data || payload?.data?.v3GetPinQuery?.data || payload?.data?.pin;
          if (pinData) {
            if (!title) title = pinData.title || pinData.gridTitle || pinData.seoTitle || null;
            if (!description) description = pinData.description || pinData.gridDescription || null;
            if (!dominantColor) dominantColor = pinData.dominantColor || pinData.dominant_color || null;

            if (Array.isArray(pinData.pinJoin?.annotations)) {
              pinData.pinJoin.annotations.forEach((a: any) => {
                if (a?.annotationText) tagsSet.add(a.annotationText.toLowerCase());
              });
            }
            if (Array.isArray(pinData.hashtags)) {
              pinData.hashtags.forEach((h: any) => {
                if (typeof h === 'string') tagsSet.add(h.toLowerCase());
              });
            }

            if (pinData.videos?.videoUrls && Array.isArray(pinData.videos.videoUrls)) {
              const seenUrls = new Set<string>();
              for (const vUrl of pinData.videos.videoUrls) {
                if (typeof vUrl === 'string' && !seenUrls.has(vUrl)) {
                  seenUrls.add(vUrl);
                  let label = 'SD MP4';
                  if (vUrl.includes('1080w')) label = '1080p Full HD';
                  else if (vUrl.includes('720w')) label = '720p HD';
                  else if (vUrl.includes('540w')) label = '540p';
                  else if (vUrl.includes('360w')) label = '360p';

                  videoQualities.push({ label, url: vUrl });
                }
              }
            }

            if (pinData.videos?.video_list && typeof pinData.videos.video_list === 'object') {
              const list = pinData.videos.video_list;
              Object.keys(list).forEach((key) => {
                const item = list[key];
                if (item && item.url) {
                  videoQualities.push({
                    label: key.replace('V_', '').replace('EXP', 'HD '),
                    url: item.url,
                    width: item.width,
                    height: item.height,
                  });
                }
              });
            }

            if (pinData.images_236x?.url) {
              thumbnailUrl = pinData.images_236x.url;
              imageUrl = pinData.images_236x.url.replace('/236x/', '/originals/').replace('/236x/', '/736x/');
            } else if (pinData.images && typeof pinData.images === 'object') {
              const orig = pinData.images.originals || pinData.images['1360x'] || pinData.images['736x'] || Object.values(pinData.images)[0];
              if (orig && typeof orig === 'object' && 'url' in orig) {
                imageUrl = (orig as any).url;
                thumbnailUrl = (orig as any).url;
              }
            }
          }
        } catch (e) {
          console.warn('Relay store parse error:', e);
        }
      }

      // Strategy 2: Parse legacy __PWS_DATA__ script tag fallback
      if (!videoQualities.length) {
        const pwsMatch = html.match(/<script id="__PWS_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
        if (pwsMatch && pwsMatch[1]) {
          try {
            const json = JSON.parse(pwsMatch[1]);
            const pins = json?.props?.initialReduxState?.pins;

            if (pins && typeof pins === 'object') {
              const pinList = Object.values(pins);
              const pinData = pinList[0] as any;
              if (pinData) {
                if (!title) title = pinData.title || pinData.grid_title || pinData.seo_title || pinData.rich_metadata?.title || null;
                if (!description) description = pinData.description || pinData.seo_description || pinData.rich_metadata?.description || null;
                if (!dominantColor) dominantColor = pinData.dominant_color || pinData.dominantColor || null;

                if (pinData.images && typeof pinData.images === 'object') {
                  const orig = pinData.images.originals || pinData.images['1360x'] || pinData.images['736x'] || Object.values(pinData.images)[0];
                  if (orig && typeof orig === 'object' && 'url' in orig) {
                    imageUrl = (orig as any).url;
                    thumbnailUrl = (orig as any).url;
                  }
                }

                if (Array.isArray(pinData.pin_join?.annotations)) {
                  pinData.pin_join.annotations.forEach((a: any) => {
                    if (a?.annotation_text) tagsSet.add(a.annotation_text.toLowerCase());
                  });
                }
              }
            }
          } catch (e) {
            console.warn('Error parsing __PWS_DATA__ JSON:', e);
          }
        }
      }

      // Fallbacks for Metadata
      if (!title) {
        const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:title["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          title = ogTitleMatch[1].replace(/&amp;/g, '&');
        }
      }

      if (!description) {
        const ogDescMatch = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:description["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          description = ogDescMatch[1].replace(/&amp;/g, '&');
        }
      }

      // OpenGraph Video Fallback
      if (videoQualities.length > 0) {
        const hdMatch = videoQualities.find(q => q.label.includes('720p') || q.label.includes('1080p') || q.url.includes('expMp4')) || videoQualities[0];
        videoUrl = hdMatch.url;
      } else {
        const ogVideoMatch = html.match(/<meta\s+(?:property|name)=["']og:video(?::secure_url)?["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:video(?::secure_url)?["']/i);
        if (ogVideoMatch && ogVideoMatch[1]) {
          videoUrl = ogVideoMatch[1].replace(/&amp;/g, '&');
        }
      }

      if (!videoUrl) {
        const mp4RegexMatch = html.match(/https:\/\/v1\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/g) ||
                              html.match(/https:\/\/736x\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/g);
        if (mp4RegexMatch && mp4RegexMatch.length > 0) {
          videoUrl = mp4RegexMatch[0];
        }
      }

      if (!thumbnailUrl) {
        const ogImageMatch = html.match(/<meta\s+(?:property|name)=["']og:image(?::secure_url)?["']\s+content=["']([^"']+)["']/i) ||
                             html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image(?::secure_url)?["']/i);
        if (ogImageMatch && ogImageMatch[1]) {
          thumbnailUrl = ogImageMatch[1].replace(/&amp;/g, '&');
          if (!imageUrl) imageUrl = thumbnailUrl;
        }
      }
    }

    // Strategy 3: OEmbed API Fallback if media is still missing
    if (!videoUrl && !imageUrl) {
      try {
        const oembedRes = await fetch(`https://www.pinterest.com/oembed.json?url=${encodeURIComponent(targetUrl)}`);
        if (oembedRes.ok) {
          const oembedJson = await oembedRes.json();
          if (oembedJson.thumbnail_url) {
            thumbnailUrl = oembedJson.thumbnail_url;
            imageUrl = oembedJson.thumbnail_url.replace(/\/236x\//, '/originals/').replace(/\/736x\//, '/originals/');
          }
          if (!title && oembedJson.title) {
            title = oembedJson.title;
          }
        }
      } catch (e) {
        console.warn('OEmbed API fallback warning:', e);
      }
    }

    // Strategy 4: Widget CDN API Fallback by Pin ID
    if (!videoUrl && !imageUrl) {
      const pinIdMatch = targetUrl.match(/\/pin\/(\d+)/);
      if (pinIdMatch && pinIdMatch[1]) {
        try {
          const widgetRes = await fetch(`https://widgets.pinterest.com/v3/pincdn/pins/${pinIdMatch[1]}/`);
          if (widgetRes.ok) {
            const widgetJson = await widgetRes.json();
            const data = widgetJson?.data;
            if (data) {
              if (!title) title = data.title || data.grid_title || null;
              if (!description) description = data.description || null;
              if (data.images?.originals?.url) {
                imageUrl = data.images.originals.url;
                thumbnailUrl = imageUrl;
              }
            }
          }
        } catch (e) {
          console.warn('Widget API fallback warning:', e);
        }
      }
    }

    if (!videoUrl && !imageUrl) {
      return new Response(JSON.stringify({ error: 'Could not find downloadable media for this link. Please check if the Pin is public.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract tags from title & description
    const titleTags = extractTagsFromText(title);
    const descTags = extractTagsFromText(description);
    titleTags.forEach(t => tagsSet.add(t));
    descTags.forEach(t => tagsSet.add(t));

    const finalTags = Array.from(tagsSet).slice(0, 8);
    const colorPalette = generatePalette(dominantColor);

    return new Response(JSON.stringify({
      platform: 'pinterest',
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      image_url: imageUrl,
      title: title || 'Pinterest Pin',
      description: description || '',
      qualities: videoQualities,
      tags: finalTags,
      colors: colorPalette,
      dominant_color: dominantColor || colorPalette[0],
      is_video: !!videoUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Unhandled Pinterest Extraction error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process Pinterest link. Please ensure the link is a valid public Pin.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
