"use client";

import { useEffect, useState } from "react";
import { SingleSkillIcon } from "@/components/skill-icons";
import { Project } from "@/lib/types";

type ProjectSection = "header" | "media" | "skills" | "overview" | "specs" | "featured";

const quickSkills = ["typescript", "python", "react", "nextjs", "docker", "postgresql", "aws", "gcp", "azure", "unity"];

function newProject(): Project {
  return {
    slug: "new-project",
    title: "New Project",
    summary: "",
    year: "2026",
    category: "prototype",
    specs: [
      { label: "Year", value: "2026" },
      { label: "Category", value: "prototype" },
    ],
    accent: "#39ff88",
    featured: false,
    heroImage: "",
    skills: [],
    content: [{ type: "paragraph", text: "" }],
  };
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [section, setSection] = useState<ProjectSection>("header");
  const [newSkill, setNewSkill] = useState("");
  const [imageEditorKey, setImageEditorKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Loading...");

  useEffect(() => {
    void fetch("/api/content/projects")
      .then((r) => r.json() as Promise<Project[]>)
      .then((data) => {
        setProjects(data);
        setSelectedIndex(0);
        setNotice("");
      })
      .catch(() => setNotice("Failed to load projects."));
  }, []);

  const selectedProject = projects[selectedIndex];

  function updateSelected(next: Project) {
    const clone = [...projects];
    clone[selectedIndex] = next;
    setProjects(clone);
  }

  function addSkill(skill: string) {
    if (!selectedProject) return;
    const normalized = skill.trim().toLowerCase();
    if (!normalized || selectedProject.skills.includes(normalized)) return;
    updateSelected({ ...selectedProject, skills: [...selectedProject.skills, normalized] });
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    if (!selectedProject) return;
    updateSelected({ ...selectedProject, skills: selectedProject.skills.filter((item) => item !== skill) });
  }

  function upsertSpec(index: number, next: { label: string; value: string }) {
    if (!selectedProject) return;
    const specs = [...(selectedProject.specs || [])];
    specs[index] = next;
    updateSelected({ ...selectedProject, specs, year: specs[0]?.value || selectedProject.year, category: specs[1]?.value || selectedProject.category });
  }

  function addSpec() {
    if (!selectedProject) return;
    updateSelected({
      ...selectedProject,
      specs: [...(selectedProject.specs || []), { label: "New Spec", value: "" }],
    });
  }

  function removeSpec(index: number) {
    if (!selectedProject) return;
    const specs = (selectedProject.specs || []).filter((_, i) => i !== index);
    updateSelected({ ...selectedProject, specs, year: specs[0]?.value || "", category: specs[1]?.value || "" });
  }

  function addContentBlock(type: "paragraph" | "quote" | "image") {
    if (!selectedProject) return;
    const content = [...selectedProject.content];
    if (type === "image") {
      content.push({ type: "image", url: "", caption: "" });
    } else {
      content.push({ type, text: "" });
    }
    updateSelected({ ...selectedProject, content });
  }

  function removeContentBlock(index: number) {
    if (!selectedProject) return;
    updateSelected({ ...selectedProject, content: selectedProject.content.filter((_, i) => i !== index) });
  }

  function updateContentBlock(index: number, updater: (block: Project["content"][number]) => Project["content"][number]) {
    if (!selectedProject) return;
    const content = [...selectedProject.content];
    content[index] = updater(content[index]);
    updateSelected({ ...selectedProject, content });
  }

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setNotice("Upload failed. Check admin session.");
      return null;
    }

    const body = (await res.json()) as { url?: string };
    return body.url || null;
  }

  async function save() {
    setSaving(true);
    setNotice("");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    try {
      const res = await fetch("/api/content/projects", {
        method: "PUT",
        headers,
        body: JSON.stringify(projects),
      });

      if (!res.ok) {
        setNotice("Save failed. Check admin session or fields.");
      } else {
        setNotice("Projects saved.");
      }
    } catch {
      setNotice("Save failed due to network/server error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setProjects((prev) => [newProject(), ...prev]);
            setSelectedIndex(0);
            setSection("header");
          }}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-4 space-y-3 max-h-[75vh] overflow-auto pr-1">
          {projects.map((project, index) => (
            <button
              type="button"
              key={`${project.slug}-${index}`}
              onClick={() => {
                setSelectedIndex(index);
                setSection("header");
              }}
              className={`w-full text-left bg-surface-container border p-4 transition-colors ${selectedIndex === index ? "border-[var(--accent)]" : "border-outline-variant/30 hover:border-outline-variant/60"}`}
            >
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">{project.featured ? "Featured" : "Project"} / {project.year}</p>
              <p className="font-headline uppercase tracking-tight text-base mb-2">{project.title || "Untitled Project"}</p>
              <p className="text-xs text-on-surface-variant line-clamp-3">{project.summary || "No summary yet."}</p>
            </button>
          ))}
        </aside>

        <div className="xl:col-span-8 space-y-4">
          {selectedProject ? (
            <>
              <div className="bg-surface-container border border-outline-variant/30 p-4" style={{ ["--accent" as string]: selectedProject.accent }}>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Preview Canvas (click a section)</p>

                <div onClick={() => setSection("header")} className={`w-full text-left p-3 border mb-3 ${section === "header" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 bg-[var(--accent)]"></span>
                    <span className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant">{selectedProject.featured ? "Featured Work" : "Prototype / Project"}</span>
                  </div>
                  <h1
                    className="font-headline text-4xl md:text-5xl font-bold tracking-tighter uppercase leading-none outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateSelected({ ...selectedProject, title: e.currentTarget.textContent || "" })}
                  >
                    {selectedProject.title}
                  </h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-3">Click text to edit directly</p>
                </div>

                {selectedProject.heroImage ? (
                  <button type="button" onClick={() => setSection("media")} className={`w-full text-left p-3 border mb-3 ${section === "media" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={selectedProject.title} className="w-full aspect-[21/9] object-cover border border-outline-variant/20" src={selectedProject.heroImage} />
                  </button>
                ) : (
                  <button type="button" onClick={() => setSection("media")} className={`w-full text-left p-3 border mb-3 text-sm text-on-surface-variant ${section === "media" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    Click to add hero image
                  </button>
                )}

                <button type="button" onClick={() => setSection("skills")} className={`w-full text-left p-3 border mb-3 ${section === "skills" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.length ? selectedProject.skills.map((skill) => (
                      <div key={skill} className="inline-flex items-center gap-2 border border-outline-variant/30 bg-surface-container-low px-2.5 py-1.5 text-[10px] font-label uppercase tracking-[0.14em]">
                        <SingleSkillIcon skill={skill} className="w-3.5 h-3.5 object-contain" />
                        <span>{skill}</span>
                      </div>
                    )) : <p className="text-xs text-on-surface-variant">Click to add skills</p>}
                  </div>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div onClick={() => setSection("overview")} className={`md:col-span-7 text-left p-3 border ${section === "overview" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    <h2 className="font-headline text-2xl uppercase tracking-tight text-surface-tint mb-3">Operational Overview</h2>
                    <p
                      className="text-on-surface text-base leading-relaxed mb-4 outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateSelected({ ...selectedProject, summary: e.currentTarget.textContent || "" })}
                    >
                      {selectedProject.summary || "Click to add project summary"}
                    </p>
                    <div className="text-on-surface-variant text-base space-y-3">
                      {selectedProject.content.map((block, blockIndex) => (
                        <div key={blockIndex} className="group relative border border-outline-variant/20 p-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeContentBlock(blockIndex);
                            }}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]"
                          >
                            Delete
                          </button>
                          {block.type === "image" ? (
                            <div className="space-y-2">
                              {block.url && imageEditorKey !== `${selectedIndex}-${blockIndex}` ? (
                                <div className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={block.url}
                                    alt={block.caption || "Project content image"}
                                    className="w-full aspect-[16/9] object-cover border border-outline-variant/30"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImageEditorKey(`${selectedIndex}-${blockIndex}`);
                                    }}
                                    className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-[0.15em] border border-outline-variant/40 bg-surface-container px-2 py-1 hover:border-[var(--accent)]"
                                  >
                                    Edit Image
                                  </button>
                                  {block.caption ? <p className="mt-2 text-xs text-on-surface-variant">{block.caption}</p> : null}
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <input
                                    value={block.url}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateContentBlock(blockIndex, () => ({ ...block, url: e.target.value }))}
                                    className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-xs"
                                    placeholder="Image URL"
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      void uploadImage(file).then((url) => {
                                        if (!url) return;
                                        updateContentBlock(blockIndex, () => ({ ...block, url }));
                                      });
                                    }}
                                    className="w-full text-xs text-on-surface-variant"
                                  />
                                  <input
                                    value={block.caption || ""}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => updateContentBlock(blockIndex, () => ({ ...block, caption: e.target.value }))}
                                    className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-xs"
                                    placeholder="Caption"
                                  />
                                  {block.url ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageEditorKey(null);
                                      }}
                                      className="text-[10px] uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]"
                                    >
                                      Done
                                    </button>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p
                              className={`outline-none ${block.type === "quote" ? "border-l-2 border-[var(--accent)] pl-4 text-lg font-semibold" : "leading-7"}`}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => updateContentBlock(blockIndex, () => ({ ...block, text: e.currentTarget.textContent || "" }))}
                            >
                              {block.text || "Click and type..."}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); addContentBlock("paragraph"); }} className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Paragraph</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); addContentBlock("quote"); }} className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Quote</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); addContentBlock("image"); }} className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Image</button>
                      </div>
                    </div>
                  </div>

                  <div onClick={() => setSection("specs")} className={`md:col-span-5 text-left p-3 border ${section === "specs" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    <h3 className="font-headline text-sm uppercase tracking-[0.3em] text-on-surface-variant mb-3">System Specifications</h3>
                    <ul className="space-y-3">
                      {(selectedProject.specs || []).map((spec, index) => (
                        <li key={`${spec.label}-${index}`} className="group flex justify-between items-center gap-2 py-2 border-b border-outline-variant/10">
                          <input
                            value={spec.label}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => upsertSpec(index, { ...spec, label: e.target.value })}
                            className="w-1/2 bg-transparent border border-transparent hover:border-outline-variant/30 focus:border-outline-variant/40 p-1 text-xs uppercase text-on-surface-variant tracking-widest"
                            placeholder="Label"
                          />
                          <input
                            value={spec.value}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => upsertSpec(index, { ...spec, value: e.target.value })}
                            className="w-1/2 bg-transparent border border-transparent hover:border-outline-variant/30 focus:border-outline-variant/40 p-1 text-right font-label text-sm uppercase"
                            placeholder="Value"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSpec(index);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[10px] uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]"
                          >
                            X
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={(e) => { e.stopPropagation(); addSpec(); }} className="mt-3 text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Spec</button>
                  </div>
                </div>

                {selectedProject.featured ? (
                  <button type="button" onClick={() => setSection("featured")} className={`w-full mt-3 text-left p-3 border ${section === "featured" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    <h4 className="font-headline uppercase tracking-widest text-sm mb-2">Featured Breakdown</h4>
                    <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Problem:</strong> <span contentEditable suppressContentEditableWarning className="outline-none" onBlur={(e) => updateSelected({ ...selectedProject, featuredDetails: { problem: e.currentTarget.textContent || "", approach: selectedProject.featuredDetails?.approach || "", impact: selectedProject.featuredDetails?.impact || "" } })}>{selectedProject.featuredDetails?.problem || "Click and type..."}</span></p>
                    <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Approach:</strong> <span contentEditable suppressContentEditableWarning className="outline-none" onBlur={(e) => updateSelected({ ...selectedProject, featuredDetails: { problem: selectedProject.featuredDetails?.problem || "", approach: e.currentTarget.textContent || "", impact: selectedProject.featuredDetails?.impact || "" } })}>{selectedProject.featuredDetails?.approach || "Click and type..."}</span></p>
                    <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Impact:</strong> <span contentEditable suppressContentEditableWarning className="outline-none" onBlur={(e) => updateSelected({ ...selectedProject, featuredDetails: { problem: selectedProject.featuredDetails?.problem || "", approach: selectedProject.featuredDetails?.approach || "", impact: e.currentTarget.textContent || "" } })}>{selectedProject.featuredDetails?.impact || "Click and type..."}</span></p>
                  </button>
                ) : null}
              </div>

              <article className="bg-surface-container border border-outline-variant/30 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-headline uppercase tracking-widest text-sm">Edit: {section}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setProjects((prev) => prev.filter((_, i) => i !== selectedIndex));
                      setSelectedIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
                  >
                    Delete Project
                  </button>
                </div>

                {section === "header" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={selectedProject.title} onChange={(e) => updateSelected({ ...selectedProject, title: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Title" />
                    <input value={selectedProject.slug} onChange={(e) => updateSelected({ ...selectedProject, slug: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Slug" />
                  </div>
                ) : null}

                {section === "media" ? (
                  <div className="space-y-2">
                    <input value={selectedProject.heroImage || ""} onChange={(e) => updateSelected({ ...selectedProject, heroImage: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Hero image URL" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void uploadImage(file).then((url) => {
                          if (!url) return;
                          updateSelected({ ...selectedProject, heroImage: url });
                        });
                      }}
                      className="w-full text-xs text-on-surface-variant"
                    />
                  </div>
                ) : null}

                {section === "skills" ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {quickSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className={`text-xs uppercase tracking-[0.15em] border px-2 py-1 transition-colors ${selectedProject.skills.includes(skill) ? "border-[var(--accent)] text-on-surface" : "border-outline-variant/40 text-on-surface-variant hover:text-on-surface"}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
                        placeholder="Add custom skill"
                      />
                      <button type="button" onClick={() => addSkill(newSkill)} className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]">
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedProject.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]"
                        >
                          {skill} x
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {section === "overview" ? (
                  <>
                    <p className="text-sm text-on-surface-variant">Edit summary and content blocks directly in the preview canvas above.</p>
                  </>
                ) : null}

                {section === "specs" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={selectedProject.accent} onChange={(e) => updateSelected({ ...selectedProject, accent: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Accent (#39ff88)" />
                    <input type="color" value={selectedProject.accent || "#39ff88"} onChange={(e) => updateSelected({ ...selectedProject, accent: e.target.value })} className="h-10 w-full bg-surface-container-low border border-outline-variant/40 p-1" />
                    <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant">
                      <input
                        type="checkbox"
                        checked={selectedProject.featured}
                        onChange={(e) => updateSelected({
                          ...selectedProject,
                          featured: e.target.checked,
                          featuredDetails: e.target.checked
                            ? selectedProject.featuredDetails || { problem: "", approach: "", impact: "" }
                            : undefined,
                        })}
                      />
                      Featured project
                    </label>
                  </div>
                ) : null}

                {section === "featured" ? (
                  <>
                    {selectedProject.featured ? (
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          value={selectedProject.featuredDetails?.problem || ""}
                          onChange={(e) => updateSelected({
                            ...selectedProject,
                            featuredDetails: {
                              problem: e.target.value,
                              approach: selectedProject.featuredDetails?.approach || "",
                              impact: selectedProject.featuredDetails?.impact || "",
                            },
                          })}
                          className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
                          placeholder="Featured: Problem"
                        />
                        <input
                          value={selectedProject.featuredDetails?.approach || ""}
                          onChange={(e) => updateSelected({
                            ...selectedProject,
                            featuredDetails: {
                              problem: selectedProject.featuredDetails?.problem || "",
                              approach: e.target.value,
                              impact: selectedProject.featuredDetails?.impact || "",
                            },
                          })}
                          className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
                          placeholder="Featured: Approach"
                        />
                        <input
                          value={selectedProject.featuredDetails?.impact || ""}
                          onChange={(e) => updateSelected({
                            ...selectedProject,
                            featuredDetails: {
                              problem: selectedProject.featuredDetails?.problem || "",
                              approach: selectedProject.featuredDetails?.approach || "",
                              impact: e.target.value,
                            },
                          })}
                          className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
                          placeholder="Featured: Impact"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-on-surface-variant">Enable "Featured project" in Specs to edit this section.</p>
                    )}
                  </>
                ) : null}
              </article>
            </>
          ) : (
            <div className="bg-surface-container border border-outline-variant/30 p-6 text-on-surface-variant text-sm">No project selected.</div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-6 py-3 uppercase tracking-widest text-xs border border-[var(--accent,#39ff88)] bg-surface-container-high hover:bg-surface-container-highest transition-colors">
          {saving ? "Saving..." : "Save Projects"}
        </button>
        <span className="text-sm text-on-surface-variant">{notice}</span>
      </div>
    </section>
  );
}
