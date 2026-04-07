"use client";

import { useEffect, useState } from "react";
import { SiteConfig } from "@/lib/types";

type SectionKey = "hero" | "skills" | "footer";

const quickSkills = [
  "typescript",
  "javascript",
  "python",
  "react",
  "nextjs",
  "nodejs",
  "docker",
  "postgresql",
  "aws",
  "gcp",
  "azure",
  "figma",
];

const fallbackSite: SiteConfig = {
  brand: "AKRAMB.COM",
  defaultAccent: "#39ff88",
  rotatingSecondWords: ["build"],
  rotatingThirdWords: ["systems"],
  coreSkills: ["typescript", "react"],
  footerLinks: [
    { label: "GitHub", url: "#" },
    { label: "LinkedIn", url: "#" },
  ],
  coreSkillGroups: [
    { label: "Capabilities", skills: ["typescript", "react"] },
  ],
};

export default function ManageSitePage() {
  const [site, setSite] = useState<SiteConfig>(fallbackSite);
  const [section, setSection] = useState<SectionKey>("hero");
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("Loading...");

  useEffect(() => {
    void fetch("/api/content/site")
      .then((r) => r.json() as Promise<SiteConfig>)
      .then((data) => {
        setSite(data);
        setNotice("");
      })
      .catch(() => setNotice("Failed to load site settings."));
  }, []);

  async function save() {
    setSaving(true);
    setNotice("");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    try {
      const res = await fetch("/api/content/site", {
        method: "PUT",
        headers,
        body: JSON.stringify(site),
      });

      if (!res.ok) {
        setNotice("Save failed. Check admin session or field values.");
      } else {
        setNotice("Site settings saved.");
      }
    } catch {
      setNotice("Save failed due to network/server error.");
    } finally {
      setSaving(false);
    }
  }

  function addCoreSkill(skill: string) {
    const normalized = skill.trim().toLowerCase();
    if (!normalized) return;
    if (site.coreSkills.includes(normalized)) return;
    setSite({ ...site, coreSkills: [...site.coreSkills, normalized] });
    setNewSkill("");
  }

  function removeCoreSkill(skill: string) {
    setSite({ ...site, coreSkills: site.coreSkills.filter((item) => item !== skill) });
  }

  return (
    <section>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-4 space-y-3">
          <button
            type="button"
            onClick={() => setSection("hero")}
            className={`w-full text-left bg-surface-container border p-4 transition-colors ${section === "hero" ? "border-[var(--accent)]" : "border-outline-variant/30 hover:border-outline-variant/60"}`}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Section</p>
            <p className="font-headline uppercase tracking-widest mb-2">Hero</p>
            <p className="text-sm text-on-surface-variant">{site.brand}</p>
            <p className="text-xs text-on-surface-variant mt-2">I {site.rotatingSecondWords[0] || "build"} {site.rotatingThirdWords[0] || "systems"}</p>
          </button>

          <button
            type="button"
            onClick={() => setSection("skills")}
            className={`w-full text-left bg-surface-container border p-4 transition-colors ${section === "skills" ? "border-[var(--accent)]" : "border-outline-variant/30 hover:border-outline-variant/60"}`}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Section</p>
            <p className="font-headline uppercase tracking-widest mb-2">Core Skills</p>
            <div className="flex flex-wrap gap-1">
              {site.coreSkills.slice(0, 8).map((skill) => (
                <span key={skill} className="text-[10px] uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1">{skill}</span>
              ))}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSection("footer")}
            className={`w-full text-left bg-surface-container border p-4 transition-colors ${section === "footer" ? "border-[var(--accent)]" : "border-outline-variant/30 hover:border-outline-variant/60"}`}
          >
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Section</p>
            <p className="font-headline uppercase tracking-widest mb-2">Footer Links</p>
            <div className="space-y-1">
              {site.footerLinks.map((item, index) => (
                <p key={`${item.label}-${index}`} className="text-xs text-on-surface-variant">{item.label} | {item.url}</p>
              ))}
            </div>
          </button>
        </aside>

        <article className="xl:col-span-8 bg-surface-container border border-outline-variant/30 p-4 space-y-4">
          {section === "hero" ? (
            <>
              <h2 className="font-headline uppercase tracking-widest">Edit Hero</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={site.brand} onChange={(e) => setSite({ ...site, brand: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Brand" />
                <input value={site.defaultAccent} onChange={(e) => setSite({ ...site, defaultAccent: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Default accent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <textarea
                  value={site.rotatingSecondWords.join(",")}
                  onChange={(e) => setSite({ ...site, rotatingSecondWords: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
                  className="bg-surface-container-low border border-outline-variant/40 p-2 min-h-[90px] text-sm"
                  placeholder="Second rotating words (comma separated)"
                />
                <textarea
                  value={site.rotatingThirdWords.join(",")}
                  onChange={(e) => setSite({ ...site, rotatingThirdWords: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
                  className="bg-surface-container-low border border-outline-variant/40 p-2 min-h-[90px] text-sm"
                  placeholder="Third rotating words (comma separated)"
                />
              </div>
            </>
          ) : null}

          {section === "skills" ? (
            <>
              <h2 className="font-headline uppercase tracking-widest">Edit Core Skills</h2>

              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Quick Add</p>
                <div className="flex flex-wrap gap-2">
                  {quickSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addCoreSkill(skill)}
                      className={`text-xs uppercase tracking-[0.15em] border px-2 py-1 transition-colors ${site.coreSkills.includes(skill) ? "border-[var(--accent)] text-on-surface" : "border-outline-variant/40 text-on-surface-variant hover:text-on-surface"}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
                  placeholder="Add custom skill"
                />
                <button type="button" onClick={() => addCoreSkill(newSkill)} className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]">
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {site.coreSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => removeCoreSkill(skill)}
                    className="text-xs uppercase tracking-[0.15em] border border-outline-variant/40 px-2 py-1 hover:border-[var(--accent)]"
                    title="Remove skill"
                  >
                    {skill} x
                  </button>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Skill Groups</p>
                  <button
                    type="button"
                    onClick={() => setSite({
                      ...site,
                      coreSkillGroups: [...(site.coreSkillGroups || []), { label: "New Group", skills: [] }],
                    })}
                    className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
                  >
                    Add Group
                  </button>
                </div>
                <div className="space-y-2">
                  {(site.coreSkillGroups || []).map((group, index) => (
                    <div key={`${group.label}-${index}`} className="border border-outline-variant/30 bg-surface-container-low p-3 grid grid-cols-1 md:grid-cols-12 gap-2">
                      <input
                        value={group.label}
                        onChange={(e) => {
                          const next = [...(site.coreSkillGroups || [])];
                          next[index] = { ...group, label: e.target.value };
                          setSite({ ...site, coreSkillGroups: next });
                        }}
                        className="md:col-span-4 bg-surface-container-high border border-outline-variant/40 p-2 text-sm"
                        placeholder="Group label"
                      />
                      <input
                        value={group.skills.join(",")}
                        onChange={(e) => {
                          const next = [...(site.coreSkillGroups || [])];
                          next[index] = {
                            ...group,
                            skills: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                          };
                          setSite({ ...site, coreSkillGroups: next });
                        }}
                        className="md:col-span-7 bg-surface-container-high border border-outline-variant/40 p-2 text-sm"
                        placeholder="skills,comma,separated"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = (site.coreSkillGroups || []).filter((_, i) => i !== index);
                          setSite({ ...site, coreSkillGroups: next });
                        }}
                        className="md:col-span-1 text-xs uppercase tracking-widest border border-outline-variant/40 px-2 py-2 hover:border-[var(--accent)]"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {section === "footer" ? (
            <>
              <h2 className="font-headline uppercase tracking-widest">Edit Footer Links</h2>
              <div className="flex items-center justify-between mb-2">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Links</p>
                <button
                  type="button"
                  onClick={() => setSite({ ...site, footerLinks: [...site.footerLinks, { label: "New Link", url: "#" }] })}
                  className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
                >
                  Add Link
                </button>
              </div>
              <div className="space-y-2">
                {site.footerLinks.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="border border-outline-variant/30 bg-surface-container-low p-3 grid grid-cols-1 md:grid-cols-12 gap-2">
                    <input
                      value={item.label}
                      onChange={(e) => {
                        const next = [...site.footerLinks];
                        next[index] = { ...item, label: e.target.value };
                        setSite({ ...site, footerLinks: next });
                      }}
                      className="md:col-span-3 bg-surface-container-high border border-outline-variant/40 p-2 text-sm"
                      placeholder="Label"
                    />
                    <input
                      value={item.url}
                      onChange={(e) => {
                        const next = [...site.footerLinks];
                        next[index] = { ...item, url: e.target.value };
                        setSite({ ...site, footerLinks: next });
                      }}
                      className="md:col-span-8 bg-surface-container-high border border-outline-variant/40 p-2 text-sm"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => setSite({ ...site, footerLinks: site.footerLinks.filter((_, i) => i !== index) })}
                      className="md:col-span-1 text-xs uppercase tracking-widest border border-outline-variant/40 px-2 py-2 hover:border-[var(--accent)]"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </article>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-6 py-3 uppercase tracking-widest text-xs border border-[var(--accent,#39ff88)] bg-surface-container-high hover:bg-surface-container-highest transition-colors">
          {saving ? "Saving..." : "Save Site Settings"}
        </button>
        <span className="text-sm text-on-surface-variant">{notice}</span>
      </div>
    </section>
  );
}
