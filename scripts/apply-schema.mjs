/**
 * Apply schema via direct Postgres (optional).
 *
 * 1. Supabase → Project Settings → Database → Connection string (URI)
 * 2. Add to .env.local:  SUPABASE_DB_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
 * 3. Run:  npm run db:apply
 *
 * Or paste supabase/schema.sql in Supabase SQL Editor (no password needed).
 */

import { readFileSync } from "fs";
import { spawnSync } from "child_process";

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

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("Add SUPABASE_DB_URL to .env.local (Database connection URI from Supabase).");
  console.error("Or run supabase/schema.sql manually in Supabase → SQL Editor.");
  process.exit(1);
}

const schemaPath = new URL("../supabase/schema.sql", import.meta.url).pathname;
const psql = spawnSync("psql", [dbUrl, "-f", schemaPath], {
  encoding: "utf8",
  stdio: "inherit",
});

if (psql.status !== 0) {
  console.error("\npsql failed. Install PostgreSQL client tools, or use SQL Editor.");
  process.exit(psql.status ?? 1);
}

console.log("\nSchema applied. Run: npm run db:check");
