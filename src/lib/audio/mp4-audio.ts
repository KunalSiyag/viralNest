/**
 * Minimal MP4 audio demuxer for the in-browser MP3 path.
 *
 * Pinterest serves progressive MP4 (moov + mdat, AAC sound). When a browser's
 * decodeAudioData cannot read the MP4 container itself, these helpers pull the
 * AAC frames out of the audio track so they can be decoded another way: wrapped
 * as an ADTS stream (which decodeAudioData reads almost everywhere) or fed to a
 * WebCodecs AudioDecoder. Pure functions, no DOM, so they run in node tests.
 */

export interface Mp4AudioTrack {
  /** WebCodecs codec string, e.g. mp4a.40.2 for AAC-LC. */
  codec: string;
  /** AudioSpecificConfig bytes from the esds box (WebCodecs `description`). */
  config: Uint8Array;
  /** Audio object type used for ADTS (core AAC type, 1–4). */
  objectType: number;
  /** Sampling frequency index (0–12) of the core AAC stream (ADTS header). */
  frequencyIndex: number;
  /** Core channel configuration (ADTS header). */
  channelConfig: number;
  /** Output rate and channel count (from the sample entry; HE-AAC doubles the core rate). */
  sampleRate: number;
  channels: number;
  timescale: number;
  /** Track duration from mdhd, in seconds. */
  duration: number;
  /** One entry per AAC access unit (views into the source bytes). */
  samples: Uint8Array[];
  /** Presentation time of each sample, in microseconds. */
  timestamps: number[];
}

const SAMPLE_RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

interface Box {
  type: string;
  /** Offset of the payload (after the size/type header). */
  start: number;
  /** Offset just past the box. */
  end: number;
}

function readBoxes(view: DataView, start: number, end: number): Box[] {
  const boxes: Box[] = [];
  let pos = start;
  while (pos + 8 <= end) {
    let size = view.getUint32(pos);
    const type = String.fromCharCode(
      view.getUint8(pos + 4),
      view.getUint8(pos + 5),
      view.getUint8(pos + 6),
      view.getUint8(pos + 7),
    );
    let header = 8;
    if (size === 1) {
      if (pos + 16 > end) break;
      size = Number(view.getBigUint64(pos + 8));
      header = 16;
    } else if (size === 0) {
      size = end - pos;
    }
    if (size < header || pos + size > end) break;
    boxes.push({ type, start: pos + header, end: pos + size });
    pos += size;
  }
  return boxes;
}

function child(view: DataView, box: Box | undefined, type: string): Box | undefined {
  if (!box) return undefined;
  return readBoxes(view, box.start, box.end).find((b) => b.type === type);
}

function path(view: DataView, box: Box | undefined, types: string[]): Box | undefined {
  let cur = box;
  for (const t of types) cur = child(view, cur, t);
  return cur;
}

/** Variable-length size used by MPEG-4 descriptors (1–4 bytes, 7 bits each). */
function readDescriptorLength(bytes: Uint8Array, pos: number): { length: number; next: number } {
  let length = 0;
  let next = pos;
  for (let i = 0; i < 4 && next < bytes.length; i++) {
    const b = bytes[next++];
    length = (length << 7) | (b & 0x7f);
    if (!(b & 0x80)) break;
  }
  return { length, next };
}

/** AudioSpecificConfig from an esds payload (after the full-box header). */
function audioSpecificConfig(bytes: Uint8Array): Uint8Array | null {
  let pos = 0;
  while (pos < bytes.length) {
    const tag = bytes[pos];
    const { length, next } = readDescriptorLength(bytes, pos + 1);
    if (tag === 0x03) {
      // ES_Descriptor: ES_ID(2), flags(1), optional fields, then nested descriptors.
      let p = next + 2;
      const flags = bytes[p++];
      if (flags & 0x80) p += 2;
      if (flags & 0x40) p += 1 + bytes[p];
      if (flags & 0x20) p += 2;
      pos = p;
      continue;
    }
    if (tag === 0x04) {
      // DecoderConfigDescriptor: 13 fixed bytes, then DecoderSpecificInfo.
      pos = next + 13;
      continue;
    }
    if (tag === 0x05) return bytes.subarray(next, next + length);
    pos = next + length;
  }
  return null;
}

