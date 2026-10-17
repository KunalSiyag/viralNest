/**
 * IslandMessages: every string the React islands print (DownloaderForm and its
 * receipts, AudioTrimmer, ImageCropperModal, StickyPasteBar).
 *
 * Contract (docs/i18n/architecture.md §10, plan §8 Phase 2):
 * - `src/i18n/island/en.ts` is the English catalog and the islands' built-in
 *   default. Each locale writer adds `src/i18n/island/<loc>.ts` exporting
 *   `const ISLAND: IslandMessages` with the same key tree.
 * - Locale catalogs are imported only by server templates, which pass
 *   `pickIsland(catalog, variant)` (pick.ts) as the island's `messages` prop.
 *   They never enter a client bundle.
 * - Values are plain strings with `{name}` tokens (fmt.ts). Counts use
 *   `PluralForms`, keyed by Intl.PluralRules category: fill every category
 *   `new Intl.PluralRules(lang).resolvedOptions().pluralCategories` lists
 *   (ru one/few/many/other, ar zero/one/two/few/many/other, th/vi/id other).
 *   English keeps today's output, so its plural maps carry `other` only.
 * - Keep a token set identical to English; the tests compare them.
 * - Format names, file names and brand names (MP4, MP3, GIF, JPG, ZIP,
 *   Pinterest, TikTok, pin.it) stay as they are.
 */
import type { FormVariant } from '../routes';

export type { FormVariant };

/** A count message keyed by Intl.PluralRules category; `other` is required. */
export type PluralForms = { other: string } & Partial<Record<'zero' | 'one' | 'two' | 'few' | 'many', string>>;

/** What the receipt band calls the collected thing ("Ready · {kind}"). */
export type ResultKind = 'image' | 'video' | 'gif' | 'carousel' | 'board' | 'profile' | 'avatar';

/** The recovery a failed claim needs; picks the void receipt's title and hint. */
export type ErrorKind = 'validation' | 'link' | 'private' | 'removed' | 'download' | 'other';

/** Ticket stock chips under the form (the tool picker). */
export type ChipKey = 'pin' | 'video' | 'image' | 'gif' | 'board' | 'profile' | 'avatar';

/**
 * `code` values /api/extract sends next to its English `error` (additive field).
 * `collection_empty` is split by link type because the server words it per type.
 */
export type ApiErrorKey =
  | 'invalid_input'
  | 'blocked'
  | 'not_pinterest'
  | 'left_pinterest'
  | 'removed_or_private'
  | 'avatar_not_found'
  | 'collection_empty_board'
  | 'collection_empty_profile'
  | 'collection_unavailable'
  | 'no_media'
  | 'access_denied'
  | 'origin_denied'
  | 'server_error';

/** lib/audio Mp3Error codes. */
export type Mp3ErrorKey = 'no_audio' | 'unsupported' | 'failed' | 'aborted';

/** Copy that changes with the page's tool (per-variant CTA labels, plan F9). */
export interface VariantMessages {
  /** Visible label above the input when the One link / Up to 5 switch is hidden. */
  singleTab: string;
  /** Input placeholder; end with … and show an example link. */
  placeholder: string;
  /** Accessible name of the link input. */
  ariaLabel: string;
  /** The stub button. Name the file the tool makes (video → MP4, board → ZIP). */
  submitLabel: string;
  /** One honest line under the input: what this tool saves. */
  hint: string;
  /** Grey note beside the label before anything is pasted. */
  expect: string;
}

export interface IslandMessages {
  /**
   * BCP 47 tag for Intl number and plural formatting: the locale's
   * LOCALE_META htmlLang (e.g. 'pt-BR'). Numbers always use Western digits.
   */
  lang: string;

  variants: Record<FormVariant, VariantMessages>;

  /** The paper ticket (form). */
  ticket: {
    /** Small caps line on top of the ticket. */
    admitOne: string;
    /** Ticket serial once a link is read: {serial} is the pin id, pin.it code or path. */
    serial: string;
    /** Serial placeholder before a link is pasted. */
    serialEmpty: string;
    /** Accessible name of the One link / Up to 5 switch. */
    modeGroup: string;
    oneLink: string;
    upToFive: string;
    /** Label above the input on the hub (home) form. */
    hubLabel: string;
    clearAria: string;
    pasteAria: string;
    paste: string;
    /** Screen-reader label of the batch textarea. */
    batchLabel: string;
    /** Batch textarea placeholder; keep the two example links on their own lines. */
    batchPlaceholder: string;
    /** Stub button while one link is read. */
    processing: string;
    /** Stub button while batch links are read. */
    batchProcessing: string;
    /** Stub button in batch mode. */
    batchSubmit: string;
    /** Accessible name of the tool-chip row. */
    toolsNav: string;
    /** Shown when the pasted text is a link but not a Pinterest one. */
    notPinterestHelp: string;
  };

