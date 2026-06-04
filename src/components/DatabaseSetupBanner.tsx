"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function DatabaseSetupBanner() {
  const pathname = usePathname();
  const [missing, setMissing] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/health/db", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: { ok?: boolean; missing?: string[] }) => {
        if (!data.ok && data.missing?.length) setMissing(data.missing);
      })
      .catch(() => {});
  }, []);

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/setup"
  ) {
    return null;
  }

  if (!missing?.length) return null;

  return (
    <div
      className="mb-6 rounded-xl border px-4 py-3 text-sm"
      style={{
        borderColor: "var(--warning)",
        background: "color-mix(in srgb, var(--warning) 12%, transparent)",
      }}
      role="alert"
    >
      <p className="font-semibold" style={{ color: "var(--text)" }}>
        Database not set up yet
      </p>
      <p className="mt-1 text-secondary">
        Missing tables: {missing.join(", ")}. Your account is signed in, but
        Supabase has no tables to store jobs or profile data.
      </p>
      <p className="mt-2 text-secondary">
        The database schema still needs to be applied for this project. An
        administrator can run the setup SQL, then you refresh this page.
      </p>
      <Link href="/setup" className="btn-primary mt-3 inline-block text-xs">
        Setup instructions
      </Link>
    </div>
  );
}
