'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LineChart, Megaphone, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCents, formatDateBR } from '@/lib/format'
import { EmptyState } from '@/components/ui/misc'
import { KebabMenu } from '@/components/ui/KebabMenu'
import { useConfirm } from '@/components/ConfirmProvider'

export interface SimItem {
  id: string
  kind: 'sim' | 'campaign'
  title: string
  typeLabel: string
  date: string
  value: number | null
  status?: string
  href: string
}

export function SimulacoesClient({ initial }: { initial: SimItem[] }) {
  const router = useRouter()
  const supabase = createClient()
  const confirm = useConfirm()
  const [items, setItems] = useState(initial)

  async function remove(item: SimItem) {
    const ok = await confirm({
      title: item.kind === 'campaign' ? 'Excluir campanha' : 'Excluir simulação',
      message: `Deseja excluir "${item.title || 'este item'}"?`,
      confirmLabel: 'Excluir',
      danger: true,
    })
    if (!ok) return
    setItems((prev) => prev.filter((x) => !(x.id === item.id && x.kind === item.kind)))
    const table = item.kind === 'campaign' ? 'campaigns' : 'simulations'
    await supabase.from(table).delete().eq('id', item.id)
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <div className="px-5 pt-4">
        <EmptyState
          icon={<LineChart className="h-8 w-8" />}
          title="Nenhuma simulação ainda"
          description="Teste campanhas, descontos, metas e combos antes de decidir."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-5 pt-4">
      {items.map((item) => (
        <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5">
          <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-champagne text-gold">
              {item.kind === 'campaign' ? <Megaphone className="h-5 w-5" /> : <LineChart className="h-5 w-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-[14px] font-medium">{item.title || 'Sem nome'}</p>
                {item.status === 'draft' && (
                  <span className="shrink-0 rounded-md border border-gold/40 px-1.5 py-0.5 text-[11px] font-medium text-gold">
                    Rascunho
                  </span>
                )}
              </div>
              <p className="text-[12px] text-muted">
                {item.typeLabel} · {formatDateBR(item.date)}
              </p>
            </div>
          </Link>
          {item.value != null && (
            <span className={`shrink-0 text-[14px] font-semibold ${item.value < 0 ? 'text-danger' : 'text-ink'}`}>
              {formatCents(item.value)}
            </span>
          )}
          <KebabMenu
            items={[
              { label: 'Editar', icon: Pencil, onClick: () => router.push(item.href) },
              { label: 'Excluir', icon: Trash2, onClick: () => remove(item), danger: true },
            ]}
          />
        </div>
      ))}
    </div>
  )
}
