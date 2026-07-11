'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Briefcase, Boxes, Receipt, Settings, HelpCircle, Info, LogOut, ChevronRight, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { initials, formatBps } from '@/lib/format'
import { AppHeader } from '@/components/layout/AppHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { PercentField } from '@/components/ui/MoneyField'
import { Input } from '@/components/ui/Input'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus'
import { InstallPWA } from '@/components/InstallPWA'
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
  const [feesOpen, setFeesOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [fees, setFees] = useState(defaults)
  const [name, setName] = useState(fullName)
  const [prof, setProf] = useState(profession)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  async function saveFees() {
    setSaveState('saving')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return setSaveState('error')
    const { error } = await supabase.from('business_settings').upsert(
      {
        user_id: user.id,
        default_card_fee_bps: fees.cardFeeBps,
        default_tax_bps: fees.taxBps,
        default_commission_bps: fees.commissionBps,
        default_margin_bps: fees.marginBps,
      },
      { onConflict: 'user_id' },
    )
    setSaveState(error ? 'error' : 'saved')
    if (!error) {
      setTimeout(() => setFeesOpen(false), 500)
      router.refresh()
    }
  }

  async function saveProfile() {
    setSaveState('saving')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return setSaveState('error')
    const { error } = await supabase.from('profiles').update({ full_name: name, profession: prof }).eq('id', user.id)
    setSaveState(error ? 'error' : 'saved')
    if (!error) {
      setProfileOpen(false)
      router.refresh()
    }
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
      <AppHeader title="Menu" />
      <div className="space-y-5 px-5 pt-2">
        {/* perfil */}
        <button onClick={() => setProfileOpen(true)} className="flex w-full items-center gap-3 text-left">
          <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-ink text-[18px] font-bold text-white">
            {initials(fullName)}
          </span>
          <div className="flex-1">
            <p className="text-[17px] font-bold">{fullName || 'Sua conta'}</p>
            <p className="text-[13px] text-muted">{profession || email}</p>
          </div>
          <span className="rounded-pill bg-champagne px-3 py-1 text-[12px] font-medium capitalize text-[#8a6a1e]">
            Plano {plan}
          </span>
        </button>

        <div className="space-y-5">
          <Link href="/negocio">
            <Row icon={Briefcase} label="Meu negócio" />
          </Link>
          <Link href="/negocio/investimentos">
            <Row icon={Boxes} label="Investimentos" />
          </Link>
          <button onClick={() => setFeesOpen(true)} className="w-full">
            <Row icon={Receipt} label="Impostos e taxas" hint={`padrão ${formatBps(fees.marginBps)} margem`} />
          </button>
          <button onClick={() => setProfileOpen(true)} className="w-full">
            <Row icon={Settings} label="Configurações" />
          </button>
          <a href="mailto:contato@mentorabeautyacademy.com.br">
            <Row icon={HelpCircle} label="Ajuda e suporte" />
          </a>
          <button onClick={() => setAboutOpen(true)} className="w-full">
            <Row icon={Info} label="Sobre o app" />
          </button>
        </div>

        <InstallPWA />

        <Button variant="outline" fullWidth size="lg" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sair da conta
        </Button>
      </div>

      {/* Impostos e taxas padrão */}
      <BottomSheet open={feesOpen} onClose={() => setFeesOpen(false)} title="Impostos e taxas padrão">
        <div className="space-y-4">
          <p className="text-[13px] text-muted">
            Estes valores são copiados para novos serviços. Alterá-los não muda serviços já criados.
          </p>
          <PercentField label="Taxa da maquininha" valueBps={fees.cardFeeBps} onChangeBps={(b) => setFees((f) => ({ ...f, cardFeeBps: b }))} />
          <PercentField label="Impostos" valueBps={fees.taxBps} onChangeBps={(b) => setFees((f) => ({ ...f, taxBps: b }))} />
          <PercentField label="Comissão de parceiro" valueBps={fees.commissionBps} onChangeBps={(b) => setFees((f) => ({ ...f, commissionBps: b }))} />
          <PercentField label="Margem desejada" valueBps={fees.marginBps} onChangeBps={(b) => setFees((f) => ({ ...f, marginBps: b }))} />
          <div className="flex items-center justify-between">
            <SaveStatus state={saveState} onRetry={saveFees} />
            <Button onClick={saveFees}>Salvar</Button>
          </div>
        </div>
      </BottomSheet>

      {/* Perfil */}
      <BottomSheet open={profileOpen} onClose={() => setProfileOpen(false)} title="Meus dados">
        <div className="space-y-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Profissão" value={prof} onChange={(e) => setProf(e.target.value)} />
          <Input label="E-mail" value={email} disabled />
          <Button fullWidth size="lg" onClick={saveProfile}>
            Salvar
          </Button>
        </div>
      </BottomSheet>

      {/* Sobre */}
      <BottomSheet open={aboutOpen} onClose={() => setAboutOpen(false)} title="Sobre o app">
        <div className="space-y-2 text-[14px] text-muted">
          <p className="flex items-center gap-2 text-ink">
            <User className="h-4 w-4" /> W Calculadora
          </p>
          <p>Precifique com clareza, calcule seu lucro e a viabilidade das suas campanhas.</p>
          <p className="text-[12px] text-subtle">Versão 1.0.0</p>
        </div>
      </BottomSheet>
    </main>
  )
}

function Row({ icon: Icon, label, hint }: { icon: typeof Briefcase; label: string; hint?: string }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-surface text-muted">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[14px] font-medium">{label}</p>
        {hint && <p className="text-[12px] text-subtle">{hint}</p>}
      </div>
      <ChevronRight className="h-5 w-5 text-subtle" />
    </Card>
  )
}
