"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/",                 label: "Home",    match: (p: string) => p === "/" },
  { href: "/category/shows",   label: "Shows",   match: (p: string) => p.startsWith("/category/shows") },
  { href: "/category/movies",  label: "Films",   match: (p: string) => p.startsWith("/category/movies") },
  { href: "/category/science", label: "Science", match: (p: string) => p.startsWith("/category/science") },
  { href: "/my-list",          label: "My List", match: (p: string) => p.startsWith("/my-list") },
] as const;

function Hint({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  const show = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 380);
  };
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <span
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="relative inline-flex"
    >
      {children}
      <AnimatePresence>
        {open && (
          <m.span
            key="hint"
            role="tooltip"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg"
            style={{
              boxShadow:
                "0 4px 12px -4px oklch(0% 0 0 / 0.4)," +
                " inset 0 0 0 1px oklch(from var(--fg) l c h / 0.08)",
            }}
          >
            {label}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * TopNav — floating glass pill, desktop only.
 *
 *   • Hidden below md — MobileBottomNav takes over on phones/tablets.
 *   • Framer Motion handles entrance (fade + blur drop on mount) and the
 *     shared active-indicator morph (layoutId, springy).
 *   • Custom Hint tooltip wraps the icon buttons for an accessible label.
 *   • Single border-radius token (rounded-full) — no irregular pill shapes.
 *   • Bounding box is one object: a glassy capsule. No nested shells.
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
    <AnimatePresence>
      <m.header
        key="topnav"
        initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 hidden justify-center px-4 pt-5 md:flex"
      >
        <m.nav
          aria-label="Primary"
          animate={{
            scale: scrolled ? 0.98 : 1,
            opacity: scrolled ? 1 : 0.95,
          }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="glass-nav pointer-events-auto flex max-w-full items-center gap-1 rounded-full p-1.5"
          style={{
            boxShadow:
              "inset 0 1px 0 oklch(from var(--fg) l c h / 0.08)," +
              " inset 0 0 0 1px oklch(from var(--fg) l c h / 0.06)," +
              " 0 8px 32px -12px oklch(8% 0.02 55 / 0.6)",
          }}
        >
          <Link
            href="/"
            aria-label="YouPlus home"
            className="ml-2 mr-1 inline-flex shrink-0 items-center font-display text-sm font-semibold tracking-heading text-fg transition-transform duration-lift ease-ui hover:scale-[1.03] active:scale-100 active:duration-press sm:ml-3 sm:mr-2"
          >
            You<span className="text-accent">+</span>
          </Link>

          <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-fg/10 sm:mx-1" />

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
                      <m.span
                        aria-hidden="true"
                        layoutId="topnav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 360, damping: 32 }}
                      />
                    )}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <span aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-fg/10 sm:mx-1" />

          <Hint label="Search">
            <Link
              href="/search"
              aria-label="Search the catalogue"
              className="mr-1.5 grid h-9 w-9 place-items-center rounded-full bg-fg/8 text-fg-2 transition-[transform,background-color,color] duration-hover ease-ui hover:scale-105 hover:bg-fg/12 hover:text-fg active:scale-95 active:duration-press active:ease-press"
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
          </Hint>

          <Hint label="Account">
            <button
              type="button"
              aria-label="Account"
              className="mr-1.5 grid h-9 w-9 place-items-center rounded-full bg-fg/8 text-fg-2 transition-[transform,background-color,color] duration-hover ease-ui hover:scale-105 hover:bg-fg/12 hover:text-fg active:scale-95 active:duration-press active:ease-press"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </button>
          </Hint>
        </m.nav>
      </m.header>
    </AnimatePresence>
  );
}
