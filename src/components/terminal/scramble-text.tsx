"use client";

import { useEffect, useRef } from "react";
import { scramble, onInView, reduceMotion } from "@/lib/motion";

/**
 * Renders `text`, then scrambles it into place. SSR/no-JS show the final text
 * (accessible + FOUC-free); the animation only enhances on the client.
 *
 * trigger:
 *   "view"  — scramble once when scrolled into view (default)
 *   "mount" — scramble on mount
 *   "hover" — settle on mount, re-scramble on each hover of `hoverTarget`
 */
export function ScrambleText({
  text,
  as: Tag = "span",
  className = "",
  trigger = "view",
  speed = 1,
  settleMs = 26,
  hoverSelector,
}: {
  text: string;
  as?: React.ElementType;
  className?: string;
  trigger?: "view" | "mount" | "hover";
  speed?: number;
  settleMs?: number;
  /** Closest-ancestor selector whose hover re-triggers the scramble. */
  hoverSelector?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion()) return;

    let cancel = () => {};
    const run = () => {
      cancel();
      cancel = scramble(el, text, { speed, settleMs });
    };

    if (trigger === "mount") {
      run();
      return () => cancel();
    }

    if (trigger === "hover") {
      const host =
        (hoverSelector && el.closest<HTMLElement>(hoverSelector)) || el;
      host.addEventListener("mouseenter", run);
      return () => {
        host.removeEventListener("mouseenter", run);
        cancel();
      };
    }

    const off = onInView(el, run);
    return () => {
      off();
      cancel();
    };
  }, [text, trigger, speed, settleMs, hoverSelector]);

  return (
    <Tag ref={ref as never} className={className}>
      {text}
    </Tag>
  );
}
