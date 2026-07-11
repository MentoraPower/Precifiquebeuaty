import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { CostsClient } from './CostsClient'

export const dynamic = 'force-dynamic'

// Telas 05 e 06 — Custos fixos e variáveis.
export default async function CustosPage({ searchParams }: { searchParams: { type?: string } }) {
  const type = searchParams.type === 'variable' ? 'variable' : 'fixed'
  const supabase = createClient()
  const { data } = await supabase
    .from('business_costs')
    .select('*')
    .eq('type', type)
    .eq('active', true)
    .order('created_at', { ascending: true })

  return (
    <main>
      <AppHeader
        back
        title={type === 'fixed' ? 'Custos fixos' : 'Custos variáveis'}
        subtitle={
          type === 'fixed'
            ? 'Despesas que você tem todos os meses, independente do volume.'
            : 'Despesas que variam de acordo com o seu volume de trabalho.'
        }
      />
      <div className="px-5 pt-3">
        <CostsClient type={type} initial={data ?? []} />
      </div>
    </main>
  )
}
