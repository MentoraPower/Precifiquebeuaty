'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/lib/database.types'
import { formatCents, formatBps } from '@/lib/format'
import { percentOfCents, roundCents, calculatePricing, BPS_DENOMINATOR } from '@/lib/pricing'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoneyField, PercentField, DurationField } from '@/components/ui/MoneyField'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/misc'

export type SimType = 'discount' | 'revenue_goal' | 'price_increase' | 'time_reduction' | 'combo'

export interface SimServiceOption {
  id: string
  name: string
  durationMinutes: number
  priceCents: number
  baseCostCents: number
  cardFeeBps: number
  taxBps: number
  commissionBps: number
  marginBps: number
}

const META: Record<SimType, { title: string; subtitle: string }> = {
  discount: { title: 'Desconto', subtitle: 'Veja até onde pode reduzir o preço sem prejuízo.' },
  revenue_goal: { title: 'Meta de faturamento', subtitle: 'Quantos atendimentos para bater a meta.' },
  price_increase: { title: 'Aumento de preço', subtitle: 'Compare o impacto de um novo valor.' },
  time_reduction: { title: 'Redução de tempo', subtitle: 'Ganho ao atender em menos tempo.' },
  combo: { title: 'Combo / pacote', subtitle: 'Monte a oferta sem ultrapassar o desconto saudável.' },
}

