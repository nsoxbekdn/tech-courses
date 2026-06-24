"use client";

import Link from "next/link";
import { formatCompact } from "@/lib/format";
import { TerminalWindow } from "@/components/terminal/terminal-window";
import { Typewriter, type TypeLine } from "@/components/terminal/typewriter";
import { ScrambleText } from "@/components/terminal/scramble-text";
import { ArrowRightIcon } from "@/components/icons";

export interface HeroData {
  title: string;
  level: string;
  code: string;
  views: number;
  href: string;
  progress: number;
  isAuthed: boolean;
  subscribers: number;
  courseCount: number;
  lessonCount: number;
}

function asciiBar(pct: number, width = 14): string {
  const filled = Math.round((Math.min(100, Math.max(0, pct)) / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export function HeroTerminal(props: HeroData) {
  const {
    title,
    level,
    code,
    views,
    href,
    progress,
    isAuthed,
    subscribers,
    courseCount,
    lessonCount,
  } = props;

  const boot: TypeLine[] = [
    { prompt: "❯", text: "tc init --tracks all", tone: "ink", pauseAfter: 180 },
    {
      prompt: "",
      text: `resolving catalog … ${courseCount} courses · ${formatCompact(lessonCount)} lessons`,
      tone: "muted",
      pauseAfter: 160,
    },
    {
      prompt: "",
      text: `channel @techcourses4u … ${formatCompact(subscribers)} subscribers ✓`,
      tone: "muted",
      pauseAfter: 260,
    },
    { prompt: "❯", text: "tc start --free", tone: "ink", pauseAfter: 140 },
    { prompt: "", text: "ready. no paywall. self-paced.", tone: "accent" },
  ];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      {/* Left: headline */}
      <div>
        <p className="eyebrow inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          status: online · 2 tracks · 100% free
        </p>

        <h1 className="mt-5 text-[clamp(2.6rem,7vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.04em] text-ink">
          <span className="block">Compile your</span>
          <ScrambleText
            as="span"
            text="career."
            trigger="mount"
            className="block text-accent caret"
          />
        </h1>

        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
          Structured, chapter-by-chapter video courses for India&apos;s NISM
          securities certifications and competitive programming — free,
          self-paced, and built to finish.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/courses" className="btn btn-primary">
            explore courses <ArrowRightIcon width={16} height={16} />
          </Link>
          <Link href="/signup" className="btn btn-outline">
            start free
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-muted">
          <span className="text-line-strong">$</span> two tracks —{" "}
          <Link href="/courses?level=Certification" className="link-draw text-ink-soft">
            nism certifications
          </Link>{" "}
          ·{" "}
          <Link href="/courses?level=Coding" className="link-draw text-ink-soft">
            coding &amp; dsa
          </Link>
        </p>
      </div>

      {/* Right: live terminal + real "now playing" course */}
      <TerminalWindow
        title="tech-courses@academy: ~/learn"
        chip="zsh"
        className="shadow-md"
        bodyClassName="p-4 sm:p-5"
      >
        <Typewriter lines={boot} className="text-[0.8rem] sm:text-[0.84rem]" />

        <Link
          href={href}
          className="group mt-5 block rounded-[var(--radius)] border border-line bg-surface-2/60 p-3.5 transition-colors hover:border-line-strong"
        >
          <div className="mono-label flex items-center justify-between">
            <span className="term-prompt text-accent">
              {progress > 0 ? "continue" : "now playing"}
            </span>
            <span className="tnum">{formatCompact(views)} views</span>
          </div>
          <p className="mt-1.5 line-clamp-1 font-mono text-sm font-medium text-ink">
            {title}
          </p>
          <p className="mono-label mt-0.5">
            {level} {code ? `· ${code}` : ""}
          </p>
          {isAuthed ? (
            <p className="mt-2 font-mono text-xs">
              <span className="text-accent">{asciiBar(progress)}</span>{" "}
              <span className="tnum text-muted">{progress}%</span>
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-muted">
              <span className="text-line-strong">❯</span> log in to sync progress
              <span className="text-accent">_</span>
            </p>
          )}
        </Link>
      </TerminalWindow>
    </div>
  );
}
