import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured, getSupabaseAnonKey, getSupabaseUrl } from "./env";

export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
