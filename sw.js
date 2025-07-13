
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('lipu-cache').then(function (cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/main.js',
        '/articles.json',
        '/version.json',
        '/manifest.json',
        '/logo.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request).then((res) => {
        return caches.open('lipu-cache').then((cache) => {
          cache.put(e.request, res.clone());
          return res;
        });
      });
    }).catch(() => caches.match('/index.html'))
  );
});
