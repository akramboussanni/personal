import { notFound } from "next/navigation";
import { ContentBlocks } from "@/components/content-blocks";
import { MarkdownContent } from "@/components/markdown-content";
import { TinySkillIcons } from "@/components/skill-icons";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getBlogBySlug, getBlogs, getSiteConfig } from "@/lib/content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getBlogs();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getBlogBySlug(slug), getSiteConfig()]);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="blog" />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-4">{post.date} / {post.readTime} / {post.tag}</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none font-headline mb-6">{post.title}</h1>
            <p className="text-on-surface-variant text-lg">{post.excerpt}</p>
          </header>
          {post.skills.length ? <TinySkillIcons skills={post.skills} max={12} className="mb-8" /> : null}
          {post.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={post.title} src={post.heroImage} className="w-full aspect-[21/9] object-cover border border-outline-variant/20 mb-10" />
          ) : null}
          <article className="text-on-surface-variant text-lg">
            {post.markdown?.trim() ? <MarkdownContent content={post.markdown} /> : <ContentBlocks blocks={post.content} />}
          </article>
        </div>
      </main>
      <SiteFooter links={site.footerLinks} />
    </div>
  );
}
