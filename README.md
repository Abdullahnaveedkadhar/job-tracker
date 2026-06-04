# Job Tracker

Track job applications, weekly targets, and generate tailored ATS Word CVs with Gemini. Built with Next.js, Supabase, and Vercel-ready deployment.

## Features

- Supabase Auth (sign up / sign in per user)
- Per-user jobs, profile, and settings in Postgres (RLS)
- Pipeline stages with progress on interactive tiles
- Weekly apply target (default 20)
- Gemini-powered CV and cover letter export (.docx)
- Light and dark mode

## Quick start (local)

```bash
cd job-dashboard
npm install
cp .env.example .env.local
```

1. Create a [Supabase](https://supabase.com) project.
2. Run `supabase/schema.sql` in the SQL Editor (see `supabase/README.md`).
3. Fill `.env.local` with Supabase URL, anon key, and `GEMINI_API_KEY`.
4. Configure auth redirect URLs in Supabase (see `supabase/README.md`).
5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If Supabase is not configured you will be sent to `/setup`.

Create an account at `/signup`, then complete your **Profile**.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | .env.local + Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | .env.local + Vercel | Public key (safe with RLS) |
| `GEMINI_API_KEY` | .env.local + Vercel (server only) | Enables CV/cover letter export |

## Deploy on Vercel

1. Push this repo and import the `job-dashboard` folder (or monorepo root with correct root directory).
2. Add the three environment variables above in Vercel.
3. Add your Vercel URL to Supabase auth redirect URLs.
4. Deploy.

Local `data/` JSON storage is no longer used; all persistence is in Supabase.

## Project structure

```
src/
  app/           # Pages and API routes
  components/    # UI
  lib/
    db/          # Supabase data access
    supabase/    # Clients + middleware session
    gemini/      # Prompts and generation
supabase/
  schema.sql     # Run once in Supabase SQL editor
```
