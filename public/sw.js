/* No-op service worker — stops /sw.js 404 noise from browsers/extensions.
   PintDownload is not a PWA; this file unregisters any previously installed SW. */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })(),
  );
});
