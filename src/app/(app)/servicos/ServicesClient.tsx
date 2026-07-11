'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Scissors, MoreVertical, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents } from '@/lib/format'
import type { ServiceRow } from '@/lib/database.types'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Chip, Badge, EmptyState } from '@/components/ui/misc'
import { BottomSheet } from '@/components/ui/BottomSheet'

type Filter = 'all' | 'active' | 'inactive'

export function ServicesClient({ initial }: { initial: ServiceRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<Filter>('all')
  const [menu, setMenu] = useState<ServiceRow | null>(null)

  const filtered = items.filter((s) =>
    filter === 'all' ? true : filter === 'active' ? s.status === 'active' : s.status === 'inactive',
  )

  function displayPrice(s: ServiceRow) {
    return s.saved_price_cents ?? s.suggested_price_cents ?? s.current_price_cents ?? null
  }

  async function toggleStatus(s: ServiceRow) {
    const next = s.status === 'active' ? 'inactive' : 'active'
    setItems((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: next } : x)))
    setMenu(null)
    await supabase.from('services').update({ status: next }).eq('id', s.id)
    router.refresh()
  }

  async function duplicate(s: ServiceRow) {
    setMenu(null)
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
    if (!confirm(`Excluir "${s.name}"?`)) return
    setMenu(null)
    setItems((p) => p.filter((x) => x.id !== s.id))
    await supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', s.id)
    router.refresh()
  }

  return (
    <main>
      <AppHeader
        title="Serviços"
        subtitle="Gerencie seus serviços e preços."
        right={
          <Link href="/servicos/novo">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" /> Novo
            </Button>
          </Link>
        }
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1 pt-3">
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

      <div className="space-y-3.5 px-5 pt-2">
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
              <div key={s.id} className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3">
                <Link href={`/servicos/${s.id}`} className="flex flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-card bg-champagne text-gold">
                    <Scissors className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-medium">{s.name}</p>
                      {s.status === 'draft' && <Badge tone="gold">rascunho</Badge>}
                      {s.status === 'inactive' && <Badge tone="neutral">inativo</Badge>}
                    </div>
                    <p className="flex items-center gap-1 text-[12px] text-muted">
                      <Clock className="h-3 w-3" /> {s.duration_minutes} min
                    </p>
                  </div>
                </Link>
                <span className="text-[15px] font-semibold">{price != null ? formatCents(price) : '—'}</span>
                <button onClick={() => setMenu(s)} className="text-subtle hover:text-ink" aria-label="Opções">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            )
          })
        )}
      </div>

      <BottomSheet open={!!menu} onClose={() => setMenu(null)} title={menu?.name}>
        {menu && (
          <div className="space-y-1">
            <Link href={`/servicos/${menu.id}`} className="block">
              <MenuItem>Editar</MenuItem>
            </Link>
            <button className="w-full" onClick={() => duplicate(menu)}>
              <MenuItem>Duplicar</MenuItem>
            </button>
            <button className="w-full" onClick={() => toggleStatus(menu)}>
              <MenuItem>{menu.status === 'active' ? 'Inativar' : 'Ativar'}</MenuItem>
            </button>
            <button className="w-full" onClick={() => archive(menu)}>
              <MenuItem danger>Excluir</MenuItem>
            </button>
          </div>
        )}
      </BottomSheet>
    </main>
  )
}

function MenuItem({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <div
      className={`rounded-btn px-4 py-3 text-left text-[15px] transition hover:bg-surface ${
        danger ? 'text-danger' : 'text-ink'
      }`}
    >
      {children}
    </div>
  )
}
