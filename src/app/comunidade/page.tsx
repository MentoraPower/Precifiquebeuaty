import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { ComunidadeClient } from './ComunidadeClient'
import type { CommunityPostRow, CommunityReactionRow } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

export default async function ComunidadePage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const [{ data: posts }, { data: reactions }, { data: isAdmin }] = await Promise.all([
    supabase.from('community_posts').select('*').order('created_at', { ascending: true }),
    supabase.from('community_reactions').select('*'),
    supabase.rpc('is_community_admin'),
  ])

  return (
    <ComunidadeClient
      userId={user.id}
      isAdmin={isAdmin === true}
      initialPosts={(posts as CommunityPostRow[]) ?? []}
      initialReactions={(reactions as CommunityReactionRow[]) ?? []}
    />
  )
}
