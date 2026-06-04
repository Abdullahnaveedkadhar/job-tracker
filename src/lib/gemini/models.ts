export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Google retires older model IDs; map them to a current default */
const RETIRED_MODEL_ALIASES: Record<string, string> = {
  "gemini-2.0-flash": DEFAULT_GEMINI_MODEL,
  "gemini-2.0-flash-lite": DEFAULT_GEMINI_MODEL,
  "gemini-1.5-pro": DEFAULT_GEMINI_MODEL,
  "gemini-1.5-flash": DEFAULT_GEMINI_MODEL,
};

export function normalizeGeminiModel(model?: string): string {
  const trimmed = model?.trim();
  if (!trimmed) return DEFAULT_GEMINI_MODEL;
  return RETIRED_MODEL_ALIASES[trimmed] ?? trimmed;
}

export function resolveGeminiModel(dbModel?: string): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  return normalizeGeminiModel(fromEnv || dbModel);
}
