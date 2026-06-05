"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    href: "/category/shows",
    label: "Shows",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 18v3" />
      </>
    ),
  },
  {
    href: "/category/movies",
    label: "Films",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" />
      </>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
  },
  {
    href: "/my-list",
    label: "My List",
    icon: <path d="M5 5h14v16l-7-4-7 4z" />,
  },
];

/**
 * MobileBottomNav — floating bottom pill, mobile + tablet only (<md).
 *
 *   • Detached glassy capsule pinned to the bottom of the viewport.
 *   • Five icon-only slots; active slot gets a soft amber fill + accent dot.
 *   • Framer Motion: entrance (slide-up + blur) + shared layoutId morph
 *     between tabs.
 *   • `aria-label` on each Link provides the accessible name (no JS tooltip).
 *   • One radius (rounded-full) — no irregular pill shape.
 *   • Press feedback uses scale(0.9) at 130ms — under Emil's 160ms ceiling.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <m.nav
      key="mobile-bottom-nav"
      aria-label="Primary"
      initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      className="glass-nav fixed inset-x-0 z-30 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center justify-center rounded-full px-1.5 py-1.5 md:hidden"
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        boxShadow:
          "inset 0 1px 0 rgba(229, 226, 225, 0.08)," +
          " inset 0 0 0 1px rgba(229, 226, 225, 0.06)," +
          " 0 16px 40px -16px rgba(22, 20, 20, 0.7)",
      }}
    >
      <ul className="flex items-center gap-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="relative block focus:outline-none"
              >
                <m.span
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.13, ease: [0.23, 1, 0.32, 1] }}
                  className={
                    "relative grid h-11 w-11 place-items-center rounded-full " +
                    "transition-colors duration-hover ease-ui " +
                    (active
                      ? "text-accent-fg"
                      : "text-fg-2 hover:text-fg")
                  }
                >
                  {active && (
                    <m.span
                      aria-hidden="true"
                      layoutId="mobilenav-active"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative h-[18px] w-[18px]"
                  >
                    {item.icon}
                  </svg>
                </m.span>
                {active && (
                  <m.span
                    aria-hidden="true"
                    layoutId="mobilenav-dot"
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </m.nav>
  );
}
