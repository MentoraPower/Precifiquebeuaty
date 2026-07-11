import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { InvestmentsClient } from './InvestmentsClient'

export const dynamic = 'force-dynamic'

export default async function InvestimentosPage() {
  const supabase = createClient()
  const { data } = await supabase.from('investments').select('*').order('created_at', { ascending: true })
  return (
    <main>
      <AppHeader
        back
        title="Investimentos"
        subtitle="Equipamentos e itens duráveis. Calculamos a depreciação mensal."
      />
      <div className="px-5 pt-3">
        <InvestmentsClient initial={data ?? []} />
      </div>
    </main>
  )
}
