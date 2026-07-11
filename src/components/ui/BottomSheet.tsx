'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, subtitle, children }: BottomSheetProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="safe-bottom relative flex w-full max-w-app flex-col p-2 sm:p-4">
        <div className="flex max-h-[86vh] flex-col overflow-hidden rounded-[28px] border border-line bg-bg shadow-sheet">
          {/* grabber + header */}
          <div className="shrink-0 px-5 pb-3 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-pill bg-line" />
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {title && <h2 className="text-[18px] font-bold leading-tight">{title}</h2>}
                {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="-mr-1 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface text-muted transition hover:bg-line active:scale-95"
                aria-label="Fechar"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* corpo com rolagem e respiro */}
          <div className="overflow-y-auto px-5 pb-6 pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
