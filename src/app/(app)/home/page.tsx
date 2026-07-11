import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Bell, LayoutGrid, Package, LineChart, Layers, ArrowRight, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { getBusinessContext } from '@/lib/queries'
import { formatCents, formatDateBR } from '@/lib/format'
import { Card, DarkCard } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/misc'

export const dynamic = 'force-dynamic'

// Tela 03 — Home / painel inicial.
export default async function HomePage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarding_completed) redirect('/onboarding')
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Bem-vinda'

  return (
    <main>
      <header className="safe-top flex items-center justify-between px-5 pb-2 pt-5">
        <div>
          <p className="text-[20px] font-bold">Olá, {firstName}</p>
          <p className="text-[13px] text-muted">Tenha controle e aumente seu lucro.</p>
        </div>
        <button className="rounded-pill border border-line bg-bg p-2.5 text-ink" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <Suspense fallback={<HomeSkeleton />}>
        <HomeBody />
      </Suspense>
    </main>
  )
}

// Corpo com os dados pesados — carregado em streaming para o cabeçalho aparecer na hora.
async function HomeBody() {
  const [ctx, counts] = await Promise.all([getBusinessContext(), getCounts()])

  return (
    <div className="space-y-4 px-5 pt-3">
      <Link href="/negocio">
        <DarkCard className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-white/70">Custo da sua hora</p>
            {ctx.hourlyCostCents != null ? (
              <>
                <p className="mt-1 text-[32px] font-bold leading-none">{formatCents(ctx.hourlyCostCents)}</p>
                <p className="mt-1.5 text-[12px] text-white/50">Atualizado em {formatDateBR(ctx.settings?.updated_at)}</p>
              </>
            ) : (
              <p className="mt-2 text-[16px] font-medium text-gold">Configure seu negócio →</p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-white/40" />
        </DarkCard>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard href="/servicos" icon={LayoutGrid} label="Serviços" value={counts.services} caption="cadastrados" />
        <MetricCard href="/negocio/insumos" icon={Package} label="Insumos" value={counts.products} caption="cadastrados" />
        <MetricCard href="/simulacoes" icon={LineChart} label="Simulações" value={counts.simulations} caption="realizadas" />
        <MetricCard href="/simulacoes" icon={Layers} label="Campanhas" value={counts.campaigns} caption="criadas" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Resumo rápido</h2>
          <Link href="/negocio" className="text-[13px] font-medium text-gold">
            Ver tudo
          </Link>
        </div>
        <Card className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-champagne text-gold">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[13px] text-muted">Custo mensal do negócio</p>
            <p className="text-[16px] font-semibold">{formatCents(ctx.monthlyCostCents)}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="space-y-4 px-5 pt-3">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

async function getCounts() {
  const supabase = createClient()
  const [services, products, simulations, campaigns] = await Promise.all([
    supabase.from('services').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('simulations').select('id', { count: 'exact', head: true }),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
  ])
  return {
    services: services.count ?? 0,
    products: products.count ?? 0,
    simulations: simulations.count ?? 0,
    campaigns: campaigns.count ?? 0,
  }
}

function MetricCard({
  href,
  icon: Icon,
  label,
  value,
  caption,
}: {
  href: string
  icon: typeof LayoutGrid
  label: string
  value: number
  caption: string
}) {
  return (
    <Link href={href}>
      <Card className="h-full">
        <Icon className="h-5 w-5 text-gold" strokeWidth={1.8} />
        <p className="mt-3 text-[13px] text-muted">{label}</p>
        <p className="text-[24px] font-bold leading-tight">{value}</p>
        <p className="text-[12px] text-subtle">{caption}</p>
      </Card>
    </Link>
  )
}
