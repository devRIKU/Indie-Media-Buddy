"use client";

import { useRef, useState, useEffect } from "react";
import type { VideoItem } from "@/lib/types";
import PosterCard from "./PosterCard";
import VideoCard from "./VideoCard";
import ProgressiveBlur from "@/components/ui/ProgressiveBlur";
import { RailSkeleton } from "@/components/ui/Skeleton";

type RailProps = {
  title: string;
  subtitle?: string;
  videos: VideoItem[];
  style?: "poster" | "video";
  showRank?: boolean;
  loading?: boolean;
};

/**
 * Rail — Horizontal scrollable content rail.
 *
 * Polished design:
 *   • Refined header with better visual hierarchy
 *   • Smoother scroll arrows with spring animations
 *   • Better edge fades with progressive blur
 *   • Stagger reveal animation on scroll
 *
 * Design Spells:
 *   • Scroll arrows with magnetic hover
 *   • Smooth scroll snap with momentum
 */
export default function Rail({
  title,
  subtitle,
  videos,
  style = "poster",
  showRank = false,
  loading = false,
}: RailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [inView, setInView] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // Stagger reveal on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.85, 320);
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  if (loading) {
    return <RailSkeleton style={style} />;
  }

  if (videos.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={
        "group/rail relative py-6 transition-all duration-reveal ease-out will-change-transform " +
        (inView ? "translate-y-0 opacity-100 blur-none" : "translate-y-8 opacity-0 blur-[8px]")
      }
    >
      {/* Header — Polished: Better hierarchy */}
      <div className="mb-5 flex items-end justify-between gap-4 px-4 sm:px-6 md:px-8">
        <div className="min-w-0">
          <h2 className="heading text-fg">{title}</h2>
          {subtitle && (
            <p className="eyebrow mt-1.5 hidden max-w-[56ch] text-muted sm:block">
              {subtitle}
            </p>
          )}
        </div>
        <button className="eyebrow hidden shrink-0 text-muted transition-colors duration-normal ease-out hover:text-accent md:block">
          See all →
        </button>
      </div>

      <div className="relative">
        {/* Left arrow — Design Spell: Magnetic hover */}
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className={
            "absolute left-2 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-surface-2/90 text-fg shadow-md backdrop-blur-sm " +
            "transition-all duration-normal ease-out " +
            "hover:bg-surface-3 hover:shadow-lg hover:scale-105 active:scale-95 active:duration-fast " +
            (canScrollLeft
              ? "opacity-0 group-hover/rail:opacity-100"
              : "pointer-events-none opacity-0")
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className={
            "absolute right-2 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-surface-2/90 text-fg shadow-md backdrop-blur-sm " +
            "transition-all duration-normal ease-out " +
            "hover:bg-surface-3 hover:shadow-lg hover:scale-105 active:scale-95 active:duration-fast " +
            (canScrollRight
              ? "opacity-0 group-hover/rail:opacity-100"
              : "pointer-events-none opacity-0")
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Edge fades — Polished: Smoother progressive blur */}
        <ProgressiveBlur position="left"  width={80} intensity="subtle" className="z-10 hidden sm:block" />
        <ProgressiveBlur position="right" width={80} intensity="subtle" className="z-10 hidden sm:block" />

        {/* Scroll container */}
        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 md:px-8"
          style={{ scrollSnapType: "x proximity" }}
        >
          {videos.map((v, i) =>
            style === "poster" ? (
              <div key={v.id} style={{ scrollSnapAlign: "start" }}>
                <PosterCard video={v} rank={showRank ? i + 1 : undefined} />
              </div>
            ) : (
              <div key={v.id} style={{ scrollSnapAlign: "start" }}>
                <VideoCard video={v} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
