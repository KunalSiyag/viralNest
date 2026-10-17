/**
 * Island error handling: which recovery a failure needs (void receipt title and
 * hint), and how /api/extract `code`s and lib/audio Mp3Error codes map onto
 * catalog keys. Plain TypeScript so node tests import it.
 */
import type { ApiErrorKey, ErrorKind, IslandMessages, Mp3ErrorKey } from './types';

/** Sort an English error message into the recovery it needs (server text without a code, browser errors). */
export function errorKind(msg: string): ErrorKind {
  if (!msg) return 'other';
  if (/^Paste (a public|at least)|^Please enter valid Pinterest URLs/.test(msg)) return 'validation';
  if (/invalid link|valid Pinterest link/i.test(msg)) return 'link';
  if (/removed/i.test(msg)) return 'removed';
  if (/could not download|download failed|no response body|could not pack|failed to create zip|qr code|copy the link/i.test(msg)) return 'download';
  if (/private|public|empty/i.test(msg)) return 'private';
  return 'other';
}

/** Recovery for each /api/extract `code` (the same kinds errorKind gives the English server text). */
export const API_ERROR_KIND: Record<ApiErrorKey, ErrorKind> = {
  invalid_input: 'link',
  not_pinterest: 'link',
  left_pinterest: 'other',
  blocked: 'removed',
  removed_or_private: 'removed',
  avatar_not_found: 'private',
  collection_empty_board: 'private',
  collection_empty_profile: 'private',
  // A public board whose pins Pinterest did not send: try again.
  collection_unavailable: 'other',
  no_media: 'private',
  access_denied: 'other',
  origin_denied: 'other',
  server_error: 'private',
};

/** Recovery for the form's own messages (the same kinds errorKind gives the English text). */
export const CLIENT_ERROR_KIND: Record<Exclude<keyof IslandMessages['errors'], 'zipPartial' | 'noMp3Video' | 'noMp3Browser'>, ErrorKind> = {
  emptyLink: 'validation',
  emptyBatch: 'validation',
  batchInvalid: 'validation',
  batchFailed: 'private',
  extractFailed: 'other',
  unknown: 'other',
  qr: 'download',
  copyLink: 'download',
  fileUnavailable: 'download',
  noBody: 'download',
  downloadFailed: 'download',
  zipNothing: 'download',
  zipFailed: 'download',
};

/** Catalog key for an /api/extract failure, or null when the server sent no known code. */
export function apiErrorKey(code: unknown, linkType?: string | null): ApiErrorKey | null {
  if (typeof code !== 'string') return null;
  if (code === 'collection_empty') return linkType === 'profile' ? 'collection_empty_profile' : 'collection_empty_board';
  return code in API_ERROR_KIND && !code.startsWith('collection_empty_') ? (code as ApiErrorKey) : null;
}

/** lib/audio's Mp3Error, recognised without importing the encoder bundle. */
export function mp3ErrorCode(err: unknown): Mp3ErrorKey | null {
  const e = err as { name?: string; code?: string } | null;
  return e?.name === 'Mp3Error' && typeof e.code === 'string' && ['no_audio', 'unsupported', 'failed', 'aborted'].includes(e.code)
    ? (e.code as Mp3ErrorKey)
    : null;
}

