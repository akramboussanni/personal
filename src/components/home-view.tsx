"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { BlogPost, Project, SiteConfig } from "@/lib/types";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { SingleSkillIcon, TinySkillIcons } from "@/components/skill-icons";

type Props = {
  site: SiteConfig;
  projects: Project[];
  blogs: BlogPost[];
};

function sentenceCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function skillLabel(value: string) {
  return value.replace(/[-_]/g, " ").toUpperCase();
}

function timelineDate(project: Project) {
  if (!project.startedAt) return project.year;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(`${project.startedAt}T00:00:00Z`));
}

function isPlaceholderBlog(post: BlogPost) {
  return post.title.trim().toLowerCase() === "new blog post" && post.excerpt.trim().toLowerCase() === "click to add excerpt";
}

const GROUP_TONE_PALETTE = ["#4f8cff", "#00b894", "#ff8a3d", "#8e7dff", "#00a7cc", "#ff5f9e", "#8bc34a", "#7f8a99"];

function resolveGroupTone(index: number, configuredTone?: string) {
  return configuredTone || GROUP_TONE_PALETTE[index % GROUP_TONE_PALETTE.length];
}

export function HomeView({ site, projects, blogs }: Props) {
  const [accent, setAccent] = useState<string | null>(null);
  const [specialFeatured, setSpecialFeatured] = useState(false);
  const [secondIndex, setSecondIndex] = useState(0);
  const [thirdIndex, setThirdIndex] = useState(0);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [featuredHoverPoint, setFeaturedHoverPoint] = useState<{ x: number; y: number } | null>(null);

  const featured = useMemo(() => projects.filter((item) => item.featured), [projects]);
  const other = useMemo(
    () => projects.filter((item) => !item.featured).sort((a, b) => (a.startedAt || a.year).localeCompare(b.startedAt || b.year)),
    [projects],
  );
  const filteredOther = useMemo(
    () => other.filter((project) => !activeSkill || project.skills.includes(activeSkill)),
    [activeSkill, other],
  );
  const groupedSkills = useMemo(() => {
    if (site.coreSkillGroups?.length) {
      return site.coreSkillGroups;
    }

    return [{ label: "Capabilities", skills: site.coreSkills }];
  }, [site.coreSkillGroups, site.coreSkills]);

  const visibleBlogs = useMemo(() => blogs.filter((blog) => !isPlaceholderBlog(blog)), [blogs]);

  const skillToGroup = useMemo(() => {
    const map = new Map<string, { label: string; tone: string }>();

    for (const [index, group] of groupedSkills.entries()) {
      const tone = resolveGroupTone(index, group.tone);
      for (const skill of group.skills) {
        map.set(skill, { label: group.label, tone });
      }
    }

    return map;
  }, [groupedSkills]);

  const skillLinkedProjects = useMemo(
    () => (activeSkill ? projects.filter((project) => project.skills.includes(activeSkill)) : []),
    [activeSkill, projects],
  );

  const skillLinkedBlogs = useMemo(
    () => (activeSkill ? visibleBlogs.filter((blog) => blog.skills.includes(activeSkill)) : []),
    [activeSkill, visibleBlogs],
  );

  const hasAnyBlogs = visibleBlogs.length > 0;
  const activeGroup = activeSkill ? skillToGroup.get(activeSkill) : null;
  const activeTone = activeGroup?.tone ?? GROUP_TONE_PALETTE[0];

  const skillStats = useMemo(() => {
    return {
      projectCount: skillLinkedProjects.length,
      blogCount: skillLinkedBlogs.length,
      total: skillLinkedProjects.length + skillLinkedBlogs.length,
    };
  }, [skillLinkedBlogs.length, skillLinkedProjects.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setThirdIndex((prev) => {
        const next = (prev + 1) % site.rotatingThirdWords.length;
        if ((prev + 1) % 3 === 0) {
          setSecondIndex((current) => (current + 1) % site.rotatingSecondWords.length);
        }
        return next;
      });
    }, 1600);

    return () => clearInterval(timer);
  }, [site.rotatingSecondWords.length, site.rotatingThirdWords.length]);

  useEffect(() => {
    if (accent) {
      document.documentElement.style.setProperty("--accent", accent);
      return;
    }
    document.documentElement.style.removeProperty("--accent");
  }, [accent]);

  function applyHover(project: Project, event: ReactMouseEvent<HTMLAnchorElement>) {
    if (project.featured) {
      const rect = event.currentTarget.getBoundingClientRect();
      setFeaturedHoverPoint({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setAccent(project.accent || null);
      setSpecialFeatured(true);
      return;
    }

    setFeaturedHoverPoint(null);
    setSpecialFeatured(false);
  }

  function clearHover() {
    setAccent(null);
    setFeaturedHoverPoint(null);
    setSpecialFeatured(false);
  }

  return (
    <div
      className={`min-h-screen flex flex-col featured-layer accent-fade ${specialFeatured ? "featured-distort" : ""}`}
      style={
        featuredHoverPoint
          ? {
              ["--featured-x" as string]: `${featuredHoverPoint.x}px`,
              ["--featured-y" as string]: `${featuredHoverPoint.y}px`,
            }
          : undefined
      }
    >
      <SiteHeader active="home" />
      <main className="flex-1 pt-48 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full">
        <header className="mb-24 hacker-reveal">
          <div className="flex flex-col gap-4 mb-8">
            <h1 className="font-headline text-7xl md:text-9xl font-bold uppercase tracking-tighter leading-[0.9]">
              AKRAM
              <br />
              BOUSSANNI
            </h1>
          </div>
          <div className="flex items-center gap-3 font-headline uppercase tracking-widest text-lg md:text-2xl border-l-4 pl-6 py-2 hero-rotating-line">
            <span>I</span>
            <span key={`second-${secondIndex}`} className="hero-word-swap">{site.rotatingSecondWords[secondIndex]}</span>
            <span key={`third-${thirdIndex}`} className="hero-rotating-third hero-word-swap cursor-blink">{site.rotatingThirdWords[thirdIndex]}</span>
          </div>
        </header>

        <div className="story-sequence mb-24">
        <section className="hidden mb-0 hacker-reveal home-stack-panel home-stack-story" aria-hidden="true">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-2">The toolkit</p>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter">Core stack</h2>
            </div>
            <span className="hidden md:block font-label text-xs text-on-surface-variant uppercase tracking-[0.3em]">Chosen per problem</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-5 core-stack-list">
              {groupedSkills.map((group, groupIndex) => (
                <div key={group.label} className="core-stack-row grid grid-cols-[28px_92px_1fr] md:grid-cols-[36px_112px_1fr] gap-x-3 items-start">
                  <span className="core-stack-index">{String(groupIndex + 1).padStart(2, "0")}</span>
                  <p className="text-[12px] text-on-surface-variant text-left leading-6 pt-1.5">{sentenceCase(group.label)}</p>
                  <div className="flex flex-wrap gap-2 pl-1">
                    {group.skills.map((skill) => {
                      const isActive = skill === activeSkill;
                      const tone = resolveGroupTone(groupIndex, group.tone);

                      return (
                        <button
                          key={`${group.label}-${skill}`}
                          type="button"
                          onClick={() => setActiveSkill(skill)}
                          className={`inline-flex items-center gap-1.5 border rounded-sm px-2.5 py-1.5 text-[12px] leading-none skill-chip-hover ${
                            isActive ? "text-on-surface bg-surface-container-low" : "text-on-surface-variant"
                          }`}
                          style={
                            isActive
                              ? {
                                  borderColor: `color-mix(in srgb, ${tone} 62%, var(--outline-variant) 38%)`,
                                  borderLeftWidth: "3px",
                                  borderLeftColor: tone,
                                  backgroundColor: `color-mix(in srgb, ${tone} 11%, var(--surface-container-low) 89%)`,
                                }
                              : {
                                  borderColor: `color-mix(in srgb, ${tone} 32%, var(--outline-variant) 68%)`,
                                }
                          }
                        >
                          <SingleSkillIcon skill={skill} className="w-3 h-3 object-contain" />
                          <span>{skillLabel(skill)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5 pt-3">
              {activeSkill ? (
                <div
                  className="inline-flex items-center gap-2 rounded-none px-2.5 py-1.5 text-[12px] border border-outline-variant/40"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${activeTone} 14%, var(--surface-container-low) 86%)`,
                    borderLeft: `3px solid ${activeTone}`,
                  }}
                >
                  <SingleSkillIcon skill={activeSkill} className="w-3 h-3 object-contain" />
                  <span className="text-on-surface">FILTERING BY {skillLabel(activeSkill)}</span>
                  <button
                    type="button"
                    onClick={() => setActiveSkill(null)}
                    className="text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label="Clear technology filter"
                  >
                    x
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-on-surface-variant">The tools are a map of the work below. Select one to follow it through the projects and notes.</p>
              )}

              {activeSkill ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-on-surface-variant">{`PROJECTS USING ${skillLabel(activeSkill)}`}</p>
                    <span className="text-[13px] text-on-surface-variant">{skillStats.projectCount}</span>
                  </div>

                  {skillLinkedProjects.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                      {skillLinkedProjects.map((project, index) => (
                        <Link
                          key={`skill-project-${project.slug}`}
                          href={`/projects/${project.slug}`}
                          style={{ animationDelay: `${index * 55}ms` }}
                          className="h-full flex flex-col rounded-none p-3 bg-surface-container skill-result-card hover:bg-surface-container-low"
                        >
                          <p className="font-headline text-[14px] font-medium tracking-normal">{project.title}</p>
                          <p className="text-[13px] text-on-surface-variant line-clamp-2 mt-1">{project.summary}</p>
                          <p className="text-[11px] mt-auto pt-3" style={{ color: "color-mix(in srgb, var(--on-surface-variant) 86%, transparent)" }}>
                            {project.year} / {project.category.toLowerCase()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-on-surface-variant">No projects match this filter yet.</p>
                  )}

                  {skillLinkedBlogs.length ? (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] text-on-surface-variant">{`POSTS USING ${skillLabel(activeSkill)}`}</p>
                        <span className="text-[13px] text-on-surface-variant">{skillStats.blogCount}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        {skillLinkedBlogs.map((post, index) => (
                          <Link
                            key={`skill-blog-${post.slug}`}
                            href={`/blog/${post.slug}`}
                            style={{ animationDelay: `${index * 55}ms` }}
                            className="h-full flex flex-col rounded-none p-3 bg-surface-container skill-result-card hover:bg-surface-container-low"
                          >
                            <p className="font-headline text-[14px] font-medium tracking-normal">{post.title}</p>
                            <p className="text-[13px] text-on-surface-variant line-clamp-2 mt-1">{post.excerpt}</p>
                            <p className="text-[11px] mt-auto pt-3" style={{ color: "color-mix(in srgb, var(--on-surface-variant) 86%, transparent)" }}>
                              {post.date} / {post.readTime}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-28 mb-0 hacker-reveal home-featured-panel">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-2">Chapter one</p>
              <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter section-kicker">Featured Works</h2>
            </div>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-[0.3em]">The larger systems</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 featured-project-grid">
            {featured.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                onMouseEnter={(event) => applyHover(project, event)}
                onMouseLeave={clearHover}
                className="group relative bg-surface-container flex flex-col border border-outline-variant/20 rounded-md transition-all duration-300 hover:border-[var(--accent)] leak-hover ui-card-hover"
              >
                <div className="aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={project.title} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" src={project.heroImage || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop"} />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="font-headline text-2xl font-bold uppercase tracking-tighter">{project.title}</h3>
                    {project.skills.length ? <TinySkillIcons skills={project.skills} max={4} className="shrink-0" /> : null}
                  </div>
                  <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">{project.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        </div>

        <section className="skill-journey mb-16 hacker-reveal">
          <details className="skill-filter-details">
            <summary>
              <span className="skill-filter-summary-label">Filter projects by skill</span>
              <span className="skill-filter-summary-value">{activeSkill ? skillLabel(activeSkill) : "All work"}</span>
              <span className="skill-filter-summary-icon" aria-hidden="true">+</span>
            </summary>
            <div className="skill-filter-dock">
              <button type="button" onClick={() => setActiveSkill(null)} className={`skill-filter-all ${activeSkill ? "" : "is-active"}`}>All work</button>
            {groupedSkills.map((group, groupIndex) => (
              <div className="skill-filter-group" key={group.label}>
                <span>{String(groupIndex + 1).padStart(2, "0")} / {sentenceCase(group.label)}</span>
                <div>
                  {group.skills.map((skill) => (
                    <button
                      type="button"
                      key={`filter-${skill}`}
                      onClick={() => setActiveSkill(skill)}
                      className={`skill-filter-chip ${activeSkill === skill ? "is-active" : ""}`}
                      style={{ ["--chip-tone" as string]: resolveGroupTone(groupIndex, group.tone) }}
                    >
                      <SingleSkillIcon skill={skill} className="w-3 h-3 object-contain" />
                      {skillLabel(skill)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </details>
        </section>

        <section className="mb-24 hacker-reveal">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-on-surface-variant section-kicker">Other Works</h2>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-[0.3em]"></span>
          </div>
          <div className="project-timeline">
            {filteredOther.map((project, projectIndex) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                style={{ animationDelay: `${projectIndex * 90}ms` }}
                onMouseEnter={(event) => applyHover(project, event)}
                onMouseLeave={clearHover}
                className="project-timeline-item group relative bg-surface-container border border-outline-variant/20 rounded-md transition-all duration-300 hover:border-[var(--accent)] leak-hover ui-card-hover"
              >
                <div className="project-timeline-rail" aria-hidden="true">
                  <span>{timelineDate(project)}</span>
                  <i />
                </div>
                <div className="project-timeline-image aspect-video overflow-hidden bg-surface-container-low">
                  {project.heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={project.title} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" src={project.heroImage} />
                  ) : (
                    <div className="project-placeholder" aria-hidden="true">
                      <span className="project-placeholder-grid" />
                      <span className="project-placeholder-label">{project.category}</span>
                      <span className="project-placeholder-mark">{String(projectIndex + 1).padStart(2, "0")}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant mb-2">{project.category}</p>
                      <h4 className="font-headline text-2xl font-bold uppercase tracking-tighter">{project.title}</h4>
                    </div>
                    {project.skills.length ? <TinySkillIcons skills={project.skills} max={4} className="shrink-0" /> : null}
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4 max-w-2xl">{project.summary}</p>
                  <div className="project-skill-trail">
                    {project.skills.map((skill) => <span key={`${project.slug}-${skill}`}>{skillLabel(skill)}</span>)}
                  </div>
                  <span className="project-timeline-cta">Open project <span aria-hidden="true">↗</span></span>
                </div>
              </Link>
            ))}
            {!filteredOther.length ? <p className="text-sm text-on-surface-variant py-8">No projects use {skillLabel(activeSkill || "this skill")} yet.</p> : null}
          </div>
        </section>

        {hasAnyBlogs ? (
          <section className="hacker-reveal">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-headline text-2xl font-bold uppercase tracking-widest section-kicker">Latest Posts</h2>
              <Link href="/blog" className="font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant hover:text-on-surface">Open Blog</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleBlogs.slice(0, 3).map((post, index) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{ animationDelay: `${index * 60}ms` }}
                  className="relative bg-surface-container border border-outline-variant/30 p-6 hover:border-[var(--accent)] transition-colors blog-card ui-card-hover"
                >
                  <TinySkillIcons skills={post.skills} max={3} className="absolute top-3 right-3" />
                  <h3 style={{ animationDelay: `${120 + index * 60}ms` }} className="font-headline uppercase text-lg mb-2 blog-title-reveal">{post.title}</h3>
                  <p style={{ animationDelay: `${190 + index * 60}ms` }} className="text-sm text-on-surface-variant mb-3 blog-excerpt-reveal">{post.excerpt}</p>
                  <p style={{ animationDelay: `${240 + index * 60}ms` }} className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant blog-meta-reveal">{post.date} / {post.readTime}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter links={site.footerLinks} />
    </div>
  );
}
