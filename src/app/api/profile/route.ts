import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { getProfile, saveProfile } from "@/lib/db";
import type { UserProfile } from "@/lib/types";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const profile = await getProfile(supabase, user.id, user.email ?? "");
    return NextResponse.json(profile);
  } catch (e) {
    return apiError(e, "GET /api/profile");
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = (await request.json()) as UserProfile;
    if (!body.fullName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 }
      );
    }
    const saved = await saveProfile(supabase, user.id, body);
    return NextResponse.json(saved);
  } catch (e) {
    return apiError(e, "PUT /api/profile");
  }
}
