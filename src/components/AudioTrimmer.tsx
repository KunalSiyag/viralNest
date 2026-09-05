import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Music, Play, Pause, Download, Scissors, RefreshCw, X } from 'lucide-react';
import { toDownloadablePinUrl } from '../lib/pin-media';

export interface AudioTrimmerProps {
  audioUrl: string;
  title: string;
  onClose: () => void;
}

export default function AudioTrimmer({ audioUrl, title, onClose }: AudioTrimmerProps) {
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load and decode audio buffer for waveform rendering & client-side slicing
  useEffect(() => {
    let isCancelled = false;
    const fetchAudio = async () => {
      try {
        const proxyUrl = `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(audioUrl))}`;
        const res = await fetch(proxyUrl);
        const arrayBuffer = await res.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        if (!isCancelled) {
          setAudioBuffer(decoded);
          setDuration(decoded.duration);
          setEndTime(Math.min(15, decoded.duration));
          drawWaveform(decoded);
        }
      } catch (err) {
        console.warn('Audio decoding failed:', err);
      }
    };
    fetchAudio();
    return () => {
      isCancelled = true;
    };
  }, [audioUrl]);

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const rawData = buffer.getChannelData(0);
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
      ctx.fillStyle = '#E11D48';
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

  const downloadTrimmedAudio = async () => {
    if (!audioBuffer) return;
    setProcessing(true);

    try {
      const sampleRate = audioBuffer.sampleRate;
      const startOffset = Math.floor(startTime * sampleRate);
      const endOffset = Math.floor(endTime * sampleRate);
      const frameCount = endOffset - startOffset;

      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate,
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0, startTime, endTime - startTime);

      const renderedBuffer = await offlineCtx.startRendering();

      // Encode offline buffer into WAV blob
      const wavBlob = audioBufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      const safeTitle = title.replace(/[^a-z0-9]+/gi, '_').toLowerCase().slice(0, 50) || 'audio_clip';

      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeTitle}_trimmed.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Trim audio failed:', e);
    } finally {
      setProcessing(false);
      onClose();
    }
  };

  // Convert AudioBuffer to WAV PCM Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    let channels: Float32Array[] = [];
    let sampleRate = buffer.sampleRate;
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

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (offset < buffer.length) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-5 text-left">
        <audio ref={audioRef} src={audioUrl} onTimeUpdate={handleTimeUpdate} className="hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#E11D48]" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Audio Hook Trimmer &amp; Sound Saver
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
          {!audioBuffer && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 text-slate-400 text-xs font-semibold gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#E11D48]" />
              <span>Decoding audio waveform…</span>
            </div>
          )}
        </div>

        {/* Start & End Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="audio-trim-start-time" className="block text-xs font-bold text-slate-500 mb-1">
              Start Time: <span className="text-[#E11D48] font-mono">{startTime.toFixed(1)}s</span>
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
              aria-label="Audio trim start time in seconds"
              className="w-full accent-[#E11D48]"
            />
          </div>

          <div>
            <label htmlFor="audio-trim-end-time" className="block text-xs font-bold text-slate-500 mb-1">
              End Time: <span className="text-[#E11D48] font-mono">{endTime.toFixed(1)}s</span>
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
              aria-label="Audio trim end time in seconds"
              className="w-full accent-[#E11D48]"
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>Clip Length: <strong className="text-slate-900 dark:text-white font-mono">{(endTime - startTime).toFixed(1)} sec</strong></span>
          <button
            type="button"
            onClick={handlePlayPreview}
            className="px-3.5 py-1.5 rounded-lg bg-[#E11D48] text-white font-bold flex items-center gap-1.5 shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Listen Clip'}</span>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!audioBuffer || processing}
            onClick={downloadTrimmedAudio}
            className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Trimmed Audio (WAV)</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
