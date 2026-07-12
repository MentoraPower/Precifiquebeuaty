import { Skeleton } from '@/components/ui/misc'
import { TopLoadingBar } from '@/components/TopLoadingBar'

export default function Loading() {
  return (
    <main>
      <TopLoadingBar />
      <div className="space-y-6 px-5" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 0px) + 18px)' }}>
        <Skeleton className="h-[88px] w-full" />
        <Skeleton className="h-[132px] w-full" />
        <Skeleton className="h-[68px] w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </main>
  )
}
