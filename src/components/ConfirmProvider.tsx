'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false)

export const useConfirm = () => useContext(ConfirmContext)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback(
    (o: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve
        setOpts(o)
      }),
    [],
  )

  function close(value: boolean) {
    resolver.current?.(value)
    resolver.current = null
    setOpts(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {opts && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={() => close(false)} />
          <div className="relative w-full max-w-[340px] rounded-[24px] border border-line bg-bg p-5 shadow-float">
            <h2 className="text-[18px] font-bold leading-tight">{opts.title}</h2>
            {opts.message && <p className="mt-2 text-[14px] leading-relaxed text-muted">{opts.message}</p>}
            <div className="mt-5 flex gap-3">
              <Button variant="outline" fullWidth onClick={() => close(false)}>
                {opts.cancelLabel ?? 'Cancelar'}
              </Button>
              <Button variant={opts.danger ? 'danger' : 'primary'} fullWidth onClick={() => close(true)}>
                {opts.confirmLabel ?? 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
