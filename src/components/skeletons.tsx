import { Skeleton } from '@/components/ui/misc'
import { TopLoadingBar } from '@/components/TopLoadingBar'

/**
 * Esqueleto que espelha a ESTRUTURA de uma tela de lista (cabeçalho, botão,
 * chips e molduras dos cards). Mantém a estrutura estável enquanto só os
 * dados carregam.
 */
export function ListScreenSkeleton({
  title,
  subtitle,
  rows = 4,
  rowHeight = 'h-16',
  withButton = false,
  withChips = false,
}: {
  title: string
  subtitle?: string
  rows?: number
  rowHeight?: string
  withButton?: boolean
  withChips?: boolean
}) {
  return (
    <main>
      <TopLoadingBar />
      <header className="safe-top px-5 pb-2 pt-5">
        <h1 className="text-[22px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </header>

      <div className="flex flex-col gap-3 px-5 pt-3">
        {withButton && <Skeleton className="h-12 w-full" />}
        {withChips && (
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-pill" />
            <Skeleton className="h-8 w-16 rounded-pill" />
            <Skeleton className="h-8 w-16 rounded-pill" />
          </div>
        )}
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className={`${rowHeight} w-full`} />
        ))}
      </div>
    </main>
  )
}
