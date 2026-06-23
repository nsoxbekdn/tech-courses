"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { MenuIcon } from "./icons";

const navLinks = [
  { href: "/courses", label: "All courses" },
  { href: "/courses?level=Certification", label: "Certifications" },
  { href: "/courses?level=Coding", label: "Coding" },
];

/** Match a nav href against the live pathname + ?level= filter. */
function useIsActive() {
  const pathname = usePathname();
  const level = useSearchParams().get("level");
  return (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    const hrefLevel = query ? new URLSearchParams(query).get("level") : null;
    return hrefLevel === level; // "All courses" (no level) active only when unfiltered
  };
}

function DesktopNav() {
  const isActive = useIsActive();
  return (
    <nav className="ml-2 hidden items-center gap-0.5 md:flex">
      {navLinks.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.label}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "text-ink"
                : "text-ink-soft hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {l.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const isActive = useIsActive();
  return (
    <nav className="border-t border-line bg-surface px-4 py-2 md:hidden">
      {navLinks.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.label}
            href={l.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`block rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-surface-2 text-ink"
                : "text-ink-soft hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-accent font-mono text-sm font-bold text-accent-ink">
        TC
      </span>
      <span className="text-[0.95rem] font-bold tracking-tight text-ink">
        Tech Courses
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { user, ready, isAdmin, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  // The learn player has its own chrome.
  if (pathname?.startsWith("/learn/")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-6">
        <Wordmark />

        <Suspense fallback={<div className="ml-2 hidden md:block" />}>
          <DesktopNav />
        </Suspense>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {!ready ? (
            <div className="h-9 w-24 animate-pulse rounded-[var(--radius)] bg-surface-2" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost hidden sm:inline-flex">
                My learning
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenu((m) => !m)}
                  className="flex items-center rounded-full ring-line transition hover:ring-2"
                  aria-label="Account menu"
                >
                  <Avatar initials={user.name.slice(0, 2).toUpperCase()} size={34} />
                </button>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-pop">
                      <div className="border-b border-line px-4 py-3">
                        <p className="font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenu(false)}
                        className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                      >
                        My learning
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenu(false)}
                          className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                        >
                          Course Studio
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setMenu(false);
                          router.push("/");
                        }}
                        className="block w-full border-t border-line px-4 py-2.5 text-left text-sm text-danger hover:bg-surface-2"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}

          <button
            className="grid h-9 w-9 place-items-center rounded-[var(--radius)] border border-line text-ink-soft md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <MenuIcon width={18} height={18} />
          </button>
        </div>
      </div>

      {open && (
        <Suspense fallback={null}>
          <MobileNav onNavigate={() => setOpen(false)} />
        </Suspense>
      )}
    </header>
  );
}
