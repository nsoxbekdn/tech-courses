import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function StarIcon({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} fill={filled ? "currentColor" : "none"} {...p}>
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.9l-5.8 3.07 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
    </svg>
  );
}

export function PlayIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M7 4.5v15l12-7.5-12-7.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlayCircleIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M10 8.5l5 3.5-5 3.5v-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function CheckCircleIcon({ filled, ...p }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9.5" fill={filled ? "currentColor" : "none"} />
      <path d="M8 12l2.5 2.5L16 9" stroke={filled ? "#fff" : "currentColor"} />
    </svg>
  );
}

export function ClockIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function UsersIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M16 18v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 16.5V18" />
      <circle cx="10" cy="7.5" r="3" />
      <path d="M20 18v-1.5a3.5 3.5 0 00-2.6-3.4M15.5 4.7a3 3 0 010 5.6" />
    </svg>
  );
}

export function BookIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5.5A1.5 1.5 0 015.5 4H18a1 1 0 011 1v13a1 1 0 01-1 1H6a2 2 0 00-2 2V5.5z" />
      <path d="M4 18.5A2 2 0 016 17h13" />
    </svg>
  );
}

export function CertificateIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13.5L8 21l4-2 4 2-1-7.5" />
    </svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function LockIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

export function GlobeIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </svg>
  );
}

export function SunIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M20 14.5A8 8 0 019.5 4a7 7 0 109.5 10.5z" />
    </svg>
  );
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
