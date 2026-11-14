// Kill-switch service worker.
// This portfolio does not use a service worker. If another app that once ran on the
// same origin (e.g. a game on localhost:8765) left one installed, the browser will
// fetch this file on its next update check, and it removes itself + all caches so the
// real, current site files load again.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
