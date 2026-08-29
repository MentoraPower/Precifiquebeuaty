import { getAdminContext, listStudents } from '@/lib/admin/guard'
import { AlunosClient } from './AlunosClient'
import { AlunosGate } from './AlunosGate'

export const dynamic = 'force-dynamic'

export default async function AlunosPage() {
  const ctx = await getAdminContext()

  // Sem login → tela de login própria da aba (funciona no desktop).
  if (!ctx.ok && ctx.status === 401) return <AlunosGate mode="login" />
  // Logado, mas não é admin → acesso não permitido.
  if (!ctx.ok) return <AlunosGate mode="denied" />

  const students = await listStudents(ctx.admin)
  return <AlunosClient students={students} isSuperAdmin={ctx.isSuperAdmin} />
}