export function SimulationForm({
  type,
  services,
  hourlyCostCents,
}: {
  type: SimType
  services: SimServiceOption[]
  hourlyCostCents: number | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const meta = META[type]

  const [selected, setSelected] = useState<string[]>(services[0] ? [services[0].id] : [])
  const [discountPct, setDiscountPct] = useState(1000) // bps (10%)
  const [goalCents, setGoalCents] = useState(0)
  const [newPriceCents, setNewPriceCents] = useState(services[0]?.priceCents ?? 0)
  const [monthlyVolume, setMonthlyVolume] = useState(20)
  const [newDuration, setNewDuration] = useState(services[0]?.durationMinutes ?? 60)
  const [saving, setSaving] = useState(false)

  const single = services.find((s) => s.id === selected[0]) ?? null
  const comboServices = services.filter((s) => selected.includes(s.id))

  const view = useMemo(
    () => computeSim({ type, single, comboServices, discountPct, goalCents, newPriceCents, monthlyVolume, newDuration, hourlyCostCents }),
    [type, single, comboServices, discountPct, goalCents, newPriceCents, monthlyVolume, newDuration, hourlyCostCents],
  )

  async function save() {
    if (!view) return
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return setSaving(false)
    await supabase.from('simulations').insert({
      user_id: user.id,
      type,
      title: view.title,
      payload_json: { type, selected, discountPct, goalCents, newPriceCents, monthlyVolume, newDuration } as Json,
      result_json: { rows: view.rows, headlineCents: view.headlineCents, status: view.status } as unknown as Json,
    })
    setSaving(false)
    router.push('/simulacoes')
    router.refresh()
  }

  if (services.length === 0) {
    return (
      <main>
        <AppHeader back title={meta.title} subtitle={meta.subtitle} />
        <div className="px-5 pt-4">
          <Card className="flex items-start gap-2 border-attention/40 bg-attention/5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-attention" />
            <p className="text-[13px] text-muted">
              Você precisa de ao menos um serviço precificado.{' '}
              <Link href="/servicos/novo" className="font-medium text-gold">Criar serviço</Link>.
            </p>
          </Card>
        </div>
      </main>
    )
  }

  const multi = type === 'combo'

  return (
    <main>
      <AppHeader back title={meta.title} subtitle={meta.subtitle} />
      <div className="space-y-4 px-5 pb-28 pt-4">
        <div>
          <label className="label">{multi ? 'Serviços do combo' : 'Serviço'}</label>
          <div className="space-y-2">
            {services.map((s) => {
              const active = selected.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    multi
                      ? setSelected((prev) => (active ? prev.filter((x) => x !== s.id) : [...prev, s.id]))
                      : (setSelected([s.id]), setNewPriceCents(s.priceCents), setNewDuration(s.durationMinutes))
                  }
                  className={`flex w-full items-center justify-between gap-3 rounded-pill border px-4 py-3 text-left transition ${
                    active ? 'border-gold bg-champagne/50' : 'border-line hover:border-ink/20'
                  }`}
                >
                  <span className="truncate text-[14px]">{s.name}</span>
                  <span className="shrink-0 text-[13px] font-medium">{formatCents(s.priceCents)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {type === 'discount' && (
          <PercentField label="Desconto aplicado" valueBps={discountPct} onChangeBps={setDiscountPct} />
        )}
        {type === 'revenue_goal' && (
          <MoneyField label="Meta de faturamento (mês)" valueCents={goalCents} onChangeCents={setGoalCents} />
        )}
        {type === 'price_increase' && (
          <>
            <MoneyField label="Novo preço" valueCents={newPriceCents} onChangeCents={setNewPriceCents} />
            <Input label="Volume mensal (atendimentos)" type="number" value={monthlyVolume || ''} onChange={(e) => setMonthlyVolume(Number(e.target.value))} />
          </>
        )}
        {type === 'time_reduction' && (
          <DurationField label="Nova duração" valueMinutes={newDuration} onChangeMinutes={setNewDuration} hint="Formato horas : minutos" />
        )}
        {type === 'combo' && (
          <PercentField label="Desconto do combo" valueBps={discountPct} onChangeBps={setDiscountPct} />
        )}

        {view && (
          <Card className="divide-y divide-line">
            {view.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-muted">{r.label}</span>
                <span className={`text-[14px] font-semibold ${r.tone === 'danger' ? 'text-danger' : r.tone === 'gold' ? 'text-gold' : 'text-ink'}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </Card>
        )}

        {view?.status && (
          <div className="flex justify-center">
            <Badge tone={view.status === 'ok' ? 'success' : view.status === 'warn' ? 'attention' : 'danger'}>
              {view.statusLabel}
            </Badge>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]">
        <div className="rounded-[20px] border border-line bg-bg/95 p-3 shadow-float backdrop-blur">
          <Button fullWidth size="lg" onClick={save} loading={saving} disabled={!view || (multi ? comboServices.length === 0 : !single)}>
            Salvar simulação
          </Button>
        </div>
      </div>
    </main>
  )
}

interface SimRow {
  label: string
  value: string
  tone?: 'danger' | 'gold'
}
interface SimView {
  title: string
  rows: SimRow[]
  headlineCents: number | null
  status?: 'ok' | 'warn' | 'bad'
  statusLabel?: string
}

function mandatoryBps(s: SimServiceOption) {
  return s.cardFeeBps + s.taxBps + s.commissionBps
}

function computeSim(args: {
  type: SimType
  single: SimServiceOption | null
  comboServices: SimServiceOption[]
  discountPct: number
  goalCents: number
  newPriceCents: number
  monthlyVolume: number
  newDuration: number
  hourlyCostCents: number | null
}): SimView | null {
  const { type, single, comboServices, discountPct, goalCents, newPriceCents, monthlyVolume, newDuration, hourlyCostCents } = args

  if (type === 'discount' && single) {
    const discounted = roundCents(single.priceCents * (1 - discountPct / BPS_DENOMINATOR))
    const fees = percentOfCents(discounted, mandatoryBps(single))
    const profit = discounted - single.baseCostCents - fees
    const minimumPrice = roundCents(single.baseCostCents / (1 - mandatoryBps(single) / BPS_DENOMINATOR))
    const maxDiscount = single.priceCents - minimumPrice
    return {
      title: `Desconto ${formatBps(discountPct)} · ${single.name}`,
      headlineCents: profit,
      rows: [
        { label: 'Preço cheio', value: formatCents(single.priceCents) },
        { label: 'Preço com desconto', value: formatCents(discounted) },
        { label: 'Desconto máx. sem prejuízo', value: formatCents(Math.max(0, maxDiscount)) },
        { label: 'Lucro', value: formatCents(profit), tone: profit < 0 ? 'danger' : 'gold' },
      ],
      status: profit < 0 ? 'bad' : profit < single.priceCents * 0.1 ? 'warn' : 'ok',
      statusLabel: profit < 0 ? 'Prejuízo' : profit < single.priceCents * 0.1 ? 'Margem baixa' : 'Saudável',
    }
  }

  if (type === 'revenue_goal' && single && goalCents > 0) {
    const fees = percentOfCents(single.priceCents, mandatoryBps(single))
    const profitPer = single.priceCents - single.baseCostCents - fees
    const count = Math.ceil(goalCents / single.priceCents)
    return {
      title: `Meta ${formatCents(goalCents)} · ${single.name}`,
      headlineCents: goalCents,
      rows: [
        { label: 'Preço do serviço', value: formatCents(single.priceCents) },
        { label: 'Atendimentos necessários', value: String(count) },
        { label: 'Lucro por atendimento', value: formatCents(profitPer), tone: 'gold' },
        { label: 'Lucro total estimado', value: formatCents(profitPer * count), tone: 'gold' },
      ],
    }
  }

  if (type === 'price_increase' && single) {
    const feesOld = percentOfCents(single.priceCents, mandatoryBps(single))
    const profitOld = single.priceCents - single.baseCostCents - feesOld
    const feesNew = percentOfCents(newPriceCents, mandatoryBps(single))
    const profitNew = newPriceCents - single.baseCostCents - feesNew
    const monthlyDelta = (profitNew - profitOld) * monthlyVolume
    return {
      title: `Aumento p/ ${formatCents(newPriceCents)} · ${single.name}`,
      headlineCents: monthlyDelta,
      rows: [
        { label: 'Lucro atual (unid.)', value: formatCents(profitOld) },
        { label: 'Lucro novo (unid.)', value: formatCents(profitNew), tone: 'gold' },
        { label: `Impacto mensal (${monthlyVolume}x)`, value: formatCents(monthlyDelta), tone: monthlyDelta < 0 ? 'danger' : 'gold' },
      ],
      status: monthlyDelta >= 0 ? 'ok' : 'bad',
      statusLabel: monthlyDelta >= 0 ? 'Ganho mensal' : 'Perda mensal',
    }
  }

  if (type === 'time_reduction' && single && hourlyCostCents != null) {
    const inputsAndAdd = single.baseCostCents - roundCents(hourlyCostCents * (single.durationMinutes / 60))
    const newBase = calculatePricing({
      durationMinutes: newDuration,
      hourlyBusinessCostCents: hourlyCostCents,
      inputsCostCents: Math.max(0, inputsAndAdd),
      additionalCostCents: 0,
      cardFeeBps: single.cardFeeBps,
      taxBps: single.taxBps,
      partnerCommissionBps: single.commissionBps,
      desiredMarginBps: single.marginBps,
    })
    const feesSame = percentOfCents(single.priceCents, mandatoryBps(single))
    const profitOld = single.priceCents - single.baseCostCents - feesSame
    const profitNew = single.priceCents - newBase.baseCostCents - feesSame
    return {
      title: `${single.durationMinutes}→${newDuration}min · ${single.name}`,
      headlineCents: profitNew - profitOld,
      rows: [
        { label: 'Custo base atual', value: formatCents(single.baseCostCents) },
        { label: 'Custo base novo', value: formatCents(newBase.baseCostCents) },
        { label: 'Ganho de lucro por atendimento', value: formatCents(profitNew - profitOld), tone: 'gold' },
      ],
    }
  }

  if (type === 'combo' && comboServices.length > 0) {
    const fullPrice = comboServices.reduce((s, x) => s + x.priceCents, 0)
    const baseCost = comboServices.reduce((s, x) => s + x.baseCostCents, 0)
    const avgMandatory = Math.round(
      comboServices.reduce((s, x) => s + mandatoryBps(x), 0) / comboServices.length,
    )
    const comboPrice = roundCents(fullPrice * (1 - discountPct / BPS_DENOMINATOR))
    const fees = percentOfCents(comboPrice, avgMandatory)
    const profit = comboPrice - baseCost - fees
    const minimumPrice = roundCents(baseCost / (1 - avgMandatory / BPS_DENOMINATOR))
    const maxDiscount = fullPrice - minimumPrice
    return {
      title: `Combo (${comboServices.length}) · ${formatBps(discountPct)}`,
      headlineCents: profit,
      rows: [
        { label: 'Preço somado', value: formatCents(fullPrice) },
        { label: 'Preço do combo', value: formatCents(comboPrice) },
        { label: 'Desconto máx. sem prejuízo', value: formatCents(Math.max(0, maxDiscount)) },
        { label: 'Lucro do combo', value: formatCents(profit), tone: profit < 0 ? 'danger' : 'gold' },
      ],
      status: profit < 0 ? 'bad' : 'ok',
      statusLabel: profit < 0 ? 'Prejuízo' : 'Saudável',
    }
  }

  return null
}
