'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Boxes } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/format'
import { calculateMonthlyDepreciation } from '@/lib/pricing'
import type { InvestmentRow } from '@/lib/database.types'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { MoneyField } from '@/components/ui/MoneyField'
import { EmptyState, TotalRow } from '@/components/ui/misc'

export function InvestmentsClient({ initial }: { initial: InvestmentRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<InvestmentRow | null>(null)
  const [name, setName] = useState('')
  const [purchase, setPurchase] = useState(0)
  const [life, setLife] = useState(24)
  const [residual, setResidual] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthlyDepreciation = calculateMonthlyDepreciation(
    items.map((i) => ({
      purchaseValueCents: i.purchase_value_cents,
      usefulLifeMonths: i.useful_life_months,
      residualValueCents: i.residual_value_cents,
    })),
  )

  function openNew() {
    setEditing(null)
    setName('')
    setPurchase(0)
    setLife(24)
    setResidual(0)
    setError(null)
    setOpen(true)
  }
  function openEdit(i: InvestmentRow) {
    setEditing(i)
    setName(i.name)
    setPurchase(i.purchase_value_cents)
    setLife(i.useful_life_months)
    setResidual(i.residual_value_cents)
    setError(null)
    setOpen(true)
  }

  async function save() {
    if (!name.trim()) return setError('Informe um nome.')
    if (life <= 0) return setError('A vida útil deve ser maior que zero.')
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return setError('Sessão expirada.')
    }
    const payload = {
      name: name.trim(),
      purchase_value_cents: purchase,
      useful_life_months: life,
      residual_value_cents: residual,
    }
    if (editing) {
      const { data, error } = await supabase.from('investments').update(payload).eq('id', editing.id).select().single()
      if (error) {
        setSaving(false)
        return setError('Erro ao salvar.')
      }
      setItems((p) => p.map((i) => (i.id === editing.id ? data : i)))
    } else {
      const { data, error } = await supabase
        .from('investments')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()
      if (error) {
        setSaving(false)
        return setError('Erro ao salvar.')
      }
      setItems((p) => [...p, data])
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  async function remove(i: InvestmentRow) {
    if (!confirm(`Remover "${i.name}"?`)) return
    setItems((p) => p.filter((x) => x.id !== i.id))
    await supabase.from('investments').delete().eq('id', i.id)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Button fullWidth size="lg" onClick={openNew}>
        <Plus className="h-5 w-5" /> Adicionar investimento
      </Button>

      {items.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-8 w-8" />}
          title="Nenhum investimento"
          description="Ex.: maca, autoclave, cadeira, equipamentos. A depreciação entra no custo da hora."
        />
      ) : (
        <>
          <div className="space-y-3.5">
            {items.map((i) => {
              const dep = calculateMonthlyDepreciation([
                {
                  purchaseValueCents: i.purchase_value_cents,
                  usefulLifeMonths: i.useful_life_months,
                  residualValueCents: i.residual_value_cents,
                },
              ])
              return (
                <div key={i.id} className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5">
                  <button className="flex-1 text-left" onClick={() => openEdit(i)}>
                    <p className="text-[14px] font-medium">{i.name}</p>
                    <p className="text-[12px] text-muted">
                      {formatCents(i.purchase_value_cents)} · {i.useful_life_months} meses · {formatCents(dep)}/mês
                    </p>
                  </button>
                  <button onClick={() => remove(i)} className="text-subtle hover:text-danger" aria-label="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
          <TotalRow label="Depreciação mensal" value={formatCents(monthlyDepreciation)} tone="ink" />
        </>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title={editing ? 'Editar investimento' : 'Novo investimento'}>
        <div className="space-y-4">
          <Input autoFocus label="Nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Autoclave" />
          <MoneyField label="Valor de compra" valueCents={purchase} onChangeCents={setPurchase} />
          <Input
            label="Vida útil (meses)"
            type="number"
            min={1}
            value={life || ''}
            onChange={(e) => setLife(Number(e.target.value))}
            suffix="meses"
          />
          <MoneyField label="Valor residual (opcional)" valueCents={residual} onChangeCents={setResidual} hint="Quanto valeria ao final da vida útil." />
          {error && <p className="text-[13px] text-danger">{error}</p>}
          <Button fullWidth size="lg" loading={saving} onClick={save}>
            Salvar
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
