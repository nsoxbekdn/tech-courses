import Link from "next/link";
import { getCourses, getChannelStats, getInstructorWithStats } from "@/lib/catalog";
import { getCurrentUser, getUserEnrollments } from "@/lib/auth";
import { LEVELS } from "@/lib/course-utils";
import { formatCompact } from "@/lib/format";
import { CourseCard } from "@/components/course-card";
import { Reveal } from "@/components/reveal";
import { Avatar } from "@/components/ui";
import { HeroTerminal } from "@/components/hero/hero-terminal";
import { AsciiDivider, AsciiCorners } from "@/components/ascii/ascii-block";
import {
  ArrowRightIcon,
  BookIcon,
  CertificateIcon,
  PlayCircleIcon,
  ShieldIcon,
} from "@/components/icons";

const features = [
  {
    icon: BookIcon,
    title: "Structured, chapter by chapter",
    body: "Every NISM series and coding topic is laid out in order, so you always know exactly what to study next.",
  },
  {
    icon: PlayCircleIcon,
    title: "Learn at your own pace",
    body: "Stream lessons, pause, rewind and revise. Your place is saved across devices, lesson by lesson.",
  },
  {
    icon: CertificateIcon,
    title: "Completely free",
    body: "The full catalog is free — no paywalls. Every course mirrors the Tech Courses YouTube channel.",
  },
  {
    icon: ShieldIcon,
    title: "Exam- and interview-focused",
    body: "From NISM exam prep to LeetCode patterns, the content is built to pass certifications and crack interviews.",
  },
];

