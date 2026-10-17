/**
 * In-browser MP3 building blocks, tested in node:
 * - mp4-audio: demux the AAC track of a progressive MP4, wrap it as ADTS;
 * - mp3-encode: LAME (lamejs) output is a real MPEG-1 Layer III stream with the
 *   promised bitrate and the source duration; the ID3 tag is well formed.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Mp3Encoder } from '@breezystack/lamejs';
import { mp4HasSound, parseMp4Audio, toAdts } from '../src/lib/audio/mp4-audio';
import { MP3_KBPS, encodePcmToMp3, id3Tag, type Mp3EncoderCtor } from '../src/lib/audio/mp3-encode';

// ── Tiny MP4 writer (just enough boxes for the demuxer) ─────────────────────

function box(type: string, ...payload: Uint8Array[]): Uint8Array {
  const size = 8 + payload.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(size);
  new DataView(out.buffer).setUint32(0, size);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  let pos = 8;
  for (const p of payload) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

function u32(...values: number[]): Uint8Array {
  const out = new Uint8Array(values.length * 4);
  values.forEach((v, i) => new DataView(out.buffer).setUint32(i * 4, v));
  return out;
}

function bytes(...values: number[]): Uint8Array {
  return Uint8Array.from(values);
}

const FULL = u32(0); // version 0, flags 0

function hdlr(kind: string) {
  return box('hdlr', FULL, u32(0), bytes(...[...kind].map((c) => c.charCodeAt(0))), u32(0, 0, 0), bytes(0));
}

function mdhd(timescale: number, duration: number) {
  return box('mdhd', FULL, u32(0, 0, timescale, duration), bytes(0x55, 0xc4, 0, 0));
}

function esds(asc: Uint8Array) {
  const dsi = bytes(0x05, asc.length, ...asc);
  const dcd = bytes(0x04, 13 + dsi.length, 0x40, 0x15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...dsi);
  const es = bytes(0x03, 3 + dcd.length + 3, 0, 1, 0, ...dcd, 0x06, 1, 0x02);
  return box('esds', FULL, es);
}

function mp4a(asc: Uint8Array, channels: number, rate: number) {
  const entry = new Uint8Array(28);
  const v = new DataView(entry.buffer);
  v.setUint16(6, 1); // data_reference_index
  v.setUint16(16, channels);
  v.setUint16(18, 16);
  v.setUint32(24, rate * 65536);
  return box('mp4a', entry, esds(asc));
}

/** An MP4 with one audio track: `frames` AAC frames split over two chunks. */
function makeMp4(opts: { asc: Uint8Array; channels: number; rate: number; frames: Uint8Array[]; withVideoOnly?: boolean }) {
  const ftyp = box('ftyp', bytes(0x69, 0x73, 0x6f, 0x6d), u32(0x200));
  const mdatPayload = new Uint8Array(opts.frames.reduce((n, f) => n + f.length, 0));
  let pos = 0;
  for (const f of opts.frames) {
    mdatPayload.set(f, pos);
    pos += f.length;
  }
  const build = (mdatStart: number) => {
    const half = Math.ceil(opts.frames.length / 2);
    const firstChunkBytes = opts.frames.slice(0, half).reduce((n, f) => n + f.length, 0);
    const stbl = box(
      'stbl',
      box('stsd', FULL, u32(1), mp4a(opts.asc, opts.channels, opts.rate)),
      box('stts', FULL, u32(1, opts.frames.length, 1024)),
      box('stsc', FULL, u32(2, 1, half, 1, 2, opts.frames.length - half, 1)),
      box('stsz', FULL, u32(0, opts.frames.length, ...opts.frames.map((f) => f.length))),
      box('stco', FULL, u32(2, mdatStart, mdatStart + firstChunkBytes)),
    );
    const soundTrak = box(
      'trak',
      box('mdia', mdhd(opts.rate, opts.frames.length * 1024), hdlr('soun'), box('minf', stbl)),
    );
    const videoTrak = box('trak', box('mdia', mdhd(15360, 15360), hdlr('vide'), box('minf', box('stbl'))));
    return box('moov', videoTrak, ...(opts.withVideoOnly ? [] : [soundTrak]));
  };
  // moov size does not depend on the offsets it stores, so measure then place mdat after it.
  const moovLen = build(0).length;
  const mdatStart = ftyp.length + moovLen + 8;
  const moov = build(mdatStart);
  const file = new Uint8Array(ftyp.length + moov.length + 8 + mdatPayload.length);
  file.set(ftyp, 0);
  file.set(moov, ftyp.length);
  file.set(box('mdat', mdatPayload), ftyp.length + moov.length);
  return file;
}

