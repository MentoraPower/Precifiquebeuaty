import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { MenuClient } from './MenuClient'

export const dynamic = 'force-dynamic'

// Tela 12 — Perfil e configurações.
export default async function MenuPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('full_name, profession, plan').eq('id', user.id).single(),
    supabase
      .from('business_settings')
      .select('default_card_fee_bps, default_tax_bps, default_commission_bps, default_margin_bps')
      .maybeSingle(),
  ])

  return (
    <MenuClient
      email={user?.email ?? ''}
      fullName={profile?.full_name ?? ''}
      profession={profile?.profession ?? ''}
      plan={profile?.plan ?? 'essencial'}
      defaults={{
        cardFeeBps: settings?.default_card_fee_bps ?? 0,
        taxBps: settings?.default_tax_bps ?? 0,
        commissionBps: settings?.default_commission_bps ?? 0,
        marginBps: settings?.default_margin_bps ?? 5000,
      }}
    />
  )
}
