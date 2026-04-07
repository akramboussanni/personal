import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContentBlocks } from "@/components/content-blocks";
import { SingleSkillIcon } from "@/components/skill-icons";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getProjectBySlug, getProjects, getSiteConfig } from "@/lib/content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Akram Boussanni",
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, site] = await Promise.all([getProjectBySlug(slug), getSiteConfig()]);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="home" />
      <main className="flex-1 pt-32 pb-24 px-6 max-w-5xl mx-auto w-full" style={{ ["--accent" as string]: project.accent }}>
        <section className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[var(--accent)]"></span>
              <span className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant">
                {project.featured ? "Featured Work" : "Prototype / Project"}
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">{project.title}</h1>
          </div>
        </section>

        {project.heroImage ? (
          <section className="mb-16">
            <div className="relative w-full aspect-video md:aspect-[21/9] bg-surface-container overflow-hidden border border-outline-variant/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={project.title} className="w-full h-full object-cover" src={project.heroImage} />
            </div>
          </section>
        ) : null}

        {project.skills.length ? (
          <div className="mb-10 flex flex-wrap gap-2">
            {project.skills.map((skill) => (
              <div key={skill} className="inline-flex items-center gap-2 border border-outline-variant/30 bg-surface-container-low px-2.5 py-1.5 text-[10px] font-label uppercase tracking-[0.14em]">
                <SingleSkillIcon skill={skill} className="w-3.5 h-3.5 object-contain" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-7 space-y-8">
            <h2 className="font-headline text-2xl uppercase tracking-tight text-surface-tint">Operational Overview</h2>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="font-headline text-3xl uppercase tracking-tight text-on-surface mb-3">{children}</h1>,
                h2: ({ children }) => <h2 className="font-headline text-2xl uppercase tracking-tight text-on-surface mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="font-headline text-xl uppercase tracking-tight text-on-surface mb-2">{children}</h3>,
                h4: ({ children }) => <h4 className="font-headline text-lg uppercase tracking-tight text-on-surface mb-1">{children}</h4>,
                p: ({ children }) => <p className="text-on-surface text-lg leading-relaxed font-light">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-1 text-on-surface text-lg leading-relaxed font-light">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1 text-on-surface text-lg leading-relaxed font-light">{children}</ol>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline decoration-white/60 underline-offset-4 transition-colors hover:text-white"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {project.summary}
            </ReactMarkdown>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-outline-variant/80 to-transparent" aria-hidden="true" />
            <ContentBlocks blocks={project.content} />
          </div>

          <div className="md:col-span-5 space-y-8">
            <h3 className="font-headline text-sm uppercase tracking-[0.3em] text-on-surface-variant">System Specifications</h3>
            <ul className="space-y-4">
              {(project.specs || []).map((spec) => (
                <li key={`${spec.label}-${spec.value}`} className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                  <span className="text-xs uppercase text-on-surface-variant tracking-widest">{spec.label}</span>
                  <span className="font-label text-sm uppercase">{spec.value}</span>
                </li>
              ))}
            </ul>

            {project.featured && project.featuredDetails ? (
              <div className="bg-surface-container p-6 border border-outline-variant/20 space-y-4">
                <h4 className="font-headline uppercase tracking-widest text-sm">Featured Breakdown</h4>
                <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Problem:</strong> {project.featuredDetails.problem}</p>
                <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Approach:</strong> {project.featuredDetails.approach}</p>
                <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Impact:</strong> {project.featuredDetails.impact}</p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter links={site.footerLinks} />
    </div>
  );
}
