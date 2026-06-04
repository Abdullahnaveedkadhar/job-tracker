"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { fetchJson } from "@/lib/fetch-json";

export default function SettingsPage() {
  const [target, setTarget] = useState(20);
  const [email, setEmail] = useState("");
  const [documentGeneration, setDocumentGeneration] = useState(true);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<{
      weeklyApplyTarget?: number;
      email?: string;
      documentGeneration?: boolean;
    }>("/api/settings")
      .then((data) => {
        setTarget(data.weeklyApplyTarget ?? 20);
        setEmail(data.email ?? "");
        setDocumentGeneration(data.documentGeneration !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    try {
      await fetchJson("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyApplyTarget: target }),
      });
      setStatus("Settings saved.");
    } catch {
      setStatus("Could not save settings. Try again.");
    }
  }

  if (loading) return <div className="skeleton max-w-lg" />;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Settings"
        description="Preferences for your job search and account."
      />

      <form onSubmit={save} className="card space-y-5 p-5">
        <div>
          <h2 className="section-title mb-1">Weekly apply target</h2>
          <p className="mb-3 text-sm text-secondary">
            How many applications you aim to submit each week. Shown on your
            dashboard progress bar.
          </p>
          <label className="label" htmlFor="weekly-target">
            Target per week
          </label>
          <input
            id="weekly-target"
            type="number"
            min={1}
            max={100}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="input max-w-[8rem]"
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Save changes
        </button>
        {status && (
          <p
            className={`text-center text-sm ${status.includes("saved") ? "text-success" : "text-danger"}`}
          >
            {status}
          </p>
        )}
      </form>

      <div className="card space-y-3 p-5">
        <h2 className="section-title">Account</h2>
        {email ? (
          <p className="text-sm" style={{ color: "var(--text)" }}>
            Signed in as <span className="font-medium">{email}</span>
          </p>
        ) : (
          <p className="text-sm text-secondary">Signed in</p>
        )}
        <p className="text-sm text-secondary">
          Your applications and profile are stored in your private account. Use
          Sign out in the header when you finish on a shared device.
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="section-title">CV and cover letters</h2>
        <p className="text-sm text-secondary">
          {documentGeneration
            ? "Tailored Word documents are available from the Generate page, using your saved profile and each job description."
            : "Document export is not enabled on this deployment yet. Your profile and job tracking still work as normal."}
        </p>
      </div>
    </div>
  );
}
