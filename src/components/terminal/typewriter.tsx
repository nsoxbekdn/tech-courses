"use client";

import { useEffect, useRef } from "react";
import { typewriter, reduceMotion } from "@/lib/motion";
import type { Tone } from "@/components/ascii/ascii-block";

export interface TypeLine {
  /** Prompt glyph shown before the text (e.g. "❯", "$", ""). */
  prompt?: string;
  text: string;
  tone?: Tone;
  /** Pause (ms) before the next line starts typing. */
  pauseAfter?: number;
}

const TONE: Record<Tone, string> = {
  default: "text-ink-soft",
  dim: "text-line-strong",
  muted: "text-muted",
  accent: "text-accent",
  ink: "text-ink",
};

/**
 * A self-typing terminal console. Lines type sequentially with a blinking
 * caret that walks down to the active line, then rests on the last one.
 * Height is reserved up-front (no layout shift); reduced motion prints
 * everything instantly. A visually-hidden transcript keeps it accessible.
 */
export function Typewriter({
  lines,
  cps = 50,
  startDelay = 320,
  className = "",
}: {
  lines: TypeLine[];
  cps?: number;
  startDelay?: number;
  className?: string;
}) {
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const texts = textRefs.current;
    const carets = caretRefs.current;
    const setCaret = (active: number) =>
      carets.forEach((c, i) => c?.classList.toggle("caret", i === active));

    if (reduceMotion()) {
      texts.forEach((el, i) => el && (el.textContent = lines[i].text));
      setCaret(lines.length - 1);
      return;
    }

    let idx = 0;
    let cancel = () => {};
    let timer: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      if (idx >= lines.length) {
        setCaret(lines.length - 1);
        return;
      }
      const el = texts[idx];
      setCaret(idx);
      if (!el) return;
      cancel = typewriter(el, lines[idx].text, {
        cps,
        startDelay: idx === 0 ? startDelay : 0,
        onDone: () => {
          const pause = lines[idx].pauseAfter ?? 240;
          idx += 1;
          timer = setTimeout(typeNext, pause);
        },
      });
    };
    typeNext();

    return () => {
      cancel();
      clearTimeout(timer);
    };
  }, [lines, cps, startDelay]);

  return (
    <>
      <pre className={`ascii ${className}`} aria-hidden>
        {lines.map((line, i) => (
          <div key={i} className="flex min-h-[1.5em] items-start">
            {line.prompt ? (
              <span className="mr-2 shrink-0 text-accent">{line.prompt}</span>
            ) : null}
            <span className={TONE[line.tone ?? "default"]}>
              <span ref={(el) => void (textRefs.current[i] = el)} />
              <span ref={(el) => void (caretRefs.current[i] = el)} />
            </span>
          </div>
        ))}
      </pre>
      <span className="sr-only">
        {lines.map((l) => `${l.prompt ?? ""} ${l.text}`).join(". ")}
      </span>
    </>
  );
}
