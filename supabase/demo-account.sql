-- ─────────────────────────────────────────────────────────────────────────────
-- Optional: set up the public read-only demo account.
--
-- Run these steps in order, because the last section blocks writes for the
-- demo user and you want its profile filled in before that happens:
--
--   1. Create the demo user. Either sign up through the app, or use the
--      Supabase dashboard (Authentication -> Users -> Add user, with
--      "Auto Confirm User" ticked), or run section 0 below.
--      Either way the on_auth_user_created trigger adds its profile and
--      settings rows.
--   2. Sign in as the demo user, open Profile and click "Load starter
--      template" so the account has a CV to generate from.
--   3. Run sections 1 and 2 of this file in the Supabase SQL Editor.
--   4. Set NEXT_PUBLIC_DEMO_EMAIL and NEXT_PUBLIC_DEMO_PASSWORD in Vercel.
--
-- Change the email below to match the account you created.
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══ 0. Create the auth user (optional) ══════════════════════════════════════
--
-- Only needed if you want this scripted rather than clicking through the
-- dashboard. The auth schema is internal to Supabase and its columns have
-- changed between GoTrue versions, so prefer the dashboard if you have the
-- choice; this is here for reproducible environments.
--
-- Set the password on the line marked below before running. It ends up in
-- NEXT_PUBLIC_DEMO_PASSWORD and is therefore public: use a throwaway value,
-- never a password you use anywhere else.
--
-- Both inserts matter. A row in auth.users alone produces a user that exists
-- but cannot sign in, because password login resolves auth.identities first.

do $$
declare
  demo_email  text := 'demo@example.com';
  demo_pass   text := 'CHANGE-ME-BEFORE-RUNNING';  -- <- set this
  new_user_id uuid;
begin
  if exists (select 1 from auth.users where email = demo_email) then
    raise notice 'Demo user already exists, skipping creation.';
    return;
  end if;

  new_user_id := gen_random_uuid();

  -- The token columns must be '' rather than NULL. GoTrue scans them into
  -- non-nullable Go strings, so a NULL makes every sign-in fail with the
  -- unhelpful "Database error querying schema".
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new,
    email_change_token_current, recovery_token,
    phone_change, phone_change_token, reauthentication_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    demo_email,
    extensions.crypt(demo_pass, extensions.gen_salt('bf')),
    now(),                                   -- pre-confirmed, no email step
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Demo User"}'::jsonb,
    now(),
    now(),
    '', '', '',
    '', '',
    '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  )
  values (
    gen_random_uuid(),
    new_user_id,
    demo_email,                              -- provider_id is the email for the email provider
    'email',
    jsonb_build_object('sub', new_user_id::text, 'email', demo_email),
    now(),
    now(),
    now()
  );

  raise notice 'Created demo user %', new_user_id;
end
$$;

-- Repair an account created before the token columns were set. Safe to run at
-- any time; it is a no-op once the values are already ''.
update auth.users
set confirmation_token         = coalesce(confirmation_token, ''),
    email_change               = coalesce(email_change, ''),
    email_change_token_new     = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    recovery_token             = coalesce(recovery_token, ''),
    phone_change               = coalesce(phone_change, ''),
    phone_change_token         = coalesce(phone_change_token, ''),
    reauthentication_token     = coalesce(reauthentication_token, '')
where email = 'demo@example.com';


-- ═══ 1. Sample applications across the pipeline ══════════════════════════════

create or replace function public.demo_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select id from auth.users where email = 'demo@example.com'
$$;

delete from public.jobs where user_id = public.demo_user_id();

insert into public.jobs
  (user_id, company, role, location, job_url, stage, rank_score, source, salary, match_reason, applied_at, notes)
values
  (public.demo_user_id(), 'Monzo', 'Graduate Backend Engineer', 'London (hybrid)',
   'https://example.com/jobs/1', 'interview', 92, 'greenhouse', '£55,000',
   'Strong match: graduate scheme, Python and Postgres, mentoring culture',
   now() - interval '11 days', 'Take-home done. Second stage is a system design chat.'),
  (public.demo_user_id(), 'Octopus Energy', 'Junior Full Stack Developer', 'Manchester (hybrid)',
   'https://example.com/jobs/2', 'applied', 88, 'adzuna', '£42,000 - £48,000',
   'Matches React and Next.js experience; UK-wide hybrid',
   now() - interval '5 days', null),
  (public.demo_user_id(), 'Deliveroo', 'Frontend Engineer I', 'London (hybrid)',
   'https://example.com/jobs/3', 'applied', 84, 'lever', '£50,000',
   'TypeScript and React focus, explicit junior level',
   now() - interval '3 days', 'Referral from a university friend on the team.'),
  (public.demo_user_id(), 'Starling Bank', 'Graduate Software Engineer', 'Cardiff',
   'https://example.com/jobs/4', 'offer', 90, 'greenhouse', '£52,000',
   'Graduate programme, strong Postgres and API work',
   now() - interval '24 days', 'Offer received. Deadline to respond is next Friday.'),
  (public.demo_user_id(), 'Sky', 'Junior Web Developer', 'Leeds (hybrid)',
   'https://example.com/jobs/5', 'rejected', 71, 'adzuna', '£38,000',
   'Web delivery role; less TypeScript than preferred',
   now() - interval '31 days', 'Rejected after first stage — they wanted 2 years commercial.'),
  (public.demo_user_id(), 'Trainline', 'Associate Software Engineer', 'London (hybrid)',
   'https://example.com/jobs/6', 'cv_created', 86, 'lever', '£47,000',
   'Associate level, React and Node, structured onboarding',
   null, 'CV tailored, still need to write the cover letter.'),
  (public.demo_user_id(), 'The Hut Group', 'Graduate Developer', 'Manchester',
   'https://example.com/jobs/7', 'cv_created', 79, 'adzuna', '£40,000',
   'Local to the North West, graduate intake',
   null, null),
  (public.demo_user_id(), 'Bloomberg', 'Software Engineer (Graduate)', 'London',
   'https://example.com/jobs/8', 'applied', 81, 'greenhouse', 'Competitive',
   'Large graduate intake; strong C++ preference is a partial mismatch',
   now() - interval '8 days', null);

-- ═══ 2. Make the demo account read-only ══════════════════════════════════════
--
-- Visitors share this account, so writes are blocked at the database rather
-- than in the UI. Every existing policy already scopes rows to auth.uid();
-- these add "...and you are not the demo user" to the write paths.

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "jobs_insert_own" on public.jobs;
drop policy if exists "jobs_update_own" on public.jobs;
drop policy if exists "jobs_delete_own" on public.jobs;
drop policy if exists "settings_insert_own" on public.user_settings;
drop policy if exists "settings_update_own" on public.user_settings;

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

create policy "jobs_insert_own"
  on public.jobs for insert
  with check (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

create policy "jobs_update_own"
  on public.jobs for update
  using (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

create policy "jobs_delete_own"
  on public.jobs for delete
  using (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

create policy "settings_insert_own"
  on public.user_settings for insert
  with check (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

create policy "settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id and auth.uid() <> public.demo_user_id());

-- Re-run this file at any time to reset the demo data back to the list above.
