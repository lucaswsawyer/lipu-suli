const CACHE_NAME = 'lipu-suli-shell-v1';
const ASSETS = [
  '/index.html',
  '/saved.html',
  '/play.html',
  '/styles.css',
  '/main.js',
  '/play.js',
  '/manifest.json'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const url = new URL(evt.request.url);
  if (url.pathname === '/index.html') {
    evt.respondWith(
      fetch(evt.request)
        .then(resp => {
          caches.open(CACHE_NAME).then(c => c.put(evt.request, resp.clone()));
          return resp;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(cached => {
      if (cached) return cached;
      return fetch(evt.request).then(resp => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(evt.request, resp.clone());
          return resp;
        });
      });
    })
  );
});

self.addEventListener('message', evt => {
  const { action, url } = evt.data || {};
  if (action === 'save-article' && url) {
    caches.open(CACHE_NAME).then(cache => cache.add(url));
  }
});