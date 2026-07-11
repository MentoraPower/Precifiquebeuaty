import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { getBusinessContext } from '@/lib/queries'
import { SimulationForm, type SimServiceOption, type SimType } from './SimulationForm'

export const dynamic = 'force-dynamic'

const VALID: SimType[] = ['discount', 'revenue_goal', 'price_increase', 'time_reduction', 'combo']

export default async function SimulacaoTipoPage({ params }: { params: { type: string } }) {
  if (!VALID.includes(params.type as SimType)) notFound()
  const type = params.type as SimType

  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, saved_price_cents, suggested_price_cents, base_cost_cents, card_fee_bps, tax_bps, partner_commission_bps, desired_margin_bps')
    .is('deleted_at', null)
    .not('base_cost_cents', 'is', null)

  const ctx = await getBusinessContext()

  const options: SimServiceOption[] = (services ?? [])
    .filter((s) => (s.saved_price_cents ?? s.suggested_price_cents) != null)
    .map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.duration_minutes,
      priceCents: (s.saved_price_cents ?? s.suggested_price_cents)!,
      baseCostCents: s.base_cost_cents ?? 0,
      cardFeeBps: s.card_fee_bps,
      taxBps: s.tax_bps,
      commissionBps: s.partner_commission_bps,
      marginBps: s.desired_margin_bps,
    }))

  return <SimulationForm type={type} services={options} hourlyCostCents={ctx.hourlyCostCents} />
}
