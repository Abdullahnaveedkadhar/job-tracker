import type { DiscoveredJob } from "./types";

type AdzunaResult = {
  results?: Array<{
    id?: string | number;
    title?: string;
    description?: string;
    redirect_url?: string;
    company?: { display_name?: string };
    location?: { display_name?: string };
    salary_min?: number;
    salary_max?: number;
  }>;
};

function formatSalary(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const DEFAULT_QUERIES = [
  "junior software engineer",
  "graduate software developer",
  "junior frontend developer",
  "graduate software engineer react",
];

export async function fetchAdzunaJobs(opts?: {
  what?: string[];
  where?: string;
  pages?: number;
  perPage?: number;
}): Promise<DiscoveredJob[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) {
    return [];
  }

  const queries = opts?.what?.length ? opts.what : DEFAULT_QUERIES;
  const where = opts?.where ?? "uk";
  const pages = Math.min(opts?.pages ?? 2, 5);
  const perPage = Math.min(opts?.perPage ?? 50, 50);
  const out: DiscoveredJob[] = [];
  const seen = new Set<string>();

  for (const what of queries) {
    for (let page = 1; page <= pages; page++) {
      const url = new URL(
        `https://api.adzuna.com/v1/api/jobs/gb/search/${page}`
      );
      url.searchParams.set("app_id", appId);
      url.searchParams.set("app_key", appKey);
      url.searchParams.set("results_per_page", String(perPage));
      url.searchParams.set("what", what);
      url.searchParams.set("where", where);
      url.searchParams.set("content-type", "application/json");

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      });
      if (!res.ok) break;
      const data = (await res.json()) as AdzunaResult;
      for (const r of data.results ?? []) {
        const jobUrl = (r.redirect_url || "").trim();
        if (!jobUrl || seen.has(jobUrl)) continue;
        seen.add(jobUrl);
        out.push({
          company: r.company?.display_name?.trim() || "Unknown company",
          role: r.title?.trim() || "Role",
          location: r.location?.display_name,
          jobUrl,
          jobDescription: r.description,
          salary: formatSalary(r.salary_min, r.salary_max),
          source: "adzuna",
        });
      }
    }
  }

  return out;
}

export function adzunaConfigured(): boolean {
  return Boolean(
    process.env.ADZUNA_APP_ID?.trim() && process.env.ADZUNA_APP_KEY?.trim()
  );
}
