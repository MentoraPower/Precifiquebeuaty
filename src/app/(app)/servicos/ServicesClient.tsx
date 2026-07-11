'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Scissors, Clock, Pencil, Copy, Power, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/format'
import type { ServiceRow } from '@/lib/database.types'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Chip, EmptyState } from '@/components/ui/misc'
import { KebabMenu } from '@/components/ui/KebabMenu'
import { useConfirm } from '@/components/ConfirmProvider'

type Filter = 'all' | 'active' | 'inactive'

export function ServicesClient({ initial }: { initial: ServiceRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = items.filter((s) =>
    filter === 'all' ? true : filter === 'active' ? s.status === 'active' : s.status === 'inactive',
  )

  function displayPrice(s: ServiceRow) {
    return s.saved_price_cents ?? s.suggested_price_cents ?? s.current_price_cents ?? null
  }

  async function toggleStatus(s: ServiceRow) {
    const next = s.status === 'active' ? 'inactive' : 'active'
    setItems((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: next } : x)))
    await supabase.from('services').update({ status: next }).eq('id', s.id)
    router.refresh()
  }

  async function duplicate(s: ServiceRow) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('services')
      .insert({
        user_id: user.id,
        name: `${s.name} (cópia)`,
        duration_minutes: s.duration_minutes,
        additional_cost_cents: s.additional_cost_cents,
        card_fee_bps: s.card_fee_bps,
        tax_bps: s.tax_bps,
        partner_commission_bps: s.partner_commission_bps,
        desired_margin_bps: s.desired_margin_bps,
        status: 'draft',
      })
      .select()
      .single()
    if (data) setItems((p) => [data, ...p])
    router.refresh()
  }

  async function archive(s: ServiceRow) {
    const ok = await confirm({ title: 'Excluir serviço', message: `Deseja excluir "${s.name || 'este serviço'}"?`, confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    setItems((p) => p.filter((x) => x.id !== s.id))
    await supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', s.id)
    router.refresh()
  }

  return (
    <main>
      <AppHeader center title="Serviços" subtitle="Gerencie seus serviços e preços." />

      <div className="flex items-center gap-2 px-5 pb-1 pt-3">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            Todos
          </Chip>
          <Chip active={filter === 'active'} onClick={() => setFilter('active')}>
            Ativos
          </Chip>
          <Chip active={filter === 'inactive'} onClick={() => setFilter('inactive')}>
            Inativos
          </Chip>
        </div>
        <Link href="/servicos/novo" className="shrink-0">
          <Button size="sm">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Scissors className="h-8 w-8" />}
            title={items.length === 0 ? 'Nenhum serviço ainda' : 'Nada neste filtro'}
            description={items.length === 0 ? 'Crie seu primeiro serviço e descubra o preço ideal.' : undefined}
            action={
              items.length === 0 ? (
                <Link href="/servicos/novo">
                  <Button>
                    <Plus className="h-4 w-4" /> Novo serviço
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          filtered.map((s) => {
            const price = displayPrice(s)
            return (
              <div key={s.id} className="flex h-[76px] items-center gap-3 rounded-card border border-line bg-bg px-4">
                <Link href={`/servicos/${s.id}`} className="flex h-full flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-champagne text-gold">
                    <Scissors className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-medium">{s.name || 'Sem nome'}</p>
                      {s.status === 'draft' && <StatusTag label="Rascunho" tone="draft" />}
                      {s.status === 'inactive' && <StatusTag label="Inativo" tone="inactive" />}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted">
                      <Clock className="h-3 w-3" /> {s.duration_minutes} min
                    </p>
                  </div>
                </Link>
                <span className="shrink-0 text-[15px] font-semibold">{price != null ? formatCents(price) : '—'}</span>
                <KebabMenu
                  items={[
                    { label: 'Editar', icon: Pencil, onClick: () => router.push(`/servicos/${s.id}`) },
                    { label: 'Duplicar', icon: Copy, onClick: () => duplicate(s) },
                    { label: s.status === 'active' ? 'Inativar' : 'Ativar', icon: Power, onClick: () => toggleStatus(s) },
                    { label: 'Excluir', icon: Trash2, onClick: () => archive(s), danger: true },
                  ]}
                />
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}

// Etiqueta de status sólida e discreta (sem preenchimento colorido).
function StatusTag({ label, tone }: { label: string; tone: 'draft' | 'inactive' }) {
  return (
    <span
      className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
        tone === 'draft' ? 'border-gold/40 text-gold' : 'border-line text-subtle'
      }`}
    >
      {label}
    </span>
  )
}
