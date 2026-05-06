-- User profile schema and policies for the realtime guestbook.
-- Apply after 001_init_guestbook.sql and 002_auth_rls_guestbook.sql.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_length check (
    char_length(btrim(nickname)) between 1 and 20
  ),
  constraint profiles_nickname_trimmed check (nickname = btrim(nickname))
);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_owner" on public.profiles;
create policy "profiles_select_owner" on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_owner" on public.profiles;
create policy "profiles_insert_owner" on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner" on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_owner" on public.profiles;
create policy "profiles_delete_owner" on public.profiles
for delete
using (auth.uid() = user_id);

create or replace view public.profile_public as
select user_id, nickname, avatar_url
from public.profiles;

grant select on public.profile_public to anon, authenticated;

drop policy if exists "guestbook_profile_images_insert_owner_prefix" on storage.objects;
create policy "guestbook_profile_images_insert_owner_prefix" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'profile'
);

drop policy if exists "guestbook_profile_images_update_owner_prefix" on storage.objects;
create policy "guestbook_profile_images_update_owner_prefix" on storage.objects
for update
to authenticated
using (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'profile'
)
with check (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'profile'
);

drop policy if exists "guestbook_profile_images_delete_owner_prefix" on storage.objects;
create policy "guestbook_profile_images_delete_owner_prefix" on storage.objects
for delete
to authenticated
using (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] = 'profile'
);
