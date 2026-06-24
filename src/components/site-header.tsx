"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "@/lib/store";
import { Avatar } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { MenuIcon } from "./icons";

const navLinks = [
  { href: "/courses", label: "courses" },
  { href: "/courses?level=Certification", label: "certifications" },
  { href: "/courses?level=Coding", label: "coding" },
];

/** Match a nav href against the live pathname + ?level= filter. */
function useIsActive() {
  const pathname = usePathname();
  const level = useSearchParams().get("level");
  return (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    const hrefLevel = query ? new URLSearchParams(query).get("level") : null;
    return hrefLevel === level; // "courses" (no level) active only when unfiltered
  };
}

/** Bracketed terminal nav item: [ label_ ] with accent brackets + hover caret. */
function NavItem({
  href,
  label,
  active,
  onClick,
  block = false,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  block?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      data-active={active}
      className={`group font-mono text-sm transition-colors ${
        block ? "block py-2.5" : "px-2.5 py-2"
      } ${active ? "text-ink" : "text-ink-soft hover:text-ink"}`}
    >
      <span
        className={`mr-0.5 transition-colors ${
          active ? "text-accent" : "text-line-strong group-hover:text-accent"
        }`}
      >
        [
      </span>
      {label}
      <span className="text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        _
      </span>
      <span
        className={`ml-0.5 transition-colors ${
          active ? "text-accent" : "text-line-strong group-hover:text-accent"
        }`}
      >
        ]
      </span>
    </Link>
  );
}

function DesktopNav() {
  const isActive = useIsActive();
  return (
    <nav className="ml-1 hidden items-center gap-1 md:flex">
      {navLinks.map((l) => (
        <NavItem key={l.label} href={l.href} label={l.label} active={isActive(l.href)} />
      ))}
    </nav>
  );
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const isActive = useIsActive();
  return (
    <nav className="border-t border-line bg-surface px-4 py-2 md:hidden">
      {navLinks.map((l) => (
        <NavItem
          key={l.label}
          href={l.href}
          label={l.label}
          active={isActive(l.href)}
          onClick={onNavigate}
          block
        />
      ))}
    </nav>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="metal grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] font-mono text-sm font-bold">
        TC
      </span>
      <span className="font-mono text-[0.95rem] font-bold tracking-tight text-ink">
        tech-courses
        <span className="text-accent caret caret-bare" />
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
      <div className="container-page flex h-16 items-center gap-5">
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
                my learning
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
                        <p className="font-mono text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate font-mono text-xs text-muted">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenu(false)}
                        className="block px-4 py-2.5 font-mono text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                      >
                        my learning
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenu(false)}
                          className="block px-4 py-2.5 font-mono text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
                        >
                          course studio
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setMenu(false);
                          router.push("/");
                        }}
                        className="block w-full border-t border-line px-4 py-2.5 text-left font-mono text-sm text-danger hover:bg-surface-2"
                      >
                        sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">
                log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                get started
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
