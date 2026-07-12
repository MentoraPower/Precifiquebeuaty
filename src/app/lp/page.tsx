import type { Metadata } from 'next'
import {
  Clock,
  Scissors,
  Package,
  LineChart,
  Wallet,
  MessagesSquare,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Precifica Beauty, o preço certo de cada serviço, com lucro',
  description:
    'App para profissionais da beleza calcularem o custo real da hora, o preço ideal de cada serviço e a viabilidade das promoções. Sem achismo.',
}

// Troque pelo link de checkout da Hubla quando tiver.
const CHECKOUT_URL = process.env.NEXT_PUBLIC_CHECKOUT_URL || '#planos'

const SCREENS = [
  { src: '/lp/screen-home.webp', alt: 'Tela inicial com o custo da hora' },
  { src: '/lp/screen-servicos.webp', alt: 'Lista de serviços precificados' },
  { src: '/lp/screen-acoes.webp', alt: 'Menu rápido de cadastro' },
  { src: '/lp/screen-simulacoes.webp', alt: 'Simulações de cenários' },
  { src: '/lp/screen-menu.webp', alt: 'Menu e configurações do negócio' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-14 md:grid-cols-2 md:gap-8 md:pb-24 md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-pill border border-brown/15 bg-bg px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-brown">
              App para profissionais da beleza
            </span>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.08] md:text-[46px]">
              Descubra o preço certo de cada serviço, e pare de trabalhar no vermelho.
            </h1>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-muted md:text-[17px]">
              O Precifica Beauty calcula o custo real da sua hora, o preço ideal com o lucro que você quer e mostra na
              hora se aquela promoção fecha a conta. Tudo no seu celular.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={CHECKOUT_URL}
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-brown px-7 py-4 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(44,30,22,0.7)] transition hover:brightness-110"
              >
                Quero precificar com lucro <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#como-funciona" className="text-center text-[14px] font-semibold text-brown underline-offset-4 hover:underline">
                Ver como funciona
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
              <Trust icon={Zap} label="Acesso imediato" />
              <Trust icon={Lock} label="Compra segura" />
              <Trust icon={ShieldCheck} label="Garantia de 7 dias" />
            </div>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <Phone src={SCREENS[0].src} alt={SCREENS[0].alt} />
          </div>
        </div>
      </header>

      {/* ===== PROBLEMA ===== */}
      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">
            Se você cobra “no olho”, provavelmente está deixando dinheiro na mesa.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            A maioria das profissionais define preço olhando a concorrente ou chutando um número que “parece justo”. Aí
            no fim do mês o caixa não bate, e ninguém entende por quê. Reconhece alguma dessas?
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Copiar o preço da concorrente sem saber o custo dela',
              'Não fazer ideia de quanto custa a sua hora de trabalho',
              'Dar desconto que, no fim, come todo o lucro',
              'Nunca separar o seu pró-labore do dinheiro do negócio',
              'Montar combo e acabar saindo no prejuízo',
              'Ter medo de aumentar o preço e perder cliente',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-danger/12 text-[12px] font-bold text-danger">
                  ✕
                </span>
                <span className="text-[14px] leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== SOLUÇÃO ===== */}
      <section id="como-funciona" className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1">
            <Phone src={SCREENS[1].src} alt={SCREENS[1].alt} />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[13px] font-bold uppercase tracking-wide text-brown">A solução</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">
              Um cálculo feito pra realidade do salão, não pra planilha complicada.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Você cadastra seus custos uma vez e o app faz o resto. Ele considera custos fixos, os insumos que cada
              serviço realmente gasta, a taxa da maquininha, impostos, comissão de parceiro e a margem de lucro que
              você definir, e devolve o preço ideal, redondo, pronto pra cobrar.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Custo da sua hora calculado automaticamente',
                'Preço sugerido com o lucro que você escolhe',
                'Insumos vinculados a cada serviço, sem retrabalho',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-pill bg-brown text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== TRANSFORMAÇÃO ===== */}
      <section className="bg-ink py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">O que muda quando você precifica certo</h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/60">
            Não é sobre cobrar mais caro. É sobre cobrar o que faz sentido, com clareza e segurança pra crescer.
          </p>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {[
              'Você sabe, em segundos, se um serviço dá lucro ou prejuízo',
              'Consegue dar desconto sem se enganar sobre o resultado',
              'Para de subsidiar cliente com o próprio bolso',
              'Aumenta o preço com argumento, não com medo',
              'Enxerga quanto o negócio precisa faturar pra fechar no azul',
              'Decide campanhas e combos com número, não com achismo',
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-gold text-ink">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-[15px] leading-snug text-white/90">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARA QUEM ===== */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">Feito pra quem vive da beleza</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Cabeleireiras', 'Corte, coloração, escova, tratamentos'],
              ['Manicures e nail designers', 'Alongamento, blindagem, esmaltação'],
              ['Designers de sobrancelha', 'Design, henna, laminação'],
              ['Lash designers', 'Volume, fio a fio, retoques'],
              ['Esteticistas', 'Limpeza de pele, procedimentos corporais'],
              ['Estúdios e salões', 'Vários profissionais, um preço certo'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-line bg-bg p-5">
                <p className="text-[16px] font-bold">{title}</p>
                <p className="mt-1 text-[13px] text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RECURSOS ===== */}
      <section className="bg-bg py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">Tudo o que você precisa num app só</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Simples de usar no dia a dia, completo o suficiente pra cuidar do seu negócio inteiro.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Feature icon={Clock} title="Custo da sua hora" desc="O app calcula quanto vale cada hora do seu trabalho, considerando pró-labore, dias e horas trabalhadas." />
            <Feature icon={Scissors} title="Preço por serviço" desc="Preço ideal com a margem que você quer, já com maquininha, impostos e comissão embutidos." />
            <Feature icon={Package} title="Insumos por serviço" desc="Cadastre o que cada atendimento gasta de produto e veja o custo real, sem achismo." />
            <Feature icon={LineChart} title="Simulações" desc="Teste campanha, desconto, meta de faturamento e combos antes de decidir." />
            <Feature icon={Wallet} title="Custos e investimentos" desc="Controle despesas fixas, variáveis e a depreciação dos seus equipamentos." />
            <Feature icon={MessagesSquare} title="Comunidade" desc="Conteúdos e novidades exclusivas, direto no app, em tempo real." />
          </div>
        </div>
      </section>

      {/* ===== SHOWCASE DE TELAS ===== */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">Veja por dentro</h2>
          <div className="no-scrollbar mt-10 flex snap-x gap-6 overflow-x-auto px-1 pb-4 md:justify-center">
            {SCREENS.map((s) => (
              <div key={s.src} className="snap-center">
                <Phone src={s.src} alt={s.alt} small />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLANOS ===== */}
      <section id="planos" className="bg-ink py-16 text-white md:py-24">
        <div className="mx-auto max-w-md px-6 text-center">
          <h2 className="text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">Um plano, tudo liberado</h2>
          <p className="mt-3 text-[15px] text-white/60">
            Menos do que você perde em um único serviço mal precificado.
          </p>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-left">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-gold">Plano anual</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[15px] text-white/50 line-through">R$ 497</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-[44px] font-bold leading-none">R$ 297</span>
              <span className="mb-1.5 text-[14px] text-white/60">/ano</span>
            </div>
            <p className="mt-1 text-[13px] text-white/50">ou 12x de R$ 29,70</p>

            <ul className="mt-6 space-y-2.5">
              {[
                'Todas as ferramentas de precificação',
                'Simulações de campanhas e combos',
                'Custos, insumos e investimentos',
                'Comunidade com conteúdos exclusivos',
                'Atualizações incluídas durante o plano',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-[14px] text-white/85">
                  <Check className="h-4 w-4 shrink-0 text-gold" /> {t}
                </li>
              ))}
            </ul>

            <a
              href={CHECKOUT_URL}
              className="mt-8 flex items-center justify-center gap-2 rounded-pill bg-gold px-6 py-4 text-[15px] font-bold text-ink transition hover:brightness-105"
            >
              Começar agora <ArrowRight className="h-4 w-4" />
            </a>
            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12px] text-white/50">
              <Trust icon={Zap} label="Acesso imediato" light />
              <Trust icon={Lock} label="Compra segura" light />
            </div>
          </div>
        </div>
      </section>

      {/* ===== GARANTIA ===== */}
      <section className="py-16 md:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brown/10 text-brown">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <h2 className="text-[26px] font-semibold leading-tight [text-wrap:balance] md:text-[30px]">Risco zero por 7 dias</h2>
          <p className="max-w-[520px] text-[16px] leading-relaxed text-muted">
            Use o app, precifique seus serviços e veja o resultado. Se nos primeiros 7 dias você achar que não é pra
            você, devolvemos 100% do valor. Sem letras miúdas.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-bg py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {[
              [
                'Preciso instalar alguma coisa?',
                'Não. O Precifica Beauty roda direto no navegador do celular e ainda pode ser adicionado à tela inicial, funcionando como um app. É feito para uso no celular.',
              ],
              [
                'Serve pro meu tipo de serviço?',
                'Sim. Você cadastra seus próprios serviços, custos e insumos, funciona para sobrancelha, cílios, unhas, cabelo, estética e qualquer procedimento de beleza.',
              ],
              [
                'Sou iniciante e me perco com números. Vou conseguir usar?',
                'Vai. Você responde informações simples do seu dia a dia e o app faz todos os cálculos. Nada de fórmula ou planilha complicada.',
              ],
              [
                'Como funciona o pagamento?',
                'É um plano anual com acesso imediato após a confirmação. Você pode pagar à vista ou parcelar, e tem 7 dias de garantia.',
              ],
              [
                'Meus dados ficam separados dos de outras pessoas?',
                'Sim. Cada conta enxerga apenas os próprios serviços, custos e simulações. Seus números são só seus.',
              ],
            ].map(([q, a]) => (
              <details key={q} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="shrink-0 text-brown transition group-open:rotate-45">＋</span>
                </summary>
                <p className="pb-4 text-[14px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-[30px] font-semibold leading-tight [text-wrap:balance] md:text-[36px]">
            Chega de cobrar no escuro.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-relaxed text-muted">
            Comece hoje a cobrar o preço certo, com lucro, clareza e segurança pra crescer.
          </p>
          <a
            href={CHECKOUT_URL}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-pill bg-brown px-8 py-4 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(44,30,22,0.7)] transition hover:brightness-110"
          >
            Quero começar agora <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ===== RODAPÉ ===== */}
      <footer className="border-t border-line py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-[12px] text-subtle">
          © {new Date().getFullYear()} Precifica Beauty · Feito para profissionais da beleza.
        </div>
      </footer>
    </div>
  )
}

function Trust({ icon: Icon, label, light }: { icon: typeof Zap; label: string; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className={`h-4 w-4 ${light ? 'text-gold' : 'text-brown'}`} />
      {label}
    </span>
  )
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Clock; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brown text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-[17px] font-bold">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{desc}</p>
    </div>
  )
}

function Phone({ src, alt, small }: { src: string; alt: string; small?: boolean }) {
  return (
    <div className={`shrink-0 ${small ? 'w-[210px]' : 'w-[260px]'}`}>
      <div className="overflow-hidden rounded-[38px] border-[7px] border-ink bg-ink shadow-[0_24px_60px_-24px_rgba(17,17,17,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="block w-full" />
      </div>
    </div>
  )
}
