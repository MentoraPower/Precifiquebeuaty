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

// Container único: 2rem de lateral no mobile, máx. 1280px no desktop.
function Container({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-[1.35rem] md:px-8 ${className}`}>{children}</div>
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden">
        <Container className="grid items-center gap-12 pb-16 pt-14 md:grid-cols-2 md:gap-8 md:pb-24 md:pt-20">
          <div>
            <span className="text-[13px] font-semibold uppercase tracking-wide text-brown">
              App para profissionais da beleza
            </span>
            <h1 className="mt-4 text-[34px] font-bold leading-[1.08] md:text-[46px]">
              Descubra o preço certo de cada serviço, e pare de trabalhar no vermelho.
            </h1>
            <p className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-muted md:text-[17px]">
              Calcule o custo da sua hora e o preço ideal com lucro, direto no celular.
            </p>
            <div className="mt-8 inline-flex rounded-pill border border-brown/25 p-1.5">
              <a
                href={CHECKOUT_URL}
                className="rounded-pill bg-brown px-10 py-[18px] text-[16px] font-semibold text-white transition hover:brightness-110"
              >
                Quero precificar com lucro
              </a>
            </div>
            <p className="mt-5 text-[13px] text-muted">
              Acesso imediato · Compra segura · Garantia de 7 dias
            </p>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <Phone src={SCREENS[0].src} alt={SCREENS[0].alt} />
          </div>
        </Container>
      </header>

      {/* ===== PROBLEMA ===== */}
      <section className="relative z-10 rounded-b-[40px] bg-surface py-16 shadow-[0_22px_28px_-24px_rgba(44,30,22,0.3)] md:py-20">
        <Container>
          <h2 className="max-w-3xl text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">
            Se você cobra “no olho”, provavelmente está deixando dinheiro na mesa.
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            A maioria das profissionais define preço olhando a concorrente ou chutando um número que “parece justo”. Aí
            no fim do mês o caixa não bate, e ninguém entende por quê. Reconhece alguma dessas?
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </Container>
      </section>

      {/* ===== SOLUÇÃO ===== */}
      <section id="como-funciona" className="bg-[#F0ECE6] py-16 md:py-24">
        <Container className="grid items-center gap-12 md:grid-cols-2">
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
        </Container>
      </section>

      {/* ===== TRANSFORMAÇÃO ===== */}
      <section className="bg-[#F0ECE6] py-10 md:py-16">
        <Container>
          <div className="rounded-[40px] bg-[#705336] px-6 py-16 text-center text-white md:px-14 md:py-20">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-gold">Resultados</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">O que muda quando você precifica certo</h2>
            <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-white/60">
              Não é sobre cobrar mais caro. É sobre cobrar o que faz sentido, com clareza e segurança pra crescer.
            </p>
            <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
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
        </Container>
      </section>

      {/* ===== PARA QUEM ===== */}
      <section className="py-16 md:py-20">
        <Container>
          <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">Feito pra quem vive da beleza</h2>
          <p className="mx-auto mt-3 max-w-[520px] text-center text-[16px] leading-relaxed text-muted">
            Não importa a sua especialidade, se o seu trabalho é deixar o cliente mais bonito, dá pra precificar do jeito
            certo aqui dentro.
          </p>
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
        </Container>
      </section>

      {/* ===== RECURSOS ===== */}
      <section className="py-16 md:py-24">
        <Container>
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
        </Container>
      </section>

      {/* ===== SHOWCASE DE TELAS ===== */}
      <section className="bg-[#F0ECE6] py-16 md:py-24">
        <Container>
          <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[32px]">Veja por dentro</h2>
        </Container>
        {/* full-bleed, vai-e-volta suave centralizado, sem sombra */}
        <div className="mt-10 flex justify-center overflow-hidden">
          <div className="flex w-max gap-5 [animation:sway_44s_ease-in-out_infinite_alternate]">
            {[...SCREENS, ...SCREENS, ...SCREENS, ...SCREENS].map((s, i) => (
              <div key={`${s.src}-${i}`}>
                <Phone src={s.src} alt={s.alt} small shadow={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PLANOS ===== */}
      <section id="planos" className="bg-[#F0ECE6] py-10 md:py-16">
        <Container>
          <div className="rounded-[40px] bg-[#705336] px-6 py-16 text-white md:px-14 md:py-20">
          <div className="mx-auto max-w-md text-center">
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

              <div className="mt-8 rounded-pill border border-white/20 p-1.5">
                <a
                  href={CHECKOUT_URL}
                  className="flex items-center justify-center rounded-pill bg-gold px-6 py-[18px] text-[16px] font-bold text-ink transition hover:brightness-105"
                >
                  Começar agora
                </a>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12px] text-white/50">
                <Trust icon={Zap} label="Acesso imediato" light />
                <Trust icon={Lock} label="Compra segura" light />
              </div>
            </div>
          </div>
          </div>
        </Container>
      </section>

      {/* ===== GARANTIA ===== */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brown/10 text-brown">
              <ShieldCheck className="h-8 w-8" />
            </span>
            <h2 className="text-[26px] font-semibold leading-tight [text-wrap:balance] md:text-[30px]">Risco zero por 7 dias</h2>
            <p className="max-w-[520px] text-[16px] leading-relaxed text-muted">
              Use o app, precifique seus serviços e veja o resultado. Se nos primeiros 7 dias você achar que não é pra
              você, devolvemos 100% do valor. Sem letras miúdas.
            </p>
          </div>
        </Container>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl">
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
        </Container>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="bg-[#F0ECE6] py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[30px] font-semibold leading-tight [text-wrap:balance] md:text-[36px]">
              Chega de cobrar no escuro.
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-relaxed text-muted">
              Comece hoje a cobrar o preço certo, com lucro, clareza e segurança pra crescer.
            </p>
            <div className="mt-8 inline-flex rounded-pill border border-brown/25 p-1.5">
              <a
                href={CHECKOUT_URL}
                className="rounded-pill bg-brown px-10 py-[18px] text-[16px] font-semibold text-white transition hover:brightness-110"
              >
                Quero começar agora
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== RODAPÉ ===== */}
      <footer className="bg-[#F0ECE6] border-t border-line py-8">
        <Container className="text-center text-[12px] text-subtle">
          © {new Date().getFullYear()} Precifica Beauty · Feito para profissionais da beleza.
        </Container>
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

function Phone({ src, alt, small, shadow = true }: { src: string; alt: string; small?: boolean; shadow?: boolean }) {
  return (
    <div className={`shrink-0 ${small ? 'w-[212px]' : 'w-[258px]'}`}>
      <div
        className={`rounded-[42px] bg-gradient-to-b from-[#3a291b] to-[#140f0a] p-[6px] ${
          shadow ? 'shadow-[0_26px_60px_-28px_rgba(44,30,22,0.6)]' : ''
        }`}
      >
        <div className="overflow-hidden rounded-[36px] bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} loading="lazy" className="block w-full" />
        </div>
      </div>
    </div>
  )
}
