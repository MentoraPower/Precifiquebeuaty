import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowRight, TrendingUp, Scissors, Megaphone, ChevronRight, LayoutGrid, Package, LineChart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser } from '@/lib/supabase/session'
import { getBusinessContext } from '@/lib/queries'
import { formatCents, formatDateBR, initials } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/misc'
import { TopLoadingBar } from '@/components/TopLoadingBar'

export const dynamic = 'force-dynamic'

// Tela 03 — Home / painel inicial.
export default async function HomePage() {
  const supabase = createClient()
  const user = await getSessionUser(supabase)
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarding_completed, avatar_url')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarding_completed) redirect('/onboarding')
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Bem-vinda'

  return (
    <main>
      <header className="safe-top flex items-center justify-between px-5 pb-2 pt-5">
        <h1 className="text-[26px] font-bold leading-tight">Olá, {firstName}</h1>
        <Link href="/menu?profile=1" aria-label="Perfil" className="shrink-0">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={firstName} className="h-12 w-12 rounded-pill object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-ink text-[15px] font-bold text-white">
              {initials(profile?.full_name)}
            </span>
          )}
        </Link>
      </header>

      <Suspense fallback={<HomeSkeleton />}>
        <HomeBody />
      </Suspense>
    </main>
  )
}

async function HomeBody() {
  const [ctx, counts] = await Promise.all([getBusinessContext(), getCounts()])

  return (
    <div className="space-y-7 px-5 pt-4">
      {/* Hero — custo da hora */}
      <Link href="/negocio">
        <div className="relative overflow-hidden rounded-[26px] bg-ink p-6 text-white">
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="rounded-pill bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80">
                Custo da sua hora
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-white/10">
                <ArrowRight className="h-4 w-4 text-white/70" />
              </span>
            </div>
            {ctx.hourlyCostCents != null ? (
              <>
                <p className="mt-5 text-[38px] font-bold leading-none">{formatCents(ctx.hourlyCostCents)}</p>
                <p className="mt-2.5 text-[12px] text-white/45">Atualizado em {formatDateBR(ctx.settings?.updated_at)}</p>
              </>
            ) : (
              <p className="mt-5 text-[17px] font-semibold text-gold">Configure seu negócio →</p>
            )}
          </div>
        </div>
      </Link>

      {/* Números do negócio — stat cards (rolagem horizontal, edge-to-edge) */}
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
        <StatCard href="/servicos" icon={LayoutGrid} value={counts.services} label="serviços" />
        <StatCard href="/negocio/insumos" icon={Package} value={counts.products} label="insumos" />
        <StatCard href="/simulacoes" icon={LineChart} value={counts.simulations} label="simulações" />
        <StatCard href="/simulacoes" icon={Megaphone} value={counts.campaigns} label="campanhas" />
      </div>

      {/* Atalhos */}
      <section>
        <h2 className="mb-3 text-[17px] font-bold">Atalhos</h2>
        <div className="flex flex-col gap-3">
          <ActionCard
            href="/servicos/novo"
            icon={Scissors}
            title="Precificar um serviço"
            subtitle="Descubra o preço ideal com lucro"
          />
          <ActionCard
            href="/simulacoes/campanha/novo"
            icon={Megaphone}
            title="Analisar uma campanha"
            subtitle="Veja se o investimento vale (ROI)"
          />
        </div>
      </section>

      {/* Resumo */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold">Resumo</h2>
          <Link href="/negocio" className="text-[13px] font-medium text-gold">
            Ver tudo
          </Link>
        </div>
        <Card className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-champagne text-gold">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[13px] text-muted">Custo mensal do negócio</p>
            <p className="text-[17px] font-bold">{formatCents(ctx.monthlyCostCents)}</p>
          </div>
        </Card>
      </section>
    </div>
  )
}

function StatCard({
  href,
  icon: Icon,
  value,
  label,
}: {
  href: string
  icon: typeof LayoutGrid
  value: number
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex min-w-[110px] shrink-0 flex-col gap-3 rounded-2xl border border-line bg-bg p-4 transition hover:border-ink/20 active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-champagne text-gold">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="text-[24px] font-bold leading-none">{value}</p>
        <p className="mt-1 text-[12px] text-muted">{label}</p>
      </div>
    </Link>
  )
}

function ActionCard({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string
  icon: typeof Scissors
  title: string
  subtitle: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-[20px] border border-line bg-bg p-4 transition hover:border-ink/20 active:scale-[0.99]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-champagne text-gold">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="text-[12px] text-muted">{subtitle}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
    </Link>
  )
}

function HomeSkeleton() {
  return (
    <div className="space-y-7 px-5 pt-4">
      <TopLoadingBar />
      <Skeleton className="h-32 w-full rounded-[26px]" />
      <div className="flex gap-3">
        <Skeleton className="h-[104px] w-[110px] rounded-2xl" />
        <Skeleton className="h-[104px] w-[110px] rounded-2xl" />
        <Skeleton className="h-[104px] w-[110px] rounded-2xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-[20px]" />
        <Skeleton className="h-20 w-full rounded-[20px]" />
      </div>
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
