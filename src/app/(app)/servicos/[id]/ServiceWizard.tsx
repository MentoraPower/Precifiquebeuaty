'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Package, Star, AlertTriangle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents, formatBps } from '@/lib/format'
import {
  calculatePricing,
  calculateServiceInputCost,
  calculateProductUnitCost,
} from '@/lib/pricing'
import { roundCents } from '@/lib/pricing/money'
import { toProduct } from '@/lib/mappers'
import type { ProductRow, ServiceInputRow, ServiceRow } from '@/lib/database.types'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoneyField, PercentField, DurationField } from '@/components/ui/MoneyField'
import { Stepper } from '@/components/ui/Stepper'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Card, DarkCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/misc'
import { SaveStatus, type SaveState } from '@/components/ui/SaveStatus'

interface LocalInput {
  id: string
  product_id: string
  quantity_used: number
}

const STEPS = ['Básico', 'Insumos', 'Custos', 'Resultado']

interface Defaults {
  cardFeeBps: number
  taxBps: number
  commissionBps: number
  marginBps: number
}

export function ServiceWizard({
  service,
  userId,
  defaults,
  initialInputs,
  products,
  hourlyCostCents,
}: {
  service: ServiceRow | null
  userId: string
  defaults: Defaults
  initialInputs: ServiceInputRow[]
  products: ProductRow[]
  hourlyCostCents: number | null
}) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = !service

  const [step, setStep] = useState(0)
  const [name, setName] = useState(service?.name ?? '')
  const [duration, setDuration] = useState(service?.duration_minutes ?? 60)
  const [additional, setAdditional] = useState(service?.additional_cost_cents ?? 0)
  const [cardFee, setCardFee] = useState(service?.card_fee_bps ?? defaults.cardFeeBps)
  const [tax, setTax] = useState(service?.tax_bps ?? defaults.taxBps)
  const [commission, setCommission] = useState(service?.partner_commission_bps ?? defaults.commissionBps)
  const [margin, setMargin] = useState(service?.desired_margin_bps ?? defaults.marginBps)
  const [inputs, setInputs] = useState<LocalInput[]>(
    initialInputs.map((i) => ({ id: i.id, product_id: i.product_id, quantity_used: i.quantity_used })),
  )
  const [localProducts, setLocalProducts] = useState<ProductRow[]>(products)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout>>()
  const idRef = useRef<string | null>(service?.id ?? null)
  const creatingRef = useRef<Promise<string> | null>(null)

  // Cria a linha do serviço só quando o usuário realmente começa a preencher,
  // evitando rascunhos vazios ao abrir "Novo" e voltar.
  async function ensureId(): Promise<string> {
    if (idRef.current) return idRef.current
    if (creatingRef.current) return creatingRef.current
    creatingRef.current = (async () => {
      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: userId,
          name: name.trim(),
          duration_minutes: duration,
          additional_cost_cents: additional,
          card_fee_bps: cardFee,
          tax_bps: tax,
          partner_commission_bps: commission,
          desired_margin_bps: margin,
          status: 'draft',
        })
        .select('id')
        .single()
      if (error || !data) throw error ?? new Error('insert falhou')
      idRef.current = data.id
      window.history.replaceState(null, '', `/servicos/${data.id}`)
      return data.id
    })()
    return creatingRef.current
  }

  const productMap = useMemo(() => new Map(localProducts.map((p) => [p.id, p])), [localProducts])

  const inputsCostCents = useMemo(
    () =>
      inputs.reduce((sum, i) => {
        const p = productMap.get(i.product_id)
        if (!p) return sum
        return sum + calculateServiceInputCost(toProduct(p), i.quantity_used)
      }, 0),
    [inputs, productMap],
  )

  const pricing = useMemo(
    () =>
      calculatePricing({
        durationMinutes: duration,
        hourlyBusinessCostCents: hourlyCostCents ?? 0,
        inputsCostCents,
        additionalCostCents: additional,
        cardFeeBps: cardFee,
        taxBps: tax,
        partnerCommissionBps: commission,
        desiredMarginBps: margin,
      }),
    [duration, hourlyCostCents, inputsCostCents, additional, cardFee, tax, commission, margin],
  )

  // Autosave dos campos do serviço (debounce ~700ms).
  function persistFields(patch: Partial<ServiceRow>) {
    setSaveState('saving')
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      try {
        const id = await ensureId()
        const { error } = await supabase.from('services').update(patch).eq('id', id)
        if (error) return setSaveState('error')
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 1400)
      } catch {
        setSaveState('error')
      }
    }, 700)
  }

  const marginStatus = pricing.profitCents < 0 ? 'prejuízo' : pricing.effectiveMarginBps < 1500 ? 'atenção' : 'saudável'

  async function saveService() {
    if (!name.trim()) {
      setStep(0)
      return
    }
    setSaving(true)
    const snapshot = {
      baseCostCents: pricing.baseCostCents,
      suggestedPriceCents: pricing.suggestedPriceCents,
      minimumPriceCents: pricing.minimumPriceCents,
      cardFeeCents: pricing.cardFeeCents,
      taxCents: pricing.taxCents,
      commissionCents: pricing.commissionCents,
      profitCents: pricing.profitCents,
      inputsCostCents,
      calculatedAt: new Date().toISOString(),
    }
    let error: unknown = null
    try {
      const id = await ensureId()
      const res = await supabase
        .from('services')
        .update({
          name: name.trim(),
          duration_minutes: duration,
          additional_cost_cents: additional,
          card_fee_bps: cardFee,
          tax_bps: tax,
          partner_commission_bps: commission,
          desired_margin_bps: margin,
          base_cost_cents: pricing.baseCostCents,
          suggested_price_cents: pricing.suggestedPriceCents,
          saved_price_cents: pricing.suggestedPriceCents,
          result_snapshot_json: snapshot,
          status: 'active',
        })
        .eq('id', id)
      error = res.error
    } catch (e) {
      error = e
    }
    setSaving(false)
    if (!error) {
      router.push('/servicos')
      router.refresh()
    }
  }

  return (
    <main>
      <AppHeader
        back
        title={isNew ? 'Novo serviço' : name || 'Serviço'}
        right={<SaveStatus state={saveState} onRetry={() => persistFields({ name })} />}
      />

      <div className="px-5 pt-4 pb-1">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="px-5 pt-6">
        {step === 0 && (
          <div className="space-y-4">
            <Input
              autoFocus
              label="Nome do serviço"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                persistFields({ name: e.target.value })
              }}
              placeholder="Ex.: Design de sobrancelhas"
            />
            <DurationField
              label="Duração"
              valueMinutes={duration}
              onChangeMinutes={(v) => {
                setDuration(v)
                persistFields({ duration_minutes: v })
              }}
              hint="Formato horas : minutos (ex.: 01:30 = 1h30)"
            />
            <MoneyField
              label="Custos adicionais fixos (opcional)"
              valueCents={additional}
              onChangeCents={(c) => {
                setAdditional(c)
                persistFields({ additional_cost_cents: c })
              }}
              hint="Descartáveis, embalagem do atendimento, etc."
            />
            {hourlyCostCents == null && (
              <Card className="flex items-start gap-2 border-attention/40 bg-attention/5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-attention" />
                <p className="text-[13px] text-muted">
                  Configure dias e horas em <Link href="/negocio" className="font-medium text-gold">Meu negócio</Link> para
                  incluir o custo da hora no preço.
                </p>
              </Card>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div>
              <h2 className="text-[16px] font-semibold">Insumos utilizados</h2>
              <p className="text-[13px] text-muted">Adicione os produtos que você usa neste serviço.</p>
            </div>
            <Button fullWidth variant="outline" onClick={() => setSheetOpen(true)}>
              <Plus className="h-5 w-5" /> Adicionar insumo
            </Button>

            {inputs.length === 0 ? (
              <Card className="flex items-start gap-2 border-attention/40 bg-attention/5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-attention" />
                <p className="text-[13px] text-muted">Sem insumos o custo considera apenas o tempo. Você pode seguir assim.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {inputs.map((i) => {
                  const p = productMap.get(i.product_id)
                  if (!p) return null
                  const unit = roundCents(calculateProductUnitCost(toProduct(p)))
                  const cost = calculateServiceInputCost(toProduct(p), i.quantity_used)
                  return (
                    <Card key={i.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gold" />
                          <span className="text-[14px] font-medium">{p.name}</span>
                        </div>
                        <button onClick={() => removeInput(i)} className="text-subtle hover:text-danger" aria-label="Remover">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <div className="w-28">
                          <label className="label">Qtd usada ({p.unit})</label>
                          <input
                            className="field"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={0}
                            value={i.quantity_used || ''}
                            onChange={(e) => updateInputQty(i, Number(e.target.value))}
                          />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[12px] text-subtle">custo/{p.unit} {formatCents(unit)}</p>
                          <p className="text-[16px] font-semibold">{formatCents(cost)}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
                <div className="flex items-center justify-between rounded-card bg-surface px-4 py-3">
                  <span className="text-[13px] text-muted">Total de insumos</span>
                  <span className="text-[15px] font-bold">{formatCents(inputsCostCents)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[16px] font-semibold">Taxas, impostos e margem</h2>
              <p className="text-[13px] text-muted">Percentuais aplicados sobre o preço final.</p>
            </div>
            <PercentField label="Taxa da maquininha" valueBps={cardFee} onChangeBps={(b) => { setCardFee(b); persistFields({ card_fee_bps: b }) }} />
            <PercentField label="Impostos" valueBps={tax} onChangeBps={(b) => { setTax(b); persistFields({ tax_bps: b }) }} />
            <PercentField label="Comissão de parceiro (opcional)" valueBps={commission} onChangeBps={(b) => { setCommission(b); persistFields({ partner_commission_bps: b }) }} />
            <PercentField label="Margem de lucro desejada" valueBps={margin} onChangeBps={(b) => { setMargin(b); persistFields({ desired_margin_bps: b }) }} />
            {pricing.warnings.length > 0 && (
              <Card className="flex items-start gap-2 border-danger/40 bg-danger/5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <p className="text-[13px] text-danger">{pricing.warnings[0]}</p>
              </Card>
            )}
          </div>
        )}

        {step === 3 && (
          <ResultView
            pricing={pricing}
            inputsCostCents={inputsCostCents}
            hourlyCostCents={hourlyCostCents}
            duration={duration}
            additional={additional}
            taxBps={tax}
            marginStatus={marginStatus}
          />
        )}
      </div>

      {/* Navegação do wizard */}
      <div className="fixed inset-x-0 bottom-[calc(80px_+_env(safe-area-inset-bottom,0px))] z-30 mx-auto max-w-app border-t border-line bg-bg/95 px-5 py-3 backdrop-blur">
        <div className="flex gap-3">
          {step > 0 ? (
            <Button variant="outline" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              Voltar
            </Button>
          ) : (
            <Link href="/servicos" className="flex-1">
              <Button variant="outline" fullWidth>
                Cancelar
              </Button>
            </Link>
          )}
          {step < 3 ? (
            <Button className="flex-1" onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !name.trim()}>
              Continuar
            </Button>
          ) : (
            <Button className="flex-1" onClick={saveService} loading={saving} disabled={!pricing.ok}>
              Salvar serviço
            </Button>
          )}
        </div>
      </div>
      <div className="h-24" />

      <AddInputSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        products={localProducts}
        onAddProduct={(p) => setLocalProducts((prev) => [p, ...prev])}
        onAdd={addInput}
      />
    </main>
  )

  async function addInput(productId: string, qty: number) {
    setSheetOpen(false)
    const id = await ensureId()
    const { data } = await supabase
      .from('service_inputs')
      .insert({ service_id: id, product_id: productId, quantity_used: qty })
      .select()
      .single()
    if (data) setInputs((prev) => [...prev, { id: data.id, product_id: productId, quantity_used: qty }])
  }

  async function updateInputQty(input: LocalInput, qty: number) {
    setInputs((prev) => prev.map((x) => (x.id === input.id ? { ...x, quantity_used: qty } : x)))
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      supabase.from('service_inputs').update({ quantity_used: qty }).eq('id', input.id)
    }, 600)
  }

  async function removeInput(input: LocalInput) {
    setInputs((prev) => prev.filter((x) => x.id !== input.id))
    await supabase.from('service_inputs').delete().eq('id', input.id)
  }
}

function ResultView({
  pricing,
  inputsCostCents,
  hourlyCostCents,
  duration,
  additional,
  taxBps,
  marginStatus,
}: {
  pricing: ReturnType<typeof calculatePricing>
  inputsCostCents: number
  hourlyCostCents: number | null
  duration: number
  additional: number
  taxBps: number
  marginStatus: string
}) {
  const timeCost = roundCents((hourlyCostCents ?? 0) * (duration / 60))
  if (!pricing.ok) {
    return (
      <Card className="flex items-start gap-2 border-danger/40 bg-danger/5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p className="text-[13px] text-danger">{pricing.warnings[0] ?? 'Ajuste os dados para calcular o preço.'}</p>
      </Card>
    )
  }
  const tone = marginStatus === 'prejuízo' ? 'danger' : marginStatus === 'atenção' ? 'attention' : 'success'
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center py-4">
        <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-pill bg-champagne text-gold">
          <Star className="h-8 w-8" fill="currentColor" />
        </span>
        <p className="text-[13px] text-muted">Seu preço sugerido</p>
        <p className="text-[40px] font-bold leading-none">{formatCents(pricing.suggestedPriceCents)}</p>
        <div className="mt-3">
          <Badge tone={tone as 'success' | 'attention' | 'danger'}>
            Margem de lucro: {formatBps(pricing.effectiveMarginBps)}
          </Badge>
        </div>
      </div>

      <Card className="divide-y divide-line">
        <BreakdownRow label="Custo do negócio (tempo)" value={formatCents(timeCost)} />
        <BreakdownRow label="Custo dos insumos" value={formatCents(inputsCostCents)} />
        {additional > 0 && <BreakdownRow label="Custos adicionais" value={formatCents(additional)} />}
        <BreakdownRow label="Taxa da maquininha" value={formatCents(pricing.cardFeeCents)} />
        <BreakdownRow label={`Impostos (${formatBps(taxBps)})`} value={formatCents(pricing.taxCents)} />
        {pricing.commissionCents > 0 && <BreakdownRow label="Comissão" value={formatCents(pricing.commissionCents)} />}
        <div className="flex items-center justify-between pt-3">
          <span className="text-[14px] font-medium">Lucro</span>
          <span className="text-[18px] font-bold text-gold">{formatCents(pricing.profitCents)}</span>
        </div>
      </Card>

      <div className="flex items-center justify-between rounded-card bg-surface px-4 py-3 text-[13px] text-muted">
        <span>Preço mínimo (sem prejuízo)</span>
        <span className="font-semibold text-ink">{formatCents(pricing.minimumPriceCents)}</span>
      </div>
    </div>
  )
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 first:pt-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[14px] font-medium">{value}</span>
    </div>
  )
}

function AddInputSheet({
  open,
  onClose,
  products,
  onAdd,
  onAddProduct,
}: {
  open: boolean
  onClose: () => void
  products: ProductRow[]
  onAdd: (productId: string, qty: number) => void
  onAddProduct: (p: ProductRow) => void
}) {
  const supabase = createClient()
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState(0)
  const [creating, setCreating] = useState(false)
  const [newProd, setNewProd] = useState({ name: '', price: 0, qty: 1, unit: 'g', waste: 0 })

  const selected = products.find((p) => p.id === productId)

  async function createProduct() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !newProd.name.trim()) return
    const { data } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: newProd.name.trim(),
        package_price_cents: newProd.price,
        package_quantity: newProd.qty,
        unit: newProd.unit,
        waste_bps: newProd.waste,
      })
      .select()
      .single()
    if (data) {
      onAddProduct(data)
      setProductId(data.id)
      setCreating(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={creating ? 'Novo insumo' : 'Adicionar insumo'}>
      {creating ? (
        <div className="space-y-3">
          <Input label="Nome" autoFocus value={newProd.name} onChange={(e) => setNewProd((f) => ({ ...f, name: e.target.value }))} />
          <MoneyField label="Preço da embalagem" valueCents={newProd.price} onChangeCents={(c) => setNewProd((f) => ({ ...f, price: c }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Rendimento" type="number" step="any" value={newProd.qty || ''} onChange={(e) => setNewProd((f) => ({ ...f, qty: Number(e.target.value) }))} />
            <Input label="Unidade" value={newProd.unit} onChange={(e) => setNewProd((f) => ({ ...f, unit: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setCreating(false)}>
              Voltar
            </Button>
            <Button className="flex-1" onClick={createProduct}>
              Criar insumo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="text-[13px] text-muted">Você ainda não tem insumos cadastrados.</p>
          ) : (
            <div className="max-h-52 space-y-1.5 overflow-y-auto">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProductId(p.id)}
                  className={`flex w-full items-center justify-between rounded-btn border px-3 py-2.5 text-left text-[14px] ${
                    productId === p.id ? 'border-ink bg-surface' : 'border-line'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[12px] text-muted">{p.package_quantity} {p.unit}</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setCreating(true)} className="text-[13px] font-medium text-gold">
            + Criar novo insumo
          </button>
          {selected && (
            <Input
              label={`Quantidade usada (${selected.unit})`}
              type="number"
              step="any"
              autoFocus
              value={qty || ''}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          )}
          <Button fullWidth size="lg" disabled={!productId || qty <= 0} onClick={() => onAdd(productId, qty)}>
            Adicionar
          </Button>
        </div>
      )}
    </BottomSheet>
  )
}
