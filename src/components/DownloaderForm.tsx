import { useState, useEffect, useRef, useMemo, createElement, Fragment, type MouseEvent, type ReactNode } from 'react';
import { Loader2, Download, Image as ImageIcon, Copy, Check, Clipboard, Play, Pause, Layers, Archive, User, ChevronRight, ChevronDown, Crop, Scissors, QrCode, ExternalLink, RefreshCw, X, Film, ArrowUp, Link2 } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';
import { Receipt, Specs, Perf, LineItem, Fill } from './results/parts';
import '../styles/results.css';
import AudioTrimmer from './AudioTrimmer';
import { gifCandidateUrls, isGifUrl, isMediaContentType, mediaFileExtension, toDownloadablePinUrl } from '../lib/pin-media';
import {
  EN_ISLAND_PATHS,
  classifyPinterestInput,
  getSuitableToolForMedia,
  isPinterestLink,
  routeTo,
  type IslandPageId,
  type IslandRoutes,
} from '../lib/pinterest-route';
import { MP3_KBPS } from '../lib/audio/mp3-constants';
import { STOCKS, type StockKey } from '../lib/stocks';
import { EN_ISLAND } from '../i18n/island/en';
import type { DeepPartial, ErrorKind, IslandMessages, ResultKind } from '../i18n/island/types';
import { API_ERROR_KIND, CLIENT_ERROR_KIND, apiErrorKey, errorKind, mp3ErrorCode } from '../i18n/island/errors';
import { deepMerge, fmt, fmtParts, listSeparator, noticeSeparator, numberFormatter, plural, pluralParts } from '../i18n/island/fmt';
import { PLACEHOLDER_PIN_TITLE } from '../lib/extract/types';

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

/** Behaviour per variant (copy lives in the island catalog: src/i18n/island/en.ts → variants). */
const SHOW_BATCH: Record<FormVariant, boolean> = {
  hub: true,
  pin: true,
  video: true,
  image: true,
  gif: true,
  board: false,
  profile: false,
  'profile-picture': false,
};

const STOCK_TOOLS: { pageId: IslandPageId; stock: StockKey; variant: FormVariant }[] = [
  { pageId: 'pinterest-pin-downloader', stock: 'pin', variant: 'pin' },
  { pageId: 'pinterest-video-downloader', stock: 'video', variant: 'video' },
  { pageId: 'pinterest-image-downloader', stock: 'image', variant: 'image' },
  { pageId: 'pinterest-gif-downloader', stock: 'gif', variant: 'gif' },
  { pageId: 'pinterest-board-downloader', stock: 'board', variant: 'board' },
  { pageId: 'pinterest-profile-downloader', stock: 'profile', variant: 'profile' },
  { pageId: 'pinterest-profile-picture-downloader', stock: 'avatar', variant: 'profile-picture' },
];

/** A message the form wrote itself (already in the page's language), with its recovery. */
class IslandError extends Error {
  constructor(
    message: string,
    readonly kind: ErrorKind,
  ) {
    super(message);
    this.name = 'IslandError';
  }
}

/** Message nodes: text with `{token}` values (strings or elements) in place. */
function nodes(parts: (string | ReactNode)[]): ReactNode {
  return createElement(Fragment, null, ...parts);
}

