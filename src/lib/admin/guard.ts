import 'server-only'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database, BusinessSettingsRow, EntitlementRow, Profile } from '@/lib/database.types'

type Admin = SupabaseClient<Database>

/**
 * Super admin: controla TUDO, inclusive as outras contas de administrador
 * (trocar senha / desativar admins). Os demais admins só gerenciam alunos.
 */
export const SUPER_ADMIN_EMAILS = ['patrickbergeh@gmail.com']

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  return SUPER_ADMIN_EMAILS.includes((email ?? '').trim().toLowerCase())
}

/**
 * Contexto de administrador da área /alunos.
 * Admin = membro de `community_admins` (mesma checagem da Comunidade, via
 * `is_community_admin()`). A checagem usa o cookie da sessão; as operações
 * pesadas usam o cliente service_role (ignora RLS) — só no servidor.
 */
export type AdminContext =
  | { ok: true; userId: string; email: string; isSuperAdmin: boolean; admin: Admin }
  | { ok: false; status: 401 | 403 }

export async function getAdminContext(): Promise<AdminContext> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401 }

  const { data: isAdmin } = await supabase.rpc('is_community_admin')
  if (isAdmin !== true) return { ok: false, status: 403 }

  const email = user.email ?? ''
  return { ok: true, userId: user.id, email, isSuperAdmin: isSuperAdminEmail(email), admin: createAdminClient() }
}

/** Retorna o conjunto de user_ids que são administradores (community_admins). */
export async function getAdminUserIds(admin: Admin): Promise<Set<string>> {
  const { data } = await admin.from('community_admins').select('user_id')
  return new Set((data ?? []).map((r) => r.user_id))
}

/**
 * Regra de proteção das contas de admin: um alvo que é admin só pode ser
 * alterado (senha/desativação) pelo super admin.
 */
export async function canModifyTarget(
  ctx: Extract<AdminContext, { ok: true }>,
  targetUserId: string,
): Promise<boolean> {
  if (ctx.isSuperAdmin) return true
  const adminIds = await getAdminUserIds(ctx.admin)
  return !adminIds.has(targetUserId) // pode alterar apenas quem NÃO é admin
}

/**
 * Guarda para route handlers (/api/admin/*). Retorna o contexto se for admin,
 * ou uma resposta 401/403 pronta para devolver.
 */
export async function requireAdminApi(): Promise<
  { ctx: Extract<AdminContext, { ok: true }>; res?: never } | { ctx?: never; res: NextResponse }
> {
  const ctx = await getAdminContext()
  if (!ctx.ok) {
    return {
      res: NextResponse.json(
        { error: ctx.status === 401 ? 'Não autenticado.' : 'Sem permissão.' },
        { status: ctx.status },
      ),
    }
  }
  return { ctx }
}

export interface Student {
  id: string
  email: string
  createdAt: string // "primeiro acesso" (conta criada)
  lastSignInAt: string | null
  accessActive: boolean
  isAdmin: boolean // membro de community_admins (conta protegida)
  // perfil
  fullName: string
  profession: string
  phone: string
  avatarUrl: string | null
  onboardingCompleted: boolean
  // respostas dentro do app (business_settings)
  settings: {
    proLaboreCents: number
    workingDays: number
    workingHoursDay: number
    marginBps: number
    cardFeeBps: number
    taxBps: number
    commissionBps: number
  } | null
  // compra (entitlements)
  entitlement: {
    status: EntitlementRow['status']
    groupName: string | null
    totalAmountCents: number | null
    paidAt: string | null
    lastEvent: string | null
  } | null
}

/** Lista todos os alunos: usuários do Auth + perfil + respostas do app + compra. */
export async function listStudents(admin: Admin): Promise<Student[]> {
  // 1) Usuários do Auth (paginado; teto de segurança de 25 páginas = 5.000).
  const authUsers: { id: string; email: string; created_at: string; last_sign_in_at: string | null; access_active: boolean }[] = []
  const perPage = 200
  for (let page = 1; page <= 25; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    for (const u of data.users) {
      authUsers.push({
        id: u.id,
        email: u.email ?? '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        access_active: (u.app_metadata as { access_active?: boolean } | undefined)?.access_active === true,
      })
    }
    if (data.users.length < perPage) break
  }

  // 2) Perfis, configurações, compras e lista de admins (service_role ignora RLS).
  const [{ data: profiles }, { data: settings }, { data: ents }, adminIds] = await Promise.all([
    admin.from('profiles').select('id, full_name, profession, phone, avatar_url, onboarding_completed'),
    admin.from('business_settings').select('*'),
    admin.from('entitlements').select('*'),
    getAdminUserIds(admin),
  ])

  const profileById = new Map<string, Pick<Profile, 'full_name' | 'profession' | 'phone' | 'avatar_url' | 'onboarding_completed'>>()
  for (const p of profiles ?? []) profileById.set(p.id, p)

  const settingsByUser = new Map<string, BusinessSettingsRow>()
  for (const s of (settings as BusinessSettingsRow[]) ?? []) settingsByUser.set(s.user_id, s)

  const entByEmail = new Map<string, EntitlementRow>()
  for (const e of (ents as EntitlementRow[]) ?? []) entByEmail.set(e.email.toLowerCase(), e)

  const students = authUsers.map<Student>((u) => {
    const p = profileById.get(u.id)
    const s = settingsByUser.get(u.id)
    const e = entByEmail.get(u.email.toLowerCase())
    return {
      id: u.id,
      email: u.email,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
      accessActive: u.access_active,
      isAdmin: adminIds.has(u.id),
      fullName: p?.full_name ?? '',
      profession: p?.profession ?? '',
      phone: p?.phone ?? '',
      avatarUrl: p?.avatar_url ?? null,
      onboardingCompleted: p?.onboarding_completed ?? false,
      settings: s
        ? {
            proLaboreCents: s.pro_labore_cents,
            workingDays: s.working_days,
            workingHoursDay: s.working_hours_day,
            marginBps: s.default_margin_bps,
            cardFeeBps: s.default_card_fee_bps,
            taxBps: s.default_tax_bps,
            commissionBps: s.default_commission_bps,
          }
        : null,
      entitlement: e
        ? {
            status: e.status,
            groupName: e.group_name,
            totalAmountCents: e.total_amount_cents,
            paidAt: e.paid_at,
            lastEvent: e.last_event,
          }
        : null,
    }
  })

  // Mais recentes primeiro.
  students.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  return students
}
