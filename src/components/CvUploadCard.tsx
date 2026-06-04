"use client";

import { useRef, useState } from "react";
import { CV_ACCEPT } from "@/lib/cv/supported-formats";
import type { UserProfile } from "@/lib/types";

interface Props {
  onImported: (profile: UserProfile) => void;
}

export function CvUploadCard({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/import-cv", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }
      onImported(data as UserProfile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
      setDragging(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div className="card space-y-4 p-5">
      <div>
        <h2 className="section-title">Import from your CV</h2>
        <p className="mt-1 text-sm text-secondary">
          Drop a PDF, Word document (.docx), text file, or a photo of your CV. We
          read it and fill your profile automatically. Review everything before
          saving or generating documents.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-[var(--accent)] bg-[var(--card-inner)]" : "border-[var(--border)]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={CV_ACCEPT}
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
        <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
          {loading ? "Reading your CV…" : "Drop your CV here or click to browse"}
        </p>
        <p className="mt-2 text-xs text-muted">
          PDF, DOCX, TXT, MD, PNG, JPG — up to 8 MB
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
