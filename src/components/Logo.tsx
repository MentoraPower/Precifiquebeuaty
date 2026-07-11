import { cn } from '@/lib/utils'

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <svg width="72" height="72" viewBox="0 0 512 512" aria-hidden className="drop-shadow-sm">
        <path
          d="M104 176 L152 336 L200 224 L248 336 L296 176"
          fill="none"
          stroke="#111111"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g fill="#D3A13B">
          <path d="M372 150 c8 26 14 32 40 40 c-26 8 -32 14 -40 40 c-8 -26 -14 -32 -40 -40 c26 -8 32 -14 40 -40 Z" />
          <path d="M420 236 c5 16 9 20 25 25 c-16 5 -20 9 -25 25 c-5 -16 -9 -20 -25 -25 c16 -5 20 -9 25 -25 Z" />
        </g>
      </svg>
      {showWordmark && (
        <div className="text-center">
          <p className="text-[22px] font-bold tracking-tight">W Calculadora</p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">Beauty</p>
        </div>
      )}
    </div>
  )
}
