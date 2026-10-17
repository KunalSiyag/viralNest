/**
 * Make a real MP3 from a video file, entirely in the visitor's browser.
 *
 * 1. Decode the video's sound to PCM:
 *    a. Web Audio decodeAudioData on the MP4 itself (Chrome, Edge, Safari, Firefox);
 *    b. if the browser cannot read the MP4 container: pull the AAC frames out
 *       (mp4-audio.ts) and decode them as an ADTS stream;
 *    c. then WebCodecs AudioDecoder on those frames.
 * 2. Encode MP3 (LAME via lamejs) in a Web Worker; on the main thread in small
 *    steps only if a worker cannot start.
 *
 * Nothing is uploaded: the video comes from the site's own /api/download proxy
 * and the MP3 is built in memory. This module is imported lazily, on demand.
 */
import { MP3_KBPS, MP3_SAMPLE_RATES, encodePcmToMp3, id3Tag, type Mp3EncoderCtor, type PcmAudio } from './mp3-encode';
import { mp4HasSound, parseMp4Audio, toAdts } from './mp4-audio';

export { MP3_KBPS };

/** Rate the decoded sound is resampled to before encoding (CD rate, MP3-native). */
const TARGET_RATE = 44100;

export type Mp3ErrorCode = 'no_audio' | 'unsupported' | 'failed' | 'aborted';

export class Mp3Error extends Error {
  constructor(
    readonly code: Mp3ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'Mp3Error';
  }
}

export const MP3_ERROR_TEXT: Record<Mp3ErrorCode, string> = {
  no_audio: 'This video has no sound to save as MP3. Download the MP4 instead.',
  unsupported:
    "This browser can't read the video's sound, so it can't make the MP3. Try Chrome, Edge, Safari or Firefox, or download the MP4.",
  failed: "Couldn't make the MP3. Try again, or download the MP4 and keep its sound.",
  aborted: 'MP3 cancelled.',
};

export interface Mp3Progress {
  /** reading = decoding the video's sound; encoding = writing MP3 frames. */
  stage: 'reading' | 'encoding';
  /** 0–1 within the stage (reading has no fine-grained progress). */
  ratio: number;
}

export interface DecodedAudio extends PcmAudio {
  duration: number;
  /** Which decoder read the sound (for diagnostics). */
  via: 'webaudio' | 'adts' | 'webcodecs';
}

type OfflineCtor = typeof OfflineAudioContext;

function offlineCtor(): OfflineCtor | null {
  if (typeof window === 'undefined') return null;
  return (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext || null) as OfflineCtor | null;
}

/** decodeAudioData on a copy of `bytes`, resampled to TARGET_RATE. */
function webAudioDecode(bytes: ArrayBuffer): Promise<AudioBuffer> {
  const Ctx = offlineCtor();
  if (!Ctx) return Promise.reject(new Error('No Web Audio'));
  const ctx = new Ctx(2, 1, TARGET_RATE);
  return new Promise((resolve, reject) => {
    let settled = false;
    const ok = (b: AudioBuffer) => {
      if (!settled) {
        settled = true;
        resolve(b);
      }
    };
    const fail = (e: unknown) => {
      if (!settled) {
        settled = true;
        reject(e ?? new Error('decodeAudioData failed'));
      }
    };
    try {
      // decodeAudioData detaches its input, so hand it a copy.
      const maybe = ctx.decodeAudioData(bytes.slice(0), ok, fail) as Promise<AudioBuffer> | undefined;
      maybe?.then(ok, fail);
    } catch (e) {
      fail(e);
    }
  });
}

/** Up to two channels; anything wider is mixed down to stereo by Web Audio. */
async function toPcm(buffer: AudioBuffer): Promise<PcmAudio> {
  let src = buffer;
  if (buffer.numberOfChannels > 2 || !(MP3_SAMPLE_RATES as readonly number[]).includes(buffer.sampleRate)) {
    src = await render(buffer, Math.min(2, buffer.numberOfChannels), TARGET_RATE);
  }
  const channels: Float32Array[] = [];
  for (let c = 0; c < src.numberOfChannels; c++) {
    const data = new Float32Array(src.length);
    src.copyFromChannel(data, c);
    channels.push(data);
  }
  return { sampleRate: src.sampleRate, channels };
}

