self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('lipu-cache').then(cache =>
      cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/main.js',
        '/articles.json',
        '/version.json',
        '/manifest.json'
      ])
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      return resp || fetch(e.request).then(r => {
        caches.open('lipu-cache').then(cache => cache.put(e.request, r.clone()));
        return r;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
