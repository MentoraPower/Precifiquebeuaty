import { cn } from '@/lib/utils'

/** Chip de filtro (Todos / Ativos / Inativos). */
export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        'shrink-0 rounded-pill px-4 py-2 text-[13px] font-medium transition',
        active ? 'bg-ink text-white' : 'border border-line bg-bg text-muted hover:border-ink/30',
        className,
      )}
      {...props}
    />
  )
}

type Tone = 'gold' | 'success' | 'danger' | 'attention' | 'neutral'

const toneMap: Record<Tone, string> = {
  gold: 'bg-champagne text-[#8a6a1e]',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger/12 text-danger',
  attention: 'bg-attention/12 text-attention',
  neutral: 'bg-surface text-muted',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[12px] font-medium', toneMap[tone], className)}
      {...props}
    />
  )
}

/** Estado vazio com CTA. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-bg px-6 py-12 text-center">
      {icon && <div className="mb-3 text-subtle">{icon}</div>}
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-[280px] text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-card bg-line/60', className)} />
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-card border border-line bg-bg px-6 py-10 text-center">
      <p className="text-[14px] text-muted">{message ?? 'Algo deu errado ao carregar.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-[14px] font-semibold text-gold">
          Tentar novamente
        </button>
      )}
    </div>
  )
}

/** Divisor de total (linha com rótulo à esquerda e valor destacado à direita). */
export function TotalRow({ label, value, tone }: { label: string; value: string; tone?: 'gold' | 'ink' }) {
  return (
    <div className="flex items-center justify-between rounded-card bg-surface px-4 py-3.5">
      <span className="text-[13px] text-muted">{label}</span>
      <span className={cn('text-[17px] font-bold', tone === 'gold' ? 'text-gold' : 'text-ink')}>{value}</span>
    </div>
  )
}
