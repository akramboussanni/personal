"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { TinySkillIcons } from "@/components/skill-icons";
import { BlogPost } from "@/lib/types";

type BlogSection = "header" | "skills" | "media" | "content";
type ContentMode = "blocks" | "markdown";

const quickSkills = ["typescript", "python", "react", "nextjs", "docker", "postgresql", "aws", "gcp", "azure", "figma"];

function newBlog(): BlogPost {
  return {
    slug: "new-post",
    title: "New Blog Post",
    excerpt: "",
    date: "Apr 2026",
    readTime: "4 min",
    tag: "Notes",
    accent: "#39ff88",
    heroImage: "",
    skills: [],
    markdown: "",
    content: [{ type: "paragraph", text: "" }],
  };
}

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [section, setSection] = useState<BlogSection>("header");
  const [contentMode, setContentMode] = useState<ContentMode>("blocks");
  const [newSkill, setNewSkill] = useState("");
  const [imageEditorKey, setImageEditorKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notice, setNotice] = useState("Loading...");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSnapshotRef = useRef("");

  useEffect(() => {
    void fetch("/api/content/blogs")
      .then((r) => r.json() as Promise<BlogPost[]>)
      .then((data) => {
        setBlogs(data);
        lastSavedSnapshotRef.current = JSON.stringify(data);
        setSelectedIndex(0);
        setSection("header");
        setContentMode(data[0]?.markdown?.trim() ? "markdown" : "blocks");
        setIsLoaded(true);
        setNotice("");
      })
      .catch(() => setNotice("Failed to load blogs."));
  }, []);

  const selectedBlog = blogs[selectedIndex];

  function updateSelected(next: BlogPost) {
    const clone = [...blogs];
    clone[selectedIndex] = next;
    setBlogs(clone);
  }

  function addSkill(skill: string) {
    if (!selectedBlog) return;
    const normalized = skill.trim().toLowerCase();
    if (!normalized || selectedBlog.skills.includes(normalized)) return;
    updateSelected({ ...selectedBlog, skills: [...selectedBlog.skills, normalized] });
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    if (!selectedBlog) return;
    updateSelected({ ...selectedBlog, skills: selectedBlog.skills.filter((item) => item !== skill) });
  }

  function addContentBlock(type: "paragraph" | "quote" | "image") {
    if (!selectedBlog) return;
    const content = [...selectedBlog.content];
    if (type === "image") {
      content.push({ type: "image", url: "", caption: "" });
    } else {
      content.push({ type, text: "" });
    }
    updateSelected({ ...selectedBlog, content });
  }

  function removeContentBlock(index: number) {
    if (!selectedBlog) return;
    updateSelected({ ...selectedBlog, content: selectedBlog.content.filter((_, i) => i !== index) });
  }

  function updateContentBlock(index: number, updater: (block: BlogPost["content"][number]) => BlogPost["content"][number]) {
    if (!selectedBlog) return;
    const content = [...selectedBlog.content];
    content[index] = updater(content[index]);
    updateSelected({ ...selectedBlog, content });
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

  async function save(payload: BlogPost[], auto = false) {
    if (auto) {
      setAutosaving(true);
    } else {
      setSaving(true);
    }

    setNotice("");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    try {
      const res = await fetch("/api/content/blogs", {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setNotice(auto ? "Autosave failed. Check admin session." : "Save failed. Check admin session or fields.");
      } else {
        lastSavedSnapshotRef.current = JSON.stringify(payload);
        setNotice(auto ? "Autosaved." : "Blogs saved.");
      }
    } catch {
      setNotice(auto ? "Autosave failed (network/server)." : "Save failed due to network/server error.");
    } finally {
      if (auto) {
        setAutosaving(false);
      } else {
        setSaving(false);
      }
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (JSON.stringify(blogs) === lastSavedSnapshotRef.current) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      void save(blogs, true);
    }, 900);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [blogs, isLoaded]);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setBlogs((prev) => [newBlog(), ...prev]);
            setSelectedIndex(0);
            setSection("header");
            setContentMode("blocks");
          }}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Add Blog Post
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-4 space-y-3 max-h-[75vh] overflow-auto pr-1">
          {blogs.map((blog, index) => (
            <button
              type="button"
              key={`${blog.slug}-${index}`}
              onClick={() => {
                setSelectedIndex(index);
                setSection("header");
                setContentMode(blog.markdown?.trim() ? "markdown" : "blocks");
              }}
              className={`w-full text-left bg-surface-container border p-4 transition-colors ${selectedIndex === index ? "border-[var(--accent)]" : "border-outline-variant/30 hover:border-outline-variant/60"}`}
            >
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">{blog.date} / {blog.readTime}</p>
              <p className="font-headline uppercase tracking-tight text-base mb-2">{blog.title || "Untitled Blog"}</p>
              <p className="text-xs text-on-surface-variant line-clamp-3">{blog.excerpt || "No excerpt yet."}</p>
            </button>
          ))}
        </aside>

        <div className="xl:col-span-8">
          {selectedBlog ? (
            <>
              <div className="bg-surface-container border border-outline-variant/30 p-4">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">Preview Canvas (click a section)</p>

                <div onClick={() => setSection("header")} className={`w-full text-left p-3 border mb-3 ${section === "header" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                  <p className="font-label text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-4">{selectedBlog.date} / {selectedBlog.readTime} / {selectedBlog.tag}</p>
                  <h1
                    className="text-4xl md:text-5xl font-bold tracking-tighter leading-none font-headline mb-4 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateSelected({ ...selectedBlog, title: e.currentTarget.textContent || "" })}
                  >
                    {selectedBlog.title || "Untitled Blog"}
                  </h1>
                  <p
                    className="text-on-surface-variant text-lg outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateSelected({ ...selectedBlog, excerpt: e.currentTarget.textContent || "" })}
                  >
                    {selectedBlog.excerpt || "Click to add excerpt"}
                  </p>
                </div>

                <button type="button" onClick={() => setSection("skills")} className={`w-full text-left p-3 border mb-3 ${section === "skills" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                  {selectedBlog.skills.length ? <TinySkillIcons skills={selectedBlog.skills} max={12} /> : <p className="text-xs text-on-surface-variant">Click to add skills</p>}
                </button>

                {selectedBlog.heroImage ? (
                  <button type="button" onClick={() => setSection("media")} className={`w-full text-left p-3 border mb-3 ${section === "media" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={selectedBlog.title} src={selectedBlog.heroImage} className="w-full aspect-[21/9] object-cover border border-outline-variant/20" />
                  </button>
                ) : (
                  <button type="button" onClick={() => setSection("media")} className={`w-full text-left p-3 border mb-3 text-sm text-on-surface-variant ${section === "media" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                    Click to add hero image
                  </button>
                )}

                <div onClick={() => setSection("content")} className={`w-full text-left p-3 border ${section === "content" ? "border-[var(--accent)]" : "border-outline-variant/25"}`}>
                  <div className="flex gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => setContentMode("blocks")} className={`text-xs uppercase tracking-[0.15em] border px-2 py-1 ${contentMode === "blocks" ? "border-[var(--accent)]" : "border-outline-variant/40"}`}>Blocks</button>
                    <button type="button" onClick={() => setContentMode("markdown")} className={`text-xs uppercase tracking-[0.15em] border px-2 py-1 ${contentMode === "markdown" ? "border-[var(--accent)]" : "border-outline-variant/40"}`}>Markdown</button>
                  </div>
                  <article className="text-on-surface-variant text-base space-y-3">
                    {contentMode === "markdown" ? (
                      selectedBlog.markdown?.trim() ? (
                        <MarkdownContent content={selectedBlog.markdown} />
                      ) : (
                        <p className="text-sm text-on-surface-variant">No markdown yet. Switch to Markdown mode and start typing.</p>
                      )
                    ) : selectedBlog.content.map((block, blockIndex) => (
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
                                  alt={block.caption || "Blog content image"}
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

                    {contentMode === "blocks" ? (
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={(e) => { e.stopPropagation(); addContentBlock("paragraph"); }} className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Paragraph</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); addContentBlock("quote"); }} className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Quote</button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); addContentBlock("image"); }} className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]">Add Image</button>
                      </div>
                    ) : null}
                  </article>
                </div>
              </div>

              <article className="mt-4 bg-surface-container border border-outline-variant/30 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-headline uppercase tracking-widest text-sm">Edit: {section}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setBlogs((prev) => prev.filter((_, i) => i !== selectedIndex));
                      setSelectedIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
                  >
                    Delete Blog
                  </button>
                </div>

                {section === "header" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input value={selectedBlog.title} onChange={(e) => updateSelected({ ...selectedBlog, title: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Title" />
                      <input value={selectedBlog.slug} onChange={(e) => updateSelected({ ...selectedBlog, slug: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Slug" />
                      <input value={selectedBlog.date} onChange={(e) => updateSelected({ ...selectedBlog, date: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Date" />
                      <input value={selectedBlog.readTime} onChange={(e) => updateSelected({ ...selectedBlog, readTime: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Read time" />
                      <input value={selectedBlog.tag} onChange={(e) => updateSelected({ ...selectedBlog, tag: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Tag" />
                      <input value={selectedBlog.accent} onChange={(e) => updateSelected({ ...selectedBlog, accent: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Accent (#39ff88)" />
                      <input type="color" value={selectedBlog.accent || "#39ff88"} onChange={(e) => updateSelected({ ...selectedBlog, accent: e.target.value })} className="h-10 w-full bg-surface-container-low border border-outline-variant/40 p-1" />
                    </div>
                    <p className="text-sm text-on-surface-variant">Title and excerpt are directly editable in the preview canvas above.</p>
                  </>
                ) : null}

                {section === "skills" ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {quickSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className={`text-xs uppercase tracking-[0.15em] border px-2 py-1 transition-colors ${selectedBlog.skills.includes(skill) ? "border-[var(--accent)] text-on-surface" : "border-outline-variant/40 text-on-surface-variant hover:text-on-surface"}`}
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
                      {selectedBlog.skills.map((skill) => (
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

                {section === "media" ? (
                  <div className="space-y-2">
                    <input value={selectedBlog.heroImage || ""} onChange={(e) => updateSelected({ ...selectedBlog, heroImage: e.target.value })} className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Hero image URL" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void uploadImage(file).then((url) => {
                          if (!url) return;
                          updateSelected({ ...selectedBlog, heroImage: url });
                        });
                      }}
                      className="w-full text-xs text-on-surface-variant"
                    />
                  </div>
                ) : null}

                {section === "content" ? (
                  contentMode === "markdown" ? (
                    <textarea
                      value={selectedBlog.markdown || ""}
                      onChange={(e) => updateSelected({ ...selectedBlog, markdown: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/40 p-3 min-h-[260px] text-sm font-mono"
                      placeholder="# Markdown content\n\nWrite your blog post in Markdown."
                    />
                  ) : (
                    <p className="text-sm text-on-surface-variant">Content blocks are directly editable in the preview canvas above.</p>
                  )
                ) : null}
              </article>
            </>
          ) : (
            <div className="bg-surface-container border border-outline-variant/30 p-6 text-on-surface-variant text-sm">
              No blog selected.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={() => void save(blogs, false)} disabled={saving} className="px-6 py-3 uppercase tracking-widest text-xs border border-[var(--accent,#39ff88)] bg-surface-container-high hover:bg-surface-container-highest transition-colors">
          {saving ? "Saving..." : "Save Blogs"}
        </button>
        <span className="text-sm text-on-surface-variant">{autosaving ? "Autosaving..." : notice}</span>
      </div>
    </section>
  );
}
