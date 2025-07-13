self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("lipu-cache").then(cache =>
      cache.addAll([
        "/index.html",
        "/style.css",
        "/main.js",
        "/articles.json",
        "/version.json",
        "/manifest.json"
      ])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      if (resp) return resp;
      return fetch(e.request)
        .then(r => {
          // Cache new resources as we fetch them
          return caches.open("lipu-cache").then(cache => {
            cache.put(e.request, r.clone());
            return r;
          });
        })
        .catch(() => {
          // If nothing is cached & network fails, fallback to index.html
          return caches.match("/index.html");
        });
    })
  );
});
