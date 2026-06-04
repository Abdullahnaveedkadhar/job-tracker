import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const TABLES = {
  profiles: "user_id",
  jobs: "id",
  user_settings: "user_id",
} as const;

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  const supabase = await createClient();
  const missing: string[] = [];

  for (const [table, column] of Object.entries(TABLES)) {
    const { error } = await supabase.from(table).select(column).limit(1);
    if (error?.message?.toLowerCase().includes("could not find the table")) {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    return NextResponse.json({ ok: false, missing });
  }

  return NextResponse.json({ ok: true });
}
