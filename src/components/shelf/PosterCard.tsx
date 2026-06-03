"use client";

import Link from "next/link";
import type { VideoItem } from "@/lib/types";
import { formatViews } from "@/lib/format";

/**
 * PosterCard — 2:3 vertical card with double-bezel architecture.
 *
 * Motion choices (Emil-tier):
 *   - Outer link: transform lifts 220ms ease-ui on hover, 130ms ease-press
 *     on :active. Explicit transform-only — never animates colour with it.
 *   - Inner image: transform 500ms ease-reveal on hover. The slow zoom is
 *     intentional (filmic), not the same curve as the card lift.
 *   - Hover play pill: starts at scale-95 + opacity-0 (never scale-0). Pops
 *     in over 180/220ms — fast enough to feel responsive, slow enough to
 *     read as deliberate.
 *   - Shadow + ring: transition explicitly listed, 220ms.
 */
export default function PosterCard({
  video,
  rank,
}: {
  video: VideoItem;
  rank?: number;
}) {
  return (
    <Link
      href={`/watch/${video.id}`}
      aria-label={`Watch ${video.title}`}
      className={[
        "group relative block w-[180px] flex-shrink-0 sm:w-[200px] md:w-[220px]",
        "transition-transform duration-lift ease-ui will-change-transform",
        "hover:z-10 hover:scale-[1.045]",
        "active:scale-[1.02] active:duration-press active:ease-press",
      ].join(" ")}
    >
      {/* OUTER SHELL */}
      <div
        className={[
          "relative aspect-[2/3] overflow-hidden p-1.5 ring-1 ring-fg/8 shadow-card",
          "transition-[box-shadow,ring-color] duration-lift ease-ui",
          "group-hover:shadow-card-hover group-hover:ring-fg/15",
        ].join(" ")}
        style={{
          borderRadius: "1.25rem",
          background:
            "linear-gradient(160deg, oklch(from var(--surface) calc(l + 0.02) c h / 0.7), oklch(from var(--bg) l c h / 0.5))",
        }}
      >
        {/* INNER CORE */}
        <div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{
            borderRadius: "calc(1.25rem - 0.375rem)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-image ease-reveal group-hover:scale-[1.06]"
          />

          {/* Bottom legibility scrim */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[62%]"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, oklch(8% 0.02 55 / 0.6) 50%, oklch(8% 0.02 55 / 0.96) 100%)",
            }}
          />

          {/* Rank pill */}
          {rank && rank <= 10 && (
            <div className="eyebrow absolute right-2 top-2 rounded-full border border-accent/40 bg-bg/70 px-2 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-md">
              #{rank}
            </div>
          )}

          {/* Duration */}
          {video.duration && (
            <div className="meta absolute left-2 top-2 rounded-full border border-fg/15 bg-bg/70 px-2 py-0.5 text-[10px] text-fg backdrop-blur-md">
              {video.duration}
            </div>
          )}

          {/* Hover play overlay — opacity + transform animated separately */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-hover ease-ui group-hover:opacity-100">
            <span
              className={[
                "grid h-14 w-14 place-items-center rounded-full bg-fg/95 shadow-card-hover",
                "scale-[0.95] transition-transform duration-lift ease-ui",
                "group-hover:scale-100",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-bg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>

          {/* Title + channel */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="card-title line-clamp-2 text-fg">{video.title}</h3>
            <p className="meta mt-1.5 flex items-center gap-1.5 text-fg-2">
              <span className="truncate">{video.channelTitle}</span>
              {video.viewCount != null && (
                <>
                  <span className="text-faint">·</span>
                  <span>{formatViews(video.viewCount)}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
