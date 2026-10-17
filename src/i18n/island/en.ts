/**
 * English island catalog: the islands' built-in default (same strings the
 * components printed inline before i18n, so English HTML and behaviour are
 * unchanged). Locale writers copy this shape into src/i18n/island/<loc>.ts
 * as `export const ISLAND: IslandMessages = { … }`. Field notes: types.ts.
 *
 * Do not import locale catalogs from a component: only server templates do,
 * through pickIsland() (pick.ts).
 */
import type { IslandMessages } from './types';

/**
 * Server templates: `pickIsland(locale, variant | 'sticky')` gives an island its
 * locale's `messages` (undefined on English). Catalogs are registered when
 * src/i18n/island/catalogs.ts is imported. Unused by components, so it is
 * tree-shaken from client bundles and carries no locale strings anyway.
 */
export { pickIsland } from './pick';

export type {
  IslandMessages,
  IslandProps,
  StickyProps,
  VariantMessages,
  PluralForms,
  ResultKind,
  ErrorKind,
  ChipKey,
  ApiErrorKey,
  Mp3ErrorKey,
  DeepPartial,
  FormVariant,
} from './types';

export const EN_ISLAND: IslandMessages = {
  lang: 'en',

  variants: {
    hub: {
      singleTab: 'Pin / Board / Profile',
      placeholder: 'Paste Pinterest link here… e.g. https://pin.it/…',
      ariaLabel: 'Pinterest pin, board, or profile link',
      submitLabel: 'Download',
      hint: 'Public pin, board, or profile URLs. Board & profile links download as ZIP.',
      expect: 'Waiting for a link',
    },
    pin: {
      singleTab: 'Single Pin URL',
      placeholder: 'Paste pin URL… https://pinterest.com/pin/… or pin.it/…',
      ariaLabel: 'Pinterest pin link',
      submitLabel: 'Download Pin',
      hint: 'Supports image pins, video pins, GIFs, and multi-image carousels (all slides).',
      expect: 'Takes a pin link',
    },
    video: {
      singleTab: 'Video Pin URL',
      placeholder: 'Paste video pin URL… https://pinterest.com/pin/… or pin.it/…',
      ariaLabel: 'Pinterest video pin link',
      submitLabel: 'Download Video',
      hint: 'Saves the MP4 (usually 720p, 1080p when the pin has it). Can also make an MP3 of its sound in your browser.',
      expect: 'Takes a video pin',
    },
    image: {
      singleTab: 'Image Pin URL',
      placeholder: 'Paste image pin URL… https://pinterest.com/pin/…',
      ariaLabel: 'Pinterest image pin link',
      submitLabel: 'Download Image',
      hint: 'Saves the largest size Pinterest publishes (up to 1200 px wide). Carousels return every slide.',
      expect: 'Takes an image pin',
    },
    gif: {
      singleTab: 'GIF Pin URL',
      placeholder: 'Paste GIF pin URL… https://pinterest.com/pin/… or pin.it/…',
      ariaLabel: 'Pinterest GIF pin link',
      submitLabel: 'Download GIF',
      hint: 'Saves the looping animated GIF — not a still JPG of the first frame.',
      expect: 'Takes a GIF pin',
    },
    board: {
      singleTab: 'Board URL',
      placeholder: 'Paste board URL… https://pinterest.com/username/board-name/',
      ariaLabel: 'Pinterest board link',
      submitLabel: 'Extract Board Pins',
      hint: 'Paste a public board link to list pins, then Download ZIP for the full pack.',
      expect: 'Takes a board link',
    },
    profile: {
      singleTab: 'Profile URL',
      placeholder: 'Paste profile URL… https://pinterest.com/username/',
      ariaLabel: 'Pinterest profile link',
      submitLabel: 'Extract Profile Pins (ZIP)',
      hint: 'Downloads all public pins posted by this user account as a ZIP archive.',
      expect: 'Takes a profile link',
    },
    'profile-picture': {
      singleTab: 'Profile Avatar URL',
      placeholder: 'Paste profile URL… https://pinterest.com/username/',
      ariaLabel: 'Pinterest profile link for avatar DP',
      submitLabel: 'Get Profile Picture (HD)',
      hint: 'Saves the largest profile photo Pinterest publishes for a public account.',
      expect: 'Takes a profile link',
    },
  },

  ticket: {
    admitOne: 'Admit one · public link',
    serial: 'No. {serial}',
    serialEmpty: 'No. ——————',
    modeGroup: 'Link mode',
    oneLink: 'One link',
    upToFive: 'Up to 5',
    hubLabel: 'Pinterest link',
    clearAria: 'Clear link',
    pasteAria: 'Paste link from clipboard',
    paste: 'Paste',
    batchLabel: 'Batch Pinterest URLs (up to 5 URLs, one per line)',
    batchPlaceholder: 'One link per line, up to 5…\nhttps://pinterest.com/pin/1234567/\nhttps://pin.it/abc1234',
    processing: 'Extracting HD media…',
    batchProcessing: 'Processing links…',
    batchSubmit: 'Extract all',
    toolsNav: 'Pick the tool for your link',
    notPinterestHelp: 'This isn’t a Pinterest link. In the Pinterest app tap Share → Copy link, then paste it here.',
  },

  stamps: {
    notPinterest: 'Not Pinterest',
    board: 'Board → ZIP',
    profileZip: 'Profile → ZIP',
    profileAvatar: 'Profile → Avatar',
    pinShort: 'Pin · short link',
    pin: 'Pin',
  },

  marks: { void: 'Void', partial: 'Partial', packed: 'Packed', done: 'Done' },

  chips: {
    pin: 'Pin',
    video: 'Video MP4',
    image: 'HD photo',
    gif: 'GIF',
    board: 'Board ZIP',
    profile: 'Profile ZIP',
    avatar: 'Avatar / DP',
  },

  routeNotice: {
    boardLink: 'Pinterest Board link detected · switched to Board Downloader',
    profileLink: 'Pinterest Profile link detected · switched to Profile Downloader',
    gif: 'Looping animated GIF detected — switched to GIF Downloader suite',
    video: 'HD Video pin detected — switched to Video Downloader suite',
    carousel: { other: 'Multi-slide carousel detected ({n} slides) — switched to Carousel Downloader' },
    board: 'Pinterest Board detected — switched to Board Downloader',
    profile: 'Pinterest Profile detected — switched to Profile Downloader',
    open: 'Open that tool',
  },

  progress: {
    reading: "Reading the video's sound…",
    making: 'Making the MP3… {pct}%',
    connecting: 'Connecting to Pinterest…',
    downloadingOf: 'Downloading… {loaded} of {total} ({pct}%)',
    downloading: 'Downloading… {loaded}',
  },

  bytes: { B: 'B', KB: 'KB', MB: 'MB', GB: 'GB' },

  live: {
    readingLink: 'Reading your link…',
    readingLinks: 'Reading your links…',
    packingZip: 'Packing ZIP, {pct}% done',
    making: 'Making {file} in your browser…',
    makingPct: 'Making {file} in your browser, {pct}% done',
    downloading: 'Downloading {file}…',
    downloadingPct: 'Downloading {file}, {pct}% done',
    zipPacked: { other: 'ZIP packed with {packed} of {total} files. Download started.' },
    started: 'Download started: {file}',
    copied: 'Copied to clipboard.',
  },

  kinds: {
    image: 'Image pin',
    video: 'Video pin',
    gif: 'GIF pin',
    carousel: 'Carousel',
    board: 'Board',
    profile: 'Profile',
    avatar: 'Profile picture',
  },

  voidCopy: {
    validation: { title: 'Paste a link first' },
    link: {
      title: 'That isn’t a Pinterest link',
      hint: 'In the Pinterest app tap Share → Copy link, then paste it into the ticket.',
    },
    private: {
      title: 'Nothing public to collect',
      hint: 'Only public pins, boards and profiles can be saved. Secret boards and private accounts stay private.',
    },
    removed: { title: 'This pin was taken down' },
    download: { title: 'The file didn’t download', hint: 'Pinterest sometimes stops serving a file. Try the link again.' },
    other: { title: 'Couldn’t collect this link', hint: 'Check the link opens on Pinterest, then try again.' },
  },

  receipt: {
    ready: 'Ready · {kind}',
    fetching: 'Fetching from Pinterest…',
    another: 'Download another',
    tryAnother: 'Try another link',
    guide: 'Read the step-by-step guide',
    savesAs: 'Saves as {file}',
    download: 'Download {format}',
    downloadShort: 'Download',
    itemAria: '{verb}{item}',
    downloadProgressAria: 'Download progress',
    zipProgressAria: 'ZIP packing progress',
    zipProgressText: { other: '{done} of {total} files packed' },
    packing: { other: 'Packing {done} of {total} files…' },
    cancel: 'Cancel',
    cancelSr: ' ZIP',
    downloadZip: 'Download ZIP ({n})',
    zipPartial: {
      other: '{name} has {packed} of {total} files. {missing} could not be fetched from Pinterest; save those one at a time.',
    },
    zipAll: { other: '{name}: all {total} files. Download started.' },
    noMp3: ' No MP3 in this ZIP. {reason}',
    started: 'Download started: {file}',
    startedShort: 'Download started',
    copyLink: 'Copy file link',
    linkCopied: 'Link copied',
    save: 'Save {format}',
    tileSr: ', {name}',
    tagVideo: 'Video',
    tagGif: 'GIF',
  },

  specs: {
    slides: 'Slides',
    images: 'Images',
    videos: 'Videos',
    gifs: 'GIFs',
    pins: 'Pins',
    boards: 'Boards',
    format: 'Format',
    crop: 'Crop',
    uncropped: 'Uncropped',
    resolution: 'Resolution',
    plays: 'Plays',
    looping: 'Looping',
    quality: 'Quality',
  },

  fallbacks: {
    pin: 'Pinterest Pin',
    carousel: 'Pinterest Carousel',
    board: 'Pinterest Board',
    profile: 'Pinterest Profile',
    user: 'Pinterest user',
    slide: 'Slide {n}',
    pinN: 'Pin {n}',
    slideSr: 'slide {n}',
    pinSr: 'pin {n}',
  },

  carousel: { everySlide: 'Every slide' },

  avatar: {
    alt: '{name} profile picture',
    openFull: 'Open full size',
    newTabSr: ' (opens in a new tab)',
    promo: 'Want every pin from this profile? Use the {link} instead.',
    profileLink: 'Profile Downloader (ZIP)',
  },

  collection: {
    byUser: 'by @{user}',
    atUser: '@{user}',
    alsoOnProfile: 'Also on this profile',
    profilePicture: 'Profile picture',
    largestSize: 'Largest size Pinterest publishes',
    profilePictureSr: ' profile picture (JPG)',
    boardsHeading: 'Boards ({n})',
    boardsHint: 'Open a board to collect just its pins.',
    boardPins: { other: '{n} pins' },
    openBoard: 'Open board',
    pinsHeading: 'Pins',
    showing: 'Showing {shown} of {total}. The ZIP has all of them.',
    loadMore: 'Load {n} more',
    showAll: 'Show all {n}',
  },

  single: {
    previewAria: 'Preview: {title}',
    playPreview: 'Play preview',
    freeze: 'Freeze',
    playLoop: 'Play loop',
    alsoInPin: 'Also in this pin',
    videoName: 'Video',
    withSound: 'With sound',
    videoSr: ' video (MP4)',
    audioName: 'Audio, {kbps} kbps',
    audioNote: "Made in your browser from the video's sound",
    audioSr: ' audio (MP3)',
    coverName: 'Cover image',
    coverNote: 'The still shown on Pinterest',
    coverSr: ' cover image ({format})',
    packName: 'Everything',
    packCover: 'cover image',
    packSr: ' everything (ZIP)',
    sendToPhone: 'Send to phone',
    hideQr: 'Hide phone QR',
    crop: 'Crop / resize',
    trim: 'Trim sound',
    qrAltVideo: 'QR code linking to the extracted video file — scan to open it on your phone',
    qrAltImage: 'QR code linking to the extracted image file — scan to open it on your phone',
    qrText:
      'Scan with your phone camera to open this file instantly — then long-press to save it to your gallery. No app or login needed.',
  },

  extras: {
    summary: 'Colours, tags and repost captions',
    palette: 'Palette',
    paletteHint: "Shades of the pin's main colour. Tap to copy.",
    copied: 'Copied',
    tags: 'Tags',
    copyTags: 'Copy tags',
    repostCaption: 'Repost caption',
    captionFor: 'Caption for',
    copyCaption: 'Copy caption & tags',
    copiedCaption: 'Copied caption',
    captionReels: '✨ {title}\n\nTag someone who needs to see this! 👇\n\n📌 Saved via PintDownload\n\n{tags} #reels #viral #aesthetic',
    captionTiktok: 'POV: {title} 🌿🔥\n\nFollow for more daily aesthetic pins & inspo!\n\n{tags} #fyp #viral #pinterest #foryou',
    captionShorts: '🔥 {title} | Pinterest Aesthetic\n\nLike & Subscribe for more daily visual content!\n\n{tags} #shorts #pintdownload #pinterest',
  },

  batch: {
    ready: { other: 'Ready · {n} pins' },
    heading: { other: '{n} files collected' },
    downloadAll: 'Download all ({n})',
    oneAfterAnother: 'Files download one after another.',
  },

  recent: { heading: 'Recent links' },

  errors: {
    emptyLink: 'Paste a public Pinterest link first. In the app: Share → Copy link.',
    emptyBatch: 'Paste at least one Pinterest link, one per line.',
    batchInvalid: 'Please enter valid Pinterest URLs (e.g., https://pinterest.com/pin/... or https://pin.it/...)',
    batchFailed: 'Failed to extract batch links. Please check if the Pinterest URLs are public.',
    extractFailed: 'Failed to extract media from Pinterest.',
    unknown: 'An error occurred. Check the Pinterest URL.',
    qr: 'Could not generate QR code. Copy the link instead.',
    copyLink: 'Could not copy the link. Long-press the download button to copy it instead.',
    fileUnavailable:
      'Could not download this file. The pin may be private, or Pinterest is no longer serving that media URL.',
    noBody: 'No response body',
    downloadFailed: 'Download failed.',
    zipNothing: 'Could not pack any media into the ZIP. Files may be unavailable.',
    zipFailed: 'Failed to create ZIP archive.',
    zipPartial: { other: 'ZIP ready with {ok} of {total} files ({failed} failed).' },
    noMp3Video: 'The video could not be fetched from Pinterest.',
    noMp3Browser: "This browser couldn't make it.",
  },

  api: {
    invalid_input: 'Please enter a valid Pinterest link.',
    blocked: 'This content has been removed upon author request.',
    not_pinterest:
      'Invalid link. Please enter a valid Pinterest link (e.g., https://pinterest.com/pin/... or https://pin.it/...)',
    left_pinterest: 'This link leads away from Pinterest, so there is nothing to download.',
    removed_or_private:
      'This pin was removed or made private, so there is nothing to download. Check the link opens on Pinterest.',
    avatar_not_found: 'Could not find a profile picture for this Pinterest user. The profile may be private.',
    collection_empty_board: 'Could not find public pins on this Pinterest board. The board may be private or empty.',
    collection_empty_profile:
      'Could not find public pins on this Pinterest profile. The profile may be private or empty.',
    collection_unavailable: 'Pinterest did not send the pins of this board just now. Try again in a minute.',
    no_media: 'Could not find downloadable media for this link. Please check if the Pin is public.',
    access_denied: 'Access denied.',
    origin_denied: 'Direct API scraping is unauthorized.',
    server_error: 'Failed to process Pinterest link. Please ensure the link is a valid public Pin.',
  },

  mp3: {
    no_audio: 'This video has no sound to save as MP3. Download the MP4 instead.',
    unsupported:
      "This browser can't read the video's sound, so it can't make the MP3. Try Chrome, Edge, Safari or Firefox, or download the MP4.",
    failed: "Couldn't make the MP3. Try again, or download the MP4 and keep its sound.",
    aborted: 'MP3 cancelled.',
  },

  trimmer: {
    title: 'Audio Hook Trimmer & Sound Saver',
    reading: 'Reading the video’s sound…',
    loadFailed: "Couldn't load this video's sound. Check your connection and try again.",
    start: 'Start Time: {time}',
    end: 'End Time: {time}',
    seconds: '{n}s',
    startAria: 'Audio trim start time in seconds',
    endAria: 'Audio trim end time in seconds',
    length: 'Clip Length: {len}',
    lengthValue: '{n} sec',
    pause: 'Pause',
    listen: 'Listen Clip',
    cancel: 'Cancel',
    wav: 'Clip as WAV',
    mp3: 'Clip as MP3 ({kbps} kbps)',
    exportFailed: "Couldn't make the {format} clip. Try again.",
    making: 'Making the MP3… {pct}%',
    note: 'Made in your browser from the video’s sound. Nothing is uploaded.',
  },

  cropper: {
    title: 'Aspect-Ratio Cropper & Resizer',
    pick: 'Select Social Media Aspect Ratio',
    presets: {
      original: 'Original',
      square: '1:1 Square (IG Post)',
      story: '9:16 Story/Reel (TikTok)',
      portrait: '4:5 Portrait (IG)',
      landscape: '16:9 Landscape (YT)',
    },
    previewAlt: 'Cropped Preview',
    processing: 'Processing image canvas…',
    cancel: 'Cancel',
    download: 'Download Cropped ({ratio})',
  },

  sticky: {
    close: 'Close sticky paste bar',
    label: 'Paste Pinterest link',
    placeholder: 'Link…',
    paste: 'Paste',
    save: 'Save',
    top: 'Scroll to top',
  },
};
