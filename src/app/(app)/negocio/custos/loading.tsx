import { ListScreenSkeleton } from '@/components/skeletons'

export default function Loading() {
  return <ListScreenSkeleton title="Custos" subtitle="Despesas do seu negócio." withButton rows={4} />
}
