-- Cigar Journal sync. Run once in a Supabase project of its own.
-- One table holds every synced record as JSON, plus a private bucket for photos.
-- Each signed-in user can only ever see and change their own rows and files.

create table if not exists public.records (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  store text not null check (store in ('cigars', 'smokes', 'lots', 'wishlist', 'customTags', 'photos')),
  id text not null,
  -- The device's own "last changed" time. The newer one wins.
  updated_at timestamptz not null,
  deleted boolean not null default false,
  data jsonb not null,
  -- When the server took the row. Devices ask for "everything since" by this.
  server_at timestamptz not null default clock_timestamp(),
  primary key (user_id, store, id)
);

create index if not exists records_user_server_at on public.records (user_id, server_at);

alter table public.records enable row level security;

drop policy if exists "read own records" on public.records;
create policy "read own records" on public.records
  for select using (auth.uid() = user_id);

drop policy if exists "add own records" on public.records;
create policy "add own records" on public.records
  for insert with check (auth.uid() = user_id);

drop policy if exists "change own records" on public.records;
create policy "change own records" on public.records
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Takes a batch of rows and keeps, per record, whichever copy changed most recently.
create or replace function public.push_records(rows jsonb)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  changed integer;
begin
  insert into public.records (user_id, store, id, updated_at, deleted, data, server_at)
  select
    auth.uid(),
    r ->> 'store',
    r ->> 'id',
    (r ->> 'updated_at')::timestamptz,
    coalesce((r ->> 'deleted')::boolean, false),
    r -> 'data',
    clock_timestamp()
  from jsonb_array_elements(rows) as r
  on conflict (user_id, store, id) do update
    set updated_at = excluded.updated_at,
        deleted = excluded.deleted,
        data = excluded.data,
        server_at = clock_timestamp()
    where excluded.updated_at > public.records.updated_at;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

revoke all on function public.push_records(jsonb) from public, anon;
grant execute on function public.push_records(jsonb) to authenticated;

-- Photos: a private bucket, one folder per user.
insert into storage.buckets (id, name, public)
values ('journal-photos', 'journal-photos', false)
on conflict (id) do nothing;

drop policy if exists "read own photos" on storage.objects;
create policy "read own photos" on storage.objects
  for select using (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "add own photos" on storage.objects;
create policy "add own photos" on storage.objects
  for insert with check (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "change own photos" on storage.objects;
create policy "change own photos" on storage.objects
  for update using (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "remove own photos" on storage.objects;
create policy "remove own photos" on storage.objects
  for delete using (bucket_id = 'journal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
