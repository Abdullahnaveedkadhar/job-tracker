import type { JobApplication } from "./types";
import { STAGE_META } from "./stages";

export function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export function countWeeklyApplications(
  jobs: JobApplication[],
  targetDate = new Date()
): number {
  const { start, end } = getWeekBounds(targetDate);
  return jobs.filter((job) => {
    if (!job.appliedAt) return false;
    const applied = new Date(job.appliedAt);
    if (applied < start || applied > end) return false;
    return STAGE_META[job.stage].countsTowardWeekly;
  }).length;
}

export function formatWeekLabel(date = new Date()) {
  const { start, end } = getWeekBounds(date);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(start)} to ${fmt(end)}`;
}
