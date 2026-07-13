'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutos
const KEY = 'pb_last_active'

// Segurança: pede login novamente após 5 minutos sem atividade.
// Cobre 3 casos: (1) parado com o app aberto, (2) app em segundo plano,
// (3) PWA/navegador FECHADO e reaberto (usa localStorage para lembrar o horário).
export function IdleLogout() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Não roda nas telas públicas de acesso.
    if (pathname.startsWith('/auth') || pathname.startsWith('/sem-acesso')) return

    const supabase = createClient()
    let timer: number | undefined
    let done = false
    let lastActive = Date.now()

    const now = () => Date.now()
    const persist = () => {
      try {
        localStorage.setItem(KEY, String(lastActive))
      } catch {
        /* ignora */
      }
    }
    const storedLast = () => {
      try {
        return Number(localStorage.getItem(KEY) || 0)
      } catch {
        return 0
      }
    }

    async function logout() {
      if (done) return
      done = true
      try {
        localStorage.removeItem(KEY)
      } catch {
        /* ignora */
      }
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch {
        /* ignora */
      }
      router.replace('/auth')
    }

    function resetTimer() {
      lastActive = now()
      persist()
      if (timer) clearTimeout(timer)
      timer = window.setTimeout(logout, TIMEOUT_MS)
    }

    // Ao abrir/entrar: se ficou fora (fechado ou em 2º plano) por 5+ min, pede login.
    const last = storedLast()
    if (last && now() - last >= TIMEOUT_MS) {
      logout()
      return
    }

    const markActive = () => {
      lastActive = now()
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }))

    // Reinicia o timer de ociosidade a cada interação (com um respiro para não pesar).
    let resetThrottle = 0
    const onActivity = () => {
      const t = now()
      if (t - resetThrottle < 1000) return
      resetThrottle = t
      resetTimer()
    }
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))

    // Grava o horário periodicamente e ao sair (fechar/minimizar) — para o caso de reabrir.
    const heartbeat = window.setInterval(persist, 20000)
    const onHide = () => persist()
    window.addEventListener('pagehide', onHide)
    window.addEventListener('beforeunload', onHide)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Voltou ao app: se ficou fora tempo demais, pede login.
        if (now() - lastActive >= TIMEOUT_MS || (storedLast() && now() - storedLast() >= TIMEOUT_MS)) {
          logout()
        } else {
          resetTimer()
        }
      } else {
        // Saindo (2º plano/fechando): registra o horário atual.
        persist()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    resetTimer()

    return () => {
      events.forEach((e) => {
        window.removeEventListener(e, markActive)
        window.removeEventListener(e, onActivity)
      })
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('beforeunload', onHide)
      clearInterval(heartbeat)
      if (timer) clearTimeout(timer)
    }
  }, [router, pathname])

  return null
}