class BitReader {
  private bit = 0;
  constructor(private readonly bytes: Uint8Array) {}
  read(n: number): number {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.bytes[this.bit >> 3] ?? 0;
      v = (v << 1) | ((byte >> (7 - (this.bit & 7))) & 1);
      this.bit++;
    }
    return v >>> 0;
  }
}

function parseAsc(asc: Uint8Array) {
  const r = new BitReader(asc);
  const readType = () => {
    const t = r.read(5);
    return t === 31 ? 32 + r.read(6) : t;
  };
  const readFreq = () => {
    const idx = r.read(4);
    return idx === 15 ? { index: -1, rate: r.read(24) } : { index: idx, rate: SAMPLE_RATES[idx] ?? 0 };
  };
  const originalType = readType();
  let objectType = originalType;
  const core = readFreq();
  let outputRate = core.rate;
  const channelConfig = r.read(4);
  if (objectType === 5 || objectType === 29) {
    // Explicit HE-AAC (SBR, + PS for 29): the output rate, then the core AAC type.
    // ADTS carries the core stream; decoders find SBR/PS implicitly.
    outputRate = readFreq().rate;
    objectType = readType();
  }
  return { originalType, objectType, frequencyIndex: core.index, sampleRate: outputRate, channelConfig };
}

/**
 * Find the first audio (soun) track of a progressive MP4 and list its AAC
 * frames. Returns null when there is no audio track, the track is not AAC, or
 * the file is fragmented (moof) and has no sample table.
 */
export function parseMp4Audio(input: ArrayBuffer | Uint8Array): Mp4AudioTrack | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const moov = readBoxes(view, 0, bytes.byteLength).find((b) => b.type === 'moov');
  if (!moov) return null;

  for (const trak of readBoxes(view, moov.start, moov.end).filter((b) => b.type === 'trak')) {
    const mdia = child(view, trak, 'mdia');
    const hdlr = child(view, mdia, 'hdlr');
    if (!hdlr || hdlr.end - hdlr.start < 12) continue;
    const handler = String.fromCharCode(...bytes.subarray(hdlr.start + 8, hdlr.start + 12));
    if (handler !== 'soun') continue;

    const mdhd = child(view, mdia, 'mdhd');
    if (!mdhd) return null;
    const v1 = view.getUint8(mdhd.start) === 1;
    const timescale = view.getUint32(mdhd.start + (v1 ? 20 : 12));
    const rawDuration = v1 ? Number(view.getBigUint64(mdhd.start + 24)) : view.getUint32(mdhd.start + 16);

    const stbl = path(view, mdia, ['minf', 'stbl']);
    const stsd = child(view, stbl, 'stsd');
    if (!stbl || !stsd) return null;
    // stsd: full-box header(4) + entry_count(4), then the first sample entry box.
    const entry = readBoxes(view, stsd.start + 8, stsd.end)[0];
    if (!entry || entry.type !== 'mp4a') return null;
    // AudioSampleEntry: 8 bytes SampleEntry + 20 bytes audio fields (+16/+36 for QuickTime v1/v2).
    const qtVersion = view.getUint16(entry.start + 8);
    const entryChannels = view.getUint16(entry.start + 16);
    const entryRate = view.getUint32(entry.start + 24) >>> 16;
    const childStart = entry.start + 28 + (qtVersion === 1 ? 16 : qtVersion === 2 ? 36 : 0);
    const esds = readBoxes(view, childStart, entry.end).find((b) => b.type === 'esds');
    if (!esds) return null;
    const config = audioSpecificConfig(bytes.subarray(esds.start + 4, esds.end));
    if (!config || config.length < 2) return null;
    const asc = parseAsc(config);
    if (asc.objectType < 1 || asc.objectType > 4 || asc.frequencyIndex < 0 || asc.channelConfig < 1) return null;

    // Sample sizes
    const stsz = child(view, stbl, 'stsz');
    if (!stsz) return null;
    const fixedSize = view.getUint32(stsz.start + 4);
    const count = view.getUint32(stsz.start + 8);
    const sizes: number[] = new Array(count);
    for (let i = 0; i < count; i++) sizes[i] = fixedSize || view.getUint32(stsz.start + 12 + i * 4);

    // Chunk offsets
    const stco = child(view, stbl, 'stco');
    const co64 = child(view, stbl, 'co64');
    const chunkOffsets: number[] = [];
    if (stco) {
      const n = view.getUint32(stco.start + 4);
      for (let i = 0; i < n; i++) chunkOffsets.push(view.getUint32(stco.start + 8 + i * 4));
    } else if (co64) {
      const n = view.getUint32(co64.start + 4);
      for (let i = 0; i < n; i++) chunkOffsets.push(Number(view.getBigUint64(co64.start + 8 + i * 8)));
    } else {
      return null;
    }

    // Samples per chunk (runs of first_chunk, samples_per_chunk, description index)
    const stsc = child(view, stbl, 'stsc');
    if (!stsc) return null;
    const runs: { first: number; perChunk: number }[] = [];
    const runCount = view.getUint32(stsc.start + 4);
    for (let i = 0; i < runCount; i++) {
      const at = stsc.start + 8 + i * 12;
      runs.push({ first: view.getUint32(at), perChunk: view.getUint32(at + 4) });
    }

    const samples: Uint8Array[] = [];
    let sampleIndex = 0;
    for (let chunk = 0; chunk < chunkOffsets.length && sampleIndex < count; chunk++) {
      let perChunk = 0;
      for (const run of runs) if (run.first <= chunk + 1) perChunk = run.perChunk;
      let offset = chunkOffsets[chunk];
      for (let s = 0; s < perChunk && sampleIndex < count; s++) {
        const size = sizes[sampleIndex++];
        if (offset + size > bytes.byteLength) return null;
        samples.push(bytes.subarray(offset, offset + size));
        offset += size;
      }
    }
    if (!samples.length) return null;

    // Timestamps from stts (fall back to 1024 samples per AAC frame).
    const timestamps: number[] = [];
    const stts = child(view, stbl, 'stts');
    let t = 0;
    if (stts) {
      const n = view.getUint32(stts.start + 4);
      for (let i = 0; i < n && timestamps.length < samples.length; i++) {
        const sampleCount = view.getUint32(stts.start + 8 + i * 8);
        const delta = view.getUint32(stts.start + 12 + i * 8);
        for (let k = 0; k < sampleCount && timestamps.length < samples.length; k++) {
          timestamps.push(Math.round((t * 1e6) / timescale));
          t += delta;
        }
      }
    }
    while (timestamps.length < samples.length) {
      timestamps.push(Math.round((t * 1e6) / timescale));
      t += 1024;
    }

    return {
      codec: `mp4a.40.${asc.originalType}`,
      config,
      objectType: asc.objectType,
      frequencyIndex: asc.frequencyIndex,
      channelConfig: asc.channelConfig,
      sampleRate: entryRate || asc.sampleRate,
      channels: entryChannels || (asc.channelConfig === 7 ? 8 : asc.channelConfig),
      timescale,
      duration: timescale ? rawDuration / timescale : 0,
      samples,
      timestamps,
    };
  }
  return null;
}

