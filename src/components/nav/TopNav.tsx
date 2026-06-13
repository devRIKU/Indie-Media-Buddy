"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/",                 label: "Home",    match: (p: string) => p === "/" },
  { href: "/category/shows",   label: "Shows",   match: (p: string) => p.startsWith("/category/shows") },
  { href: "/category/movies",  label: "Films",   match: (p: string) => p.startsWith("/category/movies") },
  { href: "/category/science", label: "Science", match: (p: string) => p.startsWith("/category/science") },
  { href: "/my-list",          label: "My List", match: (p: string) => p.startsWith("/my-list") },
] as const;

/**
 * Hint — Accessible tooltip with delightful reveal animation.
 * Design Spell: Subtle spring animation on appear.
 */
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
    timer.current = window.setTimeout(() => setOpen(true), 400);
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
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.34, 1.56, 0.64, 1] 
            }}
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg shadow-md"
          >
            {label}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * MagneticButton — Design Spell that creates magnetic hover effect.
 * Button subtly follows cursor when hovered.
 */
function MagneticButton({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) * 0.15;
    const deltaY = (clientY - centerY) * 0.15;
    setPosition({ x: deltaX, y: deltaY });
  }, []);

  const reset = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={className}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * TopNav — floating glass pill, desktop only.
 *
 * Redesigned with:
 *   • Magnetic hover on logo and icon buttons (Design Spell)
 *   • Refined glass morphism with subtle inner glow
 *   • Smoother spring animations for active indicator
 *   • Better visual hierarchy with refined spacing
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
        initial={{ opacity: 0, y: -16, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-30 hidden justify-center px-4 pt-4 md:flex"
      >
        <m.nav
          aria-label="Primary"
          animate={{
            scale: scrolled ? 0.97 : 1,
            opacity: scrolled ? 1 : 0.96,
          }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="glass-nav pointer-events-auto flex max-w-full items-center gap-1 rounded-full p-1.5 shadow-lg"
          style={{
            boxShadow: scrolled
              ? "inset 0 1px 0 rgba(245, 240, 235, 0.1), inset 0 0 0 1px rgba(245, 240, 235, 0.08), 0 12px 40px -12px rgba(15, 14, 13, 0.7)"
              : "inset 0 1px 0 rgba(245, 240, 235, 0.06), inset 0 0 0 1px rgba(245, 240, 235, 0.04), 0 8px 32px -12px rgba(15, 14, 13, 0.5)",
          }}
        >
          <Link
            href="/"
            aria-label="YouPlus home"
            className="ml-2 mr-1 inline-flex shrink-0 items-center font-display text-sm font-semibold tracking-heading text-fg transition-transform duration-slow ease-out hover:scale-[1.04] active:scale-100 active:duration-fast sm:ml-3 sm:mr-2"
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
                      "relative inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-normal ease-out sm:px-3.5 " +
                      (active ? "text-accent-fg" : "text-fg-2 hover:text-fg")
                    }
                  >
                    {active && (
                      <m.span
                        aria-hidden="true"
                        layoutId="topnav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-accent shadow-glow"
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30 
                        }}
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
            <MagneticButton
              aria-label="Search the catalogue"
              className="mr-1.5 grid h-9 w-9 place-items-center rounded-full bg-fg/8 text-fg-2 transition-[background-color,color] duration-normal ease-out hover:bg-fg/12 hover:text-fg active:scale-95 active:duration-fast"
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
            </MagneticButton>
          </Hint>

          <Hint label="Account">
            <MagneticButton
              aria-label="Account"
              className="mr-1.5 grid h-9 w-9 place-items-center rounded-full bg-fg/8 text-fg-2 transition-[background-color,color] duration-normal ease-out hover:bg-fg/12 hover:text-fg active:scale-95 active:duration-fast"
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
            </MagneticButton>
          </Hint>
        </m.nav>
      </m.header>
    </AnimatePresence>
  );
}
