'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  MoreVertical,
  X,
  Check,
  UserPlus,
  ShieldCheck,
  ShieldOff,
  KeyRound,
  Phone,
  Mail,
  Briefcase,
  LogOut,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge, Chip } from '@/components/ui/misc'
import { useConfirm } from '@/components/ConfirmProvider'
import { formatCents, formatBps, formatDateTimeBR } from '@/lib/format'
import type { Student } from '@/lib/admin/guard'

type Filter = 'todos' | 'ativos' | 'inativos'

export function AlunosClient({ students, isSuperAdmin }: { students: Student[]; isSuperAdmin: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [grantOpen, setGrantOpen] = useState(false)

  const selected = useMemo(() => students.find((s) => s.id === selectedId) ?? null, [students, selectedId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students.filter((s) => {
      if (filter === 'ativos' && !s.accessActive) return false
      if (filter === 'inativos' && s.accessActive) return false
      if (!q) return true
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q)
      )
    })
  }, [students, query, filter])

  async function signOut() {
    await supabase.auth.signOut({ scope: 'local' })
    router.refresh() // volta para o login da própria aba /alunos
  }

  return (
    <main className="min-h-screen">
      <div className="w-full px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
        {/* Ações do topo */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button onClick={() => setGrantOpen(true)} className="rounded-pill">
            <UserPlus className="h-4 w-4" /> Criar novo acesso
          </Button>
          <button
            onClick={signOut}
            aria-label="Sair"
            className="flex h-10 w-10 items-center justify-center rounded-pill border border-line text-subtle transition hover:bg-surface hover:text-danger"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Busca + filtros */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone…"
              className="field pl-11"
            />
          </div>
          <div className="flex gap-2">
            <Chip active={filter === 'todos'} onClick={() => setFilter('todos')}>
              Todos
            </Chip>
            <Chip active={filter === 'ativos'} onClick={() => setFilter('ativos')}>
              Ativos
            </Chip>
            <Chip active={filter === 'inativos'} onClick={() => setFilter('inativos')}>
              Inativos
            </Chip>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-card border border-line bg-bg shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-[12px] font-semibold uppercase tracking-wide text-subtle">
                  <th className="px-5 py-3">Aluno</th>
                  <th className="px-5 py-3">Telefone</th>
                  <th className="px-5 py-3">Primeiro acesso</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="w-12 px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className="cursor-pointer transition hover:bg-surface/60"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar url={s.avatarUrl} name={s.fullName || s.email} size={40} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold">
                            {s.fullName || '—'}
                            {s.isAdmin && <Badge tone="gold">Admin</Badge>}
                          </p>
                          <p className="truncate text-[12px] text-muted">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-muted">{s.phone || '—'}</td>
                    <td className="px-5 py-3 text-[13px] text-muted">{formatDateTimeBR(s.createdAt)}</td>
                    <td className="px-5 py-3">
                      {s.accessActive ? (
                        <Badge tone="success">Ativo</Badge>
                      ) : (
                        <Badge tone="danger">Inativo</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(s.id)
                        }}
                        aria-label="Abrir detalhes"
                        className="rounded-pill p-1.5 text-subtle transition hover:bg-line hover:text-ink"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center text-[14px] text-muted">
              Nenhum aluno encontrado{query ? ` para “${query}”.` : '.'}
            </div>
          )}
          </div>
          </div>

          {/* Painel de detalhes — abre ao lado, empurrando a tabela */}
          {selected && (
            <StudentDrawer
              key={selected.id}
              student={selected}
              isSuperAdmin={isSuperAdmin}
              onClose={() => setSelectedId(null)}
              onChanged={() => router.refresh()}
            />
          )}
        </div>
      </div>

      {/* Criar novo acesso */}
      <CreateAccessModal open={grantOpen} onClose={() => setGrantOpen(false)} onChanged={() => router.refresh()} />
    </main>
  )
}

/* ---------------------------------------------------------------------------
 * Painel lateral (detalhes + ações)
 * ------------------------------------------------------------------------- */

