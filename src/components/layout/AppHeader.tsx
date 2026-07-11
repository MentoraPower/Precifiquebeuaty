'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface AppHeaderProps {
  title?: string
  subtitle?: string
  back?: boolean
  right?: React.ReactNode
  center?: boolean
}

export function AppHeader({ title, subtitle, back, right, center }: AppHeaderProps) {
  const router = useRouter()

  if (center) {
    return (
      <header className="safe-top relative px-5 pb-2 pt-5 text-center">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="absolute left-4 top-5 rounded-pill p-1.5 text-ink hover:bg-line/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {title && <h1 className="text-[26px] font-bold leading-tight">{title}</h1>}
        {subtitle && <p className="mx-auto mt-1 max-w-[300px] text-[13px] text-muted">{subtitle}</p>}
      </header>
    )
  }

  return (
    <header className="safe-top px-5 pb-2 pt-4">
      <div className="flex items-start gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            aria-label="Voltar"
            className="-ml-1 mt-0.5 rounded-pill p-1.5 text-ink hover:bg-line/50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {title && <h1 className="truncate text-[22px] font-bold leading-tight">{title}</h1>}
          {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  )
}