const LC_STEREO_44K = bytes(0x12, 0x10); // AAC-LC, 44.1 kHz, 2 channels
const HE_AAC_V2 = bytes(0xeb, 0x8a, 0x08, 0x00); // the config of a real Pinterest video pin (PS, 22.05 kHz core, mono core)

const frames = Array.from({ length: 9 }, (_, i) => Uint8Array.from({ length: 20 + i * 3 }, (_, k) => (i * 31 + k) & 0xff));

describe('mp4-audio: demux the AAC track', () => {
  it('lists every AAC frame across chunks with its bytes and timestamps', () => {
    const track = parseMp4Audio(makeMp4({ asc: LC_STEREO_44K, channels: 2, rate: 44100, frames }));
    assert.ok(track);
    assert.equal(track.codec, 'mp4a.40.2');
    assert.equal(track.objectType, 2);
    assert.equal(track.frequencyIndex, 4);
    assert.equal(track.channelConfig, 2);
    assert.equal(track.sampleRate, 44100);
    assert.equal(track.channels, 2);
    assert.equal(track.samples.length, frames.length);
    track.samples.forEach((s, i) => assert.deepEqual([...s], [...frames[i]], `frame ${i}`));
    assert.equal(track.timestamps[1], Math.round((1024 * 1e6) / 44100));
    assert.ok(Math.abs(track.duration - (frames.length * 1024) / 44100) < 1e-9);
  });

  it('reads explicit HE-AAC v2 (as Pinterest serves it): core LC at 22.05 kHz for ADTS, 44.1 kHz stereo out', () => {
    const track = parseMp4Audio(makeMp4({ asc: HE_AAC_V2, channels: 2, rate: 44100, frames }));
    assert.ok(track);
    assert.equal(track.codec, 'mp4a.40.29');
    assert.equal(track.objectType, 2);
    assert.equal(track.frequencyIndex, 7);
    assert.equal(track.channelConfig, 1);
    assert.equal(track.sampleRate, 44100);
    assert.equal(track.channels, 2);
  });

  it('wraps frames as ADTS with correct sync, profile, rate, channels and lengths', () => {
    const track = parseMp4Audio(makeMp4({ asc: LC_STEREO_44K, channels: 2, rate: 44100, frames }))!;
    const adts = toAdts(track);
    let pos = 0;
    let n = 0;
    while (pos < adts.length) {
      assert.equal(adts[pos], 0xff);
      assert.equal(adts[pos + 1] & 0xf6, 0xf0, 'sync + layer 0');
      assert.equal(adts[pos + 1] & 1, 1, 'no CRC');
      assert.equal(adts[pos + 2] >> 6, 1, 'profile = LC (object type 2 − 1)');
      assert.equal((adts[pos + 2] >> 2) & 0xf, 4, '44.1 kHz index');
      const chan = ((adts[pos + 2] & 1) << 2) | (adts[pos + 3] >> 6);
      assert.equal(chan, 2);
      const len = ((adts[pos + 3] & 3) << 11) | (adts[pos + 4] << 3) | (adts[pos + 5] >> 5);
      assert.equal(len, frames[n].length + 7);
      assert.deepEqual([...adts.subarray(pos + 7, pos + len)], [...frames[n]]);
      pos += len;
      n++;
    }
    assert.equal(n, frames.length);
  });

  it('tells a silent (video-only) MP4 apart from one it cannot read', () => {
    const silent = makeMp4({ asc: LC_STEREO_44K, channels: 2, rate: 44100, frames, withVideoOnly: true });
    assert.equal(mp4HasSound(silent), false);
    assert.equal(parseMp4Audio(silent), null);
    assert.equal(mp4HasSound(makeMp4({ asc: LC_STEREO_44K, channels: 2, rate: 44100, frames })), true);
    assert.equal(mp4HasSound(bytes(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)), null);
    assert.equal(parseMp4Audio(new Uint8Array(0)), null);
  });
});

// ── MP3 output ──────────────────────────────────────────────────────────────

const MPEG1_L3_KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const MPEG1_RATES = [44100, 48000, 32000];

