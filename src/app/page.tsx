import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isDemoEnabled } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Job Tracker — track applications and generate tailored CVs",
  description:
    "Find UK graduate roles, rank them against your profile, track every application through its pipeline, and export tailored CVs and cover letters as Word documents.",
};

const features = [
  {
    title: "Discover roles",
    body: "Pulls openings from the Adzuna API and curated Greenhouse and Lever boards, then scores each one against your profile so the closest matches surface first.",
  },
  {
    title: "Track the pipeline",
    body: "Every application moves through stages from CV created to offer. Filter by stage, search, and sort by match score or last activity.",
  },
  {
    title: "Generate documents",
    body: "Feed in a job description and export a tailored, ATS-friendly CV or cover letter as a .docx, built from your stored profile.",
  },
  {
    title: "Keep a weekly pace",
    body: "Set a weekly application target and track progress against it, so a slow week is visible before it becomes a slow month.",
  },
];

const stack = [
  "Next.js",
  "TypeScript",
  "React",
  "Supabase",
  "PostgreSQL",
  "Tailwind CSS",
  "Gemini API",
  "Vercel",
];

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4 sm:py-8">
      <header className="flex items-center justify-between gap-4">
        <span className="text-base font-bold tracking-tight">Job Tracker</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </div>
      </header>

      <section className="space-y-6">
        <h1 className="page-title max-w-3xl text-balance">
          Track every application, and never send the same CV twice.
        </h1>
        <p className="page-description max-w-2xl">
          Job Tracker finds UK graduate and junior roles, ranks them against
          your profile, and generates a tailored CV and cover letter for each
          one. Built to replace the spreadsheet I was keeping during my own job
          search.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {isDemoEnabled ? (
            <Link href="/login" className="btn-primary">
              Try the live demo
            </Link>
          ) : (
            <Link href="/signup" className="btn-primary">
              Create an account
            </Link>
          )}
          <a
            href="https://github.com/Abdullahnaveedkadhar/job-tracker"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            View source on GitHub
          </a>
        </div>
        {isDemoEnabled ? (
          <p className="text-sm text-muted">
            The demo signs you into a shared read-only account with sample data.
            No registration needed.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="card p-5">
            <h2 className="mb-2 text-base font-semibold">{feature.title}</h2>
            <p className="text-sm text-secondary">{feature.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">How it works</h2>
        <ol className="space-y-3">
          {[
            "Add your profile once, either by uploading an existing CV or filling in the form.",
            "Run Discover to pull in roles and rank them against that profile.",
            "Paste a job description and export a tailored CV or cover letter.",
            "Move each application through the pipeline as you hear back.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-secondary">
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "var(--bg-accent)", color: "var(--accent)" }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Built with</h2>
        <ul className="flex flex-wrap gap-2">
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
            >
              {tech}
            </li>
          ))}
        </ul>
        <p className="text-sm text-secondary">
          Per-user data isolated with Postgres row-level security, request
          validation with Zod, and document generation server-side.
        </p>
      </section>

      <footer
        className="border-t pt-6 text-sm text-muted"
        style={{ borderColor: "var(--border)" }}
      >
        <p>
          Built by Abdullah Naveed ·{" "}
          <a
            href="https://github.com/Abdullahnaveedkadhar/job-tracker"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            Source
          </a>
        </p>
      </footer>
    </div>
  );
}
