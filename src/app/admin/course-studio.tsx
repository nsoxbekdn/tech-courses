"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCompact } from "@/lib/format";
import type { AdminCourseRow } from "@/lib/catalog";
import {
  updateCourseAction,
  syncNowAction,
  addAdminAction,
  removeAdminAction,
  type CoursePatch,
} from "@/lib/admin-actions";

interface AdminEntry {
  email: string;
  removable: boolean;
}

const TRACKS = [
  { value: "CERTIFICATION", label: "Certification" },
  { value: "CODING", label: "Coding" },
  { value: "OTHER", label: "Other (hidden)" },
];

// Hoverable / focusable info tooltip.
function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label="More info"
        className="grid h-4 w-4 cursor-help place-items-center rounded-full border border-line-strong text-[10px] font-bold leading-none text-muted transition-colors hover:border-accent hover:text-accent"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-[var(--radius)] border border-line bg-ink-panel px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-on-panel opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function CourseStudio({
  courses,
  stats,
  admins,
  currentEmail,
}: {
  courses: AdminCourseRow[];
  stats: {
    subscribers: number;
    totalViews: number;
    courseCount: number;
    lessonCount: number;
    lastSynced: string | null;
  };
  admins: AdminEntry[];
  currentEmail: string;
}) {
  const router = useRouter();
  const [syncing, startSync] = useTransition();
  const [syncMsg, setSyncMsg] = useState<string>("");

  function doSync() {
    setSyncMsg("");
    startSync(async () => {
      const res = await syncNowAction();
      if (res.ok && res.result) {
        setSyncMsg(`Synced ${res.result.courses} courses, ${res.result.lessons} lessons.`);
        router.refresh();
      } else {
        setSyncMsg(res.error || "Sync failed.");
      }
    });
  }

  const statCards = [
    { label: "Subscribers", value: formatCompact(stats.subscribers) },
    { label: "Published courses", value: String(stats.courseCount) },
    { label: "Lessons live", value: formatCompact(stats.lessonCount) },
    { label: "Total views", value: formatCompact(stats.totalViews) },
  ];

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="container-page flex flex-wrap items-end justify-between gap-4 py-10">
          <div>
            <p className="eyebrow">Course Studio</p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink">Manage your courses</h1>
            <p className="mt-1 max-w-2xl text-muted">
              Your YouTube playlists appear here automatically. Hover the{" "}
              <span className="inline-grid h-4 w-4 place-items-center rounded-full border border-line-strong text-[10px] font-bold text-muted">
                i
              </span>{" "}
              icons to learn what each control does.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <InfoTip text="Pulls the latest playlists and videos from your YouTube channel into the site. Click this right after you add, remove, or reorder videos on YouTube. It also runs automatically every night." />
              <button onClick={doSync} disabled={syncing} className="btn btn-primary">
                {syncing ? "Syncing…" : "Sync now"}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              {syncMsg || (stats.lastSynced ? `Last synced ${stats.lastSynced}` : "Not synced yet")}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-surface p-5">
              <p className="eyebrow">{s.label}</p>
              <p className="tnum mt-2 text-2xl font-extrabold text-ink">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="card mt-10 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="font-bold text-ink">All playlists ({courses.length})</h2>
            <p className="text-xs text-muted">Changes go live instantly.</p>
          </div>

          {/* Column legend — explains each control once */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-surface-2 px-6 py-3 text-xs font-medium text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              Publish
              <InfoTip text="Turn this ON to show the course on the live website. OFF keeps it hidden (a draft). Shorts and giveaway playlists are off by default." />
            </span>
            <span className="inline-flex items-center gap-1.5">
              Track
              <InfoTip text="Which section the course belongs to: Certification (NISM exams) or Coding. 'Other (hidden)' won't show even if published." />
            </span>
            <span className="inline-flex items-center gap-1.5">
              Order
              <InfoTip text="Sort position. Lower numbers appear first on the site. Use it to put your most important courses at the top." />
            </span>
            <span className="inline-flex items-center gap-1.5">
              Edit copy
              <InfoTip text="Optional: rename the course, write a custom description, add exam details, or attach a mock-test link — all shown on the course page." />
            </span>
          </div>

          <div className="divide-y divide-line">
            {courses.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </div>
        </div>

        {/* Team access */}
        <TeamAccess admins={admins} currentEmail={currentEmail} />
      </section>
    </>
  );
}

function TeamAccess({ admins, currentEmail }: { admins: AdminEntry[]; currentEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, startPending] = useTransition();

  function add() {
    setMsg("");
    startPending(async () => {
      const res = await addAdminAction(email);
      if (res.ok) {
        setEmail("");
        router.refresh();
      } else {
        setMsg(res.error || "Could not add admin.");
      }
    });
  }

  function remove(target: string) {
    startPending(async () => {
      await removeAdminAction(target);
      router.refresh();
    });
  }

  return (
    <div className="card mt-10 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-6 py-4">
        <h2 className="font-bold text-ink">Team access</h2>
        <InfoTip text="People listed here can open Course Studio and manage courses. Add a teammate by their email — they get access the moment they sign in with it. 'Owner' admins are set in configuration and can't be removed here." />
      </div>

      <ul className="divide-y divide-line">
        {admins.map((a) => (
          <li key={a.email} className="flex items-center justify-between gap-3 px-6 py-3">
            <span className="min-w-0 truncate text-sm text-ink">
              {a.email}
              {a.email === currentEmail && <span className="ml-2 text-xs text-muted">(you)</span>}
            </span>
            {a.removable ? (
              <button
                onClick={() => remove(a.email)}
                disabled={pending}
                className="text-xs font-medium text-danger hover:underline"
              >
                Remove
              </button>
            ) : (
              <span className="tag">Owner</span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-3 border-t border-line p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-ink-soft">Add an admin by email</label>
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
        </div>
        <button onClick={add} disabled={pending || !email} className="btn btn-primary">
          {pending ? "Saving…" : "Add admin"}
        </button>
      </div>
      {msg && <p className="px-4 pb-4 text-xs text-danger">{msg}</p>}
    </div>
  );
}

function CourseRow({ course }: { course: AdminCourseRow }) {
  const router = useRouter();
  const [, startSave] = useTransition();
  const [published, setPublished] = useState(course.published);
  const [track, setTrack] = useState(course.track);
  const [order, setOrder] = useState(String(course.order));
  const [expanded, setExpanded] = useState(false);
  const [titleOverride, setTitleOverride] = useState(course.titleOverride ?? "");
  const [descOverride, setDescOverride] = useState(course.descOverride ?? "");
  const [examInfo, setExamInfo] = useState(course.examInfo ?? "");
  const [mockTestUrl, setMockTestUrl] = useState(course.mockTestUrl ?? "");
  const [saved, setSaved] = useState(false);

  function save(patch: CoursePatch) {
    setSaved(false);
    startSave(async () => {
      await updateCourseAction(course.id, patch);
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="px-6 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Publish toggle */}
        <button
          onClick={() => {
            const v = !published;
            setPublished(v);
            save({ published: v });
          }}
          role="switch"
          aria-checked={published}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${published ? "bg-accent" : "bg-line-strong"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${published ? "left-[22px]" : "left-0.5"}`}
          />
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{titleOverride || course.ytTitle}</p>
          <p className="tnum text-xs text-muted">
            {course.lessonCount} lessons · {formatCompact(course.views)} views
            {course.published && (
              <>
                {" · "}
                <Link href={`/courses/${course.slug}`} className="text-accent hover:underline">
                  view
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Track */}
        <select
          value={track}
          onChange={(e) => {
            setTrack(e.target.value);
            save({ track: e.target.value });
          }}
          className="field max-w-[10rem]"
          aria-label="Track"
        >
          {TRACKS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Order */}
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          onBlur={() => save({ order: Number(order) || 0 })}
          className="field w-20 tnum"
          aria-label="Order"
          title="Lower numbers show first"
        />

        <button
          onClick={() => setExpanded((x) => !x)}
          className="btn btn-ghost text-sm"
        >
          {expanded ? "Close" : "Edit copy"}
        </button>
        {saved && <span className="text-xs text-accent">Saved</span>}
      </div>

      {expanded && (
        <div className="mt-4 grid gap-3 rounded-[var(--radius)] border border-line bg-surface-2 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Title override (leave blank to use the YouTube title)
            </label>
            <input
              className="field"
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
              onBlur={() => save({ titleOverride: titleOverride.trim() || null })}
              placeholder={course.ytTitle}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Description override
            </label>
            <textarea
              className="field min-h-20"
              value={descOverride}
              onChange={(e) => setDescOverride(e.target.value)}
              onBlur={() => save({ descOverride: descOverride.trim() || null })}
              placeholder="Custom course description shown on the course page…"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Exam information (passing %, fees, format — shown on certification courses)
            </label>
            <textarea
              className="field min-h-20"
              value={examInfo}
              onChange={(e) => setExamInfo(e.target.value)}
              onBlur={() => save({ examInfo: examInfo.trim() || null })}
              placeholder="e.g. 60% to pass · ₹1500 fee · 100 MCQs · 2 hours · valid 3 years"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">
              Mock test link (a button appears on the course page when set)
            </label>
            <input
              className="field"
              value={mockTestUrl}
              onChange={(e) => setMockTestUrl(e.target.value)}
              onBlur={() => save({ mockTestUrl: mockTestUrl.trim() || null })}
              placeholder="https://… link to your practice test / Google Form / quiz"
            />
          </div>
        </div>
      )}
    </div>
  );
}
