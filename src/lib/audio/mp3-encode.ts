/**
 * PintDownload MP3 encoding loop and ID3 tag. MP3 frames come from LAME,
 * ported to JavaScript as @breezystack/lamejs (LGPL-3.0, unmodified, loaded as
 * its own file only when someone asks for an MP3).
 */

import { MP3_KBPS, MP3_SAMPLE_RATES } from './mp3-constants';

export { MP3_KBPS, MP3_SAMPLE_RATES };

export interface PcmAudio {
  sampleRate: number;
  /** One Float32Array per channel (1 or 2), values in [-1, 1]. */
  channels: Float32Array[];
}

/** The part of the lamejs API this module uses. */
export interface Mp3EncoderLike {
  encodeBuffer(left: Int16Array, right?: Int16Array): ArrayLike<number> & { buffer: ArrayBufferLike; byteOffset: number; byteLength: number };
  flush(): ArrayLike<number> & { buffer: ArrayBufferLike; byteOffset: number; byteLength: number };
}

export type Mp3EncoderCtor = new (channels: number, sampleRate: number, kbps: number) => Mp3EncoderLike;

/** Samples per encodeBuffer call: a whole number of MP3 frames (1152 each). */
const BLOCK = 1152 * 32;

function toInt16(src: Float32Array, from: number, to: number, out: Int16Array) {
  for (let i = from, j = 0; i < to; i++, j++) {
    const s = src[i] < -1 ? -1 : src[i] > 1 ? 1 : src[i];
    out[j] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
}

function copyBytes(chunk: { buffer: ArrayBufferLike; byteOffset: number; byteLength: number }): Uint8Array {
  // lamejs returns an Int8Array view into a reused buffer: copy it out.
  return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength).slice();
}

/**
 * Encode PCM to MP3 frames with LAME. Calls `onProgress` with 0–1 between
 * blocks and awaits `yieldEvery` (if given) so a main-thread caller can let
 * the page breathe. Returns the MP3 frames (no tags).
 */
export async function encodePcmToMp3(
  Encoder: Mp3EncoderCtor,
  pcm: PcmAudio,
  opts: { kbps?: number; onProgress?: (ratio: number) => void; yieldEvery?: () => Promise<void>; signal?: AbortSignal } = {},
): Promise<Uint8Array[]> {
  const channels = pcm.channels.slice(0, 2);
  if (!channels.length) throw new Error('No audio channels to encode.');
  if (!(MP3_SAMPLE_RATES as readonly number[]).includes(pcm.sampleRate)) {
    throw new Error(`MP3 needs 32, 44.1 or 48 kHz audio (got ${pcm.sampleRate} Hz).`);
  }
  const encoder = new Encoder(channels.length, pcm.sampleRate, opts.kbps ?? MP3_KBPS);
  const length = channels[0].length;
  const left = new Int16Array(BLOCK);
  const right = channels.length > 1 ? new Int16Array(BLOCK) : undefined;
  const parts: Uint8Array[] = [];
  for (let from = 0; from < length; from += BLOCK) {
    if (opts.signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    const to = Math.min(length, from + BLOCK);
    const n = to - from;
    toInt16(channels[0], from, to, left);
    if (right) toInt16(channels[1], from, to, right);
    const chunk = encoder.encodeBuffer(left.subarray(0, n), right?.subarray(0, n));
    if (chunk.byteLength) parts.push(copyBytes(chunk));
    opts.onProgress?.(to / length);
    if (opts.yieldEvery) await opts.yieldEvery();
  }
  const tail = encoder.flush();
  if (tail.byteLength) parts.push(copyBytes(tail));
  opts.onProgress?.(1);
  return parts;
}

function utf16Frame(id: string, text: string): Uint8Array {
  // ID3v2.3 text frame: encoding 1 (UTF-16 with BOM), text, UTF-16 NUL.
  const body = new Uint8Array(1 + 2 + text.length * 2 + 2);
  body[0] = 1;
  body[1] = 0xff;
  body[2] = 0xfe;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    body[3 + i * 2] = c & 0xff;
    body[4 + i * 2] = c >> 8;
  }
  const frame = new Uint8Array(10 + body.length);
  for (let i = 0; i < 4; i++) frame[i] = id.charCodeAt(i);
  new DataView(frame.buffer).setUint32(4, body.length);
  frame.set(body, 10);
  return frame;
}

/** A small ID3v2.3 tag with the title and the encoder name. */
export function id3Tag(title: string): Uint8Array {
  const clean = title.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 200);
  const frames = [
    ...(clean ? [utf16Frame('TIT2', clean)] : []),
    utf16Frame('TSSE', 'LAME (lamejs), made in the browser by PintDownload'),
  ];
  const size = frames.reduce((n, f) => n + f.length, 0);
  const tag = new Uint8Array(10 + size);
  tag.set([0x49, 0x44, 0x33, 3, 0, 0]);
  // Tag size is "syncsafe": 7 bits per byte.
  tag[6] = (size >> 21) & 0x7f;
  tag[7] = (size >> 14) & 0x7f;
  tag[8] = (size >> 7) & 0x7f;
  tag[9] = size & 0x7f;
  let pos = 10;
  for (const f of frames) {
    tag.set(f, pos);
    pos += f.length;
  }
  return tag;
}
