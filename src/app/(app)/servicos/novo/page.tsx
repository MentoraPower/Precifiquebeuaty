import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'

export const dynamic = 'force-dynamic'

// Cria um rascunho de serviço com as taxas padrão e abre o wizard/editor.
export default async function NovoServicoPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data: settings } = await supabase
    .from('business_settings')
    .select('default_card_fee_bps, default_tax_bps, default_commission_bps, default_margin_bps')
    .maybeSingle()

  const { data: service } = await supabase
    .from('services')
    .insert({
      user_id: user.id,
      name: '',
      duration_minutes: 60,
      status: 'draft',
      card_fee_bps: settings?.default_card_fee_bps ?? 0,
      tax_bps: settings?.default_tax_bps ?? 0,
      partner_commission_bps: settings?.default_commission_bps ?? 0,
      desired_margin_bps: settings?.default_margin_bps ?? 5000,
    })
    .select('id')
    .single()

  if (!service) redirect('/servicos')
  redirect(`/servicos/${service.id}?new=1`)
}
