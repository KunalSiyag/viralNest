/** Types for Pinterest extraction. Shared by /api/extract and the MCP server. */

export type UrlKind = 'pin' | 'board' | 'profile' | 'other';

export interface CollectionPin {
  pin_id: string;
  url: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  video_url?: string | null;
  is_video: boolean;
}

/** One slide of a carousel / multi-page Idea Pin */
export interface MediaItem {
  index: number;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url?: string;
  title?: string;
}

export interface VideoQuality {
  label: string;
  url: string;
  width?: number;
  height?: number;
}

/**
 * Single-pin body exactly as /api/extract serialises it. `pin_id` is present
 * on the PinResource path and absent on the HTML-strategy path.
 */
export interface PinBody {
  platform: 'pinterest';
  pin_id?: string;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  title: string;
  description: string;
  qualities: VideoQuality[];
  tags: string[];
  colors: string[];
  dominant_color: string;
  is_video: boolean;
  is_gif: boolean;
  is_carousel: boolean;
  media_count: number;
  media_items: MediaItem[];
}

export interface ProfileBoard {
  name: string;
  url: string;
  pin_count?: number;
}

export interface BoardBody {
  platform: 'pinterest';
  is_board: true;
  is_profile: false;
  board_title: string;
  board_url: string;
  username: string | null;
  pins: CollectionPin[];
  pin_count: number;
}

export interface ProfileBody {
  platform: 'pinterest';
  is_board: false;
  is_profile: true;
  profile_title: string;
  profile_url: string;
  profile_avatar_url: string | null;
  username: string | null;
  board_title: string;
  board_url: string;
  boards: ProfileBoard[];
  pins: CollectionPin[];
  pin_count: number;
}

export interface AvatarBody {
  platform: 'pinterest';
  is_avatar_only: true;
  is_profile: true;
  profile_avatar_url: string;
  username: string | null;
  profile_title: string;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface ExtractRequest {
  /** Raw body.url from /api/extract or the MCP argument. */
  url: unknown;
  /** 'avatar' selects the profile-picture branch. */
  intent?: unknown;
}

export type ExpectedLinkType = 'pin' | 'board' | 'profile' | 'avatar';

export interface ExtractOptions {
  /**
   * Pagination stop for board/profile results (never above the defaults:
   * 250 board / 200 profile, current /api/extract). The HTML id scan always
   * uses the default, so results can exceed this; callers slice.
   */
  maxCollectionPins?: number;
  /**
   * MCP only: fail fast with code 'wrong_link_type' once the resolved URL is classified,
   * before any PinResource/pidget/pagination work. Undefined (the /api/extract path) = current behaviour.
   *   'pin'     → requires classified.kind === 'pin' || targetUrl.includes('/pin/')
   *   'board'   → requires 'board';  'profile' → requires 'profile';  'avatar' → 'profile' | 'board'
   */
  expect?: ExpectedLinkType;
  /** Injected for tests. Default calls the global fetch at call time. */
  fetchImpl?: FetchLike;
}

export type ExtractErrorCode =
  | 'invalid_input'
  | 'blocked'
  | 'not_pinterest'
  | 'left_pinterest'
  | 'removed_or_private'
  | 'wrong_link_type'
  | 'avatar_not_found'
  | 'collection_empty'
  | 'no_media';

export interface ExtractFailure {
  ok: false;
  status: 400 | 404 | 451;
  code: ExtractErrorCode;
  error: string;
  /** Only for wrong_link_type: what the link actually is. */
  actualKind?: UrlKind;
}

export interface PinCreator {
  username: string;
  displayName: string | null;
}

export interface PinMeta {
  /** From targetUrl, or data.id. */
  pinId: string | null;
  /** targetUrl after short-link + page redirects. */
  resolvedUrl: string;
  /** PinResource only, else null. */
  creator: PinCreator | null;
  /** PinResource data.link (http/https only), else null. */
  externalLink: string | null;
}

export interface CollectionMeta {
  resolvedUrl: string;
  username: string | null;
  boardSlug: string | null;
}

export type ExtractSuccess =
  | { ok: true; status: 200; kind: 'pin'; body: PinBody; meta: PinMeta }
  | { ok: true; status: 200; kind: 'board'; body: BoardBody; meta: CollectionMeta }
  | { ok: true; status: 200; kind: 'profile'; body: ProfileBody; meta: CollectionMeta }
  | { ok: true; status: 200; kind: 'avatar'; body: AvatarBody; meta: CollectionMeta };

export type ExtractOutcome = ExtractSuccess | ExtractFailure;
