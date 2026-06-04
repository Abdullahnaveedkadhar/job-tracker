import { v4 as uuidv4 } from "uuid";
import type { UserProfile } from "../types";
import { generateJsonWithParts } from "./client";
import type { ParsedProfile } from "./profile-import-schema";
import { parsedProfileSchema } from "./profile-import-schema";

export const PROFILE_IMPORT_SYSTEM = `You extract structured career profile data from CV/resume documents.

Rules:
1. Use only information present in the document. Never invent employers, dates, grades, or skills.
2. British English spelling where you write prose.
3. Preserve role titles, company names, and dates as written (use "present" for current roles).
4. Split skills into sensible categories (e.g. Technical, Tools, Professional).
5. Each experience entry needs at least one bullet; use short phrases from the CV if needed.
6. If email/phone are missing, leave those fields empty.
7. Return ONLY valid JSON matching the schema in the user message. No markdown fences.`;

const SCHEMA_HINT = `JSON schema:
{
  "fullName": string,
  "email": string (optional),
  "phone": string (optional),
  "location": string (optional),
  "summary": string (optional, professional summary),
  "skillGroups": [{ "category": string, "items": string }] (optional),
  "experience": [{ "title", "company", "location?", "startDate", "endDate", "bullets": string[] }],
  "education": [{ "qualification", "institution", "dates", "detail?" }],
  "projects": [{ "name", "context?", "dates", "bullets": string[] }] (optional),
  "additionalInfo": string (optional)
}`;

export function parsedToUserProfile(
  parsed: ParsedProfile,
  fallbackEmail: string
): UserProfile {
  return {
    fullName: parsed.fullName.trim(),
    email: (parsed.email?.trim() || fallbackEmail).trim(),
    phone: parsed.phone?.trim() ?? "",
    location: parsed.location?.trim() ?? "",
    summary: parsed.summary?.trim() ?? "",
    skillGroups: (parsed.skillGroups ?? []).map((g) => ({
      id: uuidv4(),
      category: g.category,
      items: g.items,
    })),
    experience: (parsed.experience ?? []).map((e) => ({
      id: uuidv4(),
      title: e.title,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      bullets: e.bullets.filter(Boolean),
    })),
    education: (parsed.education ?? []).map((e) => ({
      id: uuidv4(),
      qualification: e.qualification,
      institution: e.institution,
      dates: e.dates,
      detail: e.detail,
    })),
    projects: (parsed.projects ?? []).map((p) => ({
      id: uuidv4(),
      name: p.name,
      context: p.context,
      dates: p.dates,
      bullets: p.bullets.filter(Boolean),
    })),
    additionalInfo: parsed.additionalInfo?.trim() ?? "",
    updatedAt: new Date().toISOString(),
  };
}

export async function parseProfileFromCvText(
  apiKey: string,
  modelName: string,
  cvText: string,
  accountEmail: string
): Promise<UserProfile> {
  const parsed = await generateJsonWithParts(
    apiKey,
    modelName,
    PROFILE_IMPORT_SYSTEM,
    [
      `${SCHEMA_HINT}\n\nExtract a complete profile from this CV text:\n\n${cvText}`,
    ],
    parsedProfileSchema
  );
  return parsedToUserProfile(parsed, accountEmail);
}

export async function parseProfileFromCvInline(
  apiKey: string,
  modelName: string,
  mimeType: string,
  base64: string,
  accountEmail: string
): Promise<UserProfile> {
  const parsed = await generateJsonWithParts(
    apiKey,
    modelName,
    PROFILE_IMPORT_SYSTEM,
    [
      { inlineData: { mimeType, data: base64 } },
      `${SCHEMA_HINT}\n\nExtract a complete profile from the attached CV document.`,
    ],
    parsedProfileSchema
  );
  return parsedToUserProfile(parsed, accountEmail);
}
