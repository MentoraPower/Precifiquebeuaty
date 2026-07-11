'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KebabItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  danger?: boolean
}

/** Menu de 3 pontos (⋮) que abre um dropdown ancorado ao botão. */
export function KebabMenu({ items, label = 'Opções' }: { items: KebabItem[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  function toggle() {
    if (open) return setOpen(false)
    const r = btnRef.current!.getBoundingClientRect()
    const menuH = items.length * 46 + 12
    const openBelow = r.bottom + menuH + 8 < window.innerHeight
    setPos({
      top: openBelow ? r.bottom + 6 : Math.max(8, r.top - menuH - 6),
      right: Math.max(8, window.innerWidth - r.right),
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label={label}
        aria-expanded={open}
        className="rounded-pill p-1.5 text-subtle transition hover:bg-surface hover:text-ink"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open &&
        pos &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <div
              className="fixed z-[61] w-48 overflow-hidden rounded-2xl border border-line bg-bg p-1.5 shadow-float"
              style={{ top: pos.top, right: pos.right }}
            >
              {items.map((it, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setOpen(false)
                    it.onClick()
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium transition hover:bg-surface active:scale-[0.99]',
                    it.danger ? 'text-danger' : 'text-ink',
                  )}
                >
                  {it.icon && <it.icon className="h-[18px] w-[18px]" />}
                  {it.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
