// Cambia questo valore ogni volta che vuoi forzare l'aggiornamento della cache
// (non è strettamente necessario: la strategia "network-first" qui sotto
// prende comunque la versione più recente quando c'è connessione).
const CACHE_NAME = 'calcolatore-impasti-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Strategia network-first: se c'è connessione prende sempre la versione più
// aggiornata (utile perché il file viene modificato spesso) e aggiorna la
// cache; se manca la connessione, risponde con l'ultima versione salvata.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
