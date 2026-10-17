import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Music, Play, Pause, Download, Scissors, RefreshCw, X } from 'lucide-react';
import { toDownloadablePinUrl } from '../lib/pin-media';
import { MP3_KBPS } from '../lib/audio/mp3-constants';
import { EN_ISLAND } from '../i18n/island/en';
import type { IslandMessages } from '../i18n/island/types';
import { fmt, fmtParts, numberFormatter } from '../i18n/island/fmt';
import { mp3ErrorCode } from '../i18n/island/errors';

export interface AudioTrimmerProps {
  audioUrl: string;
  title: string;
  onClose: () => void;
  /** Localized pages only (DownloaderForm passes its catalog's trimmer and MP3 texts). */
  messages?: Pick<IslandMessages, 'trimmer' | 'mp3'>;
  /** Localized pages only: BCP 47 tag for numbers. English keeps toFixed(). */
  lang?: string;
}

type Decoded = { sampleRate: number; channels: Float32Array[]; duration: number };

/** Message nodes: text with `{token}` values (strings or elements) in place. */
function nodes(parts: (string | React.ReactNode)[]): React.ReactNode {
  return React.createElement(React.Fragment, null, ...parts);
}

export default function AudioTrimmer({ audioUrl, title, onClose, messages, lang }: AudioTrimmerProps) {
  const t = messages?.trimmer ?? EN_ISLAND.trimmer;
  const mp3Text = messages?.mp3 ?? EN_ISLAND.mp3;
  const oneDecimal = numberFormatter(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false });
  const sec = (n: number) => (lang ? oneDecimal(n) : n.toFixed(1));
  const int = numberFormatter(lang, { maximumFractionDigits: 0, useGrouping: false });
  const whole = (n: number) => (lang ? int(n) : String(n));
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState<null | 'mp3' | 'wav'>(null);
  const [encodePct, setEncodePct] = useState(0);
  const [audio, setAudio] = useState<Decoded | null>(null);
  const [loadError, setLoadError] = useState('');
  const [exportError, setExportError] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch the video through our proxy and decode its sound in this browser
  // (lib/audio tries Web Audio, then the AAC frames as ADTS, then WebCodecs).
  useEffect(() => {
    let isCancelled = false;
    const fetchAudio = async () => {
      try {
        const proxyUrl = `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(audioUrl))}`;
        const [res, lib] = await Promise.all([fetch(proxyUrl), import('../lib/audio/to-mp3')]);
        if (!res.ok) throw new Error('fetch failed');
        try {
          const decoded = await lib.decodeVideoAudio(await res.arrayBuffer());
          if (!isCancelled) {
            setAudio(decoded);
            setDuration(decoded.duration);
            setEndTime(Math.min(15, decoded.duration));
            drawWaveform(decoded.channels[0]);
          }
        } catch (err) {
          if (!isCancelled) setLoadError(mp3Text[mp3ErrorCode(err) ?? 'failed']);
        }
      } catch (err) {
        console.warn('Audio decoding failed:', err);
        if (!isCancelled) setLoadError(t.loadFailed);
      }
    };
    fetchAudio();
    return () => {
      isCancelled = true;
    };
  }, [audioUrl]);

  const drawWaveform = (rawData: Float32Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const samples = 150;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData: number[] = [];

    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }

    ctx.clearRect(0, 0, width, height);
    const barWidth = width / samples;

    filteredData.forEach((val, i) => {
      const barHeight = val * height * 1.5;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      ctx.fillStyle = '#C8281A';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  };

  const handlePlayPreview = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.currentTime >= endTime) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const clip = (): { sampleRate: number; channels: Float32Array[] } | null => {
    if (!audio) return null;
    const from = Math.max(0, Math.floor(startTime * audio.sampleRate));
    const to = Math.min(audio.channels[0].length, Math.floor(endTime * audio.sampleRate));
    if (to <= from) return null;
    return { sampleRate: audio.sampleRate, channels: audio.channels.map((c) => c.subarray(from, to)) };
  };

  const saveBlob = (blob: Blob, ext: 'mp3' | 'wav') => {
    const url = URL.createObjectURL(blob);
    const safeTitle = title.replace(/[^a-z0-9]+/gi, '_').toLowerCase().slice(0, 50) || 'audio_clip';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}_clip.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadClip = async (format: 'mp3' | 'wav') => {
    const pcm = clip();
    if (!pcm || processing) return;
    setProcessing(format);
    setEncodePct(0);
    setExportError('');
    try {
      if (format === 'wav') {
        saveBlob(pcmToWav(pcm), 'wav');
      } else {
        const { pcmToMp3Blob } = await import('../lib/audio/to-mp3');
        saveBlob(await pcmToMp3Blob(pcm, { title, onProgress: (r) => setEncodePct(Math.round(r * 100)) }), 'mp3');
      }
      onClose();
    } catch (e) {
      console.warn('Trim audio failed:', e);
      setExportError(fmt(t.exportFailed, { format: format.toUpperCase() }));
    } finally {
      setProcessing(null);
    }
  };

  // 16-bit PCM WAV from the clip's channels
  const pcmToWav = (pcm: { sampleRate: number; channels: Float32Array[] }): Blob => {
    const numOfChan = pcm.channels.length;
    const frames = pcm.channels[0].length;
    const length = frames * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels = pcm.channels;
    const sampleRate = pcm.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // length
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    while (offset < frames) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: 'audio/wav' });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-5 text-start">
        <audio ref={audioRef} src={audioUrl} onTimeUpdate={handleTimeUpdate} className="hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#C8281A]" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Waveform canvas */}
        <div className="relative bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
          <canvas ref={canvasRef} width={500} height={80} className="w-full h-20 rounded" />
          {!audio && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 text-slate-400 text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin motion-reduce:animate-none text-[#C8281A]" aria-hidden="true" />
              <span>{t.reading}</span>
            </div>
          )}
          {loadError && (
            <div role="alert" className="absolute inset-0 flex items-center justify-center bg-slate-950/90 text-slate-200 text-xs font-semibold px-4 text-center">
              <span>{loadError}</span>
            </div>
          )}
        </div>

        {/* Start & End Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="audio-trim-start-time" className="block text-xs font-bold text-slate-500 mb-1">
              {nodes(fmtParts(t.start, { time: <span className="text-[#C8281A] font-mono">{nodes(fmtParts(t.seconds, { n: sec(startTime) }))}</span> }))}
            </label>
            <input
              id="audio-trim-start-time"
              name="startTime"
              type="range"
              min={0}
              max={Math.max(0, endTime - 0.5)}
              step={0.1}
              value={startTime}
              onChange={(e) => setStartTime(parseFloat(e.target.value))}
              aria-label={t.startAria}
              className="w-full accent-[#C8281A]"
            />
          </div>

          <div>
            <label htmlFor="audio-trim-end-time" className="block text-xs font-bold text-slate-500 mb-1">
              {nodes(fmtParts(t.end, { time: <span className="text-[#C8281A] font-mono">{nodes(fmtParts(t.seconds, { n: sec(endTime) }))}</span> }))}
            </label>
            <input
              id="audio-trim-end-time"
              name="endTime"
              type="range"
              min={startTime + 0.5}
              max={duration || 60}
              step={0.1}
              value={endTime}
              onChange={(e) => setEndTime(parseFloat(e.target.value))}
              aria-label={t.endAria}
              className="w-full accent-[#C8281A]"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>
            {nodes(
              fmtParts(t.length, {
                len: (
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {nodes(fmtParts(t.lengthValue, { n: sec(endTime - startTime) }))}
                  </strong>
                ),
              }),
            )}
          </span>
          <button
            type="button"
            onClick={handlePlayPreview}
            className="px-3.5 py-1.5 rounded-lg bg-[#C8281A] text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? t.pause : t.listen}</span>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={!audio || !!processing}
            onClick={() => void downloadClip('wav')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
          >
            {processing === 'wav' ? <RefreshCw className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
            <span>{t.wav}</span>
          </button>
          <button
            type="button"
            disabled={!audio || !!processing}
            onClick={() => void downloadClip('mp3')}
            aria-busy={processing === 'mp3'}
            className="px-6 py-2.5 rounded-xl bg-[#C8281A] hover:bg-[#A51F13] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
          >
            {processing === 'mp3' ? <RefreshCw className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
            <span>{nodes(fmtParts(t.mp3, { kbps: whole(MP3_KBPS) }))}</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-end -mt-2" aria-live="polite">
          {exportError ? (
            <span role="alert" className="text-[#A51F13] dark:text-red-300 font-semibold">{exportError}</span>
          ) : processing === 'mp3' ? (
            fmt(t.making, { pct: whole(encodePct) })
          ) : (
            t.note
          )}
        </p>
      </div>
    </div>,
    document.body
  );
}
