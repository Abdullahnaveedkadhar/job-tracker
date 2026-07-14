import { COMPANY_BOARDS, type CompanyBoard } from "./company-boards";
import type { DiscoveredJob } from "./types";

type GhJob = {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  updated_at?: string;
};

type GhJobsResponse = { jobs?: GhJob[] };

type LeverJob = {
  id: string;
  text: string;
  hostedUrl: string;
  categories?: { location?: string; commitment?: string; team?: string };
  descriptionPlain?: string;
  description?: string;
};

const ROLE_HINT =
  /\b(junior|graduate|grad|software|engineer|developer|frontend|front[- ]?end|full[- ]?stack|react|typescript)\b/i;

function relevantTitle(title: string): boolean {
  if (/senior|principal|staff|director|manager/i.test(title) && !/junior|graduate|grad\b/i.test(title)) {
    return false;
  }
  return ROLE_HINT.test(title);
}

async function fetchGreenhouse(board: Extract<CompanyBoard, { kind: "greenhouse" }>): Promise<DiscoveredJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board.token)}/jobs`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = (await res.json()) as GhJobsResponse;
  const out: DiscoveredJob[] = [];
  for (const job of data.jobs ?? []) {
    if (!relevantTitle(job.title)) continue;
    out.push({
      company: board.label,
      role: job.title,
      location: job.location?.name,
      jobUrl: job.absolute_url,
      jobDescription: undefined,
      source: `greenhouse:${board.token}`,
    });
  }
  return out;
}

async function fetchLever(board: Extract<CompanyBoard, { kind: "lever" }>): Promise<DiscoveredJob[]> {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(board.company)}?mode=json`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = (await res.json()) as LeverJob[];
  if (!Array.isArray(data)) return [];
  const out: DiscoveredJob[] = [];
  for (const job of data) {
    if (!relevantTitle(job.text)) continue;
    out.push({
      company: board.label,
      role: job.text,
      location: job.categories?.location,
      jobUrl: job.hostedUrl,
      jobDescription: job.descriptionPlain || job.description,
      source: `lever:${board.company}`,
    });
  }
  return out;
}

export async function fetchCompanyBoardJobs(
  boards: CompanyBoard[] = COMPANY_BOARDS
): Promise<DiscoveredJob[]> {
  const settled = await Promise.allSettled(
    boards.map((b) =>
      b.kind === "greenhouse" ? fetchGreenhouse(b) : fetchLever(b)
    )
  );
  const out: DiscoveredJob[] = [];
  const seen = new Set<string>();
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const job of r.value) {
      if (seen.has(job.jobUrl)) continue;
      seen.add(job.jobUrl);
      out.push(job);
    }
  }
  return out;
}
