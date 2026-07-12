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

// Container único: 1.35rem de lateral no mobile, máx. 1280px no desktop.
function Container({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-[1.35rem] md:px-8 ${className}`}>{children}</div>
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden">
        <Container className="pb-12 pt-14 md:pb-16 md:pt-20">
          <div className="max-w-[680px]">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-brown">
              App para profissionais da beleza
            </span>
            <h1 className="mt-4 text-[34px] font-bold leading-[1.08] md:text-[46px]">
              Descubra o preço certo de cada serviço, e pare de trabalhar no vermelho.
            </h1>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-muted md:text-[17px]">
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
            <p className="mt-5 text-[13px] text-muted">Acesso imediato · Compra segura · Garantia de 7 dias</p>
          </div>
        </Container>
      </header>

      {/* ===== PROBLEMA / SINAIS ===== */}
      <section className="bg-[#F0ECE6] py-12 md:py-16">
        <Container>
          <h2 className="mx-auto max-w-[520px] text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">
            Reconhece algum desses sinais no seu negócio?
          </h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-x-12 sm:grid-cols-2 lg:grid-cols-3 [&>div]:flex [&>div]:items-start [&>div]:gap-4 [&>div]:border-b [&>div]:border-ink/10 [&>div]:py-6 [&>div:last-child]:border-b-0 sm:[&>div:nth-last-child(-n+2)]:border-b-0 lg:[&>div:nth-last-child(-n+3)]:border-b-0">
            {[
              'Você cobra copiando a concorrente, sem saber o seu custo real.',
              'Não faz ideia de quanto custa a sua hora de trabalho.',
              'Dá desconto e, no fim do mês, o lucro simplesmente some.',
              'Mistura o dinheiro do negócio com o seu, sem pró-labore definido.',
              'Monta combo ou promoção e acaba saindo no prejuízo.',
              'Tem medo de aumentar o preço e acabar perdendo cliente.',
            ].map((t) => (
              <div key={t}>
                <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-brown" />
                <p className="text-[15px] leading-relaxed text-ink/80">{t}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-[440px] text-center text-[15px] leading-relaxed text-muted">
            Se você se identificou com pelo menos 3 desses sinais, preciso te contar uma coisa importante…
          </p>
        </Container>
      </section>

      {/* ===== SOLUÇÃO ===== */}
      <section id="como-funciona" className="py-12 md:py-16">
        <Container>
          <div className="max-w-[680px]">
            <p className="text-[13px] font-bold uppercase tracking-wide text-brown">A solução</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">
              Um cálculo feito pra realidade do salão, não pra planilha complicada.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Você cadastra seus custos uma vez e o app faz o resto. Ele considera custos fixos, os insumos que cada
              serviço realmente gasta, a taxa da maquininha, impostos, comissão de parceiro e a margem de lucro que
              você definir, e devolve o preço ideal, redondo, pronto pra cobrar.
            </p>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              'Custo da sua hora calculado automaticamente',
              'Preço sugerido com o lucro que você escolhe',
              'Insumos vinculados a cada serviço, sem retrabalho',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl border border-line bg-bg p-4 text-[15px]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-brown text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ===== TRANSFORMAÇÃO ===== */}
      <section className="bg-[#F0ECE6] py-12 md:py-16">
        <Container className="text-center">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-brown">Resultados</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">
            O que muda quando você precifica certo
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted">
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
              <div key={t} className="flex items-start gap-3 rounded-2xl border border-line bg-bg p-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-brown text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-[15px] leading-snug text-ink/80">{t}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== PARA QUEM ===== */}
      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">Feito pra quem vive da beleza</h2>
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
      <section className="bg-[#F0ECE6] py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">Tudo o que você precisa num app só</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">
              Simples de usar no dia a dia, completo o suficiente pra cuidar do seu negócio inteiro.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Feature icon={Clock} title="Custo da sua hora" desc="O app calcula quanto vale cada hora do seu trabalho, considerando pró-labore, dias e horas trabalhadas." />
            <Feature icon={Scissors} title="Preço por serviço" desc="Preço ideal com a margem que você quer, já com maquininha, impostos e comissão embutidos." />
            <Feature icon={Package} title="Insumos por serviço" desc="Cadastre o que cada atendimento gasta de produto e veja o custo real, sem achismo." />
            <Feature icon={LineChart} title="Simulações" desc="Teste campanha, desconto, meta de faturamento e combos antes de decidir." />
            <Feature icon={Wallet} title="Custos e investimentos" desc="Controle despesas fixas, variáveis e a depreciação dos seus equipamentos." />
            <Feature icon={MessagesSquare} title="Comunidade" desc="Conteúdos e novidades exclusivas, direto no app, em tempo real." />
          </div>
        </Container>
      </section>

      {/* ===== PLANOS ===== */}
      <section id="planos" className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <h2 className="text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">Um plano, tudo liberado</h2>
            <p className="mt-3 text-[15px] text-muted">Menos do que você perde em um único serviço mal precificado.</p>

            <div className="mt-8 rounded-[28px] border border-line bg-bg p-8 text-left shadow-[0_16px_40px_-28px_rgba(44,30,22,0.35)]">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-brown">Plano anual</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-[15px] text-subtle line-through">R$ 497</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-[44px] font-bold leading-none">R$ 297</span>
                <span className="mb-1.5 text-[14px] text-muted">/ano</span>
              </div>
              <p className="mt-1 text-[13px] text-subtle">ou 12x de R$ 29,70</p>

              <ul className="mt-6 space-y-2.5">
                {[
                  'Todas as ferramentas de precificação',
                  'Simulações de campanhas e combos',
                  'Custos, insumos e investimentos',
                  'Comunidade com conteúdos exclusivos',
                  'Atualizações incluídas durante o plano',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[14px] text-ink/80">
                    <Check className="h-4 w-4 shrink-0 text-brown" /> {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-pill border border-brown/20 p-1.5">
                <a
                  href={CHECKOUT_URL}
                  className="flex items-center justify-center rounded-pill bg-brown px-6 py-[18px] text-[16px] font-bold text-white transition hover:brightness-110"
                >
                  Começar agora
                </a>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12px] text-muted">
                <Trust icon={Zap} label="Acesso imediato" />
                <Trust icon={Lock} label="Compra segura" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== GARANTIA ===== */}
      <section className="bg-[#F0ECE6] py-12 md:py-16">
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
      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-[28px] font-semibold leading-tight [text-wrap:balance] md:text-[34px]">Perguntas frequentes</h2>
            <div className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-bg">
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
      <section className="bg-[#F0ECE6] py-14 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-[30px] font-semibold leading-tight [text-wrap:balance] md:text-[36px]">Chega de cobrar no escuro.</h2>
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
      <footer className="border-t border-line py-8">
        <Container className="text-center text-[12px] text-subtle">
          © {new Date().getFullYear()} Precifica Beauty · Feito para profissionais da beleza.
        </Container>
      </footer>
    </div>
  )
}

function Trust({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-brown" />
      {label}
    </span>
  )
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Clock; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brown text-white">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-[17px] font-bold">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{desc}</p>
    </div>
  )
}
