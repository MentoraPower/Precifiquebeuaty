import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Liberação manual de acesso por e-mail (além da liberação automática da Hubla).
// Reativa/libera uma conta já existente. A criação de conta segue pela compra.
export async function POST(req: NextRequest) {
  const { ctx, res } = await requireAdminApi()
  if (res) return res

  const body = (await req.json().catch(() => null)) as { email?: string } | null
  const email = (body?.email ?? '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
  }

  const { data: exists, error: checkErr } = await ctx.admin.rpc('email_has_account', { p_email: email })
  if (checkErr) return NextResponse.json({ error: 'Falha ao verificar o e-mail.' }, { status: 500 })
  if (exists !== true) {
    return NextResponse.json(
      { error: 'Nenhuma conta com esse e-mail. A conta é criada quando a pessoa compra pela Hubla.' },
      { status: 404 },
    )
  }

  // grant_access grava app_metadata.access_active = true por e-mail (service_role).
  const { error } = await ctx.admin.rpc('grant_access', { p_email: email, p_active: true })
  if (error) return NextResponse.json({ error: 'Não foi possível liberar o acesso.' }, { status: 500 })

  return NextResponse.json({ ok: true, email })
}
