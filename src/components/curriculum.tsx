"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/lib/types";
import { useStore } from "@/lib/store";
import { courseStats } from "@/lib/course-utils";
import { formatDuration } from "@/lib/format";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  LockIcon,
  PlayCircleIcon,
} from "./icons";

export function Curriculum({ course }: { course: Course }) {
  const { isEnrolled, isLessonComplete } = useStore();
  const enrolled = isEnrolled(course.id);
  const stats = courseStats(course);
  // Open the first module by default.
  const [open, setOpen] = useState<Record<string, boolean>>({
    [course.modules[0]?.id]: true,
  });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">Course curriculum</h2>
        <span className="tnum text-sm text-muted">
          {stats.moduleCount} modules · {stats.lessonCount} lessons ·{" "}
          {formatDuration(stats.totalMinutes)}
        </span>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface">
        {course.modules.map((m, mi) => {
          const isOpen = open[m.id] ?? false;
          const mins = m.lessons.reduce((s, l) => s + l.durationMinutes, 0);
          return (
            <div key={m.id} className="border-b border-line last:border-b-0">
              <button
                onClick={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <span className="flex items-center gap-3">
                  <span className="tnum grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] bg-surface-2 font-mono text-xs font-semibold text-ink-soft">
                    {String(mi + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-ink">{m.title}</span>
                </span>
                <span className="flex items-center gap-3 text-xs text-muted">
                  <span className="tnum hidden sm:inline">
                    {m.lessons.length} lessons · {formatDuration(mins)}
                  </span>
                  <ChevronDownIcon
                    width={16}
                    height={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>

              {isOpen && (
                <ul className="divide-y divide-line border-t border-line bg-surface-2/40">
                  {m.lessons.map((l) => {
                    const unlocked = enrolled || l.isPreview;
                    const done = enrolled && isLessonComplete(course.id, l.id);
                    const row = (
                      <div className="flex items-center gap-3 px-5 py-3">
                        {done ? (
                          <CheckCircleIcon
                            width={18}
                            height={18}
                            filled
                            className="text-accent"
                          />
                        ) : unlocked ? (
                          <PlayCircleIcon
                            width={18}
                            height={18}
                            className="text-accent"
                          />
                        ) : (
                          <LockIcon width={16} height={16} className="text-muted" />
                        )}
                        <span
                          className={`flex-1 text-sm ${
                            unlocked ? "text-ink-soft" : "text-muted"
                          }`}
                        >
                          {l.title}
                        </span>
                        {l.isPreview && !enrolled && (
                          <span className="tag-accent tag">Preview</span>
                        )}
                        <span className="tnum inline-flex items-center gap-1 text-xs text-muted">
                          <ClockIcon width={13} height={13} />
                          {l.durationMinutes}m
                        </span>
                      </div>
                    );
                    return (
                      <li key={l.id}>
                        {unlocked ? (
                          <Link
                            href={`/learn/${course.slug}?lesson=${l.id}`}
                            className="block transition-colors hover:bg-surface"
                          >
                            {row}
                          </Link>
                        ) : (
                          row
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
