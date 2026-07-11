'use client'

import { Check, CloudOff, Loader2 } from 'lucide-react'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SaveStatus({ state, onRetry }: { state: SaveState; onRetry?: () => void }) {
  if (state === 'idle') return null
  if (state === 'saving')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando…
      </span>
    )
  if (state === 'saved')
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-success">
        <Check className="h-3.5 w-3.5" /> Salvo
      </span>
    )
  return (
    <button onClick={onRetry} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-danger">
      <CloudOff className="h-3.5 w-3.5" /> Erro — tentar novamente
    </button>
  )
}
