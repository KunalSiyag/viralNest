import fetch from 'node-fetch';

const SITE_TITLE = 'PintDownload — Free Pinterest Downloader';
const SITE_URL = 'https://pintdownload.app';
const RSS_URL = 'https://pintdownload.app/rss.xml';

const PING_SERVICES = [
  { name: 'Ping-O-Matic', url: 'http://rpc.pingomatic.com/' },
  { name: 'Weblogs', url: 'http://rpc.weblogs.com/RPC2' },
  { name: 'FeedBurner', url: 'http://ping.feedburner.com' },
  { name: 'Blo.gs', url: 'http://ping.blo.gs/' },
];

function buildXmlRpcPayload(title, url, rss) {
  return `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.extendedPing</methodName>
  <params>
    <param><value><string>${title}</string></value></param>
    <param><value><string>${url}</string></value></param>
    <param><value><string>${url}</string></value></param>
    <param><value><string>${rss}</string></value></param>
  </params>
</methodCall>`;
}

async function pingAllServices() {
  console.log(`📡 Starting Automated RSS & Directory Ping for ${SITE_URL}...`);
  const payload = buildXmlRpcPayload(SITE_TITLE, SITE_URL, RSS_URL);

  for (const service of PING_SERVICES) {
    try {
      console.log(`Pinging ${service.name} (${service.url})...`);
      const res = await fetch(service.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'User-Agent': 'PintDownload-PingBot/1.0',
        },
        body: payload,
        timeout: 5000,
      });

      console.log(`✅ [${service.name}] Status: ${res.status}`);
    } catch (err) {
      console.warn(`⚠️ [${service.name}] Ping skipped or timed out: ${err.message}`);
    }
  }

  console.log(`🎉 Automated RSS Directory Ping Execution Complete!`);
}

pingAllServices();
