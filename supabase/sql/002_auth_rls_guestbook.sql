-- Auth/RLS hardening for guestbook writes.
-- Existing anonymous rows are preserved by keeping user_id nullable.

alter table public.guestbook_posts
add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.comments
add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.guestbook_posts
alter column user_id set default auth.uid();

alter table public.comments
alter column user_id set default auth.uid();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'comments_author_name_not_blank'
  ) then
    alter table public.comments
    add constraint comments_author_name_not_blank
    check (char_length(btrim(author_name)) between 1 and 20) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'comments_content_not_blank'
  ) then
    alter table public.comments
    add constraint comments_content_not_blank
    check (char_length(btrim(content)) between 1 and 300) not valid;
  end if;
end $$;

alter table public.guestbook_posts enable row level security;
alter table public.comments enable row level security;
-- storage.objects is managed by Supabase Storage and already has RLS enabled.
-- Do not run `alter table storage.objects enable row level security`; SQL Editor
-- can fail with "must be owner of table objects" on managed storage tables.

drop policy if exists "guestbook_posts_select_all" on public.guestbook_posts;
drop policy if exists "guestbook_posts_insert_all" on public.guestbook_posts;
drop policy if exists "guestbook_posts_select_public" on public.guestbook_posts;
drop policy if exists "guestbook_posts_insert_authenticated_owner" on public.guestbook_posts;
drop policy if exists "guestbook_posts_update_owner" on public.guestbook_posts;
drop policy if exists "guestbook_posts_delete_owner" on public.guestbook_posts;

create policy "guestbook_posts_select_public" on public.guestbook_posts
for select using (true);

create policy "guestbook_posts_insert_authenticated_owner" on public.guestbook_posts
for insert
with check (auth.uid() is not null and user_id = auth.uid());

create policy "guestbook_posts_update_owner" on public.guestbook_posts
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "guestbook_posts_delete_owner" on public.guestbook_posts
for delete
using (user_id = auth.uid());

drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_insert_all" on public.comments;
drop policy if exists "comments_select_public" on public.comments;
drop policy if exists "comments_insert_authenticated_owner" on public.comments;
drop policy if exists "comments_update_owner" on public.comments;
drop policy if exists "comments_delete_owner" on public.comments;

create policy "comments_select_public" on public.comments
for select using (true);

create policy "comments_insert_authenticated_owner" on public.comments
for insert
with check (auth.uid() is not null and user_id = auth.uid());

create policy "comments_update_owner" on public.comments
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "comments_delete_owner" on public.comments
for delete
using (user_id = auth.uid());

drop policy if exists "guestbook_images_select_public" on storage.objects;
drop policy if exists "guestbook_images_insert_owner_prefix" on storage.objects;
drop policy if exists "guestbook_images_update_owner_prefix" on storage.objects;
drop policy if exists "guestbook_images_delete_owner_prefix" on storage.objects;

create policy "guestbook_images_select_public" on storage.objects
for select
using (bucket_id = 'guestbook-images');

create policy "guestbook_images_insert_owner_prefix" on storage.objects
for insert
with check (
  bucket_id = 'guestbook-images'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "guestbook_images_update_owner_prefix" on storage.objects
for update
using (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "guestbook_images_delete_owner_prefix" on storage.objects
for delete
using (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
