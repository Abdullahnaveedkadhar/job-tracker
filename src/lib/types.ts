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
  createdAt: string;
  updatedAt: string;
}

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
