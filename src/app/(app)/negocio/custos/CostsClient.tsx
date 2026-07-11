'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Trash2, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/format'
import type { BusinessCostRow } from '@/lib/database.types'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { MoneyField } from '@/components/ui/MoneyField'
import { EmptyState, TotalRow } from '@/components/ui/misc'
import { useConfirm } from '@/components/ConfirmProvider'

export function CostsClient({ type, initial }: { type: 'fixed' | 'variable'; initial: BusinessCostRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()
  const params = useSearchParams()
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BusinessCostRow | null>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // abre o sheet quando vem de atalho ?add=fixed
  useEffect(() => {
    if (params.get('add')) openNew()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = items.reduce((s, i) => s + i.amount_cents, 0)

  function openNew() {
    setEditing(null)
    setName('')
    setAmount(0)
    setError(null)
    setOpen(true)
  }
  function openEdit(item: BusinessCostRow) {
    setEditing(item)
    setName(item.name)
    setAmount(item.amount_cents)
    setError(null)
    setOpen(true)
  }

  async function save() {
    if (!name.trim()) return setError('Informe um nome.')
    if (amount < 0) return setError('Valor inválido.')
    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return setError('Sessão expirada.')
    }
    if (editing) {
      const { data, error } = await supabase
        .from('business_costs')
        .update({ name: name.trim(), amount_cents: amount })
        .eq('id', editing.id)
        .select()
        .single()
      if (error) {
        setSaving(false)
        return setError('Erro ao salvar.')
      }
      setItems((prev) => prev.map((i) => (i.id === editing.id ? data : i)))
    } else {
      const { data, error } = await supabase
        .from('business_costs')
        .insert({ user_id: user.id, type, name: name.trim(), amount_cents: amount })
        .select()
        .single()
      if (error) {
        setSaving(false)
        return setError('Erro ao salvar.')
      }
      setItems((prev) => [...prev, data])
    }
    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  async function remove(item: BusinessCostRow) {
    const ok = await confirm({
      title: 'Remover custo',
      message: `Deseja remover "${item.name}"? Isso recalcula o custo da sua hora.`,
      confirmLabel: 'Remover',
      danger: true,
    })
    if (!ok) return
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    await supabase.from('business_costs').update({ active: false }).eq('id', item.id)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Button fullWidth size="lg" onClick={openNew}>
        <Plus className="h-5 w-5" /> Adicionar custo
      </Button>

      {items.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-8 w-8" />}
          title="Nenhum custo cadastrado"
          description={
            type === 'fixed'
              ? 'Ex.: aluguel, energia, internet, contadora.'
              : 'Ex.: marketing, brindes, café, transporte.'
          }
        />
      ) : (
        <>
          <div className="space-y-3.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5"
              >
                <button className="flex flex-1 items-center gap-3 text-left" onClick={() => openEdit(item)}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-surface text-muted">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <span className="text-[14px] font-medium">{item.name}</span>
                </button>
                <span className="text-[14px] font-semibold">{formatCents(item.amount_cents)}</span>
                <button onClick={() => remove(item)} className="text-subtle hover:text-danger" aria-label="Remover">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <TotalRow label="Total mensal" value={formatCents(total)} tone="ink" />
        </>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title={editing ? 'Editar custo' : 'Novo custo'}>
        <div className="space-y-4">
          <Input
            autoFocus
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'fixed' ? 'Ex.: Aluguel' : 'Ex.: Marketing'}
            error={error && !name.trim() ? error : undefined}
          />
          <MoneyField label="Valor mensal" valueCents={amount} onChangeCents={setAmount} />
          {error && name.trim() && <p className="text-[13px] text-danger">{error}</p>}
          <Button fullWidth size="lg" loading={saving} onClick={save}>
            Salvar
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
