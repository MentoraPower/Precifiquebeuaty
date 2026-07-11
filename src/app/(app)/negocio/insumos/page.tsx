import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { ProductsClient } from './ProductsClient'

export const dynamic = 'force-dynamic'

export default async function InsumosPage() {
  const supabase = createClient()
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  return (
    <main>
      <AppHeader back title="Insumos" subtitle="Produtos e materiais usados nos serviços." />
      <div className="px-5 pt-3">
        <ProductsClient initial={data ?? []} />
      </div>
    </main>
  )
}
