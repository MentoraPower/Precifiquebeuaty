'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Ajusta a cor da barra de status do celular por tela:
 * preta na Home (acompanha o bloco escuro) e clara nas demais.
 */
export function ThemeColor() {
  const pathname = usePathname()

  useEffect(() => {
    const dark = pathname === '/home'
    const color = dark ? '#111111' : '#F7F4EF'
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', color)
  }, [pathname])

  return null
}
