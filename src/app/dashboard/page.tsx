"use client";

import { useEffect, useState } from "react";
import { AddJobForm } from "@/components/AddJobForm";
import { JobTile } from "@/components/JobTile";
import { PageHeader } from "@/components/PageHeader";
import { WeeklyTarget } from "@/components/WeeklyTarget";
import { fetchJson } from "@/lib/fetch-json";
import type { JobApplication, JobListResult } from "@/lib/types";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "rejected">("active");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"rank" | "updated">("updated");
  const [offset, setOffset] = useState(0);
  const limit = 48;

  useEffect(() => {
    // Filters change faster than requests resolve, so ignore any response that
    // is no longer the one this effect asked for.
    let current = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const params = new URLSearchParams({
          stage: filter,
          sort,
          limit: String(limit),
          offset: String(offset),
        });
        if (q.trim()) params.set("q", q.trim());
        const data = await fetchJson<JobListResult>(`/api/jobs?${params}`);
        if (!current) return;
        setJobs(data.jobs);
        setTotal(data.total);
      } catch (e) {
        if (!current) return;
        setJobs([]);
        setTotal(0);
        setLoadError(
          e instanceof Error ? e.message : "Could not load applications"
        );
      } finally {
        if (current) setLoading(false);
      }
    }

    load();
    return () => {
      current = false;
    };
  }, [filter, q, sort, offset]);

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
            onClick={() => {
              setOffset(0);
              setFilter(f);
            }}
            className={filter === f ? "btn-filter btn-filter-active" : "btn-filter"}
          >
            {f}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSort(sort === "rank" ? "updated" : "rank")}
          className={sort === "rank" ? "btn-filter btn-filter-active" : "btn-filter"}
        >
          {sort === "rank" ? "Sorted by match" : "Sort by match"}
        </button>
      </div>

      <label className="block max-w-md">
        <span className="label">Filter</span>
        <input
          className="text-input"
          value={q}
          onChange={(e) => {
            setOffset(0);
            setQ(e.target.value);
          }}
          placeholder="Search company, role, location..."
        />
      </label>

      <AddJobForm
        onCreated={(job) => {
          setJobs((prev) => [job, ...prev]);
          setTotal((t) => t + 1);
          refreshWeekly();
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-secondary">
        <span>
          {total === 0
            ? "0 roles"
            : `${offset + 1}-${Math.min(offset + limit, total)} of ${total}`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost"
            disabled={offset <= 0 || loading}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={offset + limit >= total || loading}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" />
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          No applications in this view. Use Discover to find roles, or add one above.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
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
                setTotal((t) => Math.max(0, t - 1));
                refreshWeekly();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
