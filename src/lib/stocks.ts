/**
 * Ticket stocks: exactly one colour per Pinterest URL / media type.
 * Pages, the stamp, the tool rack and the stock chips all read from here.
 */
export type StockKey = 'pin' | 'video' | 'image' | 'gif' | 'board' | 'profile' | 'avatar';

export const STOCKS: Record<StockKey, { color: string; onColor: string; field: string }> = {
  pin: { color: '#C8281A', onColor: '#FFFFFF', field: 'red' },
  video: { color: '#F08A3C', onColor: '#17191E', field: 'tangerine' },
  image: { color: '#F4C531', onColor: '#17191E', field: 'canary' },
  gif: { color: '#B79CE8', onColor: '#17191E', field: 'lilac' },
  board: { color: '#6CC79A', onColor: '#17191E', field: 'mint' },
  profile: { color: '#7DB7E8', onColor: '#17191E', field: 'sky' },
  avatar: { color: '#F29BB4', onColor: '#17191E', field: 'blush' },
};

/** Tools that are not a URL type (device guides, browser tools, audio) print on plain ink. */
export const INK_STOCK = { color: '#17191E', onColor: '#FFFFFF' };
