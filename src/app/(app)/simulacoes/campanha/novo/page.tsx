import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { CampaignWizard, type OfferService } from '../[id]/CampaignWizard'

export const dynamic = 'force-dynamic'

// Abre o wizard de campanha SEM criar rascunho — só nasce ao preencher.
export default async function NovaCampanhaPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data: services } = await supabase
    .from('services')
    .select('id, name, saved_price_cents, suggested_price_cents, base_cost_cents, card_fee_bps, tax_bps, partner_commission_bps')
    .is('deleted_at', null)
    .not('base_cost_cents', 'is', null)

  const offerServices: OfferService[] = (services ?? [])
    .filter((s) => (s.saved_price_cents ?? s.suggested_price_cents) != null)
    .map((s) => ({
      id: s.id,
      name: s.name,
      salePriceCents: (s.saved_price_cents ?? s.suggested_price_cents)!,
      baseCostCents: s.base_cost_cents ?? 0,
      cardFeeBps: s.card_fee_bps,
      taxBps: s.tax_bps,
      commissionBps: s.partner_commission_bps,
    }))

  return (
    <CampaignWizard campaign={null} userId={user.id} initialExpenses={[]} initialItem={null} offerServices={offerServices} />
  )
}
