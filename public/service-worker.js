const FILES_TO_CACHE = [ 
    '/', 
    '/index.html',
    '/index.js',
    '/style.css',
    '/database.js',
    './icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];

  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";

  self.addEventListener('install', (event) => {
      event.waitUntil(
          caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
          );
        self.skipWaiting()
  });



  self.addEventListener('activate', (event) => {
      const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
      event.waitUntil(
          caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
      );
  });

  self.addEventListener("fetch", (evt) => {
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(evt.request, response.clone());
                }
                return response;
              })
              .catch(() => {
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }

    evt.respondWith(
      caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      })
    );
  });