/** Read a pasted link the way a cloakroom attendant reads a ticket: type + number. */
function readTicket(raw: string, variant: FormVariant, m: IslandMessages): {
  stamp: string;
  tone: 'ok' | 'warn' | 'none';
  serial: string;
  color: string;
  onColor?: string;
  expect: string;
  help?: string;
} {
  const expect = (m.variants[variant] || EN_ISLAND.variants[variant]).expect;
  const text = raw.trim();
  if (!text) return { stamp: '', tone: 'none', serial: '', color: '', expect };
  const route = classifyPinterestInput(text);
  if (!route) {
    const looksLikeUrl = /^(https?:\/\/|www\.)|\.[a-z]{2,}\//i.test(text);
    return {
      stamp: looksLikeUrl ? m.stamps.notPinterest : '',
      tone: looksLikeUrl ? 'warn' : 'none',
      serial: '',
      color: '',
      expect,
      help: looksLikeUrl ? m.ticket.notPinterestHelp : undefined,
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
      ? m.stamps.board
      : route.type === 'profile'
        ? variant === 'profile-picture'
          ? m.stamps.profileAvatar
          : m.stamps.profileZip
        : short
          ? m.stamps.pinShort
          : m.stamps.pin;
  const key: StockKey = route.type === 'board' ? 'board' : route.type === 'profile' ? (variant === 'profile-picture' ? 'avatar' : 'profile') : 'pin';
  return { stamp, tone: 'ok', serial, color: STOCKS[key].color, onColor: STOCKS[key].onColor, expect };
}

export default function DownloaderForm({
  variant = 'hub',
  layout = 'default',
  messages,
  routes,
  locale,
}: {
  variant?: FormVariant;
  /** hero = Pinpea-style pill input + download on landing */
  layout?: FormLayout;
  /**
   * Localized pages only: this locale's island catalog slice
   * (src/i18n/island/catalogs.ts islandMessagesFor). English uses EN_ISLAND.
   */
  messages?: DeepPartial<IslandMessages> | null;
  /** Localized pages only: live paths of this locale ({pageId → path} & { home }). */
  routes?: IslandRoutes | null;
  /** Localized pages only: the page locale (number format fallback when messages lack `lang`). */
  locale?: string;
}) {
  const isHero = layout === 'hero';
  /** English pages pass no messages: they keep the browser's number format and the browser's own error text. */
  const localized = !!messages;
  const m = useMemo(() => deepMerge(EN_ISLAND, messages), [messages]);
  const paths: IslandRoutes = routes || EN_ISLAND_PATHS;
  const lang = localized ? messages?.lang || locale || m.lang : undefined;
  /**
   * Accessible name of a "Download" line button on localized pages, from the
   * catalog's word order (tr: object first, "Sesi (MP3) İndir"). English keeps
   * the visible verb plus its sr-only suffix.
   */
  const itemAria = (item: string) => (localized ? fmt(m.receipt.itemAria, { verb: m.receipt.downloadShort, item }).trim() : undefined);
  /** Turkish uppercase stamps print PİNTEREST unless the brand is marked English. */
  const brandNodes = (text: string): ReactNode =>
    lang && /^tr\b/i.test(lang)
      ? text.split(/(Pinterest|PintDownload)/).map((part, i) => (i % 2 ? <span key={i} lang="en">{part}</span> : part))
      : text;
  // The page this form was served on: route notices pushState the tool's path
  // into the address bar, so location.pathname alone cannot tell them apart.
  const servedPath = useRef('');
  useEffect(() => {
    servedPath.current = window.location.pathname;
  }, []);
  const samePage = (path: string) => {
    const norm = (p: string) => p.replace(/\/+$/, '') || '/';
    return !!servedPath.current && norm(path) === norm(servedPath.current);
  };
  /** Links, file names and serials stay left-to-right inside RTL copy (localized pages only; English HTML unchanged). */
  const ltr = localized ? ('ltr' as const) : undefined;
  const isolate = (text: string): ReactNode => (localized ? <bdi>{text}</bdi> : text);
  const [activeVariant, setActiveVariant] = useState<FormVariant>(variant);
  const [routeNotice, setRouteNotice] = useState<{ message: string; path: string } | null>(null);
  const [gifPlaying, setGifPlaying] = useState<boolean>(true);

  useEffect(() => {
    setActiveVariant(variant);
  }, [variant]);

  const copy = m.variants[activeVariant] || m.variants.hub;
  const showBatch = SHOW_BATCH[activeVariant] ?? SHOW_BATCH.hub;

  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [url, setUrl] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [loading, setLoading] = useState(false);
  /** The current failure: its text (already in the page's language), its recovery, and whether it is the partial-ZIP note. */
  const [errorState, setErrorState] = useState<{ text: string; kind: ErrorKind; partial?: boolean } | null>(null);
  const error = errorState?.text ?? '';
  /** Clear with '', or set a message; English text without a kind is sorted by errorKind(). */
  const setError = (text: string, kind?: ErrorKind, partial = false) =>
    setErrorState(text ? { text, kind: kind ?? errorKind(text), partial } : null);
  /** Text and recovery for a caught error: the form's own, an MP3 failure, or (English only) the browser's text. */
  const caught = (err: any, fallback: string, fallbackKind: ErrorKind): [string, ErrorKind] => {
    if (err instanceof IslandError) return [err.message, err.kind];
    const mp3Code = mp3ErrorCode(err);
    if (mp3Code) return [m.mp3[mp3Code], 'other'];
    if (localized) return [fallback, fallbackKind];
    const text = err?.message || fallback;
    return [text, errorKind(text)];
  };
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
    /** reading/encoding: making an MP3 in the browser after the video arrived. */
    phase: 'connecting' | 'transferring' | 'reading' | 'encoding';
    /** 0–1 while encoding. */
    ratio?: number;
  } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrFor, setQrFor] = useState('');
  // Receipt-only display state: what was handed to the browser, and copy feedback.
  const [zipDone, setZipDone] = useState<{ name: string; packed: number; total: number; noMp3?: string } | null>(null);
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
      setError(m.errors.qr, CLIENT_ERROR_KIND.qr);
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
          (item.is_profile ? m.fallbacks.profile : item.is_board ? m.fallbacks.board : m.fallbacks.pin),
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
        const path = routeTo(paths, classification.pageId);
        setRouteNotice({ message: m.routeNotice.boardLink, path });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${path}?url=${encodeURIComponent(trimmed)}`);
        }
      } else if (
        classification.type === 'profile' &&
        activeVariant !== 'profile' &&
        activeVariant !== 'profile-picture'
      ) {
        setActiveVariant('profile');
        const path = routeTo(paths, classification.pageId);
        setRouteNotice({ message: m.routeNotice.profileLink, path });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${path}?url=${encodeURIComponent(trimmed)}`);
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
      if (!res.ok) {
        // Known codes read from the catalog on localized pages; English keeps the server's own sentence.
        const key = apiErrorKey(data?.code, classifyPinterestInput(target)?.type);
        if (key && localized) throw new IslandError(m.api[key], API_ERROR_KIND[key]);
        // A code the catalog has no text for (e.g. collection_unavailable, a
        // retryable upstream miss): localized pages say "could not extract"
        // with the try-again hint instead of printing the English server text.
        if (localized) throw new IslandError(m.errors.extractFailed, 'other');
        const text = data.error || m.errors.extractFailed;
        throw new IslandError(text, key ? API_ERROR_KIND[key] : errorKind(text));
      }
      setResult(data);
      if (data.video_url) setSelectedQuality(data.video_url);
      saveToHistory(data, target);

      // Smart Media-Type Auto-Routing:
      const suitable = getSuitableToolForMedia(data);
      const suitablePath = routeTo(paths, suitable.pageId);
      if (data.is_gif && activeVariant !== 'gif') {
        setActiveVariant('gif');
        setRouteNotice({ message: m.routeNotice.gif, path: suitablePath });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitablePath}?url=${encodeURIComponent(target)}`);
        }
      } else if (data.is_video && !data.is_gif && activeVariant !== 'video' && activeVariant !== 'hub') {
        setActiveVariant('video');
        setRouteNotice({ message: m.routeNotice.video, path: suitablePath });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitablePath}?url=${encodeURIComponent(target)}`);
        }
      } else if (data.is_carousel && activeVariant !== 'image' && activeVariant !== 'hub') {
        setActiveVariant('image');
        const slides = data.media_items?.length || 0;
        setRouteNotice({ message: plural(m.routeNotice.carousel, slides, { n: n0(slides) }, lang), path: suitablePath });
      } else if (data.is_board && activeVariant !== 'board') {
        setActiveVariant('board');
        setRouteNotice({ message: m.routeNotice.board, path: suitablePath });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitablePath}?url=${encodeURIComponent(target)}`);
        }
      } else if (data.is_profile && activeVariant !== 'profile' && activeVariant !== 'profile-picture') {
        setActiveVariant('profile');
        setRouteNotice({ message: m.routeNotice.profile, path: suitablePath });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `${suitablePath}?url=${encodeURIComponent(target)}`);
        }
      }
    } catch (err: any) {
      setError(...caught(err, m.errors.unknown, CLIENT_ERROR_KIND.unknown));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((mode === 'single' || isHero) && !url.trim()) {
      setError(m.errors.emptyLink, CLIENT_ERROR_KIND.emptyLink);
      document.getElementById('pinterest-url-input')?.focus();
      return;
    }
    if (mode === 'batch' && !isHero && !batchUrls.trim()) {
      setError(m.errors.emptyBatch, CLIENT_ERROR_KIND.emptyBatch);
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
          .filter(l => l.length > 5 && isPinterestLink(l))
      )).slice(0, 10);

      if (links.length === 0) {
        setError(m.errors.batchInvalid, CLIENT_ERROR_KIND.batchInvalid);
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
        setError(m.errors.batchFailed, CLIENT_ERROR_KIND.batchFailed);
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

  /** Counts in the page's number format (English: the browser's default, as before). */
  const nf = useMemo(() => numberFormatter(lang), [lang]);
  const nf1 = useMemo(() => numberFormatter(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1, useGrouping: false }), [lang]);
  const nf0 = useMemo(() => numberFormatter(lang, { maximumFractionDigits: 0, useGrouping: false }), [lang]);
  /** Numbers English printed raw (percentages, file counts in sentences): raw in English, localized elsewhere. */
  const n0 = (n: number) => (lang ? nf0(n) : String(n));

  const formatBytes = (n: number) => {
    if (!n) return `0 ${m.bytes.B}`;
    const units = [m.bytes.B, m.bytes.KB, m.bytes.MB, m.bytes.GB];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    const value = v < 10 && i > 0 ? (lang ? nf1(v) : v.toFixed(1)) : lang ? nf0(v) : Math.round(v);
    return `${value}\u00a0${units[i]}`;
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

  /** Fetch a file through /api/download, reporting bytes as they arrive. */
  const fetchProxyBlob = async (mediaUrl: string, filename: string): Promise<Blob> => {
    const res = await fetch(proxyDownloadHref(mediaUrl, filename));
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !isMediaContentType(type)) {
      throw new IslandError(m.errors.fileUnavailable, CLIENT_ERROR_KIND.fileUnavailable);
    }
    const contentLength = res.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = res.body?.getReader();
    if (!reader) throw new IslandError(m.errors.noBody, CLIENT_ERROR_KIND.noBody);

    const chunks: Uint8Array[] = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      setDownloadProgress({ loaded, total, phase: 'transferring' });
    }
    return new Blob(chunks as BlobPart[], { type: type || 'application/octet-stream' });
  };

  const handBlobToBrowser = (blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  };

  const startSaving = (filename: string) => {
    setError('');
    setLastSaved(null);
    setAttemptFile(filename);
    setSavingFile(filename);
    setDownloadProgress({ loaded: 0, total: 0, phase: 'connecting' });
  };

  const saveProxyDownload = async (mediaUrl: string, filename: string) => {
    startSaving(filename);
    try {
      handBlobToBrowser(await fetchProxyBlob(mediaUrl, filename), filename);
      setLastSaved(filename);
    } catch (err: any) {
      setError(...caught(err, m.errors.downloadFailed, CLIENT_ERROR_KIND.downloadFailed));
    } finally {
      setSavingFile(null);
      setDownloadProgress(null);
    }
  };

  /**
   * A real MP3: fetch the video through our proxy, decode its sound and encode
   * MP3 in this browser (lib/audio, loaded only now). Nothing is uploaded.
   */
  const saveMp3FromVideo = async (videoUrl: string, filename: string, title: string) => {
    startSaving(filename);
    try {
      const converter = import('../lib/audio/to-mp3');
      const video = await fetchProxyBlob(videoUrl, filename.replace(/\.mp3$/i, '.mp4'));
      setDownloadProgress({ loaded: 0, total: 0, phase: 'reading' });
      const { videoToMp3 } = await converter;
      const mp3 = await videoToMp3(video, {
        title,
        onProgress: (p) => setDownloadProgress({ loaded: 0, total: 0, phase: p.stage, ratio: p.ratio }),
      });
      handBlobToBrowser(mp3, filename);
      setLastSaved(filename);
    } catch (err: any) {
      setError(...caught(err, m.mp3.failed, 'other'));
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
    if (downloadProgress.phase === 'reading') return m.progress.reading;
    if (downloadProgress.phase === 'encoding') {
      return fmt(m.progress.making, { pct: n0(Math.round((downloadProgress.ratio ?? 0) * 100)) });
    }
    if (downloadProgress.phase === 'connecting' || downloadProgress.loaded === 0) {
      return m.progress.connecting;
    }
    if (downloadProgress.total > 0) {
      const pct = Math.min(100, Math.round((downloadProgress.loaded / downloadProgress.total) * 100));
      return fmt(m.progress.downloadingOf, {
        loaded: formatBytes(downloadProgress.loaded),
        total: formatBytes(downloadProgress.total),
        pct: n0(pct),
      });
    }
    return fmt(m.progress.downloading, { loaded: formatBytes(downloadProgress.loaded) });
  };

  /** A ZIP entry; `mp3` entries are made in the browser from the video at `url`. */
  type ZipEntry = { url: string; filename: string; mp3?: { title: string } };

  const downloadUrlsAsZip = async (entries: ZipEntry[], archiveName: string) => {
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
      /** Why the MP3 was left out (the ZIP holds a real MP3 or none). */
      let noMp3: string | undefined;

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

      // The MP4 and the MP3 made from it share one download.
      const fetched = new Map<string, Promise<Blob>>();
      const fetchOnce = (entry: ZipEntry) => {
        let pending = fetched.get(entry.url);
        if (!pending) {
          pending = fetchItem(
            `/api/download?url=${encodeURIComponent(toDownloadablePinUrl(entry.url))}&filename=${encodeURIComponent(entry.filename)}`,
          );
          pending.catch(() => {});
          fetched.set(entry.url, pending);
        }
        return pending;
      };

      const concurrency = 4;
      for (let i = 0; i < entries.length && !run.signal.aborted; i += concurrency) {
        const batch = entries.slice(i, i + concurrency);
        await Promise.all(
          batch.map(async (entry) => {
            try {
              if (entry.mp3) {
                let video: Blob;
                try {
                  video = await fetchOnce(entry);
                } catch {
                  noMp3 = m.errors.noMp3Video;
                  return;
                }
                try {
                  const { videoToMp3 } = await import('../lib/audio/to-mp3');
                  folder.file(entry.filename, await videoToMp3(video, { title: entry.mp3.title, signal: run.signal }));
                  packed++;
                } catch (e: any) {
                  if (!run.signal.aborted) noMp3 = caught(e, m.errors.noMp3Browser, 'other')[0];
                }
                return;
              }
              const blob = await fetchOnce(entry);
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
        throw new IslandError(m.errors.zipNothing, CLIENT_ERROR_KIND.zipNothing);
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
      const total = entries.length - (noMp3 ? 1 : 0);
      setZipDone({ name: `${slugify(archiveName)}.zip`, packed, total, noMp3 });

      if (failed > 0) {
        setError(plural(m.errors.zipPartial, total, { ok: n0(total - failed), total: n0(total), failed: n0(failed) }, lang), 'other', true);
      }
    } catch (err: any) {
      if (!run.signal.aborted) setError(...caught(err, m.errors.zipFailed, CLIENT_ERROR_KIND.zipFailed));
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
          filename: `${String(idx + 1).padStart(2, '0')}_${slugify((!PLACEHOLDER_PIN_TITLE.test(pin.title) && pin.title) || pin.pin_id)}.${ext}`,
        };
      })
      .filter((e): e is ZipEntry => !!e);
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
    const entries: ZipEntry[] = [];

    if (gUrl) {
      entries.push({ url: gUrl, filename: `${safeTitle}_animation.gif` });
    }

    if (vUrl) {
      entries.push({ url: vUrl, filename: `${safeTitle}_video.mp4` });
      entries.push({ url: vUrl, filename: `${safeTitle}_audio.mp3`, mp3: { title: res.title || '' } });
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

  const reading = readTicket(url, activeVariant, m);
  const showBatchTabs = !isHero && showBatch;
  const batchActive = mode === 'batch' && showBatch && !isHero;

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

  const isPartialZipMsg = !!errorState?.partial;
  const errKind: ErrorKind = errorState?.kind ?? 'other';

  const savingNow = (filename: string) => savingFile === filename && !!downloadProgress;
  const savingPct =
    downloadProgress?.phase === 'encoding'
      ? Math.round((downloadProgress.ratio ?? 0) * 100)
      : downloadProgress?.total
        ? pctOf(downloadProgress.loaded, downloadProgress.total)
        : null;

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
    if (!error || loading || result || batchResults.length || errKind === 'validation') return;
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
      setError(m.errors.copyLink, CLIENT_ERROR_KIND.copyLink);
    }
  };

  const captionFor = (res: ExtractionResult, platform: 'reels' | 'tiktok' | 'shorts') => {
    const tagsStr = (res.tags || []).map((t) => `#${t}`).join(' ');
    const vars = { title: String(res.title), tags: tagsStr };
    if (platform === 'reels') return fmt(m.extras.captionReels, vars);
    if (platform === 'tiktok') return fmt(m.extras.captionTiktok, vars);
    return fmt(m.extras.captionShorts, vars);
  };

  // Screen-reader narration: coarse steps only, so progress never floods the queue.
  const liveMsg = loading
    ? batchActive
      ? m.live.readingLinks
      : m.live.readingLink
    : zipping && zipProgress.total
      ? fmt(m.live.packingZip, { pct: n0(Math.floor(pctOf(zipProgress.done, zipProgress.total) / 25) * 25) })
      : savingFile && downloadProgress
        ? downloadProgress.phase === 'reading' || downloadProgress.phase === 'encoding'
          ? savingPct
            ? fmt(m.live.makingPct, { file: savingFile, pct: n0(Math.floor(savingPct / 25) * 25) })
            : fmt(m.live.making, { file: savingFile })
          : savingPct === null
            ? fmt(m.live.downloading, { file: savingFile })
            : fmt(m.live.downloadingPct, { file: savingFile, pct: n0(Math.floor(savingPct / 25) * 25) })
        : zipDone
          ? plural(m.live.zipPacked, zipDone.total, { packed: n0(zipDone.packed), total: n0(zipDone.total) }, lang)
          : lastSaved
            ? fmt(m.live.started, { file: lastSaved })
            : copiedLink || copiedTags || copiedCaption || copiedColor
              ? m.live.copied
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
          aria-label={m.receipt.downloadProgressAria}
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
            {nodes(fmtParts(m.receipt.savesAs, { file: <b translate="no" dir={ltr}>{file.filename}</b> }))}
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
        <span>{nodes(fmtParts(m.receipt.downloadZip, { n: nf(count) }))}</span>
        {zipping && zipProgress.total > 0 && <Fill value={zipProgress.done / zipProgress.total} />}
      </button>
      {zipping && zipProgress.total > 0 ? (
        <div className="rc-note rc-note--row">
          <p
            role="progressbar"
            aria-label={m.receipt.zipProgressAria}
            aria-valuemin={0}
            aria-valuemax={zipProgress.total}
            aria-valuenow={zipProgress.done}
            aria-valuetext={plural(m.receipt.zipProgressText, zipProgress.total, { done: n0(zipProgress.done), total: n0(zipProgress.total) }, lang)}
          >
            {nodes(
              pluralParts(m.receipt.packing, zipProgress.total, { done: <b>{nf(zipProgress.done)}</b>, total: nf(zipProgress.total) }, lang),
            )}
          </p>
          <button type="button" className="rc-btn rc-btn--quiet" onClick={cancelZip}>
            <X aria-hidden="true" />
            {m.receipt.cancel}<span className="sr-only">{m.receipt.cancelSr}</span>
          </button>
        </div>
      ) : zipDone ? (
        zipNotice(stock)
      ) : (
        <p className="rc-note">
          <span className="rc-file">
            {nodes(fmtParts(m.receipt.savesAs, { file: <b translate="no" dir={ltr}>{slugify(archiveName)}.zip</b> }))}
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
            <span className="stamp stamp-warn" aria-hidden="true">{m.marks.partial}</span>
            <p>
              {nodes(
                pluralParts(
                  m.receipt.zipPartial,
                  zipDone.total,
                  {
                    name: <b translate="no" dir={ltr}>{zipDone.name}</b>,
                    packed: nf(zipDone.packed),
                    total: nf(zipDone.total),
                    missing: nf(zipDone.total - zipDone.packed),
                  },
                  lang,
                ),
              )}
              {zipDone.noMp3 ? fmt(m.receipt.noMp3, { reason: zipDone.noMp3 }) : null}
            </p>
          </>
        ) : (
          <>
            <span
              className="stamp stamp-ok"
              aria-hidden="true"
              style={{ '--stamp-bg': STOCKS[stock].color, '--stamp-ink': STOCKS[stock].onColor } as React.CSSProperties}
            >
              {m.marks.packed}
            </span>
            <p>
              {nodes(pluralParts(m.receipt.zipAll, zipDone.total, { name: <b translate="no" dir={ltr}>{zipDone.name}</b>, total: nf(zipDone.total) }, lang))}
              {zipDone.noMp3 ? fmt(m.receipt.noMp3, { reason: zipDone.noMp3 }) : null}
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
        <span className="stamp stamp-warn" aria-hidden="true">{m.marks.void}</span>
        <p>{error}</p>
      </div>
    ) : null;

  const savedNotice =
    lastSaved && !savingFile && lastSaved === primaryFile?.filename ? (
      <div className="rc-notice">
        <span className="stamp stamp-ok" aria-hidden="true">{m.marks.done}</span>
        <p>{nodes(fmtParts(m.receipt.started, { file: <b translate="no" dir={ltr}>{lastSaved}</b> }))}</p>
      </div>
    ) : null;

  const anotherBtn = (
    <button type="button" className="rc-btn rc-btn--quiet rc-push" onClick={startAnother}>
      <ArrowUp aria-hidden="true" />
      {m.receipt.another}
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
    const fileFmt = opts.isVideo ? 'MP4' : opts.ext === 'gif' ? 'GIF' : opts.ext.toUpperCase();
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
              {opts.isVideo ? m.receipt.tagVideo : m.receipt.tagGif}
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
            {nodes(fmtParts(m.receipt.save, { format: fileFmt }))}
            <span className="sr-only">{fmt(m.receipt.tileSr, { name: opts.srName })}</span>
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
          <span className="t-label">{m.ticket.admitOne}</span>
          <span className="ticket-serial" aria-live="polite" translate="no">
            {reading.serial ? nodes(fmtParts<ReactNode>(m.ticket.serial, { serial: isolate(reading.serial) })) : m.ticket.serialEmpty}
          </span>
        </div>

        <div className="ticket-body">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-h-[2rem]">
            {showBatchTabs ? (
              <div className="inline-flex rounded-md border-2 border-[var(--ink)] overflow-hidden text-sm font-bold" role="group" aria-label={m.ticket.modeGroup}>
                <button
                  type="button"
                  aria-pressed={mode === 'single'}
                  onClick={() => { setMode('single'); setError(''); }}
                  className={`px-3 min-h-[2.75rem] touch-manipulation ${mode === 'single' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  {m.ticket.oneLink}
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'batch'}
                  onClick={() => { setMode('batch'); setError(''); }}
                  className={`px-3 min-h-[2.75rem] touch-manipulation inline-flex items-center gap-1.5 ${mode === 'batch' ? 'bg-[var(--ink)] text-[var(--paper)]' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                >
                  <Layers className="w-4 h-4" aria-hidden="true" />
                  {m.ticket.upToFive}
                </button>
              </div>
            ) : (
              <label htmlFor="pinterest-url-input" className="text-sm font-bold">
                {activeVariant === 'hub' ? m.ticket.hubLabel : copy.singleTab}
              </label>
            )}
            {!batchActive && (
              reading.stamp ? (
                <span
                  key={reading.stamp}
                  className={`stamp stamp-in ${reading.tone === 'warn' ? 'stamp-warn' : 'stamp-ok'}`}
                  style={reading.tone === 'ok' ? ({ '--stamp-bg': reading.color, '--stamp-ink': reading.onColor } as React.CSSProperties) : undefined}
                >
                  {brandNodes(reading.stamp)}
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
                placeholder={copy.placeholder}
                required
                aria-label={copy.ariaLabel}
                aria-describedby="ticket-hint"
                dir={ltr}
                autoComplete="url"
                inputMode="url"
                spellCheck={false}
              />
              {url ? (
                <button
                  type="button"
                  onClick={() => handleUrlInput('')}
                  className="shrink-0 min-h-[44px] min-w-[44px] px-2 rounded text-sm font-bold text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-black/5 dark:hover:bg-white/10 touch-manipulation"
                  aria-label={m.ticket.clearAria}
                >
                  <X className="w-5 h-5 mx-auto" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="shrink-0 min-h-[44px] px-3 rounded inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ink)] text-[var(--paper)] hover:bg-brand-600 hover:text-white touch-manipulation"
                  aria-label={m.ticket.pasteAria}
                >
                  <Clipboard className="w-4 h-4" aria-hidden="true" />
                  {/* Localized paste labels («Вставить», "Einfügen") take a third of the
                      field on phones: below 400px show the icon only (name in aria-label). */}
                  {localized ? <span className="hidden min-[400px]:inline">{m.ticket.paste}</span> : m.ticket.paste}
                </button>
              )}
            </div>
          ) : (
            <div className="ticket-input flex-col">
              <label htmlFor="batch-urls-input" className="sr-only">
                {m.ticket.batchLabel}
              </label>
              <textarea
                id="batch-urls-input"
                name="batchUrls"
                rows={4}
                value={batchUrls}
                onChange={(e) => setBatchUrls(e.target.value)}
                placeholder={m.ticket.batchPlaceholder}
                required
                spellCheck={false}
                aria-describedby="ticket-hint"
                dir={ltr}
              />
              <button
                type="button"
                onClick={handlePaste}
                className="self-end mb-1 me-1 min-h-[44px] px-3 rounded inline-flex items-center gap-1.5 text-sm font-bold bg-[var(--ink)] text-[var(--paper)] hover:bg-brand-600 hover:text-white touch-manipulation"
              >
                <Clipboard className="w-4 h-4" aria-hidden="true" />
                {m.ticket.paste}
              </button>
            </div>
          )}

          {routeNotice && !batchActive && (
            <p className="mt-3 flex items-start gap-2 text-sm font-semibold" role="status">
              <RefreshCw className="w-4 h-4 mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="min-w-0">
                {routeNotice.message}
                {/* Where the tool's page is this page (a locale without that tool falls back to its home), the link would only reload it. */}
                {samePage(routeNotice.path) ? null : (
                  <>
                    {localized ? noticeSeparator(lang) : '. '}
                    <a href={routeNotice.path} className="underline font-bold">{m.routeNotice.open}</a>
                  </>
                )}
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
                <span>{batchActive ? m.ticket.batchProcessing : m.ticket.processing}</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" aria-hidden="true" />
                <span>{batchActive ? m.ticket.batchSubmit : copy.submitLabel}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <nav aria-label={m.ticket.toolsNav} className="mt-4 flex flex-wrap gap-2">
        {STOCK_TOOLS.filter((tool) => paths[tool.pageId]).map((tool) => (
          <a
            key={paths[tool.pageId]}
            href={paths[tool.pageId]}
            className="stock-chip"
            data-stock={tool.stock}
            style={{ '--chip': STOCKS[tool.stock].color, '--chip-ink': STOCKS[tool.stock].onColor } as React.CSSProperties}
            aria-current={tool.variant === activeVariant ? 'page' : undefined}
          >
            {m.chips[tool.stock]}
          </a>
        ))}
      </nav>

      <p className="sr-only" aria-live="polite">{liveMsg}</p>

      {/* Loading: an unprinted receipt carrying the ticket's serial, same footprint as a single-pin receipt */}
      {loading && (
        <section className="rc rc--loading rc--wide" aria-hidden="true" data-loading="">
          <div className="rc-band">
            <span className="t-label">{m.receipt.fetching}</span>
            {reading.serial && !batchActive ? (
              <span className="rc-serial" translate="no">{nodes(fmtParts<ReactNode>(m.ticket.serial, { serial: isolate(reading.serial) }))}</span>
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
            <span className="stamp stamp-warn" aria-hidden="true">{m.marks.void}</span>
            <p>{error}</p>
          </div>
        ) : (
          <section className="rc rc--void" aria-labelledby="void-heading" data-print="" data-void={errKind}>
            <div className="rc-void-head">
              <span className="stamp stamp-warn" aria-hidden="true">{m.marks.void}</span>
              <h2
                id="void-heading"
                ref={voidHeadingRef}
                tabIndex={-1}
                aria-describedby="void-msg"
                className="rc-title"
              >
                {m.voidCopy[errKind].title}
              </h2>
            </div>
            <p id="void-msg" className="rc-void-msg">{error}</p>
            {m.voidCopy[errKind].hint && <p className="rc-void-hint">{m.voidCopy[errKind].hint}</p>}
            <div className="rc-tools">
              <button type="button" className="rc-btn" onClick={focusTicket}>
                <RefreshCw aria-hidden="true" />
                {m.receipt.tryAnother}
              </button>
              {(errKind === 'link' || errKind === 'private') && paths['how-to-download-pinterest-videos'] && (
                <a href={paths['how-to-download-pinterest-videos']} className="rc-btn rc-btn--quiet">
                  {m.receipt.guide}
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
              label={fmt(m.receipt.ready, { kind: m.kinds.carousel })}
              icon={<Layers aria-hidden="true" />}
              serial={receiptSerial}
              labelledBy="result-heading"
              serialTemplate={localized ? m.ticket.serial : undefined}
              key={`carousel-${result.pin_id || result.title}`}
              className="rc--wide"
            >
              <div className="rc-top">
              <div className="rc-body rc-body--plain">
                {resultHeading(result.title || m.fallbacks.carousel, result.description || undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: m.specs.slides, value: nf(items.length) },
                      { label: m.specs.images, value: items.length - vids - gifs ? nf(items.length - vids - gifs) : null },
                      { label: m.specs.videos, value: vids ? nf(vids) : null },
                      { label: m.specs.gifs, value: gifs ? nf(gifs) : null },
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
                <h3 className="rc-h3">{m.carousel.everySlide}</h3>
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
                      title: item.title || fmt(m.fallbacks.slide, { n: n0(idx + 1) }),
                      mediaUrl: item.url,
                      filename: `slide_${idx + 1}.${ext}`,
                      ext,
                      isVideo: item.type === 'video',
                      srName: fmt(m.fallbacks.slideSr, { n: n0(idx + 1) }),
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
          const name = result.profile_title || (result.username ? `@${result.username}` : m.fallbacks.user);
          return (
            <Receipt
              stock="avatar"
              label={fmt(m.receipt.ready, { kind: m.kinds.avatar })}
              icon={<User aria-hidden="true" />}
              serial={reading.serial || (result.username ? `@${result.username}` : '')}
              labelledBy="result-heading"
              serialTemplate={localized ? m.ticket.serial : undefined}
              key={`avatar-${result.username}`}
              className="rc--wide"
            >
              <div className="rc-split">
              <div className="rc-main">
              <div className="rc-body">
                <div className="rc-media rc-media--square">
                  {result.profile_avatar_url ? (
                    <img src={result.profile_avatar_url} alt={fmt(m.avatar.alt, { name })} width={400} height={400} decoding="async" />
                  ) : (
                    <div className="grid h-full place-items-center text-[var(--ink-2)]">
                      <User className="h-12 w-12" aria-hidden="true" />
                    </div>
                  )}
                </div>
                {resultHeading(name, result.username && result.profile_title ? <span translate="no" dir={ltr}>@{result.username}</span> : undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: m.specs.format, value: 'JPG' },
                      { label: m.specs.crop, value: m.specs.uncropped },
                    ]}
                  />
                </div>
              </div>
              {result.profile_avatar_url && (
                <div className="rc-collect">
                  {fileCta({ url: result.profile_avatar_url, filename: avatarName, format: 'JPG' }, fmt(m.receipt.download, { format: 'JPG' }))}
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
                    {m.avatar.openFull}
                    <span className="sr-only">{m.avatar.newTabSr}</span>
                  </a>
                )}
                {result.profile_avatar_url && (
                  <button type="button" className="rc-btn" onClick={() => void copyFileLink(result.profile_avatar_url!)}>
                    {copiedLink ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                    {copiedLink ? m.receipt.linkCopied : m.receipt.copyLink}
                  </button>
                )}
                {anotherBtn}
              </div>
              <p className="rc-void-hint pb-4">
                {nodes(
                  fmtParts(m.avatar.promo, {
                    link: (
                      <a href={routeTo(paths, 'pinterest-profile-downloader')} className="font-bold text-[var(--ink)] underline">
                        {m.avatar.profileLink}
                      </a>
                    ),
                  }),
                )}
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
            ? result.profile_title || result.board_title || m.fallbacks.profile
            : result.board_title || m.fallbacks.board;
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
              label={fmt(m.receipt.ready, { kind: isProfile ? m.kinds.profile : m.kinds.board })}
              icon={isProfile ? <User aria-hidden="true" /> : <Archive aria-hidden="true" />}
              serial={reading.serial || (result.username ? `@${result.username}` : '')}
              labelledBy="result-heading"
              serialTemplate={localized ? m.ticket.serial : undefined}
              key={`${resultKind}-${result.board_url || result.username}`}
              className="rc--wide"
            >
              <div className="rc-top">
              <div className={`rc-body ${isProfile && result.profile_avatar_url ? '' : 'rc-body--plain'}`}>
                {isProfile && result.profile_avatar_url && (
                  <div className="rc-media rc-media--square">
                    <img src={result.profile_avatar_url} alt={fmt(m.avatar.alt, { name: title })} width={400} height={400} decoding="async" />
                  </div>
                )}
                {resultHeading(
                  title,
                  result.username ? (
                    <span translate="no">{fmt(isProfile ? m.collection.atUser : m.collection.byUser, { user: result.username })}</span>
                  ) : undefined,
                )}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: m.specs.pins, value: nf(pins.length) },
                      { label: m.specs.images, value: pins.length - vids - gifs ? nf(pins.length - vids - gifs) : null },
                      { label: m.specs.videos, value: vids ? nf(vids) : null },
                      { label: m.specs.gifs, value: gifs ? nf(gifs) : null },
                      { label: m.specs.boards, value: isProfile && result.boards?.length ? nf(result.boards.length) : null },
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
                  <h3 className="rc-h3">{m.collection.alsoOnProfile}</h3>
                  <ul className="rc-items">
                    <LineItem format="JPG" name={m.collection.profilePicture} note={m.collection.largestSize}>
                      <a
                        href={proxyDownloadHref(result.profile_avatar_url, avatarName)}
                        download={avatarName}
                        onClick={(e) => onProxyDownloadClick(e, result.profile_avatar_url!, avatarName)}
                        aria-busy={savingFile === avatarName}
                        aria-label={itemAria(m.collection.profilePictureSr)}
                        className="rc-btn"
                      >
                        {savingFile === avatarName ? (
                          <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        ) : (
                          <Download aria-hidden="true" />
                        )}
                        {m.receipt.downloadShort}<span className="sr-only">{m.collection.profilePictureSr}</span>
                      </a>
                    </LineItem>
                  </ul>
                </div>
              )}
              {isProfile && result.boards && result.boards.length > 0 && (
                <div className="rc-section">
                  <h3 className="rc-h3">{nodes(fmtParts(m.collection.boardsHeading, { n: nf(result.boards.length) }))}</h3>
                  <p className="rc-item-note mt-1">{m.collection.boardsHint}</p>
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
                              <span className="rc-row-meta">{nodes(pluralParts(m.collection.boardPins, b.pin_count, { n: nf(b.pin_count) }, lang))}</span>
                            )}
                          </span>
                          <span className="rc-row-go">
                            {m.collection.openBoard}
                            <ChevronRight aria-hidden="true" />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rc-section">
                <h3 className="rc-h3">{m.collection.pinsHeading}</h3>
                <ul className="rc-grid rc-grid--dense">
                  {pins.slice(0, displayLimit).map((pin, idx) => {
                    const mediaUrl = pin.is_video && pin.video_url ? pin.video_url : pin.image_url;
                    const ext = pin.is_video && pin.video_url ? 'mp4' : mediaFileExtension(pin.image_url, 'jpg');
                    return tile({
                      key: pin.pin_id || String(idx),
                      no: String(idx + 1),
                      thumb: pin.thumbnail_url || pin.image_url,
                      // "Pin 783444" / "Pin" are the extractor's placeholders, not titles.
                      title: (!PLACEHOLDER_PIN_TITLE.test(pin.title) && pin.title) || fmt(m.fallbacks.pinN, { n: n0(idx + 1) }),
                      mediaUrl,
                      filename: `pin_${pin.pin_id}.${ext}`,
                      ext,
                      isVideo: !!(pin.is_video && pin.video_url),
                      srName: fmt(m.fallbacks.pinSr, { n: n0(idx + 1) }),
                    });
                  })}
                </ul>
                {pins.length > displayLimit && (
                  <div className="rc-more">
                    <span>{nodes(fmtParts(m.collection.showing, { shown: nf(shown), total: nf(pins.length) }))}</span>
                    <button type="button" className="rc-btn" onClick={() => setDisplayLimit((prev) => prev + 24)}>
                      {nodes(fmtParts(m.collection.loadMore, { n: nf(Math.min(24, pins.length - displayLimit)) }))}
                    </button>
                    <button type="button" className="rc-btn rc-btn--quiet" onClick={() => setDisplayLimit(pins.length)}>
                      {nodes(fmtParts(m.collection.showAll, { n: nf(pins.length) }))}
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
          const packParts = [gifUrl ? 'GIF' : '', videoUrl ? 'MP4' : '', videoUrl ? 'MP3' : '', m.single.packCover]
            .filter(Boolean)
            .join(localized ? listSeparator(lang) : ', ');
          const ctaLabel = primaryFile ? fmt(m.receipt.download, { format: primaryFile.format }) : '';
          const dims = currentQuality?.width && currentQuality?.height ? `${currentQuality.width}×${currentQuality.height}` : null;
          const rowFiles = [mp4Name, mp3Name, coverName, 'pack'];
          const errorInRow = !!error && !isPartialZipMsg && !!attemptFile && rowFiles.includes(attemptFile);
          const rowAlert = (file: string) =>
            errorFor(file) ? (
              <div className="rc-notice" role="alert">
                <span className="stamp stamp-warn" aria-hidden="true">{m.marks.void}</span>
                <p>{error}</p>
              </div>
            ) : null;
          const rowNote = (file: string, idle: string) =>
            savingNow(file) ? downloadStatusLabel() : lastSaved === file && !savingFile ? m.receipt.startedShort : idle;
          const lineBtn = (saving: boolean) =>
            saving ? (
              <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <Download aria-hidden="true" />
            );
          return (
            <Receipt
              stock={stock}
              label={fmt(m.receipt.ready, { kind: m.kinds[resultKind] })}
              icon={resultKind === 'video' ? <Film aria-hidden="true" /> : <ImageIcon aria-hidden="true" />}
              serial={receiptSerial}
              labelledBy="result-heading"
              serialTemplate={localized ? m.ticket.serial : undefined}
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
                      aria-label={fmt(m.single.previewAria, { title: String(result.title) })}
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
                            {m.single.playPreview}
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
                          {gifPlaying ? m.single.freeze : m.single.playLoop}
                        </button>
                      )}
                    </>
                  )}
                </div>
                {resultHeading(result.title || m.fallbacks.pin, result.description || undefined)}
                <div className="rc-info">
                  <Specs
                    items={[
                      { label: m.specs.format, value: primaryFile?.format || null },
                      { label: m.specs.resolution, value: primaryFile?.format === 'MP4' ? dims : null },
                      { label: m.specs.plays, value: primaryFile?.format === 'GIF' ? m.specs.looping : null },
                    ]}
                  />
                  {result.qualities && result.qualities.length > 1 && primaryFile?.format === 'MP4' && (
                    <fieldset className="rc-q">
                      <legend>{m.specs.quality}</legend>
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
                                <span className="rc-q-dim" dir={localized ? 'ltr' : undefined}>
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
                    <h3 className="rc-h3">{m.single.alsoInPin}</h3>
                    <ul className="rc-items">
                      {showMp4Line && videoUrl && (
                        <LineItem format="MP4" name={m.single.videoName} note={rowNote(mp4Name, dims || m.single.withSound)} after={rowAlert(mp4Name)}>
                          <a
                            href={proxyDownloadHref(videoUrl, mp4Name)}
                            download={mp4Name}
                            onClick={(e) => onProxyDownloadClick(e, videoUrl, mp4Name)}
                            aria-busy={savingFile === mp4Name}
                            aria-label={itemAria(m.single.videoSr)}
                            className="rc-btn"
                            data-line="mp4"
                          >
                            {lineBtn(savingFile === mp4Name)}
                            {m.receipt.downloadShort}<span className="sr-only">{m.single.videoSr}</span>
                          </a>
                        </LineItem>
                      )}
                      {videoUrl && (
                        <LineItem
                          format="MP3"
                          name={fmt(m.single.audioName, { kbps: n0(MP3_KBPS) })}
                          note={rowNote(mp3Name, m.single.audioNote)}
                          after={rowAlert(mp3Name)}
                        >
                          <button
                            type="button"
                            aria-disabled={!!savingFile || undefined}
                            onClick={(e) => {
                              e.preventDefault();
                              if (savingFile) return;
                              void saveMp3FromVideo(videoUrl, mp3Name, result.title || '');
                            }}
                            aria-busy={savingFile === mp3Name}
                            aria-label={itemAria(m.single.audioSr)}
                            className="rc-btn"
                            data-line="mp3"
                          >
                            {lineBtn(savingFile === mp3Name)}
                            {m.receipt.downloadShort}<span className="sr-only">{m.single.audioSr}</span>
                          </button>
                        </LineItem>
                      )}
                      {showCoverLine && result.image_url && (
                        <LineItem
                          format={coverFmt}
                          name={m.single.coverName}
                          note={rowNote(coverName, m.single.coverNote)}
                          after={rowAlert(coverName)}
                        >
                          <a
                            href={proxyDownloadHref(result.image_url, coverName)}
                            download={coverName}
                            onClick={(e) => onProxyDownloadClick(e, result.image_url!, coverName)}
                            aria-busy={savingFile === coverName}
                            aria-label={itemAria(fmt(m.single.coverSr, { format: coverFmt }))}
                            className="rc-btn"
                            data-line="cover"
                          >
                            {lineBtn(savingFile === coverName)}
                            {m.receipt.downloadShort}<span className="sr-only">{fmt(m.single.coverSr, { format: coverFmt })}</span>
                          </a>
                        </LineItem>
                      )}
                      {showPack && (
                        <LineItem
                          format="ZIP"
                          name={m.single.packName}
                          note={
                            zipping && zipProgress.total
                              ? plural(m.receipt.packing, zipProgress.total, { done: n0(zipProgress.done), total: n0(zipProgress.total) }, lang)
                              : (lang ? packParts.charAt(0).toLocaleUpperCase(lang) : packParts.charAt(0).toUpperCase()) + packParts.slice(1)
                          }
                          after={rowAlert('pack')}
                        >
                          {zipping ? (
                            <button type="button" onClick={cancelZip} className="rc-btn" data-line="pack">
                              <X aria-hidden="true" />
                              {m.receipt.cancel}<span className="sr-only">{m.receipt.cancelSr}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAttemptFile('pack');
                                void downloadSinglePinCompletePack(result);
                              }}
                              aria-label={itemAria(m.single.packSr)}
                              className="rc-btn"
                              data-line="pack"
                            >
                              {lineBtn(false)}
                              {m.receipt.downloadShort}<span className="sr-only">{m.single.packSr}</span>
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
                    {copiedLink ? m.receipt.linkCopied : m.receipt.copyLink}
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
                    {qrOpen ? m.single.hideQr : m.single.sendToPhone}
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
                    {m.single.crop}
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
                    {m.single.trim}
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
                      alt={result.is_video ? m.single.qrAltVideo : m.single.qrAltImage}
                    />
                  ) : null}
                  <p className="min-w-0">{m.single.qrText}</p>
                </div>
              )}

              {((result.colors && result.colors.length > 0) || (result.tags && result.tags.length > 0) || result.title) && (
                <details className="rc-extras" data-extras="">
                  <summary>
                    <span>{m.extras.summary}</span>
                    <ChevronDown aria-hidden="true" />
                  </summary>
                  <div className="rc-extras-body">
                    {result.colors && result.colors.length > 0 && (
                      <div>
                        <div className="rc-extras-head">
                          <h3 className="rc-h3">{m.extras.palette}</h3>
                          <span className="rc-extras-hint">{m.extras.paletteHint}</span>
                        </div>
                        <div className="rc-chips">
                          {result.colors.map((hex, idx) => (
                            <button key={idx} type="button" className="rc-swatch" onClick={() => copyColorHex(hex)}>
                              <i style={{ backgroundColor: hex }} aria-hidden="true" />
                              <span translate="no">{copiedColor === hex ? m.extras.copied : hex}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.tags && result.tags.length > 0 && (
                      <div>
                        <div className="rc-extras-head">
                          <h3 className="rc-h3">{m.extras.tags}</h3>
                          <button type="button" className="rc-btn" onClick={copyTagsToClipboard}>
                            {copiedTags ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                            {copiedTags ? m.extras.copied : m.extras.copyTags}
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
                        <h3 className="rc-h3">{m.extras.repostCaption}</h3>
                      </div>
                      <div className="rc-seg" role="group" aria-label={m.extras.captionFor}>
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
                        {copiedCaption ? m.extras.copiedCaption : m.extras.copyCaption}
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
          label={plural(m.batch.ready, batchResults.length, { n: n0(batchResults.length) }, lang)}
          icon={<Layers aria-hidden="true" />}
          labelledBy="result-heading"
          serialTemplate={localized ? m.ticket.serial : undefined}
        >
          <div className="rc-body rc-body--plain">
            {resultHeading(plural(m.batch.heading, batchResults.length, { n: n0(batchResults.length) }, lang))}
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
              <span>{nodes(fmtParts(m.batch.downloadAll, { n: n0(batchResults.length) }))}</span>
            </button>
            <p className="rc-note">
              {savingFile && downloadProgress ? downloadStatusLabel() : m.batch.oneAfterAnother}
            </p>
            {receiptError}
          </div>
          <Perf />
          <div className="rc-section pb-3">
            <ul className="list-none m-0 p-0">
              {batchResults.map((res, idx) => {
                const gif = resolvedGifUrl(res);
                const ext = gif ? 'gif' : res.is_video ? 'mp4' : mediaFileExtension(res.image_url || '', 'jpg');
                const name = `${slugify(res.title || 'pin')}.${ext}`;
                const mediaUrl = gif || res.video_url || res.image_url!;
                const stock: StockKey = gif ? 'gif' : res.is_video ? 'video' : 'image';
                return (
                  <li key={idx} className="rc-batch-row">
                    <img src={res.thumbnail_url || res.image_url || ''} alt={res.title} width={64} height={64} loading="lazy" />
                    <div className="min-w-0">
                      <p className="rc-item-name line-clamp-2 break-words">{res.title}</p>
                      <span className="rc-pill" style={{ '--kind': STOCKS[stock].color } as React.CSSProperties}>
                        {gif ? m.kinds.gif : res.is_video ? m.kinds.video : m.kinds.image}
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
                      {nodes(fmtParts(m.receipt.download, { format: ext.toUpperCase() }))}
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
          <h2 className="rc-h3">{m.recent.heading}</h2>
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
          messages={localized ? m.cropper : undefined}
          lang={lang}
        />
      )}

      {/* Audio Trimmer Modal */}
      {showTrimmer && (result?.video_url || selectedQuality) && (
        <AudioTrimmer
          audioUrl={selectedQuality || result!.video_url!}
          title={result?.title || 'pinterest_audio'}
          onClose={() => setShowTrimmer(false)}
          messages={localized ? { trimmer: m.trimmer, mp3: m.mp3 } : undefined}
          lang={lang}
        />
      )}
    </div>
  );
}
