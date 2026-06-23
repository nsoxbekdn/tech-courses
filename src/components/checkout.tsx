"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/types";
import { useStore } from "@/lib/store";
import { courseStats, getInstructor } from "@/lib/course-utils";
import { formatInr } from "@/lib/format";
import { Thumbnail } from "./ui";
import { CheckIcon, LockIcon, ShieldIcon } from "./icons";

type Method = "card" | "upi" | "netbanking";
type Phase = "form" | "processing" | "done";

export function Checkout({ course }: { course: Course }) {
  const { user, ready, isEnrolled, enroll } = useStore();
  const router = useRouter();
  const stats = courseStats(course);
  const instructor = getInstructor(course.instructorId);
  const code = course.code ?? course.level.slice(0, 3);

  const gst = Math.round(course.priceInr * 0.18);
  const total = course.priceInr + gst;

  const [method, setMethod] = useState<Method>("card");
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");

  // Already enrolled? Send them straight to the course.
  useEffect(() => {
    if (ready && isEnrolled(course.id)) router.replace(`/learn/${course.slug}`);
  }, [ready, isEnrolled, course.id, course.slug, router]);

  // Not logged in? Bounce to login and return here.
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=/checkout/${course.slug}`);
  }, [ready, user, course.slug, router]);

  async function handlePay() {
    setError("");
    setPhase("processing");
    try {
      // 1) Create the order on the server (mock Razorpay order in demo mode).
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      if (!res.ok) throw new Error("Could not start payment");
      await res.json();

      // 2) Simulate the Razorpay checkout modal + signature verification.
      await new Promise((r) => setTimeout(r, 1600));

      // 3) On verified success, grant access.
      enroll(course.id);
      setPhase("done");
      setTimeout(() => router.push(`/learn/${course.slug}`), 1400);
    } catch {
      setError("Payment failed. Please try again.");
      setPhase("form");
    }
  }

  if (!ready || !user) {
    return (
      <div className="container-page py-24 text-center text-muted">Loading…</div>
    );
  }

  if (phase === "done") {
    return (
      <div className="container-page py-24">
        <div className="card mx-auto max-w-md p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-tint text-accent">
            <CheckIcon width={30} height={30} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">Payment successful</h1>
          <p className="mt-2 text-muted">
            You are enrolled in <strong className="text-ink">{course.title}</strong>.
            Taking you to the course.
          </p>
          <Link href={`/learn/${course.slug}`} className="btn btn-primary mt-6">
            Start learning now
          </Link>
        </div>
      </div>
    );
  }

  const methods: { key: Method; label: string }[] = [
    { key: "card", label: "Card" },
    { key: "upi", label: "UPI" },
    { key: "netbanking", label: "Netbanking" },
  ];

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-bold text-ink">Checkout</h1>
      <p className="mt-2 text-muted">
        Secure one-time payment. Lifetime access to this course.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Payment */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-ink">Billing details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Name
                </label>
                <input className="field" defaultValue={user.name} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                  Email
                </label>
                <input className="field" defaultValue={user.email} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-ink">Payment method</h2>
            <div className="mt-4 flex gap-2">
              {methods.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex-1 rounded-[var(--radius)] border px-4 py-3 text-sm font-semibold transition-colors ${
                    method === m.key
                      ? "border-accent bg-accent-tint text-accent"
                      : "border-line-strong text-ink-soft hover:border-ink"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              {method === "card" && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Card number
                    </label>
                    <input className="field tnum" placeholder="4111 1111 1111 1111" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="field tnum" placeholder="MM / YY" />
                    <input className="field tnum" placeholder="CVV" />
                  </div>
                </>
              )}
              {method === "upi" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-soft">
                    UPI ID
                  </label>
                  <input className="field" placeholder="yourname@upi" />
                </div>
              )}
              {method === "netbanking" && (
                <select className="field">
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              )}
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
              <LockIcon width={14} height={14} /> Demo checkout: no real card is charged.
            </p>
          </div>

          {error && (
            <p className="rounded-[var(--radius)] border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={phase === "processing"}
            className="btn btn-primary w-full py-3 text-base"
          >
            {phase === "processing" ? "Processing payment…" : `Pay ${formatInr(total)}`}
          </button>
        </div>

        {/* Order summary */}
        <aside>
          <div className="card sticky top-20 overflow-hidden">
            <div className="flex gap-3 p-4">
              <Thumbnail watermark={code} className="h-16 w-24 shrink-0 rounded-[var(--radius)]" />
              <div>
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {course.title}
                </h3>
                <p className="text-xs text-muted">{instructor?.name}</p>
                <p className="tnum mt-1 text-xs text-muted">
                  {stats.lessonCount} lessons · {stats.totalHours}h
                </p>
              </div>
            </div>

            <div className="border-t border-line p-4 text-sm">
              <div className="flex justify-between py-1 text-ink-soft">
                <span>Course price</span>
                <span className="tnum">{formatInr(course.priceInr)}</span>
              </div>
              <div className="flex justify-between py-1 text-ink-soft">
                <span>GST (18%)</span>
                <span className="tnum">{formatInr(gst)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-bold text-ink">
                <span>Total</span>
                <span className="tnum">{formatInr(total)}</span>
              </div>
            </div>

            <div className="border-t border-line bg-surface-2 p-4">
              <ul className="space-y-2 text-xs text-ink-soft">
                <li className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-accent" /> Lifetime
                  access on web & mobile
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-accent" /> Certificate
                  of completion
                </li>
                <li className="flex items-center gap-2">
                  <ShieldIcon width={14} height={14} className="text-accent" /> 30-day
                  money-back guarantee
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
