// Framework-agnostic motion helpers used by the terminal/ASCII components.
// Pure functions — only ever called from inside client effects, never on the
// server. Each long-running routine returns a cancel() so React can clean up.

/** SSR-safe reduced-motion check. */
export function reduceMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Anime.js v4 eases that mirror our CSS easing tokens. */
export const EASE = {
  out: "out(3)",
  outExpo: "outExpo",
  outQuint: "outQuint",
  inOut: "inOutQuad",
} as const;

/** Glyph ramp used for scrambles — punctuation-heavy so it reads "computational". */
const SCRAMBLE_GLYPHS = "!<>-_\\/[]{}—=+*^?#________";

type Cancel = () => void;

/**
 * Scramble `el` into `text`: each character locks in left-to-right while the
 * not-yet-settled tail keeps cycling random glyphs. Pointer-free, rAF-driven.
 */
export function scramble(
  el: HTMLElement,
  text: string,
  { speed = 1, settleMs = 26 }: { speed?: number; settleMs?: number } = {},
): Cancel {
  if (reduceMotion()) {
    el.textContent = text;
    return () => {};
  }
  const chars = [...text];
  let frame = 0;
  let raf = 0;
  const start = performance.now();
  const lockAt = chars.map((_, i) => i * settleMs);

  const tick = (now: number) => {
    const elapsed = (now - start) * speed;
    let out = "";
    let done = true;
    for (let i = 0; i < chars.length; i++) {
      if (elapsed >= lockAt[i]) {
        out += chars[i];
      } else {
        done = false;
        out +=
          chars[i] === " "
            ? " "
            : SCRAMBLE_GLYPHS[(frame + i) % SCRAMBLE_GLYPHS.length];
      }
    }
    el.textContent = out;
    frame++;
    if (!done) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/**
 * Type `text` into `el` one character at a time. Honours reduced motion
 * (instant). `onDone` fires once the line is fully typed.
 */
export function typewriter(
  el: HTMLElement,
  text: string,
  {
    cps = 42,
    startDelay = 0,
    onDone,
  }: { cps?: number; startDelay?: number; onDone?: () => void } = {},
): Cancel {
  if (reduceMotion()) {
    el.textContent = text;
    onDone?.();
    return () => {};
  }
  const chars = [...text];
  let i = 0;
  let raf = 0;
  let startedAt = 0;
  const perChar = 1000 / cps;

  const tick = (now: number) => {
    if (!startedAt) startedAt = now + startDelay;
    if (now < startedAt) {
      raf = requestAnimationFrame(tick);
      return;
    }
    const target = Math.floor((now - startedAt) / perChar);
    if (target > i) {
      i = Math.min(target, chars.length);
      el.textContent = chars.slice(0, i).join("");
    }
    if (i < chars.length) raf = requestAnimationFrame(tick);
    else onDone?.();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** Fire `cb` once when `el` first scrolls into view (or immediately if no IO). */
export function onInView(
  el: Element,
  cb: () => void,
  { rootMargin = "0px 0px -12% 0px", threshold = 0.15 } = {},
): Cancel {
  if (typeof IntersectionObserver === "undefined") {
    cb();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        cb();
        io.disconnect();
      }
    },
    { rootMargin, threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}
