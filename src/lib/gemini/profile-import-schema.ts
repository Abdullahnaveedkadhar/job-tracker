import { z } from "zod";

export const parsedProfileSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  skillGroups: z
    .array(
      z.object({
        category: z.string(),
        items: z.string(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        location: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
        bullets: z.array(z.string()),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        qualification: z.string(),
        institution: z.string(),
        dates: z.string(),
        detail: z.string().optional(),
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        context: z.string().optional(),
        dates: z.string(),
        bullets: z.array(z.string()),
      })
    )
    .optional(),
  additionalInfo: z.string().optional(),
});

export type ParsedProfile = z.infer<typeof parsedProfileSchema>;
