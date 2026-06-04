export const CV_MAX_BYTES = 8 * 1024 * 1024;

export const CV_ACCEPT =
  ".pdf,.docx,.doc,.txt,.md,.rtf,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,image/png,image/jpeg,image/webp";

const EXTENSIONS = new Map<string, string>([
  ["pdf", "application/pdf"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["txt", "text/plain"],
  ["md", "text/plain"],
  ["rtf", "text/plain"],
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["webp", "image/webp"],
]);

const GEMINI_INLINE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function extensionFromName(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function resolveMimeType(filename: string, headerMime?: string): string {
  const ext = extensionFromName(filename);
  if (headerMime && headerMime !== "application/octet-stream") return headerMime;
  return EXTENSIONS.get(ext) ?? "application/octet-stream";
}

export function isGeminiInlineMime(mime: string): boolean {
  return GEMINI_INLINE_TYPES.has(mime);
}

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const SUPPORTED_EXT = new Set([
  "pdf",
  "docx",
  "txt",
  "md",
  "rtf",
  "png",
  "jpg",
  "jpeg",
  "webp",
]);

export function isSupportedCvUpload(filename: string, mime: string): boolean {
  const ext = extensionFromName(filename);
  if (ext === "doc") return false;
  if (SUPPORTED_EXT.has(ext)) return true;
  if (isGeminiInlineMime(mime)) return true;
  if (mime === "text/plain" || mime === DOCX_MIME) return true;
  return false;
}

export function unsupportedMessage(filename: string): string {
  return `Unsupported file type for "${filename}". Use PDF, Word (.docx), plain text, Markdown, or a clear photo/scan (PNG/JPG).`;
}
