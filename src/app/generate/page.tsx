"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { fetchJson } from "@/lib/fetch-json";
import type { JobApplication } from "@/lib/types";

type DocType = "cv" | "cover-letter";

export default function GeneratePage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [docType, setDocType] = useState<DocType>("cv");
  const [format] = useState<"docx">("docx");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState("");

  useEffect(() => {
    fetchJson<JobApplication[]>("/api/jobs")
      .then(setJobs)
      .catch(() => setJobs([]));
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    const job = jobs.find((j) => j.id === selectedJobId);
    if (job) {
      setCompany(job.company);
      setRole(job.role);
      if (job.jobDescription) setJobDescription(job.jobDescription);
    }
  }, [selectedJobId, jobs]);

  async function generate() {
    setError("");
    setKeywords("");
    if (jobDescription.trim().length < 50) {
      setError("Job description must be at least 50 characters.");
      return;
    }
    if (docType === "cover-letter" && (!company.trim() || !role.trim())) {
      setError("Company and role are required for cover letters.");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        docType === "cv" ? "/api/generate/cv" : "/api/generate/cover-letter";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          company: company || undefined,
          role: role || undefined,
          format,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }

      const kw = res.headers.get("X-ATS-Keywords");
      if (kw) setKeywords(kw);

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `document.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Generate documents"
        description="Build a tailored Word CV or cover letter from your profile and a job description."
      />

      <div className="card space-y-5 p-5 sm:p-6">
        <div>
          <label className="label">Saved application</label>
          <select
            className="select-input"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">Enter details manually</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.role}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Company</label>
            <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label">Job description</label>
          <textarea
            className="textarea-input min-h-[220px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Document type</label>
            <select
              className="select-input"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
            >
              <option value="cv">Tailored CV</option>
              <option value="cover-letter">Cover letter</option>
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select className="select-input" value={format} disabled>
              <option value="docx">Word (.docx)</option>
            </select>
            <p className="mt-1.5 text-xs text-muted">ATS friendly single column layout</p>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={generate}
          className="btn-primary w-full py-3"
        >
          {loading ? "Generating…" : "Generate and download"}
        </button>

        {error && <p className="text-sm text-danger">{error}</p>}
        {keywords && (
          <p className="text-xs text-muted">
            Keywords reflected in output: {keywords}
          </p>
        )}
      </div>

      <div className="info-panel">
        <p className="info-panel-title">Before you send</p>
        <p>
          Documents are built from your profile and the job description you provide.
          Always read the download and adjust anything that needs to match the role
          or your voice.
        </p>
      </div>
    </div>
  );
}
