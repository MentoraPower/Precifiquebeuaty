import Link from 'next/link'
import { Megaphone, Layers, Target, Percent, TrendingUp, Timer, ChevronRight } from 'lucide-react'
import { AppHeader } from '@/components/layout/AppHeader'
import { Badge } from '@/components/ui/misc'

// Tela 10A — Escolher tipo de simulação.
const TYPES = [
  {
    type: 'campaign',
    icon: Megaphone,
    name: 'Campanha',
    desc: 'Descubra quantas vendas precisa fazer para pagar o investimento.',
    href: '/simulacoes/campanha/novo',
  },
  { type: 'combo', icon: Layers, name: 'Combo / pacote', desc: 'Monte uma oferta sem ultrapassar o desconto saudável.', href: '/simulacoes/novo/combo' },
  { type: 'revenue_goal', icon: Target, name: 'Meta de faturamento', desc: 'Calcule quantos atendimentos precisa realizar.', href: '/simulacoes/novo/revenue_goal' },
  { type: 'discount', icon: Percent, name: 'Desconto', desc: 'Veja até onde pode reduzir o preço sem prejuízo.', href: '/simulacoes/novo/discount' },
  { type: 'price_increase', icon: TrendingUp, name: 'Aumento de preço', desc: 'Compare o impacto mensal de um novo valor.', href: '/simulacoes/novo/price_increase' },
  { type: 'time_reduction', icon: Timer, name: 'Redução de tempo', desc: 'Veja o ganho ao atender em menos tempo.', href: '/simulacoes/novo/time_reduction' },
] as const

export default function NovaSimulacaoPage() {
  return (
    <main>
      <AppHeader back title="Nova simulação" subtitle="Escolha o tipo de análise que deseja realizar." />
      <div className="flex flex-col gap-3 px-5 pt-4">
        {TYPES.map((t) => (
          <Link key={t.type} href={t.href}>
            <div className="flex items-center gap-3 rounded-card border border-line bg-bg px-4 py-3.5 transition hover:border-ink/20">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-brown text-white">
                <t.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold">{t.name}</p>
                  {t.type === 'campaign' && <Badge tone="gold">completo</Badge>}
                </div>
                <p className="text-[12px] leading-snug text-muted">{t.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
