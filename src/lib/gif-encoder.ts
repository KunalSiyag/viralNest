/**
 * Client-side GIF89a encoder and Video-to-GIF converter.
 * Enables downloading short video-based Pinterest animated pins as true .gif files.
 */

// Quantize RGBA pixels to 256-color palette using popularity/frequency sampling
function buildPalette(pixels: Uint8ClampedArray, maxColors = 256): { palette: number[]; indexMap: Map<number, number> } {
  const colorCounts = new Map<number, number>();
  const len = pixels.length;
  // Sample every 4th pixel for speed
  for (let i = 0; i < len; i += 16) {
    const r = pixels[i] >> 3;
    const g = pixels[i + 1] >> 3;
    const b = pixels[i + 2] >> 3;
    const key = (r << 10) | (g << 5) | b;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }

  // Sort by frequency and pick top 256
  const sorted = Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, maxColors);
  const palette: number[] = [];
  const indexMap = new Map<number, number>();

  sorted.forEach(([key], idx) => {
    const r = ((key >> 10) & 0x1f) << 3;
    const g = ((key >> 5) & 0x1f) << 3;
    const b = (key & 0x1f) << 3;
    palette.push(r, g, b);
    indexMap.set(key, idx);
  });

  // Pad palette to power of 2
  while (palette.length < 256 * 3) {
    palette.push(0, 0, 0);
  }

  return { palette, indexMap };
}

function mapPixelsToPalette(pixels: Uint8ClampedArray, palette: number[], indexMap: Map<number, number>): Uint8Array {
  const numPixels = pixels.length >> 2;
  const indexed = new Uint8Array(numPixels);
  const cache = new Map<number, number>();

  for (let i = 0; i < numPixels; i++) {
    const offset = i << 2;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const fastKey = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

    const mapped = indexMap.get(fastKey);
    if (mapped !== undefined) {
      indexed[i] = mapped;
      continue;
    }

    const cached = cache.get(fastKey);
    if (cached !== undefined) {
      indexed[i] = cached;
      continue;
    }

    // Nearest color search
    let bestDist = Infinity;
    let bestIdx = 0;
    const numPaletteColors = indexMap.size;
    for (let c = 0; c < numPaletteColors; c++) {
      const pr = palette[c * 3];
      const pg = palette[c * 3 + 1];
      const pb = palette[c * 3 + 2];
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      const dist = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = c;
        if (dist === 0) break;
      }
    }
    cache.set(fastKey, bestIdx);
    indexed[i] = bestIdx;
  }
  return indexed;
}

// LZW compression for GIF
function lzwEncode(minCodeSize: number, indexedPixels: Uint8Array): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let maxCode = (1 << codeSize) - 1;

  const out: number[] = [];
  let curBit = 0;
  let curByte = 0;

  function writeBits(val: number, bits: number) {
    for (let i = 0; i < bits; i++) {
      if (val & (1 << i)) {
        curByte |= 1 << curBit;
      }
      curBit++;
      if (curBit === 8) {
        out.push(curByte);
        curByte = 0;
        curBit = 0;
      }
    }
  }

  let dict = new Map<number, number>();
  function resetDict() {
    dict.clear();
    codeSize = minCodeSize + 1;
    maxCode = (1 << codeSize) - 1;
  }

  writeBits(clearCode, codeSize);
  resetDict();

  let nextCode = eoiCode + 1;
  let curPrefix = indexedPixels[0];

  for (let i = 1; i < indexedPixels.length; i++) {
    const k = indexedPixels[i];
    const key = (curPrefix << 8) | k;
    const entry = dict.get(key);

    if (entry !== undefined) {
      curPrefix = entry;
    } else {
      writeBits(curPrefix, codeSize);
      if (nextCode <= 4095) {
        dict.set(key, nextCode++);
        if (nextCode > maxCode && codeSize < 12) {
          codeSize++;
          maxCode = (1 << codeSize) - 1;
        }
      } else {
        writeBits(clearCode, codeSize);
        resetDict();
        nextCode = eoiCode + 1;
      }
      curPrefix = k;
    }
  }

  writeBits(curPrefix, codeSize);
  writeBits(eoiCode, codeSize);
  if (curBit > 0) {
    out.push(curByte);
  }

  // Pack into GIF blocks of max 255 bytes
  const blocks: number[] = [minCodeSize];
  let pos = 0;
  while (pos < out.length) {
    const chunkSize = Math.min(255, out.length - pos);
    blocks.push(chunkSize);
    for (let j = 0; j < chunkSize; j++) {
      blocks.push(out[pos + j]);
    }
    pos += chunkSize;
  }
  blocks.push(0); // Block terminator
  return new Uint8Array(blocks);
}

