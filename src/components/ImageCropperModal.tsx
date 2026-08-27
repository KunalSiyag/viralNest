import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crop, Download, X, Check, RefreshCw } from 'lucide-react';
import { toDownloadablePinUrl } from '../lib/pin-media';

export interface ImageCropperModalProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

type AspectRatioPreset = 'original' | '1:1' | '9:16' | '4:5' | '16:9';

const PRESETS: { key: AspectRatioPreset; label: string; ratio: number | null; icon: string }[] = [
  { key: 'original', label: 'Original', ratio: null, icon: '📐' },
  { key: '1:1', label: '1:1 Square (IG Post)', ratio: 1 / 1, icon: '🟦' },
  { key: '9:16', label: '9:16 Story/Reel (TikTok)', ratio: 9 / 16, icon: '📱' },
  { key: '4:5', label: '4:5 Portrait (IG)', ratio: 4 / 5, icon: '🖼️' },
  { key: '16:9', label: '16:9 Landscape (YT)', ratio: 16 / 9, icon: '📺' },
];

export default function ImageCropperModal({ imageUrl, title, onClose }: ImageCropperModalProps) {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioPreset>('original');
  const [processing, setProcessing] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const loadProxyImage = async () => {
      try {
        const proxyUrl = `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(imageUrl))}`;
        const res = await fetch(proxyUrl);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          if (!isCancelled) {
            imgRef.current = img;
            renderCroppedPreview(img, 'original');
          }
        };
        img.src = objectUrl;
      } catch (err) {
        console.warn('Proxy image fetch error:', err);
      }
    };
    loadProxyImage();
    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  const renderCroppedPreview = (img: HTMLImageElement, preset: AspectRatioPreset) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetW = img.naturalWidth;
    let targetH = img.naturalHeight;
    let srcX = 0;
    let srcY = 0;
    let srcW = img.naturalWidth;
    let srcH = img.naturalHeight;

    const presetObj = PRESETS.find((p) => p.key === preset);
    if (presetObj && presetObj.ratio !== null) {
      const targetAspect = presetObj.ratio;
      const currentAspect = img.naturalWidth / img.naturalHeight;

      if (currentAspect > targetAspect) {
        // Image is wider than target aspect ratio -> Crop sides
        srcW = img.naturalHeight * targetAspect;
        srcX = (img.naturalWidth - srcW) / 2;
      } else {
        // Image is taller than target aspect ratio -> Crop top/bottom
        srcH = img.naturalWidth / targetAspect;
        srcY = (img.naturalHeight - srcH) / 2;
      }
      targetW = Math.round(srcW);
      targetH = Math.round(srcH);
    }

    canvas.width = targetW;
    canvas.height = targetH;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
    setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.95));
  };

  const handleSelectPreset = (preset: AspectRatioPreset) => {
    setSelectedRatio(preset);
    if (imgRef.current) {
      renderCroppedPreview(imgRef.current, preset);
    }
  };

  const handleDownload = () => {
    if (!previewDataUrl) return;
    setProcessing(true);

    const safeTitle = title.replace(/[^a-z0-9]+/gi, '_').toLowerCase().slice(0, 50) || 'pinterest';
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `${safeTitle}_${selectedRatio.replace(':', 'x')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setProcessing(false);
      onClose();
    }, 500);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl flex flex-col gap-5 text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#E11D48]" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Aspect-Ratio Cropper &amp; Resizer
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

        {/* Preset Selector Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Social Media Aspect Ratio
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleSelectPreset(p.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all touch-manipulation ${
                  selectedRatio === p.key
                    ? 'bg-[#E11D48] text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {selectedRatio === p.key && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="relative aspect-auto max-h-72 flex items-center justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800 overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />
          {previewDataUrl ? (
            <img
              src={previewDataUrl}
              alt="Cropped Preview"
              className="max-h-64 max-w-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-[#E11D48]" />
              <span>Processing image canvas…</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!previewDataUrl || processing}
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Cropped ({selectedRatio.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
