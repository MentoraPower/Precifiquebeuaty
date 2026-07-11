'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  Boxes,
  Receipt,
  Info,
  LogOut,
  ChevronRight,
  User,
  Lock,
  Check,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { initials, formatBps } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PercentField } from '@/components/ui/MoneyField'
import { Input } from '@/components/ui/Input'
import { InstallPWARow } from '@/components/InstallPWA'
import { useConfirm } from '@/components/ConfirmProvider'

interface Defaults {
  cardFeeBps: number
  taxBps: number
  commissionBps: number
  marginBps: number
}

export function MenuClient({
  email,
  fullName,
  profession,
  plan,
  defaults,
}: {
  email: string
  fullName: string
  profession: string
  plan: string
  defaults: Defaults
}) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()

  const [profileOpen, setProfileOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [feesOpen, setFeesOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const [name, setName] = useState(fullName)
  const [prof, setProf] = useState(profession)
  const [displayName, setDisplayName] = useState(fullName)
  const [displayProf, setDisplayProf] = useState(profession)
  const [fees, setFees] = useState(defaults)

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingFees, setSavingFees] = useState(false)

  // troca de senha
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwDone, setPwDone] = useState(false)

  async function saveProfile() {
    setSavingProfile(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ full_name: name, profession: prof }).eq('id', user.id)
      setDisplayName(name)
      setDisplayProf(prof)
    }
    setSavingProfile(false)
    setProfileOpen(false)
    router.refresh()
  }

  async function changePassword() {
    setPwError(null)
    if (pw1.length < 6) return setPwError('A senha precisa de ao menos 6 caracteres.')
    if (pw1 !== pw2) return setPwError('As senhas não coincidem.')
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pw1 })
    setPwSaving(false)
    if (error) return setPwError('Não foi possível alterar a senha.')
    setPwDone(true)
    setPw1('')
    setPw2('')
    setTimeout(() => {
      setPwDone(false)
      setPasswordOpen(false)
    }, 1200)
  }

  async function saveFees() {
    setSavingFees(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('business_settings').upsert(
        {
          user_id: user.id,
          default_card_fee_bps: fees.cardFeeBps,
          default_tax_bps: fees.taxBps,
          default_commission_bps: fees.commissionBps,
          default_margin_bps: fees.marginBps,
        },
        { onConflict: 'user_id' },
      )
    }
    setSavingFees(false)
    setFeesOpen(false)
    router.refresh()
  }

  async function signOut() {
    const ok = await confirm({ title: 'Sair da conta', message: 'Deseja encerrar sua sessão?', confirmLabel: 'Sair' })
    if (!ok) return
    await supabase.auth.signOut()
    router.replace('/auth')
    router.refresh()
  }

  return (
    <main>
      <header className="safe-top px-5 pb-2 pt-5">
        <h1 className="text-[22px] font-bold leading-tight">Menu</h1>
      </header>

      <div className="space-y-6 px-5 pt-2">
        {/* Perfil */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex w-full items-center gap-4 rounded-card border border-line bg-bg p-4 text-left transition hover:border-ink/20"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-pill bg-ink text-[18px] font-bold text-white">
            {initials(displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-bold">{displayName || 'Sua conta'}</p>
            <p className="truncate text-[13px] text-muted">{email}</p>
          </div>
          <span className="shrink-0 rounded-pill bg-champagne px-3 py-1 text-[11px] font-semibold capitalize text-[#8a6a1e]">
            {plan}
          </span>
        </button>

        <Section title="Conta">
          <Row icon={User} label="Editar perfil" hint={displayProf || 'Nome e profissão'} onClick={() => setProfileOpen(true)} />
          <Row icon={Lock} label="Trocar senha" onClick={() => setPasswordOpen(true)} />
        </Section>

        <Section title="Negócio">
          <Row icon={Briefcase} label="Meu negócio" href="/negocio" />
          <Row icon={Boxes} label="Investimentos" href="/negocio/investimentos" />
          <Row icon={Receipt} label="Impostos e taxas" hint={`Margem padrão ${formatBps(fees.marginBps)}`} onClick={() => setFeesOpen(true)} />
        </Section>

        <Section title="Aplicativo">
          <InstallPWARow />
          <Row icon={Info} label="Sobre o app" onClick={() => setAboutOpen(true)} />
        </Section>

        <Button variant="outline" fullWidth size="lg" onClick={signOut} className="text-danger">
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </div>

      {/* Editar perfil */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Editar perfil">
        <div className="space-y-4">
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-ink text-[20px] font-bold text-white">
              {initials(name)}
            </span>
          </div>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          <Input label="Profissão" value={prof} onChange={(e) => setProf(e.target.value)} placeholder="Ex.: Designer de sobrancelhas" />
          <Input label="E-mail" value={email} disabled hint="O e-mail de acesso não pode ser alterado por aqui." />
          <Button fullWidth size="lg" loading={savingProfile} onClick={saveProfile}>
            Salvar
          </Button>
        </div>
      </Modal>

      {/* Trocar senha */}
      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Trocar senha" subtitle="Defina uma nova senha de acesso.">
        {pwDone ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-pill bg-success/12 text-success">
              <Check className="h-7 w-7" />
            </span>
            <p className="text-[15px] font-semibold">Senha alterada!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Nova senha" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <Input label="Confirmar nova senha" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Repita a senha" />
            {pwError && <p className="text-[13px] text-danger">{pwError}</p>}
            <Button fullWidth size="lg" loading={pwSaving} onClick={changePassword}>
              Salvar nova senha
            </Button>
          </div>
        )}
      </Modal>

      {/* Impostos e taxas */}
      <Modal open={feesOpen} onClose={() => setFeesOpen(false)} title="Impostos e taxas padrão" subtitle="Copiados para novos serviços; não altera os já criados.">
        <div className="space-y-4">
          <PercentField label="Taxa da maquininha" valueBps={fees.cardFeeBps} onChangeBps={(b) => setFees((f) => ({ ...f, cardFeeBps: b }))} />
          <PercentField label="Impostos" valueBps={fees.taxBps} onChangeBps={(b) => setFees((f) => ({ ...f, taxBps: b }))} />
          <PercentField label="Comissão de parceiro" valueBps={fees.commissionBps} onChangeBps={(b) => setFees((f) => ({ ...f, commissionBps: b }))} />
          <PercentField label="Margem desejada" valueBps={fees.marginBps} onChangeBps={(b) => setFees((f) => ({ ...f, marginBps: b }))} />
          <Button fullWidth size="lg" loading={savingFees} onClick={saveFees}>
            Salvar
          </Button>
        </div>
      </Modal>

      {/* Sobre */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="Sobre o app">
        <div className="space-y-2 text-[14px] text-muted">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <User className="h-4 w-4" /> W Calculadora
          </p>
          <p>Precifique com clareza, calcule seu lucro e a viabilidade das suas campanhas.</p>
          <p className="pt-1 text-[12px] text-subtle">Versão 1.0.0</p>
        </div>
      </Modal>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-subtle">{title}</p>
      <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">{children}</div>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  hint,
  href,
  external,
  onClick,
}: {
  icon: typeof Briefcase
  label: string
  hint?: string
  href?: string
  external?: boolean
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-champagne text-gold">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">{label}</p>
        {hint && <p className="truncate text-[12px] text-subtle">{hint}</p>}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
    </>
  )
  const cls = 'flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface'
  if (href) {
    return external ? (
      <a href={href} className={cls}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
