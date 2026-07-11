'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    let refreshing = false
    // Quando um novo service worker assume o controle, recarrega uma vez
    // para garantir conteúdo fresco (sem precisar limpar cache manual).
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => reg.update())
        .catch(() => {})
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])
  return null
}
