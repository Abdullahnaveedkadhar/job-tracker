-- Job discovery: ranking, source, salary, match reason
-- Run in Supabase SQL Editor after deploy (or npm run db:apply if wired).

alter table public.jobs
  add column if not exists rank_score numeric not null default 0,
  add column if not exists source text,
  add column if not exists salary text,
  add column if not exists match_reason text;

create index if not exists jobs_rank_score_idx
  on public.jobs (user_id, rank_score desc);

create index if not exists jobs_source_idx
  on public.jobs (user_id, source);

-- Dedupe helper: fast lookup by URL per user (NULLs allowed multiple times)
create index if not exists jobs_user_job_url_idx
  on public.jobs (user_id, job_url)
  where job_url is not null;
