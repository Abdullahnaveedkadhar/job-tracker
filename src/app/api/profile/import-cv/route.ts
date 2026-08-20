import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth/server";
import { extractCvContent } from "@/lib/cv/extract-text";
import { CV_MAX_BYTES } from "@/lib/cv/supported-formats";
import {
  getProfile,
  getSettings,
  resolveGeminiKey,
  resolveGeminiModel,
  saveProfile,
} from "@/lib/db";
import { formatGeminiError } from "@/lib/gemini/errors";
import {
  parseProfileFromCvInline,
  parseProfileFromCvText,
} from "@/lib/gemini/profile-import";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const apiKey = resolveGeminiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Document import is not available on this deployment." },
        { status: 503 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Choose a CV file to upload." }, { status: 400 });
    }

    if (file.size > CV_MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 8 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractCvContent(buffer, file.name, file.type);

    if (extracted.kind === "error") {
      return NextResponse.json({ error: extracted.message }, { status: 400 });
    }

    const settings = await getSettings(supabase, user.id);
    const model = resolveGeminiModel(settings.preferredModel);
    const accountEmail = user.email ?? "";

    const profile =
      extracted.kind === "inline"
        ? await parseProfileFromCvInline(
            apiKey,
            model,
            extracted.mimeType,
            extracted.base64,
            accountEmail
          )
        : await parseProfileFromCvText(
            apiKey,
            model,
            extracted.text,
            accountEmail
          );

    if (!profile.fullName.trim()) {
      return NextResponse.json(
        { error: "Could not find a name in that CV. Try a clearer file." },
        { status: 422 }
      );
    }

    const existing = await getProfile(supabase, user.id, accountEmail);
    const merged = {
      ...profile,
      email: profile.email || existing.email || accountEmail,
    };

    const saved = await saveProfile(supabase, user.id, merged);
    return NextResponse.json(saved);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = formatGeminiError(e);
    const status = message.includes("quota") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
