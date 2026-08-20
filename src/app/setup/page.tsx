import Link from "next/link";
import { readFileSync } from "fs";
import path from "path";
import { PageHeader } from "@/components/PageHeader";

function getSchemaSnippet(): string {
  try {
    const file = path.join(process.cwd(), "supabase", "schema.sql");
    return readFileSync(file, "utf8");
  } catch {
    return "-- Open job-dashboard/supabase/schema.sql in your repo";
  }
}

export default function SetupPage() {
  const schema = getSchemaSnippet();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Set up your database"
        description="Your Supabase project is connected, but the app tables have not been created yet. Run the SQL below once, then refresh the app."
      />

      <div className="card space-y-4 p-6 text-sm text-secondary">
        <section>
          <h2 className="section-title mb-2">1. Open Supabase SQL Editor</h2>
          <p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="font-medium"
              style={{ color: "var(--accent)" }}
            >
              supabase.com/dashboard
            </a>{" "}
            → your project → <strong>SQL</strong> → <strong>New query</strong>.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">2. Paste and run this schema</h2>
          <p className="mb-2">
            Copy everything below (or the file{" "}
            <code className="inline-code">supabase/schema.sql</code>), click{" "}
            <strong>Run</strong>, and wait for success.
          </p>
          <pre className="card-inner max-h-72 overflow-auto p-4 text-xs font-mono text-[var(--text)] whitespace-pre-wrap">
            {schema}
          </pre>
        </section>

        <section>
          <h2 className="section-title mb-2">3. Backfill your account (if you already signed up)</h2>
          <p>
            Run a second query from{" "}
            <code className="inline-code">supabase/backfill-existing-users.sql</code>{" "}
            so your user gets profile and settings rows.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">4. Profile data</h2>
          <p>
            Sign in and complete <strong>Profile</strong>. You can upload an
            existing CV to fill it in automatically, or load the starter template
            and edit from there.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">5. Verify</h2>
          <p>
            In the project folder run{" "}
            <code className="inline-code">npm run db:check</code> — you should see
            three green checks for profiles, jobs, and user_settings.
          </p>
        </section>
      </div>

      <Link href="/" className="btn-primary inline-block">
        Back to dashboard
      </Link>
    </div>
  );
}
