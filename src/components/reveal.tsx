"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered entrance. Renders a <div> (so it can BE a grid/section
 * container — no extra wrapper that would break gap-px hairlines or
 * equal-height grids). With `stagger`, direct children animate in sequence
 * via CSS nth-child delays. Honours prefers-reduced-motion (instant).
 */
export function Reveal({
  children,
  className = "",
  stagger = false,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No IO (very old/SSR-less env): show immediately rather than hide forever.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = stagger ? "reveal-stagger" : "reveal-on-scroll";
  return (
    <div ref={ref} className={`${base}${shown ? " is-revealed" : ""} ${className}`}>
      {children}
    </div>
  );
}
