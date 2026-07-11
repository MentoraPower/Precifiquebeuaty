import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Indicador de etapas do wizard (Básico, Insumos, Custos, Resultado). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              {i > 0 && <div className={cn('h-0.5 flex-1', done || active ? 'bg-gold' : 'bg-line')} />}
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-pill text-[12px] font-semibold',
                  done && 'bg-gold text-white',
                  active && 'bg-gold text-white',
                  !done && !active && 'border border-line bg-bg text-subtle',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={cn('h-0.5 flex-1', done ? 'bg-gold' : 'bg-line')} />}
            </div>
            <span className={cn('text-[11px]', active ? 'font-medium text-ink' : 'text-subtle')}>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
