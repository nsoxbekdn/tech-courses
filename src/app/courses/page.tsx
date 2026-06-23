import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";
import { getCourses } from "@/lib/catalog";
import type { CourseLevel } from "@/lib/types";

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
      <section className="border-b border-line bg-surface">
        <div className="container-page py-12">
          <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
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
