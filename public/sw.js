/* Service worker mínimo — app shell offline. Dados vêm do Supabase (online). */
const CACHE = 'w-calc-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Nunca cachear chamadas de API/Supabase.
  if (url.origin !== self.location.origin) return

  // Navegações: network-first com fallback ao shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/').then((r) => r || Response.error())),
    )
    return
  }

  // Assets estáticos: cache-first.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      const copy = res.clone()
      caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
      return res
    }).catch(() => cached)),
  )
})
