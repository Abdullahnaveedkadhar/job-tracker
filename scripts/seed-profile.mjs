/**
 * Seed Abdullah CV profile — no Next.js required.
 *
 * Option A (recommended): service role in .env.local
 *   SUPABASE_SERVICE_ROLE_KEY=...   (or SUPABASE_SECRET_KEY=sb_secret_...)
 *   npm run seed:profile
 *
 * Option B: your app login password (publishable key only)
 *   SEED_USER_EMAIL=you@example.com
 *   SEED_USER_PASSWORD=your-app-password
 *   npm run seed:profile
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { buildProfileRow } from "./abdullah-profile-data.mjs";

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
  } catch {
    console.error("Missing .env.local");
    process.exit(1);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY;
const targetEmail =
  process.env.SEED_USER_EMAIL?.toLowerCase() ||
  "abdullahnaveedkadhar@gmail.com";
const password = process.env.SEED_USER_PASSWORD;

if (!url) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

async function seedWithServiceRole() {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });

  if (listError) {
    console.error("Auth list failed:", listError.message);
    process.exit(1);
  }

  const user = list.users.find((u) => u.email?.toLowerCase() === targetEmail);
  if (!user) {
    console.error(`No auth user found for ${targetEmail}`);
    console.error("Sign up in the app first with that email.");
    process.exit(1);
  }

  const row = buildProfileRow(user.email ?? targetEmail);
  const { error: upsertError } = await admin.from("profiles").upsert({
    user_id: user.id,
    ...row,
  });

  if (upsertError) {
    console.error("Profile upsert failed:", upsertError.message);
    process.exit(1);
  }

  console.log(`Profile seeded for ${user.email} (${user.id})`);
}

async function seedWithPassword() {
  if (!publishableKey) {
    console.error("Need NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: auth, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

  if (signInError || !auth.user) {
    console.error("Sign in failed:", signInError?.message ?? "No user");
    process.exit(1);
  }

  const row = buildProfileRow(auth.user.email ?? targetEmail);
  const { error: upsertError } = await supabase.from("profiles").upsert({
    user_id: auth.user.id,
    ...row,
  });

  if (upsertError) {
    console.error("Profile upsert failed:", upsertError.message);
    process.exit(1);
  }

  console.log(`Profile seeded for ${auth.user.email} (${auth.user.id})`);
}

if (serviceKey) {
  await seedWithServiceRole();
} else if (password) {
  await seedWithPassword();
} else {
  console.error("Add one of these to .env.local, then run: npm run seed:profile\n");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=...  (Supabase → Settings → API → service_role / secret)");
  console.error("  — or —");
  console.error("  SEED_USER_PASSWORD=...  (password for " + targetEmail + ")");
  process.exit(1);
}
