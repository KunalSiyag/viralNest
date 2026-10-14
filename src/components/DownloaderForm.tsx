import { useState, useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { Loader2, Download, Image as ImageIcon, Copy, Check, Clipboard, Play, Pause, Layers, Archive, User, ChevronRight, ChevronDown, Crop, Scissors, QrCode, ExternalLink, RefreshCw, X, Film, ArrowUp, Link2 } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';
import { Receipt, Specs, Perf, LineItem, Fill } from './results/parts';
import '../styles/results.css';
import AudioTrimmer from './AudioTrimmer';
import { TRANSLATIONS, type LanguageCode } from '../lib/i18n';
import { gifCandidateUrls, isGifUrl, isMediaContentType, mediaFileExtension, toDownloadablePinUrl } from '../lib/pin-media';
import { classifyPinterestInput, getSuitableToolForMedia } from '../lib/pinterest-route';
import { STOCKS, type StockKey } from '../lib/stocks';

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

/** ZIP item deadlines: time to first byte (the proxy probes several CDN paths), then max gap between chunks. */
const ZIP_ITEM_HEADERS_MS = 45_000;
const ZIP_ITEM_IDLE_MS = 30_000;

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


const STOCK_TOOLS: { href: string; label: string; stock: StockKey; variant: FormVariant }[] = [
  { href: '/pinterest-pin-downloader', label: 'Pin', stock: 'pin', variant: 'pin' },
  { href: '/pinterest-video-downloader', label: 'Video MP4', stock: 'video', variant: 'video' },
  { href: '/pinterest-image-downloader', label: 'HD photo', stock: 'image', variant: 'image' },
  { href: '/pinterest-gif-downloader', label: 'GIF', stock: 'gif', variant: 'gif' },
  { href: '/pinterest-board-downloader', label: 'Board ZIP', stock: 'board', variant: 'board' },
  { href: '/pinterest-profile-downloader', label: 'Profile ZIP', stock: 'profile', variant: 'profile' },
  { href: '/pinterest-profile-picture-downloader', label: 'Avatar / DP', stock: 'avatar', variant: 'profile-picture' },
];

const VARIANT_EXPECT: Record<FormVariant, string> = {
  hub: 'Waiting for a link',
  pin: 'Takes a pin link',
  video: 'Takes a video pin',
  image: 'Takes an image pin',
  gif: 'Takes a GIF pin',
  board: 'Takes a board link',
  profile: 'Takes a profile link',
  'profile-picture': 'Takes a profile link',
};

type ResultKind = 'image' | 'video' | 'gif' | 'carousel' | 'board' | 'profile' | 'avatar';

const KIND_LABEL: Record<ResultKind, string> = {
  image: 'Image pin',
  video: 'Video pin',
  gif: 'GIF pin',
  carousel: 'Carousel',
  board: 'Board',
  profile: 'Profile',
  avatar: 'Profile picture',
};

type ErrorKind = 'validation' | 'link' | 'private' | 'removed' | 'download' | 'other';

/** Sort an error message into the recovery it needs (wording comes from the API or this form). */
function errorKind(msg: string): ErrorKind {
  if (!msg) return 'other';
  if (/^Paste (a public|at least)|^Please enter valid Pinterest URLs/.test(msg)) return 'validation';
  if (/invalid link|valid Pinterest link/i.test(msg)) return 'link';
  if (/removed/i.test(msg)) return 'removed';
  if (/could not download|download failed|no response body|could not pack|failed to create zip|qr code|copy the link/i.test(msg)) return 'download';
  if (/private|public|empty/i.test(msg)) return 'private';
  return 'other';
}

const VOID_COPY: Record<ErrorKind, { title: string; hint?: string }> = {
  validation: { title: 'Paste a link first' },
  link: {
    title: 'That isn\u2019t a Pinterest link',
    hint: 'In the Pinterest app tap Share \u2192 Copy link, then paste it into the ticket.',
  },
  private: {
    title: 'Nothing public to collect',
    hint: 'Only public pins, boards and profiles can be saved. Secret boards and private accounts stay private.',
  },
  removed: { title: 'This pin was taken down' },
  download: { title: 'The file didn\u2019t download', hint: 'Pinterest sometimes stops serving a file. Try the link again.' },
  other: { title: 'Couldn\u2019t collect this link', hint: 'Check the link opens on Pinterest, then try again.' },
};

/** Read a pasted link the way a cloakroom attendant reads a ticket: type + number. */
function readTicket(raw: string, variant: FormVariant): {
  stamp: string;
  tone: 'ok' | 'warn' | 'none';
  serial: string;
  color: string;
  onColor?: string;
  expect: string;
  help?: string;
} {
  const expect = VARIANT_EXPECT[variant];
  const text = raw.trim();
  if (!text) return { stamp: '', tone: 'none', serial: '', color: '', expect };
  const route = classifyPinterestInput(text);
  if (!route) {
    const looksLikeUrl = /^(https?:\/\/|www\.)|\.[a-z]{2,}\//i.test(text);
    return {
      stamp: looksLikeUrl ? 'Not Pinterest' : '',
      tone: looksLikeUrl ? 'warn' : 'none',
      serial: '',
      color: '',
      expect,
      help: looksLikeUrl
        ? 'This isn’t a Pinterest link. In the Pinterest app tap Share → Copy link, then paste it here.'
        : undefined,
    };
  }
  let serial = '';
  const pinId = text.match(/\/pin\/(?:[^/?#]*--)?(\d{5,})/i);
  const short = text.match(/pin\.it\/([A-Za-z0-9]+)/i);
  if (pinId) serial = pinId[1];
  else if (short) serial = `pin.it/${short[1]}`;
  else {
    try {
      const u = new URL(text.match(/https?:\/\/\S+/)?.[0] || `https://${text}`);
      serial = u.pathname.replace(/\/+$/, '') || '';
    } catch {
      serial = '';
    }
  }
  const stamp =
    route.type === 'board'
      ? 'Board → ZIP'
      : route.type === 'profile'
        ? variant === 'profile-picture'
          ? 'Profile → Avatar'
          : 'Profile → ZIP'
        : short
          ? 'Pin · short link'
          : 'Pin';
  const key: StockKey = route.type === 'board' ? 'board' : route.type === 'profile' ? (variant === 'profile-picture' ? 'avatar' : 'profile') : 'pin';
  return { stamp, tone: 'ok', serial, color: STOCKS[key].color, onColor: STOCKS[key].onColor, expect };
}

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
  const [gifPlaying, setGifPlaying] = useState<boolean>(true);

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
  /** Aborts the ZIP being packed (Cancel button, or leaving the page). */
  const zipAbortRef = useRef<AbortController | null>(null);
  useEffect(() => () => zipAbortRef.current?.abort(), []);
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
  // Receipt-only display state: what was handed to the browser, and copy feedback.
  const [zipDone, setZipDone] = useState<{ name: string; packed: number; total: number } | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [attemptFile, setAttemptFile] = useState<string | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const voidHeadingRef = useRef<HTMLHeadingElement>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 30]);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  };

  // Pagination limit for board/profile pins
  const [displayLimit, setDisplayLimit] = useState<number>(12);

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
    if ((mode === 'single' || isHero) && !url.trim()) {
      setError('Paste a public Pinterest link first. In the app: Share → Copy link.');
      document.getElementById('pinterest-url-input')?.focus();
      return;
    }
    if (mode === 'batch' && !isHero && !batchUrls.trim()) {
      setError('Paste at least one Pinterest link, one per line.');
      return;
    }

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

  const samplePalette = ['#C8281A', '#2D3748', '#ED8936', '#319795', '#D69E2E'];

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

  const saveProxyDownload = async (mediaUrl: string, filename: string) => {
    setError('');
    setLastSaved(null);
    setAttemptFile(filename);
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
      setLastSaved(filename);
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
    const run = new AbortController();
    zipAbortRef.current = run;
    setZipping(true);
    setZipProgress({ done: 0, total: entries.length });
    setError('');
    setZipDone(null);

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folderName = slugify(archiveName);
      const folder = zip.folder(folderName) || zip;
      let done = 0;
      let packed = 0;
      let failed = 0;

      // Each file gets a deadline: one stalled body must not freeze the archive.
      // Headers can take a while (the proxy probes several CDN paths); after
      // that, the body must keep moving.
      const fetchItem = async (url: string): Promise<Blob> => {
        const item = new AbortController();
        const stop = () => item.abort();
        run.signal.addEventListener('abort', stop);
        let timer = setTimeout(stop, ZIP_ITEM_HEADERS_MS);
        const touch = () => {
          clearTimeout(timer);
          timer = setTimeout(stop, ZIP_ITEM_IDLE_MS);
        };
        try {
          const res = await fetch(url, { signal: item.signal });
          const type = res.headers.get('content-type') || '';
          if (!res.ok || !isMediaContentType(type) || !res.body) throw new Error(`HTTP ${res.status}`);
          touch();
          const reader = res.body.getReader();
          const chunks: Uint8Array[] = [];
          for (;;) {
            const { done: finished, value } = await reader.read();
            if (finished) break;
            if (value) chunks.push(value);
            touch();
          }
          return new Blob(chunks as BlobPart[], { type });
        } finally {
          clearTimeout(timer);
          run.signal.removeEventListener('abort', stop);
        }
      };

      const concurrency = 4;
      for (let i = 0; i < entries.length && !run.signal.aborted; i += concurrency) {
        const batch = entries.slice(i, i + concurrency);
        await Promise.all(
          batch.map(async (entry) => {
            try {
              const blob = await fetchItem(
                `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(entry.url))}&filename=${encodeURIComponent(entry.filename)}`,
              );
              folder.file(entry.filename, blob);
              packed++;
            } catch (e) {
              if (!run.signal.aborted) console.warn('ZIP item failed:', entry.filename, e);
              failed++;
            } finally {
              done++;
              if (!run.signal.aborted) setZipProgress({ done, total: entries.length });
            }
          }),
        );
      }

      // Cancelled: nothing to save and nothing went wrong.
      if (run.signal.aborted) return;

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
      setZipDone({ name: `${slugify(archiveName)}.zip`, packed, total: entries.length });

      if (failed > 0) {
        setError(`ZIP ready with ${entries.length - failed} of ${entries.length} files (${failed} failed).`);
      }
    } catch (err: any) {
      if (!run.signal.aborted) setError(err?.message || 'Failed to create ZIP archive.');
    } finally {
      if (zipAbortRef.current === run) zipAbortRef.current = null;
      setZipping(false);
      setZipProgress({ done: 0, total: 0 });
    }
  };

  const cancelZip = () => zipAbortRef.current?.abort();

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

  const reading = readTicket(url, activeVariant);
  const showBatchTabs = !isHero && copy.showBatch;
  const batchActive = mode === 'batch' && copy.showBatch && !isHero;

  /* ── Receipt (post-extraction) helpers: presentation only ─────────────── */
  const gifUrl = resolvedGifUrl(result);
  const resultKind: ResultKind | null = !result
    ? null
    : isCarousel && result.media_items
      ? 'carousel'
      : result.is_avatar_only
        ? 'avatar'
        : isCollection
          ? result.is_profile
            ? 'profile'
            : 'board'
          : gifUrl || (result.is_gif && !result.is_video)
            ? 'gif'
            : result.is_video
              ? 'video'
              : 'image';
  const receiptSerial = result?.pin_id || reading.serial || (result?.username ? `@${result.username}` : '');
  const nf = (n: number) => new Intl.NumberFormat().format(n);
  const pctOf = (done: number, total: number) => (total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0);

  /** The one file this receipt is for, in the order the old panel offered them. */
  const primaryFile: { url: string; filename: string; format: string } | null = !result
    ? null
    : gifUrl
      ? { url: gifUrl, filename: `${slugify(result.title || 'pinterest_gif')}.gif`, format: 'GIF' }
      : result.is_video && (selectedQuality || result.video_url)
        ? {
            url: selectedQuality || result.video_url!,
            filename: `${slugify(result.title || 'pinterest_video')}.mp4`,
            format: 'MP4',
          }
        : result.image_url
          ? {
              url: result.image_url,
              filename: `${slugify(result.title || 'pinterest_cover')}.${mediaFileExtension(result.image_url, 'jpg')}`,
              format: mediaFileExtension(result.image_url, 'jpg').toUpperCase(),
            }
          : null;
  const currentQuality = result?.qualities?.find((q) => q.url === (selectedQuality || result?.video_url));

  const isPartialZipMsg = /^ZIP ready with/.test(error);
  const errKind = errorKind(error);

  const savingNow = (filename: string) => savingFile === filename && !!downloadProgress;
  const savingPct = downloadProgress?.total ? pctOf(downloadProgress.loaded, downloadProgress.total) : null;

  const focusReceipt = (el: HTMLElement | null) => {
    if (!el) return;
    el.focus({ preventScroll: true });
    const box = el.closest('.rc') as HTMLElement | null;
    if (!box) return;
    const top = box.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.45) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  // A fresh result clears the previous receipt's notes and takes focus.
  useEffect(() => {
    setZipDone(null);
    setLastSaved(null);
    setAttemptFile(null);
    setCopiedLink(false);
    if (!result) return;
    const id = requestAnimationFrame(() => focusReceipt(resultHeadingRef.current));
    return () => cancelAnimationFrame(id);
  }, [result]);

  useEffect(() => {
    if (!batchResults.length) return;
    const id = requestAnimationFrame(() => focusReceipt(resultHeadingRef.current));
    return () => cancelAnimationFrame(id);
  }, [batchResults]);

  // A failed claim takes focus too, except empty-field validation (the input keeps focus).
  useEffect(() => {
    if (!error || loading || result || batchResults.length || errorKind(error) === 'validation') return;
    const id = requestAnimationFrame(() => focusReceipt(voidHeadingRef.current));
    return () => cancelAnimationFrame(id);
  }, [error, loading]);

  const focusTicket = () => {
    const el = (document.getElementById('pinterest-url-input') || document.getElementById('batch-urls-input')) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.select();
    el.closest('form')?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  const startAnother = () => {
    setResult(null);
    setBatchResults([]);
    setError('');
    setBatchUrls('');
    handleUrlInput('');
    requestAnimationFrame(focusTicket);
  };

  const copyFileLink = async (mediaUrl: string) => {
    try {
      await navigator.clipboard.writeText(toDownloadablePinUrl(mediaUrl));
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setError('Could not copy the link. Long-press the download button to copy it instead.');
    }
  };

  const captionFor = (res: ExtractionResult, platform: 'reels' | 'tiktok' | 'shorts') => {
    const tagsStr = (res.tags || []).map((t) => `#${t}`).join(' ');
    if (platform === 'reels') return `✨ ${res.title}\n\nTag someone who needs to see this! 👇\n\n📌 Saved via PintDownload\n\n${tagsStr} #reels #viral #aesthetic`;
    if (platform === 'tiktok') return `POV: ${res.title} 🌿🔥\n\nFollow for more daily aesthetic pins & inspo!\n\n${tagsStr} #fyp #viral #pinterest #foryou`;
    return `🔥 ${res.title} | Pinterest Aesthetic\n\nLike & Subscribe for more daily visual content!\n\n${tagsStr} #shorts #pintdownload #pinterest`;
  };

  // Screen-reader narration: coarse steps only, so progress never floods the queue.
  const liveMsg = loading
    ? batchActive
      ? 'Reading your links…'
      : 'Reading your link…'
    : zipping && zipProgress.total
      ? `Packing ZIP, ${Math.floor(pctOf(zipProgress.done, zipProgress.total) / 25) * 25}% done`
      : savingFile && downloadProgress
        ? savingPct === null
          ? `Downloading ${savingFile}…`
          : `Downloading ${savingFile}, ${Math.floor(savingPct / 25) * 25}% done`
        : zipDone
          ? `ZIP packed with ${zipDone.packed} of ${zipDone.total} files. Download started.`
          : lastSaved
            ? `Download started: ${lastSaved}`
            : copiedLink || copiedTags || copiedCaption || copiedColor
              ? 'Copied to clipboard.'
              : '';

  /** Collect button: label stays put; a spinner and a stock-coloured strip show progress. */
  const fileCta = (file: { url: string; filename: string; format: string }, label: string) => (
    <>
      <a
        href={proxyDownloadHref(file.url, file.filename)}
        download={file.filename}
        onClick={(e) => onProxyDownloadClick(e, file.url, file.filename)}
        aria-busy={savingFile === file.filename}
        className="rc-cta"
        data-primary=""
      >
        {savingFile === file.filename ? (
          <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <Download aria-hidden="true" />
        )}
        <span>{label}</span>
        {savingNow(file.filename) && <Fill value={savingPct === null ? null : savingPct / 100} />}
      </a>
      {savingNow(file.filename) ? (
        <p
          className="rc-note"
          role="progressbar"
          aria-label="Download progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={savingPct ?? undefined}
          aria-valuetext={downloadStatusLabel()}
        >
          {downloadStatusLabel()}
        </p>
      ) : (
        <p className="rc-note">
          <span className="rc-file">
            Saves as <b translate="no">{file.filename}</b>
          </span>
        </p>
      )}
    </>
  );

  /** ZIP collect button for carousels, boards and profiles. */
  const zipCta = (count: number, archiveName: string, onCollect: () => void, stock: StockKey) => (
    <>
      <button
        type="button"
        className="rc-cta"
        data-primary=""
        aria-disabled={zipping || undefined}
        aria-busy={zipping}
        onClick={() => {
          if (zipping) return;
          setAttemptFile('zip');
          onCollect();
        }}
      >
        {zipping ? (
          <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <Archive aria-hidden="true" />
        )}
        <span>Download ZIP ({nf(count)})</span>
        {zipping && zipProgress.total > 0 && <Fill value={zipProgress.done / zipProgress.total} />}
      </button>
      {zipping && zipProgress.total > 0 ? (
        <div className="rc-note rc-note--row">
          <p
            role="progressbar"
            aria-label="ZIP packing progress"
            aria-valuemin={0}
            aria-valuemax={zipProgress.total}
            aria-valuenow={zipProgress.done}
            aria-valuetext={`${zipProgress.done} of ${zipProgress.total} files packed`}
          >
            Packing <b>{nf(zipProgress.done)}</b> of {nf(zipProgress.total)} files…
          </p>
          <button type="button" className="rc-btn rc-btn--quiet" onClick={cancelZip}>
            <X aria-hidden="true" />
            Cancel<span className="sr-only"> ZIP</span>
          </button>
        </div>
      ) : zipDone ? (
        zipNotice(stock)
      ) : (
        <p className="rc-note">
          <span className="rc-file">
            Saves as <b translate="no">{slugify(archiveName)}.zip</b>
          </span>
        </p>
      )}
    </>
  );

  /** What happened to the last ZIP: packed in full, or partly. */
  const zipNotice = (stock: StockKey) =>
    zipDone ? (
      <div className="rc-notice" data-zip-done="">
        {zipDone.packed < zipDone.total ? (
          <>
            <span className="stamp stamp-warn" aria-hidden="true">Partial</span>
            <p>
              <b translate="no">{zipDone.name}</b> has {nf(zipDone.packed)} of {nf(zipDone.total)} files.{' '}
              {nf(zipDone.total - zipDone.packed)} could not be fetched from Pinterest; save those one at a time.
            </p>
          </>
        ) : (
          <>
            <span
              className="stamp stamp-ok"
              aria-hidden="true"
              style={{ '--stamp-bg': STOCKS[stock].color, '--stamp-ink': STOCKS[stock].onColor } as React.CSSProperties}
            >
              Packed
            </span>
            <p>
              <b translate="no">{zipDone.name}</b>: all {nf(zipDone.total)} files. Download started.
            </p>
          </>
        )}
      </div>
    ) : null;

  /** Download-time problems print on the receipt, next to the button that caused them. */
  const errorFor = (file: string | null) => (error && !isPartialZipMsg && attemptFile === file ? true : false);
  const receiptError =
    error && !isPartialZipMsg ? (
      <div className="rc-notice" role="alert">
        <span className="stamp stamp-warn" aria-hidden="true">Void</span>
        <p>{error}</p>
      </div>
    ) : null;

  const savedNotice =
    lastSaved && !savingFile && lastSaved === primaryFile?.filename ? (
      <div className="rc-notice">
        <span className="stamp stamp-ok" aria-hidden="true">Done</span>
        <p>
          Download started: <b translate="no">{lastSaved}</b>
        </p>
      </div>
    ) : null;

  const anotherBtn = (
    <button type="button" className="rc-btn rc-btn--quiet rc-push" onClick={startAnother}>
      <ArrowUp aria-hidden="true" />
      Download another
    </button>
  );

  const resultHeading = (text: string, sub?: ReactNode) => (
    <div className="rc-head">
      <h2 id="result-heading" ref={resultHeadingRef} tabIndex={-1} className="rc-title">
        {text}
      </h2>
      {sub ? <p className="rc-sub">{sub}</p> : null}
    </div>
  );

  /** One pin/slide in a grid: thumbnail, number, kind stamp, and its own save button. */
  const tile = (opts: {
    key: string;
    no: string;
    thumb: string;
    title: string;
    mediaUrl: string;
    filename: string;
    ext: string;
    isVideo: boolean;
    srName: string;
  }) => {
    const fmt = opts.isVideo ? 'MP4' : opts.ext === 'gif' ? 'GIF' : opts.ext.toUpperCase();
    return (
      <li key={opts.key} className="rc-tile">
        <div className="rc-thumb">
          <img src={opts.thumb} alt={opts.title} loading="lazy" decoding="async" width={240} height={320} />
          <span className="rc-no" aria-hidden="true">{opts.no}</span>
          {(opts.isVideo || opts.ext === 'gif') && (
            <span
              className="rc-kind"
              aria-hidden="true"
              style={{ '--kind': STOCKS[opts.isVideo ? 'video' : 'gif'].color } as React.CSSProperties}
            >
              {opts.isVideo ? 'Video' : 'GIF'}
            </span>
          )}
        </div>
        <p className="rc-tile-title" title={opts.title}>{opts.title}</p>
        <a
          href={proxyDownloadHref(opts.mediaUrl, opts.filename)}
          download={opts.filename}
          onClick={(e) => onProxyDownloadClick(e, opts.mediaUrl, opts.filename)}
          aria-busy={savingFile === opts.filename}
          className="rc-btn"
        >
          {savingFile === opts.filename ? (
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Download aria-hidden="true" />
          )}
          <span>
            Save {fmt}
            <span className="sr-only">, {opts.srName}</span>
          </span>
        </a>
      </li>
    );
  };

  return (
    <div className={`w-full mx-auto ${isHero ? 'max-w-2xl mt-0' : 'max-w-3xl mt-4'}`} data-downloader="">
      <form
        onSubmit={handleSubmit}
        className="ticket"
        data-tearing={loading ? 'true' : 'false'}
        aria-busy={loading}
      >
        <div className="ticket-paper">
        <div className="ticket-head">
          <span className="t-label">Admit one · public link</span>
          <span className="ticket-serial" aria-live="polite" translate="no">
            {reading.serial ? <>No.&nbsp;{reading.serial}</> : 'No. ——————'}
          </span>
        </div>

        <div className="ticket-body">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-h-[2rem]">
            {showBatchTabs ? (
              <div className="inline-flex rounded-md border-2 border-[var(--ink)] overflow-hidden text-sm font-bold" role="group" aria-label="Link mode">
                <button
                  type="button"
                  aria-pressed={mode === 'single'}
                  onClick={() => { setMode('single'); setError(''); }}
                  className={`px-3 min-h-[2.75rem] touch-manipulation ${mode === 'single' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  One link
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'batch'}
                  onClick={() => { setMode('batch'); setError(''); }}
                  className={`px-3 min-h-[2.75rem] touch-manipulation inline-flex items-center gap-1.5 ${mode === 'batch' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  <Layers className="w-4 h-4" aria-hidden="true" />
                  Up to 5
                </button>
              </div>
            ) : (
              <label htmlFor="pinterest-url-input" className="text-sm font-bold">
                {activeVariant === 'hub' ? 'Pinterest link' : copy.singleTab}
              </label>
            )}
            {!batchActive && (
              reading.stamp ? (
                <span
                  key={reading.stamp}
                  className={`stamp stamp-in ${reading.tone === 'warn' ? 'stamp-warn' : 'stamp-ok'}`}
                  style={reading.tone === 'ok' ? ({ '--stamp-bg': reading.color, '--stamp-ink': reading.onColor } as React.CSSProperties) : undefined}
                >
                  {reading.stamp}
                </span>
              ) : (
                <span className="text-sm text-[var(--ink-2)]">{reading.expect}</span>
              )
            )}
          </div>

          {!batchActive ? (
            <div className="ticket-input">
              {showBatchTabs && (
                <label htmlFor="pinterest-url-input" className="sr-only">{copy.ariaLabel}</label>
              )}
              <input
                id="pinterest-url-input"
                type="url"
                name="url"
                value={url}
                onChange={(e) => handleUrlInput(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData?.getData('text');
                  if (text) {
                    e.preventDefault();
                    handleUrlInput(text.trim());
                  }
                }}
                placeholder={activePlaceholder}
                required
                aria-label={copy.ariaLabel}
                aria-describedby="ticket-hint"
                autoComplete="url"
                inputMode="url"
                spellCheck={false}
              />
              {url ? (
                <button
                  type="button"
                  onClick={() => handleUrlInput('')}
                  className="shrink-0 min-h-[44px] min-w-[44px] px-2 rounded text-sm font-bold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/10 touch-manipulation"
                  aria-label="Clear link"
                >
                  <X className="w-5 h-5 mx-auto" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="shrink-0 min-h-[44px] px-3 rounded inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ink)] text-[var(--paper)] hover:bg-brand-600 hover:text-white touch-manipulation"
                  aria-label="Paste link from clipboard"
                >
                  <Clipboard className="w-4 h-4" aria-hidden="true" />
                  Paste
                </button>
              )}
            </div>
          ) : (
            <div className="ticket-input flex-col">
              <label htmlFor="batch-urls-input" className="sr-only">
                Batch Pinterest URLs (up to 5 URLs, one per line)
              </label>
              <textarea
                id="batch-urls-input"
                name="batchUrls"
                rows={4}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                placeholder={'One link per line, up to 5…\nhttps://pinterest.com/pin/1234567/\nhttps://pin.it/abc1234'}
                required
                spellCheck={false}
                aria-describedby="ticket-hint"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="self-end mb-1 mr-1 min-h-[44px] px-3 rounded inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ink)] text-[var(--paper)] hover:bg-brand-600 hover:text-white touch-manipulation"
              >
                <Clipboard className="w-4 h-4" aria-hidden="true" />
                Paste
              </button>
            </div>
          )}

          {routeNotice && !batchActive && (
            <p className="mt-3 flex items-start gap-2 text-sm font-semibold" role="status">
              <RefreshCw className="w-4 h-4 mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="min-w-0">
                {routeNotice.message.replace(/—\s*automatically switched to/, '· switched to')}.{' '}
                <a href={routeNotice.path} className="underline font-bold">Open that tool</a>
              </span>
            </p>
          )}
          {reading.tone === 'warn' && reading.help && !batchActive && (
            <p className="mt-3 text-sm font-semibold text-brand-700 dark:text-brand-300" role="status">
              {reading.help}
            </p>
          )}
          <p id="ticket-hint" className="mt-3 text-sm leading-relaxed text-[var(--ink-2)]">
            {copy.hint}
          </p>
        </div>
        </div>

        <div className="perf" aria-hidden="true" />

        <div className="stub">
          <button
            type="submit"
            className="stub-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                <span>{batchActive ? 'Processing links…' : t.processingText}</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" aria-hidden="true" />
                <span>{batchActive ? 'Extract all' : activeSubmitLabel}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <nav aria-label="Pick the tool for your link" className="mt-4 flex flex-wrap gap-2">
        {STOCK_TOOLS.map((tool) => (
          <a
            key={tool.href}
            href={tool.href}
            className="stock-chip"
            data-stock={tool.stock}
            style={{ '--chip': STOCKS[tool.stock].color, '--chip-ink': STOCKS[tool.stock].onColor } as React.CSSProperties}
            aria-current={tool.variant === activeVariant ? 'page' : undefined}
          >
            {tool.label}
          </a>
        ))}
      </nav>

      <p className="sr-only" aria-live="polite">{liveMsg}</p>

      {/* Loading: an unprinted receipt carrying the ticket's serial, same footprint as a single-pin receipt */}
      {loading && (
        <section className="rc rc--loading rc--wide" aria-hidden="true" data-loading="">
          <div className="rc-band">
            <span className="t-label">Fetching from Pinterest…</span>
            {reading.serial && !batchActive ? (
              <span className="rc-serial" translate="no">No.&nbsp;{reading.serial}</span>
            ) : null}
          </div>
          <div className="rc-split">
          <div className="rc-main">
          <div className="rc-body">
            <div className="rc-head">
              <span className="rc-skel" style={{ height: '1.35rem', width: '82%' }} />
              <span className="rc-skel" style={{ height: '1rem', width: '58%', marginTop: '0.5rem' }} />
            </div>
            <div className="rc-media rc-skel" />
            <div className="rc-info">
              <span className="rc-skel" style={{ height: '2.75rem', width: '64%' }} />
            </div>
          </div>
          <div className="rc-collect">
            <span className="rc-skel" style={{ height: '3.5rem' }} />
            <span className="rc-skel" style={{ height: '0.875rem', width: '46%', marginTop: '0.75rem' }} />
          </div>
          </div>
          </div>
        </section>
      )}

      {/* Void: the claim could not be fulfilled */}
      {error && !loading && !result && batchResults.length === 0 && (
        errKind === 'validation' ? (
          <div role="alert" className="rc rc--compact">
            <span className="stamp stamp-warn" aria-hidden="true">Void</span>
            <p>{error}</p>
          </div>
        ) : (
          <section className="rc rc--void" aria-labelledby="void-heading" data-print="" data-void={errKind}>
            <div className="rc-void-head">
              <span className="stamp stamp-warn" aria-hidden="true">Void</span>
              <h2
                id="void-heading"
                ref={voidHeadingRef}
                tabIndex={-1}
                aria-describedby="void-msg"
                className="rc-title"
              >
                {VOID_COPY[errKind].title}
              </h2>
            </div>
            <p id="void-msg" className="rc-void-msg">{error}</p>
            {VOID_COPY[errKind].hint && <p className="rc-void-hint">{VOID_COPY[errKind].hint}</p>}
            <div className="rc-tools">
              <button type="button" className="rc-btn" onClick={focusTicket}>
                <RefreshCw aria-hidden="true" />
                Try another link
              </button>
              {(errKind === 'link' || errKind === 'private') && (
                <a href="/how-to-download-pinterest-videos" className="rc-btn rc-btn--quiet">
                  Read the step-by-step guide
                  <ChevronRight aria-hidden="true" />
                </a>
              )}
            </div>
          </section>
        )
      )}

      {/* ── Carousel / multi-slide pin ─────────────────────────────── */}
      {resultKind === 'carousel' && result?.media_items ? (
        (() => {
          const items = result.media_items;
          const archiveName = `carousel_${result.title || result.pin_id || 'pinterest'}`;
          const vids = items.filter((m) => m.type === 'video').length;
          const gifs = items.filter((m) => m.type !== 'video' && (m.type === 'gif' || isGifUrl(m.url))).length;
          const pad = String(items.length).length < 2 ? 2 : String(items.length).length;
          return (
            <Receipt
              stock="image"
              label="Ready · Carousel"
              icon={<Layers aria-hidden="true" />}
              serial={receiptSerial}
              labelledBy="result-heading"
              key={`carousel-${result.pin_id || result.title}`}
              className="rc--wide"
            >
              <div className="rc-top">
              <div className="rc-body rc-body--plain">
                {resultHeading(result.title || 'Pinterest Carousel', result.description || undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: 'Slides', value: nf(items.length) },
                      { label: 'Images', value: items.length - vids - gifs ? nf(items.length - vids - gifs) : null },
                      { label: 'Videos', value: vids ? nf(vids) : null },
                      { label: 'GIFs', value: gifs ? nf(gifs) : null },
                    ]}
                  />
                </div>
              </div>
              <div className="rc-collect">
                {zipCta(items.length, archiveName, () => downloadCarouselAsZip(items, archiveName), 'image')}
                {receiptError}
                {savedNotice}
              </div>
              </div>
              <Perf />
              <div className="rc-section">
                <h3 className="rc-h3">Every slide</h3>
                <ul className="rc-grid">
                  {items.map((item, idx) => {
                    const ext =
                      item.type === 'video'
                        ? 'mp4'
                        : item.type === 'gif' || isGifUrl(item.url)
                          ? 'gif'
                          : mediaFileExtension(item.url, 'jpg');
                    return tile({
                      key: String(idx),
                      no: `${String(idx + 1).padStart(pad, '0')}/${String(items.length).padStart(pad, '0')}`,
                      thumb: item.thumbnail_url || (item.type === 'image' ? item.url : result.thumbnail_url) || '',
                      title: item.title || `Slide ${idx + 1}`,
                      mediaUrl: item.url,
                      filename: `slide_${idx + 1}.${ext}`,
                      ext,
                      isVideo: item.type === 'video',
                      srName: `slide ${idx + 1}`,
                    });
                  })}
                </ul>
              </div>
              <div className="rc-tools">{anotherBtn}</div>
            </Receipt>
          );
        })()
      ) : resultKind === 'avatar' && result ? (
        /* ── Profile picture only ─────────────────────────────────── */
        (() => {
          const avatarName = `pinterest_avatar_${result.username || 'user'}.jpg`;
          const name = result.profile_title || (result.username ? `@${result.username}` : 'Pinterest user');
          return (
            <Receipt
              stock="avatar"
              label="Ready · Profile picture"
              icon={<User aria-hidden="true" />}
              serial={reading.serial || (result.username ? `@${result.username}` : '')}
              labelledBy="result-heading"
              key={`avatar-${result.username}`}
              className="rc--wide"
            >
              <div className="rc-split">
              <div className="rc-main">
              <div className="rc-body">
                <div className="rc-media rc-media--square">
                  {result.profile_avatar_url ? (
                    <img src={result.profile_avatar_url} alt={`${name} profile picture`} width={400} height={400} decoding="async" />
                  ) : (
                    <div className="grid h-full place-items-center text-[var(--ink-2)]">
                      <User className="h-12 w-12" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {resultHeading(name, result.username && result.profile_title ? <span translate="no">@{result.username}</span> : undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: 'Format', value: 'JPG' },
                      { label: 'Crop', value: 'Uncropped' },
                    ]}
                  />
                </div>
              </div>
              {result.profile_avatar_url && (
                <div className="rc-collect">
                  {fileCta({ url: result.profile_avatar_url, filename: avatarName, format: 'JPG' }, 'Download JPG')}
                  {receiptError}
                  {savedNotice}
                </div>
              )}
              </div>
              <div className="rc-side">
              <Perf />
              <div className="rc-tools">
                {result.profile_avatar_url && (
                  <a href={result.profile_avatar_url} target="_blank" rel="noopener noreferrer" className="rc-btn">
                    <ExternalLink aria-hidden="true" />
                    Open full size
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                {result.profile_avatar_url && (
                  <button type="button" className="rc-btn" onClick={() => void copyFileLink(result.profile_avatar_url!)}>
                    {copiedLink ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                    {copiedLink ? 'Link copied' : 'Copy file link'}
                  </button>
                )}
                {anotherBtn}
              </div>
              <p className="rc-void-hint pb-4">
                Want every pin from this profile? Use the{' '}
                <a href="/pinterest-profile-downloader" className="font-bold text-[var(--ink)] underline">
                  Profile Downloader (ZIP)
                </a>{' '}
                instead.
              </p>
              </div>
              </div>
            </Receipt>
          );
        })()
      ) : (resultKind === 'board' || resultKind === 'profile') && result?.pins ? (
        /* ── Board / profile collection ───────────────────────────── */
        (() => {
          const pins = result.pins;
          const isProfile = resultKind === 'profile';
          const title = isProfile
            ? result.profile_title || result.board_title || 'Pinterest Profile'
            : result.board_title || 'Pinterest Board';
          const archiveName = isProfile
            ? `profile_${result.username || 'pinterest'}`
            : `board_${result.board_title || 'pinterest'}`;
          const vids = pins.filter((p) => p.is_video && p.video_url).length;
          const gifs = pins.filter((p) => !(p.is_video && p.video_url) && mediaFileExtension(p.image_url, 'jpg') === 'gif').length;
          const avatarName = `pinterest_avatar_${result.username || 'user'}.jpg`;
          const shown = Math.min(displayLimit, pins.length);
          return (
            <Receipt
              stock={isProfile ? 'profile' : 'board'}
              label={isProfile ? 'Ready · Profile' : 'Ready · Board'}
              icon={isProfile ? <User aria-hidden="true" /> : <Archive aria-hidden="true" />}
              serial={reading.serial || (result.username ? `@${result.username}` : '')}
              labelledBy="result-heading"
              key={`${resultKind}-${result.board_url || result.username}`}
              className="rc--wide"
            >
              <div className="rc-top">
              <div className={`rc-body ${isProfile && result.profile_avatar_url ? '' : 'rc-body--plain'}`}>
                {isProfile && result.profile_avatar_url && (
                  <div className="rc-media rc-media--square">
                    <img src={result.profile_avatar_url} alt={`${title} profile picture`} width={400} height={400} decoding="async" />
                  </div>
                )}
                {resultHeading(title, result.username ? <span translate="no">{isProfile ? '' : 'by '}@{result.username}</span> : undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: 'Pins', value: nf(pins.length) },
                      { label: 'Images', value: pins.length - vids - gifs ? nf(pins.length - vids - gifs) : null },
                      { label: 'Videos', value: vids ? nf(vids) : null },
                      { label: 'GIFs', value: gifs ? nf(gifs) : null },
                      { label: 'Boards', value: isProfile && result.boards?.length ? nf(result.boards.length) : null },
                    ]}
                  />
                </div>
              </div>
              <div className="rc-collect">
                {zipCta(pins.length, archiveName, () => downloadCollectionAsZip(pins, archiveName), isProfile ? 'profile' : 'board')}
                {receiptError}
                {savedNotice}
              </div>
              </div>
              <Perf />
              {isProfile && result.profile_avatar_url && (
                <div className="rc-section">
                  <h3 className="rc-h3">Also on this profile</h3>
                  <ul className="rc-items">
                    <LineItem format="JPG" name="Profile picture" note="Full size, uncropped">
                      <a
                        href={proxyDownloadHref(result.profile_avatar_url, avatarName)}
                        download={avatarName}
                        onClick={(e) => onProxyDownloadClick(e, result.profile_avatar_url!, avatarName)}
                        aria-busy={savingFile === avatarName}
                        className="rc-btn"
                      >
                        {savingFile === avatarName ? (
                          <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                          <Download aria-hidden="true" />
                        )}
                        Download<span className="sr-only"> profile picture (JPG)</span>
                      </a>
                    </LineItem>
                  </ul>
                </div>
              )}
              {isProfile && result.boards && result.boards.length > 0 && (
                <div className="rc-section">
                  <h3 className="rc-h3">Boards ({nf(result.boards.length)})</h3>
                  <p className="rc-item-note mt-1">Open a board to collect just its pins.</p>
                  <ul className="rc-rows">
                    {result.boards.map((b, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="rc-row"
                          onClick={() => {
                            setUrl(b.url);
                            extractSingle(b.url);
                          }}
                        >
                          <span className="rc-row-main">
                            <span className="rc-row-name">{b.name}</span>
                            {typeof b.pin_count === 'number' && (
                              <span className="rc-row-meta">{nf(b.pin_count)} pins</span>
                            )}
                          </span>
                          <span className="rc-row-go">
                            Open board
                            <ChevronRight aria-hidden="true" />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rc-section">
                <h3 className="rc-h3">Pins</h3>
                <ul className="rc-grid rc-grid--dense">
                  {pins.slice(0, displayLimit).map((pin, idx) => {
                    const mediaUrl = pin.is_video && pin.video_url ? pin.video_url : pin.image_url;
                    const ext = pin.is_video && pin.video_url ? 'mp4' : mediaFileExtension(pin.image_url, 'jpg');
                    return tile({
                      key: pin.pin_id || String(idx),
                      no: String(idx + 1),
                      thumb: pin.thumbnail_url || pin.image_url,
                      title: pin.title || `Pin ${idx + 1}`,
                      mediaUrl,
                      filename: `pin_${pin.pin_id}.${ext}`,
                      ext,
                      isVideo: !!(pin.is_video && pin.video_url),
                      srName: `pin ${idx + 1}`,
                    });
                  })}
                </ul>
                {pins.length > displayLimit && (
                  <div className="rc-more">
                    <span>
                      Showing {nf(shown)} of {nf(pins.length)}. The ZIP has all of them.
                    </span>
                    <button type="button" className="rc-btn" onClick={() => setDisplayLimit((prev) => prev + 24)}>
                      Load {nf(Math.min(24, pins.length - displayLimit))} more
                    </button>
                    <button type="button" className="rc-btn rc-btn--quiet" onClick={() => setDisplayLimit(pins.length)}>
                      Show all {nf(pins.length)}
                    </button>
                  </div>
                )}
              </div>
              <div className="rc-tools">{anotherBtn}</div>
            </Receipt>
          );
        })()
      ) : result && resultKind ? (
        /* ── Single pin: image, video or GIF ──────────────────────── */
        (() => {
          const stock: StockKey = resultKind === 'gif' ? 'gif' : resultKind === 'video' ? 'video' : 'image';
          const videoUrl = result.is_video ? selectedQuality || result.video_url : null;
          const mp4Name = `${slugify(result.title || 'pinterest_video')}.mp4`;
          const mp3Name = `${slugify(result.title || 'pinterest_audio')}.mp3`;
          const coverName = result.image_url
            ? `${slugify(result.title || 'pinterest_cover')}.${mediaFileExtension(result.image_url, 'jpg')}`
            : '';
          const coverFmt = result.image_url ? mediaFileExtension(result.image_url, 'jpg').toUpperCase() : '';
          const showCoverLine = !!result.image_url && !!primaryFile && primaryFile.url !== result.image_url && result.image_url !== gifUrl;
          const showMp4Line = !!videoUrl && primaryFile?.format !== 'MP4';
          const showPack = !!(result.is_video || gifUrl || result.is_gif);
          const packParts = [gifUrl ? 'GIF' : '', videoUrl ? 'MP4, MP3' : '', 'cover image'].filter(Boolean).join(', ');
          const ctaLabel = primaryFile ? `Download ${primaryFile.format}` : '';
          const dims = currentQuality?.width && currentQuality?.height ? `${currentQuality.width}×${currentQuality.height}` : null;
          const rowFiles = [mp4Name, mp3Name, coverName, 'pack'];
          const errorInRow = !!error && !isPartialZipMsg && !!attemptFile && rowFiles.includes(attemptFile);
          const rowAlert = (file: string) =>
            errorFor(file) ? (
              <div className="rc-notice" role="alert">
                <span className="stamp stamp-warn" aria-hidden="true">Void</span>
                <p>{error}</p>
              </div>
            ) : null;
          const rowNote = (file: string, idle: string) =>
            savingNow(file) ? downloadStatusLabel() : lastSaved === file && !savingFile ? 'Download started' : idle;
          const lineBtn = (saving: boolean) =>
            saving ? (
              <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Download aria-hidden="true" />
            );
          return (
            <Receipt
              stock={stock}
              label={`Ready · ${KIND_LABEL[resultKind]}`}
              icon={resultKind === 'video' ? <Film aria-hidden="true" /> : <ImageIcon aria-hidden="true" />}
              serial={receiptSerial}
              labelledBy="result-heading"
              key={`pin-${result.pin_id || result.title}`}
              className="rc--wide"
            >
              <div className="rc-split">
              <div className="rc-main">
              <div className="rc-body">
                <div className="rc-media" data-frozen={gifUrl && !gifPlaying ? 'true' : undefined}>
                  {showPlayer && (selectedQuality || result.video_url) ? (
                    <video
                      src={proxyDownloadHref(selectedQuality || result.video_url!, 'preview.mp4', true)}
                      controls
                      autoPlay
                      loop
                      playsInline
                      preload="auto"
                      aria-label={`Preview: ${result.title}`}
                    />
                  ) : (
                    <>
                      <img
                        src={gifUrl ? proxyDownloadHref(gifUrl, 'preview.gif', true) : result.thumbnail_url || result.image_url}
                        alt={result.title}
                        decoding="async"
                        width={360}
                        height={480}
                        onError={(e) => {
                          const el = e.currentTarget;
                          if (el.dataset.fallback) return;
                          el.dataset.fallback = '1';
                          if (result.thumbnail_url && el.src !== result.thumbnail_url) {
                            el.src = result.thumbnail_url;
                          }
                        }}
                      />
                      {result.is_video && (
                        <button type="button" className="rc-play" onClick={() => setShowPlayer(true)}>
                          <span className="rc-play-tile">
                            <Play aria-hidden="true" />
                            Play preview
                          </span>
                        </button>
                      )}
                      {gifUrl && (
                        <button
                          type="button"
                          className="rc-media-toggle"
                          aria-pressed={!gifPlaying}
                          onClick={() => setGifPlaying(!gifPlaying)}
                        >
                          {gifPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
                          {gifPlaying ? 'Freeze' : 'Play loop'}
                        </button>
                      )}
                    </>
                  )}
                </div>
                {resultHeading(result.title || 'Pinterest Pin', result.description || undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: 'Format', value: primaryFile?.format || null },
                      { label: 'Resolution', value: primaryFile?.format === 'MP4' ? dims : null },
                      { label: 'Plays', value: primaryFile?.format === 'GIF' ? 'Looping' : null },
                    ]}
                  />
                  {result.qualities && result.qualities.length > 1 && primaryFile?.format === 'MP4' && (
                    <fieldset className="rc-q">
                      <legend>Quality</legend>
                      <div className="rc-q-row">
                        {result.qualities.map((q, idx) => {
                          const checked = (selectedQuality || result.video_url) === q.url;
                          return (
                            <label key={idx} data-checked={checked ? 'true' : undefined}>
                              <input
                                type="radio"
                                name="video-quality"
                                value={q.url}
                                checked={checked}
                                onChange={() => setSelectedQuality(q.url)}
                              />
                              <span>{q.label}</span>
                              {q.width && q.height ? (
                                <span className="rc-q-dim">
                                  {q.width}&times;{q.height}
                                </span>
                              ) : null}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}
                </div>
              </div>

              {primaryFile && (
                <div className="rc-collect">
                  {fileCta(primaryFile, ctaLabel)}
                  {!errorInRow && receiptError}
                  {savedNotice}
                </div>
              )}
              </div>
              <div className="rc-side">

              {(showMp4Line || videoUrl || showCoverLine || showPack) && (
                <>
                  <Perf />
                  <div className="rc-section">
                    <h3 className="rc-h3">Also in this pin</h3>
                    <ul className="rc-items">
                      {showMp4Line && videoUrl && (
                        <LineItem format="MP4" name="Video" note={rowNote(mp4Name, dims || 'With sound')} after={rowAlert(mp4Name)}>
                          <a
                            href={proxyDownloadHref(videoUrl, mp4Name)}
                            download={mp4Name}
                            onClick={(e) => onProxyDownloadClick(e, videoUrl, mp4Name)}
                            aria-busy={savingFile === mp4Name}
                            className="rc-btn"
                            data-line="mp4"
                          >
                            {lineBtn(savingFile === mp4Name)}
                            Download<span className="sr-only"> video (MP4)</span>
                          </a>
                        </LineItem>
                      )}
                      {videoUrl && (
                        <LineItem
                          format="MP3"
                          name="Audio"
                          note={rowNote(mp3Name, 'The sound from this video')}
                          after={rowAlert(mp3Name)}
                        >
                          <button
                            type="button"
                            aria-disabled={!!savingFile || undefined}
                            onClick={(e) => {
                              e.preventDefault();
                              if (savingFile) return;
                              void saveProxyDownload(videoUrl, mp3Name);
                            }}
                            aria-busy={savingFile === mp3Name}
                            className="rc-btn"
                            data-line="mp3"
                          >
                            {lineBtn(savingFile === mp3Name)}
                            Download<span className="sr-only"> audio (MP3)</span>
                          </button>
                        </LineItem>
                      )}
                      {showCoverLine && result.image_url && (
                        <LineItem
                          format={coverFmt}
                          name="Cover image"
                          note={rowNote(coverName, 'The still shown on Pinterest')}
                          after={rowAlert(coverName)}
                        >
                          <a
                            href={proxyDownloadHref(result.image_url, coverName)}
                            download={coverName}
                            onClick={(e) => onProxyDownloadClick(e, result.image_url!, coverName)}
                            aria-busy={savingFile === coverName}
                            className="rc-btn"
                            data-line="cover"
                          >
                            {lineBtn(savingFile === coverName)}
                            Download<span className="sr-only"> cover image ({coverFmt})</span>
                          </a>
                        </LineItem>
                      )}
                      {showPack && (
                        <LineItem
                          format="ZIP"
                          name="Everything"
                          note={
                            zipping && zipProgress.total
                              ? `Packing ${zipProgress.done} of ${zipProgress.total} files…`
                              : packParts.charAt(0).toUpperCase() + packParts.slice(1)
                          }
                          after={rowAlert('pack')}
                        >
                          {zipping ? (
                            <button type="button" onClick={cancelZip} className="rc-btn" data-line="pack">
                              <X aria-hidden="true" />
                              Cancel<span className="sr-only"> ZIP</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAttemptFile('pack');
                                void downloadSinglePinCompletePack(result);
                              }}
                              className="rc-btn"
                              data-line="pack"
                            >
                              {lineBtn(false)}
                              Download<span className="sr-only"> everything (ZIP)</span>
                            </button>
                          )}
                        </LineItem>
                      )}
                    </ul>
                    {zipNotice(stock)}
                  </div>
                </>
              )}

              <Perf />
              <div className="rc-tools">
                {primaryFile && (
                  <button type="button" className="rc-btn" onClick={() => void copyFileLink(primaryFile.url)}>
                    {copiedLink ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                    {copiedLink ? 'Link copied' : 'Copy file link'}
                  </button>
                )}
                {primaryMediaUrl && (
                  <button
                    type="button"
                    className="rc-btn"
                    onClick={() => void toggleQrPanel()}
                    aria-expanded={qrOpen}
                    aria-controls="phone-qr-panel"
                  >
                    <QrCode aria-hidden="true" />
                    {qrOpen ? 'Hide phone QR' : 'Send to phone'}
                  </button>
                )}
                {result.image_url && (
                  <button
                    type="button"
                    className="rc-btn"
                    onClick={() => {
                      triggerHaptic();
                      setShowCropper(true);
                    }}
                  >
                    <Crop aria-hidden="true" />
                    Crop / resize
                  </button>
                )}
                {result.is_video && (
                  <button
                    type="button"
                    className="rc-btn"
                    onClick={() => {
                      triggerHaptic();
                      setShowTrimmer(true);
                    }}
                  >
                    <Scissors aria-hidden="true" />
                    Trim sound
                  </button>
                )}
                {anotherBtn}
              </div>
              {primaryMediaUrl && (
                <div id="phone-qr-panel" hidden={!qrOpen} className="rc-qr">
                  {qrLoading ? (
                    <div className="rc-qr-wait rc-skel" aria-hidden="true" />
                  ) : qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      width="128"
                      height="128"
                      alt={`QR code linking to the extracted ${result.is_video ? 'video' : 'image'} file — scan to open it on your phone`}
                    />
                  ) : null}
                  <p className="min-w-0">
                    Scan with your phone camera to open this file instantly — then long-press to save it to your gallery. No app or login needed.
                  </p>
                </div>
              )}

              {((result.colors && result.colors.length > 0) || (result.tags && result.tags.length > 0) || result.title) && (
                <details className="rc-extras" data-extras="">
                  <summary>
                    <span>Colours, tags and repost captions</span>
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div className="rc-extras-body">
                    {result.colors && result.colors.length > 0 && (
                      <div>
                        <div className="rc-extras-head">
                          <h3 className="rc-h3">Palette</h3>
                          <span className="rc-extras-hint">Shades of the pin's main colour. Tap to copy.</span>
                        </div>
                        <div className="rc-chips">
                          {result.colors.map((hex, idx) => (
                            <button key={idx} type="button" className="rc-swatch" onClick={() => copyColorHex(hex)}>
                              <i style={{ backgroundColor: hex }} aria-hidden="true" />
                              <span translate="no">{copiedColor === hex ? 'Copied' : hex}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.tags && result.tags.length > 0 && (
                      <div>
                        <div className="rc-extras-head">
                          <h3 className="rc-h3">Tags</h3>
                          <button type="button" className="rc-btn" onClick={copyTagsToClipboard}>
                            {copiedTags ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                            {copiedTags ? 'Copied' : 'Copy tags'}
                          </button>
                        </div>
                        <div className="rc-chips">
                          {result.tags.map((tag, idx) => (
                            <span key={idx} className="rc-tag">#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="rc-extras-head">
                        <h3 className="rc-h3">Repost caption</h3>
                      </div>
                      <div className="rc-seg" role="group" aria-label="Caption for">
                        {(
                          [
                            ['reels', 'Instagram Reels'],
                            ['tiktok', 'TikTok'],
                            ['shorts', 'YT Shorts'],
                          ] as const
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={activePlatform === key}
                            onClick={() => setActivePlatform(key)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="rc-caption">{captionFor(result, activePlatform)}</p>
                      <button
                        type="button"
                        className="rc-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(captionFor(result, activePlatform));
                          setCopiedCaption(true);
                          setTimeout(() => setCopiedCaption(false), 2000);
                        }}
                      >
                        {copiedCaption ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                        {copiedCaption ? 'Copied caption' : 'Copy caption & tags'}
                      </button>
                    </div>
                  </div>
                </details>
              )}
              </div>
              </div>
              <div className="h-4" aria-hidden="true" />
            </Receipt>
          );
        })()
      ) : null}

      {/* ── Batch: several links at once ─────────────────────────────── */}
      {batchResults.length > 0 && (
        <Receipt
          stock="pin"
          label={`Ready · ${batchResults.length} pins`}
          icon={<Layers aria-hidden="true" />}
          labelledBy="result-heading"
        >
          <div className="rc-body rc-body--plain">
            {resultHeading(`${batchResults.length} files collected`)}
          </div>
          <div className="rc-collect">
            <button
              type="button"
              className="rc-cta"
              data-primary=""
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
            >
              <Download aria-hidden="true" />
              <span>Download all ({batchResults.length})</span>
            </button>
            <p className="rc-note">
              {savingFile && downloadProgress ? downloadStatusLabel() : 'Files download one after another.'}
            </p>
            {receiptError}
          </div>
          <Perf />
          <div className="rc-section pb-3">
            <ul className="list-none m-0 p-0">
              {batchResults.map((res, idx) => {
                const gif = resolvedGifUrl(res);
                const fmt = gif ? 'gif' : res.is_video ? 'mp4' : mediaFileExtension(res.image_url || '', 'jpg');
                const name = `${slugify(res.title || 'pin')}.${fmt}`;
                const mediaUrl = gif || res.video_url || res.image_url!;
                const stock: StockKey = gif ? 'gif' : res.is_video ? 'video' : 'image';
                return (
                  <li key={idx} className="rc-batch-row">
                    <img src={res.thumbnail_url || res.image_url || ''} alt={res.title} width={64} height={64} loading="lazy" />
                    <div className="min-w-0">
                      <p className="rc-item-name line-clamp-2 break-words">{res.title}</p>
                      <span className="rc-pill" style={{ '--kind': STOCKS[stock].color } as React.CSSProperties}>
                        {gif ? 'GIF pin' : res.is_video ? 'Video pin' : 'Image pin'}
                      </span>
                    </div>
                    <a
                      href={proxyDownloadHref(mediaUrl, name)}
                      download={name}
                      onClick={(e) => onProxyDownloadClick(e, mediaUrl, name)}
                      aria-busy={savingFile === name}
                      className="rc-btn"
                    >
                      {savingFile === name ? (
                        <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      ) : (
                        <Download aria-hidden="true" />
                      )}
                      Download {fmt.toUpperCase()}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rc-tools">{anotherBtn}</div>
        </Receipt>
      )}

      {/* Recent links: previous claims on this device */}
      {history.length > 0 && !result && batchResults.length === 0 && !loading && !error && (
        <div className="rc-recent">
          <h2 className="rc-h3">Recent links</h2>
          <ul>
            {history.map((item, idx) => (
              <li key={idx}>
                <button type="button" onClick={() => { setUrl(item.url); setMode('single'); }}>
                  {item.thumbnail ? <img src={item.thumbnail} alt="" width={36} height={36} loading="lazy" /> : null}
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
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
