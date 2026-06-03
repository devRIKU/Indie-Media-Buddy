"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/",                 label: "Home",    match: (p: string) => p === "/" },
  { href: "/category/shows",   label: "Shows",   match: (p: string) => p.startsWith("/category/shows") },
  { href: "/category/movies",  label: "Films",   match: (p: string) => p.startsWith("/category/movies") },
  { href: "/category/science", label: "Science", match: (p: string) => p.startsWith("/category/science") },
  { href: "/my-list",          label: "My List", match: (p: string) => p.startsWith("/my-list") },
] as const;

/**
 * Fluid Island TopNav.
 *
 * - Detached floating pill at the top of the viewport (mt-5 mx-auto w-max).
 * - Glassy material from Section 4.A double-bezel philosophy: a faint outer
 *   shell + an inner highlight + concentric radii.
 * - Active link gets a soft amber capsule behind it (transitions duration-500).
 * - Wordmark on the far left, search icon on the far right — both inside the
 *   pill, so the whole nav reads as one machined object.
 *
 * Performance: backdrop-blur is on a fixed element only (Section 6). The pill
 * never enters a scrolling container.
 */
export default function TopNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-3 pt-3 sm:px-4 sm:pt-5">
      <nav
        aria-label="Primary"
        className={
          // Pill subtly compresses on scroll — explicit properties only.
          // Background / blur / shadow are static; only scale + opacity move.
          "pointer-events-auto flex max-w-full items-center gap-1 overflow-hidden p-1.5 transition-[transform,opacity] duration-lift ease-ui " +
          (scrolled ? "scale-[0.98] opacity-100" : "scale-100 opacity-95")
        }
        style={{
          borderRadius: "9999px",
          background: "oklch(from var(--bg) l c h / 0.62)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          boxShadow:
            "inset 0 1px 0 oklch(from var(--fg) l c h / 0.08)," +
            " inset 0 0 0 1px oklch(from var(--fg) l c h / 0.06)," +
            " 0 8px 32px -12px oklch(8% 0.02 55 / 0.6)",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          aria-label="YouPlus home"
          className="ml-2 mr-1 inline-flex shrink-0 items-center font-display text-sm font-semibold tracking-heading text-fg transition-transform duration-lift ease-ui hover:scale-[1.03] active:scale-100 active:duration-press sm:ml-3 sm:mr-2"
        >
          You<span className="text-accent">+</span>
        </Link>

        {/* Hairline divider */}
        <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-fg/10 sm:mx-1" />

        {/* Links */}
        <ul className="flex min-w-0 items-center gap-0.5">
          {LINKS.map((link) => {
            const active = link.match(pathname);
            const compactOnly =
              (link.href === "/category/movies" || link.href === "/category/science") &&
              !active;
            return (
              <li
                key={link.href}
                className={compactOnly ? "hidden sm:block" : undefined}
              >
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "relative inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-hover ease-ui sm:px-3.5 " +
                    (active ? "text-accent-fg" : "text-fg-2 hover:text-fg")
                  }
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-full bg-accent"
                    />
                  )}
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Hairline divider */}
        <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-fg/10 sm:mx-1" />

        {/* Search affordance — its own circular pill, button-in-button style */}
        <Link
          href="/search"
          aria-label="Search the catalogue"
          className={[
            "mr-1.5 grid h-9 w-9 place-items-center rounded-full bg-fg/8 text-fg-2",
            "transition-[transform,background-color,color] duration-hover ease-ui",
            "hover:scale-105 hover:bg-fg/12 hover:text-fg",
            "active:scale-95 active:duration-press active:ease-press",
          ].join(" ")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="h-[15px] w-[15px]"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}
