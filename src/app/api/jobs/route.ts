import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { listJobs, upsertJob } from "@/lib/db";
import { JOB_STAGES } from "@/lib/types";
import { z } from "zod";

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  jobDescription: z.string().optional(),
  stage: z.enum(JOB_STAGES).optional(),
  notes: z.string().optional(),
  appliedAt: z.string().optional(),
  rankScore: z.number().min(0).max(100).optional(),
  source: z.string().optional(),
  salary: z.string().optional(),
  matchReason: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const rawStage = searchParams.get("stage") ?? "active";
    const stage =
      rawStage === "all" || rawStage === "active"
        ? rawStage
        : JOB_STAGES.includes(rawStage as (typeof JOB_STAGES)[number])
          ? (rawStage as (typeof JOB_STAGES)[number])
          : "active";

    const result = await listJobs(supabase, user.id, {
      q: searchParams.get("q") ?? undefined,
      stage,
      source: searchParams.get("source") ?? undefined,
      minScore: searchParams.get("minScore")
        ? Number(searchParams.get("minScore"))
        : undefined,
      sort:
        (searchParams.get("sort") as "rank" | "updated" | "created" | null) ??
        "updated",
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : 50,
      offset: searchParams.get("offset")
        ? Number(searchParams.get("offset"))
        : 0,
    });

    return NextResponse.json(result);
  } catch (e) {
    return apiError(e, "GET /api/jobs");
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const job = await upsertJob(supabase, user.id, {
      company: parsed.data.company,
      role: parsed.data.role,
      location: parsed.data.location,
      jobUrl: parsed.data.jobUrl,
      jobDescription: parsed.data.jobDescription,
      stage: parsed.data.stage ?? "cv_created",
      notes: parsed.data.notes,
      appliedAt: parsed.data.appliedAt,
      rankScore: parsed.data.rankScore,
      source: parsed.data.source ?? "manual",
      salary: parsed.data.salary,
      matchReason: parsed.data.matchReason,
    });
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    return apiError(e, "POST /api/jobs");
  }
}
