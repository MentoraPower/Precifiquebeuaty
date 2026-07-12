import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { MenuClient } from './MenuClient'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// Tela 12 — Perfil e configurações.
export default async function MenuPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')
  const isAdmin = ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('full_name, profession, plan, avatar_url').eq('id', user.id).single(),
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
      avatarUrl={profile?.avatar_url ?? null}
      isAdmin={isAdmin}
      defaults={{
        cardFeeBps: settings?.default_card_fee_bps ?? 0,
        taxBps: settings?.default_tax_bps ?? 0,
        commissionBps: settings?.default_commission_bps ?? 0,
        marginBps: settings?.default_margin_bps ?? 5000,
      }}
    />
  )
}
