"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { reduceMotion, onInView, EASE } from "@/lib/motion";

/**
 * Scroll-triggered entrance. Renders a <div> (so it can BE a grid/section
 * container — no extra wrapper that would break gap-px hairlines or
 * equal-height grids).
 *
 * Children are hidden by CSS first (FOUC-free, and forced visible under
 * prefers-reduced-motion via the media query in globals.css). When motion is
 * allowed, Anime.js drives the actual staggered entrance for eased, per-child
 * timing that isn't capped at six items the way nth-child CSS is.
 */
export function Reveal({
  children,
  className = "",
  stagger: doStagger = false,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      const targets = doStagger
        ? (Array.from(el.children) as HTMLElement[])
        : [el];

      if (reduceMotion()) {
        targets.forEach((t) => {
          t.style.opacity = "1";
          t.style.transform = "none";
        });
        return;
      }

      // Anime drives transform/opacity per-frame; kill the base CSS transition
      // so the two easings don't fight (the .reveal-* classes declare one).
      targets.forEach((t) => (t.style.transition = "none"));

      try {
        animate(targets, {
          opacity: [0, 1],
          translateY: [y, 0],
          duration: 620,
          delay: doStagger ? stagger(70) : 0,
          ease: EASE.outExpo,
        });
      } catch {
        // Never leave content stuck at opacity:0 if the engine ever fails.
        targets.forEach((t) => {
          t.style.opacity = "1";
          t.style.transform = "none";
        });
      }
    };

    return onInView(el, reveal);
  }, [doStagger, y]);

  const base = doStagger ? "reveal-stagger" : "reveal-on-scroll";
  return (
    <div ref={ref} className={`${base} ${className}`}>
      {children}
    </div>
  );
}
