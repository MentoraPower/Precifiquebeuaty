'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wallet, CalendarDays, Clock, Receipt, ArrowUpDown, ChevronRight, Boxes, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/format'
import { DarkCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { MoneyField } from '@/components/ui/MoneyField'
import { Input } from '@/components/ui/Input'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus'

interface Settings {
  proLaboreCents: number
  workingDays: number
  workingHoursDay: number
}

export function NegocioClient({
  initial,
  fixedTotalCents,
  variableTotalCents,
  depreciationCents,
  hourlyCostCents,
}: {
  initial: Settings
  fixedTotalCents: number
  variableTotalCents: number
  depreciationCents: number
  hourlyCostCents: number | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const [settings, setSettings] = useState<Settings>(initial)
  const [editing, setEditing] = useState<null | keyof Settings>(null)
  const [draft, setDraft] = useState<Settings>(initial)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  async function persist(nextValue: Settings) {
    setSaveState('saving')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return setSaveState('error')
    const { error } = await supabase.from('business_settings').upsert(
      {
        user_id: user.id,
        pro_labore_cents: nextValue.proLaboreCents,
        working_days: nextValue.workingDays,
        working_hours_day: nextValue.workingHoursDay,
      },
      { onConflict: 'user_id' },
    )
    if (error) return setSaveState('error')
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1500)
    router.refresh()
  }

  function openEdit(field: keyof Settings) {
    setDraft(settings)
    setEditing(field)
  }

  async function saveEdit() {
    setSettings(draft)
    setEditing(null)
    await persist(draft)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <SaveStatus state={saveState} onRetry={() => persist(settings)} />
      </div>

      <Row
        icon={Wallet}
        label="Pró-labore"
        value={settings.proLaboreCents ? formatCents(settings.proLaboreCents) : 'Não informado'}
        onClick={() => openEdit('proLaboreCents')}
      />
      <Row
        icon={CalendarDays}
        label="Dias trabalhados"
        value={settings.workingDays ? `${settings.workingDays} dias/mês` : 'Não informado'}
        onClick={() => openEdit('workingDays')}
      />
      <Row
        icon={Clock}
        label="Horas por dia"
        value={settings.workingHoursDay ? `${settings.workingHoursDay} horas` : 'Não informado'}
        onClick={() => openEdit('workingHoursDay')}
      />
      <Link href="/negocio/custos?type=fixed" className="block">
        <Row icon={Receipt} label="Custos fixos" value={`${formatCents(fixedTotalCents)}/mês`} asDiv />
      </Link>
      <Link href="/negocio/custos?type=variable" className="block">
        <Row icon={ArrowUpDown} label="Custos variáveis" value={`${formatCents(variableTotalCents)}/mês`} asDiv />
      </Link>
      <Link href="/negocio/investimentos" className="block">
        <Row icon={Boxes} label="Investimentos (depreciação)" value={`${formatCents(depreciationCents)}/mês`} asDiv />
      </Link>

      <DarkCard className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-white/70">Custo da sua hora</p>
          {hourlyCostCents != null ? (
            <p className="mt-1 text-[26px] font-bold">{formatCents(hourlyCostCents)}</p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-[14px] text-gold">
              <Info className="h-4 w-4" /> Informe dias e horas para calcular
            </p>
          )}
        </div>
      </DarkCard>

      {/* Bottom sheets de edição */}
      <BottomSheet
        open={editing === 'proLaboreCents'}
        onClose={() => setEditing(null)}
        title="Pró-labore mensal"
      >
        <MoneyField
          autoFocus
          valueCents={draft.proLaboreCents}
          onChangeCents={(c) => setDraft((d) => ({ ...d, proLaboreCents: c }))}
        />
        <Button fullWidth size="lg" className="mt-5" onClick={saveEdit}>
          Salvar
        </Button>
      </BottomSheet>

      <BottomSheet open={editing === 'workingDays'} onClose={() => setEditing(null)} title="Dias trabalhados / mês">
        <Input
          autoFocus
          type="number"
          min={1}
          max={31}
          value={draft.workingDays || ''}
          onChange={(e) => setDraft((d) => ({ ...d, workingDays: Number(e.target.value) }))}
          suffix="dias"
        />
        <Button fullWidth size="lg" className="mt-5" onClick={saveEdit}>
          Salvar
        </Button>
      </BottomSheet>

      <BottomSheet open={editing === 'workingHoursDay'} onClose={() => setEditing(null)} title="Horas por dia">
        <Input
          autoFocus
          type="number"
          min={1}
          max={16}
          value={draft.workingHoursDay || ''}
          onChange={(e) => setDraft((d) => ({ ...d, workingHoursDay: Number(e.target.value) }))}
          suffix="horas"
        />
        <Button fullWidth size="lg" className="mt-5" onClick={saveEdit}>
          Salvar
        </Button>
      </BottomSheet>
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  onClick,
  asDiv,
}: {
  icon: typeof Wallet
  label: string
  value: string
  onClick?: () => void
  asDiv?: boolean
}) {
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-brown text-white">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[14px] font-medium">{label}</p>
        <p className="text-[13px] text-muted">{value}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-subtle" />
    </>
  )
  const cls =
    'flex w-full items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5 text-left transition hover:border-ink/20'
  if (asDiv) return <div className={cls}>{inner}</div>
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
