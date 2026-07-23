import { useState, useEffect } from 'react';
import { Loader2, Download, AlertCircle, Image as ImageIcon, Copy, Check, Tag, Clipboard, Play, Layers, History, Palette, Music, Sparkles, Archive, User } from 'lucide-react';
import JSZip from 'jszip';

interface BoardPinItem {
  pin_id: string;
  url: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  video_url?: string | null;
  is_video: boolean;
}

interface MediaItem {
  index: number;
  type: 'image' | 'video';
  url: string;
  thumbnail_url?: string;
  title?: string;
}

interface ExtractionResult {
  platform: string;
  video_url: string | null;
  thumbnail_url?: string;
  image_url?: string;
  title: string;
  description?: string;
  qualities?: { label: string; url: string; width?: number; height?: number }[];
  tags?: string[];
  colors?: string[];
  dominant_color?: string;
  is_video: boolean;
  is_board?: boolean;
  is_profile?: boolean;
  is_carousel?: boolean;
  media_count?: number;
  media_items?: MediaItem[];
  pin_id?: string;
  board_title?: string;
  board_url?: string;
  profile_title?: string;
  profile_url?: string;
  username?: string | null;
  pin_count?: number;
  pins?: BoardPinItem[];
}

interface HistoryItem {
  title: string;
  thumbnail?: string;
  url: string;
  timestamp: number;
}

/** Intent-specific form surface for SEO tool pages */
export type FormVariant = 'hub' | 'pin' | 'video' | 'image' | 'board' | 'profile';

const VARIANT_COPY: Record<
  FormVariant,
  {
    worksLabel: string;
    singleTab: string;
    showBatch: boolean;
    placeholder: string;
    ariaLabel: string;
    submitLabel: string;
    hint: string;
  }
> = {
  hub: {
    worksLabel: 'Works with',
    singleTab: 'Pin / Board / Profile',
    showBatch: true,
    placeholder: 'Pin, board, or profile URL… e.g. pinterest.com/user/board-name/',
    ariaLabel: 'Pinterest Pin, board, or profile link',
    submitLabel: 'Extract Media',
    hint: 'Board or profile links list public pins — then use Download ZIP. Pin links download one file or full carousel.',
  },
  pin: {
    worksLabel: 'Best for',
    singleTab: 'Single Pin URL',
    showBatch: true,
    placeholder: 'Paste pin URL… https://pinterest.com/pin/… or pin.it/…',
    ariaLabel: 'Pinterest pin link',
    submitLabel: 'Download Pin',
    hint: 'Supports image pins, video pins, GIFs, and multi-image carousels (all slides).',
  },
  video: {
    worksLabel: 'Best for',
    singleTab: 'Video Pin URL',
    showBatch: true,
    placeholder: 'Paste video pin URL… https://pinterest.com/pin/… or pin.it/…',
    ariaLabel: 'Pinterest video pin link',
    submitLabel: 'Download Video',
    hint: 'Extracts HD MP4 (and optional MP3 audio) from public video pins and Idea Pins.',
  },
  image: {
    worksLabel: 'Best for',
    singleTab: 'Image Pin URL',
    showBatch: true,
    placeholder: 'Paste image pin URL… https://pinterest.com/pin/…',
    ariaLabel: 'Pinterest image pin link',
    submitLabel: 'Download Image',
    hint: 'Saves original-resolution photos and artwork. Carousels return every slide.',
  },
  board: {
    worksLabel: 'Best for',
    singleTab: 'Board URL',
    showBatch: false,
    placeholder: 'Paste board URL… https://pinterest.com/username/board-name/',
    ariaLabel: 'Pinterest board link',
    submitLabel: 'Extract Board Pins',
    hint: 'Paste a public board link to list pins, then Download ZIP for the full pack.',
  },
  profile: {
    worksLabel: 'Best for',
    singleTab: 'Profile URL',
    showBatch: false,
    placeholder: 'Paste profile URL… https://pinterest.com/username/',
    ariaLabel: 'Pinterest profile link',
    submitLabel: 'Extract Profile Pins',
    hint: 'Paste a public profile link to list visible pins, then Download ZIP.',
  },
};

