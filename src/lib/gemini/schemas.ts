import { z } from "zod";

export const generatedCvSchema = z.object({
  fullName: z.string(),
  contactLine: z.string(),
  profile: z.string(),
  skillGroups: z.array(
    z.object({
      category: z.string(),
      items: z.string(),
    })
  ),
  experience: z.array(
    z.object({
      heading: z.string(),
      dates: z.string(),
      bullets: z.array(z.string()).min(1),
    })
  ),
  projects: z
    .array(
      z.object({
        heading: z.string(),
        dates: z.string(),
        bullets: z.array(z.string()),
      })
    )
    .optional(),
  education: z.array(
    z.object({
      heading: z.string(),
      detail: z.string().optional(),
    })
  ),
  additionalInfo: z.string().optional(),
  atsKeywordsUsed: z.array(z.string()).optional(),
});

export type GeneratedCv = z.infer<typeof generatedCvSchema>;

export const generatedCoverLetterSchema = z.object({
  dateLine: z.string(),
  recipientBlock: z.string(),
  subjectLine: z.string(),
  salutation: z.string(),
  paragraphs: z.array(z.string()).min(2).max(6),
  closing: z.string(),
  signatureName: z.string(),
});

export type GeneratedCoverLetter = z.infer<typeof generatedCoverLetterSchema>;