  /** Stamps printed on the ticket as soon as a link is read. */
  stamps: {
    notPinterest: string;
    board: string;
    profileZip: string;
    profileAvatar: string;
    pinShort: string;
    pin: string;
  };

  /** Rubber stamps on receipts. */
  marks: { void: string; partial: string; packed: string; done: string };

  /** Tool chips under the ticket (label per stock). */
  chips: Record<ChipKey, string>;

  /**
   * Notice after the form switched itself to a better tool.
   * Rendered as "{message}. {open}" with {open} linking to that tool (th
   * joins them with " · ", fmt.ts noticeSeparator; no link when the tool's
   * page is the current page).
   */
  routeNotice: {
    boardLink: string;
    profileLink: string;
    gif: string;
    video: string;
    /** {n}: number of slides. */
    carousel: PluralForms;
    board: string;
    profile: string;
    open: string;
  };

  /** Short status under a download button while a file is fetched or made. */
  progress: {
    /** MP3: decoding the video's sound. */
    reading: string;
    /** MP3: encoding, {pct} is 0–100. */
    making: string;
    connecting: string;
    /** {loaded} and {total} are sizes such as "1.5 MB". */
    downloadingOf: string;
    downloading: string;
  };

  /** Size units after a number (a no-break space is added before them). */
  bytes: { B: string; KB: string; MB: string; GB: string };

  /** Screen-reader narration (polite live region). {pct} is rounded down to 0/25/50/75. */
  live: {
    readingLink: string;
    readingLinks: string;
    packingZip: string;
    making: string;
    makingPct: string;
    downloading: string;
    downloadingPct: string;
    /** {packed} of {total}: plural on {total}. */
    zipPacked: PluralForms;
    started: string;
    copied: string;
  };

  /** Receipt band label: "Ready · {kind}". */
  kinds: Record<ResultKind, string>;

  /** Void receipt (the claim could not be fulfilled): title and recovery hint per error kind. */
  voidCopy: Record<ErrorKind, { title: string; hint?: string }>;

  receipt: {
    /** Band label, {kind} from `kinds`. */
    ready: string;
    /** Loading receipt band. */
    fetching: string;
    another: string;
    tryAnother: string;
    guide: string;
    /** {file} is the file name, printed bold. */
    savesAs: string;
    /** Collect button for the main file, {format} = MP4, JPG, GIF… */
    download: string;
    /** Line-item button (the item's name follows for screen readers). */
    downloadShort: string;
    /**
     * Accessible name of a line-item button on localized pages: {verb} is
     * `downloadShort`, {item} the item's screen-reader text (videoSr, audioSr,
     * coverSr, packSr, profilePictureSr, with their leading space). Put them in
     * your language's order, e.g. tr "{item} {verb}" → "Sesi (MP3) İndir".
     */
    itemAria: string;
    downloadProgressAria: string;
    zipProgressAria: string;
    /** aria-valuetext, plural on {total}. */
    zipProgressText: PluralForms;
    /** {done} is printed bold; plural on {total}. */
    packing: PluralForms;
    cancel: string;
    /** Screen-reader suffix after Cancel. */
    cancelSr: string;
    downloadZip: string;
    /** Partial ZIP: {name} bold, {packed} of {total}, {missing} failed. Plural on {total}. */
    zipPartial: PluralForms;
    /** Full ZIP; plural on {total}. */
    zipAll: PluralForms;
    /** Appended (with its leading space) when the ZIP has no MP3. {reason} follows. */
    noMp3: string;
    /** {file} printed bold. */
    started: string;
    /** Under a line item once its download started. */
    startedShort: string;
    copyLink: string;
    linkCopied: string;
    /** Grid tile button, {format} = MP4, JPG, GIF… */
    save: string;
    /** Screen-reader suffix on a tile button, e.g. ", slide 3". */
    tileSr: string;
    /** Tile kind tags. */
    tagVideo: string;
    tagGif: string;
  };

  /** Spec labels printed like a boarding pass, and their fixed values. */
  specs: {
    slides: string;
    images: string;
    videos: string;
    gifs: string;
    pins: string;
    boards: string;
    format: string;
    crop: string;
    uncropped: string;
    resolution: string;
    plays: string;
    looping: string;
    quality: string;
  };

  /** Titles used when Pinterest gives none (also stored in Recent links). */
  fallbacks: {
    pin: string;
    carousel: string;
    board: string;
    profile: string;
    user: string;
    /** {n} = 1-based number. */
    slide: string;
    pinN: string;
    /** Screen-reader item names on tile buttons. */
    slideSr: string;
    pinSr: string;
  };

