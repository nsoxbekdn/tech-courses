import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCourseBySlug } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { LessonPlayer } from "@/components/lesson-player";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/learn/${slug}`);

  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-ink-panel text-on-panel-soft">
          Loading lesson…
        </div>
      }
    >
      <LessonPlayer course={course} />
    </Suspense>
  );
}
