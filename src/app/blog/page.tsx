import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getBlogs, getSiteConfig } from "@/lib/content";

export default async function BlogPage() {
  const [posts, site] = await Promise.all([getBlogs(), getSiteConfig()]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader active="blog" />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <header className="mb-24">
            <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter leading-none text-on-surface">BLOG</h1>
          </header>

          <section className="space-y-0">
            {posts.map((post, index) => (
              <article
                key={post.slug}
                style={{ animationDelay: `${index * 70}ms` }}
                className="group relative py-10 md:py-12 flex flex-col md:flex-row items-baseline gap-4 md:gap-12 transition-all duration-300 hover:bg-surface-container-low px-4 -mx-4 rounded-lg hacker-reveal"
              >
                <div className="w-32 flex-shrink-0">
                  <span className="font-label text-xs tracking-widest text-outline uppercase">{post.date}</span>
                </div>

                <div className="flex-grow">
                  <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-on-surface group-hover:text-white transition-colors">
                    <Link href={`/blog/${post.slug}`} className="inline-block relative">
                      {post.title}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-500 group-hover:w-full"></span>
                    </Link>
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm text-on-surface-variant">{post.excerpt}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-outline">schedule</span>
                      <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">{post.readTime}</span>
                    </div>
                    <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">{post.tag}</span>
                  </div>
                </div>

                <div className="hidden md:block">
                  <span className="material-symbols-outlined text-outline group-hover:text-white transition-transform duration-300 group-hover:translate-x-2">
                    arrow_forward
                  </span>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
      <SiteFooter links={site.footerLinks} />
    </div>
  );
}