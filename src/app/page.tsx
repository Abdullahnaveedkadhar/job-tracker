"use client";

import { useCallback, useEffect, useState } from "react";
import { AddJobForm } from "@/components/AddJobForm";
import { JobTile } from "@/components/JobTile";
import { PageHeader } from "@/components/PageHeader";
import { WeeklyTarget } from "@/components/WeeklyTarget";
import { fetchJson } from "@/lib/fetch-json";
import type { JobApplication } from "@/lib/types";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "rejected">("active");

  const load = useCallback(async () => {
    setLoadError("");
    try {
      setJobs(await fetchJson<JobApplication[]>("/api/jobs"));
    } catch (e) {
      setJobs([]);
      setLoadError(e instanceof Error ? e.message : "Could not load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = jobs.filter((j) => {
    if (filter === "rejected") return j.stage === "rejected";
    if (filter === "active") return j.stage !== "rejected";
    return true;
  });

  function refreshWeekly() {
    window.dispatchEvent(new Event("weekly-refresh"));
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Applications"
        description="Track each role, move through your pipeline, and stay on pace for your weekly apply target."
      />

      {loadError ? (
        <p className="rounded-lg border px-4 py-3 text-sm text-secondary" style={{ borderColor: "var(--danger)" }}>
          {loadError}
        </p>
      ) : null}

      <WeeklyTarget />

      <div className="flex flex-wrap gap-2">
        {(["active", "all", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={filter === f ? "btn-filter btn-filter-active" : "btn-filter"}
          >
            {f}
          </button>
        ))}
      </div>

      <AddJobForm
        onCreated={(job) => {
          setJobs((prev) => [job, ...prev]);
          refreshWeekly();
        }}
      />

      {loading ? (
        <div className="skeleton" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          No applications in this view. Add a new role above to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobTile
              key={job.id}
              job={job}
              onUpdated={(updated) => {
                setJobs((prev) =>
                  prev.map((j) => (j.id === updated.id ? updated : j))
                );
                refreshWeekly();
              }}
              onDeleted={(id) => {
                setJobs((prev) => prev.filter((j) => j.id !== id));
                refreshWeekly();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
