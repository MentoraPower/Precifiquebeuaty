import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'

export const dynamic = 'force-dynamic'

export default async function NovaCampanhaPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data } = await supabase
    .from('campaigns')
    .insert({ user_id: user.id, name: '', expected_sales: 0, status: 'draft' })
    .select('id')
    .single()

  if (!data) redirect('/simulacoes')
  redirect(`/simulacoes/campanha/${data.id}?new=1`)
}
