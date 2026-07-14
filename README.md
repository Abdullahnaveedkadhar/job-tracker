# Job Tracker

Track job applications, weekly targets, and generate tailored ATS Word CVs with Gemini. Built with Next.js, Supabase, and Vercel-ready deployment.

## Features

- Supabase Auth (sign up / sign in per user)
- Per-user jobs, profile, and settings in Postgres (RLS)
- **Discover**: pull UK roles from Adzuna + curated Greenhouse/Lever boards, rank and filter up to 1000 roles
- Pipeline stages with progress on interactive tiles + **Open apply link**
- Weekly apply target (default 20)
- Gemini-powered CV and cover letter export (.docx)
- Light and dark mode

## Quick start (local)

```bash
cd job-tracker
npm install
cp .env.example .env.local
```

1. Create a [Supabase](https://supabase.com) project.
2. Run `supabase/schema.sql` in the SQL Editor (see `supabase/README.md`).
3. If you already had the app running, also run `supabase/migrations/002_job_discovery.sql`.
4. Fill `.env.local` with Supabase URL, anon key, and `GEMINI_API_KEY`.
5. Optional: add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` from [Adzuna developers](https://developer.adzuna.com/) for volume search (company boards still work without them).
6. Configure auth redirect URLs in Supabase (see `supabase/README.md`).
7. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If Supabase is not configured you will be sent to `/setup`.

Create an account at `/signup`, then complete your **Profile**. Use **Discover** to find and rank roles, then open apply links yourself.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | .env.local + Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | .env.local + Vercel | Public key (safe with RLS) |
| `GEMINI_API_KEY` | .env.local + Vercel (server only) | Enables CV/cover letter export |
| `ADZUNA_APP_ID` | .env.local + Vercel (server only) | Optional job discovery volume |
| `ADZUNA_APP_KEY` | .env.local + Vercel (server only) | Optional job discovery volume |

## Deploy on Vercel

1. Push this repo and import it (root is the Next.js app).
2. Add the environment variables above in Vercel.
3. Add your Vercel URL to Supabase auth redirect URLs.
4. Run the discovery migration SQL in Supabase if upgrading an existing project.
5. Deploy.

Local `data/` JSON storage is no longer used; all persistence is in Supabase.

## Project structure

```
src/
  app/           # Pages and API routes (includes /discover)
  components/    # UI
  lib/
    db/          # Supabase data access
    discover/    # Adzuna + company boards + ranker
    supabase/    # Clients + middleware session
    gemini/      # Prompts and generation
supabase/
  schema.sql     # Full schema
  migrations/    # Incremental SQL for existing projects
```
