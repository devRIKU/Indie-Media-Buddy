"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    href: "/",
    label: "Home",
    icon: (
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
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
    href: "/category/science",
    label: "Science",
    icon: (
      <>
        <path d="M9 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19L15 9V3" />
        <path d="M8 3h8" />
      </>
    ),
  },
  {
    href: "/category/essays",
    label: "Essays",
    icon: (
      <>
        <path d="M4 4h12l4 4v12a0 0 0 0 1 0 0H4z" />
        <path d="M16 4v4h4M8 12h8M8 16h6" />
      </>
    ),
  },
  {
    href: "/my-list",
    label: "My List",
    icon: <path d="M5 5h14v16l-7-4-7 4z" />,
  },
];

export default function LeftRail() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[68px] flex-col items-center justify-between bg-bg/95 py-6 backdrop-blur-md before:absolute before:inset-y-0 before:right-0 before:w-px before:bg-border before:content-[''] md:flex">
      {/* Brand mark — solid accent, no gradient */}
      <Link href="/" aria-label="YouPlus home" className="block">
        <div className="grid h-9 w-9 place-items-center">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent" fill="currentColor">
            <path d="M12 2 13.6 9.4 21 11l-7.4 1.6L12 20l-1.6-7.4L3 11l7.4-1.6z" />
          </svg>
        </div>
      </Link>

      <nav className="flex flex-col items-center gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={
                "group relative grid h-11 w-11 place-items-center rounded-lg transition-colors duration-hover ease-ui " +
                (active
                  ? "bg-surface text-fg"
                  : "text-muted hover:bg-surface hover:text-fg")
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
              >
                {item.icon}
              </svg>
              {active && (
                <span className="absolute -left-[10px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent" />
              )}
              {/* tooltip — shows on hover AND focus-visible */}
              <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-fg opacity-0 shadow-lg transition-opacity duration-hover ease-ui group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Account button — person icon, not a fake "S" initial. No user is
          signed in (the app has no auth), so an initial would lie. */}
      <button
        aria-label="Account"
        className="grid h-10 w-10 place-items-center rounded-full bg-surface text-fg-2 ring-1 ring-border transition-[transform,background-color,color] duration-hover ease-ui hover:bg-surface-2 hover:text-fg active:scale-95 active:duration-press active:ease-press"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </button>
    </aside>
  );
}
