import Image from "next/image";
import { StarIcon, PlayCircleIcon } from "./icons";
import { formatCompact } from "@/lib/format";

/** Real YouTube view count — the honest social-proof signal for this catalog. */
export function ViewCount({ views, size = 14 }: { views: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <PlayCircleIcon width={size} height={size} className="text-accent" />
      <span className="tnum text-sm font-semibold text-ink">{formatCompact(views)}</span>
      <span className="text-xs text-muted">views</span>
    </span>
  );
}

export function StarRating({
  value,
  count,
  size = 13,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="tnum text-sm font-semibold text-ink">{value.toFixed(1)}</span>
      <span className="inline-flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            width={size}
            height={size}
            filled={i < rounded}
            className={i < rounded ? "text-accent" : "text-line-strong"}
          />
        ))}
      </span>
      {count !== undefined && (
        <span className="tnum text-xs text-muted">
          ({new Intl.NumberFormat("en-IN").format(count)})
        </span>
      )}
    </span>
  );
}

export function Avatar({
  initials,
  size = 40,
  onPanel = false,
}: {
  initials: string;
  size?: number;
  onPanel?: boolean;
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-mono font-medium ${
        onPanel
          ? "bg-white/10 text-on-panel ring-1 ring-white/15"
          : "bg-ink-panel text-on-panel"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  return <span className="tag">{level}</span>;
}

/**
 * Graph-paper ink panel used for course/lesson thumbnails.
 * When `src` is provided the YouTube thumbnail fills the panel;
 * otherwise the graph-paper dark background shows as the fallback.
 */
export function Thumbnail({
  className = "",
  watermark,
  src,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  children,
}: {
  className?: string;
  watermark?: string;
  src?: string;
  sizes?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`thumb ${className}`}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          priority={false}
        />
      ) : (
        watermark && (
          <span className="pointer-events-none absolute -right-2 -top-3 select-none font-mono text-[5.5rem] font-bold leading-none text-on-panel/10">
            {watermark}
          </span>
        )
      )}
      {children}
    </div>
  );
}
