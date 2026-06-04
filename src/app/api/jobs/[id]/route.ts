import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { deleteJob, getJob, upsertJob } from "@/lib/db";
import { JOB_STAGES } from "@/lib/types";
import { z } from "zod";

const patchSchema = z.object({
  company: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  location: z.string().optional(),
  jobUrl: z.string().optional(),
  jobDescription: z.string().optional(),
  stage: z.enum(JOB_STAGES).optional(),
  notes: z.string().optional(),
  appliedAt: z.string().nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireUser();
    const job = await getJob(supabase, user.id, id);
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (e) {
    return apiError(e, "GET /api/jobs/[id]");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireUser();
    const existing = await getJob(supabase, user.id, id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let appliedAt = existing.appliedAt;
    if (parsed.data.appliedAt !== undefined) {
      appliedAt = parsed.data.appliedAt ?? undefined;
    } else if (
      parsed.data.stage &&
      parsed.data.stage !== "cv_created" &&
      parsed.data.stage !== "rejected" &&
      !appliedAt
    ) {
      appliedAt = new Date().toISOString();
    }

    const job = await upsertJob(supabase, user.id, {
      id,
      company: parsed.data.company ?? existing.company,
      role: parsed.data.role ?? existing.role,
      location: parsed.data.location ?? existing.location,
      jobUrl: parsed.data.jobUrl ?? existing.jobUrl,
      jobDescription: parsed.data.jobDescription ?? existing.jobDescription,
      stage: parsed.data.stage ?? existing.stage,
      notes: parsed.data.notes ?? existing.notes,
      appliedAt,
      createdAt: existing.createdAt,
    });
    return NextResponse.json(job);
  } catch (e) {
    return apiError(e, "PATCH /api/jobs/[id]");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, user } = await requireUser();
    const ok = await deleteJob(supabase, user.id, id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e, "DELETE /api/jobs/[id]");
  }
}
