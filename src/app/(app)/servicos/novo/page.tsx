import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { getBusinessContext } from '@/lib/queries'
import { ServiceWizard } from '../[id]/ServiceWizard'

export const dynamic = 'force-dynamic'

// Abre o wizard de novo serviço SEM criar rascunho — a linha só nasce ao preencher.
export default async function NovoServicoPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const [{ data: settings }, { data: products }, ctx] = await Promise.all([
    supabase
      .from('business_settings')
      .select('default_card_fee_bps, default_tax_bps, default_commission_bps, default_margin_bps')
      .maybeSingle(),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    getBusinessContext(),
  ])

  return (
    <ServiceWizard
      service={null}
      userId={user.id}
      defaults={{
        cardFeeBps: settings?.default_card_fee_bps ?? 0,
        taxBps: settings?.default_tax_bps ?? 0,
        commissionBps: settings?.default_commission_bps ?? 0,
        marginBps: settings?.default_margin_bps ?? 5000,
      }}
      initialInputs={[]}
      products={products ?? []}
      hourlyCostCents={ctx.hourlyCostCents}
    />
  )
}
