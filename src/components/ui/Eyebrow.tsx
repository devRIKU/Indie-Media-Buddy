import type { ReactNode } from "react";

/**
 * Eyebrow — microscopic pill-shaped badge that precedes major H1/H2s.
 *
 *   - accent : amber border + amber text (default — for section eyebrows)
 *   - quiet  : faint hairline only (for nested or repeated use)
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
  return (
    <span
      className={
        "inline-flex h-6 items-center rounded-full border px-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] leading-none " +
        className
      }
      style={{
        backgroundColor: "transparent",
        borderColor:
          variant === "accent"
            ? "color-mix(in oklch, var(--accent) 30%, transparent)"
            : "var(--border)",
        color: variant === "accent" ? "var(--accent)" : "var(--muted)",
      }}
    >
      {variant === "accent" && (
        <span
          aria-hidden="true"
          className="mr-1.5 inline-block h-1 w-1 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}
      {children}
    </span>
  );
}
