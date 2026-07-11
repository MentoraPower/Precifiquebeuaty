'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents, formatBps } from '@/lib/format'
import { calculateCampaign } from '@/lib/pricing'
import type { CampaignExpenseRow, CampaignItemRow, CampaignRow } from '@/lib/database.types'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoneyField } from '@/components/ui/MoneyField'
import { Stepper } from '@/components/ui/Stepper'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Card, DarkCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/misc'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus'
import { useConfirm } from '@/components/ConfirmProvider'

export interface OfferService {
  id: string
  name: string
  salePriceCents: number
  baseCostCents: number
  cardFeeBps: number
  taxBps: number
  commissionBps: number
}

const STEPS = ['Informações', 'Gastos', 'Oferta', 'Resultado']

export function CampaignWizard({
  campaign,
  userId,
  initialExpenses,
  initialItem,
  offerServices,
}: {
  campaign: CampaignRow | null
  userId: string
  initialExpenses: CampaignExpenseRow[]
  initialItem: CampaignItemRow | null
  offerServices: OfferService[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()
  const isNew = !campaign
  const [step, setStep] = useState(0)
  const [name, setName] = useState(campaign?.name ?? '')
  const [expenses, setExpenses] = useState(initialExpenses)
  const [serviceId, setServiceId] = useState(initialItem?.service_id ?? offerServices[0]?.id ?? '')
  const [expectedSales, setExpectedSales] = useState(campaign?.expected_sales || 0)
  const [promoCents, setPromoCents] = useState(campaign?.promotional_price_cents ?? 0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saving, setSaving] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout>>()
  const idRef = useRef<string | null>(campaign?.id ?? null)
  const creatingRef = useRef<Promise<string> | null>(null)

  // Cria a campanha só quando o usuário começa a preencher (evita rascunho vazio).
  async function ensureId(): Promise<string> {
    if (idRef.current) return idRef.current
    if (creatingRef.current) return creatingRef.current
    creatingRef.current = (async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ user_id: userId, name: name.trim(), expected_sales: expectedSales, status: 'draft' })
        .select('id')
        .single()
      if (error || !data) throw error ?? new Error('insert falhou')
      idRef.current = data.id
      window.history.replaceState(null, '', `/simulacoes/campanha/${data.id}`)
      return data.id
    })()
    return creatingRef.current
  }

  const offer = offerServices.find((s) => s.id === serviceId) ?? null
  const investmentCents = expenses.reduce((s, e) => s + e.amount_cents, 0)
  const salePriceCents = promoCents > 0 ? promoCents : offer?.salePriceCents ?? 0

  const result = useMemo(() => {
    if (!offer) return null
    return calculateCampaign({
      investmentCents,
      expectedSales,
      salePriceCents,
      baseCostCents: offer.baseCostCents,
      cardFeeBps: offer.cardFeeBps,
      taxBps: offer.taxBps,
      commissionBps: offer.commissionBps,
    })
  }, [offer, investmentCents, expectedSales, salePriceCents])

  function persist(patch: Partial<CampaignRow>) {
    setSaveState('saving')
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      try {
        const id = await ensureId()
        const { error } = await supabase.from('campaigns').update(patch).eq('id', id)
        if (error) return setSaveState('error')
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 1400)
      } catch {
        setSaveState('error')
      }
    }, 700)
  }

  async function saveCampaign() {
    if (!offer || !result) return
    setSaving(true)
    try {
      const id = await ensureId()
      const feeSnapshot = { cardFeeBps: offer.cardFeeBps, taxBps: offer.taxBps, commissionBps: offer.commissionBps }

      // grava o item (offer) — substitui o existente
      await supabase.from('campaign_items').delete().eq('campaign_id', id)
      await supabase.from('campaign_items').insert({
        campaign_id: id,
        item_type: 'service',
        service_id: offer.id,
        quantity: 1,
        price_snapshot_cents: salePriceCents,
        base_cost_snapshot_cents: offer.baseCostCents,
        fee_snapshot_json: feeSnapshot,
      })

      const { error } = await supabase
        .from('campaigns')
        .update({
          name: name.trim() || 'Campanha',
          expected_sales: expectedSales,
          promotional_price_cents: promoCents > 0 ? promoCents : null,
          status: 'active',
          result_snapshot_json: { ...result, calculatedAt: new Date().toISOString(), salePriceCents },
        })
        .eq('id', id)
      if (error) throw error
      router.push('/simulacoes')
      router.refresh()
    } catch {
      // mantém na tela; SaveStatus/estado já refletem
    } finally {
      setSaving(false)
    }
  }

  return (
    <main>
      <AppHeader
        back
        title={isNew ? 'Nova campanha' : name || 'Campanha'}
        subtitle="Veja a viabilidade antes de investir."
        right={<SaveStatus state={saveState} onRetry={() => persist({ name })} />}
      />
      <div className="px-5 pt-4 pb-1">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="px-5 pt-6">
        {step === 0 && (
          <div className="space-y-4">
            <Input
              autoFocus
              label="Nome da campanha"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                persist({ name: e.target.value })
              }}
              placeholder="Ex.: Dia das Mães"
            />
            <p className="text-[13px] text-muted">
              Dê um nome para identificar sua campanha. Nas próximas etapas você informa os gastos e a oferta.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-[16px] font-semibold">Gastos da campanha</h2>
              <p className="text-[13px] text-muted">Tráfego pago, brindes, fotógrafo, etc.</p>
            </div>
            <Button fullWidth variant="outline" onClick={() => setSheetOpen(true)}>
              <Plus className="h-5 w-5" /> Adicionar gasto
            </Button>
            <div className="flex flex-col gap-3">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3">
                  <span className="flex-1 text-[14px] font-medium">{e.name}</span>
                  <span className="text-[14px] font-semibold">{formatCents(e.amount_cents)}</span>
                  <button onClick={() => removeExpense(e)} className="text-subtle hover:text-danger" aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <DarkCard className="flex items-center justify-between">
              <span className="text-[13px] text-white/70">Investimento total</span>
              <span className="text-[20px] font-bold">{formatCents(investmentCents)}</span>
            </DarkCard>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[16px] font-semibold">Oferta e previsão</h2>
              <p className="text-[13px] text-muted">Escolha o serviço divulgado e quantas vendas você espera.</p>
            </div>

            {offerServices.length === 0 ? (
              <Card className="flex items-start gap-2 border-attention/40 bg-attention/5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-attention" />
                <p className="text-[13px] text-muted">
                  Você precisa de ao menos um serviço precificado.{' '}
                  <Link href="/servicos/novo" className="font-medium text-gold">Criar serviço</Link>.
                </p>
              </Card>
            ) : (
              <>
                <div>
                  <label className="label">Serviço divulgado</label>
                  <div className="space-y-2">
                    {offerServices.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setServiceId(s.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-pill border px-4 py-3 text-left transition ${
                          serviceId === s.id ? 'border-gold bg-champagne/50' : 'border-line hover:border-ink/20'
                        }`}
                      >
                        <span className="truncate text-[14px]">{s.name}</span>
                        <span className="shrink-0 text-[13px] font-medium">{formatCents(s.salePriceCents)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Vendas esperadas"
                  type="number"
                  min={0}
                  value={expectedSales || ''}
                  onChange={(e) => {
                    setExpectedSales(Number(e.target.value))
                    persist({ expected_sales: Number(e.target.value) })
                  }}
                  suffix="vendas"
                />
                <MoneyField
                  label="Preço promocional (opcional)"
                  valueCents={promoCents}
                  onChangeCents={(c) => {
                    setPromoCents(c)
                    persist({ promotional_price_cents: c > 0 ? c : null })
                  }}
                  hint={offer ? `Preço normal: ${formatCents(offer.salePriceCents)}` : undefined}
                />
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <CampaignResult result={result} investmentCents={investmentCents} name={name} expectedSales={expectedSales} salePriceCents={salePriceCents} />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]">
        <div className="flex gap-3 rounded-[20px] border border-line bg-bg/95 p-3 shadow-float backdrop-blur">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Voltar
            </Button>
          ) : (
            <Link href="/simulacoes" className="flex-1">
              <Button variant="outline" fullWidth>
                Cancelar
              </Button>
            </Link>
          )}
          {step < 3 ? (
            <Button
              className="flex-1"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 0 && !name.trim()) || (step === 2 && (!offer || expectedSales <= 0))}
            >
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" onClick={saveCampaign} loading={saving} disabled={!result || result.reason != null}>
              Salvar campanha
            </Button>
          )}
        </div>
      </div>
      <div className="h-24" />

      <ExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={addExpense} />
    </main>
  )

  async function addExpense(name: string, category: string, amount: number) {
    setSheetOpen(false)
    const id = await ensureId()
    const { data } = await supabase
      .from('campaign_expenses')
      .insert({ campaign_id: id, name, category, amount_cents: amount })
      .select()
      .single()
    if (data) setExpenses((prev) => [...prev, data])
  }

  async function removeExpense(e: CampaignExpenseRow) {
    const ok = await confirm({ title: 'Remover gasto', message: `Remover "${e.name}"?`, confirmLabel: 'Remover', danger: true })
    if (!ok) return
    setExpenses((prev) => prev.filter((x) => x.id !== e.id))
    await supabase.from('campaign_expenses').delete().eq('id', e.id)
  }
}

function CampaignResult({
  result,
  investmentCents,
  name,
  expectedSales,
  salePriceCents,
}: {
  result: ReturnType<typeof calculateCampaign> | null
  investmentCents: number
  name: string
  expectedSales: number
  salePriceCents: number
}) {
  if (!result) return <p className="text-[14px] text-muted">Selecione uma oferta na etapa anterior.</p>

  if (result.reason === 'NON_POSITIVE_CONTRIBUTION') {
    return (
      <Card className="border-danger/40 bg-danger/5">
        <p className="text-[15px] font-semibold text-danger">Oferta inviável</p>
        <p className="mt-1 text-[13px] text-muted">{result.analysis}</p>
      </Card>
    )
  }

  const statusMap = {
    healthy: { label: 'Saudável', tone: 'success' as const },
    attention: { label: 'Atenção', tone: 'attention' as const },
    risk: { label: 'Risco', tone: 'attention' as const },
    loss: { label: 'Prejuízo', tone: 'danger' as const },
  }
  const st = statusMap[result.status]

  return (
    <div className="space-y-4">
      <DarkCard>
        <p className="text-[13px] text-white/70">Investimento total{name ? ` · ${name}` : ''}</p>
        <p className="mt-1 text-[30px] font-bold leading-none">{formatCents(investmentCents)}</p>
      </DarkCard>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Vendas para empatar" value={String(result.breakEvenSales ?? '—')} />
        <Metric label="Lucro médio por venda" value={formatCents(result.contributionPerSaleCents)} />
        <Metric label="Receita esperada" value={formatCents(result.revenueCents)} />
        <Metric label="Lucro previsto" value={formatCents(result.campaignProfitCents)} tone={result.campaignProfitCents < 0 ? 'danger' : undefined} />
      </div>

      <Card className="flex items-center justify-between border-transparent bg-champagne">
        <div>
          <p className="text-[12px] text-[#8a6a1e]">ROI estimado</p>
          <p className="text-[26px] font-bold text-[#8a6a1e]">
            {result.roiBps != null ? formatBps(result.roiBps) : '—'}
          </p>
        </div>
        <Badge tone={st.tone}>{st.label}</Badge>
      </Card>

      <div>
        <h3 className="mb-1.5 text-[14px] font-semibold">Análise da campanha</h3>
        <Card>
          <p className="text-[13px] leading-relaxed text-muted">{result.analysis}</p>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <Card>
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`mt-1 text-[18px] font-bold ${tone === 'danger' ? 'text-danger' : 'text-ink'}`}>{value}</p>
    </Card>
  )
}

function ExpenseSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (name: string, category: string, amount: number) => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('trafego')
  const [amount, setAmount] = useState(0)
  const cats = [
    { id: 'trafego', label: 'Tráfego pago' },
    { id: 'brindes', label: 'Brindes' },
    { id: 'producao', label: 'Produção' },
    { id: 'geral', label: 'Outro' },
  ]
  return (
    <BottomSheet open={open} onClose={onClose} title="Adicionar gasto">
      <div className="space-y-4">
        <Input autoFocus label="Nome do gasto" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Tráfego pago" />
        <div>
          <label className="label">Categoria</label>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`shrink-0 rounded-pill px-4 py-2 text-[13px] transition ${
                  category === c.id ? 'bg-ink text-white' : 'border border-line text-muted'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <MoneyField label="Valor" valueCents={amount} onChangeCents={setAmount} />
        <Button fullWidth size="lg" disabled={!name.trim() || amount <= 0} onClick={() => onAdd(name.trim(), category, amount)}>
          Adicionar
        </Button>
      </div>
    </BottomSheet>
  )
}
