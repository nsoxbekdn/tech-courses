"use client";

import { useMemo, useState } from "react";
import type { Course, CourseLevel } from "@/lib/types";
import { CourseCard } from "./course-card";

type LevelFilter = "All" | CourseLevel;
type SortKey = "popular" | "az" | "lessons";

const levelTabs: LevelFilter[] = ["All", "Certification", "Coding"];
const sortOptions: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most viewed" },
  { key: "lessons", label: "Most lessons" },
  { key: "az", label: "A–Z" },
];

export function CourseCatalog({
  initialLevel = "All",
  courses,
}: {
  initialLevel?: LevelFilter;
  courses: Course[];
}) {
  const [level, setLevel] = useState<LevelFilter>(initialLevel);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = courses.filter((c) => {
      const matchLevel = level === "All" || c.level === level;
      const matchQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchLevel && matchQuery;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "az":
          return a.title.localeCompare(b.title);
        case "lessons":
          return b.modules.flatMap((m) => m.lessons).length - a.modules.flatMap((m) => m.lessons).length;
        default:
          return b.views - a.views;
      }
    });
    return list;
  }, [level, query, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {levelTabs.map((t) => (
            <button
              key={t}
              onClick={() => setLevel(t)}
              className={`rounded-[var(--radius)] px-4 py-2 text-sm font-semibold transition-colors ${
                level === t
                  ? "bg-ink-panel text-on-panel"
                  : "border border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink"
              }`}
            >
              {t === "All" ? "All tracks" : t}
            </button>
          ))}
        </div>

        <div className="flex flex-1 gap-3 lg:max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, e.g. NISM, LeetCode, C"
            className="field"
            aria-label="Search courses"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="field max-w-[12rem]"
            aria-label="Sort courses"
          >
            {sortOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted">
        Showing <strong className="tnum text-ink">{filtered.length}</strong>{" "}
        {filtered.length === 1 ? "course" : "courses"}
        {level !== "All" && ` in ${level}`}
      </p>

      {filtered.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-muted">
          No courses match your search. Try a different keyword or level.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
