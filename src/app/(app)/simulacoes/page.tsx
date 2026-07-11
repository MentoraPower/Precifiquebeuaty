import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { SimulacoesClient, type SimItem } from './SimulacoesClient'

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

  const items: SimItem[] = [
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
      <AppHeader center title="Simulações" subtitle="Compare cenários e encontre o melhor resultado." />
      <div className="px-5 pt-3">
        <Link href="/simulacoes/novo">
          <Button fullWidth variant="outline" size="lg">
            <Plus className="h-5 w-5" /> Nova simulação
          </Button>
        </Link>
      </div>

      <SimulacoesClient initial={items} />
    </main>
  )
}
