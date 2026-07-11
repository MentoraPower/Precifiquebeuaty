import { ListScreenSkeleton } from '@/components/skeletons'

export default function Loading() {
  return (
    <ListScreenSkeleton center title="Simulações" subtitle="Compare cenários e encontre o melhor resultado." withButton rows={4} />
  )
}
