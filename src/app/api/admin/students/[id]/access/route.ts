import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi, canModifyTarget } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Ativa/desativa o acesso de um aluno (app_metadata.access_active).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { ctx, res } = await requireAdminApi()
  if (res) return res

  // Contas de admin só podem ser alteradas pelo super admin.
  if (!(await canModifyTarget(ctx, params.id))) {
    return NextResponse.json({ error: 'Apenas o super admin pode alterar contas de administrador.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as { active?: boolean } | null
  if (!body || typeof body.active !== 'boolean') {
    return NextResponse.json({ error: 'Parâmetro "active" inválido.' }, { status: 400 })
  }

  const { error } = await ctx.admin.auth.admin.updateUserById(params.id, {
    app_metadata: { access_active: body.active },
  })
  if (error) return NextResponse.json({ error: 'Não foi possível alterar o acesso.' }, { status: 500 })

  return NextResponse.json({ ok: true, active: body.active })
}
