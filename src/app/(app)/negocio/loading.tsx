import { ListScreenSkeleton } from '@/components/skeletons'

export default function Loading() {
  return <ListScreenSkeleton title="Meu negócio" subtitle="Configure os dados para cálculos precisos." rows={6} rowHeight="h-[62px]" />
}
