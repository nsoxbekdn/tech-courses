# Design

## Theme
**Precision Light + Precision Dark.** Off-white paper canvas, ink-black type, one deep-green accent. Swiss/grotesk discipline: hairline rules, tight radii, tabular figures, generous whitespace. Reads like a precision instrument / private-bank statement, not an ed-tech ad.

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
| `--color-accent` | `oklch(0.46 0.094 159)` | Deep green — primary actions, signals |
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
