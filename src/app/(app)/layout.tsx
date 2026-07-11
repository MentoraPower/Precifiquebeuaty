import { BottomNav } from '@/components/layout/BottomNav'
import { RoutePrefetcher } from '@/components/RoutePrefetcher'
import { ConfirmProvider } from '@/components/ConfirmProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <div className="relative min-h-screen pb-24">
        {children}
        <BottomNav />
        <RoutePrefetcher />
      </div>
    </ConfirmProvider>
  )
}
