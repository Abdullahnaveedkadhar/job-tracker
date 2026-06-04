export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
  ) {
    return (e as { message: string }).message;
  }
  return "Server error";
}

export function isMissingTableError(e: unknown): boolean {
  const msg = errorMessage(e).toLowerCase();
  return (
    msg.includes("could not find the table") || msg.includes("schema cache")
  );
}

export function isSchemaCacheStaleError(e: unknown): boolean {
  return errorMessage(e).toLowerCase().includes("schema cache");
}

export const DB_SETUP_MESSAGE =
  "Database tables are missing. Open Supabase → SQL Editor, run supabase/schema.sql from this project, then refresh the page.";