/** Re-render a buffer at another rate or channel count. */
async function render(buffer: AudioBuffer, channels: number, rate: number): Promise<AudioBuffer> {
  const Ctx = offlineCtor();
  if (!Ctx) throw new Error('No Web Audio');
  const length = Math.max(1, Math.ceil((buffer.duration || buffer.length / buffer.sampleRate) * rate));
  const ctx = new Ctx(channels, length, rate);
  const node = ctx.createBufferSource();
  node.buffer = buffer;
  node.connect(ctx.destination);
  node.start(0);
  return ctx.startRendering();
}

/** WebCodecs path: decode the demuxed AAC frames directly. */
async function webCodecsDecode(track: NonNullable<ReturnType<typeof parseMp4Audio>>): Promise<PcmAudio> {
  const AD = (globalThis as any).AudioDecoder;
  const Chunk = (globalThis as any).EncodedAudioChunk;
  if (!AD || !Chunk) throw new Error('No WebCodecs');
  const config = {
    codec: track.codec,
    sampleRate: track.sampleRate,
    numberOfChannels: track.channels,
    description: track.config,
  };
  const support = await AD.isConfigSupported(config);
  if (!support?.supported) throw new Error('AAC not supported by WebCodecs');

  const planes: Float32Array[][] = [];
  let rate = track.sampleRate;
  let failure: unknown = null;
  const decoder = new AD({
    output: (data: any) => {
      rate = data.sampleRate;
      const chans = Math.min(2, data.numberOfChannels);
      for (let c = 0; c < chans; c++) {
        const plane = new Float32Array(data.numberOfFrames);
        data.copyTo(plane, { planeIndex: c, format: 'f32-planar' });
        (planes[c] ||= []).push(plane);
      }
      data.close();
    },
    error: (e: unknown) => {
      failure = e;
    },
  });
  decoder.configure(config);
  track.samples.forEach((sample, i) => {
    decoder.decode(new Chunk({ type: 'key', timestamp: track.timestamps[i], data: sample }));
  });
  await decoder.flush();
  decoder.close();
  if (failure || !planes.length) throw failure ?? new Error('WebCodecs produced no audio');

  const channels = planes.map((parts) => {
    const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
    let pos = 0;
    for (const p of parts) {
      out.set(p, pos);
      pos += p.length;
    }
    return out;
  });
  if ((MP3_SAMPLE_RATES as readonly number[]).includes(rate)) return { sampleRate: rate, channels };

  const Ctx = offlineCtor();
  if (!Ctx) throw new Error('No Web Audio to resample');
  const tmp = new Ctx(channels.length, channels[0].length, rate).createBuffer(channels.length, channels[0].length, rate);
  channels.forEach((ch, c) => tmp.copyToChannel(ch, c));
  return toPcm(await render(tmp, channels.length, TARGET_RATE));
}

/** Decode a video file's sound to PCM, trying each decoder in turn. */
export async function decodeVideoAudio(video: Blob | ArrayBuffer): Promise<DecodedAudio> {
  const bytes = video instanceof ArrayBuffer ? video : await video.arrayBuffer();
  const finish = async (buffer: AudioBuffer, via: DecodedAudio['via']): Promise<DecodedAudio> => {
    const pcm = await toPcm(buffer);
    return { ...pcm, duration: pcm.channels[0].length / pcm.sampleRate, via };
  };

  try {
    return await finish(await webAudioDecode(bytes), 'webaudio');
  } catch {
    /* fall through to the container-free paths */
  }

  const track = parseMp4Audio(bytes);
  if (!track) {
    if (mp4HasSound(bytes) === false) throw new Mp3Error('no_audio', MP3_ERROR_TEXT.no_audio);
    throw new Mp3Error('unsupported', MP3_ERROR_TEXT.unsupported);
  }

  try {
    const adts = toAdts(track);
    return await finish(await webAudioDecode(adts.buffer.slice(adts.byteOffset, adts.byteOffset + adts.byteLength) as ArrayBuffer), 'adts');
  } catch {
    /* next */
  }

  try {
    const pcm = await webCodecsDecode(track);
    return { ...pcm, duration: pcm.channels[0].length / pcm.sampleRate, via: 'webcodecs' };
  } catch {
    throw new Mp3Error('unsupported', MP3_ERROR_TEXT.unsupported);
  }
}

