"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AsciiDivider } from "./ascii/ascii-block";

const columns = [
  {
    title: "learn",
    links: [
      { label: "all courses", href: "/courses" },
      { label: "nism certifications", href: "/courses?level=Certification" },
      { label: "coding & dsa", href: "/courses?level=Coding" },
    ],
  },
  {
    title: "platform",
    links: [
      { label: "my learning", href: "/dashboard" },
      { label: "instructor studio", href: "/admin" },
      { label: "browse courses", href: "/courses" },
    ],
  },
  {
    title: "company",
    links: [
      { label: "about us", href: "/" },
      { label: "contact", href: "/" },
      { label: "terms & privacy", href: "/" },
    ],
  },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/learn/")) return null;

  return (
    <footer className="relative mt-24 border-t border-line bg-surface">
      <div className="container-page pt-10">
        <AsciiDivider label="eof" />
      </div>
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="metal grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] font-mono text-sm font-bold">
              TC
            </span>
            <span className="font-mono text-[0.95rem] font-bold tracking-tight text-ink">
              tech-courses
            </span>
          </div>
          <p className="mt-4 max-w-xs font-mono text-xs leading-relaxed text-muted">
            <span className="text-line-strong">$</span> free, structured video
            courses for India&apos;s NISM securities-market certifications and
            competitive coding — from the Tech Courses channel.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mono-label uppercase tracking-[0.16em]">
              {"// "}
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="link-draw font-mono text-sm text-ink-soft transition-colors hover:text-accent"
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
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 font-mono text-xs text-muted sm:flex-row">
          <p>
            <span className="text-accent">●</span> © {new Date().getFullYear()}{" "}
            tech courses academy · course videos © tech courses · educational use
          </p>
          <p className="text-line-strong">
            build: <span className="text-accent">ok</span> · nism + coding · free
          </p>
        </div>
      </div>
    </footer>
  );
}
