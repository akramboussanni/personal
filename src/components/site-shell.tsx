import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

type FooterLink = {
  label: string;
  url: string;
};

type Section = "home" | "blog";

function navClass(active: boolean) {
  return active
    ? "font-headline tracking-tighter uppercase text-on-surface border-b border-[var(--accent)] pb-1 flicker-on-hover duration-150"
    : "font-headline tracking-tighter uppercase text-on-surface-variant hover:text-on-surface transition-colors flicker-on-hover duration-150";
}

export function SiteHeader({ active }: { active: Section }) {
  return (
    <nav className="fixed top-0 w-full z-50 header-shell">
      <div className="flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
        <Link href="/" className="text-lg font-bold tracking-widest text-on-surface font-headline uppercase">
          AKRAMB.COM
        </Link>
        <div className="flex gap-8 items-center">
          <Link href="/" className={navClass(active === "home")}>
            HOME
          </Link>
          <Link href="/blog" className={navClass(active === "blog")}>
            BLOG
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter({ links = [] }: { links?: FooterLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant/40 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-8">
        <div className="font-headline text-[10px] tracking-widest uppercase text-on-surface-variant">© {year} AKRAM BOUSSANNI</div>
        <div className="flex gap-12">
          {links.map((link) => (
            <a
              key={`${link.label}-${link.url}`}
              className="font-headline text-[10px] tracking-widest uppercase text-on-surface-variant hover:text-[var(--accent)] transition-colors"
              href={link.url || "#"}
              target={link.url?.startsWith("http") ? "_blank" : undefined}
              rel={link.url?.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
