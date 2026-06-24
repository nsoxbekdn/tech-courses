import type { ReactNode } from "react";

/**
 * The core surface of the platform: a terminal window. Real 1px borders (crisp
 * + responsive at any width) with a monospace title bar. Presentational and
 * server-renderable — no client JS unless its children need it.
 */
export function TerminalWindow({
  title,
  chip,
  children,
  className = "",
  bodyClassName = "",
  dots = true,
}: {
  title?: ReactNode;
  chip?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  dots?: boolean;
}) {
  return (
    <div className={`term ${className}`}>
      <div className="term-bar">
        {dots && (
          <span className="term-dots" aria-hidden>
            <span className="term-dot" />
            <span className="term-dot" />
            <span className="term-dot" />
          </span>
        )}
        {title && <span className="term-title">{title}</span>}
        {chip && <span className="ml-auto mono-label">{chip}</span>}
      </div>
      <div className={`term-body ${bodyClassName}`}>{children}</div>
    </div>
  );
}
