import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { accessGrantedEmail, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Cria um novo acesso (conta nova) OU reativa uma conta já existente.
// - E-mail novo  → cria a conta com a senha informada e libera o acesso.
// - E-mail já existe → apenas reativa o acesso (a senha informada é ignorada).
export async function POST(req: NextRequest) {
  const { ctx, res } = await requireAdminApi()
  if (res) return res

  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string; name?: string; phone?: string; sendMail?: boolean }
    | null
  const email = (body?.email ?? '').trim().toLowerCase()
  const password = body?.password ?? ''
  const name = (body?.name ?? '').trim()
  const phone = (body?.phone ?? '').trim()
  const sendMail = body?.sendMail !== false // padrão: envia

  // Nome, e-mail e telefone são obrigatórios.
  if (!name) return NextResponse.json({ error: 'Informe o nome.' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
  }
  if (!phone) return NextResponse.json({ error: 'Informe o telefone.' }, { status: 400 })

  const { data: exists, error: checkErr } = await ctx.admin.rpc('email_has_account', { p_email: email })
  if (checkErr) return NextResponse.json({ error: 'Falha ao verificar o e-mail.' }, { status: 500 })

  // Já existe → só reativa o acesso.
  if (exists === true) {
    const { error } = await ctx.admin.rpc('grant_access', { p_email: email, p_active: true })
    if (error) return NextResponse.json({ error: 'Não foi possível liberar o acesso.' }, { status: 500 })
    if (sendMail) {
      const { subject, html } = accessGrantedEmail({ name, email })
      await sendEmail(email, subject, html)
    }
    return NextResponse.json({ ok: true, mode: 'reactivated', email })
  }

  // Conta nova → precisa de senha inicial.
  if (password.length < 6) {
    return NextResponse.json({ error: 'Defina uma senha inicial de ao menos 6 caracteres.' }, { status: 400 })
  }

  const { data: created, error } = await ctx.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { access_active: true },
    user_metadata: { full_name: name },
  })
  if (error || !created?.user) {
    return NextResponse.json({ error: 'Não foi possível criar o acesso.' }, { status: 500 })
  }

  // Guarda nome e telefone no perfil (o trigger já cria a linha do profile).
  await ctx.admin.from('profiles').update({ full_name: name, phone }).eq('id', created.user.id)

  // Envia os dados de acesso por e-mail (se marcado).
  if (sendMail) {
    const { subject, html } = accessGrantedEmail({ name, email, password })
    await sendEmail(email, subject, html)
  }

  return NextResponse.json({ ok: true, mode: 'created', email })
}
