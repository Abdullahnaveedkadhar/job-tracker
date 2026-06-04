import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { getSettings, saveSettings, resolveGeminiKey } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  weeklyApplyTarget: z.number().min(1).max(100).optional(),
});

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const settings = await getSettings(supabase, user.id);
    return NextResponse.json({
      weeklyApplyTarget: settings.weeklyApplyTarget,
      email: user.email ?? "",
      documentGeneration: Boolean(resolveGeminiKey()),
    });
  } catch (e) {
    return apiError(e, "GET /api/settings");
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const current = await getSettings(supabase, user.id);
    const saved = await saveSettings(supabase, user.id, {
      weeklyApplyTarget: parsed.data.weeklyApplyTarget ?? current.weeklyApplyTarget,
      preferredModel: current.preferredModel,
    });
    return NextResponse.json({ ok: true, ...saved });
  } catch (e) {
    return apiError(e, "PUT /api/settings");
  }
}
