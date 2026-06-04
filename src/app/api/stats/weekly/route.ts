import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { getJobs, getSettings } from "@/lib/db";
import { countWeeklyApplications, formatWeekLabel } from "@/lib/week";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const [jobs, settings] = await Promise.all([
      getJobs(supabase, user.id),
      getSettings(supabase, user.id),
    ]);
    const applied = countWeeklyApplications(jobs);
    const target = settings.weeklyApplyTarget ?? 20;
    return NextResponse.json({
      applied,
      target,
      weekLabel: formatWeekLabel(),
      percent: Math.min(100, Math.round((applied / target) * 100)),
    });
  } catch (e) {
    return apiError(e, "GET /api/stats/weekly");
  }
}