/** Wrap the track's AAC frames in 7-byte ADTS headers (an .aac stream). */
export function toAdts(track: Mp4AudioTrack): Uint8Array {
  const total = track.samples.reduce((n, s) => n + s.byteLength + 7, 0);
  const out = new Uint8Array(total);
  const profile = (track.objectType - 1) & 0x3;
  let pos = 0;
  for (const frame of track.samples) {
    const len = frame.byteLength + 7;
    out[pos] = 0xff;
    out[pos + 1] = 0xf1; // MPEG-4, layer 0, no CRC
    out[pos + 2] = (profile << 6) | ((track.frequencyIndex & 0xf) << 2) | ((track.channelConfig >> 2) & 0x1);
    out[pos + 3] = ((track.channelConfig & 0x3) << 6) | ((len >> 11) & 0x3);
    out[pos + 4] = (len >> 3) & 0xff;
    out[pos + 5] = ((len & 0x7) << 5) | 0x1f;
    out[pos + 6] = 0xfc;
    out.set(frame, pos + 7);
    pos += len;
  }
  return out;
}

/** true/false when the MP4 has/lacks a sound track; null when there is no readable moov. */
export function mp4HasSound(input: ArrayBuffer | Uint8Array): boolean | null {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const moov = readBoxes(view, 0, bytes.byteLength).find((b) => b.type === 'moov');
  if (!moov) return null;
  return readBoxes(view, moov.start, moov.end)
    .filter((b) => b.type === 'trak')
    .some((trak) => {
      const hdlr = path(view, trak, ['mdia', 'hdlr']);
      return !!hdlr && hdlr.end - hdlr.start >= 12 && String.fromCharCode(...bytes.subarray(hdlr.start + 8, hdlr.start + 12)) === 'soun';
    });
}
