export { getJobs, getJob, upsertJob, deleteJob } from "./db/jobs";
export { getProfile, saveProfile } from "./db/profile";
export { getSettings, saveSettings } from "./db/settings";

export function resolveGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || null;
}
