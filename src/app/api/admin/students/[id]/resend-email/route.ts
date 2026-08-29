import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { accessGrantedEmail, sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Reenvia o e-mail de acesso para o aluno. Como a senha é criptografada, o
// e-mail vai sem senha (orienta a entrar com a senha atual ou "Esqueci a senha").
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { ctx, res } = await requireAdminApi()
  if (res) return res

  const { data: userRes, error: userErr } = await ctx.admin.auth.admin.getUserById(params.id)
  const email = userRes?.user?.email
  if (userErr || !email) {
    return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 })
  }

  const { data: profile } = await ctx.admin.from('profiles').select('full_name').eq('id', params.id).single()
  const name = profile?.full_name ?? undefined

  const { subject, html } = accessGrantedEmail({ name, email })
  await sendEmail(email, subject, html)

  return NextResponse.json({ ok: true, email })
}
