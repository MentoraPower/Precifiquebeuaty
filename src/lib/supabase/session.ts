import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Lê o usuário da sessão SEM ida à rede (decodifica o cookie local).
 * A validação/refresh do token acontece no middleware, e o acesso a dados
 * é protegido por RLS — então usar a sessão local nas telas é seguro e rápido.
 */
export async function getSessionUser(supabase: SupabaseClient<Database>) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user ?? null
}
