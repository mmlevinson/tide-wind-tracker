const CacheName = 'wind-tide-tracker-v2'
const PrecacheUrls = ['/', '/tides-display', '/settings', '/about', '/help', '/faq']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CacheName).then((cache) => {
      return cache.addAll(PrecacheUrls)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CacheName).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})
