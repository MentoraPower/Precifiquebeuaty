-- Telefone no perfil (editável na página de Perfil).
alter table public.profiles add column if not exists phone text;

-- Retorna a assinatura/compra do próprio usuário (para a tela de Assinatura).
-- security definer para ler entitlements (RLS bloqueia acesso direto);
-- filtra pelo e-mail do JWT do usuário.
create or replace function public.my_entitlement()
returns setof public.entitlements
language sql
security definer
set search_path = public
as $$
  select * from public.entitlements
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
$$;

revoke all on function public.my_entitlement() from public, anon;
grant execute on function public.my_entitlement() to authenticated;
