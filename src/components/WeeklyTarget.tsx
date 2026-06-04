"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";

interface WeeklyStats {
  applied: number;
  target: number;
  weekLabel: string;
  percent: number;
}

export function WeeklyTarget() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  const load = () => {
    fetchJson<WeeklyStats>("/api/stats/weekly")
      .then(setStats)
      .catch(console.error);
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("weekly-refresh", handler);
    return () => window.removeEventListener("weekly-refresh", handler);
  }, []);

  if (!stats) return <div className="skeleton" />;

  const remaining = Math.max(0, stats.target - stats.applied);
  const onTrack = stats.applied >= stats.target;

  return (
    <section className="card-accent p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Weekly application target
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {stats.applied}
            <span className="ml-1 text-lg font-normal text-secondary">
              / {stats.target}
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">{stats.weekLabel}</p>
        </div>
        <p className={`text-sm font-semibold ${onTrack ? "text-success" : "text-warning"}`}>
          {onTrack ? "Target met" : `${remaining} remaining`}
        </p>
      </div>
      <div className="progress-track mt-5 h-2.5">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${stats.percent}%`,
            background: onTrack ? "var(--success)" : "var(--accent)",
          }}
        />
      </div>
    </section>
  );
}
