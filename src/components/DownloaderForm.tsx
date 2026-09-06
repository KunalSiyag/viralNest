import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { Loader2, Download, AlertCircle, Image as ImageIcon, Copy, Check, Tag, Clipboard, Play, Layers, History, Palette, Music, Sparkles, Archive, User, ChevronLeft, ChevronRight, Crop, Scissors, QrCode, ExternalLink, RefreshCw, X, Film } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';
import AudioTrimmer from './AudioTrimmer';
import { TRANSLATIONS, type LanguageCode } from '../lib/i18n';
import { gifCandidateUrls, isGifUrl, isMediaContentType, mediaFileExtension, toDownloadablePinUrl } from '../lib/pin-media';
import { classifyPinterestInput, getSuitableToolForMedia } from '../lib/pinterest-route';
import { convertVideoToGif } from '../lib/gif-encoder';

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
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url?: string;
  title?: string;
}

interface ProfileBoardItem {
  name: string;
  url: string;
  pin_count?: number;
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
  is_gif?: boolean;
  is_board?: boolean;
  is_profile?: boolean;
  is_avatar_only?: boolean;
  is_carousel?: boolean;
  media_count?: number;
  media_items?: MediaItem[];
  pin_id?: string;
  board_title?: string;
  board_url?: string;
  profile_title?: string;
  profile_url?: string;
  profile_avatar_url?: string;
  username?: string | null;
  pin_count?: number;
  pins?: BoardPinItem[];
  boards?: ProfileBoardItem[];
}

interface HistoryItem {
  title: string;
  thumbnail?: string;
  url: string;
  timestamp: number;
}

/** Intent-specific form surface for SEO tool pages */
export type FormVariant = 'hub' | 'pin' | 'video' | 'image' | 'gif' | 'board' | 'profile' | 'profile-picture';

export type FormLayout = 'default' | 'hero';

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
    placeholder: 'Paste Pinterest link here… e.g. https://pin.it/…',
    ariaLabel: 'Pinterest pin, board, or profile link',
    submitLabel: 'Download',
    hint: 'Public pin, board, or profile URLs. Board & profile links download as ZIP.',
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
  gif: {
    worksLabel: 'Best for',
    singleTab: 'GIF Pin URL',
    showBatch: true,
    placeholder: 'Paste GIF pin URL… https://pinterest.com/pin/… or pin.it/…',
    ariaLabel: 'Pinterest GIF pin link',
    submitLabel: 'Download GIF',
    hint: 'Saves the looping animated GIF — not a still JPG of the first frame.',
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
    submitLabel: 'Extract Profile Pins (ZIP)',
    hint: 'Downloads all public pins posted by this user account as a ZIP archive.',
  },
  'profile-picture': {
    worksLabel: 'Best for',
    singleTab: 'Profile Avatar URL',
    showBatch: false,
    placeholder: 'Paste profile URL… https://pinterest.com/username/',
    ariaLabel: 'Pinterest profile link for avatar DP',
    submitLabel: 'Get Profile Picture (HD)',
    hint: 'Extracts full-resolution uncropped avatar photo & DP image from any Pinterest account.',
  },
};

