export const JOB_STAGES = [
  "cv_created",
  "applied",
  "acknowledged",
  "interview",
  "test_centre",
  "final_interview",
  "offer",
  "rejected",
] as const;

export type JobStage = (typeof JOB_STAGES)[number];

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location?: string;
  jobUrl?: string;
  jobDescription?: string;
  stage: JobStage;
  notes?: string;
  appliedAt?: string;
  /** 0–100 fit score from discovery ranker */
  rankScore?: number;
  /** e.g. adzuna, greenhouse:monzo, lever:scottlogic, manual */
  source?: string;
  salary?: string;
  matchReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListQuery {
  q?: string;
  stage?: JobStage | "all" | "active";
  source?: string;
  minScore?: number;
  sort?: "rank" | "updated" | "created";
  limit?: number;
  offset?: number;
}

export interface JobListResult {
  jobs: JobApplication[];
  total: number;
  limit: number;
  offset: number;
}

/** Soft cap for stored roles per user (discover stops inserting above this). */
export const MAX_JOBS_PER_USER = 1000;

export interface ProfileExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ProfileEducation {
  id: string;
  qualification: string;
  institution: string;
  dates: string;
  detail?: string;
}

export interface ProfileProject {
  id: string;
  name: string;
  context?: string;
  dates: string;
  bullets: string[];
}

export interface ProfileSkillGroup {
  id: string;
  category: string;
  items: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  summary: string;
  skillGroups: ProfileSkillGroup[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  projects: ProfileProject[];
  additionalInfo?: string;
  updatedAt: string;
}

export interface AppSettings {
  weeklyApplyTarget: number;
  preferredModel: string;
}

export const DEFAULT_WEEKLY_TARGET = 20;
