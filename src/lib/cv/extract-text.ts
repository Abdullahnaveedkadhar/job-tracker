import mammoth from "mammoth";
import {
  extensionFromName,
  isGeminiInlineMime,
  isSupportedCvUpload,
  resolveMimeType,
  unsupportedMessage,
} from "./supported-formats";

export type CvExtractResult =
  | { kind: "text"; text: string }
  | { kind: "inline"; mimeType: string; base64: string }
  | { kind: "error"; message: string };

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function extractCvContent(
  buffer: Buffer,
  filename: string,
  headerMime?: string
): Promise<CvExtractResult> {
  const mime = resolveMimeType(filename, headerMime);

  if (!isSupportedCvUpload(filename, mime)) {
    const ext = extensionFromName(filename);
    if (ext === "doc") {
      return {
        kind: "error",
        message:
          "Old Word .doc files are not supported. Open in Word and Save As .docx, or export as PDF.",
      };
    }
    return { kind: "error", message: unsupportedMessage(filename) };
  }

  if (isGeminiInlineMime(mime)) {
    return {
      kind: "inline",
      mimeType: mime,
      base64: buffer.toString("base64"),
    };
  }

  if (mime === DOCX_MIME) {
    const { value } = await mammoth.extractRawText({ buffer });
    const text = value.trim();
    if (!text) {
      return {
        kind: "error",
        message:
          "Could not read text from this Word file. Try exporting as PDF or paste into a .txt file.",
      };
    }
    return { kind: "text", text: truncate(text) };
  }

  const text = buffer.toString("utf8").trim();
  if (!text) {
    return { kind: "error", message: "File appears empty." };
  }
  return { kind: "text", text: truncate(text) };
}

function truncate(text: string, max = 120_000): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "\n\n[Document truncated for processing]";
}
