// ASCII art generators tied to the subject matter of a tech-courses platform:
// folder trees, dependency graphs, git history, terminal/compiler output and
// learning pathways. Everything here is a PURE, DETERMINISTIC string builder
// (no Date/Math.random) so it renders identically on the server and client —
// no hydration drift. Components colourise these lines; the data stays plain.

export type AsciiLine = string;

/** Box-drawing glyph sets. */
export const GLYPH = {
  tl: "┌",
  tr: "┐",
  bl: "└",
  br: "┘",
  h: "─",
  v: "│",
  tee: "├",
  end: "└",
  branch: "│",
  node: "●",
  pipe: "┃",
  merge: "┣",
  arrow: "→",
} as const;

/** Repeat a glyph to a given width. */
export function rule(width: number, ch = GLYPH.h): string {
  return ch.repeat(Math.max(0, width));
}

/**
 * A titled top border: `┌─ title ──────────────────┐` sized to `width`.
 * Used by terminal frames where a fixed width is known.
 */
export function frameTop(title: string, width = 28): string {
  const label = title ? ` ${title} ` : "";
  const fill = Math.max(0, width - label.length - 2);
  return `${GLYPH.tl}${GLYPH.h}${label}${GLYPH.h.repeat(fill)}${GLYPH.tr}`;
}

export function frameBottom(width = 28): string {
  return `${GLYPH.bl}${GLYPH.h.repeat(Math.max(0, width))}${GLYPH.br}`;
}

/** A file/folder tree from a nested spec. */
export interface TreeNode {
  label: string;
  children?: TreeNode[];
}

export function folderTree(nodes: TreeNode[], prefix = ""): AsciiLine[] {
  const out: AsciiLine[] = [];
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1;
    out.push(`${prefix}${last ? "└── " : "├── "}${node.label}`);
    if (node.children?.length) {
      out.push(
        ...folderTree(node.children, `${prefix}${last ? "    " : "│   "}`),
      );
    }
  });
  return out;
}

/** A dependency/resolution tree (npm-style). */
export function dependencyTree(
  root: string,
  deps: { name: string; version: string; nested?: string[] }[],
): AsciiLine[] {
  const out: AsciiLine[] = [root];
  deps.forEach((d, i) => {
    const last = i === deps.length - 1;
    out.push(`${last ? "└─" : "├─"} ${d.name}@${d.version}`);
    d.nested?.forEach((n, j) => {
      const lastN = j === d.nested!.length - 1;
      out.push(`${last ? "  " : "│ "} ${lastN ? "└─" : "├─"} ${n}`);
    });
  });
  return out;
}

/** A git commit graph — newest first. */
export interface Commit {
  hash: string;
  msg: string;
  tag?: string;
}

export function gitGraph(commits: Commit[]): AsciiLine[] {
  return commits.flatMap((c, i) => {
    const tag = c.tag ? `  (${c.tag})` : "";
    const line = `${GLYPH.node} ${c.hash}  ${c.msg}${tag}`;
    const connector = i === commits.length - 1 ? "" : GLYPH.pipe;
    return connector ? [line, connector] : [line];
  });
}

/** Terminal / compiler-style output lines with a leading prompt. */
export function terminalLines(
  cmds: { prompt?: string; text: string }[],
): { prompt: string; text: string }[] {
  return cmds.map((c) => ({ prompt: c.prompt ?? "❯", text: c.text }));
}

/**
 * A vertical learning pathway: numbered stages joined by pipe connectors.
 *   01 ── Foundations
 *      │
 *   02 ── Core concepts
 */
export function learningPath(steps: string[]): AsciiLine[] {
  const out: AsciiLine[] = [];
  steps.forEach((s, i) => {
    const n = String(i + 1).padStart(2, "0");
    out.push(`${n} ${GLYPH.h}${GLYPH.h} ${s}`);
    if (i < steps.length - 1) out.push(`   ${GLYPH.branch}`);
  });
  return out;
}

/** Build a small density "field" frame (used as decorative hero art seed). */
export function densityBlock(rows: number, cols: number, ramp = " .:-=+*#%@"): string[] {
  const out: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      // Smooth, seedless value field — pure trig so it's identical everywhere.
      const v =
        (Math.sin(c * 0.45 + r * 0.3) + Math.cos(r * 0.5 - c * 0.2) + 2) / 4;
      const idx = Math.min(ramp.length - 1, Math.floor(v * ramp.length));
      line += ramp[idx];
    }
    out.push(line);
  }
  return out;
}
