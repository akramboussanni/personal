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

export function HomeView({ site, projects, blogs }: Props) {
  const [accent, setAccent] = useState<string | null>(null);
  const [specialFeatured, setSpecialFeatured] = useState(false);
  const [secondIndex, setSecondIndex] = useState(0);
  const [thirdIndex, setThirdIndex] = useState(0);
  const [activeSkill, setActiveSkill] = useState(site.coreSkills[0] || "");
  const [featuredHoverPoint, setFeaturedHoverPoint] = useState<{ x: number; y: number } | null>(null);

  const featured = useMemo(() => projects.filter((item) => item.featured), [projects]);
  const other = useMemo(() => projects.filter((item) => !item.featured), [projects]);
  const groupedSkills = useMemo(() => {
    if (site.coreSkillGroups?.length) {
      return site.coreSkillGroups;
    }

    return [{ label: "Capabilities", skills: site.coreSkills }];
  }, [site.coreSkillGroups, site.coreSkills]);
  const skillStats = useMemo(() => {
    const projectCount = projects.filter((project) => project.skills.includes(activeSkill)).length;
    const blogCount = blogs.filter((blog) => blog.skills.includes(activeSkill)).length;

    return {
      projectCount,
      blogCount,
      total: projectCount + blogCount,
    };
  }, [activeSkill, blogs, projects]);

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
      <main className="flex-1 pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
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

        <section className="mb-24 hacker-reveal">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter">Core stack</h2>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-[0.3em]"></span>
          </div>
          <div className="bg-surface-container border border-outline-variant/30 rounded-md p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groupedSkills.map((group) => (
                <div key={group.label} className="border border-outline-variant/35 rounded-sm bg-surface-container-low p-3">
                  <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-3">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => {
                      const isActive = skill === activeSkill;
                      return (
                        <button
                          key={`${group.label}-${skill}`}
                          type="button"
                          onClick={() => setActiveSkill(skill)}
                          className={`inline-flex items-center gap-1.5 border rounded-sm px-2 py-1 uppercase tracking-[0.12em] text-[10px] font-label skill-chip-hover ${
                            isActive ? "border-[var(--accent)] text-on-surface" : "border-outline-variant/40 text-on-surface-variant"
                          }`}
                        >
                          <SingleSkillIcon skill={skill} className="w-3 h-3 object-contain" />
                          <span>{skill}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-outline-variant/35 rounded-sm bg-surface-container-low p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SingleSkillIcon skill={activeSkill} className="w-4 h-4 object-contain" />
                <p className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface">{activeSkill}</p>
              </div>
              <p className="text-[11px] font-label uppercase tracking-[0.14em] text-on-surface-variant">
                {skillStats.projectCount} projects / {skillStats.blogCount} posts / {skillStats.total} total
              </p>
            </div>
          </div>
        </section>

        <section className="mb-24 hacker-reveal">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline text-3xl font-bold uppercase tracking-tighter section-kicker">Featured Works</h2>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-[0.3em]"></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <section className="mb-24 hacker-reveal">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline text-xl font-bold uppercase tracking-widest text-on-surface-variant section-kicker">Other Works</h2>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-[0.3em]"></span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
            {other.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="p-6 border border-outline-variant/20 rounded-md hover:bg-surface-container-low transition-colors group ui-card-hover"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-[var(--accent)]">deployed_code</span>
                  <TinySkillIcons skills={project.skills} max={3} />
                </div>
                <h4 className="font-headline font-bold uppercase text-sm mb-2">{project.title}</h4>
                <p className="text-xs text-on-surface-variant font-body mb-2">{project.summary}</p>
                <p className="text-[10px] font-label text-on-surface-variant">{project.year}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="hacker-reveal">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-widest section-kicker">Latest Posts</h2>
            <Link href="/blog" className="font-label text-xs uppercase tracking-[0.3em] text-on-surface-variant hover:text-on-surface">Open Blog</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogs.slice(0, 3).map((post, index) => (
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
      </main>
      <SiteFooter links={site.footerLinks} />
    </div>
  );
}
