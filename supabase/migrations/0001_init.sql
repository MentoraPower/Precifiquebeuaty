-- =====================================================================
-- W Calculadora — schema inicial (Precifica Beauty V4)
-- Dinheiro em centavos inteiros; percentuais em basis points (bps).
-- Isolamento por user_id com Row Level Security em todas as tabelas.
-- =====================================================================

create extension if not exists "pgcrypto";

-- Helper: updated_at automático -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  profession text,
  avatar_url text,
  plan text not null default 'essencial',
  onboarding_started_at timestamptz,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cria profile automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- business_settings (1 por usuário)
-- =====================================================================
create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pro_labore_cents integer not null default 0,
  working_days integer not null default 22,
  working_hours_day integer not null default 8,
  -- taxas padrão copiadas para novos serviços
  default_card_fee_bps integer not null default 0,
  default_tax_bps integer not null default 0,
  default_commission_bps integer not null default 0,
  default_margin_bps integer not null default 5000,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- =====================================================================
-- business_costs
-- =====================================================================
create table if not exists public.business_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('fixed', 'variable')),
  name text not null,
  category text,
  amount_cents integer not null default 0 check (amount_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists business_costs_user_idx on public.business_costs (user_id, type, active);

-- =====================================================================
-- investments
-- =====================================================================
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  purchase_value_cents integer not null default 0 check (purchase_value_cents >= 0),
  useful_life_months integer not null default 12 check (useful_life_months > 0),
  residual_value_cents integer not null default 0 check (residual_value_cents >= 0),
  created_at timestamptz not null default now()
);
create index if not exists investments_user_idx on public.investments (user_id);

-- =====================================================================
-- products (insumos)
-- =====================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  package_price_cents integer not null default 0 check (package_price_cents >= 0),
  package_quantity numeric not null default 1 check (package_quantity > 0),
  unit text not null default 'un',
  waste_bps integer not null default 0 check (waste_bps >= 0 and waste_bps < 10000),
  created_at timestamptz not null default now()
);
create index if not exists products_user_idx on public.products (user_id);

-- =====================================================================
-- services
-- =====================================================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text,
  duration_minutes integer not null default 60 check (duration_minutes >= 0),
  additional_cost_cents integer not null default 0 check (additional_cost_cents >= 0),
  current_price_cents integer,
  suggested_price_cents integer,
  saved_price_cents integer,
  base_cost_cents integer,
  card_fee_bps integer not null default 0,
  tax_bps integer not null default 0,
  partner_commission_bps integer not null default 0,
  desired_margin_bps integer not null default 5000,
  result_snapshot_json jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'inactive')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists services_user_idx on public.services (user_id, status);
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- =====================================================================
-- service_inputs
-- =====================================================================
create table if not exists public.service_inputs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_used numeric not null default 0 check (quantity_used >= 0),
  created_at timestamptz not null default now()
);
create index if not exists service_inputs_service_idx on public.service_inputs (service_id);

-- =====================================================================
-- combos
-- =====================================================================
create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  discount_type text not null default 'percentage' check (discount_type in ('percentage', 'amount')),
  discount_value numeric not null default 0,
  saved_price_cents integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists combos_user_idx on public.combos (user_id);

create table if not exists public.combo_services (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.combos(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0)
);
create index if not exists combo_services_combo_idx on public.combo_services (combo_id);

-- =====================================================================
-- simulations
-- =====================================================================
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('campaign','combo','revenue_goal','discount','price_increase','time_reduction')),
  title text not null,
  payload_json jsonb not null default '{}'::jsonb,
  result_json jsonb,
  created_at timestamptz not null default now()
);
create index if not exists simulations_user_idx on public.simulations (user_id, created_at desc);

-- =====================================================================
-- campaigns (módulo V4)
-- =====================================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  expected_sales integer not null default 0,
  promotional_price_cents integer,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  result_snapshot_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campaigns_user_idx on public.campaigns (user_id, created_at desc);
create trigger campaigns_updated_at before update on public.campaigns
  for each row execute function public.set_updated_at();

create table if not exists public.campaign_expenses (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  category text not null default 'geral',
  amount_cents integer not null default 0 check (amount_cents >= 0),
  created_at timestamptz not null default now()
);
create index if not exists campaign_expenses_idx on public.campaign_expenses (campaign_id);

create table if not exists public.campaign_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  item_type text not null check (item_type in ('service', 'combo')),
  service_id uuid references public.services(id) on delete set null,
  combo_id uuid references public.combos(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  price_snapshot_cents integer not null default 0,
  base_cost_snapshot_cents integer not null default 0,
  fee_snapshot_json jsonb not null default '{}'::jsonb
);
create index if not exists campaign_items_idx on public.campaign_items (campaign_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.business_settings enable row level security;
alter table public.business_costs enable row level security;
alter table public.investments enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.service_inputs enable row level security;
alter table public.combos enable row level security;
alter table public.combo_services enable row level security;
alter table public.simulations enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_expenses enable row level security;
alter table public.campaign_items enable row level security;

-- profiles: dono é a própria linha (id = auth.uid())
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);

-- Macro de políticas por user_id (SELECT/INSERT/UPDATE/DELETE)
do $$
declare t text;
begin
  foreach t in array array[
    'business_settings','business_costs','investments','products',
    'services','combos','simulations','campaigns'
  ] loop
    execute format('create policy %I on public.%I for select using (auth.uid() = user_id);', t||'_select', t);
    execute format('create policy %I on public.%I for insert with check (auth.uid() = user_id);', t||'_insert', t);
    execute format('create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t||'_update', t);
    execute format('create policy %I on public.%I for delete using (auth.uid() = user_id);', t||'_delete', t);
  end loop;
end $$;

-- Tabelas filhas: acesso via propriedade do pai
create policy "service_inputs_all" on public.service_inputs for all
  using (exists (select 1 from public.services s where s.id = service_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.services s where s.id = service_id and s.user_id = auth.uid()));

create policy "combo_services_all" on public.combo_services for all
  using (exists (select 1 from public.combos c where c.id = combo_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.combos c where c.id = combo_id and c.user_id = auth.uid()));

create policy "campaign_expenses_all" on public.campaign_expenses for all
  using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.user_id = auth.uid()));

create policy "campaign_items_all" on public.campaign_items for all
  using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.user_id = auth.uid()));
