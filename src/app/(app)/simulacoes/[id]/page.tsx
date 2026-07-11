import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDateBR } from '@/lib/format'
import { AppHeader } from '@/components/layout/AppHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/misc'
import { Button } from '@/components/ui/Button'
import { DeleteSimulationButton } from './DeleteSimulationButton'

export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  discount: 'Desconto',
  revenue_goal: 'Meta de faturamento',
  price_increase: 'Aumento de preço',
  time_reduction: 'Redução de tempo',
  combo: 'Combo / pacote',
}

// Tela 11 — Detalhe da simulação.
export default async function SimulacaoDetalhePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: sim } = await supabase.from('simulations').select('*').eq('id', params.id).single()
  if (!sim) notFound()

  const result = (sim.result_json ?? {}) as {
    rows?: { label: string; value: string; tone?: string }[]
    status?: string
  }

  return (
    <main>
      <AppHeader back title={sim.title} subtitle={`${TYPE_LABEL[sim.type] ?? 'Simulação'} · ${formatDateBR(sim.created_at)}`} />
      <div className="space-y-4 px-5 pt-3">
        {result.rows && result.rows.length > 0 ? (
          <Card className="divide-y divide-line">
            {result.rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-muted">{r.label}</span>
                <span className={`text-[14px] font-semibold ${r.tone === 'danger' ? 'text-danger' : r.tone === 'gold' ? 'text-gold' : 'text-ink'}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </Card>
        ) : (
          <p className="text-[14px] text-muted">Sem resultado salvo.</p>
        )}

        {result.status && (
          <div className="flex justify-center">
            <Badge tone={result.status === 'ok' ? 'success' : result.status === 'warn' ? 'attention' : 'danger'}>
              {result.status === 'ok' ? 'Saudável' : result.status === 'warn' ? 'Atenção' : 'Prejuízo'}
            </Badge>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/simulacoes/novo" className="flex-1">
            <Button variant="outline" fullWidth>
              Nova simulação
            </Button>
          </Link>
          <DeleteSimulationButton id={sim.id} />
        </div>
      </div>
    </main>
  )
}
