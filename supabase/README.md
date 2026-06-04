# Supabase setup

## 1. Create project

Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).

## 2. Run schema

1. Open **SQL Editor** in your project.
2. Paste the contents of `schema.sql`.
3. Click **Run**.

This creates `profiles`, `jobs`, `user_settings`, RLS policies, and a sign-up trigger.

## 3. Authentication URLs

**Authentication → URL configuration**

| Field | Local | Production (Vercel) |
|-------|-------|---------------------|
| Site URL | `http://localhost:3000` | `https://your-app.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://your-app.vercel.app/auth/callback` |

## 4. Email auth (optional)

**Authentication → Providers → Email**

- For quick local testing, you can disable **Confirm email**.
- For production, keep confirmation enabled and use the redirect URL above.

## 5. Environment variables

Copy from **Project Settings → API**:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add `GEMINI_API_KEY` for document generation (Vercel secret in production).

Do **not** expose the `service_role` key in the browser.

## 6. Vercel deployment

Add the same variables in **Vercel → Project → Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

Redeploy after adding variables.
