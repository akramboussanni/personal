"use client";

import { ContentBlocksEditor } from "@/components/manage/content-blocks-editor";
import { BlogPost } from "@/lib/types";

type Props = {
  blog: BlogPost;
  onChange: (next: BlogPost) => void;
  onDelete: () => void;
};

export function BlogEditorCard({ blog, onChange, onDelete }: Props) {
  return (
    <article className="bg-surface-container border border-outline-variant/30 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-headline uppercase tracking-widest text-sm">{blog.title || "Untitled Blog"}</h3>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs uppercase tracking-widest border border-outline-variant/40 px-3 py-2 hover:border-[var(--accent)]"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={blog.title} onChange={(e) => onChange({ ...blog, title: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Title" />
        <input value={blog.slug} onChange={(e) => onChange({ ...blog, slug: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Slug" />
        <input value={blog.date} onChange={(e) => onChange({ ...blog, date: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Date" />
        <input value={blog.readTime} onChange={(e) => onChange({ ...blog, readTime: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Read time" />
        <input value={blog.tag} onChange={(e) => onChange({ ...blog, tag: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Tag" />
        <input value={blog.accent} onChange={(e) => onChange({ ...blog, accent: e.target.value })} className="bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Accent (#39ff88)" />
        <input value={blog.heroImage || ""} onChange={(e) => onChange({ ...blog, heroImage: e.target.value })} className="md:col-span-2 bg-surface-container-low border border-outline-variant/40 p-2 text-sm" placeholder="Hero image URL" />
      </div>

      <textarea
        value={blog.excerpt}
        onChange={(e) => onChange({ ...blog, excerpt: e.target.value })}
        className="w-full bg-surface-container-low border border-outline-variant/40 p-2 min-h-[80px] text-sm"
        placeholder="Excerpt"
      />

      <input
        value={blog.skills.join(",")}
        onChange={(e) => onChange({ ...blog, skills: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
        className="w-full bg-surface-container-low border border-outline-variant/40 p-2 text-sm"
        placeholder="Skills (comma separated)"
      />

      <div>
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2">Content Blocks</p>
        <ContentBlocksEditor blocks={blog.content} onChange={(content) => onChange({ ...blog, content })} />
      </div>
    </article>
  );
}
