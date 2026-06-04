import type { JobStage } from "./types";

export const STAGE_META: Record<
  JobStage,
  { label: string; colour: string; countsTowardWeekly: boolean }
> = {
  cv_created: { label: "CV created", colour: "bg-slate-500", countsTowardWeekly: false },
  applied: { label: "Applied", colour: "bg-blue-500", countsTowardWeekly: true },
  acknowledged: {
    label: "Acknowledged",
    colour: "bg-cyan-500",
    countsTowardWeekly: true,
  },
  interview: { label: "Interview", colour: "bg-violet-500", countsTowardWeekly: true },
  test_centre: {
    label: "Test / assessment",
    colour: "bg-amber-500",
    countsTowardWeekly: true,
  },
  final_interview: {
    label: "Final interview",
    colour: "bg-indigo-500",
    countsTowardWeekly: true,
  },
  offer: { label: "Offer", colour: "bg-emerald-500", countsTowardWeekly: true },
  rejected: { label: "Rejected", colour: "bg-rose-500", countsTowardWeekly: false },
};

export function stageProgress(stage: JobStage): number {
  const index = Object.keys(STAGE_META).indexOf(stage);
  if (stage === "rejected") return 100;
  return Math.round(((index + 1) / (Object.keys(STAGE_META).length - 1)) * 100);
}

export function stageIndex(stage: JobStage): number {
  return Object.keys(STAGE_META).indexOf(stage);
}
