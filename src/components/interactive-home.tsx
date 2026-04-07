"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BlogPost, Project } from "@/lib/types";

type Props = {
  featured: Project[];
  others: Project[];
  blogs: BlogPost[];
};

const defaultTitle = "Every project is a different atmosphere.";
const defaultSubtitle =
  "Hover any project to trigger accent takeover. Hover featured work to trigger full priority mode.";

export function InteractiveHome({ featured, others, blogs }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const [priorityMode, setPriorityMode] = useState(false);
  const [accent, setAccent] = useState<string | null>(null);

  useEffect(() => {
    if (accent) {
      document.documentElement.style.setProperty("--accent", accent);
      return;
    }
    document.documentElement.style.removeProperty("--accent");
  }, [accent]);

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const totalCount = useMemo(() => featured.length + others.length + blogs.length, [featured.length, others.length, blogs.length]);

  function onHover(accentColor: string, label: string, type: "featured" | "project" | "blog") {
    setAccent(accentColor);
    if (type === "featured") {
      setPriorityMode(true);
      setTitle(label + " is now in priority mode.");
      setSubtitle("Featured hover triggered full-site visual takeover.");
      return;
    }

    setPriorityMode(false);
    if (type === "blog") {
      setTitle("Editorial focus: " + label);
      setSubtitle("Blog accent takeover active.");
    } else {
      setTitle("Project focus: " + label);
      setSubtitle("Project accent takeover active.");
    }
  }

  function onLeave() {
    setAccent(null);
    setPriorityMode(false);
    setTitle(defaultTitle);
    setSubtitle(defaultSubtitle);
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
  }

  return (
    <div className={priorityMode ? "priority-mode" : ""}>
      <header className="topbar">
        <div className="brand">AKRAMB.COM // SSR PORTFOLIO</div>
        <div className="controls">
          <button onClick={toggleTheme} className="pill" type="button">
            Toggle Light/Dark
          </button>
          <Link className="pill" href="/studio">
            Open Visual Studio
          </Link>
        </div>
      </header>

      <section className="hero">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <section className="sections space-y-10">
        <div>
          <div className="section-title">
            <h3>Featured Projects</h3>
            <span>Hover = Full Do-Over</span>
          </div>
          <div className="cards">
            {featured.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card featured"
                onMouseEnter={() => onHover(project.accent, project.title, "featured")}
                onMouseLeave={onLeave}
              >
                <strong>{project.title}</strong>
                <p>{project.summary}</p>
                <div className="meta">
                  <span>{project.year} / {project.category}</span>
                  <span className="chip" style={{ background: project.accent }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">
            <h3>Other Projects + Prototypes</h3>
            <span>Hover = Accent Takeover</span>
          </div>
          <div className="cards four">
            {others.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card"
                onMouseEnter={() => onHover(project.accent, project.title, "project")}
                onMouseLeave={onLeave}
              >
                <strong>{project.title}</strong>
                <p>{project.summary}</p>
                <div className="meta">
                  <span>{project.year} / {project.category}</span>
                  <span className="chip" style={{ background: project.accent }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="section-title">
            <h3>Blog Posts</h3>
            <span>{totalCount} Total Managed Entries</span>
          </div>
          <div className="cards">
            {blogs.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card"
                onMouseEnter={() => onHover(post.accent, post.title, "blog")}
                onMouseLeave={onLeave}
              >
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
                <div className="meta">
                  <span>{post.date} / {post.readTime} / {post.tag}</span>
                  <span className="chip" style={{ background: post.accent }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
