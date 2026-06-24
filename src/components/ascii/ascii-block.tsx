import type { ReactNode } from "react";

export type Tone = "default" | "dim" | "muted" | "accent" | "ink";
export type AsciiRow = string | { text: string; tone?: Tone };

const TONE: Record<Tone, string> = {
  default: "text-ink-soft",
  dim: "text-line-strong",
  muted: "text-muted",
  accent: "text-accent",
  ink: "text-ink",
};

/**
 * Server-rendered ASCII art: a monospace, fixed-grid <pre>. Rows can carry a
 * tone so structural glyphs (frames, connectors) sit back while labels/nodes
 * read forward — without ever breaking the character grid. No client JS.
 */
export function AsciiBlock({
  rows,
  className = "",
  ariaLabel,
}: {
  rows: AsciiRow[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <pre
      className={`ascii ${className}`}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? "img" : undefined}
    >
      {rows.map((row, i) => {
        const text = typeof row === "string" ? row : row.text;
        const tone = typeof row === "string" ? "default" : row.tone ?? "default";
        return (
          <div key={i} className={TONE[tone]}>
            {text === "" ? " " : text}
          </div>
        );
      })}
    </pre>
  );
}

/** Decorative corner glyphs that frame any relatively-positioned box. */
export function AsciiCorners({
  tone = "dim",
  inset = "0.35rem",
}: {
  tone?: Tone;
  inset?: string;
}): ReactNode {
  const cls = `pointer-events-none absolute ascii ${TONE[tone]} text-[0.85em] leading-none select-none`;
  return (
    <>
      <span className={cls} style={{ left: inset, top: inset }} aria-hidden>
        ┌
      </span>
      <span className={cls} style={{ right: inset, top: inset }} aria-hidden>
        ┐
      </span>
      <span className={cls} style={{ left: inset, bottom: inset }} aria-hidden>
        └
      </span>
      <span className={cls} style={{ right: inset, bottom: inset }} aria-hidden>
        ┘
      </span>
    </>
  );
}

/**
 * Responsive ASCII divider: an optional index/label, then a hairline of
 * repeated `─` that fills and clips to its container at any width.
 *   02 // choose your track ────────────────────────────────
 */
export function AsciiDivider({
  index,
  label,
  className = "",
}: {
  index?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 select-none ${className}`}
      aria-hidden
    >
      {index && (
        <span className="section-marker">
          <b>{index}</b>
        </span>
      )}
      {label && (
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {"// "}
          {label}
        </span>
      )}
      <span className="ascii ascii-dim min-w-0 flex-1 overflow-hidden whitespace-nowrap">
        {"─".repeat(600)}
      </span>
    </div>
  );
}
