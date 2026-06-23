import Link from "next/link";
import { getCourses, getChannelStats, getInstructorWithStats } from "@/lib/catalog";
import { LEVELS } from "@/lib/course-utils";
import { formatCompact } from "@/lib/format";
import { CourseCard } from "@/components/course-card";
import { Reveal } from "@/components/reveal";
import { Avatar } from "@/components/ui";
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
  const [courses, channelStats, instructor] = await Promise.all([
    getCourses(),
    getChannelStats(),
    getInstructorWithStats(),
  ]);

  const popular = [...courses].sort((a, b) => b.views - a.views).slice(0, 6);

  const stats = [
    { value: `${formatCompact(channelStats.subscribers)}+`, label: "Subscribers" },
    { value: String(channelStats.courseCount), label: "Courses" },
    { value: `${formatCompact(channelStats.lessonCount)}+`, label: "Lessons" },
    { value: `${formatCompact(channelStats.totalViews)}+`, label: "Total views" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div>
            <p className="eyebrow reveal">Free · from the Tech Courses channel</p>
            <h1
              className="reveal mt-4 text-[clamp(2.4rem,6vw,3.6rem)] font-extrabold leading-[1.05] text-ink"
              style={{ animationDelay: "60ms" }}
            >
              Certifications and coding,
              <br />
              taught in full.
            </h1>
            <p
              className="reveal mt-5 max-w-md text-lg leading-relaxed text-muted"
              style={{ animationDelay: "120ms" }}
            >
              Structured, chapter-by-chapter video courses for India&apos;s NISM securities
              certifications and competitive programming — free, self-paced, and built to finish.
            </p>
            <div
              className="reveal mt-8 flex flex-wrap gap-3"
              style={{ animationDelay: "180ms" }}
            >
              <Link href="/courses" className="btn btn-primary">
                Explore courses <ArrowRightIcon width={17} height={17} />
              </Link>
              <Link href="/signup" className="btn btn-outline">
                Start free
              </Link>
            </div>
          </div>

          {/* Product preview */}
          <div
            className="reveal card overflow-hidden"
            style={{ animationDelay: "240ms" }}
          >
            <div className="thumb relative flex aspect-[16/10] items-center justify-center">
              <span className="pointer-events-none absolute -right-3 -top-4 select-none font-mono text-[6rem] font-bold leading-none text-on-panel/10">
                NISM
              </span>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-on-panel ring-1 ring-white/15">
                <PlayCircleIcon width={30} height={30} />
              </span>
              <span className="absolute left-4 top-4 tag border-white/15 bg-white/10 text-on-panel">
                Now playing
              </span>
            </div>
            <div className="p-5">
              <p className="font-semibold text-ink">NISM VA · Mutual Fund Distributors</p>
              <p className="mt-0.5 text-sm text-muted">Tech Courses · Certification</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full w-2/3 rounded-full bg-accent" />
                </div>
                <span className="tnum text-xs text-muted">66%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="border-t border-line">
          <dl className="container-page grid grid-cols-2 divide-x divide-line md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="px-2 py-7 text-center first:pl-0">
                <dt className="tnum text-2xl font-bold text-ink md:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-xs text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tracks */}
      <section className="container-page py-16 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink md:text-3xl">Choose your track</h2>
            <p className="mt-2 text-muted">Two tracks, one channel.</p>
          </div>
        </div>
        <Reveal
          stagger
          className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line md:grid-cols-2"
        >
          {LEVELS.map((lvl, i) => {
            const count = courses.filter((c) => c.level === lvl.key).length;
            return (
              <Link
                key={lvl.key}
                href={`/courses?level=${lvl.key}`}
                className="group flex flex-col gap-3 bg-surface p-7 transition-colors hover:bg-surface-2"
              >
                <span className="font-mono text-sm text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-bold text-ink">{lvl.label}</h3>
                <p className="text-sm text-muted">{lvl.blurb}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  <span className="tnum">{count}</span> courses
                  <ArrowRightIcon
                    width={15}
                    height={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </Reveal>
      </section>

      {/* Popular courses */}
      <section className="container-page py-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Most-watched courses</h2>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            View all <ArrowRightIcon width={15} height={15} />
          </Link>
        </div>
        <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </Reveal>
      </section>

      {/* Features */}
      <section className="container-page py-16 md:py-24">
        <h2 className="max-w-2xl text-2xl font-bold text-ink md:text-3xl">
          Built to get you certified — and job-ready.
        </h2>
        <Reveal
          stagger
          className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2"
        >
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 bg-surface p-7">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius)] bg-accent-tint text-accent">
                <f.icon width={19} height={19} />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Instructor */}
      <section className="container-page py-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Your instructor</h2>
          <p className="mt-2 text-muted">Behind the Tech Courses channel.</p>
        </div>
        <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[instructor].map((ins) => (
            <div key={ins.id} className="card p-6">
              <Avatar initials={ins.initials} size={52} />
              <h3 className="mt-4 font-semibold text-ink">{ins.name}</h3>
              <p className="mt-0.5 text-xs text-muted">{ins.title}</p>
              <div className="mt-4 border-t border-line pt-3">
                <p className="tnum text-xs text-muted">
                  {formatCompact(ins.students)} subscribers · {ins.coursesCount} courses
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{ins.bio}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <Reveal className="thumb relative overflow-hidden rounded-[var(--radius-lg)] px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-on-panel md:text-4xl">
            Start learning today — free.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-on-panel-soft">
            Create a free account to track your progress across courses, or jump straight into
            any lesson.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup" className="btn btn-primary">
              Create free account
            </Link>
            <Link href="/courses" className="btn btn-on-panel">
              Browse courses
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
