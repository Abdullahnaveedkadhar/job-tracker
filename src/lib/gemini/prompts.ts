import type { UserProfile } from "../types";

export const CV_SYSTEM_PROMPT = `You are an expert UK careers coach and ATS (Applicant Tracking System) CV writer.

Your task is to produce CV content as structured JSON only. The CV must help the candidate pass automated screening and impress human recruiters.

Rules you must follow:
1. Use only facts present in the candidate profile. Never invent employers, dates, grades, tools, or achievements.
2. Write in clear British English (organisation, programme, specialise). Avoid em dashes and en dashes; use "to" for date ranges.
3. ATS formatting principles: use standard section names (Profile, Skills, Experience, Education, Projects, Additional information); plain text friendly structure; no tables, columns, icons, or graphics in the content; include relevant keywords from the job description only where they truthfully match the profile.
4. Tailor emphasis: reorder and rephrase bullets to highlight the most relevant experience for the job description. Do not add fake keywords.
5. Keep bullets concise, achievement focused, and scannable. Start bullets with strong verbs.
6. Profile summary: 3 to 5 sentences, tailored to the role.
7. If the profile lacks data for a section, omit that section in JSON (empty arrays) rather than fabricating.
8. Return ONLY valid JSON matching the schema given in the user message. No markdown fences, no commentary.`;

export const COVER_LETTER_SYSTEM_PROMPT = `You are an expert UK cover letter writer for graduate and early career technology roles.

Produce cover letter content as structured JSON only.

Rules:
1. Use only facts from the candidate profile. Never invent experience.
2. British English, professional but human tone. No em dashes or en dashes.
3. One page equivalent: 4 to 5 short paragraphs in the paragraphs array.
4. Open with role and company; explain fit using 2 to 3 evidenced examples from the profile; close with enthusiasm and availability.
5. Mirror language from the job description where honest.
6. Return ONLY valid JSON matching the schema. No markdown, no commentary.`;

export function buildCvUserPrompt(
  profile: UserProfile,
  jobDescription: string,
  company?: string,
  role?: string
) {
  return `Generate a tailored ATS friendly CV as JSON.

JSON schema:
{
  "fullName": string,
  "contactLine": string (email, phone, location on one line),
  "profile": string,
  "skillGroups": [{ "category": string, "items": string }],
  "experience": [{ "heading": "Role | Company", "dates": string, "bullets": string[] }],
  "projects": optional [{ "heading": string, "dates": string, "bullets": string[] }],
  "education": [{ "heading": "Degree | University | dates", "detail": optional string }],
  "additionalInfo": optional string,
  "atsKeywordsUsed": string[] (keywords from JD you honestly reflected)
}

Target role: ${role || "Not specified"}
Target company: ${company || "Not specified"}

Job description:
---
${jobDescription}
---

Candidate profile (source of truth):
---
${JSON.stringify(profile, null, 2)}
---`;
}

export function buildCoverLetterUserPrompt(
  profile: UserProfile,
  jobDescription: string,
  company: string,
  role: string
) {
  return `Generate a tailored cover letter as JSON.

JSON schema:
{
  "dateLine": string (e.g. 4 June 2026),
  "recipientBlock": string (Hiring Manager, company, location if known),
  "subjectLine": string (Re: Role title),
  "salutation": string,
  "paragraphs": string[],
  "closing": string (e.g. Yours sincerely,),
  "signatureName": string
}

Company: ${company}
Role: ${role}

Job description:
---
${jobDescription}
---

Candidate profile:
---
${JSON.stringify(profile, null, 2)}
---`;
}
