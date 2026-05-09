async function fetchEmbed() {
  const url = 'https://www.instagram.com/reel/DIxUdkPy0ga/embed/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const text = await res.text();
  console.log('Length:', text.length);
  
  // Try to find video URL in the text
  const videoMatches = text.match(/https:\/\/[^"'\s]*\.mp4[^"'\s]*/g);
  if (videoMatches) {
    console.log('Found .mp4 URLs:', new Set(videoMatches));
  }
  
  const allUrls = text.match(/https:\/\/[^"'\s]*cdninstagram[^"'\s]*/g);
  if (allUrls) {
    console.log('Found CDN URLs:', allUrls.length);
  }
}
fetchEmbed().catch(console.error);
