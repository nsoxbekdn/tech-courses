import Link from "next/link";
import type { Course } from "@/lib/types";
import { courseStats, getInstructor } from "@/lib/course-utils";
import { formatDuration } from "@/lib/format";
import { ViewCount, Thumbnail } from "./ui";
import { BookIcon, ClockIcon, PlayCircleIcon } from "./icons";

export function CourseCard({ course }: { course: Course }) {
  const stats = courseStats(course);
  const instructor = getInstructor(course.instructorId);
  const isFree = course.priceInr === 0;
  const code = course.code ?? course.level.slice(0, 3);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card group flex flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
    >
      <Thumbnail watermark={code} src={course.thumbnail || undefined} className="aspect-[16/9]">
        {/* Scrim guarantees title legibility over the grid + watermark */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-panel via-ink-panel/55 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="tag border-white/15 bg-white/10 text-on-panel">
            {course.level}
          </span>
          {course.code && (
            <span className="tag border-white/15 bg-white/10 text-on-panel-soft">
              {course.code}
            </span>
          )}
        </div>
        <div className="absolute inset-x-4 bottom-3">
          <p className="line-clamp-2 font-semibold leading-snug text-on-panel">
            {course.title}
          </p>
        </div>
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-on-panel opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <PlayCircleIcon width={18} height={18} />
        </span>
      </Thumbnail>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm text-muted">{course.subtitle}</p>

        {instructor && <p className="text-xs text-ink-soft">{instructor.name}</p>}

        <ViewCount views={course.views} />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <BookIcon width={14} height={14} />
            <span className="tnum">{stats.lessonCount}</span> lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon width={14} height={14} /> {formatDuration(stats.totalMinutes)}
          </span>
        </div>

        <div className="mt-auto flex items-baseline gap-2 border-t border-line pt-3">
          <span className="text-lg font-bold text-accent">{isFree ? "Free" : `₹${course.priceInr}`}</span>
          <span className="text-xs text-muted">· full course</span>
        </div>
      </div>
    </Link>
  );
}
