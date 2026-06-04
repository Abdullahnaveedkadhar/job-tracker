/**
 * Verify Supabase tables exist. Run: npm run db:check
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

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
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and anon/publishable key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const tables = {
  profiles: "user_id",
  jobs: "id",
  user_settings: "user_id",
};
const missing = [];

for (const [table, column] of Object.entries(tables)) {
  const { error } = await supabase.from(table).select(column).limit(1);
  if (error?.message?.toLowerCase().includes("could not find the table")) {
    missing.push(table);
  } else if (error) {
    console.warn(`${table}: ${error.message}`);
  } else {
    console.log(`✓ public.${table}`);
  }
}

if (missing.length) {
  console.error("\nMissing tables:", missing.join(", "));
  console.error("Fix: Supabase Dashboard → SQL Editor → run supabase/schema.sql");
  process.exit(1);
}

console.log("\nDatabase ready.");
