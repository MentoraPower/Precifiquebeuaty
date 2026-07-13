'use client'

import { useEffect } from 'react'

// Segurança no desktop: ao tentar inspecionar/espionar (devtools, ver código),
// fecha a aba. Só age em ambiente desktop (sem toque). No celular não faz nada.
export function AntiInspect() {
  useEffect(() => {
    const isDesktopLike = !('ontouchstart' in window) && (navigator.maxTouchPoints ?? 0) === 0
    if (!isDesktopLike) return

    let closed = false
    function closeTab() {
      if (closed) return
      closed = true
      try {
        window.close()
      } catch {
        /* ignora */
      }
      // Fallback (o navegador costuma bloquear window.close em abas do usuário):
      // esconde o conteúdo e vai para uma página em branco.
      try {
        document.documentElement.innerHTML =
          '<body style="margin:0;background:#111;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;font-size:14px">Sessão encerrada por segurança.</body>'
      } catch {
        /* ignora */
      }
      try {
        window.location.replace('about:blank')
      } catch {
        /* ignora */
      }
    }

    // Bloqueia atalhos de devtools / ver-código e fecha a aba.
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const devtools =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
        (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c')) ||
        (e.ctrlKey && k === 'u') ||
        (e.metaKey && e.altKey && k === 'u')
      if (devtools) {
        e.preventDefault()
        closeTab()
      }
    }
    document.addEventListener('keydown', onKey)

    // Detecta o devtools abrindo (aumento de "moldura" da janela após o load).
    const baseW = window.outerWidth - window.innerWidth
    const baseH = window.outerHeight - window.innerHeight
    const check = () => {
      const dw = window.outerWidth - window.innerWidth - baseW
      const dh = window.outerHeight - window.innerHeight - baseH
      if (dw > 160 || dh > 160) closeTab()
    }
    const timer = window.setInterval(check, 900)

    return () => {
      document.removeEventListener('keydown', onKey)
      clearInterval(timer)
    }
  }, [])

  return null
}
