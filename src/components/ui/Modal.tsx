'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
}

/** Modal centralizado no meio da tela. */
export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-[380px] flex-col overflow-hidden rounded-[24px] border border-line bg-bg shadow-float">
        {(title || subtitle) && (
          <div className="flex items-start gap-3 px-5 pt-5">
            <div className="min-w-0 flex-1">
              {title && <h2 className="text-[18px] font-bold leading-tight">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-1 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface text-muted transition hover:bg-line"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-5 pt-4">{children}</div>
      </div>
    </div>
  )
}
