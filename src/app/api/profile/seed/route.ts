import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth/server";
import { saveProfile } from "@/lib/db";
import { buildAbdullahProfile } from "@/lib/seed/abdullah-profile";

/**
 * One-time import while logged in. POST from browser console on Profile page:
 * fetch('/api/profile/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
 */
export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    const email = user.email ?? "abdullahnaveedkadhar@gmail.com";
    const profile = buildAbdullahProfile(email);
    const saved = await saveProfile(supabase, user.id, profile);
    return NextResponse.json({ ok: true, fullName: saved.fullName });
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    }
    const message = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
