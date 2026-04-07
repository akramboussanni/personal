"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/manage", label: "Overview" },
  { href: "/manage/site", label: "Site" },
  { href: "/manage/projects", label: "Projects" },
  { href: "/manage/blogs", label: "Blogs" },
];

export function ManageNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 md:gap-3 mb-8">
      {links.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
              active
                ? "border-[var(--accent)] text-on-surface bg-surface-container-high"
                : "border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
