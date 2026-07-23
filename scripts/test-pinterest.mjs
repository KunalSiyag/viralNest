async function test() {
  const url = process.argv[2] || 'https://www.pinterest.com/pin/297378381667202179/';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    },
  });
  const html = await res.text();
  console.log('URL:', res.url);
  console.log('HTML length:', html.length);

  const relayMatches = [
    ...html.matchAll(/window\.__PWS_RELAY_REGISTER_COMPLETED_REQUEST__\s*\(\s*"([^"]+)"\s*,\s*(\{[\s\S]*?\})\s*\)/g),
  ];
  console.log('Relay matches:', relayMatches.length);

  for (const m of relayMatches) {
    const q = m[1];
    if (!/pin|board|carousel|story/i.test(q)) continue;
    console.log('\nQuery:', q);
    try {
      const p = JSON.parse(m[2]);
      const pin = p?.data?.v3GetPinQueryv2?.data || p?.data?.v3GetPinQuery?.data;
      if (pin) {
        const interesting = Object.keys(pin).filter((k) =>
          /carousel|story|video|image|aggregat|collection|slot/i.test(k),
        );
        console.log('  interesting keys:', interesting.join(', '));
        if (pin.carouselData) {
          console.log('  carouselData:', JSON.stringify(pin.carouselData, null, 2).slice(0, 2000));
        }
        if (pin.storyPinData) {
          console.log('  storyPinData pages:', pin.storyPinData.pages?.length);
          const page = pin.storyPinData.pages?.[0];
          if (page) console.log('  page0:', JSON.stringify(page, null, 2).slice(0, 1500));
        }
        if (pin.videos) {
          console.log('  videos keys:', Object.keys(pin.videos).join(', '));
        }
      }
      const board = p?.data?.v3GetBoardFeedQuery?.data || p?.data?.v3GetBoardQuery?.data;
      if (board) {
        console.log('  board keys:', Object.keys(board).join(', '));
      }
    } catch (e) {
      console.log('  parse err:', e.message);
    }
  }
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