  carousel: { everySlide: string };

  avatar: {
    /** Image alt, {name} = account name. */
    alt: string;
    openFull: string;
    newTabSr: string;
    /** {link} is the link to the profile tool, text = `profileLink`. */
    promo: string;
    profileLink: string;
  };

  collection: {
    /** Under a board title, {user} without @. */
    byUser: string;
    /** Under a profile title. */
    atUser: string;
    alsoOnProfile: string;
    profilePicture: string;
    largestSize: string;
    profilePictureSr: string;
    /** {n} = number of boards. */
    boardsHeading: string;
    boardsHint: string;
    /** Pins on one board. */
    boardPins: PluralForms;
    openBoard: string;
    pinsHeading: string;
    /** {shown} of {total}. */
    showing: string;
    loadMore: string;
    showAll: string;
  };

  single: {
    /** Video element label, {title} = pin title. */
    previewAria: string;
    playPreview: string;
    freeze: string;
    playLoop: string;
    alsoInPin: string;
    videoName: string;
    withSound: string;
    videoSr: string;
    /** {kbps} = MP3 bitrate. */
    audioName: string;
    audioNote: string;
    audioSr: string;
    coverName: string;
    coverNote: string;
    /** {format} = JPG, PNG… */
    coverSr: string;
    packName: string;
    /** Joined into the ZIP note, e.g. "GIF, MP4, MP3, cover image". */
    packCover: string;
    packSr: string;
    sendToPhone: string;
    hideQr: string;
    crop: string;
    trim: string;
    qrAltVideo: string;
    qrAltImage: string;
    qrText: string;
  };

  extras: {
    summary: string;
    palette: string;
    paletteHint: string;
    copied: string;
    tags: string;
    copyTags: string;
    repostCaption: string;
    captionFor: string;
    copyCaption: string;
    copiedCaption: string;
    /** Repost captions, {title} = pin title, {tags} = its #tags. Keep the hashtags. */
    captionReels: string;
    captionTiktok: string;
    captionShorts: string;
  };

  batch: {
    /** Band label, plural on {n}. */
    ready: PluralForms;
    heading: PluralForms;
    downloadAll: string;
    oneAfterAnother: string;
  };

  recent: { heading: string };

  /** Client-side problems. */
  errors: {
    emptyLink: string;
    emptyBatch: string;
    batchInvalid: string;
    batchFailed: string;
    /** Server answered without a message. */
    extractFailed: string;
    /** Network or unexpected failure on a localized page (English shows the browser's text). */
    unknown: string;
    qr: string;
    copyLink: string;
    fileUnavailable: string;
    noBody: string;
    downloadFailed: string;
    zipNothing: string;
    zipFailed: string;
    /** Never shown; kept so a partial ZIP stays recognisable. Plural on {total}. */
    zipPartial: PluralForms;
    /** Why a ZIP holds no MP3. */
    noMp3Video: string;
    noMp3Browser: string;
  };

  /** /api/extract failures by `code`. English matches the server text exactly. */
  api: Record<ApiErrorKey, string>;

  /** lib/audio MP3 failures by Mp3Error code. */
  mp3: Record<Mp3ErrorKey, string>;

  trimmer: {
    title: string;
    reading: string;
    loadFailed: string;
    /** {time} is the highlighted seconds value. */
    start: string;
    end: string;
    /** Seconds value, {n} has one decimal. */
    seconds: string;
    startAria: string;
    endAria: string;
    /** {len} is the bold length. */
    length: string;
    lengthValue: string;
    pause: string;
    listen: string;
    cancel: string;
    wav: string;
    /** {kbps} = MP3 bitrate. */
    mp3: string;
    /** {format} = MP3 or WAV. */
    exportFailed: string;
    /** {pct} 0–100. */
    making: string;
    note: string;
  };

  cropper: {
    title: string;
    pick: string;
    presets: { original: string; square: string; story: string; portrait: string; landscape: string };
    previewAlt: string;
    processing: string;
    cancel: string;
    /** {ratio} e.g. 9:16, or presets.original as written (English alone prints it in capitals). */
    download: string;
  };

  sticky: {
    close: string;
    label: string;
    placeholder: string;
    paste: string;
    save: string;
    top: string;
  };
}

/** Recursive partial, for `messages` props merged over English. */
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K] };

/**
 * What a server template passes to DownloaderForm as `messages`:
 * the catalog minus the sticky bar, with only the variants this page can reach.
 */
export type IslandProps = Omit<IslandMessages, 'variants' | 'sticky'> & {
  variants: Partial<Record<FormVariant, VariantMessages>>;
};

/** What a server template passes to StickyPasteBar as `messages`. */
export type StickyProps = Pick<IslandMessages, 'lang' | 'sticky'>;
