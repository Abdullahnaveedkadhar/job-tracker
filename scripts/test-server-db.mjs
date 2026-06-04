/**
 * Mimics server API Supabase client (same as route handlers).
 * Run: node scripts/test-server-db.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, key);

for (const table of ["profiles", "jobs", "user_settings"]) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  console.log(table, error ? `ERROR: ${error.message} (${error.code})` : `ok (${data?.length ?? 0} rows)`);
}