export interface GifFrame {
  imageData: ImageData;
  delayMs: number;
}

/**
 * Encodes an array of ImageData frames into an animated GIF Blob.
 */
export function encodeGif(frames: GifFrame[], width: number, height: number): Blob {
  if (!frames.length) throw new Error('No frames provided to GIF encoder');

  // Compute common palette from first frame
  const { palette, indexMap } = buildPalette(frames[0].imageData.data, 256);

  const parts: Uint8Array[] = [];

  // Header: GIF89a
  parts.push(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]));

  // Logical Screen Descriptor
  const lsd = new Uint8Array(7);
  lsd[0] = width & 0xff;
  lsd[1] = (width >> 8) & 0xff;
  lsd[2] = height & 0xff;
  lsd[3] = (height >> 8) & 0xff;
  lsd[4] = 0xf7; // Global Color Table Flag (1), 8 bits/pixel (111), sorted (0), 256 colors (111)
  lsd[5] = 0;    // Background Color Index
  lsd[6] = 0;    // Pixel Aspect Ratio
  parts.push(lsd);

  // Global Color Table (256 * 3 bytes)
  parts.push(new Uint8Array(palette));

  // Netscape 2.0 Application Extension (Infinite Loop)
  parts.push(
    new Uint8Array([
      0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, 0x03, 0x01,
      0x00, 0x00, 0x00,
    ]),
  );

  // Encode each frame
  for (const frame of frames) {
    const delayHundredths = Math.max(2, Math.round(frame.delayMs / 10));

    // Graphic Control Extension
    const gce = new Uint8Array([
      0x21, 0xf9, 0x04,
      0x04, // Disposal method: 1 (do not dispose / overwrite)
      delayHundredths & 0xff,
      (delayHundredths >> 8) & 0xff,
      0x00, // Transparent color index
      0x00, // Terminator
    ]);
    parts.push(gce);

    // Image Descriptor
    const id = new Uint8Array([
      0x2c,
      0x00, 0x00, // Left
      0x00, 0x00, // Top
      width & 0xff, (width >> 8) & 0xff,
      height & 0xff, (height >> 8) & 0xff,
      0x00, // No Local Color Table
    ]);
    parts.push(id);

    // Indexed pixels and LZW data
    const indexed = mapPixelsToPalette(frame.imageData.data, palette, indexMap);
    const lzw = lzwEncode(8, indexed);
    parts.push(lzw);
  }

  // GIF Trailer
  parts.push(new Uint8Array([0x3b]));

  return new Blob(parts as BlobPart[], { type: 'image/gif' });
}

/**
 * Converts a video URL (e.g. from Pinterest video pin) into an animated GIF Blob.
 * Automatically samples up to maxDuration seconds at given fps and scale.
 */
export async function convertVideoToGif(
  videoUrl: string,
  options: {
    maxDuration?: number;
    fps?: number;
    maxWidth?: number;
    onProgress?: (progress: { phase: string; percent: number }) => void;
  } = {},
): Promise<Blob> {
  const { maxDuration = 5, fps = 10, maxWidth = 420, onProgress } = options;

  onProgress?.({ phase: 'Connecting to video stream…', percent: 10 });

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Video loading timed out.')), 15000);
    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      resolve();
    };
    video.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Could not load video for GIF conversion.'));
    };
    video.src = videoUrl;
  });

  const duration = Math.min(video.duration || maxDuration, maxDuration);
  const origW = video.videoWidth || 420;
  const origH = video.videoHeight || 420;

  // Downscale for smooth GIF performance
  const scale = Math.min(1, maxWidth / origW);
  const width = Math.round((origW * scale) / 2) * 2;
  const height = Math.round((origH * scale) / 2) * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const totalFrames = Math.max(3, Math.min(45, Math.floor(duration * fps)));
  const interval = duration / totalFrames;
  const frames: GifFrame[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const time = i * interval;
    await new Promise<void>((resolve) => {
      video.currentTime = time;
      video.onseeked = () => resolve();
    });

    ctx.drawImage(video, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    frames.push({
      imageData: imgData,
      delayMs: Math.round(interval * 1000),
    });

    const percent = Math.round(15 + (i / totalFrames) * 65);
    onProgress?.({
      phase: `Rendering frames (${i + 1}/${totalFrames})…`,
      percent,
    });
  }

  onProgress?.({ phase: 'Encoding looping GIF…', percent: 85 });
  const blob = encodeGif(frames, width, height);
  onProgress?.({ phase: 'GIF Ready!', percent: 100 });

  return blob;
}
