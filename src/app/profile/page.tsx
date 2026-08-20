"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CvUploadCard } from "@/components/CvUploadCard";
import { PageHeader } from "@/components/PageHeader";
import { fetchJson } from "@/lib/fetch-json";
import type { ProfileExperience, UserProfile } from "@/lib/types";

const emptyProfile = (): UserProfile => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skillGroups: [],
  experience: [],
  education: [],
  projects: [],
  additionalInfo: "",
  updatedAt: new Date().toISOString(),
});

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile());
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<UserProfile>("/api/profile")
      .then((data) => {
        setProfile({
          ...emptyProfile(),
          ...data,
          skillGroups: data.skillGroups ?? [],
          experience: data.experience ?? [],
          education: data.education ?? [],
          projects: data.projects ?? [],
        });
      })
      .catch((e) => setStatus(e instanceof Error ? e.message : "Could not load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function loadStarterTemplate() {
    setStatus("Importing…");
    try {
      await fetchJson<{ ok: boolean }>("/api/profile/demo", { method: "POST" });
      const data = await fetchJson<UserProfile>("/api/profile");
      setProfile({
        ...emptyProfile(),
        ...data,
        skillGroups: data.skillGroups ?? [],
        experience: data.experience ?? [],
        education: data.education ?? [],
        projects: data.projects ?? [],
      });
      setStatus("Profile loaded successfully.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Import failed");
    }
  }

  async function save() {
    setStatus("Saving…");
    try {
      const saved = await fetchJson<UserProfile>("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setProfile(saved);
      setStatus("Profile saved.");
    } catch (e) {
      setStatus(
        e instanceof Error
          ? e.message
          : "Save failed. Full name and email are required."
      );
    }
  }

  function updateExperience(index: number, patch: Partial<ProfileExperience>) {
    setProfile((p) => ({
      ...p,
      experience: p.experience.map((e, i) =>
        i === index ? { ...e, ...patch } : e
      ),
    }));
  }

  if (loading) return <div className="skeleton max-w-3xl" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <PageHeader
        title="Profile"
        description="Your source of truth for CV and cover letter generation. Only add information that is accurate."
      />

      <CvUploadCard
        onImported={(data) => {
          setProfile({
            ...emptyProfile(),
            ...data,
            skillGroups: data.skillGroups ?? [],
            experience: data.experience ?? [],
            education: data.education ?? [],
            projects: data.projects ?? [],
          });
          setStatus("Profile saved from your CV. Review the details below.");
        }}
      />

      {!profile.fullName.trim() || profile.experience.length === 0 ? (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-secondary">
            No CV file handy? Load a starter template instead.
          </p>
          <button type="button" onClick={loadStarterTemplate} className="btn-secondary shrink-0">
            Load starter template
          </button>
        </div>
      ) : null}

      <section className="card space-y-4 p-5">
        <h2 className="section-title">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              className="input"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              className="input"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              className="input"
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <input
              className="input"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Professional summary">
          <textarea
            className="textarea-input"
            rows={4}
            value={profile.summary}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
          />
        </Field>
      </section>

      <ListSection
        title="Skills"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            skillGroups: [...p.skillGroups, { id: uuidv4(), category: "", items: "" }],
          }))
        }
      >
        {profile.skillGroups.length === 0 && (
          <p className="text-sm text-muted">No skill groups yet.</p>
        )}
        {profile.skillGroups.map((g, i) => (
          <div key={g.id} className="card-inner grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
            <Field label="Group name">
              <input
                className="input"
                value={g.category}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    skillGroups: p.skillGroups.map((x, j) =>
                      j === i ? { ...x, category: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <Field label="Skills">
              <input
                className="input"
                value={g.items}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    skillGroups: p.skillGroups.map((x, j) =>
                      j === i ? { ...x, items: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <RemoveBtn
              onClick={() =>
                setProfile((p) => ({
                  ...p,
                  skillGroups: p.skillGroups.filter((_, j) => j !== i),
                }))
              }
            />
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Experience"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            experience: [
              ...p.experience,
              {
                id: uuidv4(),
                title: "",
                company: "",
                startDate: "",
                endDate: "",
                bullets: [""],
              },
            ],
          }))
        }
      >
        {profile.experience.length === 0 && (
          <p className="text-sm text-muted">No roles added yet.</p>
        )}
        {profile.experience.map((exp, i) => (
          <div key={exp.id} className="card-inner space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Job title">
                <input
                  className="input"
                  value={exp.title}
                  onChange={(e) => updateExperience(i, { title: e.target.value })}
                />
              </Field>
              <Field label="Company">
                <input
                  className="input"
                  value={exp.company}
                  onChange={(e) => updateExperience(i, { company: e.target.value })}
                />
              </Field>
              <Field label="Start date">
                <input
                  className="input"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(i, { startDate: e.target.value })}
                />
              </Field>
              <Field label="End date">
                <input
                  className="input"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(i, { endDate: e.target.value })}
                />
              </Field>
            </div>
            <BulletsEditor
              bullets={exp.bullets}
              onChange={(bullets) => updateExperience(i, { bullets })}
            />
            <RemoveBtn
              onClick={() =>
                setProfile((p) => ({
                  ...p,
                  experience: p.experience.filter((_, j) => j !== i),
                }))
              }
            />
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Education"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            education: [
              ...p.education,
              { id: uuidv4(), qualification: "", institution: "", dates: "" },
            ],
          }))
        }
      >
        {profile.education.length === 0 && (
          <p className="text-sm text-muted">No education entries yet.</p>
        )}
        {profile.education.map((ed, i) => (
          <div key={ed.id} className="card-inner grid gap-3 sm:grid-cols-2">
            <Field label="Qualification">
              <input
                className="input"
                value={ed.qualification}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    education: p.education.map((x, j) =>
                      j === i ? { ...x, qualification: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <Field label="Institution">
              <input
                className="input"
                value={ed.institution}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    education: p.education.map((x, j) =>
                      j === i ? { ...x, institution: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <Field label="Dates">
              <input
                className="input"
                value={ed.dates}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    education: p.education.map((x, j) =>
                      j === i ? { ...x, dates: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <Field label="Detail">
              <input
                className="input"
                value={ed.detail ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    education: p.education.map((x, j) =>
                      j === i ? { ...x, detail: e.target.value || undefined } : x
                    ),
                  }))
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <RemoveBtn
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    education: p.education.filter((_, j) => j !== i),
                  }))
                }
              />
            </div>
          </div>
        ))}
      </ListSection>

      <ListSection
        title="Projects"
        onAdd={() =>
          setProfile((p) => ({
            ...p,
            projects: [...p.projects, { id: uuidv4(), name: "", dates: "", bullets: [""] }],
          }))
        }
      >
        {profile.projects.length === 0 && (
          <p className="text-sm text-muted">No projects added yet.</p>
        )}
        {profile.projects.map((proj, i) => (
          <div key={proj.id} className="card-inner space-y-3">
            <Field label="Project name">
              <input
                className="input"
                value={proj.name}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    projects: p.projects.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <Field label="Dates or context">
              <input
                className="input"
                value={proj.dates}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    projects: p.projects.map((x, j) =>
                      j === i ? { ...x, dates: e.target.value } : x
                    ),
                  }))
                }
              />
            </Field>
            <BulletsEditor
              bullets={proj.bullets}
              onChange={(bullets) =>
                setProfile((p) => ({
                  ...p,
                  projects: p.projects.map((x, j) =>
                    j === i ? { ...x, bullets } : x
                  ),
                }))
              }
            />
            <RemoveBtn
              onClick={() =>
                setProfile((p) => ({
                  ...p,
                  projects: p.projects.filter((_, j) => j !== i),
                }))
              }
            />
          </div>
        ))}
      </ListSection>

      <section className="card p-5">
        <Field label="Additional information">
          <textarea
            className="textarea-input"
            rows={3}
            value={profile.additionalInfo ?? ""}
            onChange={(e) =>
              setProfile({ ...profile, additionalInfo: e.target.value })
            }
          />
        </Field>
      </section>

      <button type="button" onClick={save} className="btn-primary w-full py-3">
        Save profile
      </button>
      {status && (
        <p
          className={`text-center text-sm ${
            status.includes("saved") ? "text-success" : "text-danger"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function ListSection({
  title,
  children,
  onAdd,
}: {
  title: string;
  children: React.ReactNode;
  onAdd: () => void;
}) {
  return (
    <section className="card space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        <button type="button" onClick={onAdd} className="btn-ghost text-[var(--accent)]">
          Add entry
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BulletsEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (b: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="label mb-0">Achievements and responsibilities</p>
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input flex-1"
            value={b}
            onChange={(e) =>
              onChange(bullets.map((x, j) => (j === i ? e.target.value : x)))
            }
          />
          <button
            type="button"
            className="btn-ghost shrink-0 text-danger"
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            aria-label="Remove bullet"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-ghost px-0 text-[var(--accent)]"
        onClick={() => onChange([...bullets, ""])}
      >
        Add bullet
      </button>
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn-danger-ghost">
      Remove entry
    </button>
  );
}