/** Skip an ID3v2 tag, then walk MPEG audio frame headers. */
function parseMp3(buf: Uint8Array) {
  let pos = 0;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    pos = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  }
  const frames: { kbps: number; rate: number; mono: boolean; len: number }[] = [];
  while (pos + 4 <= buf.length) {
    const h = (buf[pos] << 24) | (buf[pos + 1] << 16) | (buf[pos + 2] << 8) | buf[pos + 3];
    assert.equal(h >>> 21, 0x7ff, `frame sync at byte ${pos}`);
    assert.equal((h >>> 19) & 3, 3, 'MPEG-1');
    assert.equal((h >>> 17) & 3, 1, 'Layer III');
    const kbps = MPEG1_L3_KBPS[(h >>> 12) & 0xf];
    const rate = MPEG1_RATES[(h >>> 10) & 3];
    const padding = (h >>> 9) & 1;
    const len = Math.floor((144000 * kbps) / rate) + padding;
    frames.push({ kbps, rate, mono: ((h >>> 6) & 3) === 3, len });
    pos += len;
  }
  assert.equal(pos, buf.length, 'frames end exactly at the end of the file');
  return frames;
}

function sine(seconds: number, rate: number, hz: number, phase = 0) {
  const out = new Float32Array(Math.round(seconds * rate));
  for (let i = 0; i < out.length; i++) out[i] = 0.5 * Math.sin(phase + (2 * Math.PI * hz * i) / rate);
  return out;
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

describe('mp3-encode: LAME output is a real MP3', () => {
  it(`stereo 44.1 kHz → MPEG-1 Layer III at ${MP3_KBPS} kbps, duration within one frame pair`, async () => {
    const seconds = 3.2;
    const progress: number[] = [];
    const parts = await encodePcmToMp3(
      Mp3Encoder as unknown as Mp3EncoderCtor,
      { sampleRate: 44100, channels: [sine(seconds, 44100, 440), sine(seconds, 44100, 660)] },
      { onProgress: (r) => progress.push(r) },
    );
    const file = concat([id3Tag('Hosting season ♥️'), ...parts]);
    const parsed = parseMp3(file);
    assert.ok(parsed.length > 100);
    assert.ok(parsed.every((f) => f.kbps === MP3_KBPS && f.rate === 44100 && !f.mono));
    const duration = (parsed.length * 1152) / 44100;
    // LAME adds encoder delay + padding (< 3 frames); the parity rule elsewhere is ±1 s.
    assert.ok(duration >= seconds && duration - seconds < 0.1, `duration ${duration}`);
    assert.equal(progress.at(-1), 1);
    assert.ok(progress.every((r, i) => i === 0 || r >= progress[i - 1]), 'progress only moves forward');
  });

  it('mono 48 kHz stays mono at 48 kHz', async () => {
    const parts = await encodePcmToMp3(Mp3Encoder as unknown as Mp3EncoderCtor, { sampleRate: 48000, channels: [sine(1, 48000, 220)] });
    const parsed = parseMp3(concat(parts));
    assert.ok(parsed.length > 30);
    assert.ok(parsed.every((f) => f.rate === 48000 && f.mono && f.kbps === MP3_KBPS));
  });

  it('refuses rates an MP3 cannot carry instead of writing a broken file', async () => {
    await assert.rejects(
      encodePcmToMp3(Mp3Encoder as unknown as Mp3EncoderCtor, { sampleRate: 22050, channels: [sine(0.1, 22050, 220)] }),
      /32, 44\.1 or 48 kHz/,
    );
  });

  it('ID3v2.3 tag: header, syncsafe size, UTF-16 title', () => {
    const tag = id3Tag('Café ♥ test');
    assert.deepEqual([...tag.subarray(0, 5)], [0x49, 0x44, 0x33, 3, 0]);
    const size = (tag[6] << 21) | (tag[7] << 14) | (tag[8] << 7) | tag[9];
    assert.equal(size, tag.length - 10);
    assert.ok([6, 7, 8, 9].every((i) => tag[i] < 0x80));
    assert.equal(String.fromCharCode(...tag.subarray(10, 14)), 'TIT2');
    const frameSize = new DataView(tag.buffer).getUint32(14);
    const text = tag.subarray(20 + 3, 20 + frameSize - 2);
    const decoded = new TextDecoder('utf-16le').decode(text);
    assert.equal(decoded, 'Café ♥ test');
  });
});
