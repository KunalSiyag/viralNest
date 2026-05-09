import { NextRequest, NextResponse } from "next/server";
import {
  extensionFromContentType,
  isLikelyDirectMediaUrl,
  isMediaContentType,
} from "@/services/media-capabilities";

/**
 * GET /api/download
 *
 * Proxy download service. Fetches media from origin and streams
 * to client with proper Content-Disposition headers.
 * This avoids CORS issues with direct cross-origin downloads.
 *
 * Query params:
 *   - url: the media URL to download
 *   - filename: optional filename for the download
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'viralNest-download';

    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(mediaUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid media URL' },
        { status: 400 }
      );
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTP(S) media URLs are supported' },
        { status: 400 }
      );
    }

    if (!isLikelyDirectMediaUrl(mediaUrl)) {
      return NextResponse.json(
        { error: 'This URL is not a direct media asset. Please use the original source link.' },
        { status: 400 }
      );
    }

    // Fetch the media
    const mediaRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });

    if (!mediaRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch media: HTTP ${mediaRes.status}` },
        { status: 502 }
      );
    }

    // Determine file extension from content type
    const contentType = mediaRes.headers.get('content-type') || 'application/octet-stream';
    if (!isMediaContentType(contentType)) {
      return NextResponse.json(
        { error: `Origin returned non-media content-type: ${contentType}` },
        { status: 415 }
      );
    }

    const ext = extensionFromContentType(contentType);

    const safeFilename = `${filename.replace(/[^a-zA-Z0-9-_]/g, '_')}${ext}`;

    // Stream the response
    return new NextResponse(mediaRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': mediaRes.headers.get('content-length') || '',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Download failed. The media might be unavailable.' },
      { status: 500 }
    );
  }
}