export default function DownloaderForm({
  variant = 'hub',
  layout = 'default',
}: {
  variant?: FormVariant;
  /** hero = Pinpea-style pill input + download on landing */
  layout?: FormLayout;
}) {
  const isHero = layout === 'hero';
  const [activeVariant, setActiveVariant] = useState<FormVariant>(variant);
  const [routeNotice, setRouteNotice] = useState<{ badge: string; message: string; path: string } | null>(null);
  const [gifSpeed, setGifSpeed] = useState<number>(1);
  const [gifPlaying, setGifPlaying] = useState<boolean>(true);
  const [convertingGif, setConvertingGif] = useState<boolean>(false);
  const [convertProgress, setConvertProgress] = useState<{ phase: string; percent: number }>({ phase: '', percent: 0 });

  useEffect(() => {
    setActiveVariant(variant);
  }, [variant]);

  const copy = VARIANT_COPY[activeVariant] || VARIANT_COPY.hub;
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('preferred_lang') as LanguageCode;
    if (saved && TRANSLATIONS[saved]) {
      setCurrentLang(saved);
    }

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ lang: LanguageCode }>;
      if (customEvent.detail?.lang && TRANSLATIONS[customEvent.detail.lang]) {
        setCurrentLang(customEvent.detail.lang);
      }
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const activePlaceholder = currentLang !== 'en' ? t.downloadPlaceholder : copy.placeholder;
  const activeSubmitLabel = currentLang !== 'en' ? t.downloadButton : copy.submitLabel;

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
  const [showCropper, setShowCropper] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [selectedPins, setSelectedPins] = useState<Record<string, boolean>>({});
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'image'>('all');
  const [savingFile, setSavingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{
    loaded: number;
    total: number;
    phase: 'connecting' | 'transferring';
  } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrFor, setQrFor] = useState('');

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30]);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  };

  // Pagination limit for board/profile pins & scroll refs
  const [displayLimit, setDisplayLimit] = useState<number>(12);
  const collectionScrollRef = useRef<HTMLDivElement>(null);
  const carouselScrollRef = useRef<HTMLDivElement>(null);

  const primaryMediaUrl = selectedQuality || result?.video_url || result?.image_url || '';

  useEffect(() => {
    setQrOpen(false);
    setQrDataUrl('');
    setQrFor('');
  }, [result, selectedQuality]);

  const toggleQrPanel = async () => {
    const next = !qrOpen;
    setQrOpen(next);
    triggerHaptic();
    if (!next || !primaryMediaUrl) return;
    if (qrDataUrl && qrFor === primaryMediaUrl) return;
    setQrLoading(true);
    try {
      const QRCode = (await import('qrcode')).default;
      const dataUrl = await QRCode.toDataURL(primaryMediaUrl, {
        width: 256,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });
      setQrDataUrl(dataUrl);
      setQrFor(primaryMediaUrl);
    } catch {
      setError('Could not generate QR code. Copy the link instead.');
    } finally {
      setQrLoading(false);
    }
  };

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

  // Prefill from ?url= / ?link= (bookmarklet / deep links) or ?text= (PWA share target),
  // optionally auto-extracting. Shared text may embed the link in a sentence.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('url') || params.get('link') || params.get('text') || '';
      const match = raw.match(/https?:\/\/[^\s"'<>]*(?:pinterest\.[^\s/"']*|pin\.it)[^\s"'<>]*/i);
      const cleaned = (match ? match[0] : raw).trim();
      if (!cleaned) return;
      setUrl(cleaned);
      setMode('single');
      if (match && (params.get('auto') === '1' || params.get('auto') === 'true')) {
        // Defer so state settles, then submit extract
        const t = window.setTimeout(() => {
          void extractSingle(cleaned);
        }, 80);
        return () => window.clearTimeout(t);
      }
    } catch (e) {
      console.warn('URL prefill failed:', e);
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

  const handleUrlInput = (rawText: string) => {
    setUrl(rawText);
    const trimmed = rawText.trim();
    if (!trimmed) {
      setRouteNotice(null);
      return;
    }
    const classification = classifyPinterestInput(trimmed);
    if (classification) {
      if (classification.type === 'board' && activeVariant !== 'board') {
        setActiveVariant('board');
        setRouteNotice({
          badge: classification.badge,
          message: 'Pinterest Board link detected — automatically switched to Board Downloader',
          path: classification.path,
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${classification.path}?url=${encodeURIComponent(trimmed)}`);
        }
      } else if (
        classification.type === 'profile' &&
        activeVariant !== 'profile' &&
        activeVariant !== 'profile-picture'
      ) {
        setActiveVariant('profile');
        setRouteNotice({
          badge: classification.badge,
          message: 'Pinterest Profile link detected — automatically switched to Profile Downloader',
          path: classification.path,
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${classification.path}?url=${encodeURIComponent(trimmed)}`);
        }
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (mode === 'single') {
          handleUrlInput(text);
          triggerHaptic();
        } else {
          setBatchUrls(prev => prev ? `${prev}\n${text.trim()}` : text.trim());
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const extractSingle = async (pinUrl: string) => {
    const target = pinUrl.trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    setBatchResults([]);
    setCopiedTags(false);
    setShowPlayer(false);
    setDisplayLimit(12);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, ...(activeVariant === 'profile-picture' ? { intent: 'avatar' } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract media from Pinterest.');
      setResult(data);
      if (data.video_url) setSelectedQuality(data.video_url);
      saveToHistory(data, target);

      // Smart Media-Type Auto-Routing:
      const suitable = getSuitableToolForMedia(data);
      if (data.is_gif && activeVariant !== 'gif') {
        setActiveVariant('gif');
        setRouteNotice({
          badge: suitable.badge,
          message: 'Looping animated GIF detected — switched to GIF Downloader suite',
          path: suitable.path,
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitable.path}?url=${encodeURIComponent(target)}`);
        }
      } else if (data.is_video && !data.is_gif && activeVariant !== 'video' && activeVariant !== 'hub') {
        setActiveVariant('video');
        setRouteNotice({
          badge: suitable.badge,
          message: 'HD Video pin detected — switched to Video Downloader suite',
          path: suitable.path,
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitable.path}?url=${encodeURIComponent(target)}`);
        }
      } else if (data.is_carousel && activeVariant !== 'image' && activeVariant !== 'hub') {
        setActiveVariant('image');
        setRouteNotice({
          badge: suitable.badge,
          message: `Multi-slide carousel detected (${data.media_items?.length || 0} slides) — switched to Carousel Downloader`,
          path: suitable.path,
        });
      } else if (data.is_board && activeVariant !== 'board') {
        setActiveVariant('board');
        setRouteNotice({
          badge: suitable.badge,
          message: 'Pinterest Board detected — switched to Board Downloader',
          path: suitable.path,
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitable.path}?url=${encodeURIComponent(target)}`);
        }
      } else if (data.is_profile && activeVariant !== 'profile' && activeVariant !== 'profile-picture') {
        setActiveVariant('profile');
        setRouteNotice({
          badge: suitable.badge,
          message: 'Pinterest Profile detected — switched to Profile Downloader',
          path: suitable.path,
        });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitable.path}?url=${encodeURIComponent(target)}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Check the Pinterest URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'single' && !url.trim()) return;
    if (mode === 'batch' && !batchUrls.trim()) return;

    if (mode === 'single') {
      await extractSingle(url);
    } else {
      setLoading(true);
      setError('');
      setResult(null);
      setBatchResults([]);
      setCopiedTags(false);
      setShowPlayer(false);
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

  const formatBytes = (n: number) => {
    if (!n) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)}\u00a0${units[i]}`;
  };

  /** iOS Safari ignores the download attribute and navigates instead. */
  const needsBlobDownload = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true;
    return false;
  };

  const proxyDownloadHref = (mediaUrl: string, filename: string, inline = false) => {
    const href = `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(mediaUrl))}&filename=${encodeURIComponent(filename)}`;
    return inline ? `${href}&inline=1` : href;
  };

  const resolvedGifUrl = (res: ExtractionResult | null): string | null => {
    if (!res) return null;
    if (res.image_url && isGifUrl(res.image_url)) return res.image_url;
    const gifItem = res.media_items?.find((m) => m.type === 'gif' || isGifUrl(m.url));
    if (gifItem?.url && isGifUrl(gifItem.url)) return gifItem.url;
    const guessSrc = gifItem?.url || res.image_url || res.thumbnail_url || null;
    if (guessSrc && (res.is_gif || gifItem?.type === 'gif')) {
      return gifCandidateUrls(guessSrc)[0] || null;
    }
    return null;
  };

  const handleConvertAndDownloadGif = async (videoUrl: string, filename: string) => {
    setConvertingGif(true);
    setError('');
    try {
      const proxied = proxyDownloadHref(videoUrl, 'source.mp4', true);
      const blob = await convertVideoToGif(proxied, {
        onProgress: (p) => setConvertProgress(p),
      });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setError(err?.message || 'Could not convert video to GIF. You can download the MP4 directly.');
    } finally {
      setConvertingGif(false);
      setConvertProgress({ phase: '', percent: 0 });
    }
  };

  const saveProxyDownload = async (mediaUrl: string, filename: string) => {
    setError('');
    setSavingFile(filename);
    setDownloadProgress({ loaded: 0, total: 0, phase: 'connecting' });
    try {
      const res = await fetch(proxyDownloadHref(mediaUrl, filename));
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !isMediaContentType(type)) {
        throw new Error(
          'Could not download this file. The pin may be private, or Pinterest is no longer serving that media URL.',
        );
      }
      const contentLength = res.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const chunks: Uint8Array[] = [];
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        setDownloadProgress({ loaded, total, phase: 'transferring' });
      }

      const blob = new Blob(chunks, { type: type || 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setError(err?.message || 'Download failed.');
    } finally {
      setSavingFile(null);
      setDownloadProgress(null);
    }
  };

  const onProxyDownloadClick = (
    e: MouseEvent<HTMLAnchorElement>,
    mediaUrl: string,
    filename: string,
  ) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // Desktop: let the browser stream the file so the OS download bar moves
    // immediately instead of looking paused while we buffer a blob.
    if (!needsBlobDownload()) return;
    e.preventDefault();
    void saveProxyDownload(mediaUrl, filename);
  };

  const downloadStatusLabel = () => {
    if (!savingFile || !downloadProgress) return '';
    if (downloadProgress.phase === 'connecting' || downloadProgress.loaded === 0) {
      return 'Connecting to Pinterest…';
    }
    if (downloadProgress.total > 0) {
      const pct = Math.min(100, Math.round((downloadProgress.loaded / downloadProgress.total) * 100));
      return `Downloading… ${formatBytes(downloadProgress.loaded)} of ${formatBytes(downloadProgress.total)} (${pct}%)`;
    }
    return `Downloading… ${formatBytes(downloadProgress.loaded)}`;
  };

  const downloadUrlsAsZip = async (
    entries: { url: string; filename: string }[],
    archiveName: string,
  ) => {
    if (!entries.length || zipping) return;
    setZipping(true);
    setZipProgress({ done: 0, total: entries.length });
    setError('');

    try {
      const JSZip = (await import('jszip')).default;
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
                `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(entry.url))}&filename=${encodeURIComponent(entry.filename)}`,
              );
              const type = res.headers.get('content-type') || '';
              if (!res.ok || !isMediaContentType(type)) throw new Error(`HTTP ${res.status}`);
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
        const ext = pin.is_video && pin.video_url ? 'mp4' : mediaFileExtension(pin.image_url, 'jpg');
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
      filename: `${String(idx + 1).padStart(2, '0')}_slide_${slugify(item.title || String(idx + 1))}.${
        item.type === 'video'
          ? 'mp4'
          : item.type === 'gif' || isGifUrl(item.url)
            ? 'gif'
            : mediaFileExtension(item.url, 'jpg')
      }`,
    }));
    return downloadUrlsAsZip(entries, archiveName);
  };

  const downloadSinglePinCompletePack = async (res: ExtractionResult) => {
    if (zipping) return;
    const vUrl = selectedQuality || res.video_url;
    const gUrl = resolvedGifUrl(res);
    const safeTitle = slugify(res.title || res.pin_id || 'pinterest_pin');
    const entries: { url: string; filename: string }[] = [];

    if (gUrl) {
      entries.push({ url: gUrl, filename: `${safeTitle}_animation.gif` });
    }

    if (vUrl) {
      entries.push({ url: vUrl, filename: `${safeTitle}_video.mp4` });
      entries.push({ url: vUrl, filename: `${safeTitle}_audio.mp3` });
    }

    if (res.image_url && res.image_url !== gUrl) {
      entries.push({
        url: res.image_url,
        filename: `${safeTitle}_cover.jpg`,
      });
    } else if (res.thumbnail_url && res.thumbnail_url !== gUrl) {
      entries.push({
        url: res.thumbnail_url,
        filename: `${safeTitle}_cover.jpg`,
      });
    }

    return downloadUrlsAsZip(entries, `${safeTitle}_media_pack`);
  };

  const isCollection = !!(result && (result.is_board || result.is_profile) && result.pins?.length);
  const isCarousel = !!(
    result &&
    !result.is_board &&
    !result.is_profile &&
    ((result.media_items && result.media_items.length > 1) || result.is_carousel)
  );

  return (
    <div className={`w-full mx-auto ${isHero ? 'max-w-2xl mt-0' : 'max-w-3xl mt-4'}`}>
      {/* Intent Switcher: Quick 1-click access to GIF, Video, Image, and Board tools */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mr-1">
          {copy.worksLabel}:
        </span>
        <a
          href="/pinterest-gif-downloader"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black transition-all touch-manipulation shadow-xs ${
            activeVariant === 'gif'
              ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 hover:border-red-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" aria-hidden="true" />
          <span>GIF Downloader</span>
        </a>
        <a
          href="/pinterest-video-downloader"
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold transition-all touch-manipulation ${
            activeVariant === 'video'
              ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <Play className="w-3 h-3 text-[#E11D48]" aria-hidden="true" />
          <span>Video (MP4)</span>
        </a>
        <a
          href="/pinterest-image-downloader"
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold transition-all touch-manipulation ${
            activeVariant === 'image'
              ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <ImageIcon className="w-3 h-3 text-[#E11D48]" aria-hidden="true" />
          <span>HD Photo</span>
        </a>
        <a
          href="/pinterest-board-downloader"
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold transition-all touch-manipulation ${
            activeVariant === 'board'
              ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <Archive className="w-3 h-3 text-[#E11D48]" aria-hidden="true" />
          <span>Board ZIP</span>
        </a>
        <a
          href="/pinterest-profile-picture-downloader"
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold transition-all touch-manipulation ${
            activeVariant === 'profile-picture'
              ? 'bg-red-50 dark:bg-red-950/70 border-red-300 dark:border-red-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <User className="w-3 h-3 text-[#E11D48]" aria-hidden="true" />
          <span>Avatar DP</span>
        </a>
      </div>

      {/* Auto-Route Alert Banner */}
      {routeNotice && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 dark:from-red-950/50 dark:via-rose-950/50 dark:to-amber-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs font-bold text-rose-900 dark:text-rose-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-[#E11D48] text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
              {routeNotice.badge}
            </span>
            <span className="truncate">{routeNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setRouteNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode Switcher — not on hero */}
      {!isHero && copy.showBatch && (
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
      <form
        onSubmit={handleSubmit}
        className={`relative w-full ${isHero ? 'flex flex-col sm:block' : 'flex flex-col gap-3 items-center'}`}
      >
        {mode === 'single' || !copy.showBatch || isHero ? (
          isHero ? (
            <div className="relative w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 rounded-2xl sm:rounded-full bg-white dark:bg-ink-900 border border-black/[0.08] dark:border-white/[0.12] shadow-pill p-2 sm:p-1.5 sm:pl-5 transition-all focus-within:ring-2 focus-within:ring-[#E11D48]">
              <label htmlFor="pinterest-url-input-hero" className="sr-only">
                {copy.ariaLabel}
              </label>
              <div className="flex items-center gap-2 flex-1 min-w-0 px-2 sm:px-0">
                <Clipboard className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 hidden sm:block" aria-hidden="true" />
                <input
                  id="pinterest-url-input-hero"
                  type="url"
                  name="url"
                  value={url}
                  onChange={(e) => handleUrlInput(e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData?.getData('text');
                    if (text) handleUrlInput(text);
                  }}
                  placeholder={activePlaceholder}
                  className="w-full h-12 sm:h-14 bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none text-base sm:text-[1.05rem] min-w-0"
                  required
                  aria-label={copy.ariaLabel}
                  autoComplete="url"
                  inputMode="url"
                  spellCheck={false}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="h-12 sm:h-14 px-7 sm:px-8 rounded-xl sm:rounded-full bg-[#E11D48] hover:bg-[#BE123C] active:bg-[#9F1239] text-white font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 touch-manipulation shadow-soft focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E11D48]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>{t.processingText}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" aria-hidden="true" />
                    <span>{activeSubmitLabel}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="relative w-full">
              <label htmlFor="pinterest-url-input-standard" className="sr-only">
                {copy.ariaLabel}
              </label>
              <input
                id="pinterest-url-input-standard"
                type="url"
                name="url"
                value={url}
                onChange={(e) => handleUrlInput(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData?.getData('text');
                  if (text) handleUrlInput(text);
                }}
                placeholder={activePlaceholder}
                className="w-full h-14 pl-5 pr-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48] focus:ring-4 focus:ring-red-500/10 transition-all text-base sm:text-lg shadow-sm"
                required
                aria-label={copy.ariaLabel}
                autoComplete="url"
                inputMode="url"
                spellCheck={false}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-[#E11D48]"
                    aria-label="Clear input field"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-red-50 dark:bg-red-950/70 hover:bg-red-100 dark:hover:bg-red-900/60 px-3 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-[#E11D48]"
                    aria-label="Paste URL from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Paste</span>
                  </button>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="relative w-full">
            <label htmlFor="batch-urls-input" className="sr-only">
              Batch Pinterest URLs (up to 5 URLs, one per line)
            </label>
            <textarea
              id="batch-urls-input"
              name="batchUrls"
              rows={4}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder="Paste up to 5 Pinterest URLs (one per line):&#10;https://pinterest.com/pin/1234567/&#10;https://pin.it/abc1234"
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#E11D48] focus:ring-4 focus:ring-red-500/10 transition-all text-base sm:text-sm shadow-sm"
              required
              spellCheck={false}
              aria-label="Batch Pinterest URLs"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-3 top-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-red-50 dark:bg-red-950/70 hover:bg-red-100 dark:hover:bg-red-900/60 px-3 py-2 rounded-lg transition-colors min-h-[44px] touch-manipulation focus-visible:ring-2 focus-visible:ring-[#E11D48]"
              aria-label="Paste clipboard text into batch input"
            >
              <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Paste Clipboard</span>
            </button>
          </div>
        )}

        {!isHero && (
          <button
            type="submit"
            disabled={
              loading ||
              (mode === 'batch' && copy.showBatch ? !batchUrls.trim() : !url.trim())
            }
            className="w-full h-14 px-8 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-red-500/25 active:scale-95 touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E11D48]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>{mode === 'batch' && copy.showBatch ? 'Processing batch links…' : 'Extracting…'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" aria-hidden="true" />
                <span>{mode === 'batch' && copy.showBatch ? 'Batch Extract All' : copy.submitLabel}</span>
              </>
            )}
          </button>
        )}
        {!isHero && (mode === 'single' || !copy.showBatch) && (
          <p className="text-center text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
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

          {/* Horizontal Scrollable Carousel */}
          <div className="relative group/carousel">
            <button
              type="button"
              onClick={() => carouselScrollRef.current?.scrollBy({ left: -360, behavior: 'smooth' })}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
              aria-label="Scroll slides left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={carouselScrollRef}
              className="flex flex-row overflow-x-auto gap-4 pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-rose-400 dark:scrollbar-thumb-rose-600"
            >
              {result.media_items.map((item, idx) => {
                const ext =
                  item.type === 'video'
                    ? 'mp4'
                    : item.type === 'gif' || isGifUrl(item.url)
                      ? 'gif'
                      : mediaFileExtension(item.url, 'jpg');
                const filename = `slide_${idx + 1}.${ext}`;
                return (
                  <div
                    key={idx}
                    className="w-48 sm:w-56 shrink-0 snap-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 group/card min-w-0"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                      <img
                        src={item.thumbnail_url || (item.type === 'image' ? item.url : result.thumbnail_url) || ''}
                        alt={item.title || `Slide ${idx + 1}`}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                        {idx + 1}/{result.media_items!.length}
                        {item.type === 'video' ? ' · VIDEO' : ''}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title={item.title || `Slide ${idx + 1}`}>
                      {item.title || `Slide ${idx + 1}`}
                    </span>
                    <a
                      href={proxyDownloadHref(item.url, filename)}
                      download={filename}
                      onClick={(e) => onProxyDownloadClick(e, item.url, filename)}
                      aria-busy={savingFile === filename}
                      className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:text-[#E11D48] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors touch-manipulation shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {item.type === 'video'
                          ? 'Download MP4'
                          : ext === 'gif'
                            ? 'Download GIF'
                            : 'Download HD'}
                      </span>
                    </a>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => carouselScrollRef.current?.scrollBy({ left: 360, behavior: 'smooth' })}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
              aria-label="Scroll slides right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : result?.is_avatar_only ? (
        /* ── Avatar-only result (profile picture downloader) ─────────── */
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-500/10 via-rose-500/5 to-white dark:to-slate-900 border-2 border-red-200 dark:border-red-900/50 shadow-xl flex flex-col items-center text-center gap-5 w-full">
            {result.profile_avatar_url ? (
              <div className="relative group">
                <img
                  src={result.profile_avatar_url}
                  alt={`${result.profile_title || 'User'} avatar`}
                  className="w-40 h-40 sm:w-52 sm:h-52 rounded-full object-cover border-4 border-[#E11D48] shadow-2xl transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-[#E11D48] text-white text-xs font-black shadow-md">
                  HD Avatar
                </span>
              </div>
            ) : (
              <div className="w-36 h-36 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-5xl">
                👤
              </div>
            )}

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-rose-700 dark:text-rose-300 text-xs font-extrabold mb-2 border border-red-200 dark:border-red-900/50">
                <User className="w-3.5 h-3.5" />
                Profile Picture Extracted
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {result.profile_title || `@${result.username}`}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Full-resolution uncropped profile avatar photo ({result.username ? `@${result.username}` : 'Pinterest User'})
              </p>
            </div>

            {result.profile_avatar_url && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                <a
                  href={proxyDownloadHref(result.profile_avatar_url, `pinterest_avatar_${result.username || 'user'}.jpg`)}
                  download={`pinterest_avatar_${result.username || 'user'}.jpg`}
                  onClick={(e) =>
                    onProxyDownloadClick(
                      e,
                      result.profile_avatar_url!,
                      `pinterest_avatar_${result.username || 'user'}.jpg`,
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-base shadow-lg shadow-red-500/25 active:scale-95 transition-all w-full sm:w-auto touch-manipulation"
                >
                  <Download className="w-5 h-5" />
                  <span>Download HD Profile Picture</span>
                </a>
                <a
                  href={result.profile_avatar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-colors w-full sm:w-auto touch-manipulation"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Open Full Size</span>
                </a>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Want all pins from this profile? Use the{' '}
            <a href="/pinterest-profile-downloader" className="text-rose-600 dark:text-rose-400 hover:underline font-bold">
              Profile Downloader (ZIP)
            </a>{' '}
            instead.
          </p>
        </div>
      ) : isCollection ? (
        <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-left flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result!.is_profile && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-500/10 via-rose-500/5 to-white dark:to-slate-900 border-2 border-red-200 dark:border-red-900/50 shadow-xl flex flex-col items-center text-center gap-5">
              {result!.profile_avatar_url ? (
                <div className="relative group">
                  <img
                    src={result!.profile_avatar_url}
                    alt={`${result!.profile_title || 'User'} avatar`}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#E11D48] shadow-2xl transition-transform group-hover:scale-105"
                  />
                  <span className="absolute bottom-1 right-1 px-2.5 py-1 rounded-full bg-[#E11D48] text-white text-xs font-black shadow-md">
                    HD Avatar
                  </span>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-4xl">
                  👤
                </div>
              )}

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-[#E11D48] text-xs font-extrabold mb-2 border border-red-200 dark:border-red-900/50">
                  Profile Avatar Extracted
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {result!.profile_title || `@${result!.username}`}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Full-size uncropped profile avatar photo ({result!.username ? `@${result!.username}` : 'Pinterest User'})
                </p>
              </div>

              {result!.profile_avatar_url && (
                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
                  <a
                    href={proxyDownloadHref(
                      result!.profile_avatar_url,
                      `pinterest_avatar_${result!.username || 'user'}.jpg`,
                    )}
                    download={`pinterest_avatar_${result!.username || 'user'}.jpg`}
                    onClick={(e) =>
                      onProxyDownloadClick(
                        e,
                        result!.profile_avatar_url!,
                        `pinterest_avatar_${result!.username || 'user'}.jpg`,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-base shadow-lg shadow-red-500/25 active:scale-95 transition-all w-full sm:w-auto touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download HD Profile Picture (DP)</span>
                  </a>
                </div>
              )}
            </div>
          )}

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
                Found <strong>{result!.pins?.length || 0}</strong> downloadable pins
                {result!.username ? ` from @${result!.username}` : ''}
                {result!.pins && result!.pins.length > displayLimit
                  ? ` · Showing ${Math.min(displayLimit, result!.pins.length)} preview items`
                  : ''}
                {zipping ? ` · Packing ZIP ${zipProgress.done}/${zipProgress.total}…` : ''}
              </p>
            </div>

            {result!.pins && result!.pins.length > 0 && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed touch-manipulation flex-1 sm:flex-initial"
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
                {result!.pins.length > displayLimit && (
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(result!.pins!.length)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    <span>Show All ({result!.pins.length})</span>
                  </button>
                )}
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

          {/* Profile Boards Listing */}
          {result!.is_profile && result!.boards && result!.boards.length > 0 && (
            <div className="flex flex-col gap-3 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-[#E11D48]" />
                  Profile Boards ({result!.boards.length})
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a board to extract its full dedicated pin pack
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {result!.boards.map((b, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrl(b.url);
                      extractSingle(b.url);
                    }}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-800 text-left flex items-center justify-between gap-2 group transition-all shadow-xs touch-manipulation"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#E11D48] truncate">
                        📌 {b.name}
                      </p>
                      {typeof b.pin_count === 'number' && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {b.pin_count} pins
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-[#E11D48] bg-red-50 dark:bg-red-950/60 px-2 py-1 rounded-md shrink-0 group-hover:scale-105 transition-transform">
                      Extract →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Horizontal Scrollable Carousel for Board/Profile Pins */}
          <div className="relative group/scroll">
            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => collectionScrollRef.current?.scrollBy({ left: -360, behavior: 'smooth' })}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/scroll:opacity-100 focus:opacity-100"
              aria-label="Scroll pins left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={collectionScrollRef}
              className="flex flex-row overflow-x-auto gap-4 pb-4 pt-1 snap-x scroll-smooth scrollbar-thin scrollbar-thumb-rose-400 dark:scrollbar-thumb-rose-600"
            >
              {result!.pins?.slice(0, displayLimit).map((pin, idx) => {
                const mediaUrl = pin.is_video && pin.video_url ? pin.video_url : pin.image_url;
                const ext =
                  pin.is_video && pin.video_url
                    ? 'mp4'
                    : mediaFileExtension(pin.image_url, 'jpg');
                return (
                  <div
                    key={pin.pin_id || idx}
                    className="w-48 sm:w-56 shrink-0 snap-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 group/card min-w-0"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                      <img
                        src={pin.thumbnail_url || pin.image_url}
                        alt={pin.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {pin.is_video ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-extrabold tracking-wider">
                          MP4 VIDEO
                        </span>
                      ) : ext === 'gif' ? (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-extrabold tracking-wider">
                          GIF
                        </span>
                      ) : null}
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate" title={pin.title}>
                      {pin.title || `Pin #${idx + 1}`}
                    </span>
                    <a
                      href={proxyDownloadHref(mediaUrl, `pin_${pin.pin_id}.${ext}`)}
                      download={`pin_${pin.pin_id}.${ext}`}
                      onClick={(e) => onProxyDownloadClick(e, mediaUrl, `pin_${pin.pin_id}.${ext}`)}
                      className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:text-[#E11D48] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors touch-manipulation shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {pin.is_video && pin.video_url
                          ? 'Download MP4'
                          : ext === 'gif'
                            ? 'Download GIF'
                            : 'Download HD'}
                      </span>
                    </a>
                  </div>
                );
              })}

              {/* Card at end if more pins exist */}
              {result!.pins && result!.pins.length > displayLimit && (
                <div className="w-52 sm:w-60 shrink-0 snap-start p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-red-200 dark:border-red-900/60 flex flex-col items-center justify-center text-center gap-3">
                  <span className="text-xs font-extrabold text-[#E11D48] dark:text-red-400 uppercase tracking-wider">
                    +{result!.pins.length - displayLimit} More Pins
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    Get all {result!.pins.length} items in one ZIP archive.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDisplayLimit((prev) => prev + 24)}
                    className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-slate-900 dark:text-white font-bold text-xs shadow-sm hover:bg-red-50"
                  >
                    Load More (+24)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayLimit(result!.pins!.length)}
                    className="text-xs font-bold text-[#E11D48] hover:underline"
                  >
                    Show All ({result!.pins.length})
                  </button>
                </div>
              )}
            </div>

            {/* Right Scroll Arrow */}
            <button
              type="button"
              onClick={() => collectionScrollRef.current?.scrollBy({ left: 360, behavior: 'smooth' })}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-white shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/scroll:opacity-100 focus:opacity-100"
              aria-label="Scroll pins right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : result && (
        <div className="mt-8 p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Preview Section */}
            <div className="w-full md:w-72 aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative shadow-inner group">
              {showPlayer && (selectedQuality || result.video_url) ? (
                <video
                  src={proxyDownloadHref(selectedQuality || result.video_url!, 'preview.mp4', true)}
                  controls
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      resolvedGifUrl(result)
                        ? proxyDownloadHref(resolvedGifUrl(result)!, 'preview.gif', true)
                        : result.thumbnail_url || result.image_url
                    }
                    alt={result.title}
                    style={gifPlaying ? undefined : { filter: 'grayscale(25%) opacity(0.8)' }}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.dataset.fallback) return;
                      el.dataset.fallback = '1';
                      if (result.thumbnail_url && el.src !== result.thumbnail_url) {
                        el.src = result.thumbnail_url;
                      }
                    }}
                  />

                  {/* Play video overlay if video available */}
                  {result.is_video && !showPlayer && (
                    <button
                      type="button"
                      onClick={() => setShowPlayer(true)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white group-hover:bg-black/50 transition-colors"
                      title="Play Preview"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#E11D48] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                      </div>
                    </button>
                  )}

                  {/* GIF Badge & Looping indicator */}
                  {(resolvedGifUrl(result) || result.is_gif || activeVariant === 'gif') && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-black border border-white/20 shadow-md pointer-events-none">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Looping GIF</span>
                    </div>
                  )}

                  {/* GIF Play/Pause animation toggle */}
                  {resolvedGifUrl(result) && (
                    <button
                      type="button"
                      onClick={() => setGifPlaying(!gifPlaying)}
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black/90 text-white text-[10px] font-bold border border-white/20 transition-all shadow-md flex items-center gap-1"
                    >
                      {gifPlaying ? 'Freeze' : 'Play Loop'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col flex-1 gap-3 w-full">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold w-fit border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" />{' '}
                {resolvedGifUrl(result) || (result.is_gif && !result.is_video)
                  ? 'Animated GIF ready — Full loop preserved'
                  : result.is_video && (result.is_gif || activeVariant === 'gif')
                    ? 'Looping animation ready — GIF & MP4 available'
                    : result.is_video
                      ? 'Video ready — HD MP4'
                      : 'Media ready HD'}
              </span>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {result.title}
              </h2>
              {result.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {result.description}
                </p>
              )}

              {/* Quality Selector for videos */}
              {result.qualities && result.qualities.length > 1 && (
                <div className="mt-1">
                  <label htmlFor="quality-select" className="text-xs text-slate-500 block mb-1.5 font-bold uppercase tracking-wider">Select Stream Quality:</label>
                  <select
                    id="quality-select"
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#E11D48] w-full sm:w-auto"
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
                {/* 1. Direct Native GIF Download */}
                {resolvedGifUrl(result) && (
                  <a
                    href={proxyDownloadHref(
                      resolvedGifUrl(result)!,
                      `${slugify(result.title || 'pinterest_gif')}.gif`,
                    )}
                    download={`${slugify(result.title || 'pinterest_gif')}.gif`}
                    aria-busy={savingFile?.endsWith('.gif')}
                    onClick={(e) =>
                      onProxyDownloadClick(
                        e,
                        resolvedGifUrl(result)!,
                        `${slugify(result.title || 'pinterest_gif')}.gif`,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold transition-all text-sm shadow-md shadow-red-500/20 active:scale-95 touch-manipulation"
                    title="Download original looping animated GIF"
                  >
                    {savingFile?.endsWith('.gif') ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{downloadStatusLabel() || 'Downloading GIF…'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Looping GIF (.gif)</span>
                      </>
                    )}
                  </a>
                )}

                {/* 2. Convert Video Pin to Animated GIF (for GIF downloader or video-based GIF pins) */}
                {!resolvedGifUrl(result) && result.video_url && (result.is_gif || activeVariant === 'gif') && (
                  <button
                    type="button"
                    disabled={convertingGif}
                    onClick={() =>
                      handleConvertAndDownloadGif(
                        selectedQuality || result.video_url!,
                        `${slugify(result.title || 'pinterest_gif')}.gif`,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold transition-all text-sm shadow-md shadow-red-500/20 active:scale-95 touch-manipulation disabled:opacity-75"
                    title="Convert and download this pin as a looping animated GIF"
                  >
                    {convertingGif ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{convertProgress.phase || 'Rendering GIF…'} {convertProgress.percent ? `(${convertProgress.percent}%)` : ''}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Download Animated GIF (.gif)</span>
                      </>
                    )}
                  </button>
                )}

                {/* 3. Download MP4 Video */}
                {result.is_video && (selectedQuality || result.video_url) && (
                  <a
                    href={proxyDownloadHref(
                      selectedQuality || result.video_url!,
                      `${slugify(result.title || 'pinterest_video')}.mp4`,
                    )}
                    download={`${slugify(result.title || 'pinterest_video')}.mp4`}
                    aria-busy={savingFile?.endsWith('.mp4')}
                    onClick={(e) =>
                      onProxyDownloadClick(
                        e,
                        selectedQuality || result.video_url!,
                        `${slugify(result.title || 'pinterest_video')}.mp4`,
                      )
                    }
                    className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-extrabold transition-all text-sm shadow-md active:scale-95 touch-manipulation ${
                      resolvedGifUrl(result) || (activeVariant === 'gif' && !resolvedGifUrl(result))
                        ? 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-900/20'
                        : 'bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-red-500/20'
                    }`}
                    title="Download HD MP4 video with audio"
                  >
                    {savingFile?.endsWith('.mp4') ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{downloadStatusLabel() || 'Downloading MP4…'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download MP4 (Video)</span>
                      </>
                    )}
                  </a>
                )}

                {/* 4. Convert video pin to GIF (secondary button when on video tool) */}
                {result.is_video && !resolvedGifUrl(result) && activeVariant !== 'gif' && !result.is_gif && (
                  <button
                    type="button"
                    disabled={convertingGif}
                    onClick={() =>
                      handleConvertAndDownloadGif(
                        selectedQuality || result.video_url!,
                        `${slugify(result.title || 'pinterest_gif')}.gif`,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold transition-all text-sm border border-slate-200 dark:border-slate-700 active:scale-95 touch-manipulation disabled:opacity-60"
                    title="Convert this video pin into an animated looping GIF"
                  >
                    {convertingGif ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{convertProgress.phase || 'Converting…'} {convertProgress.percent ? `(${convertProgress.percent}%)` : ''}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E11D48]" />
                        <span>Save as Looping GIF</span>
                      </>
                    )}
                  </button>
                )}

                {/* 5. Download MP3 Audio */}
                {result.is_video && (selectedQuality || result.video_url) && (
                  <button
                    type="button"
                    disabled={!!savingFile}
                    onClick={(e) => {
                      e.preventDefault();
                      void saveProxyDownload(
                        selectedQuality || result.video_url!,
                        `${slugify(result.title || 'pinterest_audio')}.mp3`,
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all text-sm shadow-md shadow-purple-500/20 active:scale-95 touch-manipulation disabled:opacity-70"
                    title="Extract and download original MP3 audio stream"
                  >
                    {savingFile?.endsWith('.mp3') ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{downloadProgress?.total ? `${Math.round((downloadProgress.loaded / downloadProgress.total) * 100)}%` : 'Downloading MP3…'}</span>
                      </>
                    ) : (
                      <>
                        <Music className="w-4 h-4" />
                        <span>Download MP3 Audio</span>
                      </>
                    )}
                  </button>
                )}

                {/* 6. Complete ZIP Pack */}
                {(result.is_video || resolvedGifUrl(result) || result.is_gif) && (
                  <button
                    type="button"
                    disabled={zipping}
                    onClick={() => downloadSinglePinCompletePack(result)}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold transition-all text-sm shadow-md shadow-amber-500/20 active:scale-95 touch-manipulation disabled:opacity-60"
                    title="Download Looping GIF, MP4 Video, and HD Cover Image together in one ZIP package"
                  >
                    {zipping ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Zipping Pack…</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        <span>Download Pack ({resolvedGifUrl(result) ? 'GIF + ' : ''}MP4 + Cover)</span>
                      </>
                    )}
                  </button>
                )}

                {/* 7. Trim Audio Hook */}
                {result.is_video && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setShowTrimmer(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-sm border border-slate-700 shadow-md active:scale-95 touch-manipulation"
                    title="Trim sound hook and save custom audio clip"
                  >
                    <Scissors className="w-4 h-4 text-[#E11D48]" />
                    <span>Trim Sound Hook (MP3)</span>
                  </button>
                )}

                {/* 8. Download HD Cover Image */}
                {result.image_url && (
                  <a
                    href={proxyDownloadHref(
                      result.image_url,
                      `${slugify(result.title || 'pinterest_cover')}.${mediaFileExtension(result.image_url, 'jpg')}`,
                    )}
                    download={`${slugify(result.title || 'pinterest_cover')}.${mediaFileExtension(result.image_url, 'jpg')}`}
                    onClick={(e) =>
                      onProxyDownloadClick(
                        e,
                        result.image_url!,
                        `${slugify(result.title || 'pinterest_cover')}.${mediaFileExtension(result.image_url, 'jpg')}`,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-all text-sm border border-slate-200 dark:border-slate-700 active:scale-95 touch-manipulation"
                  >
                    <ImageIcon className="w-4 h-4 text-[#E11D48]" />
                    <span>{resolvedGifUrl(result) || result.is_video ? 'Download Cover JPG' : 'Download HD Image'}</span>
                  </a>
                )}

                {/* 9. Crop / Resize Tool */}
                {result.image_url && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setShowCropper(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#E11D48] dark:text-rose-300 font-extrabold transition-all text-sm border border-rose-200 dark:border-rose-800/80 active:scale-95 touch-manipulation"
                    title="Crop photo to 9:16 Story/Reel, 1:1 Instagram Post, or 16:9 Landscape"
                  >
                    <Crop className="w-4 h-4" />
                    <span>Crop / Resize (Social Presets)</span>
                  </button>
                )}
              </div>

              {savingFile && downloadProgress && (
                <div className="mt-3" aria-live="polite">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                    {downloadStatusLabel()}
                  </p>
                  <div
                    className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={downloadProgress.total || 100}
                    aria-valuenow={
                      downloadProgress.total
                        ? Math.round((downloadProgress.loaded / downloadProgress.total) * 100)
                        : undefined
                    }
                    aria-label="Download progress"
                  >
                    <div
                      className={`h-full bg-[#E11D48] origin-left ${
                        downloadProgress.total > 0 ? '' : 'w-1/3 animate-pulse'
                      }`}
                      style={
                        downloadProgress.total > 0
                          ? {
                              transform: `scaleX(${Math.min(1, downloadProgress.loaded / downloadProgress.total)})`,
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}

              {primaryMediaUrl && (
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => void toggleQrPanel()}
                    aria-expanded={qrOpen}
                    aria-controls="phone-qr-panel"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#E11D48]/60 hover:text-[#E11D48] dark:hover:text-rose-300 transition-colors text-xs font-bold touch-manipulation"
                  >
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                    <span>{qrOpen ? 'Hide phone QR' : 'Send to phone'}</span>
                  </button>
                  <div
                    id="phone-qr-panel"
                    hidden={!qrOpen}
                    className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
                  >
                    {qrLoading ? (
                      <div className="h-[136px] w-[136px] shrink-0 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                    ) : qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        width="128"
                        height="128"
                        alt={`QR code linking to the extracted ${result.is_video ? 'video' : 'image'} file — scan to open it on your phone`}
                        className="h-[136px] w-[136px] shrink-0 rounded-xl border border-slate-200 dark:border-slate-600 bg-white p-1"
                      />
                    ) : null}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-w-0">
                      Scan with your phone camera to open this file instantly — then long-press to save it to your gallery. No app or login needed.
                    </p>
                  </div>
                </div>
              )}
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
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Click chip to copy hex</span>
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
                  className="inline-flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 font-bold transition-colors bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-lg"
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
                    const gif = resolvedGifUrl(res);
                    const downloadUrl = gif || res.video_url || res.image_url;
                    if (downloadUrl) {
                      const ext = gif ? 'gif' : res.is_video ? 'mp4' : mediaFileExtension(downloadUrl, 'jpg');
                      void saveProxyDownload(
                        downloadUrl,
                        `${slugify(res.title || 'pin')}.${ext}`,
                      );
                    }
                  }, idx * 800);
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
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold">
                      {resolvedGifUrl(res) ? 'GIF Pin' : res.is_video ? 'Video Pin' : 'Image Pin'}
                    </span>
                  </div>
                </div>
                <a
                  href={proxyDownloadHref(
                    resolvedGifUrl(res) || res.video_url || res.image_url!,
                    `${slugify(res.title || 'pin')}.${resolvedGifUrl(res) ? 'gif' : res.is_video ? 'mp4' : mediaFileExtension(res.image_url || '', 'jpg')}`,
                  )}
                  download={`${slugify(res.title || 'pin')}.${resolvedGifUrl(res) ? 'gif' : res.is_video ? 'mp4' : mediaFileExtension(res.image_url || '', 'jpg')}`}
                  onClick={(e) =>
                    onProxyDownloadClick(
                      e,
                      resolvedGifUrl(res) || res.video_url || res.image_url!,
                      `${slugify(res.title || 'pin')}.${resolvedGifUrl(res) ? 'gif' : res.is_video ? 'mp4' : mediaFileExtension(res.image_url || '', 'jpg')}`,
                    )
                  }
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E11D48] hover:text-white text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Download {resolvedGifUrl(res) ? 'GIF' : res.is_video ? 'MP4' : 'Image'}
                  </span>
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
      {/* Image Cropper Modal */}
      {showCropper && result?.image_url && (
        <ImageCropperModal
          imageUrl={result.image_url}
          title={result.title || 'pinterest_image'}
          onClose={() => setShowCropper(false)}
        />
      )}

      {/* Audio Trimmer Modal */}
      {showTrimmer && (result?.video_url || selectedQuality) && (
        <AudioTrimmer
          audioUrl={selectedQuality || result!.video_url!}
          title={result?.title || 'pinterest_audio'}
          onClose={() => setShowTrimmer(false)}
        />
      )}
    </div>
  );
}
