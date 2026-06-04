import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth/server";
import { getProfile, getSettings, resolveGeminiKey } from "@/lib/db";
import { generateCoverLetterContent } from "@/lib/gemini/client";
import { buildCoverLetterDocx } from "@/lib/docx/build-cover-letter";
import { z } from "zod";

const schema = z.object({
  jobDescription: z.string().min(50),
  company: z.string().min(1),
  role: z.string().min(1),
  format: z.enum(["docx"]).default("docx"),
});

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const apiKey = resolveGeminiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Document generation is not available on this deployment." },
        { status: 503 }
      );
    }

    const [profile, settings] = await Promise.all([
      getProfile(supabase, user.id, user.email ?? ""),
      getSettings(supabase, user.id),
    ]);

    const letter = await generateCoverLetterContent(
      apiKey,
      settings.preferredModel ?? "gemini-2.0-flash",
      profile,
      parsed.data.jobDescription,
      parsed.data.company,
      parsed.data.role
    );
    const buffer = await buildCoverLetterDocx(letter);
    const slug = parsed.data.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${slug}-cover-letter.docx"`,
      },
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
