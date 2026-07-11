/* Service worker — só cacheia estáticos com hash; conteúdo dinâmico é sempre da rede. */
const CACHE = 'w-calc-v3'
const APP_SHELL = ['/manifest.webmanifest', '/icons/icon.svg']

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
  if (url.origin !== self.location.origin) return

  // Somente assets imutáveis (URLs com hash) usam cache-first.
  const isImmutable =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest'

  if (isImmutable) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {})
            return res
          }),
      ),
    )
    return
  }

  // Navegações, RSC (dados do App Router) e tudo mais: SEMPRE rede (fallback offline mínimo).
  event.respondWith(
    fetch(request).catch(() =>
      request.mode === 'navigate' ? caches.match('/manifest.webmanifest').then(() => Response.error()) : Response.error(),
    ),
  )
})
