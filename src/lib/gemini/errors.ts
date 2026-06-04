export function formatGeminiError(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  if (message.includes("404") && message.includes("no longer available")) {
    return (
      "That Gemini model has been retired. Redeploy the latest app version or set GEMINI_MODEL=gemini-2.5-flash in Vercel."
    );
  }
  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return (
      "Gemini API quota reached. Enable billing in Google AI Studio, check usage at ai.dev/rate-limit, " +
      "or set GEMINI_MODEL to another model in Vercel (e.g. gemini-2.5-flash), then try again in a minute."
    );
  }
  if (message.includes("API_KEY_INVALID") || message.includes("403")) {
    return "Invalid Gemini API key. Use a key from aistudio.google.com (starts with AIza) in Vercel.";
  }
  return message || "Generation failed";
}
