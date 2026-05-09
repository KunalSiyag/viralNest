async function fetchEmbed() {
  const url = 'https://www.instagram.com/p/DIxUdkPy0ga/embed/';
  const res = await fetch(url);
  const text = await res.text();
  
  const videoMatches = text.match(/"video_url":"([^"]+)"/g);
  if (videoMatches) {
    console.log('FOUND VIDEO URLS:', videoMatches);
  } else {
    console.log('No video_url found');
  }
}
fetchEmbed().catch(console.error);
