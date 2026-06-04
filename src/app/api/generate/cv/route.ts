import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth/server";
import { getProfile, getSettings, resolveGeminiKey } from "@/lib/db";
import { generateCvContent } from "@/lib/gemini/client";
import { buildCvDocx } from "@/lib/docx/build-cv";
import { z } from "zod";

const schema = z.object({
  jobDescription: z.string().min(50),
  company: z.string().optional(),
  role: z.string().optional(),
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

    if (!profile.fullName.trim()) {
      return NextResponse.json(
        { error: "Complete your profile before generating a CV" },
        { status: 400 }
      );
    }

    const cv = await generateCvContent(
      apiKey,
      settings.preferredModel ?? "gemini-2.0-flash",
      profile,
      parsed.data.jobDescription,
      parsed.data.company,
      parsed.data.role
    );
    const buffer = await buildCvDocx(cv);
    const slug = (parsed.data.company || "tailored-cv")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${slug}-cv.docx"`,
        "X-ATS-Keywords": (cv.atsKeywordsUsed ?? []).join(", "),
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
