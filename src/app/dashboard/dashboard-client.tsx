"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { courseStats } from "@/lib/course-utils";
import type { Course } from "@/lib/types";
import { CourseCard } from "@/components/course-card";
import { Thumbnail, LevelBadge } from "@/components/ui";
import { ArrowRightIcon, PlayCircleIcon } from "@/components/icons";

export function DashboardClient({ courses }: { courses: Course[] }) {
  const { user, enrollments, completedCount } = useStore();
  const getCourseById = (id: string) => courses.find((c) => c.id === id);

  // The server guard guarantees a user; this satisfies types during transitions.
  if (!user) return null;

  const enrolledCourses = enrollments
    .map((e) => ({ course: getCourseById(e.courseId), enrollment: e }))
    .filter((x): x is { course: NonNullable<typeof x.course>; enrollment: typeof x.enrollment } =>
      Boolean(x.course),
    );

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const recommended = courses.filter((c) => !enrolledIds.has(c.id)).slice(0, 3);

  const totalLessons = enrolledCourses.reduce(
    (s, x) => s + courseStats(x.course).lessonCount,
    0,
  );
  const totalDone = enrolledCourses.reduce(
    (s, x) => s + completedCount(x.course.id),
    0,
  );

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page py-10">
          <h1 className="text-3xl font-extrabold text-ink">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted">
            {enrolledCourses.length === 0
              ? "You haven't enrolled in any courses yet."
              : `You're enrolled in ${enrolledCourses.length} ${
                  enrolledCourses.length === 1 ? "course" : "courses"
                }. ${totalDone}/${totalLessons} lessons complete.`}
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        {enrolledCourses.length === 0 ? (
          <div className="card p-12 text-center">
            <h2 className="text-xl font-bold text-ink">Start learning today</h2>
            <p className="mt-2 text-muted">
              Browse the catalog and enrol in your first course.
            </p>
            <Link href="/courses" className="btn btn-primary mt-5">
              Explore courses <ArrowRightIcon width={16} height={16} />
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mb-5 text-2xl font-bold text-ink">Continue learning</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {enrolledCourses.map(({ course, enrollment }) => {
                const stats = courseStats(course);
                const done = completedCount(course.id);
                const pct = stats.lessonCount
                  ? Math.round((done / stats.lessonCount) * 100)
                  : 0;
                const code = course.code ?? course.level.slice(0, 3);
                const nextLesson = course.modules
                  .flatMap((m) => m.lessons)
                  .find((l) => !enrollment.completedLessonIds.includes(l.id));
                const resumeHref = nextLesson
                  ? `/learn/${course.slug}?lesson=${nextLesson.id}`
                  : `/learn/${course.slug}`;
                return (
                  <div key={course.id} className="card flex gap-4 overflow-hidden p-4">
                    <Thumbnail
                      watermark={code}
                      className="hidden h-28 w-44 shrink-0 rounded-[var(--radius)] sm:block"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircleIcon
                          width={30}
                          height={30}
                          className="text-on-panel/80"
                        />
                      </div>
                    </Thumbnail>
                    <div className="flex flex-1 flex-col">
                      <LevelBadge level={course.level} />
                      <h3 className="mt-2 font-bold text-ink">{course.title}</h3>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-muted">
                        <span className="tnum">
                          {done}/{stats.lessonCount}
                        </span>{" "}
                        lessons · <span className="tnum">{pct}%</span> complete
                      </p>
                      <Link href={resumeHref} className="btn btn-primary mt-auto self-start">
                        {pct === 0 ? "Start course" : "Resume"}{" "}
                        <ArrowRightIcon width={16} height={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {recommended.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-2xl font-bold text-ink">Recommended for you</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
