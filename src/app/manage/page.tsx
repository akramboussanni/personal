import Link from "next/link";

const cards = [
  {
    href: "/manage/site",
    title: "Site Settings",
    copy: "Brand, accent, rotating words, core stack groups, and footer links.",
  },
  {
    href: "/manage/projects",
    title: "Projects",
    copy: "Project metadata, featured settings, skills, content blocks, and ordering.",
  },
  {
    href: "/manage/blogs",
    title: "Blogs",
    copy: "Blog metadata, skills, content blocks, and ordering.",
  },
];

export default function ManageOverviewPage() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="bg-surface-container border border-outline-variant/30 p-5 hover:border-[var(--accent)] transition-colors blog-card"
        >
          <h2 className="font-headline uppercase tracking-widest mb-2">{card.title}</h2>
          <p className="text-sm text-on-surface-variant">{card.copy}</p>
        </Link>
      ))}
    </section>
  );
}
