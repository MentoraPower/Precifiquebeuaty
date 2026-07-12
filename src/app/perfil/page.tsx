import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { PerfilClient } from './PerfilClient'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, profession, phone, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <PerfilClient
      email={user.email ?? ''}
      fullName={profile?.full_name ?? ''}
      profession={profile?.profession ?? ''}
      phone={profile?.phone ?? ''}
      avatarUrl={profile?.avatar_url ?? null}
    />
  )
}
