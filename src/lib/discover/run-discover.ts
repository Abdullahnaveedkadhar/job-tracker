import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countJobs,
  findJobByUrl,
  upsertJob,
} from "@/lib/db/jobs";
import { getProfile } from "@/lib/db/profile";
import { MAX_JOBS_PER_USER } from "@/lib/types";
import { adzunaConfigured, fetchAdzunaJobs } from "./adzuna";
import { fetchCompanyBoardJobs } from "./boards";
import { rankJobs } from "./rank";
import type { RankedJob } from "./types";

export type DiscoverResult = {
  fetched: number;
  inserted: number;
  updated: number;
  skippedCap: number;
  skippedLowScore: number;
  sources: {
    adzuna: number;
    boards: number;
    adzunaConfigured: boolean;
  };
  top: Array<Pick<RankedJob, "company" | "role" | "rankScore" | "source">>;
};

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString();
  } catch {
    return url.trim();
  }
}

export async function runDiscover(
  supabase: SupabaseClient,
  userId: string,
  opts?: { minScore?: number; where?: string }
): Promise<DiscoverResult> {
  const minScore = opts?.minScore ?? 45;
  const profile = await getProfile(supabase, userId);

  const [adzuna, boards] = await Promise.all([
    fetchAdzunaJobs({ where: opts?.where ?? "uk" }),
    fetchCompanyBoardJobs(),
  ]);

  const merged = new Map<string, (typeof adzuna)[number]>();
  for (const job of [...boards, ...adzuna]) {
    const key = normalizeUrl(job.jobUrl);
    if (!merged.has(key)) merged.set(key, { ...job, jobUrl: key });
  }

  const ranked = rankJobs([...merged.values()], profile);
  let existingCount = await countJobs(supabase, userId);
  let inserted = 0;
  let updated = 0;
  let skippedCap = 0;
  let skippedLowScore = 0;

  for (const job of ranked) {
    if (job.rankScore < minScore) {
      skippedLowScore += 1;
      continue;
    }

    const existing = await findJobByUrl(supabase, userId, job.jobUrl);
    if (existing) {
      // Refresh ranking metadata; do not reset applied stages.
      await upsertJob(supabase, userId, {
        id: existing.id,
        company: job.company,
        role: job.role,
        location: job.location ?? existing.location,
        jobUrl: job.jobUrl,
        jobDescription: job.jobDescription ?? existing.jobDescription,
        stage: existing.stage,
        notes: existing.notes,
        appliedAt: existing.appliedAt,
        rankScore: job.rankScore,
        source: job.source,
        salary: job.salary ?? existing.salary,
        matchReason: job.matchReason,
      });
      updated += 1;
      continue;
    }

    if (existingCount >= MAX_JOBS_PER_USER) {
      skippedCap += 1;
      continue;
    }

    await upsertJob(supabase, userId, {
      company: job.company,
      role: job.role,
      location: job.location,
      jobUrl: job.jobUrl,
      jobDescription: job.jobDescription,
      stage: "cv_created",
      notes: `Discovered ${new Date().toISOString().slice(0, 10)}. ${job.matchReason}`,
      rankScore: job.rankScore,
      source: job.source,
      salary: job.salary,
      matchReason: job.matchReason,
    });
    inserted += 1;
    existingCount += 1;
  }

  return {
    fetched: ranked.length,
    inserted,
    updated,
    skippedCap,
    skippedLowScore,
    sources: {
      adzuna: adzuna.length,
      boards: boards.length,
      adzunaConfigured: adzunaConfigured(),
    },
    top: ranked.slice(0, 8).map((j) => ({
      company: j.company,
      role: j.role,
      rankScore: j.rankScore,
      source: j.source,
    })),
  };
}
