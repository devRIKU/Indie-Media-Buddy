import type { ReactNode } from "react";

/**
 * Eyebrow — microscopic pill-shaped badge that precedes major H1/H2s.
 *
 * Pattern from the Vanguard brief, Section 4.C: rounded-full, px-3 py-1,
 * 10px font-size, uppercase, 0.2em tracking. We keep our editorial
 * mono + warm-amber accent rather than the generic SaaS pill.
 *
 * Variants:
 *   - accent : amber dot + amber border (default — for section eyebrows)
 *   - quiet  : faint hairline only, no dot (for nested or repeated use)
 */
export default function Eyebrow({
  children,
  variant = "accent",
  className = "",
}: {
  children: ReactNode;
  variant?: "accent" | "quiet";
  className?: string;
}) {
  const isAccent = variant === "accent";
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full px-3 py-1 " +
        "font-mono text-[10px] font-medium uppercase tracking-[0.2em] " +
        (isAccent
          ? "border border-accent/30 text-accent"
          : "border border-border text-muted") +
        " " +
        className
      }
    >
      {isAccent && (
        <span
          aria-hidden="true"
          className="h-1 w-1 rounded-full bg-accent"
        />
      )}
      {children}
    </span>
  );
}
