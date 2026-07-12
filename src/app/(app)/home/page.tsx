import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowRight, Wallet, Scissors, Megaphone, ChevronRight, Boxes } from 'lucide-react'
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
      {/* Card preto full-width: saudação + avatar + custo da hora (só a base arredondada) */}
      <section className="relative overflow-hidden rounded-b-[40px] bg-ink text-white shadow-[0_9px_18px_-8px_rgba(17,17,17,0.38)]">
        <div className="pointer-events-none absolute inset-0 bg-[url('/hourly-bg.jpg')] bg-cover bg-center opacity-[0.90]" />
        <div className="relative px-5 pb-5" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 0px) + 16px)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-[24px] font-bold leading-tight">Olá, {firstName}</h1>
            <Link href="/perfil" aria-label="Perfil" className="shrink-0">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={firstName}
                  className="h-11 w-11 rounded-pill object-cover ring-2 ring-white/20"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-white/15 text-[15px] font-bold text-white ring-2 ring-white/20 backdrop-blur-md">
                  {initials(profile?.full_name)}
                </span>
              )}
            </Link>
          </div>

          <Link href="/negocio" className="mt-4 block">
            <Suspense fallback={<HourlySkeleton />}>
              <HourlyValue />
            </Suspense>
          </Link>
        </div>
      </section>

      <Suspense fallback={<HomeSkeleton />}>
        <HomeBody />
      </Suspense>
    </main>
  )
}

async function HourlyValue() {
  const ctx = await getBusinessContext()
  return (
    <div className="flex items-end justify-between">
      <div>
        <span className="rounded-pill bg-white/10 px-3 py-1 text-[12px] font-medium text-white/80">Custo da sua hora</span>
        {ctx.hourlyCostCents != null ? (
          <>
            <p className="mt-4 text-[48px] font-medium leading-none">{formatCents(ctx.hourlyCostCents)}</p>
            <p className="mt-2.5 text-[12px] text-white/45">Atualizado em {formatDateBR(ctx.settings?.updated_at)}</p>
          </>
        ) : (
          <p className="mt-4 text-[17px] font-semibold text-gold">Configure seu negócio →</p>
        )}
      </div>
      <span className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-white/10 backdrop-blur-md">
        <ArrowRight className="h-4 w-4 text-white/70" />
      </span>
    </div>
  )
}

function HourlySkeleton() {
  return (
    <div>
      <div className="h-6 w-32 rounded-pill bg-white/10" />
      <div className="mt-4 h-10 w-48 rounded-xl bg-white/10" />
      <div className="mt-3 h-3 w-28 rounded bg-white/10" />
    </div>
  )
}

async function HomeBody() {
  const [ctx, counts] = await Promise.all([getBusinessContext(), getCounts()])

  return (
    <div className="px-5 pt-6">
      {/* Números do negócio — pills dentro de um fundo translúcido, scroll edge-to-edge */}
      <div className="overflow-hidden rounded-2xl bg-ink/[0.06]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto p-2">
          <StatPill href="/servicos" value={counts.services} label="serviços" />
          <StatPill href="/negocio/insumos" value={counts.products} label="insumos" />
          <StatPill href="/simulacoes" value={counts.simulations} label="simulações" />
          <StatPill href="/simulacoes" value={counts.campaigns} label="campanhas" />
        </div>
      </div>

      {/* Atalhos em 2 colunas */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ActionTile href="/servicos/novo" icon={Scissors} title="Precificar serviço" subtitle="Preço ideal com lucro" />
        <ActionTile href="/simulacoes/campanha/novo" icon={Megaphone} title="Analisar campanha" subtitle="Descubra o ROI" />
      </div>

      {/* Custo mensal */}
      <Link href="/negocio" className="mt-4 block">
        <Card className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-white">
            <Wallet className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-muted">Custo mensal do negócio</p>
            <p className="text-[17px] font-bold">{formatCents(ctx.monthlyCostCents)}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
        </Card>
      </Link>

      {/* Investimentos */}
      <Link href="/negocio/investimentos" className="mt-3 block">
        <Card className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-white">
            <Boxes className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-muted">Investimentos</p>
            <p className="text-[17px] font-bold">{formatCents(ctx.depreciationCents)}/mês</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-subtle" />
        </Card>
      </Link>
    </div>
  )
}

function StatPill({ href, value, label }: { href: string; value: number; label: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-1.5 rounded-pill bg-ink/15 px-4 py-2.5 text-[14px] text-ink backdrop-blur-[9px] transition active:scale-[0.99]"
    >
      <span className="font-bold">{value}</span>
      <span className="text-ink/60">{label}</span>
    </Link>
  )
}

function ActionTile({
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
      className="flex h-full flex-col gap-3 rounded-[20px] border border-line bg-bg p-4 transition hover:border-ink/20 active:scale-[0.99]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-white">
        <Icon className="h-[22px] w-[22px]" />
      </span>
      <div>
        <p className="text-[14px] font-semibold leading-tight">{title}</p>
        <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>
      </div>
    </Link>
  )
}

function HomeSkeleton() {
  return (
    <div className="space-y-4 px-5 pt-6">
      <TopLoadingBar />
      <div className="flex gap-2">
        <Skeleton className="h-11 w-28 rounded-pill" />
        <Skeleton className="h-11 w-28 rounded-pill" />
        <Skeleton className="h-11 w-28 rounded-pill" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-[20px]" />
        <Skeleton className="h-28 rounded-[20px]" />
      </div>
      <Skeleton className="h-[70px] w-full rounded-card" />
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
