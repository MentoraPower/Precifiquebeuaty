import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { AssinaturaClient } from './AssinaturaClient'

export const dynamic = 'force-dynamic'

export default async function AssinaturaPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data } = await supabase.rpc('my_entitlement')
  const entitlement = Array.isArray(data) && data.length > 0 ? data[0] : null

  return <AssinaturaClient email={user.email ?? ''} entitlement={entitlement} />
}
