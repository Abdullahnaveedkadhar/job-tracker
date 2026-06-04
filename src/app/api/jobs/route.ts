import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { getJobs, upsertJob } from "@/lib/db";
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
});

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const jobs = await getJobs(supabase, user.id);
    return NextResponse.json(jobs);
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
    });
    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    return apiError(e, "POST /api/jobs");
  }
}
