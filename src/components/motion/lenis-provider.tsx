"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { reduceMotion } from "@/lib/motion";

/**
 * Velocity-interpolated smooth scrolling. Mounted once at the root.
 * - Skips entirely under prefers-reduced-motion (native scroll takes over).
 * - Touch scrolling stays native (smoothTouch off) so mobile feels right.
 * - Exposes the live instance + scroll velocity on window for the background
 *   field to read without forcing React re-renders.
 */
declare global {
  interface Window {
    __lenis?: Lenis;
    __scrollVelocity?: number;
  }
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (reduceMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 4), // outQuart — cinematic settle
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;
    window.__scrollVelocity = 0;

    lenis.on("scroll", ({ velocity }: { velocity: number }) => {
      window.__scrollVelocity = velocity;
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // In-page anchor links should route through Lenis for the smooth glide.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -80 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
