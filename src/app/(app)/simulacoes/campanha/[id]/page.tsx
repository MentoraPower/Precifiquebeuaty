import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { CampaignWizard, type OfferService } from './CampaignWizard'

export const dynamic = 'force-dynamic'

// Telas 10B e 10C — Nova campanha (configuração + resultado).
export default async function CampanhaPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { new?: string }
}) {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const [{ data: campaign }, { data: expenses }, { data: items }, { data: services }] = await Promise.all([
    supabase.from('campaigns').select('*').eq('id', params.id).single(),
    supabase.from('campaign_expenses').select('*').eq('campaign_id', params.id).order('created_at'),
    supabase.from('campaign_items').select('*').eq('campaign_id', params.id),
    supabase
      .from('services')
      .select('id, name, saved_price_cents, suggested_price_cents, base_cost_cents, card_fee_bps, tax_bps, partner_commission_bps')
      .is('deleted_at', null)
      .not('base_cost_cents', 'is', null),
  ])

  if (!campaign) notFound()

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
    <CampaignWizard
      campaign={campaign}
      initialExpenses={expenses ?? []}
      initialItem={items?.[0] ?? null}
      offerServices={offerServices}
      isNew={searchParams.new === '1'}
    />
  )
}
