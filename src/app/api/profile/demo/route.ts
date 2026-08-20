import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { saveProfile } from "@/lib/db";
import { buildDemoProfile } from "@/lib/seed/demo-profile";

/**
 * Overwrite the signed-in user's profile with the fictional starter template.
 * Backs the "Load starter template" button for users without a CV to upload.
 */
export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    const profile = buildDemoProfile(user.email ?? "");
    const saved = await saveProfile(supabase, user.id, profile);
    return NextResponse.json({ ok: true, fullName: saved.fullName });
  } catch (e) {
    return apiError(e, "POST /api/profile/demo");
  }
}
