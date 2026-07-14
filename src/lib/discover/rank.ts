import type { UserProfile } from "@/lib/types";
import type { DiscoveredJob, RankedJob } from "./types";

const POSITIVE_ROLE = [
  "junior",
  "graduate",
  "grad ",
  " new grad",
  "early career",
  "entry level",
  "frontend",
  "front-end",
  "front end",
  "react",
  "next.js",
  "nextjs",
  "typescript",
  "software engineer",
  "software developer",
  "full stack",
  "fullstack",
  "web developer",
];

const NEGATIVE_ROLE = [
  "senior",
  "principal",
  "staff engineer",
  "staff software",
  "lead engineer",
  "lead developer",
  "engineering manager",
  "director",
  "internship only",
  "unpaid",
];

const HARD_GATES = [
  "must have a*",
  "a* in maths",
  "a* maths",
  "sc cleared",
  "security clearance required",
  "5 years uk residency",
];

const UK_LOCATIONS = [
  "liverpool",
  "manchester",
  "london",
  "bristol",
  "cambridge",
  "birmingham",
  "leeds",
  "edinburgh",
  "glasgow",
  "newcastle",
  "cardiff",
  "belfast",
  "uk",
  "united kingdom",
  "remote uk",
  "hybrid",
];

function haystack(job: DiscoveredJob): string {
  return [
    job.role,
    job.company,
    job.location ?? "",
    job.salary ?? "",
    job.jobDescription ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function profileSkillTokens(profile?: UserProfile | null): string[] {
  if (!profile) return ["react", "next.js", "typescript", "javascript", "python"];
  const fromSkills = profile.skillGroups.flatMap((g) =>
    g.items
      .split(/[,;/|]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 1)
  );
  const fromSummary = (profile.summary || "")
    .toLowerCase()
    .match(
      /\b(react|next\.?js|typescript|javascript|python|node|flutter|docker|aws|gcp)\b/g
    );
  return [...new Set([...fromSkills, ...(fromSummary ?? [])])].slice(0, 40);
}

export function rankJob(
  job: DiscoveredJob,
  profile?: UserProfile | null
): RankedJob {
  const text = haystack(job);
  const reasons: string[] = [];
  let score = 35;

  for (const gate of HARD_GATES) {
    if (text.includes(gate)) {
      return {
        ...job,
        rankScore: 5,
        matchReason: `Low score: listing mentions "${gate}".`,
      };
    }
  }

  for (const p of POSITIVE_ROLE) {
    if (text.includes(p)) {
      score += 6;
      reasons.push(p.trim());
    }
  }

  for (const n of NEGATIVE_ROLE) {
    if (text.includes(n)) {
      score -= 12;
      reasons.push(`penalty:${n.trim()}`);
    }
  }

  for (const loc of UK_LOCATIONS) {
    if ((job.location ?? "").toLowerCase().includes(loc) || text.includes(loc)) {
      score += 3;
      reasons.push(`loc:${loc}`);
      break;
    }
  }

  const skills = profileSkillTokens(profile);
  let skillHits = 0;
  for (const skill of skills) {
    if (skill.length < 2) continue;
    if (text.includes(skill.toLowerCase())) {
      skillHits += 1;
      score += 4;
    }
  }
  if (skillHits > 0) reasons.push(`${skillHits} skill match(es)`);

  if (job.salary) {
    score += 4;
    reasons.push("salary listed");
  }

  if (job.source.startsWith("greenhouse:") || job.source.startsWith("lever:")) {
    score += 5;
    reasons.push("company board");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  const uniqueReasons = [...new Set(reasons)].slice(0, 6);
  return {
    ...job,
    rankScore: score,
    matchReason:
      uniqueReasons.length > 0
        ? uniqueReasons.join("; ")
        : "General UK software role.",
  };
}

export function rankJobs(
  jobs: DiscoveredJob[],
  profile?: UserProfile | null
): RankedJob[] {
  return jobs
    .map((j) => rankJob(j, profile))
    .sort((a, b) => b.rankScore - a.rankScore);
}
