/**
 * Bundles tests/audio.entry.ts with esbuild, then runs node:test
 * (MP4 audio demuxer, ADTS wrapper, LAME MP3 output, ID3 tag).
 */
import { runBundledTest } from './lib/run-bundled.mjs';

process.exit(await runBundledTest('audio.entry.ts'));
