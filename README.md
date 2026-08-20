# Job Tracker

Find UK graduate and junior roles, rank them against your profile, track every application through its pipeline, and export a tailored CV or cover letter for each one as a Word document.

**[Live app](https://job-tracker-phi-one.vercel.app)** · Built with Next.js, TypeScript, Supabase and the Gemini API.

> I built this to replace the spreadsheet I was keeping during my own graduate job search. The tedious parts were finding roles worth applying to and rewriting my CV for each one, so those are the two things the app automates.

<!--
  Add screenshots here — this is the first thing anyone looks at.
  Suggested: dashboard with the pipeline, the Discover results list, and the
  Generate page mid-export.

  ![Dashboard](docs/screenshots/dashboard.png)
  ![Discover](docs/screenshots/discover.png)
-->

## Features

- **Discover** — pulls openings from the [Adzuna](https://developer.adzuna.com/) API and curated Greenhouse and Lever company boards, then scores each against your stored profile. Filter by score, source, and keyword across up to 1000 roles.
- **Pipeline tracking** — every application moves through stages from CV created to offer, with search, filtering and sorting by match score or last activity.
- **Document generation** — paste a job description and export an ATS-friendly `.docx` CV or cover letter, generated from your profile with Gemini.
- **CV import** — upload an existing CV (`.docx`, `.pdf`, `.txt`) and the app extracts it into a structured profile you can edit.
- **Weekly target** — set a weekly application goal and track progress against it.
- **Light and dark themes**, resolved before first paint so there is no flash.

## Architecture

```
src/
  app/
    page.tsx       # Public landing page
    dashboard/     # Application pipeline
    discover/      # Ranked role search
    generate/      # CV and cover letter export
    api/           # Route handlers (Zod-validated)
  components/      # UI
  lib/
    db/            # Supabase data access, one module per table
    discover/      # Adzuna + company boards + ranking
    docx/          # Word document builders
    gemini/        # Prompts, schemas, error mapping
    supabase/      # Browser/server clients + session middleware
supabase/
  schema.sql       # Full schema, including row-level security
  migrations/      # Incremental SQL for existing projects
  demo-account.sql # Optional read-only demo account
```

A few decisions worth calling out:

- **Auth is enforced twice on purpose.** Middleware redirects unauthenticated page requests and 401s unauthenticated API requests, and every route handler independently calls `requireUser()`. Middleware alone is a routing concern, not an authorisation guarantee.
- **Row-level security is the real boundary.** Every table scopes rows to `auth.uid()`, so a bug in application code cannot leak one user's applications to another.
- **Errors are mapped, not swallowed.** `lib/api-response.ts` turns a missing-table error into a 503 with setup instructions and an auth failure into a 401, so a misconfigured database says so instead of returning a generic 500.
- **The theme lives in the DOM, not in React state.** A blocking script in the root layout sets `data-theme` before paint; `ThemeProvider` subscribes to that attribute with `useSyncExternalStore` rather than keeping a second copy.

## Running locally

```bash
npm install
cp .env.example .env.local
```

1. Create a [Supabase](https://supabase.com) project.
2. Run `supabase/schema.sql` in the SQL Editor (see `supabase/README.md`).
3. Fill `.env.local` with your Supabase URL, anon key, and `GEMINI_API_KEY`.
4. Optionally add `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` for volume search — the curated company boards work without them.
5. Add `http://localhost:3000/auth/callback` to your Supabase auth redirect URLs.

```bash
npm run dev
```

Then open <http://localhost:3000>. `npm run db:check` verifies the three tables exist.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public key — safe to expose, RLS is the boundary |
| `GEMINI_API_KEY` | for generation | Server only. CV and cover letter export |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | no | Server only. Higher-volume role discovery |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical URL for Open Graph link previews |
| `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` | no | Enables the "Explore the demo" button |

## Demo account

Setting the two `NEXT_PUBLIC_DEMO_*` variables adds a one-click sign-in to the landing and login pages so visitors can look around without registering. Those credentials are exposed to the browser by design, so point them at a throwaway account only.

`supabase/demo-account.sql` sets the account up in three sections: creating the auth user (optional — the dashboard's *Authentication → Users → Add user* does the same thing), seeding the profile and sample applications, and blocking writes for that user through row-level security so a shared account survives contact with the public. Re-run sections 1 and 2 at any time to reset it.

## Deploying

1. Import the repo into Vercel — the Next.js app is at the root.
2. Add the environment variables above.
3. Add `https://your-domain/auth/callback` to the Supabase auth redirect URLs.

## Licence

[MIT](LICENSE)
