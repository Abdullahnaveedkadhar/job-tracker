"use client";

import { useState } from "react";
import type { JobApplication } from "@/lib/types";

interface Props {
  onCreated: (job: JobApplication) => void;
}

export function AddJobForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          location: location || undefined,
          jobUrl: jobUrl || undefined,
          jobDescription: jobDescription || undefined,
          stage: "cv_created",
        }),
      });
      if (res.ok) {
        const job = await res.json();
        onCreated(job);
        setCompany("");
        setRole("");
        setLocation("");
        setJobUrl("");
        setJobDescription("");
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-add-tile">
        Add job application
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
        New application
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Company</label>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Role title</label>
          <input
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Job URL</label>
          <input
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label">Job description</label>
        <p className="mb-2 text-xs text-muted">Optional. Used when generating tailored CVs.</p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          className="textarea-input"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save application"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
