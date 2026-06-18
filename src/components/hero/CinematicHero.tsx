"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import anime from "animejs";
import type { FeaturedHeroItem } from "@/lib/types";
import { formatViews } from "@/lib/format";
import ProgressiveBlur from "@/components/ui/ProgressiveBlur";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * CinematicHero — Editorial Split layout, redesigned with:
 *   • Huashu-design: Editorial authority, cinematic pacing
 *   • Design Spells: Stagger reveal, text blur-to-sharp, parallax depth
 *   • Distill: Simplified visual hierarchy, reduced noise
 *   • Polish: Refined spacing, consistent interactions
 */
export default function CinematicHero({ items }: { items: FeaturedHeroItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[active];

  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Carousel autoplay
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused || items.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % items.length), 9000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  // Parallax depth effect (Design Spell)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePosition({ x, y });
  }, []);

  // Anime.js reveal — staggered blur-to-sharp animation
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

    const isFirst = active === 0;
    const delayStep = isFirst ? 80 : 45;

    // Word-level stagger for the display headline
    const words = Array.from(title.querySelectorAll<HTMLSpanElement>("[data-word]"));
    anime({
      targets: words,
      opacity: [0, 1],
      translateY: [24, 0],
      filter: ["blur(10px)", "blur(0px)"],
      delay: anime.stagger(delayStep),
      duration: 900,
      easing: "cubicBezier(0.22, 1, 0.36, 1)",
    });

    // Rest of the column: opacity + translate + blur in sequence
    const siblings = el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-word])");
    anime({
      targets: siblings,
      opacity: [0, 1],
      translateY: [20, 0],
      filter: ["blur(8px)", "blur(0px)"],
      delay: anime.stagger(delayStep, { start: 100 }),
      duration: 800,
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
      onMouseMove={handleMouseMove}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* ── Backdrop layer with parallax depth (Design Spell) ────────── */}
      {items.map((item, i) => (
        <div
          key={item.id}
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-cinematic ease-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.backdrop ?? item.thumbnail}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
            className="hero-backdrop"
            style={{
              objectPosition: "center 30%",
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) scale(1.05)`,
            }}
          />
        </div>
      ))}

      {/* Editorial scrim — Distill: simplified gradient via CSS class */}
      <div aria-hidden="true" className="hero-scrim" />

      <ProgressiveBlur position="bottom" height={240} intensity="strong" className="z-[5]" />

      {/* ── Content grid ──────────────────────────────────────────────── */}
      <div
        ref={stackRef}
        data-revealed="0"
        className="relative z-10 grid h-full min-h-[100dvh] grid-cols-1 items-end gap-x-12 px-4 pb-24 pt-32 sm:px-8 md:grid-cols-12 md:items-center md:gap-x-16 md:px-12 md:pt-20 lg:gap-x-20"
      >
        {/* Left column — typography */}
        <div key={current.id} className="md:col-span-7 lg:col-span-7 xl:col-span-6">
              <div data-reveal className="reveal-item">
                <Eyebrow variant="accent" className="mb-6">
                  Editor&apos;s pick · {current.channelTitle}
                </Eyebrow>
              </div>

              <p
                data-reveal
                className="reveal-item mb-3 font-display text-lg font-medium italic leading-snug text-fg-2"
              >
                {current.tagline}
              </p>

              {/* Display headline — Design Spell: Stagger reveal */}
              <h1
                ref={titleRef}
                className="display max-w-display text-fg hero-headline"
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
            className="reveal-item mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-fg-2 meta"
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
                className="reveal-item prose mt-6 line-clamp-3 text-fg-2"
              >
                {current.description}
              </p>

              {/* CTAs — Design Spell: Magnetic hover effect */}
              <div
                data-reveal
                className="reveal-item mt-9 flex flex-wrap items-center gap-4"
              >
            <button
              onClick={() => window.location.href = `/watch/${current.id}`}
              className="hero-cta-primary group flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-all duration-normal ease-out hover:scale-[1.03] hover:shadow-glow active:scale-95 active:duration-fast"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current transition-transform duration-normal ease-out group-hover:scale-110">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch now
            </button>

            <button className="hero-cta-secondary flex items-center gap-2 rounded-lg bg-fg/8 px-6 py-3 text-sm font-semibold text-fg backdrop-blur-md ring-1 ring-fg/15 transition-all duration-normal ease-out hover:bg-fg/12 hover:ring-fg/25 hover:scale-[1.02] active:scale-95 active:duration-fast">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              My list
            </button>
          </div>
        </div>

        {/* Right column — double-bezel preview */}
        <div className="relative hidden md:col-span-5 md:block lg:col-span-6 xl:col-span-6">
          <DoubleBezelPreview items={items} active={active} mousePosition={mousePosition} />

          {/* Indicator strip */}
          <div className="mt-8 flex items-center justify-center gap-2.5" role="tablist" aria-label="Featured items">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                role="tab"
                aria-label={`Featured ${i + 1}: ${item.title}`}
                aria-selected={i === active}
                className="hero-indicator transition-all duration-normal ease-out"
                style={{
                  width: i === active ? "2rem" : "0.375rem",
                  backgroundColor: i === active ? "var(--accent)" : "rgba(235, 233, 232, 0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/**
 * DoubleBezelPreview — Design Spell: Parallax depth on hover
 */
function DoubleBezelPreview({
  items,
  active,
  mousePosition,
}: {
  items: FeaturedHeroItem[];
  active: number;
  mousePosition: { x: number; y: number };
}) {
  return (
    <div className="double-bezel-preview">
      <div className="double-bezel-inner">
        {items.map((item, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={item.thumbnail}
            alt={item.title}
            loading={i === 0 ? "eager" : "lazy"}
            className="double-bezel-image"
            style={{
              opacity: i === active ? 1 : 0,
              transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px) scale(1.08)`,
            }}
          />
        ))}
        <div aria-hidden="true" className="double-bezel-scrim" />
      </div>
    </div>
  );
}
