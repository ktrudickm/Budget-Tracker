const FILES_TO_CACHE = [ 
    '/',
    '/index.html',
    '/index.js',
    '/styles.css',
    '/database.js',
  ];

  const CACHE_NAME = "static-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";

  self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
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

  self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/") && event.request.method === "GET") {
      event.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(event.request, response.clone());
                }
                return response;
              })
              .catch(() => {
                return cache.match(event.request);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }

    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });