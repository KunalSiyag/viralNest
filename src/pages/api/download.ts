import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const reqUrl = new URL(request.url);
    const mediaUrl = reqUrl.searchParams.get('url');
    const customFilename = reqUrl.searchParams.get('filename') || 'pinterest_download.mp4';

    if (!mediaUrl) {
      return new Response('Missing media URL', { status: 400 });
    }

    // Verify it is a Pinterest media URL
    const isPinimg = /^https?:\/\/[a-z0-9.-]*\.pinimg\.com\//i.test(mediaUrl);
    if (!isPinimg) {
      return new Response('Invalid media URL host', { status: 400 });
    }

    const fetchRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      }
    });

    if (!fetchRes.ok || !fetchRes.body) {
      return new Response('Failed to retrieve media from Pinterest servers', { status: fetchRes.status || 500 });
    }

    const contentType = fetchRes.headers.get('content-type') || (mediaUrl.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');

    return new Response(fetchRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(customFilename)}"`,
        'Cache-Control': 'no-cache',
      }
    });

  } catch (error: any) {
    console.error('Download Proxy Error:', error);
    return new Response('An error occurred during file download proxying.', { status: 500 });
  }
};
