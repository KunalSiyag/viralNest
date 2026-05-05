/**
 * Quick test script for browser-based Instagram extraction.
 * Run with: npx tsx src/services/extractors/test-browser.ts
 */

import { extractWithBrowser, closeBrowser } from './browser-extractor';

async function main() {
  const url = 'https://www.instagram.com/reel/DIxUdkPy0ga/';
  
  console.log('🔍 Testing browser extraction for:', url);
  console.log('---');

  try {
    const result = await extractWithBrowser(url);
    
    console.log('📋 Result:');
    console.log('  Media URL:', result.mediaUrl || '(none)');
    console.log('  Thumbnail:', result.thumbnailUrl || '(none)');
    console.log('  Caption:', result.caption || '(none)');
    console.log('  Author:', result.author || '(none)');
    
    if (result.mediaUrl) {
      console.log('\n✅ SUCCESS — got video URL!');
    } else if (result.thumbnailUrl) {
      console.log('\n⚠️  Partial — got thumbnail but no video');
    } else {
      console.log('\n❌ FAILED — no media captured');
    }
  } catch (e) {
    console.error('❌ Error:', e);
  } finally {
    await closeBrowser();
  }
}

main();
