"use client";

import Link from "next/link";
import type { VideoItem } from "@/lib/types";
import { formatViews } from "@/lib/format";

/**
 * PosterCard — 2:3 vertical card.
 *
 * v3 minimal redesign — bounding-box contract:
 *   • One radius (rounded-lg = 1.25rem) for the outer shell.
 *   • Inner image well uses --bg (warm dark), NOT pure black.
 *   • No more stacked shadows on the outer shell — just a single hairline
 *     ring + a hover ring intensify. Less clutter.
 *   • Single meta row at the bottom (channel + views + duration) — title
 *     sits above as the primary content.
 *
 * Motion:
 *   • Card lifts 220ms ease-ui on hover, 130ms ease-press on :active.
 *   • Image scales 500ms ease-reveal on hover (filmic, slow on purpose).
 *   • Hover play pill pops from scale-95 to scale-100.
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
      {/* OUTER SHELL — single ring, no stacked shadow */}
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-fg/8 transition-[box-shadow,ring-color] duration-lift ease-ui group-hover:ring-fg/15"
        style={{
          background:
            "linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)",
        }}
      >
        {/* INNER CORE — image well, warm dark instead of pure black */}
        <div className="relative h-full w-full overflow-hidden bg-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-image ease-reveal group-hover:scale-[1.06]"
          />

          {/* Bottom legibility scrim — only as far as the title needs */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[55%]"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(19, 19, 19, 0.7) 60%, rgba(19, 19, 19, 0.95) 100%)",
            }}
          />

          {/* Rank pill (top-left) + duration (top-right) — single row */}
          <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
            {rank && rank <= 10 ? (
              <span className="eyebrow rounded-full border border-accent/30 bg-bg/70 px-2 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-md">
                #{rank}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            {video.duration && (
              <span className="meta rounded-full border border-fg/10 bg-bg/70 px-2 py-0.5 text-[10px] text-fg backdrop-blur-md">
                {video.duration}
              </span>
            )}
          </div>

          {/* Hover play overlay */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-hover ease-ui group-hover:opacity-100">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-fg/95 shadow-card-hover transition-transform duration-lift ease-ui group-hover:scale-100 scale-95">
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-bg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>

          {/* Title + channel meta */}
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
