-- Suraj Studio Mohandra V3 — Supabase/Postgres schema
-- Run this once in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.event_counters (
  name text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.event_counters(name, value)
values ('events', 0)
on conflict (name) do nothing;

create or replace function public.next_event_number()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare n bigint;
begin
  update public.event_counters
     set value = value + 1, updated_at = now()
   where name = 'events'
  returning value into n;
  return n;
end;
$$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_code text not null unique,
  slug text not null unique,
  event_name text not null,
  client_name text not null,
  bride_name text,
  groom_name text,
  phone text,
  whatsapp text,
  event_date date not null,
  event_type text,
  location text,
  description text,
  cover_image text,
  drive_folder_id text,
  drive_folder_name text,
  visibility text not null default 'unlisted' check (visibility in ('public','unlisted','password','private')),
  password_protected boolean not null default false,
  password_salt text,
  password_hash text,
  allow_original_download boolean not null default false,
  allow_optimized_download boolean not null default true,
  allow_bulk_download boolean not null default false,
  allow_selected_download boolean not null default true,
  allow_gallery_sharing boolean not null default true,
  allow_photo_sharing boolean not null default true,
  allow_multi_photo_sharing boolean not null default true,
  allow_qr boolean not null default true,
  watermark_enabled boolean not null default true,
  shared_preview_watermark boolean not null default true,
  expiry_date timestamptz,
  photo_count integer not null default 0,
  folders_scanned integer not null default 0,
  sync_status text not null default 'never',
  sync_error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_slug_idx on public.events(slug);
create index if not exists events_event_code_idx on public.events(event_code);
create index if not exists events_created_at_idx on public.events(created_at desc);

create table if not exists public.photos (
  id text primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  public_photo_code text not null,
  drive_file_id text not null,
  file_name text not null,
  mime_type text,
  category text not null default 'Gallery',
  drive_path text[] not null default '{}',
  width integer,
  height integer,
  size bigint,
  thumbnail_reference text,
  preview_reference text,
  original_reference text,
  watermark_enabled boolean not null default true,
  active boolean not null default true,
  drive_created_at timestamptz,
  drive_modified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, drive_file_id)
);

create index if not exists photos_event_idx on public.photos(event_id, created_at desc);
create index if not exists photos_drive_file_idx on public.photos(drive_file_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  whatsapp text,
  email text,
  event_type text not null,
  event_date date not null,
  location text not null,
  budget text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id text primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  photo_id text not null references public.photos(id) on delete cascade,
  client_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists favorites_event_idx on public.favorites(event_id);

create table if not exists public.album_selections (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  client_name text not null,
  phone text not null,
  photo_ids text[] not null,
  photo_count integer not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.share_collections (
  code text primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  photo_ids text[] not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.drive_connections (
  user_id uuid primary key,
  refresh_token text not null,
  scope text,
  connected boolean not null default true,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio (
  id uuid primary key default gen_random_uuid(),
  title text,
  category text,
  drive_file_id text,
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event text,
  review text not null,
  rating integer check (rating between 1 and 5),
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Lock tables from direct browser access. Server routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS.
alter table public.event_counters enable row level security;
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.bookings enable row level security;
alter table public.favorites enable row level security;
alter table public.album_selections enable row level security;
alter table public.share_collections enable row level security;
alter table public.drive_connections enable row level security;
alter table public.services enable row level security;
alter table public.portfolio enable row level security;
alter table public.enquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;

revoke all on function public.next_event_number() from public, anon, authenticated;
grant execute on function public.next_event_number() to service_role;
