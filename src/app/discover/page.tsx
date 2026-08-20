"use client";

import { useEffect, useMemo, useState } from "react";
import { JobTile } from "@/components/JobTile";
import { PageHeader } from "@/components/PageHeader";
import { fetchJson } from "@/lib/fetch-json";
import type { JobApplication, JobListResult } from "@/lib/types";

type DiscoverResponse = {
  fetched: number;
  inserted: number;
  updated: number;
  skippedCap: number;
  skippedLowScore: number;
  sources: {
    adzuna: number;
    boards: number;
    adzunaConfigured: boolean;
  };
  top: Array<{ company: string; role: string; rankScore: number; source: string }>;
};

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [q, setQ] = useState("");
  const [minScore, setMinScore] = useState(40);
  const [source, setSource] = useState("");
  const [sort, setSort] = useState<"rank" | "updated">("rank");
  const [offset, setOffset] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const limit = 40;

  useEffect(() => {
    // Filters change faster than requests resolve, so ignore any response that
    // is no longer the one this effect asked for.
    let current = true;

    async function load() {
      setError("");
      setLoading(true);
      try {
        const params = new URLSearchParams({
          stage: "active",
          sort,
          limit: String(limit),
          offset: String(offset),
          minScore: String(minScore),
        });
        if (q.trim()) params.set("q", q.trim());
        if (source.trim()) params.set("source", source.trim());
        const data = await fetchJson<JobListResult>(`/api/jobs?${params}`);
        if (!current) return;
        setJobs(data.jobs);
        setTotal(data.total);
      } catch (e) {
        if (!current) return;
        setJobs([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : "Could not load roles");
      } finally {
        if (current) setLoading(false);
      }
    }

    load();
    return () => {
      current = false;
    };
  }, [q, minScore, source, sort, offset, reloadToken]);

  async function runDiscover() {
    setDiscovering(true);
    setMessage("");
    setError("");
    try {
      const result = await fetchJson<DiscoverResponse>("/api/jobs/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minScore: 45, where: "uk" }),
      });
      const adzunaNote = result.sources.adzunaConfigured
        ? `Adzuna ${result.sources.adzuna}`
        : "Adzuna not configured (add ADZUNA_APP_ID + ADZUNA_APP_KEY on Vercel)";
      setMessage(
        `Fetched ${result.fetched}. Inserted ${result.inserted}, updated ${result.updated}. Boards ${result.sources.boards}. ${adzunaNote}.`
      );
      setOffset(0);
      setReloadToken((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Discover failed");
    } finally {
      setDiscovering(false);
    }
  }

  const pageLabel = useMemo(() => {
    if (total === 0) return "0 roles";
    const from = offset + 1;
    const to = Math.min(offset + limit, total);
    return `${from}-${to} of ${total}`;
  }, [offset, total]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Discover"
        description="Pull UK roles from job APIs and curated company boards, rank them against your profile, then open the apply link yourself."
      />

      <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            Refresh shortlist
          </p>
          <p className="text-xs text-secondary">
            Hybrid ingest: Adzuna (volume) + Greenhouse/Lever boards (quality). Cap 1000 roles.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={discovering}
          onClick={runDiscover}
        >
          {discovering ? "Finding roles..." : "Find & rank jobs"}
        </button>
      </div>

      {message ? (
        <p
          className="rounded-lg border px-4 py-3 text-sm text-secondary"
          style={{ borderColor: "var(--border)" }}
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          className="rounded-lg border px-4 py-3 text-sm text-secondary"
          style={{ borderColor: "var(--danger)" }}
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="label">Search</span>
          <input
            className="text-input"
            value={q}
            onChange={(e) => {
              setOffset(0);
              setQ(e.target.value);
            }}
            placeholder="Company, role, city..."
          />
        </label>
        <label className="block">
          <span className="label">Min score</span>
          <input
            className="text-input"
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => {
              setOffset(0);
              setMinScore(Number(e.target.value) || 0);
            }}
          />
        </label>
        <label className="block">
          <span className="label">Source</span>
          <select
            className="text-input"
            value={source}
            onChange={(e) => {
              setOffset(0);
              setSource(e.target.value);
            }}
          >
            <option value="">All sources</option>
            <option value="adzuna">Adzuna</option>
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
            <option value="manual">Manual</option>
          </select>
        </label>
        <label className="block">
          <span className="label">Sort</span>
          <select
            className="text-input"
            value={sort}
            onChange={(e) => {
              setOffset(0);
              setSort(e.target.value === "updated" ? "updated" : "rank");
            }}
          >
            <option value="rank">Best match</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-secondary">{pageLabel}</p>
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
          No roles yet. Click Find &amp; rank jobs, or lower the min score filter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobTile
              key={job.id}
              job={job}
              onUpdated={(updated) =>
                setJobs((prev) =>
                  prev.map((j) => (j.id === updated.id ? updated : j))
                )
              }
              onDeleted={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
