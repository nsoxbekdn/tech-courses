"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const columns = [
  {
    title: "Learn",
    links: [
      { label: "All courses", href: "/courses" },
      { label: "NISM Certifications", href: "/courses?level=Certification" },
      { label: "Coding & DSA", href: "/courses?level=Coding" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "My learning", href: "/dashboard" },
      { label: "Instructor studio", href: "/admin" },
      { label: "Browse courses", href: "/courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Terms & privacy", href: "/" },
    ],
  },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/learn/")) return null;

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-accent font-mono text-sm font-bold text-accent-ink">
              TC
            </span>
            <span className="text-[0.95rem] font-bold tracking-tight text-ink">
              Tech Courses
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Free, structured video courses for India&apos;s NISM securities-market
            certifications and competitive coding — from the Tech Courses channel.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="eyebrow">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-soft transition-colors hover:text-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>© 2026 Tech Courses Academy. Course videos © Tech Courses. For educational use.</p>
          <p>Learn NISM certifications &amp; coding, free.</p>
        </div>
      </div>
    </footer>
  );
}
