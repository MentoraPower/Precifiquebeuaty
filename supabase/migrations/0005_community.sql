-- Comunidade — canal de transmissão (estilo Telegram).
-- Admin publica (texto/imagem/vídeo); assinantes só leem e reagem. Tempo real.

-- Quem pode publicar na comunidade.
create table if not exists public.community_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.community_admins enable row level security;
-- Sem policies de leitura: só service_role e funções security-definer acessam.

create or replace function public.is_community_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.community_admins where user_id = auth.uid());
$$;
revoke all on function public.is_community_admin() from public, anon;
grant execute on function public.is_community_admin() to authenticated;

-- Posts do canal.
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  body text,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now()
);
alter table public.community_posts enable row level security;

create policy "posts_read" on public.community_posts
  for select to authenticated using (true);
create policy "posts_admin_insert" on public.community_posts
  for insert to authenticated with check (public.is_community_admin());
create policy "posts_admin_update" on public.community_posts
  for update to authenticated using (public.is_community_admin());
create policy "posts_admin_delete" on public.community_posts
  for delete to authenticated using (public.is_community_admin());

-- Reações (uma por usuário/emoji/post).
create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id, emoji)
);
alter table public.community_reactions enable row level security;
-- REPLICA IDENTITY FULL para o realtime enviar a linha completa no DELETE.
alter table public.community_reactions replica identity full;

create policy "reactions_read" on public.community_reactions
  for select to authenticated using (true);
create policy "reactions_insert_own" on public.community_reactions
  for insert to authenticated with check (user_id = auth.uid());
create policy "reactions_delete_own" on public.community_reactions
  for delete to authenticated using (user_id = auth.uid());

-- Realtime.
alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_reactions;

-- Storage: bucket público de mídia da comunidade.
insert into storage.buckets (id, name, public)
values ('community', 'community', true)
on conflict (id) do nothing;

create policy "community_media_read" on storage.objects
  for select to authenticated using (bucket_id = 'community');
create policy "community_media_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'community' and public.is_community_admin());
create policy "community_media_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'community' and public.is_community_admin());

-- Admins iniciais (conta do dono + conta de teste).
insert into public.community_admins (user_id)
select id from auth.users
where lower(email) in ('patrickbergeh@gmail.com', 'contato@mentorabeautyacademy.com.br')
on conflict (user_id) do nothing;
