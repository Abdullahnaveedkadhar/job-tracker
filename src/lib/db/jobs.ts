import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  JobApplication,
  JobListQuery,
  JobListResult,
  JobStage,
} from "../types";

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
  rank_score: number | string | null;
  source: string | null;
  salary: string | null;
  match_reason: string | null;
  created_at: string;
  updated_at: string;
};

function toJob(row: JobRow): JobApplication {
  const score =
    row.rank_score === null || row.rank_score === undefined
      ? undefined
      : Number(row.rank_score);
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
    rankScore: Number.isFinite(score) ? score : undefined,
    source: row.source ?? undefined,
    salary: row.salary ?? undefined,
    matchReason: row.match_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type JobUpsertInput = Omit<
  JobApplication,
  "id" | "createdAt" | "updatedAt"
> & {
  id?: string;
  createdAt?: string;
};

function toPayload(userId: string, input: JobUpsertInput, now: string) {
  return {
    user_id: userId,
    company: input.company,
    role: input.role,
    location: input.location ?? null,
    job_url: input.jobUrl ?? null,
    job_description: input.jobDescription ?? null,
    stage: input.stage,
    notes: input.notes ?? null,
    applied_at: input.appliedAt ?? null,
    rank_score: input.rankScore ?? 0,
    source: input.source ?? null,
    salary: input.salary ?? null,
    match_reason: input.matchReason ?? null,
    updated_at: now,
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
    .order("updated_at", { ascending: false })
    .limit(1000);

  if (error) throw error;
  return (data as JobRow[]).map(toJob);
}

export async function listJobs(
  supabase: SupabaseClient,
  userId: string,
  query: JobListQuery = {}
): Promise<JobListResult> {
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
  const offset = Math.max(query.offset ?? 0, 0);
  const sort = query.sort ?? "updated";

  let q = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("user_id", userId);

  if (query.stage === "active") {
    q = q.neq("stage", "rejected");
  } else if (query.stage && query.stage !== "all") {
    q = q.eq("stage", query.stage);
  }

  if (query.source) {
    q = q.ilike("source", `${query.source}%`);
  }

  if (typeof query.minScore === "number" && Number.isFinite(query.minScore)) {
    q = q.gte("rank_score", query.minScore);
  }

  if (query.q?.trim()) {
    const safe = query.q
      .trim()
      .replace(/[%_,.()\"']/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 80)
      .trim();
    if (safe) {
      const term = `%${safe}%`;
      q = q.or(
        `company.ilike.${term},role.ilike.${term},location.ilike.${term}`
      );
    }
  }

  if (sort === "rank") {
    q = q
      .order("rank_score", { ascending: false })
      .order("updated_at", { ascending: false });
  } else if (sort === "created") {
    q = q.order("created_at", { ascending: false });
  } else {
    q = q.order("updated_at", { ascending: false });
  }

  const { data, error, count } = await q.range(offset, offset + limit - 1);
  if (error) throw error;

  return {
    jobs: (data as JobRow[]).map(toJob),
    total: count ?? 0,
    limit,
    offset,
  };
}

export async function countJobs(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function findJobByUrl(
  supabase: SupabaseClient,
  userId: string,
  jobUrl: string
): Promise<JobApplication | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("job_url", jobUrl)
    .maybeSingle();
  if (error) throw error;
  return data ? toJob(data as JobRow) : null;
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
  input: JobUpsertInput
): Promise<JobApplication> {
  const now = new Date().toISOString();
  const payload = toPayload(userId, input, now);

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
