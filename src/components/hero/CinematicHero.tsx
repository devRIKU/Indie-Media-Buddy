"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import type { FeaturedHeroItem } from "@/lib/types";
import { formatViews } from "@/lib/format";
import ProgressiveBlur from "@/components/ui/ProgressiveBlur";
import MagneticButton from "@/components/ui/MagneticButton";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * CinematicHero — Editorial Split layout (Vanguard 3.B.3).
 *
 * v2 minimal redesign:
 *   • Eyebrow / tagline / title / meta / prose / CTAs reveal in sequence.
 *   • The display headline uses Anime.js for a per-word, blur+translate
 *     stagger on first paint and on every active-slide change. The rest of
 *     the column uses CSS transitions keyed off a `data-state` attribute.
 *   • Carousel auto-rotates every 9s, pauses on hover / focus / reduced motion.
 *   • On the left column, the `md:pl-[68px]` from v1 is gone — the sidebar
 *     is removed in the v2 minimal redesign.
 */
export default function CinematicHero({ items }: { items: FeaturedHeroItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  // Carousel autoplay
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused || items.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 9000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  // Anime.js reveal — fires on mount AND whenever the active slide changes.
  // We use a `data-reveal` attribute as the trigger selector so the same
  // targets animate twice (mount: stagger 60ms / slide change: 40ms).
  useEffect(() => {
    const el = stackRef.current;
    const title = titleRef.current;
    if (!el || !title) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.setAttribute("data-revealed", "1");
      return;
    }

    el.setAttribute("data-revealed", "0");

    // Initial mount uses a slightly longer stagger; subsequent slide changes
    // use a snappier one so the user feels a deliberate re-entry, not a lag.
    const isFirst = active === 0;
    const delayStep = isFirst ? 70 : 38;

    // Word-level stagger for the display headline. We slice on spaces so we
    // don't break mid-word on narrow viewports.
    const words = Array.from(title.querySelectorAll<HTMLSpanElement>("[data-word]"));
    anime({
      targets: words,
      opacity: [0, 1],
      translateY: [18, 0],
      filter: ["blur(6px)", "blur(0px)"],
      delay: anime.stagger(delayStep),
      duration: 850,
      easing: "cubicBezier(0.22, 1, 0.36, 1)",
    });

    // Rest of the column: opacity + translate + blur in sequence.
    const siblings = el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-word])");
    anime({
      targets: siblings,
      opacity: [0, 1],
      translateY: [14, 0],
      filter: ["blur(6px)", "blur(0px)"],
      delay: anime.stagger(delayStep, { start: 80 }),
      duration: 750,
      easing: "cubicBezier(0.22, 1, 0.36, 1)",
      complete: () => el.setAttribute("data-revealed", "1"),
    });
  }, [active]);

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
          Cross-fading stack of stills sits behind the left scrim so the
          page never feels like a flat card on cream. */}
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

      <ProgressiveBlur position="bottom" height={240} intensity="strong" className="z-[5]" />

      {/* ── Content grid ──────────────────────────────────────────────── */}
      <div
        ref={stackRef}
        data-revealed="0"
        className="relative z-10 grid h-full min-h-[100dvh] grid-cols-1 items-end gap-x-12 px-4 pb-24 pt-32 sm:px-8 md:grid-cols-12 md:items-center md:gap-x-16 md:px-12 md:pt-20"
      >
        {/* Left column — typography */}
        <div key={current.id} className="md:col-span-7 lg:col-span-7">
          <div data-reveal style={{ opacity: 0 }}>
            <Eyebrow variant="accent" className="mb-6">
              Editor&apos;s pick · {current.channelTitle}
            </Eyebrow>
          </div>

          <p
            data-reveal
            style={{ opacity: 0 }}
            className="mb-3 font-display text-lg font-medium italic leading-snug text-fg-2"
          >
            {current.tagline}
          </p>

          {/*
            Display headline — words are pre-split so Anime.js can stagger them
            per-word. The parent span provides opacity so the line stays
            readable if JS is delayed.
          */}
          <h1
            ref={titleRef}
            className="display max-w-display text-fg drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
            aria-label={current.title}
          >
            {(current.title ?? "").split(" ").map((word, i) => (
              <span
                key={`${current.id}-${i}`}
                data-word
                className="inline-block opacity-0"
                style={{ willChange: "transform, opacity, filter" }}
              >
                {word}
                {i < (current.title ?? "").split(" ").length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h1>

          <div
            data-reveal
            style={{ opacity: 0 }}
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-fg-2 meta"
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
            data-reveal
            style={{ opacity: 0 }}
            className="prose mt-6 line-clamp-3 text-fg-2"
          >
            {current.description}
          </p>

          <div
            data-reveal
            style={{ opacity: 0 }}
            className="mt-9 flex flex-wrap items-center gap-3"
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

        {/* Right column — double-bezel preview */}
        <div className="relative hidden md:col-span-5 md:block">
          <DoubleBezelPreview items={items} active={active} />

          {/* Indicator strip */}
          <div className="mt-6 flex items-center justify-center gap-2.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                aria-label={`Featured ${i + 1}: ${item.title}`}
                aria-current={i === active ? "true" : undefined}
                className={
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
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
function DoubleBezelPreview({
  items,
  active,
}: {
  items: FeaturedHeroItem[];
  active: number;
}) {
  return (
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
