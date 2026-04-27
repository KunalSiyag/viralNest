import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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
    // Run yt-dlp to get the JSON dump without actually downloading the video
    // Use --no-warnings and --quiet to keep stdout clean, except for the JSON dump
    // Using execFileAsync with args array to prevent shell command injection
    const { stdout } = await execFileAsync("yt-dlp", ["--dump-json", "--no-warnings", "--quiet", url]);

    const data = JSON.parse(stdout.trim());

    // Basic heuristic to determine platform
    let platform = "unknown";
    if (url.includes("instagram.com")) platform = "instagram";
    else if (url.includes("pinterest.com") || url.includes("pin.it")) platform = "pinterest";
    else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";
    else if (url.includes("tiktok.com")) platform = "tiktok";

    // Extract tags from tags array or caption text
    const tags = Array.isArray(data.tags) ? data.tags : [];

    return {
      platform,
      source_url: url,
      media_url: data.url || data.webpage_url,
      thumbnail_url: data.thumbnail,
      caption: data.title || data.description || "",
      tags,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to extract data:", error.message);
    } else {
      console.error("Failed to extract data:", error);
    }
    throw new Error("Failed to extract media data. The URL might be invalid or unsupported.");
  }
}
