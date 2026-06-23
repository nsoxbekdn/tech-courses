import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getInstructorWithStats, getEnrolledCount } from "@/lib/catalog";
import { courseStats } from "@/lib/course-utils";
import { formatCompact } from "@/lib/format";
import { Avatar } from "@/components/ui";
import { Curriculum } from "@/components/curriculum";
import { EnrollPanel } from "@/components/enroll-panel";
import {
  BookIcon,
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  PlayCircleIcon,
  UsersIcon,
  CertificateIcon,
} from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course not found" };
  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const instructor = await getInstructorWithStats();
  const stats = courseStats(course);
  const enrolledCount = await getEnrolledCount(course.id);

  return (
    <>
      {/* Hero */}
      <section className="thumb bg-ink-panel text-on-panel">
        {course.thumbnail && (
          <>
            <Image
              src={course.thumbnail}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-40"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-ink-panel/55" />
          </>
        )}
        <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <nav className="flex items-center gap-2 text-sm text-on-panel-soft">
              <Link href="/courses" className="transition-colors hover:text-on-panel">
                Courses
              </Link>
              <span>/</span>
              <Link
                href={`/courses?level=${course.level}`}
                className="transition-colors hover:text-on-panel"
              >
                {course.level}
              </Link>
            </nav>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag border-white/15 bg-white/10 text-on-panel">
                {course.level}
              </span>
              {course.code && (
                <span className="tag border-white/15 bg-white/10 text-on-panel-soft">
                  {course.code}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-on-panel-soft">{course.subtitle}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="tnum inline-flex items-center gap-1 text-on-panel-soft">
                <PlayCircleIcon width={15} height={15} />
                {formatCompact(course.views)} views
              </span>
              <span className="tnum inline-flex items-center gap-1 text-on-panel-soft">
                <ClockIcon width={15} height={15} />
                {stats.totalHours} hours total
              </span>
              <span className="inline-flex items-center gap-1 text-on-panel-soft">
                <GlobeIcon width={15} height={15} />
                {course.language}
              </span>
              {enrolledCount >= 10 && (
                <span className="tnum inline-flex items-center gap-1 text-on-panel-soft">
                  <UsersIcon width={15} height={15} />
                  {formatCompact(enrolledCount)} enrolled
                </span>
              )}
            </div>

            {instructor && (
              <div className="mt-5 flex items-center gap-3">
                <Avatar initials={instructor.initials} size={40} onPanel />
                <div className="text-sm">
                  <p className="text-on-panel-soft">Created by</p>
                  <p className="font-semibold">{instructor.name}</p>
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-on-panel-soft">
              Last updated {course.lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container-page grid gap-10 py-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          {/* What you'll learn */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-ink">What you&apos;ll learn</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {course.whatYouLearn.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-soft">
                  <CheckIcon width={18} height={18} className="shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-ink">About this course</h2>
            <p className="mt-3 max-w-[70ch] leading-relaxed text-ink-soft">
              {course.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
              <span className="tnum inline-flex items-center gap-1.5">
                <BookIcon width={16} height={16} /> {stats.lessonCount} lessons
              </span>
              <span className="tnum inline-flex items-center gap-1.5">
                <ClockIcon width={16} height={16} /> {stats.totalHours} hours on-demand
                video
              </span>
            </div>

            <h3 className="mt-6 font-bold text-ink">Requirements</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-ink-soft">
              {course.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Exam information */}
          {course.examInfo && (
            <div className="card border-accent/30 bg-accent-tint p-6">
              <div className="flex items-center gap-2">
                <CertificateIcon width={18} height={18} className="text-accent" />
                <h2 className="text-lg font-bold text-ink">Exam information</h2>
              </div>
              <p className="mt-3 max-w-[70ch] whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {course.examInfo}
              </p>
            </div>
          )}

          {/* Curriculum */}
          <Curriculum course={course} />

          {/* Mock test */}
          {course.mockTestUrl && (
            <div className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">Practice &amp; mock test</h2>
                <p className="mt-1 text-sm text-muted">
                  Test yourself with the practice set for this course.
                </p>
              </div>
              <a
                href={course.mockTestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary shrink-0"
              >
                Take the mock test
              </a>
            </div>
          )}

          {/* Instructor */}
          {instructor && (
            <div>
              <h2 className="text-2xl font-bold text-ink">Your instructor</h2>
              <div className="card mt-4 flex flex-col gap-4 p-6 sm:flex-row">
                <Avatar initials={instructor.initials} size={72} />
                <div>
                  <h3 className="text-lg font-bold text-ink">{instructor.name}</h3>
                  <p className="text-sm text-accent">{instructor.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="tnum">
                      {formatCompact(instructor.students)} subscribers
                    </span>
                    <span className="tnum">{instructor.coursesCount} courses</span>
                  </div>
                  <p className="mt-3 max-w-[70ch] text-sm text-ink-soft">{instructor.bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-ink">FAQ</h2>
            <dl className="mt-4 space-y-3">
              {[
                {
                  q: "Is this course free?",
                  a: "Yes — every lesson is free to watch. Create a free account to track progress and resume where you left off.",
                },
                {
                  q: "Do I need an account?",
                  a: "You can browse freely. To enrol, track completion and pick up where you left off, sign in — it's free.",
                },
                {
                  q: "Where do the videos come from?",
                  a: "From the Tech Courses YouTube channel, organised here into a structured, trackable course.",
                },
                course.level === "Certification"
                  ? {
                      q: "Will this prepare me for the exam?",
                      a: "It covers the syllabus chapter by chapter. Pair it with the official workbook and the mock test for best results.",
                    }
                  : {
                      q: "Do I need prior experience?",
                      a: "No — the fundamentals start from scratch, then build up to interview-level problems.",
                    },
              ].map((f) => (
                <div key={f.q} className="card p-5">
                  <dt className="font-semibold text-ink">{f.q}</dt>
                  <dd className="mt-1.5 text-sm text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Sticky purchase panel */}
        <aside className="lg:-mt-28">
          <div className="lg:sticky lg:top-20">
            <EnrollPanel course={course} />
          </div>
        </aside>
      </section>
    </>
  );
}
