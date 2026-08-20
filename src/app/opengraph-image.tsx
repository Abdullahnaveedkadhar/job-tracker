import { ImageResponse } from "next/og";

export const alt =
  "Job Tracker — track applications and generate tailored CVs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card, rendered at build time so there is no binary to keep in sync. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0f",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#6366f1",
            }}
          />
          <div style={{ color: "#a1a1aa", fontSize: 30, fontWeight: 600 }}>
            Job Tracker
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              color: "#f4f4f5",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Track every application, and never send the same CV twice.
          </div>
          <div style={{ color: "#a1a1aa", fontSize: 30, lineHeight: 1.4 }}>
            Rank UK graduate roles against your profile, then export a tailored
            CV for each one.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Gemini"].map(
            (tech) => (
              <div
                key={tech}
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "#1a1a1f",
                  color: "#a1a1aa",
                  fontSize: 24,
                }}
              >
                {tech}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
