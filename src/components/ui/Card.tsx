import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-card border border-line bg-bg p-4 shadow-card', className)}
      {...props}
    />
  )
}

/** Card escuro de destaque (ex.: custo da hora, total de investimento). */
export function DarkCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card bg-ink p-5 text-white', className)} {...props} />
}

/** Linha clicável em lista (ícone, rótulo, valor, seta). */
export function ListRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5 text-left transition hover:border-ink/20 active:scale-[0.99]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
