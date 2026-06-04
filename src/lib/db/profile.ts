import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile } from "../types";

type ProfileRow = {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  summary: string;
  additional_info: string | null;
  skill_groups: UserProfile["skillGroups"];
  experience: UserProfile["experience"];
  education: UserProfile["education"];
  projects: UserProfile["projects"];
  updated_at: string;
};

function emptyProfile(email = ""): UserProfile {
  return {
    fullName: "",
    email,
    phone: "",
    location: "",
    summary: "",
    skillGroups: [],
    experience: [],
    education: [],
    projects: [],
    additionalInfo: "",
    updatedAt: new Date().toISOString(),
  };
}

function toProfile(row: ProfileRow): UserProfile {
  return {
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? "",
    location: row.location ?? "",
    summary: row.summary,
    skillGroups: row.skill_groups ?? [],
    experience: row.experience ?? [],
    education: row.education ?? [],
    projects: row.projects ?? [],
    additionalInfo: row.additional_info ?? "",
    updatedAt: row.updated_at,
  };
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
  fallbackEmail = ""
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const { error: bootError } = await supabase.from("profiles").insert({
      user_id: userId,
      email: fallbackEmail,
      full_name: "",
    });
    if (bootError) throw bootError;
    return emptyProfile(fallbackEmail);
  }
  return toProfile(data as ProfileRow);
}

export async function saveProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: UserProfile
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    full_name: profile.fullName,
    email: profile.email,
    phone: profile.phone ?? "",
    location: profile.location,
    summary: profile.summary,
    additional_info: profile.additionalInfo ?? "",
    skill_groups: profile.skillGroups,
    experience: profile.experience,
    education: profile.education,
    projects: profile.projects,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row)
    .select()
    .single();

  if (error) throw error;
  return toProfile(data as ProfileRow);
}
