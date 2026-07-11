import { ListScreenSkeleton } from '@/components/skeletons'

export default function Loading() {
  return <ListScreenSkeleton title="Insumos" subtitle="Produtos e materiais usados nos serviços." withButton rows={4} />
}
