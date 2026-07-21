import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, canModifyTarget } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Define uma nova senha para o aluno (troca administrativa).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { ctx, res } = await requireAdminApi()
  if (res) return res

  // Contas de admin só podem ser alteradas pelo super admin.
  if (!(await canModifyTarget(ctx, params.id))) {
    return NextResponse.json({ error: 'Apenas o super admin pode alterar contas de administrador.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as { password?: string } | null
  const password = body?.password ?? ''
  if (password.length < 6) {
    return NextResponse.json({ error: 'A senha precisa de ao menos 6 caracteres.' }, { status: 400 })
  }

  const { error } = await ctx.admin.auth.admin.updateUserById(params.id, { password })
  if (error) return NextResponse.json({ error: 'Não foi possível alterar a senha.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
