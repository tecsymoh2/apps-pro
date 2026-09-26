// Appshub service worker: offline shell, fast repeat loads, web-push notifications
const CACHE = 'appshub-v3';
const SHELL = ['/', '/index.html', '/style.css', '/app.js', '/manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.startsWith('/api/')) return;
  const cdn = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(u.host);
  if (u.origin !== location.origin && !cdn) return;
  if (r.mode === 'navigate') { e.respondWith(fetch(r).catch(() => caches.match('/index.html'))); return; }
  e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(CACHE).then((x) => x.put(r, c)); return res; }).catch(() => caches.match(r)));
});
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data.json(); } catch (x) { d = { title: 'Appshub', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Appshub', { body: d.body || '', icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close(); const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ws) => { for (const w of ws) { if ('focus' in w) { w.navigate(url); return w.focus(); } } return clients.openWindow(url); }));
});
