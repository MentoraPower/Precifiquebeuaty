-- Checa se um e-mail já tem conta (usado no "esqueci a senha" para só enviar
-- o código quando a conta existe). security definer para ler auth.users;
-- retorna apenas um booleano (não expõe dados).
create or replace function public.email_has_account(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from auth.users where lower(email) = lower(trim(p_email)));
$$;

revoke all on function public.email_has_account(text) from public;
grant execute on function public.email_has_account(text) to anon, authenticated;
