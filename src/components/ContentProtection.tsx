'use client'

import { useEffect } from 'react'

// Impede menu de contexto (salvar imagem) e arrastar imagens em todo o app.
export function ContentProtection() {
  useEffect(() => {
    const prevent = (e: Event) => {
      const el = e.target as HTMLElement | null
      // libera menu de contexto em campos de texto (colar/selecionar)
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      e.preventDefault()
    }
    const preventDrag = (e: DragEvent) => {
      const el = e.target as HTMLElement | null
      if (el && el.tagName === 'IMG') e.preventDefault()
    }
    document.addEventListener('contextmenu', prevent)
    document.addEventListener('dragstart', preventDrag)
    return () => {
      document.removeEventListener('contextmenu', prevent)
      document.removeEventListener('dragstart', preventDrag)
    }
  }, [])

  return null
}
