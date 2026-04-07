"use client";

import { ContentBlocksEditor } from "@/components/manage/content-blocks-editor";
import { Project } from "@/lib/types";

type Props = {
  project: Project;
  onChange: (next: Project) => void;
  onDelete: () => void;
};

export function ProjectEditorCard({ project, onChange, onDelete }: Props) {
  return (
    <article className="bg-surface-container border border-outline-variant/30 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-headline uppercase tracking-widest text-sm">{project.title || "Untitled Project"}</h3>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={project.title} onChange={(e) => onChange({ ...project, title: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Title" />
        <input value={project.slug} onChange={(e) => onChange({ ...project, slug: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Slug" />
        <input value={project.year} onChange={(e) => onChange({ ...project, year: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Year" />
        <input value={project.category} onChange={(e) => onChange({ ...project, category: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Category" />
        <input value={project.accent} onChange={(e) => onChange({ ...project, accent: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Accent (#39ff88)" />
        <input value={project.heroImage || ""} onChange={(e) => onChange({ ...project, heroImage: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Hero image URL" />
      </div>

      <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant">
        <input
          type="checkbox"
          checked={project.featured}
          onChange={(e) => onChange({ ...project, featured: e.target.checked })}
        />
        Featured project
      </label>

      <textarea
        value={project.summary}
        onChange={(e) => onChange({ ...project, summary: e.target.value })}
        className="w-full bg-surface-container-low border border-outline-variant/40 p-2 min-h-[80px] text-sm"
        placeholder="Summary"
      />

      <input
        value={project.skills.join(",")}
        onChange={(e) => onChange({ ...project, skills: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
        className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
        placeholder="Skills (comma separated)"
      />

      {project.featured ? (
        <div className="grid grid-cols-1 gap-2">
          <input
            value={project.featuredDetails?.problem || ""}
            onChange={(e) => onChange({
              ...project,
              featuredDetails: {
                problem: e.target.value,
                approach: project.featuredDetails?.approach || "",
                impact: project.featuredDetails?.impact || "",
              },
            })}
            className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
            placeholder="Featured: Problem"
          />
          <input
            value={project.featuredDetails?.approach || ""}
            onChange={(e) => onChange({
              ...project,
              featuredDetails: {
                problem: project.featuredDetails?.problem || "",
                approach: e.target.value,
                impact: project.featuredDetails?.impact || "",
              },
            })}
            className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
            placeholder="Featured: Approach"
          />
          <input
            value={project.featuredDetails?.impact || ""}
            onChange={(e) => onChange({
              ...project,
              featuredDetails: {
                problem: project.featuredDetails?.problem || "",
                approach: project.featuredDetails?.approach || "",
                impact: e.target.value,
              },
            })}
            className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
            placeholder="Featured: Impact"
          />
        </div>
      ) : null}

      <div>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Content Blocks</p>
        <ContentBlocksEditor blocks={project.content} onChange={(content) => onChange({ ...project, content })} />
      </div>
    </article>
  );
}
