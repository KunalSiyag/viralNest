/** MP3 facts shown in the UI. Kept apart from the encoder so pages can import them for free. */

/** CBR bitrate of the MP3 the site makes (shown to visitors as "192 kbps"). */
export const MP3_KBPS = 192;

/** Sample rates an MPEG-1 Layer III file can carry. */
export const MP3_SAMPLE_RATES = [32000, 44100, 48000] as const;