function StudentDrawer({
  student,
  isSuperAdmin,
  onClose,
  onChanged,
}: {
  student: Student
  isSuperAdmin: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const confirm = useConfirm()

  // Conta de admin só pode ser alterada (senha/desativação) pelo super admin.
  const locked = student.isAdmin && !isSuperAdmin

  const [pw, setPw] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [accessSaving, setAccessSaving] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // edição de contato (nome, e-mail, telefone)
  const [name, setName] = useState(student.fullName)
  const [email, setEmail] = useState(student.email)
  const [phone, setPhone] = useState(student.phone)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function saveProfile() {
    setProfileMsg(null)
    setProfileSaving(true)
    try {
      const res = await fetch(`/api/admin/students/${student.id}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao salvar.')
      }
      setProfileMsg({ ok: true, text: 'Dados salvos.' })
      onChanged()
    } catch (err) {
      setProfileMsg({ ok: false, text: err instanceof Error ? err.message : 'Falha ao salvar.' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function resendEmail() {
    setResendMsg(null)
    setResendLoading(true)
    try {
      const res = await fetch(`/api/admin/students/${student.id}/resend-email`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao reenviar o e-mail.')
      }
      setResendMsg({ ok: true, text: 'E-mail de acesso reenviado.' })
    } catch (err) {
      setResendMsg({ ok: false, text: err instanceof Error ? err.message : 'Falha ao reenviar o e-mail.' })
    } finally {
      setResendLoading(false)
    }
  }

  async function savePassword() {
    setPwMsg(null)
    if (pw.length < 6) return setPwMsg({ ok: false, text: 'A senha precisa de ao menos 6 caracteres.' })
    setPwSaving(true)
    try {
      const res = await fetch(`/api/admin/students/${student.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao alterar a senha.')
      setPw('')
      setPwMsg({ ok: true, text: 'Senha alterada com sucesso.' })
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : 'Falha ao alterar a senha.' })
    } finally {
      setPwSaving(false)
    }
  }

  async function toggleAccess() {
    const activating = !student.accessActive
    if (!activating) {
      const ok = await confirm({
        title: 'Desativar acesso',
        message: `${student.fullName || student.email} perderá o acesso ao app imediatamente. Os dados são mantidos e você pode reativar depois.`,
        confirmLabel: 'Desativar',
        cancelLabel: 'Cancelar',
      })
      if (!ok) return
    }
    setAccessSaving(true)
    try {
      const res = await fetch(`/api/admin/students/${student.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: activating }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao alterar o acesso.')
      }
      onChanged()
    } catch (err) {
      await confirm({
        title: 'Não foi possível alterar',
        message: err instanceof Error ? err.message : 'Tente novamente.',
        confirmLabel: 'Ok',
        cancelLabel: 'Fechar',
      })
    } finally {
      setAccessSaving(false)
    }
  }

  return (
    <aside
      className="sticky top-6 flex h-[calc(100vh-3rem)] w-[400px] shrink-0 flex-col overflow-hidden rounded-card border border-line bg-bg shadow-card"
      role="dialog"
      aria-label="Detalhes do aluno"
    >
      {/* Cabeçalho do painel */}
        <div className="flex items-start gap-3 border-b border-line bg-bg px-5 py-5">
          <Avatar url={student.avatarUrl} name={student.fullName || student.email} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold leading-tight">{student.fullName || '—'}</p>
            <p className="truncate text-[13px] text-muted">{student.email}</p>
            <div className="mt-1.5">
              {student.accessActive ? <Badge tone="success">Acesso ativo</Badge> : <Badge tone="danger">Sem acesso</Badge>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-surface text-muted transition hover:bg-line"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* Contato — editável (nome, e-mail, telefone) */}
          <Section title="Contato">
            {locked ? (
              <>
                <InfoRow icon={Mail} label="E-mail" value={student.email} />
                <InfoRow icon={Phone} label="Telefone" value={student.phone || '—'} />
                <InfoRow icon={Briefcase} label="Profissão" value={student.profession || '—'} />
              </>
            ) : (
              <div className="space-y-3">
                <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
                <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
                <Input label="Telefone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" />
                {student.profession && <InfoRow icon={Briefcase} label="Profissão" value={student.profession} />}
                {profileMsg && (
                  <p className={`flex items-center gap-1.5 text-[13px] ${profileMsg.ok ? 'text-success' : 'text-danger'}`}>
                    {profileMsg.ok && <Check className="h-4 w-4" />} {profileMsg.text}
                  </p>
                )}
                <Button
                  fullWidth
                  loading={profileSaving}
                  onClick={saveProfile}
                  disabled={!name.trim() || !email.trim()}
                  className="rounded-pill"
                >
                  <Check className="h-4 w-4" /> Salvar dados
                </Button>
              </div>
            )}
          </Section>

          {/* Acesso */}
          <Section title="Acesso">
            <InfoRow label="Primeiro acesso" value={formatDateTimeBR(student.createdAt)} />
            <InfoRow label="Último acesso" value={formatDateTimeBR(student.lastSignInAt)} />
            <InfoRow label="Onboarding" value={student.onboardingCompleted ? 'Concluído' : 'Não concluído'} />
          </Section>

          {/* Respostas dentro do app */}
          <Section title="Respostas no app">
            {student.settings ? (
              <>
                <InfoRow label="Pró-labore mensal" value={formatCents(student.settings.proLaboreCents)} />
                <InfoRow label="Dias por mês" value={`${student.settings.workingDays} dias`} />
                <InfoRow label="Horas por dia" value={`${student.settings.workingHoursDay} h`} />
                <InfoRow label="Margem padrão" value={formatBps(student.settings.marginBps)} />
                <InfoRow label="Taxa da maquininha" value={formatBps(student.settings.cardFeeBps)} />
                <InfoRow label="Impostos" value={formatBps(student.settings.taxBps)} />
                <InfoRow label="Comissão" value={formatBps(student.settings.commissionBps)} />
              </>
            ) : (
              <p className="px-1 py-2 text-[13px] text-muted">Ainda não preencheu as configurações do negócio.</p>
            )}
          </Section>

          {/* Assinatura */}
          {student.entitlement && (
            <Section title="Assinatura">
              <InfoRow label="Situação" value={traduzStatus(student.entitlement.status)} />
              {student.entitlement.groupName && <InfoRow label="Produto" value={student.entitlement.groupName} />}
              {student.entitlement.totalAmountCents != null && (
                <InfoRow label="Valor" value={formatCents(student.entitlement.totalAmountCents)} />
              )}
              {student.entitlement.paidAt && <InfoRow label="Pago em" value={formatDateTimeBR(student.entitlement.paidAt)} />}
            </Section>
          )}

          {/* Reenviar acesso por e-mail */}
          <Section title="Acesso por e-mail">
            {resendMsg && (
              <p className={`mb-2 flex items-center gap-1.5 text-[13px] ${resendMsg.ok ? 'text-success' : 'text-danger'}`}>
                {resendMsg.ok && <Check className="h-4 w-4" />} {resendMsg.text}
              </p>
            )}
            <Button variant="outline" fullWidth loading={resendLoading} onClick={resendEmail} className="rounded-pill">
              <Mail className="h-4 w-4" /> Reenviar acesso por e-mail
            </Button>
          </Section>

          {/* Trocar senha (contas de admin: só o super admin) */}
          {locked ? (
            <Section title="Conta de administrador">
              <p className="px-1 py-1.5 text-[13px] text-muted">
                Esta é uma conta de administrador. Trocar senha e desativar só podem ser feitos pelo super admin.
              </p>
            </Section>
          ) : (
            <Section title="Trocar senha">
              <Input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Nova senha (mín. 6 caracteres)"
                autoComplete="new-password"
              />
              {pwMsg && (
                <p className={`mt-2 flex items-center gap-1.5 text-[13px] ${pwMsg.ok ? 'text-success' : 'text-danger'}`}>
                  {pwMsg.ok && <Check className="h-4 w-4" />} {pwMsg.text}
                </p>
              )}
              <Button variant="outline" fullWidth loading={pwSaving} onClick={savePassword} className="mt-3 rounded-pill">
                <KeyRound className="h-4 w-4" /> Definir nova senha
              </Button>
            </Section>
          )}
        </div>

        {/* Rodapé — ativar/desativar */}
        {!locked && (
        <div className="border-t border-line bg-bg px-5 py-4">
          {student.accessActive ? (
            <Button variant="danger" fullWidth size="lg" loading={accessSaving} onClick={toggleAccess} className="rounded-pill">
              <ShieldOff className="h-4 w-4" /> Desativar acesso
            </Button>
          ) : (
            <Button fullWidth size="lg" loading={accessSaving} onClick={toggleAccess} className="rounded-pill">
              <ShieldCheck className="h-4 w-4" /> Ativar acesso
            </Button>
          )}
        </div>
        )}
      </aside>
  )
}

/* ---------------------------------------------------------------------------
 * Criar novo acesso (nome, e-mail, telefone + senha inicial)
 * ------------------------------------------------------------------------- */

function CreateAccessModal({ open, onClose, onChanged }: { open: boolean; onClose: () => void; onChanged: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [sendMail, setSendMail] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const canSubmit = name.trim() && email.trim() && phone.trim()

  function generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    const bytes = new Uint32Array(12)
    crypto.getRandomValues(bytes)
    setPassword(Array.from(bytes, (b) => chars[b % chars.length]).join(''))
  }

  function resetAndClose() {
    setMsg(null)
    onClose()
  }

  async function submit() {
    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/access/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, sendMail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Falha ao criar o acesso.')
      setMsg({
        ok: true,
        text: data.mode === 'reactivated' ? `Conta já existia — acesso reativado.` : `Acesso criado para ${data.email}.`,
      })
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
      onChanged()
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Falha ao criar o acesso.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="Criar novo acesso" subtitle="Cadastre um aluno e libere o acesso.">
      <div className="space-y-3">
        <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" autoComplete="off" />
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          autoComplete="off"
        />
        <Input
          label="Telefone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 90000-0000"
          autoComplete="off"
        />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label mb-0">Senha inicial</label>
            <button type="button" onClick={generatePassword} className="text-[12px] font-semibold text-brown">
              Gerar aleatória
            </button>
          </div>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            hint="Se o e-mail já tiver conta, o acesso é apenas reativado (a senha é ignorada)."
          />
        </div>

        {/* Enviar acesso por e-mail */}
        <button
          type="button"
          onClick={() => setSendMail((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[14px] font-medium text-ink">Enviar acesso por e-mail</span>
            <span className="block text-[12px] text-subtle">Manda o e-mail e a senha para o aluno.</span>
          </span>
          <Toggle on={sendMail} />
        </button>

        {msg && (
          <p className={`flex items-center gap-1.5 text-[13px] ${msg.ok ? 'text-success' : 'text-danger'}`}>
            {msg.ok ? <Check className="h-4 w-4" /> : null} {msg.text}
          </p>
        )}
        <Button fullWidth size="lg" loading={loading} onClick={submit} disabled={!canSubmit} className="rounded-pill">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Criar acesso
        </Button>
      </div>
    </Modal>
  )
}

/* ---------------------------------------------------------------------------
 * Auxiliares de UI
 * ------------------------------------------------------------------------- */

/** Interruptor visual (on/off). */
function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition ${on ? 'bg-success' : 'bg-line'}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-pill bg-white shadow-sm transition ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-subtle">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="flex items-center gap-2 text-[13px] text-muted">
        {Icon && <Icon className="h-4 w-4 text-subtle" />} {label}
      </span>
      <span className="min-w-0 truncate text-right text-[13px] font-medium text-ink">{value}</span>
    </div>
  )
}

function traduzStatus(status: string): string {
  if (status === 'active') return 'Ativa'
  if (status === 'refunded') return 'Reembolsada'
  return 'Inativa'
}