export default function DownloaderForm({ variant = 'hub' }: { variant?: FormVariant }) {
  const copy = VARIANT_COPY[variant] || VARIANT_COPY.hub;
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [url, setUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [batchResults, setBatchResults] = useState<ExtractionResult[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'reels' | 'tiktok' | 'shorts'>('reels');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState({ done: 0, total: 0 });

  // Load download history from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pintdownload_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage access failed:', e);
    }
  }, []);

  const saveToHistory = (item: ExtractionResult, pinUrl: string) => {
    try {
      const newItem: HistoryItem = {
        title:
          item.title ||
          item.profile_title ||
          item.board_title ||
          (item.is_profile ? 'Pinterest Profile' : item.is_board ? 'Pinterest Board' : 'Pinterest Pin'),
        thumbnail:
          item.thumbnail_url ||
          item.image_url ||
          item.pins?.[0]?.thumbnail_url ||
          item.pins?.[0]?.image_url,
        url: pinUrl,
        timestamp: Date.now()
      };
      const updated = [newItem, ...history.filter(h => h.url !== pinUrl)].slice(0, 4);
      setHistory(updated);
      localStorage.setItem('pintdownload_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('History save error:', e);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (mode === 'single') setUrl(text.trim());
        else setBatchUrls(prev => prev ? `${prev}\n${text.trim()}` : text.trim());
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'single' && !url.trim()) return;
    if (mode === 'batch' && !batchUrls.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setBatchResults([]);
    setCopiedTags(false);
    setShowPlayer(false);

    if (mode === 'single') {
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to extract media from Pinterest.');

        setResult(data);
        if (data.video_url) setSelectedQuality(data.video_url);
        saveToHistory(data, url.trim());
      } catch (err: any) {
        setError(err.message || 'An error occurred. Check the Pinterest URL.');
      } finally {
        setLoading(false);
      }
    } else {
      // Robust multi-delimiter batch mode parsing (newlines, commas, spaces)
      const links = Array.from(new Set(
        batchUrls
          .split(/[\n,\s]+/)
          .map(l => l.trim())
          .filter(l => l.length > 5 && (l.includes('pinterest.com') || l.includes('pin.it')))
      )).slice(0, 10);

      if (links.length === 0) {
        setError('Please enter valid Pinterest URLs (e.g., https://pinterest.com/pin/... or https://pin.it/...)');
        setLoading(false);
        return;
      }

      const results: ExtractionResult[] = [];
      let failCount = 0;

      for (const link of links) {
        try {
          const res = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link })
          });
          const data = await res.json();
          if (res.ok) {
            if ((data.is_board || data.is_profile) && data.pins) {
              results.push(
                ...data.pins.map((p: any) => ({
                  platform: 'pinterest',
                  title: p.title,
                  image_url: p.image_url,
                  thumbnail_url: p.thumbnail_url,
                  is_video: !!p.is_video,
                  video_url: p.video_url || null,
                })),
              );
            } else {
              results.push(data);
            }
            saveToHistory(data, link);
          } else {
            failCount++;
          }
        } catch (e) {
          failCount++;
        }
      }

      if (results.length > 0) {
        setBatchResults(results);
      } else {
        setError('Failed to extract batch links. Please check if the Pinterest URLs are public.');
      }
      setLoading(false);
    }
  };

  const copyTagsToClipboard = () => {
    if (!result?.tags?.length) return;
    const tagText = result.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
    navigator.clipboard.writeText(tagText);
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  const copyColorHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const samplePalette = ['#E11D48', '#2D3748', '#ED8936', '#319795', '#D69E2E'];

  const slugify = (value: string) =>
    value
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
      .slice(0, 60) || 'pinterest';

  const downloadUrlsAsZip = async (
    entries: { url: string; filename: string }[],
    archiveName: string,
  ) => {
    if (!entries.length || zipping) return;
    setZipping(true);
    setZipProgress({ done: 0, total: entries.length });
    setError('');

    try {
      const zip = new JSZip();
      const folderName = slugify(archiveName);
      const folder = zip.folder(folderName) || zip;
      let done = 0;
      let packed = 0;
      let failed = 0;

      const concurrency = 4;
      for (let i = 0; i < entries.length; i += concurrency) {
        const batch = entries.slice(i, i + concurrency);
        await Promise.all(
          batch.map(async (entry) => {
            try {
              const res = await fetch(
                `/api/download?url=${encodeURIComponent(entry.url)}&filename=${encodeURIComponent(entry.filename)}`,
              );
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const blob = await res.blob();
              folder.file(entry.filename, blob);
              packed++;
            } catch (e) {
              console.warn('ZIP item failed:', entry.filename, e);
              failed++;
            } finally {
              done++;
              setZipProgress({ done, total: entries.length });
            }
          }),
        );
      }

      if (packed === 0) {
        throw new Error('Could not pack any media into the ZIP. Files may be unavailable.');
      }

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const objectUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${slugify(archiveName)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      if (failed > 0) {
        setError(`ZIP ready with ${entries.length - failed} of ${entries.length} files (${failed} failed).`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create ZIP archive.');
    } finally {
      setZipping(false);
      setZipProgress({ done: 0, total: 0 });
    }
  };

  const downloadCollectionAsZip = async (pins: BoardPinItem[], archiveName: string) => {
    const entries = pins
      .map((pin, idx) => {
        const mediaUrl = pin.is_video && pin.video_url ? pin.video_url : pin.image_url;
        if (!mediaUrl) return null;
        const ext = pin.is_video && pin.video_url ? 'mp4' : 'jpg';
        return {
          url: mediaUrl,
          filename: `${String(idx + 1).padStart(2, '0')}_${slugify(pin.title || pin.pin_id)}.${ext}`,
        };
      })
      .filter((e): e is { url: string; filename: string } => !!e);
    return downloadUrlsAsZip(entries, archiveName);
  };

  const downloadCarouselAsZip = async (items: MediaItem[], archiveName: string) => {
    const entries = items.map((item, idx) => ({
      url: item.url,
      filename: `${String(idx + 1).padStart(2, '0')}_slide_${slugify(item.title || String(idx + 1))}.${item.type === 'video' ? 'mp4' : 'jpg'}`,
    }));
    return downloadUrlsAsZip(entries, archiveName);
  };

  const isCollection = !!(result && (result.is_board || result.is_profile) && result.pins?.length);
  const isCarousel = !!(
    result &&
    !result.is_board &&
    !result.is_profile &&
    ((result.media_items && result.media_items.length > 1) || result.is_carousel)
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      {/* Intent chips — page-specific for SEO tool separation */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {copy.worksLabel}
        </span>
        {(variant === 'hub' || variant === 'pin' || variant === 'video' || variant === 'image') && (
          <a
            href="/pinterest-pin-downloader"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors touch-manipulation ${
              variant === 'pin'
                ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/40 text-[#E11D48] font-extrabold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#E11D48]'
            }`}
          >
            Pin
          </a>
        )}
        {(variant === 'hub' || variant === 'video') && (
          <a
            href="/pinterest-video-downloader"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors touch-manipulation ${
              variant === 'video'
                ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/40 text-[#E11D48] font-extrabold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#E11D48]'
            }`}
          >
            Video MP4
          </a>
        )}
        {(variant === 'hub' || variant === 'image') && (
          <a
            href="/pinterest-image-downloader"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors touch-manipulation ${
              variant === 'image'
                ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/40 text-[#E11D48] font-extrabold'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#E11D48]'
            }`}
          >
            HD Image
          </a>
        )}
        <a
          href="/pinterest-board-downloader"
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-extrabold transition-colors touch-manipulation ${
            variant === 'board'
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/40 text-[#E11D48]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#E11D48]'
          }`}
        >
          <Archive className="w-3 h-3" aria-hidden />
          Board → ZIP
        </a>
        <a
          href="/pinterest-profile-downloader"
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-extrabold transition-colors touch-manipulation ${
            variant === 'profile'
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/40 text-[#E11D48]'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#E11D48]'
          }`}
        >
          <User className="w-3 h-3" aria-hidden />
          Profile → ZIP
        </a>
      </div>

      {/* Mode Switcher Tabs */}
      {copy.showBatch && (
        <div className="flex items-center justify-center gap-2 mb-4 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-2xl w-fit mx-auto border border-slate-300/60 dark:border-slate-700">
          <button
            type="button"
            onClick={() => { setMode('single'); setError(''); }}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all touch-manipulation ${
              mode === 'single' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {copy.singleTab}
          </button>
          <button
            type="button"
            onClick={() => { setMode('batch'); setError(''); }}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all touch-manipulation ${
              mode === 'batch' ? 'bg-white dark:bg-slate-900 text-[#E11D48] shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch (multi-link)</span>
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 items-center w-full">
        {mode === 'single' || !copy.showBatch ? (
          <div className="relative w-full">
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={copy.placeholder}
              className="w-full h-14 pl-5 pr-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#E11D48] focus:ring-4 focus:ring-red-500/10 transition-all text-base sm:text-lg shadow-sm"
              required
              aria-label={copy.ariaLabel}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {url ? (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#E11D48] bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <textarea
              rows={4}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder="Paste up to 5 Pinterest URLs (one per line):&#10;https://pinterest.com/pin/1234567/&#10;https://pin.it/abc1234"
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#E11D48] focus:ring-4 focus:ring-red-500/10 transition-all text-sm shadow-sm"
              required
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-3 top-3 inline-flex items-center gap-1 text-xs font-bold text-[#E11D48] bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Clipboard</span>
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            (mode === 'batch' && copy.showBatch ? !batchUrls.trim() : !url.trim())
          }
          className="w-full h-14 px-8 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-red-500/25 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{mode === 'batch' && copy.showBatch ? 'Processing batch links…' : 'Extracting…'}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>{mode === 'batch' && copy.showBatch ? 'Batch Extract All' : copy.submitLabel}</span>
            </>
          )}
        </button>
        {(mode === 'single' || !copy.showBatch) && (
          <p className="text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            {copy.hint}
          </p>
        )}
      </form>

      {/* Error display */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Carousel / multi-slide pin result */}
      {isCarousel && result?.media_items ? (
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-left flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-[#E11D48] text-xs font-bold border border-red-200 dark:border-red-900/40 mb-2">
                <Layers className="w-3.5 h-3.5" />
                Carousel · {result.media_items.length} slides
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight break-words">
                {result.title || 'Pinterest Carousel'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All carousel images &amp; videos extracted
                {zipping ? ` · Packing ZIP ${zipProgress.done}/${zipProgress.total}…` : ''}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                disabled={zipping}
                onClick={() =>
                  downloadCarouselAsZip(
                    result.media_items || [],
                    `carousel_${result.title || result.pin_id || 'pinterest'}`,
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
              >
                {zipping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Zipping… {zipProgress.done}/{zipProgress.total}
                    </span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>Download ZIP ({result.media_items.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {zipping && zipProgress.total > 0 && (
            <div
              className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
              role="progressbar"
              aria-valuenow={zipProgress.done}
              aria-valuemin={0}
              aria-valuemax={zipProgress.total}
              aria-label="ZIP packing progress"
            >
              <div
                className="h-full bg-[#E11D48] transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round((zipProgress.done / zipProgress.total) * 100)}%` }}
              />
            </div>
          )}

          {result.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{result.description}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {result.media_items.map((item, idx) => {
              const ext = item.type === 'video' ? 'mp4' : 'jpg';
              const filename = `slide_${idx + 1}.${ext}`;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-3 group min-w-0"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                    <img
                      src={item.thumbnail_url || (item.type === 'image' ? item.url : result.thumbnail_url) || ''}
                      alt={item.title || `Slide ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {idx + 1}/{result.media_items!.length}
                      {item.type === 'video' ? ' · VIDEO' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.title || `Slide ${idx + 1}`}
                  </span>
                  <a
                    href={`/api/download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(filename)}`}
                    download
                    className="w-full py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:text-[#E11D48] font-bold text-xs flex items-center justify-center gap-1 transition-colors touch-manipulation"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{item.type === 'video' ? 'Download MP4' : 'Download HD'}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ) : isCollection ? (
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-left flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-[#E11D48] text-xs font-bold border border-red-200 dark:border-red-900/40 mb-2">
                {result!.is_profile ? (
                  <>
                    <User className="w-3.5 h-3.5" />
                    Pinterest Profile
                  </>
                ) : (
                  <>📌 Pinterest Board</>
                )}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight break-words">
                {result!.is_profile
                  ? result!.profile_title || result!.board_title || 'Pinterest Profile'
                  : result!.board_title || 'Pinterest Board'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Found {result!.pins?.length || 0} downloadable pins
                {result!.username ? ` from @${result!.username}` : ''}
                {zipping ? ` · Packing ZIP ${zipProgress.done}/${zipProgress.total}…` : ''}
              </p>
            </div>

            {result!.pins && result!.pins.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={zipping}
                  onClick={() =>
                    downloadCollectionAsZip(
                      result!.pins || [],
                      result!.is_profile
                        ? `profile_${result!.username || 'pinterest'}`
                        : `board_${result!.board_title || 'pinterest'}`,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation"
                >
                  {zipping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        Zipping… {zipProgress.done}/{zipProgress.total}
                      </span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span>Download ZIP ({result!.pins.length})</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={zipping}
                  onClick={() => {
                    result!.pins?.forEach((pin, idx) => {
                      setTimeout(() => {
                        const mediaUrl =
                          pin.is_video && pin.video_url ? pin.video_url : pin.image_url;
                        if (!mediaUrl) return;
                        const ext = pin.is_video && pin.video_url ? 'mp4' : 'jpg';
                        const a = document.createElement('a');
                        a.href = `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(`pin_${pin.pin_id}.${ext}`)}`;
                        a.download = `pin_${pin.pin_id}.${ext}`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }, idx * 600);
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-slate-700 active:scale-95 transition-all disabled:opacity-60 touch-manipulation"
                >
                  <Download className="w-4 h-4" />
                  <span>One by one</span>
                </button>
              </div>
            )}
          </div>

          {zipping && zipProgress.total > 0 && (
            <div
              className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
              role="progressbar"
              aria-valuenow={zipProgress.done}
              aria-valuemin={0}
              aria-valuemax={zipProgress.total}
              aria-label="ZIP packing progress"
            >
              <div
                className="h-full bg-[#E11D48] transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round((zipProgress.done / zipProgress.total) * 100)}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {result!.pins?.map((pin, idx) => {
              const mediaUrl = pin.is_video && pin.video_url ? pin.video_url : pin.image_url;
              const ext = pin.is_video && pin.video_url ? 'mp4' : 'jpg';
              return (
                <div
                  key={pin.pin_id || idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 group min-w-0"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                    <img
                      src={pin.thumbnail_url || pin.image_url}
                      alt={pin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {pin.is_video && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        VIDEO
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {pin.title}
                  </span>
                  <a
                    href={`/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(`pin_${pin.pin_id}.${ext}`)}`}
                    download
                    className="w-full py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:text-[#E11D48] font-bold text-xs flex items-center justify-center gap-1 transition-colors touch-manipulation"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{pin.is_video && pin.video_url ? 'Download MP4' : 'Download HD'}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ) : result && (
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Preview Section */}
            <div className="w-full md:w-64 aspect-square bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200 relative shadow-inner group">
              {showPlayer && (selectedQuality || result.video_url) ? (
                <video
                  src={selectedQuality || result.video_url!}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <>
                  <img
                    src={result.thumbnail_url || result.image_url}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                  {result.is_video && (
                    <button
                      type="button"
                      onClick={() => setShowPlayer(true)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white group-hover:bg-black/50 transition-colors"
                      title="Play Preview"
                    >
                      <div class="w-12 h-12 rounded-full bg-[#E11D48] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col flex-1 gap-3 w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold w-fit border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Media Ready HD
              </span>

              <h2 className="text-xl font-bold text-slate-900 line-clamp-2 leading-snug">
                {result.title}
              </h2>
              {result.description && (
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {result.description}
                </p>
              )}

              {/* Quality Selector */}
              {result.qualities && result.qualities.length > 1 && (
                <div className="mt-1">
                  <label htmlFor="quality-select" className="text-xs text-slate-500 block mb-1.5 font-bold uppercase tracking-wider">Select Stream Quality:</label>
                  <select
                    id="quality-select"
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="bg-slate-50 text-slate-900 text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E11D48] w-full sm:w-auto"
                  >
                    {result.qualities.map((q, idx) => (
                      <option key={idx} value={q.url}>
                        {q.label} {q.height ? `(${q.height}p)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                {result.is_video && (selectedQuality || result.video_url) && (
                  <>
                    <a
                      href={`/api/download?url=${encodeURIComponent(selectedQuality || result.video_url!)}&filename=${encodeURIComponent((result.title || 'pinterest_video').replace(/[^a-z0-9]+/gi, '_').toLowerCase())}.mp4`}
                      download={`${(result.title || 'pinterest_video').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.mp4`}
                      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold transition-all text-sm shadow-md shadow-red-500/20 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download MP4 Video</span>
                    </a>
                    
                    <a
                      href={`/api/download?url=${encodeURIComponent(selectedQuality || result.video_url!)}&filename=${encodeURIComponent((result.title || 'pinterest_audio').replace(/[^a-z0-9]+/gi, '_').toLowerCase())}.mp3`}
                      download={`${(result.title || 'pinterest_audio').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.mp3`}
                      className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all text-sm shadow-md shadow-purple-500/20 active:scale-95"
                      title="Extract and download original audio stream"
                    >
                      <Music className="w-4 h-4" />
                      <span>Download MP3 Sound</span>
                    </a>
                  </>
                )}

                {result.image_url && (
                  <a
                    href={`/api/download?url=${encodeURIComponent(result.image_url)}&filename=${encodeURIComponent((result.title || 'pinterest_image').replace(/[^a-z0-9]+/gi, '_').toLowerCase())}.jpg`}
                    download={`${(result.title || 'pinterest_image').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.jpg`}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-all text-sm border border-slate-200 dark:border-slate-700 active:scale-95"
                  >
                    <ImageIcon className="w-4 h-4 text-[#E11D48]" />
                    <span>Download HD Image</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Color Palette Chips Generator */}
          {result.colors && result.colors.length > 0 && (
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Palette className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Extracted Pin Color Palette</span>
                </div>
                <span className="text-[10px] text-slate-400">Click chip to copy hex</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-1">
                {result.colors.map((hex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => copyColorHex(hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform group shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{copiedColor === hex ? 'Copied!' : hex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags section */}
          {result.tags && result.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Pin Keywords & Hashtags</span>
                </div>
                <button
                  type="button"
                  onClick={copyTagsToClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-[#E11D48] hover:text-red-700 dark:hover:text-red-400 font-bold transition-colors bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg"
                >
                  {copiedTags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTags ? 'Copied All!' : 'Copy Tags'}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {result.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Content Reposting Studio Widget */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>AI Social Reposter Studio</span>
              </div>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full">
                1-Click Preset Captions
              </span>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setActivePlatform('reels')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'reels' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                📸 Instagram Reels
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('tiktok')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'tiktok' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🎵 TikTok
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('shorts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'shorts' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                🎬 YT Shorts
              </button>
            </div>

            {/* Generated Caption Preview Box */}
            <div className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {activePlatform === 'reels' && (
                <>
                  {`✨ ${result.title}\n\nTag someone who needs to see this! 👇\n\n📌 Saved via PintDownload\n\n${(result.tags || []).map(t => `#${t}`).join(' ')} #reels #viral #aesthetic`}
                </>
              )}
              {activePlatform === 'tiktok' && (
                <>
                  {`POV: ${result.title} 🌿🔥\n\nFollow for more daily aesthetic pins & inspo!\n\n${(result.tags || []).map(t => `#${t}`).join(' ')} #fyp #viral #pinterest #foryou`}
                </>
              )}
              {activePlatform === 'shorts' && (
                <>
                  {`🔥 ${result.title} | Pinterest Aesthetic\n\nLike & Subscribe for more daily visual content!\n\n${(result.tags || []).map(t => `#${t}`).join(' ')} #shorts #pintdownload #pinterest`}
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  let text = '';
                  const tagsStr = (result.tags || []).map(t => `#${t}`).join(' ');
                  if (activePlatform === 'reels') text = `✨ ${result.title}\n\nTag someone who needs to see this! 👇\n\n📌 Saved via PintDownload\n\n${tagsStr} #reels #viral #aesthetic`;
                  if (activePlatform === 'tiktok') text = `POV: ${result.title} 🌿🔥\n\nFollow for more daily aesthetic pins & inspo!\n\n${tagsStr} #fyp #viral #pinterest #foryou`;
                  if (activePlatform === 'shorts') text = `🔥 ${result.title} | Pinterest Aesthetic\n\nLike & Subscribe for more daily visual content!\n\n${tagsStr} #shorts #pintdownload #pinterest`;
                  
                  navigator.clipboard.writeText(text);
                  setCopiedCaption(true);
                  setTimeout(() => setCopiedCaption(false), 2000);
                }}
                className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-sans text-xs font-bold shadow-sm transition-transform active:scale-95"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Copied Caption!' : 'Copy Caption & Tags'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Results Grid */}
      {batchResults.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 text-left animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#E11D48]" />
              <span>Extracted Batch Media ({batchResults.length} items)</span>
            </h3>

            {/* Master Sequential Download All Button */}
            <button
              type="button"
              onClick={() => {
                batchResults.forEach((res, idx) => {
                  setTimeout(() => {
                    const downloadUrl = res.video_url || res.image_url;
                    if (downloadUrl) {
                      const a = document.createElement('a');
                      const ext = res.is_video ? 'mp4' : 'jpg';
                      a.href = `/api/download?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent((res.title || 'pin').replace(/[^a-z0-9]+/gi, '_').toLowerCase())}.${ext}`;
                      a.download = `pinterest_${idx + 1}.${ext}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }, idx * 500);
                });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download All ({batchResults.length} Items)</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {batchResults.map((res, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex gap-3">
                  <img src={res.thumbnail_url || res.image_url || ''} alt={res.title} className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0" />
                  <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2">{res.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold">{res.is_video ? 'Video Pin' : 'Image Pin'}</span>
                  </div>
                </div>
                <a
                  href={`/api/download?url=${encodeURIComponent(res.video_url || res.image_url!)}&filename=${encodeURIComponent((res.title || 'pin').replace(/[^a-z0-9]+/gi, '_').toLowerCase())}.${res.is_video ? 'mp4' : 'jpg'}`}
                  download
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E11D48] hover:text-white text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {res.is_video ? 'MP4' : 'Image'}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent History Bar */}
      {history.length > 0 && !result && batchResults.length === 0 && (
        <div className="mt-10 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            <History className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>Recent Downloads</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {history.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setUrl(item.url); setMode('single'); }}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 transition-all text-left flex items-center gap-2.5 group"
              >
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.title} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#E11D48] truncate">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
