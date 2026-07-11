import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Entrada do app — sem splash: encaminha direto para o destino certo.
export default async function IndexPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single()
  redirect(profile?.onboarding_completed ? '/home' : '/onboarding')
}
