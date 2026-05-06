-- guestbook_posts
create table if not exists public.guestbook_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_path text not null,
  image_type text not null check (image_type in ('drawing', 'photo')),
  created_at timestamptz not null default now()
);

-- comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.guestbook_posts(id) on delete cascade,
  author_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table public.guestbook_posts;
alter publication supabase_realtime add table public.comments;

alter table public.guestbook_posts enable row level security;
alter table public.comments enable row level security;

-- public read/write policies for v1 (no auth)
drop policy if exists "guestbook_posts_select_all" on public.guestbook_posts;
create policy "guestbook_posts_select_all" on public.guestbook_posts
for select using (true);

drop policy if exists "guestbook_posts_insert_all" on public.guestbook_posts;
create policy "guestbook_posts_insert_all" on public.guestbook_posts
for insert with check (true);

drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments
for select using (true);

drop policy if exists "comments_insert_all" on public.comments;
create policy "comments_insert_all" on public.comments
for insert with check (true);

-- storage bucket
insert into storage.buckets (id, name, public)
values ('guestbook-images', 'guestbook-images', true)
on conflict (id) do update set public = true;