export default async function HomePage() {
  const [courses, channelStats, instructor, sessionUser] = await Promise.all([
    getCourses(),
    getChannelStats(),
    getInstructorWithStats(),
    getCurrentUser(),
  ]);

  const userEnrollments = sessionUser ? await getUserEnrollments(sessionUser.id) : [];
  const popular = [...courses].sort((a, b) => b.views - a.views).slice(0, 6);

  // Hero pane: user's most-recently-enrolled course with progress, falling back
  // to the most-viewed published course.
  const byViews = [...courses].sort((a, b) => b.views - a.views);
  let heroCourse = byViews[0];
  let heroProgress = 0;
  let heroHref = heroCourse ? `/courses/${heroCourse.slug}` : "/courses";

  if (userEnrollments.length > 0) {
    const latest = [...userEnrollments].sort(
      (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
    )[0];
    const found = courses.find((c) => c.id === latest.courseId);
    if (found) {
      heroCourse = found;
      const total = found.modules.flatMap((m) => m.lessons).length;
      heroProgress = total
        ? Math.round((latest.completedLessonIds.length / total) * 100)
        : 0;
      heroHref = heroProgress > 0 ? `/learn/${found.slug}` : `/courses/${found.slug}`;
    }
  }

  const stats = [
    { value: `${formatCompact(channelStats.subscribers)}+`, label: "subscribers" },
    { value: String(channelStats.courseCount), label: "courses" },
    { value: `${formatCompact(channelStats.lessonCount)}+`, label: "lessons" },
    { value: `${formatCompact(channelStats.totalViews)}+`, label: "total views" },
  ];

  return (
    <>
      {/* Hero — full-viewport terminal session */}
      <section className="relative">
        <div className="container-page flex min-h-[calc(100svh-4rem)] flex-col justify-center py-14 md:py-16">
          {heroCourse ? (
            <HeroTerminal
              title={heroCourse.title}
              level={heroCourse.level}
              code={heroCourse.code ?? heroCourse.level.slice(0, 3)}
              views={heroCourse.views}
              href={heroHref}
              progress={heroProgress}
              isAuthed={!!sessionUser}
              subscribers={channelStats.subscribers}
              courseCount={channelStats.courseCount}
              lessonCount={channelStats.lessonCount}
            />
          ) : (
            <div>
              <h1 className="text-[clamp(2.6rem,7vw,4.6rem)] font-bold leading-[0.98] text-ink">
                Compile your <span className="text-accent">career.</span>
              </h1>
              <Link href="/courses" className="btn btn-primary mt-8">
                explore courses <ArrowRightIcon width={16} height={16} />
              </Link>
            </div>
          )}

          {/* Stat strip — a terminal status bar */}
          <dl className="mt-12 grid grid-cols-2 divide-x divide-line border-y border-line md:mt-16 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-2 py-6 text-center first:pl-0">
                <dt className="tnum font-mono text-2xl font-bold text-ink md:text-3xl">
                  {s.value}
                </dt>
                <dd className="mono-label mt-1">
                  {"// "}
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tracks */}
      <section className="container-page py-16 md:py-20">
        <AsciiDivider index="01" label="choose your track" />
        <h2 className="mt-6 text-2xl font-bold text-ink md:text-3xl">
          Two tracks, one channel.
        </h2>
        <p className="mt-2 max-w-md text-muted">
          Pick a path and follow it chapter by chapter — or run both in parallel.
        </p>
        <Reveal stagger className="mt-8 grid gap-5 md:grid-cols-2">
          {LEVELS.map((lvl, i) => {
            const count = courses.filter((c) => c.level === lvl.key).length;
            return (
              <Link
                key={lvl.key}
                href={`/courses?level=${lvl.key}`}
                className="term group relative transition-colors hover:border-line-strong"
              >
                <AsciiCorners />
                <div className="term-bar">
                  <span className="term-dots" aria-hidden>
                    <span className="term-dot" />
                    <span className="term-dot" />
                    <span className="term-dot" />
                  </span>
                  <span className="term-title">tracks/{lvl.key.toLowerCase()}</span>
                  <span className="ml-auto mono-label">
                    <span className="tnum">{String(count).padStart(2, "0")}</span> courses
                  </span>
                </div>
                <div className="p-6">
                  <span className="section-marker">
                    <b>{String(i + 1).padStart(2, "0")}</b>
                    {" // "}
                    {lvl.key.toLowerCase()}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-ink">{lvl.label}</h3>
                  <p className="mt-2 text-sm text-muted">{lvl.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-accent">
                    open
                    <ArrowRightIcon
                      width={15}
                      height={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </section>

      {/* Popular courses */}
      <section className="container-page py-4">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <AsciiDivider index="02" label="most-watched" />
            <h2 className="mt-6 text-2xl font-bold text-ink md:text-3xl">
              Courses students actually finish.
            </h2>
          </div>
          <Link
            href="/courses"
            className="link-draw mb-1 inline-flex shrink-0 items-center gap-1.5 font-mono text-sm font-semibold text-accent"
          >
            view all <ArrowRightIcon width={15} height={15} />
          </Link>
        </div>
        <Reveal stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </Reveal>
      </section>

      {/* Features */}
      <section className="container-page py-16 md:py-24">
        <AsciiDivider index="03" label="why tech courses" />
        <h2 className="mt-6 max-w-2xl text-2xl font-bold text-ink md:text-3xl">
          Built to get you certified — and job-ready.
        </h2>
        <Reveal
          stagger
          className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2"
        >
          {features.map((f, i) => (
            <div key={f.title} className="flex gap-4 bg-surface p-7">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius)] bg-accent-tint text-accent">
                <f.icon width={19} height={19} />
              </span>
              <div>
                <p className="mono-label">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span> /{" "}
                  feature
                </p>
                <h3 className="mt-1 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Instructor */}
      <section className="container-page py-4">
        <AsciiDivider index="04" label="maintainer" />
        <h2 className="mt-6 text-2xl font-bold text-ink md:text-3xl">
          Behind the channel.
        </h2>
        <Reveal stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[instructor].map((ins) => (
            <div key={ins.id} className="term relative">
              <AsciiCorners />
              <div className="term-bar">
                <span className="term-title">whoami</span>
              </div>
              <div className="p-6">
                <Avatar initials={ins.initials} size={52} />
                <h3 className="mt-4 font-semibold text-ink">{ins.name}</h3>
                <p className="mono-label mt-0.5">{ins.title}</p>
                <div className="mt-4 border-t border-line pt-3">
                  <p className="tnum mono-label">
                    {formatCompact(ins.students)} subscribers · {ins.coursesCount} courses
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{ins.bio}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <Reveal className="term relative overflow-hidden">
          <AsciiCorners tone="muted" />
          <div className="term-bar">
            <span className="term-dots" aria-hidden>
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="term-dot" />
            </span>
            <span className="term-title">tech-courses — start</span>
          </div>
          <div className="px-6 py-14 text-center md:py-16">
            <p className="mono-label">
              <span className="term-prompt text-accent" />tc signup --free
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-bold text-ink md:text-4xl">
              Start learning today — free.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Create a free account to track your progress across courses, or jump
              straight into any lesson.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/signup" className="btn btn-primary">
                create free account
              </Link>
              <Link href="/courses" className="btn btn-outline">
                browse courses
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
