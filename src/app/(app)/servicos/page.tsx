import { createClient } from '@/lib/supabase/server'
import { ServicesClient } from './ServicesClient'

export const dynamic = 'force-dynamic'

// Tela 07 — Lista de serviços.
export default async function ServicosPage() {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return <ServicesClient initial={data ?? []} />
}
