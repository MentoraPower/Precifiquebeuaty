import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, accessGrantedEmail, accessRevokedEmail } from '@/lib/email'
import type { Json } from '@/lib/database.types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HublaEvent {
  userId?: string
  userName?: string
  userEmail?: string
  userPhone?: string
  groupId?: string
  groupName?: string
  transactionId?: string
  totalAmount?: number
  paidAt?: string
  refundedAt?: string
}

interface HublaPayload {
  type?: string
  event?: HublaEvent
}

export async function POST(req: NextRequest) {
  // Autenticação simples via secret (na URL ?secret=... ou header x-webhook-secret)
  const secret = process.env.HUBLA_WEBHOOK_SECRET
  const provided = req.nextUrl.searchParams.get('secret') ?? req.headers.get('x-webhook-secret')
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: HublaPayload
  try {
    body = (await req.json()) as HublaPayload
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const type = body?.type
  const ev = body?.event ?? {}
  const email = String(ev.userEmail ?? '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'no email' }, { status: 400 })

  const admin = createAdminClient()

  const baseRow = {
    email,
    hubla_user_id: ev.userId ?? null,
    user_name: ev.userName ?? null,
    user_phone: ev.userPhone ?? null,
    group_id: ev.groupId ?? null,
    group_name: ev.groupName ?? null,
    transaction_id: ev.transactionId ?? null,
    total_amount_cents: ev.totalAmount != null ? Math.round(Number(ev.totalAmount) * 100) : null,
    paid_at: ev.paidAt ?? null,
    raw: body as unknown as Json,
  }

  try {
    if (type === 'NewSale') {
      // Cria a conta se ainda não existir (o comprador define a senha pelo "Esqueceu a senha?").
      await admin.auth.admin
        .createUser({
          email,
          email_confirm: true,
          app_metadata: { access_active: true },
          user_metadata: { full_name: ev.userName ?? '' },
        })
        .catch(() => {})

      // Garante acesso ativo (vale também para conta já existente).
      await admin.rpc('grant_access', { p_email: email, p_active: true })

      await admin
        .from('entitlements')
        .upsert({ ...baseRow, status: 'active', last_event: 'NewSale', refunded_at: null }, { onConflict: 'email' })

      const granted = accessGrantedEmail(ev.userName)
      await sendEmail(email, granted.subject, granted.html)

      return NextResponse.json({ ok: true, action: 'access_granted', email })
    }

    if (type === 'Refunded') {
      await admin.rpc('grant_access', { p_email: email, p_active: false })

      await admin.from('entitlements').upsert(
        { ...baseRow, status: 'refunded', last_event: 'Refunded', refunded_at: ev.refundedAt ?? new Date().toISOString() },
        { onConflict: 'email' },
      )

      const revoked = accessRevokedEmail(ev.userName)
      await sendEmail(email, revoked.subject, revoked.html)

      return NextResponse.json({ ok: true, action: 'access_revoked', email })
    }

    // Outros tipos: responde 200 para a Hubla não reenviar, mas não faz nada.
    return NextResponse.json({ ok: true, ignored: type ?? 'unknown' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'internal' }, { status: 500 })
  }
}
