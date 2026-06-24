# Design

## Theme
**Black & Shining Silver (dark-default) + Platinum Light.** True-black canvas, near-white type, one brushed-chrome **silver** accent. Swiss/grotesk discipline: hairline rules, tight radii, tabular figures, generous whitespace. Reads like a precision instrument machined from metal, not an ed-tech ad. Dark (black) is the default theme; a platinum light mode (white paper + gunmetal-silver accent) ships via the header toggle.

Both modes ship. Tokens are defined as runtime CSS variables on `:root` (light) and `.dark` (dark), surfaced to Tailwind via `@theme inline`. A header toggle persists choice to `localStorage` (`ca-theme`) and defaults to the OS preference; an inline head script applies the class before paint to avoid FOUC. Dark = near-black cool canvas `oklch(0.17 0.01 255)`, near-white ink, and a more luminous accent `oklch(0.62 0.13 160)` with dark on-accent text.

## Color (OKLCH)
Defined as Tailwind v4 `@theme` tokens in `src/app/globals.css`.

| Token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `oklch(0.985 0.002 240)` | Page background (paper off-white) |
| `--color-surface` | `oklch(1 0 0)` | Cards, panels |
| `--color-surface-2` | `oklch(0.975 0.003 240)` | Insets, table headers |
| `--color-ink` | `oklch(0.205 0.012 255)` | Primary text, headings |
| `--color-ink-soft` | `oklch(0.34 0.01 255)` | Secondary headings/body |
| `--color-muted` | `oklch(0.50 0.009 255)` | Muted text (passes 4.5:1 on bg) |
| `--color-line` | `oklch(0.915 0.004 255)` | Hairline borders/dividers |
| `--color-line-strong` | `oklch(0.86 0.005 255)` | Stronger separators |
| `--color-accent` | `oklch(0.82 0.006 264)` dark / `oklch(0.44 0.006 264)` light | Silver — links/carets/signals (chrome-silver on black, gunmetal on paper) |
| `--metal` / `--metal-strong` | brushed-chrome gradient | "Shining" surfaces: primary buttons, the TC mark (hover sheen sweep) |
| `--color-accent-strong` | `oklch(0.40 0.092 159)` | Hover/active |
| `--color-accent-tint` | `oklch(0.965 0.022 159)` | Accent wash backgrounds |
| `--color-ink-panel` | `oklch(0.21 0.015 255)` | Dark panels (player, thumbnails, footer) |
| `--color-danger` | `oklch(0.52 0.16 25)` | Errors only (used sparingly) |

Accent is the only chroma on marketing surfaces. No gold, no per-card rainbow. Level tags differ by **weight/label**, not loud hues.

## Typography
- **Family:** Geist Sans for everything (display + body), Geist Mono for figures, labels, prices, code-like metadata (ledger feel). Single-family discipline; hierarchy via weight + scale, not font-juggling. (Geist is not on the reflex-reject list.)
- **Display:** weight 700–800, letter-spacing `-0.03em`, `text-wrap: balance`. Hero clamp max ~3.5rem (never shouting).
- **Numbers:** `font-variant-numeric: tabular-nums` everywhere figures align (stats, prices, durations, tables).
- **Eyebrows/labels:** Geist Mono, uppercase, small, tracked — used *sparingly* (not above every section).
- Body measure capped ~70ch; `text-wrap: pretty` on prose.

## Shape & Surface
- **Radii:** sharp. `--radius-sm 4px`, `--radius 6px`, `--radius-lg 10px`, pills only for tags. No 16px+ bubble corners.
- **Borders:** 1px hairlines in `--color-line`. Borders do structural work; shadows are minimal.
- **Shadow:** near-flat. `--shadow-sm` (1px hairline lift), `--shadow-pop` for menus/hover only. No glow.
- **Thumbnails:** consistent ink panel with a faint graph-paper grid (accounting nod) + paper number in mono + subject — not gradient blocks.

## Motion
- Entrances: short, `ease-out-expo`/`quint`, transform+opacity only, staggered per-list. Hover: 120–160ms.
- `@media (prefers-reduced-motion: reduce)` → instant/crossfade, no transforms.

## Layout
- `container-page` max 80rem; fluid `clamp()` section spacing for rhythm.
- Hairline-ruled stat rows and section dividers instead of cards-everywhere.
- Grids: `repeat(auto-fit, minmax(280px, 1fr))` where breakpoint-free fits.

## Terminal / ASCII identity (evolution)
The precision system above is the **foundation**; on top of it sits a terminal
identity — *"if Stripe built a terminal."* Same black/ink/one-silver palette and
hairlines (premium, **no neon/glow/matrix-rain**), now spoken in monospace.

- **Type:** Geist Mono is the structural/display voice (headings, labels, nav,
  cards, buttons, figures). Geist Sans is reserved for long-form body prose so
  hours-of-study legibility is unaffected. Headings: mono, weight 700,
  `-0.03em`.
- **Surfaces:** the core surface is a **terminal window** (`.term` + `.term-bar`)
  with monochrome window dots (no SaaS traffic-light cliché) and a mono path
  title. Course cards, hero console, tracks, instructor and CTA are all windows.
  Decorative `┌ ┐ └ ┘` corner glyphs (`AsciiCorners`) read as a hand-drawn frame
  while real 1px borders keep it crisp + responsive at any width.
- **ASCII as language (`lib/ascii.ts`):** deterministic generators tied to the
  subject — folder trees, dependency trees, **git commit graphs of learning
  progress**, learning pathways, terminal/compiler output, density fields. Pure
  string builders → no hydration drift.
- **Motion:** Lenis (velocity smooth-scroll) + Anime.js (staggered reveals).
  `motion.ts` adds rAF `scramble`, `typewriter`, and `onInView`. The hero types a
  live boot session; headings/paths scramble into place; nav items are
  `[ label_ ]` with accent brackets + a hover caret; links draw their own
  underline.
- **Background (`BackgroundField`):** a fixed, pointer-reactive **canvas ASCII
  field** (sparse — only lit cells painted; scroll-velocity aware; ~24fps;
  pauses when hidden) + CSS film grain + a coordinate/status HUD written straight
  to the DOM (no React re-renders).
- **Accessibility/perf:** every effect honours `prefers-reduced-motion`
  (instant text, single static field frame, solid caret); typed/scrambled text
  ships its final string in the SSR HTML (FOUC-free, screen-reader safe);
  reserved heights prevent layout shift; canvas + HUD never re-render React.

### Token additions (`globals.css`)
`--font-display` (mono); `.term/.term-bar/.term-dot/.term-title/.term-body`;
`.ascii/.ascii-dim/.ascii-accent`; `.caret`; `.link-draw`; `.term-nav`;
`.bg-noise`; `.hud`; `.section-marker`; `.mono-label`. Lenis owns scrolling
(native `scroll-behavior` removed).
