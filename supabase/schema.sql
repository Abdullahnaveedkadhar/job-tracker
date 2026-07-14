-- Run this in the Supabase SQL Editor after creating your project.
-- Dashboard → SQL → New query → paste → Run

-- ─── Profiles (CV source of truth) ───
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text default '',
  location text default '',
  summary text not null default '',
  additional_info text default '',
  skill_groups jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── Job applications ───
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  job_url text,
  job_description text,
  stage text not null default 'cv_created',
  notes text,
  applied_at timestamptz,
  rank_score numeric not null default 0,
  source text,
  salary text,
  match_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_user_id_idx on public.jobs (user_id);
create index if not exists jobs_updated_at_idx on public.jobs (user_id, updated_at desc);
create index if not exists jobs_rank_score_idx on public.jobs (user_id, rank_score desc);
create index if not exists jobs_source_idx on public.jobs (user_id, source);
create index if not exists jobs_user_job_url_idx
  on public.jobs (user_id, job_url)
  where job_url is not null;

-- ─── Per-user app settings ───
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_apply_target integer not null default 20,
  preferred_model text not null default 'gemini-2.5-flash'
);

-- ─── Auto-create profile + settings on sign-up ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ─── Row Level Security ───
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.user_settings enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "jobs_select_own"
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "jobs_insert_own"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "jobs_update_own"
  on public.jobs for update
  using (auth.uid() = user_id);

create policy "jobs_delete_own"
  on public.jobs for delete
  using (auth.uid() = user_id);

create policy "settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id);
