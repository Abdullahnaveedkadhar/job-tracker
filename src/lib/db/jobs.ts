import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobApplication, JobStage } from "../types";

type JobRow = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  location: string | null;
  job_url: string | null;
  job_description: string | null;
  stage: string;
  notes: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
};

function toJob(row: JobRow): JobApplication {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location ?? undefined,
    jobUrl: row.job_url ?? undefined,
    jobDescription: row.job_description ?? undefined,
    stage: row.stage as JobStage,
    notes: row.notes ?? undefined,
    appliedAt: row.applied_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getJobs(
  supabase: SupabaseClient,
  userId: string
): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data as JobRow[]).map(toJob);
}

export async function getJob(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<JobApplication | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toJob(data as JobRow) : null;
}

export async function upsertJob(
  supabase: SupabaseClient,
  userId: string,
  input: Omit<JobApplication, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
  }
): Promise<JobApplication> {
  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    company: input.company,
    role: input.role,
    location: input.location ?? null,
    job_url: input.jobUrl ?? null,
    job_description: input.jobDescription ?? null,
    stage: input.stage,
    notes: input.notes ?? null,
    applied_at: input.appliedAt ?? null,
    updated_at: now,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("user_id", userId)
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw error;
    return toJob(data as JobRow);
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      ...payload,
      created_at: input.createdAt ?? now,
    })
    .select()
    .single();

  if (error) throw error;
  return toJob(data as JobRow);
}

export async function deleteJob(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<boolean> {
  const { error, count } = await supabase
    .from("jobs")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
}
