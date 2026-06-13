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
 * Redesigned with:
 *   • Refined glass morphism with subtle inner glow
 *   • Haptic-like press feedback (Design Spell)
 *   • Smoother spring animations for active indicator
 *   • Better visual hierarchy with refined spacing
 *   • Accessible touch targets (44px minimum)
 */
export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <m.nav
      key="mobile-bottom-nav"
      aria-label="Primary"
      initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="glass-nav fixed inset-x-0 z-30 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center justify-center rounded-full px-2 py-2 md:hidden"
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        boxShadow:
          "inset 0 1px 0 rgba(245, 240, 235, 0.1)," +
          " inset 0 0 0 1px rgba(245, 240, 235, 0.08)," +
          " 0 20px 50px -16px rgba(15, 14, 13, 0.8)",
      }}
    >
      <ul className="flex items-center gap-1">
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
                  whileTap={{ scale: 0.88 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 20 
                  }}
                  className={
                    "relative grid h-12 w-12 place-items-center rounded-full " +
                    "transition-colors duration-normal ease-out " +
                    (active
                      ? "text-accent-fg"
                      : "text-fg-2 hover:text-fg")
                  }
                >
                  {active && (
                    <m.span
                      aria-hidden="true"
                      layoutId="mobilenav-active"
                      className="absolute inset-0 rounded-full bg-accent shadow-glow"
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 28 
                      }}
                    />
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="relative h-5 w-5"
                  >
                    {item.icon}
                  </svg>
                </m.span>
                {active && (
                  <m.span
                    aria-hidden="true"
                    layoutId="mobilenav-dot"
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 15 
                    }}
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
