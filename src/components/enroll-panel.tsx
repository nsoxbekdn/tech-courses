"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/types";
import { useStore } from "@/lib/store";
import { courseStats } from "@/lib/course-utils";
import { formatInr, formatDuration, discountPct } from "@/lib/format";
import { Thumbnail } from "./ui";
import {
  ArrowRightIcon,
  BookIcon,
  CertificateIcon,
  ClockIcon,
  GlobeIcon,
  PlayCircleIcon,
} from "./icons";

export function EnrollPanel({ course }: { course: Course }) {
  const { user, isEnrolled, completedCount, isLessonComplete, enroll } = useStore();
  const router = useRouter();
  const enrolled = isEnrolled(course.id);
  const stats = courseStats(course);
  const nextLesson = enrolled
    ? course.modules.flatMap((m) => m.lessons).find((l) => !isLessonComplete(course.id, l.id))
    : undefined;
  const resumeHref = nextLesson
    ? `/learn/${course.slug}?lesson=${nextLesson.id}`
    : `/learn/${course.slug}`;
  const off = discountPct(course.priceInr, course.mrpInr);
  const isFree = course.priceInr === 0;
  const code = course.code ?? course.level.slice(0, 3);
  const previewLesson = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.isPreview);

  const includes = [
    { icon: PlayCircleIcon, label: `${stats.lessonCount} on-demand video lessons` },
    { icon: ClockIcon, label: `${formatDuration(stats.totalMinutes)} of content` },
    { icon: BookIcon, label: "Structured chapter-by-chapter" },
    { icon: GlobeIcon, label: `Taught in ${course.language}` },
    { icon: CertificateIcon, label: "Progress tracking & completion" },
  ];

  function handleEnrollFree() {
    if (!user) {
      router.push(`/login?next=/learn/${course.slug}`);
      return;
    }
    enroll(course.id);
    router.push(`/learn/${course.slug}`);
  }

  function handleBuy() {
    if (!user) {
      router.push(`/login?next=/checkout/${course.slug}`);
      return;
    }
    router.push(`/checkout/${course.slug}`);
  }

  return (
    <div className="card overflow-hidden">
      <Thumbnail watermark={code} className="aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          {previewLesson ? (
            <Link
              href={`/learn/${course.slug}?lesson=${previewLesson.id}`}
              className="flex flex-col items-center gap-2 text-on-panel"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition-transform hover:scale-105">
                <PlayCircleIcon width={34} height={34} />
              </span>
              <span className="text-sm font-semibold">Watch free preview</span>
            </Link>
          ) : (
            <PlayCircleIcon width={44} height={44} className="text-on-panel-soft" />
          )}
        </div>
      </Thumbnail>

      <div className="p-5">
        {enrolled ? (
          <div className="rounded-[var(--radius)] border border-line bg-accent-tint p-4 text-center">
            <p className="text-sm font-semibold text-accent">You&apos;re enrolled</p>
            <p className="tnum mt-1 text-xs text-ink-soft">
              {completedCount(course.id)}/{stats.lessonCount} lessons completed
            </p>
            <Link href={resumeHref} className="btn btn-primary mt-3 w-full">
              {completedCount(course.id) > 0 ? "Resume course" : "Start course"}{" "}
              <ArrowRightIcon width={16} height={16} />
            </Link>
          </div>
        ) : isFree ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-accent">Free</span>
              <span className="text-sm text-muted">· full course</span>
            </div>
            <p className="mt-1.5 text-xs text-muted">Lifetime access. No payment needed.</p>
            <button onClick={handleEnrollFree} className="btn btn-primary mt-4 w-full">
              {user ? "Enrol free" : "Sign in to enrol"} <ArrowRightIcon width={16} height={16} />
            </button>
            {previewLesson && (
              <Link
                href={`/learn/${course.slug}?lesson=${previewLesson.id}`}
                className="btn btn-outline mt-2 w-full"
              >
                Watch a free preview
              </Link>
            )}
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <span className="tnum text-3xl font-bold text-ink">
                {formatInr(course.priceInr)}
              </span>
              <span className="tnum text-muted line-through">
                {formatInr(course.mrpInr)}
              </span>
              {off > 0 && (
                <span className="ml-auto text-sm font-medium text-accent">{off}% off</span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted">Lifetime access, one-time payment.</p>
            <button onClick={handleBuy} className="btn btn-primary mt-4 w-full">
              Buy now
            </button>
            <button onClick={handleBuy} className="btn btn-outline mt-2 w-full">
              Enrol &amp; pay securely
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              30-day money-back guarantee · Secure payment via Razorpay
            </p>
          </>
        )}

        <hr className="rule my-5" />
        <h4 className="text-sm font-bold text-ink">This course includes</h4>
        <ul className="mt-3 space-y-2.5">
          {includes.map((inc) => (
            <li key={inc.label} className="flex items-center gap-3 text-sm text-ink-soft">
              <inc.icon width={16} height={16} className="shrink-0 text-accent" />
              {inc.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
