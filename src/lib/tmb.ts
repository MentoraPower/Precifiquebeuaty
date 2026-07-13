import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, accessGrantedEmail, accessRevokedEmail } from '@/lib/email'
import type { Json } from '@/lib/database.types'

// Senha aleatória amigável (sem caracteres ambíguos).
function generatePassword(len = 10): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(len)
  let out = ''
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length]
  return out
}

interface TmbPayload {
  code?: string
  cliente?: string
  email?: string
  documento?: string
  telefone_ativo?: string
  telefones?: string
  lancamento?: string
  lancamento_id?: number
  status_pedido?: string
  valor_total?: number
  valor_principal?: number
  criado_em?: string
  data_efetivado?: string
  [k: string]: unknown
}

// Mapeamento dos status da TMB (comparação em minúsculas).
const APPROVED_STATUSES = ['efetivado', 'aprovado', 'pago', 'ativo', 'concluido', 'concluído']
const CANCELED_STATUSES = [
  'cancelado',
  'estornado',
  'estorno',
  'reembolsado',
  'reembolso',
  'devolvido',
  'recusado',
  'chargeback',
  'inadimplente',
  'expirado',
]

export async function processTmbWebhook(req: NextRequest): Promise<NextResponse> {
  const admin = createAdminClient()

  const rawText = await req.text()
  let p: TmbPayload = {}
  try {
    p = JSON.parse(rawText) as TmbPayload
  } catch {
    // segue com objeto vazio; ainda logamos o texto cru
  }

  const email = String(p.email ?? '').trim().toLowerCase()
  const status = String(p.status_pedido ?? '').trim().toLowerCase()
  const fullName = String(p.cliente ?? '').trim()
  const firstName = fullName.split(/\s+/)[0] ?? ''
  const phone = String(p.telefone_ativo ?? p.telefones ?? '').trim()

  async function log(result: string) {
    await admin
      .from('webhook_logs')
      .insert({
        endpoint: 'tmb',
        event_type: p.status_pedido ?? null,
        seller_id: null,
        email: email || null,
        result,
        raw: (p && Object.keys(p).length ? p : { rawText }) as unknown as Json,
      })
      .then(() => {})
  }

  // Autenticação via secret (?secret=... ou header x-webhook-secret)
  const secret = process.env.HUBLA_WEBHOOK_SECRET
  const provided = req.nextUrl.searchParams.get('secret') ?? req.headers.get('x-webhook-secret')
  if (!secret || provided !== secret) {
    await log('unauthorized')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!email) {
    await log('no_email')
    return NextResponse.json({ error: 'no email' }, { status: 400 })
  }

  const baseRow = {
    email,
    hubla_user_id: null,
    user_name: fullName || null,
    user_phone: phone || null,
    group_id: p.lancamento_id != null ? String(p.lancamento_id) : null,
    group_name: p.lancamento ?? null,
    transaction_id: p.code ?? null,
    total_amount_cents: p.valor_total != null ? Math.round(Number(p.valor_total) * 100) : null,
    paid_at: p.data_efetivado ?? p.criado_em ?? null,
    raw: p as unknown as Json,
  }

  const isApproved = APPROVED_STATUSES.includes(status)
  const isCanceled = CANCELED_STATUSES.includes(status)

  try {
    if (isApproved) {
      // Cria a conta com senha aleatória (se ainda não existir).
      const password = generatePassword()
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { access_active: true },
        user_metadata: { full_name: firstName },
      })
      const isNewAccount = !createErr && !!created?.user

      // Telefone no perfil (best-effort, para contas novas).
      if (isNewAccount && created?.user?.id && phone) {
        await admin
          .from('profiles')
          .update({ phone })
          .eq('id', created.user.id)
          .then(() => {})
      }

      await admin.rpc('grant_access', { p_email: email, p_active: true })

      await admin
        .from('entitlements')
        .upsert({ ...baseRow, status: 'active', last_event: `tmb:${status}`, refunded_at: null }, { onConflict: 'email' })

      const granted = accessGrantedEmail({
        name: firstName,
        email,
        password: isNewAccount ? password : undefined,
      })
      await sendEmail(email, granted.subject, granted.html)

      await log(isNewAccount ? 'access_granted_new' : 'access_granted_existing')
      return NextResponse.json({ ok: true, action: 'access_granted', email, newAccount: isNewAccount })
    }

    if (isCanceled) {
      await admin.rpc('grant_access', { p_email: email, p_active: false })

      await admin.from('entitlements').upsert(
        { ...baseRow, status: 'refunded', last_event: `tmb:${status}`, refunded_at: new Date().toISOString() },
        { onConflict: 'email' },
      )

      const revoked = accessRevokedEmail(firstName)
      await sendEmail(email, revoked.subject, revoked.html)

      await log('access_revoked')
      return NextResponse.json({ ok: true, action: 'access_revoked', email })
    }

    // Status não mapeado: responde 200 (a TMB não reenvia) e loga para ajustarmos depois.
    await log(`ignored_status:${p.status_pedido ?? 'unknown'}`)
    return NextResponse.json({ ok: true, ignored: p.status_pedido ?? 'unknown' })
  } catch (err) {
    await log(`error:${err instanceof Error ? err.message : 'internal'}`)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'internal' }, { status: 500 })
  }
}
