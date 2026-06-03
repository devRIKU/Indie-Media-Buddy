"use client";

import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";

/**
 * MagneticButton — primary CTA pattern.
 *
 * Structure (per the Vanguard brief, Section 4.B):
 *   [ icon | label | (icon-pill) ]
 *
 * The trailing icon is never naked — it sits inside its own circular wrapper
 * flush with the right inner padding. On hover, the wrapper translates
 * diagonally + scales 1.05, while the whole button scales 0.985 on press to
 * simulate physical contact.
 *
 * Variants:
 *   - primary  : solid accent, accent-fg text (the one earned use of color)
 *   - secondary: surface bg, hairline border, fg text
 *
 * Either renders as a `<Link>` if `href` is given, else `<button>`.
 */
type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  variant?: "primary" | "secondary";
  /** Icon to render inside the trailing pill. Defaults to a hairline arrow. */
  trailing?: ReactNode;
  /** Optional leading icon (sits inside the main padding, no pill). */
  leading?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

const ArrowIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="h-3.5 w-3.5"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  trailing = ArrowIcon,
  leading,
  className = "",
  ...rest
}: Props) {
  // Press feedback must be near-instant (<160ms). Hover color/bg can be
  // a touch slower so it reads as deliberate without feeling laggy.
  const base =
    "group/btn relative inline-flex items-center gap-3 rounded-full pl-6 pr-1.5 py-1.5 text-sm font-semibold tracking-[-0.005em] " +
    "transition-[transform,background-color,color] duration-hover ease-ui " +
    "active:scale-[0.985] active:duration-press active:ease-press " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

  const variantClasses =
    variant === "primary"
      ? "bg-accent text-accent-fg hover:bg-accent-hover"
      : "bg-surface text-fg ring-1 ring-border-2 hover:bg-surface-2";

  const pill =
    variant === "primary"
      ? "bg-accent-fg/15 text-accent-fg"
      : "bg-fg/8 text-fg ring-1 ring-fg/10";

  const inner = (
    <>
      {leading && <span className="-ml-1.5 inline-flex">{leading}</span>}
      <span className="py-1.5">{children}</span>
      <span
        aria-hidden="true"
        className={
          "ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full " +
          // Slightly slower than press-feedback so the diagonal nudge reads
          // as a deliberate kinetic flourish, not a glitch.
          "transition-transform duration-lift ease-ui " +
          "group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-px group-hover/btn:scale-[1.06] " +
          pill
        }
      >
        {trailing}
      </span>
    </>
  );

  const cls = `${base} ${variantClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} {...rest}>
      {inner}
    </button>
  );
}
