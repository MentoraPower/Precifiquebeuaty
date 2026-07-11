import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Indicador de etapas do wizard (Básico, Insumos, Custos, Resultado). */
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      <div className="flex items-start">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    'h-[3px] flex-1 rounded-full',
                    i === 0 ? 'opacity-0' : done || active ? 'bg-gold' : 'bg-line',
                  )}
                />
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition',
                    done && 'bg-gold text-white',
                    active && 'bg-gold text-white ring-4 ring-champagne',
                    !done && !active && 'border border-line bg-bg text-subtle',
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'h-[3px] flex-1 rounded-full',
                    i === steps.length - 1 ? 'opacity-0' : done ? 'bg-gold' : 'bg-line',
                  )}
                />
              </div>
              <span
                className={cn(
                  'mt-2.5 text-center text-[12px] leading-tight',
                  active ? 'font-semibold text-ink' : done ? 'text-muted' : 'text-subtle',
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
