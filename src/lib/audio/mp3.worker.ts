/// <reference lib="webworker" />
/*! MP3 encoding by LAME (https://lame.sourceforge.io/), JavaScript port @breezystack/lamejs, LGPL-3.0: https://github.com/shijinyu/lamejs */
/**
 * Web Worker that turns decoded PCM into MP3 frames with LAME, so a long clip
 * never blocks the page. Loaded only when someone asks for an MP3.
 *
 * in:  { channels: Float32Array[], sampleRate: number, kbps: number }
 * out: { type: 'progress', ratio } … then { type: 'done', parts: Uint8Array[] }
 *      or { type: 'error', message }
 */
import { Mp3Encoder } from '@breezystack/lamejs';
import { encodePcmToMp3, type Mp3EncoderCtor } from './mp3-encode';

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (event: MessageEvent<{ channels: Float32Array[]; sampleRate: number; kbps: number }>) => {
  const { channels, sampleRate, kbps } = event.data;
  try {
    let last = 0;
    const parts = await encodePcmToMp3(Mp3Encoder as unknown as Mp3EncoderCtor, { sampleRate, channels }, {
      kbps,
      onProgress: (ratio) => {
        if (ratio - last >= 0.02 || ratio === 1) {
          last = ratio;
          scope.postMessage({ type: 'progress', ratio });
        }
      },
    });
    scope.postMessage(
      { type: 'done', parts },
      parts.map((p) => p.buffer as ArrayBuffer),
    );
  } catch (err) {
    scope.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
