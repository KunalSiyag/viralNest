import * as cheerio from "cheerio";

export interface ExtractedData {
  platform: string;
  source_url: string;
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  tags: string[];
}

export async function extractMediaData(url: string): Promise<ExtractedData> {
  try {
    // Since Vercel Serverless Functions have strict limits and no access to binaries
    // like yt-dlp, we use a basic OpenGraph metadata fetcher as a fallback.
    // In a production application, this should be replaced with a reliable API
    // (e.g. Apify, RapidAPI) since public platform pages often block standard fetch requests.
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let platform = "unknown";
    if (url.includes("instagram.com")) platform = "instagram";
    else if (url.includes("pinterest.com") || url.includes("pin.it")) platform = "pinterest";
    else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";
    else if (url.includes("tiktok.com")) platform = "tiktok";

    const title = $('meta[property="og:title"]').attr("content") || $("title").text();
    const description = $('meta[property="og:description"]').attr("content") || "";
    const image = $('meta[property="og:image"]').attr("content");
    const video = $('meta[property="og:video"]').attr("content") || $('meta[property="og:video:url"]').attr("content") || $('meta[property="og:video:secure_url"]').attr("content");

    // Attempt to extract tags
    const words = `${title} ${description}`.match(/#\w+/g) || [];
    const tags = Array.from(new Set(words.map(w => w.replace("#", "").toLowerCase())));

    // Determine the media URL. If no OG video tag is present (common for protected pages),
    // we fallback to the source URL so the user has something.
    let mediaUrl = video;
    if (!mediaUrl && platform === "youtube") {
      mediaUrl = url; // Pass the YouTube link itself
    }

    return {
      platform,
      source_url: url,
      media_url: mediaUrl,
      thumbnail_url: image,
      caption: title || "Extracted Content",
      tags,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Extraction failed:", error.message, error.stack);
    } else {
      console.error("Extraction failed with unknown error:", error);
    }
    throw new Error("Failed to extract media data. The URL might be invalid, or the site blocked the request.");
  }
}
