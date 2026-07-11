import { ListScreenSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <ListScreenSkeleton center title="Serviços" subtitle="Gerencie seus serviços e preços." withChips rows={5} rowHeight="h-[76px]" />
  )
}
