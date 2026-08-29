import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, canModifyTarget } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Edita nome, e-mail e telefone do aluno.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { ctx, res } = await requireAdminApi()
  if (res) return res

  // Contas de admin só podem ser alteradas pelo super admin.
  if (!(await canModifyTarget(ctx, params.id))) {
    return NextResponse.json({ error: 'Apenas o super admin pode alterar contas de administrador.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as { name?: string; email?: string; phone?: string } | null
  const name = (body?.name ?? '').trim()
  const email = (body?.email ?? '').trim().toLowerCase()
  const phone = (body?.phone ?? '').trim()

  if (!name) return NextResponse.json({ error: 'Informe o nome.' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 })
  }

  // Perfil (nome + telefone).
  const { error: profErr } = await ctx.admin.from('profiles').update({ full_name: name, phone }).eq('id', params.id)
  if (profErr) return NextResponse.json({ error: 'Não foi possível salvar o perfil.' }, { status: 500 })

  // E-mail de login (auth) — só atualiza se mudou.
  const { data: userRes } = await ctx.admin.auth.admin.getUserById(params.id)
  const currentEmail = (userRes?.user?.email ?? '').toLowerCase()
  if (email !== currentEmail) {
    const { error: emailErr } = await ctx.admin.auth.admin.updateUserById(params.id, { email, email_confirm: true })
    if (emailErr) {
      return NextResponse.json({ error: 'Não foi possível alterar o e-mail (talvez já esteja em uso).' }, { status: 409 })
    }
  }

  return NextResponse.json({ ok: true })
}
