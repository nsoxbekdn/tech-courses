"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Course, Lesson } from "@/lib/types";
import { useStore } from "@/lib/store";
import { courseStats } from "@/lib/course-utils";
import { formatCompact } from "@/lib/format";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  LockIcon,
  PlayCircleIcon,
} from "./icons";

function SidebarToggleIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <line
        x1={open ? "11.5" : "11.5"}
        y1="2.5"
        x2="11.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function LessonPlayer({ course }: { course: Course }) {
  const { isEnrolled, isLessonComplete, toggleLesson, completedCount, enroll } = useStore();
  const searchParams = useSearchParams();
  const lessonParam = searchParams.get("lesson");

  const flat = useMemo(
    () =>
      course.modules.flatMap((m) =>
        m.lessons.map((l) => ({ lesson: l, moduleTitle: m.title })),
      ),
    [course],
  );
  const stats = courseStats(course);
  const enrolled = isEnrolled(course.id);

  // Default to the first unfinished lesson (resume), unless ?lesson= is given.
  const firstIncomplete = enrolled
    ? flat.find((f) => !isLessonComplete(course.id, f.lesson.id))?.lesson.id
    : undefined;
  const initialId =
    lessonParam && flat.some((f) => f.lesson.id === lessonParam)
      ? lessonParam
      : (firstIncomplete ?? flat[0]?.lesson.id);
  const [currentId, setCurrentId] = useState<string>(initialId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentIndex = flat.findIndex((f) => f.lesson.id === currentId);
  const current = flat[currentIndex];
  const completed = enrolled ? completedCount(course.id) : 0;
  const progress = stats.lessonCount ? (completed / stats.lessonCount) * 100 : 0;

  const activeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  const canWatch = (l: Lesson) => enrolled || l.isPreview;
  const locked = current && !canWatch(current.lesson);
  const isDone = current ? isLessonComplete(course.id, current.lesson.id) : false;

  function goTo(index: number) {
    const target = flat[index];
    if (target && canWatch(target.lesson)) setCurrentId(target.lesson.id);
    else if (target) setCurrentId(target.lesson.id); // show locked state
  }

  function completeAndNext() {
    if (!current) return;
    if (enrolled && !isDone) toggleLesson(course.id, current.lesson.id);
    if (currentIndex < flat.length - 1) goTo(currentIndex + 1);
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-panel text-on-panel">
      {/* Top bar */}
      <header className="flex items-center gap-4 border-b border-white/15 px-4 py-3 lg:px-6">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-panel transition-colors hover:text-accent"
        >
          <span aria-hidden>←</span>
          <span className="hidden max-w-[40ch] truncate font-medium sm:inline">{course.title}</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          {enrolled && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="tnum text-xs text-on-panel-soft">
                {completed}/{stats.lessonCount} · {Math.round(progress)}%
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-white/15 px-3 py-1.5 text-xs font-medium text-on-panel-soft transition-colors hover:bg-white/5 hover:text-on-panel"
            aria-pressed={sidebarOpen}
          >
            <SidebarToggleIcon open={sidebarOpen} />
            <span className="hidden sm:inline">{sidebarOpen ? "Hide" : "Contents"}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Video */}
          <div className="bg-black">
            <div className="mx-auto aspect-video w-full max-w-6xl">
              {locked ? (
                <div className="thumb relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  {current?.lesson.thumbnail && (
                    <>
                      <Image
                        src={current.lesson.thumbnail}
                        alt=""
                        fill
                        className="object-cover opacity-25"
                        sizes="100vw"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-ink-panel/60" />
                    </>
                  )}
                  <LockIcon width={34} height={34} className="relative text-on-panel-soft" />
                  <p className="relative text-lg font-semibold text-on-panel">This lesson is locked</p>
                  <p className="relative max-w-sm text-sm text-on-panel-soft">
                    Enrol free to unlock all <span className="tnum">{stats.lessonCount}</span>{" "}
                    lessons in this course.
                  </p>
                  <button onClick={() => enroll(course.id)} className="btn btn-primary relative mt-2">
                    Enrol free to unlock
                  </button>
                </div>
              ) : (
                <iframe
                  key={current?.lesson.id}
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${current?.lesson.youtubeId}?rel=0&modestbranding=1`}
                  title={current?.lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>

          {/* Lesson detail */}
          {current && (
            <div className="mx-auto w-full max-w-4xl border-t border-white/10 px-4 py-7 lg:px-8">
              <p className="font-mono text-xs uppercase tracking-wider text-on-panel-soft">
                Lesson <span className="tnum">{currentIndex + 1}</span> of{" "}
                <span className="tnum">{flat.length}</span>
              </p>

              <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                <h1 className="text-xl font-bold leading-snug text-on-panel lg:text-2xl">
                  {current.lesson.title}
                </h1>
                {enrolled && !locked && (
                  <button
                    onClick={() => toggleLesson(course.id, current.lesson.id)}
                    className={`btn shrink-0 ${isDone ? "btn-on-panel" : "btn-outline border-white/20 text-on-panel hover:bg-white/5"}`}
                  >
                    {isDone ? (
                      <>
                        <CheckIcon width={16} height={16} /> Completed
                      </>
                    ) : (
                      "Mark complete"
                    )}
                  </button>
                )}
              </div>

              {/* Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-panel-soft">
                <span className="tnum inline-flex items-center gap-1.5">
                  <ClockIcon width={13} height={13} /> {current.lesson.durationMinutes}m
                </span>
                <span className="tnum inline-flex items-center gap-1.5">
                  <PlayCircleIcon width={13} height={13} /> {formatCompact(current.lesson.views)} views
                </span>
                {isDone && (
                  <span className="inline-flex items-center gap-1.5 text-accent">
                    <CheckCircleIcon width={14} height={14} filled /> Done
                  </span>
                )}
              </div>

              {/* Prev / next */}
              <div className="mt-7 grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-2">
                {currentIndex > 0 ? (
                  <button
                    onClick={() => goTo(currentIndex - 1)}
                    className="group rounded-[var(--radius)] border border-white/20 bg-white/5 p-3 text-left transition-colors hover:border-white/40 hover:bg-white/10"
                  >
                    <span className="text-xs font-medium text-on-panel-soft">← Previous</span>
                    <span className="mt-1 block truncate text-sm font-semibold text-on-panel">
                      {flat[currentIndex - 1].lesson.title}
                    </span>
                  </button>
                ) : (
                  <span />
                )}
                {currentIndex < flat.length - 1 ? (
                  <button
                    onClick={() => goTo(currentIndex + 1)}
                    className="group rounded-[var(--radius)] border border-white/20 bg-white/5 p-3 text-right transition-colors hover:border-white/40 hover:bg-white/10"
                  >
                    <span className="text-xs font-medium text-on-panel-soft">Up next →</span>
                    <span className="mt-1 block truncate text-sm font-semibold text-on-panel">
                      {flat[currentIndex + 1].lesson.title}
                    </span>
                  </button>
                ) : (
                  <span />
                )}
              </div>

              {enrolled && !locked && currentIndex < flat.length - 1 && (
                <button onClick={completeAndNext} className="btn btn-primary mt-5 w-full sm:w-auto">
                  {isDone ? "Next lesson" : "Complete & continue"}{" "}
                  <ArrowRightIcon width={16} height={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-full shrink-0 border-t border-white/10 bg-black/20 lg:max-h-[calc(100vh-57px)] lg:w-[360px] lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="text-sm font-semibold text-on-panel">Course content</p>
                <p className="tnum mt-0.5 text-xs text-on-panel-soft">
                  {stats.lessonCount} lessons
                  {enrolled && <> · {Math.round(progress)}% complete</>}
                </p>
              </div>
              {enrolled && (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-xs font-semibold text-accent ring-1 ring-white/10">
                  <span className="tnum">{Math.round(progress)}%</span>
                </div>
              )}
            </div>

            <div className="overflow-y-auto lg:max-h-[calc(100vh-57px-73px)]">
              {course.modules.map((m, mi) => (
                <div key={m.id}>
                  <p className="sticky top-0 z-10 bg-ink-panel/95 px-4 py-2 font-mono text-xs uppercase tracking-wider text-on-panel-soft backdrop-blur">
                    <span className="tnum">{String(mi + 1).padStart(2, "0")}</span> · {m.title}
                  </p>
                  <ul>
                    {m.lessons.map((l, li) => {
                      const active = l.id === currentId;
                      const watchable = canWatch(l);
                      const done = enrolled && isLessonComplete(course.id, l.id);
                      return (
                        <li key={l.id} ref={active ? activeRef : null}>
                          <div
                            className={`group flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors ${
                              active
                                ? "border-accent bg-white/10 text-on-panel"
                                : "border-transparent text-on-panel-soft hover:bg-white/5"
                            }`}
                          >
                            {/* Complete toggle / status */}
                            {enrolled && watchable ? (
                              <button
                                onClick={() => toggleLesson(course.id, l.id)}
                                aria-label={done ? "Mark incomplete" : "Mark complete"}
                                className="shrink-0"
                              >
                                {done ? (
                                  <CheckCircleIcon width={18} height={18} filled className="text-accent" />
                                ) : (
                                  <span className="block h-[18px] w-[18px] rounded-full border border-white/30 transition-colors group-hover:border-white/60" />
                                )}
                              </button>
                            ) : watchable ? (
                              <PlayCircleIcon width={18} height={18} className="shrink-0 text-on-panel-soft" />
                            ) : (
                              <LockIcon width={15} height={15} className="shrink-0 text-on-panel-soft" />
                            )}

                            {/* Title — navigates */}
                            <button
                              onClick={() => setCurrentId(l.id)}
                              className="flex min-w-0 flex-1 items-center gap-2 text-left"
                            >
                              <span className="tnum shrink-0 text-xs text-on-panel-soft">{li + 1}.</span>
                              <span className={`flex-1 truncate ${active ? "font-medium" : ""}`}>
                                {l.title}
                              </span>
                            </button>

                            <span className="tnum shrink-0 text-xs text-on-panel-soft">
                              {l.durationMinutes}m
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