/** Encode PCM to MP3 frames in a Web Worker (main thread only as a fallback). */
export async function encodeMp3(
  pcm: PcmAudio,
  opts: { kbps?: number; onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
): Promise<Uint8Array[]> {
  const kbps = opts.kbps ?? MP3_KBPS;
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL('./mp3.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    worker = null;
  }

  if (worker) {
    const w = worker;
    try {
      return await new Promise<Uint8Array[]>((resolve, reject) => {
        const abort = () => reject(new DOMException('Cancelled', 'AbortError'));
        opts.signal?.addEventListener('abort', abort, { once: true });
        w.onmessage = (e: MessageEvent) => {
          const msg = e.data;
          if (msg?.type === 'progress') opts.onProgress?.(msg.ratio);
          else if (msg?.type === 'done') resolve(msg.parts as Uint8Array[]);
          else if (msg?.type === 'error') reject(new Error(msg.message));
        };
        w.onerror = (e) => {
          e.preventDefault();
          reject(new Error('worker-failed'));
        };
        // Copies: the caller may still need its PCM (the trimmer keeps it).
        const channels = pcm.channels.map((c) => c.slice());
        w.postMessage({ channels, sampleRate: pcm.sampleRate, kbps }, channels.map((c) => c.buffer));
      });
    } catch (err) {
      if ((err as Error)?.message !== 'worker-failed') throw err;
      /* worker script could not load: encode on this thread below */
    } finally {
      w.terminate();
    }
  }

  const { Mp3Encoder } = await import('@breezystack/lamejs');
  let lastYield = performance.now();
  return encodePcmToMp3(Mp3Encoder as unknown as Mp3EncoderCtor, pcm, {
    kbps,
    signal: opts.signal,
    onProgress: opts.onProgress,
    yieldEvery: async () => {
      if (performance.now() - lastYield < 40) return;
      await new Promise((r) => setTimeout(r, 0));
      lastYield = performance.now();
    },
  });
}

/** Build an MP3 Blob (ID3 title tag + frames) from decoded PCM. */
export async function pcmToMp3Blob(
  pcm: PcmAudio,
  opts: { title?: string; kbps?: number; onProgress?: (ratio: number) => void; signal?: AbortSignal } = {},
): Promise<Blob> {
  const parts = await encodeMp3(pcm, opts);
  return new Blob([id3Tag(opts.title || ''), ...parts] as BlobPart[], { type: 'audio/mpeg' });
}

/** Video file → MP3 Blob. Throws Mp3Error with visitor-facing text. */
export async function videoToMp3(
  video: Blob | ArrayBuffer,
  opts: { title?: string; kbps?: number; onProgress?: (p: Mp3Progress) => void; signal?: AbortSignal } = {},
): Promise<Blob> {
  try {
    opts.onProgress?.({ stage: 'reading', ratio: 0 });
    const pcm = await decodeVideoAudio(video);
    if (opts.signal?.aborted) throw new Mp3Error('aborted', MP3_ERROR_TEXT.aborted);
    opts.onProgress?.({ stage: 'encoding', ratio: 0 });
    return await pcmToMp3Blob(pcm, {
      title: opts.title,
      kbps: opts.kbps,
      signal: opts.signal,
      onProgress: (ratio) => opts.onProgress?.({ stage: 'encoding', ratio }),
    });
  } catch (err) {
    if (err instanceof Mp3Error) throw err;
    if ((err as Error)?.name === 'AbortError') throw new Mp3Error('aborted', MP3_ERROR_TEXT.aborted);
    throw new Mp3Error('failed', MP3_ERROR_TEXT.failed);
  }
}
