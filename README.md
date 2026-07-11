# W Calculadora

App de precificação e viabilidade financeira para profissionais de beleza — PWA + web.
Baseado na especificação **Precifica Beauty V4** (UI + backend + motor de cálculo integrados).

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Auth + Postgres + RLS) · PWA**.
Fonte: **Instrument Sans**. Tema claro dourado (`#D3A13B`), CTA preto, grid de 8px.

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local   # já preenchido para o projeto atual
npm run dev                         # http://localhost:3000
```

Scripts:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e produção |
| `npm test` | Testes unitários do motor de cálculo (Vitest) |
| `npm run typecheck` | Checagem de tipos |
| `npm run lint` | ESLint (Next) |

## Banco de dados

O schema está em `supabase/migrations/0001_init.sql` — todas as tabelas do spec
(profiles, business_settings, business_costs, investments, products, services,
service_inputs, combos, combo_services, simulations, campaigns, campaign_expenses,
campaign_items) com **RLS por `user_id`** e trigger que cria o `profile` no cadastro.

Já aplicado no projeto Supabase configurado. Para recriar em outro projeto:

```bash
# painel Supabase > SQL Editor > cole o conteúdo de 0001_init.sql > Run
```

> Dinheiro é sempre **centavos inteiros**; percentuais são **basis points** (100% = 10000 bps).
> Confirmação de e-mail está desativada (cadastro entra direto).

## Arquitetura

```
src/
  lib/pricing/        Motor de cálculo central (funções puras + testes) — NUNCA duplicar nos componentes
  lib/supabase/       Clients browser/server + middleware de sessão
  lib/queries.ts      Contexto do negócio (custo da hora) para os server components
  lib/mappers.ts      Row (snake_case) -> contrato do motor (camelCase)
  components/ui/       Design system (Button, Card, BottomSheet, MoneyField, Stepper, ...)
  components/layout/   BottomNav, AppHeader
  app/                 Rotas (App Router)
    page.tsx           Tela 01 — Splash
    auth/              Login / cadastro
    onboarding/        Tela 02 — profissão, pró-labore, dias, horas
    (app)/             Área autenticada (nav inferior fixa)
      home/            Tela 03 — painel (custo da hora, métricas)
      negocio/         Tela 04 — Meu negócio; custos (05/06), investimentos, insumos
      servicos/        Tela 07 — lista; [id] = wizard 08/09 (insumos, custos, resultado)
      simulacoes/      Tela 10 — lista; 10A seletor; campanha 10B/10C; demais tipos
      menu/            Tela 12 — perfil, impostos/taxas padrão, sair
```

## Motor de cálculo

`src/lib/pricing/engine.ts` concentra todas as fórmulas:

- `calculateHourlyBusinessCost` — custo da hora (pró-labore + custos + depreciação) / horas mês
- `calculateProductUnitCost` — custo do insumo com desperdício (waste)
- `calculatePricing` — preço sugerido e mínimo; bloqueia quando taxas + margem ≥ 100%
- `calculateCampaign` — ponto de equilíbrio, lucro previsto e ROI (lucro líquido / investimento)

Cobertos por testes em `engine.test.ts` (custo da hora, desperdício, bloqueio ≥100%,
ponto de equilíbrio, ROI). Rode com `npm test`.

## PWA

`public/manifest.webmanifest` + `public/sw.js` (app-shell offline, registrado em produção).
Instalável no celular; ícones em `public/icons/`.
