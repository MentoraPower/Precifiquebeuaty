import { ListScreenSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <ListScreenSkeleton title="Serviços" subtitle="Gerencie seus serviços e preços." withChips rows={5} rowHeight="h-[68px]" />
  )
}
