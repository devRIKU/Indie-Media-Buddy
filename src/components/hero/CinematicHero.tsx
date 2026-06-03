"use client";

import { useEffect, useRef, useState } from "react";
import type { FeaturedHeroItem } from "@/lib/types";
import { formatViews } from "@/lib/format";
import ProgressiveBlur from "@/components/ui/ProgressiveBlur";
import MagneticButton from "@/components/ui/MagneticButton";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * CinematicHero — Editorial Split layout (Vanguard 3.B.3).
 *
 * Left column: massive display type, eyebrow tag, kicker, meta, prose, CTAs.
 * Right column: a double-bezel framed preview of the active item — the still
 * sits like a glass plate in an aluminum tray, with a hairline outer shell
 * and an inner highlight (Section 4.A).
 *
 * Background: the active still, cross-faded, *also* fills the left side at
 * low opacity behind the scrim so the page reads cinematic rather than
 * boxed-off.
 *
 * Carousel auto-rotates every 9s, pauses on hover / focus / reduced motion.
 */
export default function CinematicHero({ items }: { items: FeaturedHeroItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused || items.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 9000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (!current) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Featured films"
      className="relative min-h-[100dvh] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* ── Backdrop layer ───────────────────────────────────────────────
          Cross-fading stack of stills, sits *behind* the left scrim so the
          page never feels like a flat card on cream. The active still also
          drives the right-side double-bezel preview. */}
      {items.map((item, i) => (
        <div
          key={item.id}
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.backdrop ?? item.thumbnail}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            // @ts-expect-error — fetchpriority is valid HTML
            fetchpriority={i === 0 ? "high" : undefined}
            className="h-full w-full object-cover"
            style={{
              objectPosition: "center 30%",
            }}
          />
        </div>
      ))}

      {/* Left-side dark scrim (Editorial Split readability) */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, " +
              "oklch(from var(--bg) l c h / 0.98) 0%, " +
              "oklch(from var(--bg) l c h / 0.92) 28%, " +
              "oklch(from var(--bg) l c h / 0.72) 48%, " +
              "oklch(from var(--bg) l c h / 0.25) 70%, " +
              "transparent 92%" +
            "), " +
            "linear-gradient(180deg, transparent 55%, oklch(from var(--bg) l c h / 0.6) 85%, var(--bg) 100%)",
        }}
      />

      {/* Progressive blur band along the bottom so the hero dissolves into rails below */}
      <ProgressiveBlur position="bottom" height={240} intensity="strong" className="z-[5]" />

      {/* ── Content grid ────────────────────────────────────────────────
          Below md: full-width column (mobile collapse per Vanguard rules).
          md+: 7/12 left typography, 5/12 right poster preview. */}
      <div
        className="relative z-10 grid h-full min-h-[100dvh] grid-cols-1 items-end gap-x-12 px-4 pb-24 pt-32 sm:px-8 md:grid-cols-12 md:items-center md:gap-x-16 md:pl-[calc(68px+48px)] md:pr-12 md:pt-20"
      >
        {/* Left column — typography */}
        <div key={current.id} className="md:col-span-7 lg:col-span-7">
          <div
            className="opacity-0 translate-y-4 blur-md animate-[heroin_900ms_cubic-bezier(0.22,1,0.36,1)_forwards]"
          >
            <Eyebrow variant="accent" className="mb-6">
              Editor&apos;s pick · {current.channelTitle}
            </Eyebrow>
          </div>

          <p
            className="mb-3 font-display text-lg font-medium italic leading-snug text-fg-2 opacity-0 translate-y-4 blur-md animate-[heroin_900ms_cubic-bezier(0.22,1,0.36,1)_60ms_forwards]"
          >
            {current.tagline}
          </p>

          <h1
            className="display max-w-display text-fg drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)] opacity-0 translate-y-4 blur-md animate-[heroin_1000ms_cubic-bezier(0.22,1,0.36,1)_120ms_forwards]"
          >
            {current.title}
          </h1>

          <div
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-fg-2 meta opacity-0 translate-y-4 animate-[heroin_900ms_cubic-bezier(0.22,1,0.36,1)_220ms_forwards]"
          >
            <span>{new Date(current.publishedAt).getFullYear()}</span>
            <span className="text-faint">·</span>
            <span>{current.duration}</span>
            <span className="text-faint">·</span>
            <span>{formatViews(current.viewCount)} views</span>
            {current.tags?.slice(0, 2).map((t) => (
              <span key={t + "-grp"} className="contents">
                <span className="text-faint">·</span>
                <span className="uppercase tracking-eyebrow">{t}</span>
              </span>
            ))}
          </div>

          <p
            className="prose mt-6 line-clamp-3 text-fg-2 opacity-0 translate-y-4 animate-[heroin_900ms_cubic-bezier(0.22,1,0.36,1)_300ms_forwards]"
          >
            {current.description}
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-3 opacity-0 translate-y-4 animate-[heroin_900ms_cubic-bezier(0.22,1,0.36,1)_380ms_forwards]"
          >
            <MagneticButton
              href={`/watch/${current.id}`}
              variant="primary"
              leading={
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-fg/15">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 translate-x-0.5 fill-current">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              }
            >
              Watch now
            </MagneticButton>
            <MagneticButton
              variant="secondary"
              leading={
                <span className="grid h-9 w-9 place-items-center rounded-full bg-fg/8">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              }
              trailing={null as never}
            >
              My list
            </MagneticButton>
          </div>
        </div>

        {/* Right column — double-bezel preview ─────────────────────────
            Outer shell (machined-aluminum tray): hairline ring, faint bg,
            small padding, larger radius. Inner core (glass plate): the still,
            its own radius mathematically smaller (calc-based concentric).
            Hidden below md — on phones the backdrop *is* the preview. */}
        <div className="relative hidden md:col-span-5 md:block">
          <DoubleBezelPreview items={items} active={active} />

          {/* Indicator strip — small dots tied to active state */}
          <div className="mt-6 flex items-center justify-center gap-2.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                aria-label={`Featured ${i + 1}: ${item.title}`}
                aria-current={i === active ? "true" : undefined}
                className={
                  // Width grow uses ease-press (strong out-curve) at 240ms;
                  // background-color is faster (180ms) so it doesn't fight
                  // the width animation visually.
                  "h-1.5 rounded-full transition-[width,background-color] duration-nav ease-press " +
                  (i === active
                    ? "w-8 bg-accent"
                    : "w-1.5 bg-fg/25 hover:bg-fg/45")
                }
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroin {
          from {
            opacity: 0;
            transform: translateY(16px);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Double-Bezel preview — outer shell + inner core, concentric radii        */
/* ─────────────────────────────────────────────────────────────────────── */
function DoubleBezelPreview({
  items,
  active,
}: {
  items: FeaturedHeroItem[];
  active: number;
}) {
  return (
    // OUTER SHELL — machined-aluminum tray
    <div
      className="relative aspect-[3/4] w-full overflow-hidden p-2 ring-1 ring-fg/10"
      style={{
        borderRadius: "2rem",
        background:
          "linear-gradient(160deg, oklch(from var(--surface) calc(l + 0.03) c h / 0.6), oklch(from var(--bg) l c h / 0.4))",
        boxShadow:
          "inset 0 1px 0 oklch(from var(--fg) l c h / 0.06), inset 0 -1px 0 oklch(from var(--bg) l c h / 0.5)",
      }}
    >
      {/* INNER CORE — the glass plate. Concentric radius via calc. */}
      <div
        className="relative h-full w-full overflow-hidden bg-black"
        style={{
          borderRadius: "calc(2rem - 0.5rem)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {items.map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={item.thumbnail}
            alt={item.title}
            loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        {/* Soft bottom shadow inside the plate */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background:
              "linear-gradient(180deg, transparent, oklch(8% 0.02 55 / 0.55))",
          }}
        />
      </div>
    </div>
  );
}
