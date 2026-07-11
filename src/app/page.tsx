import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'

export const dynamic = 'force-dynamic'

// Entrada do app — decide o destino pela sessão local (sem ida à rede).
export default async function IndexPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  redirect(user ? '/home' : '/auth')
}
