'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMEOUT_MS = 5 * 60 * 1000 // 5 minutos

// Segurança: encerra a sessão após 5 minutos sem interação (ou 5 min fora do app).
export function IdleLogout() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Não roda nas telas públicas de acesso.
    if (pathname.startsWith('/auth') || pathname.startsWith('/sem-acesso')) return

    const supabase = createClient()
    let timer: number | undefined
    let lastActive = Date.now()
    let done = false

    async function logout() {
      if (done) return
      done = true
      try {
        await supabase.auth.signOut({ scope: 'local' })
      } catch {
        /* ignora */
      }
      router.replace('/auth')
    }

    function reset() {
      lastActive = Date.now()
      if (timer) clearTimeout(timer)
      timer = window.setTimeout(logout, TIMEOUT_MS)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        // Voltou ao app: se ficou fora tempo demais, pede login; senão, reinicia a contagem.
        if (Date.now() - lastActive >= TIMEOUT_MS) logout()
        else reset()
      }
      // Ao sair (hidden) não atualiza lastActive: o tempo parado começa a contar.
    }
    document.addEventListener('visibilitychange', onVisibility)

    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      document.removeEventListener('visibilitychange', onVisibility)
      if (timer) clearTimeout(timer)
    }
  }, [router, pathname])

  return null
}
