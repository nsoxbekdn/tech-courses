import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";
import { getCourses } from "@/lib/catalog";
import type { CourseLevel } from "@/lib/types";
import { AsciiDivider } from "@/components/ascii/ascii-block";

export const metadata: Metadata = {
  title: "All courses",
  description:
    "Browse free NISM certification and coding courses from the Tech Courses channel.",
};

const validLevels: CourseLevel[] = ["Certification", "Coding"];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const initialLevel =
    level && validLevels.includes(level as CourseLevel)
      ? (level as CourseLevel)
      : "All";

  const courses = await getCourses();

  return (
    <>
      <section className="border-b border-line bg-surface/70">
        <div className="container-page py-12">
          <AsciiDivider index="ls" label="catalog" />
          <p className="mt-5 font-mono text-xs text-muted">
            <span className="term-prompt text-accent" />tc ls --tracks all
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
            Explore courses
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Every NISM certification and coding course from the Tech Courses channel. Filter by
            track, search by topic, and start watching free.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <CourseCatalog initialLevel={initialLevel} courses={courses} />
      </section>
    </>
  );
}
