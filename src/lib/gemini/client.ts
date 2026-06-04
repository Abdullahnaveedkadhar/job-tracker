import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { z } from "zod";
import {
  CV_SYSTEM_PROMPT,
  COVER_LETTER_SYSTEM_PROMPT,
  buildCvUserPrompt,
  buildCoverLetterUserPrompt,
} from "./prompts";
import {
  generatedCvSchema,
  generatedCoverLetterSchema,
  type GeneratedCv,
  type GeneratedCoverLetter,
} from "./schemas";
import type { UserProfile } from "../types";

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = fenceMatch ? fenceMatch[1].trim() : trimmed;
  return JSON.parse(payload);
}

type ContentPart = string | Part;

function toParts(parts: ContentPart[]): Part[] {
  return parts.map((p) =>
    typeof p === "string" ? { text: p } : p
  );
}

export async function generateJsonWithParts<T>(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  parts: ContentPart[],
  schema: z.ZodType<T>
): Promise<T> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(toParts(parts));
  const text = result.response.text();
  if (!text) throw new Error("Gemini returned an empty response");

  let parsed: unknown;
  try {
    parsed = extractJson(text);
  } catch {
    throw new Error("Gemini response was not valid JSON. Try again.");
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `JSON did not match expected schema: ${validated.error.message}`
    );
  }
  return validated.data;
}

async function generateJson<T>(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  userPrompt: string,
  schema: z.ZodType<T>
): Promise<T> {
  return generateJsonWithParts(apiKey, modelName, systemPrompt, [userPrompt], schema);
}

export async function generateCvContent(
  apiKey: string,
  modelName: string,
  profile: UserProfile,
  jobDescription: string,
  company?: string,
  role?: string
): Promise<GeneratedCv> {
  return generateJson(
    apiKey,
    modelName,
    CV_SYSTEM_PROMPT,
    buildCvUserPrompt(profile, jobDescription, company, role),
    generatedCvSchema
  );
}

export async function generateCoverLetterContent(
  apiKey: string,
  modelName: string,
  profile: UserProfile,
  jobDescription: string,
  company: string,
  role: string
): Promise<GeneratedCoverLetter> {
  return generateJson(
    apiKey,
    modelName,
    COVER_LETTER_SYSTEM_PROMPT,
    buildCoverLetterUserPrompt(profile, jobDescription, company, role),
    generatedCoverLetterSchema
  );
}
