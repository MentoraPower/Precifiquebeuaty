import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCents, formatDateBR } from '@/lib/format'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Badge, EmptyState } from '@/components/ui/misc'
import { Plus, LineChart, Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  campaign: 'Campanha',
  combo: 'Combo',
  revenue_goal: 'Meta de faturamento',
  discount: 'Desconto',
  price_increase: 'Aumento de preço',
  time_reduction: 'Redução de tempo',
}

// Tela 10 — Simulações (inclui campanhas).
export default async function SimulacoesPage() {
  const supabase = createClient()
  const [{ data: sims }, { data: campaigns }] = await Promise.all([
    supabase.from('simulations').select('*').order('created_at', { ascending: false }),
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
  ])

  type Item = {
    id: string
    kind: 'sim' | 'campaign'
    title: string
    typeLabel: string
    date: string
    value: number | null
    status?: string
    href: string
  }

  const items: Item[] = [
    ...(campaigns ?? []).map((c) => {
      const snap = (c.result_snapshot_json ?? {}) as { campaignProfitCents?: number }
      return {
        id: c.id,
        kind: 'campaign' as const,
        title: c.name,
        typeLabel: 'Campanha',
        date: c.created_at,
        value: snap.campaignProfitCents ?? null,
        status: c.status,
        href: `/simulacoes/campanha/${c.id}`,
      }
    }),
    ...(sims ?? []).map((s) => {
      const res = (s.result_json ?? {}) as { headlineCents?: number }
      return {
        id: s.id,
        kind: 'sim' as const,
        title: s.title,
        typeLabel: TYPE_LABEL[s.type] ?? 'Simulação',
        date: s.created_at,
        value: res.headlineCents ?? null,
        href: `/simulacoes/${s.id}`,
      }
    }),
  ].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <main>
      <AppHeader title="Simulações" subtitle="Compare cenários e encontre o melhor resultado." />
      <div className="px-5 pt-3">
        <Link href="/simulacoes/novo">
          <Button fullWidth variant="outline" size="lg">
            <Plus className="h-5 w-5" /> Nova simulação
          </Button>
        </Link>
      </div>

      <div className="space-y-3.5 px-5 pt-4">
        {items.length === 0 ? (
          <EmptyState
            icon={<LineChart className="h-8 w-8" />}
            title="Nenhuma simulação ainda"
            description="Teste campanhas, descontos, metas e combos antes de decidir."
          />
        ) : (
          items.map((item) => (
            <Link key={item.id} href={item.href}>
              <div className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-champagne text-gold">
                  {item.kind === 'campaign' ? <Megaphone className="h-5 w-5" /> : <LineChart className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-medium">{item.title}</p>
                    {item.status === 'draft' && <Badge tone="gold">rascunho</Badge>}
                  </div>
                  <p className="text-[12px] text-muted">
                    {item.typeLabel} · {formatDateBR(item.date)}
                  </p>
                </div>
                {item.value != null && (
                  <span className={`text-[14px] font-semibold ${item.value < 0 ? 'text-danger' : 'text-ink'}`}>
                    {formatCents(item.value)}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
