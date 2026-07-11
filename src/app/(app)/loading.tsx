import { Skeleton } from '@/components/ui/misc'
import { TopLoadingBar } from '@/components/TopLoadingBar'

// Exibido instantaneamente em toda navegação da área logada.
export default function AppLoading() {
  return (
    <>
      <TopLoadingBar />
      <div className="px-5 pt-6">
        <div className="safe-top mb-5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="mt-4 h-16 w-full" />
      </div>
    </>
  )
}
