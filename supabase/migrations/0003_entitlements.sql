-- Liberação de uso por compra (Hubla): webhook grava aqui e libera/encerra o acesso.
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'inactive' check (status in ('active','refunded','inactive')),
  hubla_user_id text,
  user_name text,
  user_phone text,
  group_id text,
  group_name text,
  transaction_id text,
  total_amount_cents integer,
  paid_at timestamptz,
  refunded_at timestamptz,
  last_event text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Só o service_role (webhook) acessa; RLS ligado sem policies bloqueia o resto.
alter table public.entitlements enable row level security;

drop trigger if exists entitlements_updated_at on public.entitlements;
create trigger entitlements_updated_at before update on public.entitlements
  for each row execute function public.set_updated_at();

-- Marca a conta (auth.users.app_metadata.access_active) como ativa/inativa por e-mail.
create or replace function public.grant_access(p_email text, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('access_active', p_active)
    where lower(email) = lower(trim(p_email));
end $$;

revoke all on function public.grant_access(text, boolean) from public, anon, authenticated;
