import { NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/auth/server";
import {
  DB_SETUP_MESSAGE,
  errorMessage,
  isMissingTableError,
  isSchemaCacheStaleError,
} from "@/lib/db/supabase-errors";

export function apiError(e: unknown, context?: string) {
  if (e instanceof UnauthorizedError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isMissingTableError(e)) {
    const hint = isSchemaCacheStaleError(e)
      ? " Tables were created recently: in Supabase go to Project Settings → API → Reload schema, then refresh."
      : "";
    return NextResponse.json(
      { error: DB_SETUP_MESSAGE + hint, code: "db_not_ready" },
      { status: 503 }
    );
  }
  const message = errorMessage(e);
  if (context) console.error(`[${context}]`, message, e);
  return NextResponse.json({ error: message }, { status: 500 });
}
