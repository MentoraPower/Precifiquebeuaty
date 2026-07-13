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
  sellerId?: string
}

interface HublaPayload {
  type?: string
  event?: HublaEvent
}

interface Options {
  // Quando definido, só processa eventos cujo event.sellerId bata com este id
  // (usado para uma oferta específica, ex.: "Power Academy + Precifica Beauty").
  requireSellerId?: string
  // Nome do endpoint (para o log).
  endpoint?: string
}

export async function processHublaWebhook(req: NextRequest, opts: Options = {}): Promise<NextResponse> {
  const admin = createAdminClient()

  // Lê o corpo cru (para logar exatamente o que a Hubla enviou).
  const rawText = await req.text()
  let body: HublaPayload = {}
  try {
    body = JSON.parse(rawText) as HublaPayload
  } catch {
    // segue com body vazio; ainda logamos o texto cru
  }
  const type = body?.type
  const ev = body?.event ?? {}
  const email = String(ev.userEmail ?? '').trim().toLowerCase()

  // Registra TODA requisição recebida, com o resultado.
  async function log(result: string) {
    await admin
      .from('webhook_logs')
      .insert({
        endpoint: opts.endpoint ?? null,
        event_type: type ?? null,
        seller_id: ev.sellerId ?? null,
        email: email || null,
        result,
        raw: (body && Object.keys(body).length ? body : { rawText }) as unknown as Json,
      })
      .then(() => {})
  }

  // Autenticação simples via secret (na URL ?secret=... ou header x-webhook-secret)
  const secret = process.env.HUBLA_WEBHOOK_SECRET
  const provided = req.nextUrl.searchParams.get('secret') ?? req.headers.get('x-webhook-secret')
  if (!secret || provided !== secret) {
    await log('unauthorized')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Validação da oferta: se exigir um sellerId, ignora eventos de outras ofertas.
  if (opts.requireSellerId && ev.sellerId !== opts.requireSellerId) {
    await log('seller_mismatch')
    return NextResponse.json({ ok: true, ignored: 'seller_mismatch' })
  }

  if (!email) {
    await log('no_email')
    return NextResponse.json({ error: 'no email' }, { status: 400 })
  }

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
      // Só o primeiro nome (padrão de saudação do app).
      const firstName = String(ev.userName ?? '').trim().split(/\s+/)[0] ?? ''

      // Cria a conta com uma senha aleatória (se ainda não existir).
      const password = generatePassword()
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { access_active: true },
        user_metadata: { full_name: firstName },
      })
      const isNewAccount = !createErr && !!created?.user

      // Garante acesso ativo (vale também para conta já existente).
      await admin.rpc('grant_access', { p_email: email, p_active: true })

      await admin
        .from('entitlements')
        .upsert({ ...baseRow, status: 'active', last_event: 'NewSale', refunded_at: null }, { onConflict: 'email' })

      // Só manda a senha se a conta foi criada agora (não sobrescreve senha existente).
      const granted = accessGrantedEmail({
        name: firstName,
        email,
        password: isNewAccount ? password : undefined,
      })
      await sendEmail(email, granted.subject, granted.html)

      await log(isNewAccount ? 'access_granted_new' : 'access_granted_existing')
      return NextResponse.json({ ok: true, action: 'access_granted', email, newAccount: isNewAccount })
    }

    if (type === 'Refunded') {
      await admin.rpc('grant_access', { p_email: email, p_active: false })

      await admin.from('entitlements').upsert(
        { ...baseRow, status: 'refunded', last_event: 'Refunded', refunded_at: ev.refundedAt ?? new Date().toISOString() },
        { onConflict: 'email' },
      )

      const revoked = accessRevokedEmail(ev.userName)
      await sendEmail(email, revoked.subject, revoked.html)

      await log('access_revoked')
      return NextResponse.json({ ok: true, action: 'access_revoked', email })
    }

    // Outros tipos: responde 200 para a Hubla não reenviar, mas não faz nada.
    await log(`ignored_type:${type ?? 'unknown'}`)
    return NextResponse.json({ ok: true, ignored: type ?? 'unknown' })
  } catch (err) {
    await log(`error:${err instanceof Error ? err.message : 'internal'}`)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'internal' }, { status: 500 })
  }
}
