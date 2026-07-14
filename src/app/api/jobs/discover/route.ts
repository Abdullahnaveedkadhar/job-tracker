import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { apiError } from "@/lib/api-response";
import { runDiscover } from "@/lib/discover/run-discover";
import { z } from "zod";

const bodySchema = z.object({
  minScore: z.number().min(0).max(100).optional(),
  where: z.string().min(1).max(80).optional(),
});

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    let minScore: number | undefined;
    let where: string | undefined;
    try {
      const json = await request.json();
      const parsed = bodySchema.safeParse(json);
      if (parsed.success) {
        minScore = parsed.data.minScore;
        where = parsed.data.where;
      }
    } catch {
      // empty body is fine
    }

    const result = await runDiscover(supabase, user.id, { minScore, where });
    return NextResponse.json(result);
  } catch (e) {
    return apiError(e, "POST /api/jobs/discover");
  }
}
