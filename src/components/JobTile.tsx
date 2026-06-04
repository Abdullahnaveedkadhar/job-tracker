"use client";

import { useState } from "react";
import type { JobApplication, JobStage } from "@/lib/types";
import { JOB_STAGES } from "@/lib/types";
import { STAGE_META, stageProgress } from "@/lib/stages";

interface Props {
  job: JobApplication;
  onUpdated: (job: JobApplication) => void;
  onDeleted: (id: string) => void;
}

export function JobTile({ job, onUpdated, onDeleted }: Props) {
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const progress = stageProgress(job.stage);
  const rejected = job.stage === "rejected";

  async function updateStage(stage: JobStage) {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) onUpdated(await res.json());
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes(notes: string) {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) onUpdated(await res.json());
  }

  async function remove() {
    if (!confirm(`Delete ${job.company}, ${job.role}?`)) return;
    const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(job.id);
  }

  return (
    <article
      className={`card flex flex-col p-4 transition hover:border-[var(--accent)] ${
        rejected ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold" style={{ color: "var(--text)" }}>
            {job.role}
          </h3>
          <p className="text-sm text-secondary">{job.company}</p>
          {job.location && <p className="mt-0.5 text-xs text-muted">{job.location}</p>}
        </div>
        <span className={`badge shrink-0 ${STAGE_META[job.stage].colour}`}>
          {STAGE_META[job.stage].label}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-muted">
          <span>Pipeline</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`h-full rounded-full transition-all ${STAGE_META[job.stage].colour}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {JOB_STAGES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={saving}
            onClick={() => updateStage(s)}
            className={job.stage === s ? "btn-stage btn-stage-active" : "btn-stage"}
          >
            {STAGE_META[s].label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="btn-ghost mt-3 self-start px-0"
      >
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs font-medium"
              style={{ color: "var(--accent)" }}
            >
              {job.jobUrl}
            </a>
          )}
          <div>
            <label className="label">Notes</label>
            <textarea
              defaultValue={job.notes ?? ""}
              rows={3}
              className="textarea-input text-xs"
              onBlur={(e) => saveNotes(e.target.value)}
            />
          </div>
          <button type="button" onClick={remove} className="btn-danger-ghost">
            Delete application
          </button>
        </div>
      )}
    </article>
  );
}
