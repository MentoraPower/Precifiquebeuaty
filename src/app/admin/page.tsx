import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppHeader } from '@/components/layout/AppHeader'
import { formatCents, formatDateBR } from '@/lib/format'
import type { EntitlementRow } from '@/lib/database.types'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export default async function AdminPage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')
  if (!ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())) notFound()

  const admin = createAdminClient()
  const [{ data: usersData }, { data: ents }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('entitlements').select('*'),
  ])

  const entByEmail = new Map<string, EntitlementRow>(
    (ents ?? []).map((e) => [e.email.toLowerCase(), e as EntitlementRow]),
  )

  const rows = (usersData?.users ?? [])
    .map((u) => {
      const email = u.email ?? ''
      const ent = entByEmail.get(email.toLowerCase())
      return {
        email,
        active: (u.app_metadata as { access_active?: boolean } | undefined)?.access_active === true,
        ent,
        createdAt: u.created_at,
      }
    })
    .filter((r) => r.email)
    .sort((a, b) => (a.active === b.active ? a.email.localeCompare(b.email) : a.active ? -1 : 1))

  const activeCount = rows.filter((r) => r.active).length

  return (
    <main className="pb-16">
      <AppHeader back center title="Acessos" subtitle={`${activeCount} ativos de ${rows.length} cadastrados`} />

      <div className="flex flex-col gap-3 px-5 pt-4">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-muted">Nenhum e-mail cadastrado ainda.</p>
        ) : (
          rows.map((r) => (
            <div key={r.email} className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{r.email}</p>
                <p className="truncate text-[12px] text-muted">
                  {r.ent
                    ? `${r.ent.last_event === 'Refunded' ? 'Reembolsado' : 'Compra'}${
                        r.ent.total_amount_cents ? ` · ${formatCents(r.ent.total_amount_cents)}` : ''
                      } · ${formatDateBR(r.ent.updated_at)}`
                    : `Cadastro · ${formatDateBR(r.createdAt)}`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-1 text-[12px] font-semibold ${
                  r.active ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger'
                }`}
              >
                {r.active ? 'Ativo' : 'Desativado'}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
