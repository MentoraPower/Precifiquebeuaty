'use client'

import { useEffect } from 'react'

/**
 * Fecha o teclado ao tocar em qualquer lugar fora de um campo:
 * se há um input/textarea/select focado e o toque não foi num controle,
 * remove o foco (fechando o teclado no mobile).
 */
export function DismissKeyboard() {
  useEffect(() => {
    const handler = (e: Event) => {
      const active = document.activeElement as HTMLElement | null
      if (!active || !/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return
      const target = e.target as HTMLElement | null
      if (target && target.closest('input, textarea, select, label, [contenteditable="true"]')) return
      active.blur()
    }
    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [])
  return null
}
