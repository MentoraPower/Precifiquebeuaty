'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/format'
import { calculateProductUnitCost } from '@/lib/pricing'
import { roundCents } from '@/lib/pricing/money'
import { toProduct } from '@/lib/mappers'
import type { ProductRow } from '@/lib/database.types'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { MoneyField, PercentField } from '@/components/ui/MoneyField'
import { EmptyState } from '@/components/ui/misc'

export function ProductsClient({ initial }: { initial: ProductRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const params = useSearchParams()
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductRow | null>(null)
  const [form, setForm] = useState({ name: '', price: 0, qty: 1, unit: 'g', waste: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.get('add')) openNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ name: '', price: 0, qty: 1, unit: 'g', waste: 0 })
    setError(null)
    setOpen(true)
  }
  function openEdit(p: ProductRow) {
    setEditing(p)
    setForm({ name: p.name, price: p.package_price_cents, qty: p.package_quantity, unit: p.unit, waste: p.waste_bps })
    setError(null)
    setOpen(true)
  }

  async function save() {
    if (!form.name.trim()) return setError('Informe um nome.')
    if (form.qty <= 0) return setError('A quantidade da embalagem deve ser maior que zero.')
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return setError('Sessão expirada.')
    }
    const payload = {
      name: form.name.trim(),
      package_price_cents: form.price,
      package_quantity: form.qty,
      unit: form.unit,
      waste_bps: form.waste,
    }
    if (editing) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editing.id).select().single()
      if (error) {
        setSaving(false)
        return setError('Erro ao salvar.')
      }
      setItems((p) => p.map((x) => (x.id === editing.id ? data : x)))
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()
      if (error) {
        setSaving(false)
        return setError('Erro ao salvar.')
      }
      setItems((p) => [data, ...p])
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  async function remove(p: ProductRow) {
    if (!confirm(`Remover "${p.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) return alert('Não é possível remover: este insumo está em uso em algum serviço.')
    setItems((prev) => prev.filter((x) => x.id !== p.id))
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Button fullWidth size="lg" onClick={openNew}>
        <Plus className="h-5 w-5" /> Adicionar insumo
      </Button>

      {items.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Nenhum insumo cadastrado"
          description="Cadastre produtos com preço da embalagem e rendimento. Usamos no cálculo por atendimento."
        />
      ) : (
        <div className="space-y-3.5">
          {items.map((p) => {
            const unit = roundCents(calculateProductUnitCost(toProduct(p)))
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5">
                <button className="flex-1 text-left" onClick={() => openEdit(p)}>
                  <p className="text-[14px] font-medium">{p.name}</p>
                  <p className="text-[12px] text-muted">
                    {formatCents(p.package_price_cents)} · {p.package_quantity} {p.unit}
                    {p.waste_bps > 0 && ` · ${p.waste_bps / 100}% desperdício`}
                  </p>
                </button>
                <div className="text-right">
                  <p className="text-[12px] text-subtle">custo/{p.unit}</p>
                  <p className="text-[14px] font-semibold">{formatCents(unit)}</p>
                </div>
                <button onClick={() => remove(p)} className="text-subtle hover:text-danger" aria-label="Remover">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title={editing ? 'Editar insumo' : 'Novo insumo'}>
        <div className="space-y-4">
          <Input
            autoFocus
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex.: Henna para sobrancelhas"
          />
          <MoneyField
            label="Preço da embalagem"
            valueCents={form.price}
            onChangeCents={(c) => setForm((f) => ({ ...f, price: c }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rendimento"
              type="number"
              inputMode="decimal"
              step="any"
              min={0}
              value={form.qty || ''}
              onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
            />
            <Input
              label="Unidade"
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              placeholder="g, ml, un…"
            />
          </div>
          <PercentField
            label="Desperdício (opcional)"
            valueBps={form.waste}
            onChangeBps={(b) => setForm((f) => ({ ...f, waste: b }))}
            hint="Parte que se perde no uso (ex.: 10%)."
          />
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <Button fullWidth size="lg" loading={saving} onClick={save}>
            Salvar
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
