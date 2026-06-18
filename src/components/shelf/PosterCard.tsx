"use client";

import Link from "next/link";
import type { VideoItem } from "@/lib/types";
import { formatViews } from "@/lib/format";

/**
 * PosterCard — 2:3 vertical card.
 *
 * Distilled design:
 *   • Simplified outer shell — clean ring, no gradient background
 *   • Clean image well with subtle hover scale
 *   • Minimal meta — title + channel only
 *   • Refined hover states with smooth transitions
 *
 * Design Spells:
 *   • Subtle scale on hover
 *   • Play button with spring animation
 *   • Rank badge with subtle glow
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
      className="poster-card-link group relative block w-[180px] flex-shrink-0 sm:w-[200px] md:w-[220px]"
    >
      {/* Card container — Distill: Simplified, no gradient background */}
      <div className="poster-card relative aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-fg/8 transition-all duration-slow ease-out group-hover:ring-fg/15 group-hover:shadow-xl">
        {/* Image well */}
        <div className="relative h-full w-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="poster-card-image absolute inset-0 h-full w-full object-cover transition-transform duration-cinematic ease-out group-hover:scale-[1.06]"
          />

          {/* Bottom scrim — simplified for legibility */}
          <div aria-hidden="true" className="poster-scrim" />

          {/* Badges — simplified, cleaner styling */}
          <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
            {rank && rank <= 10 ? (
              <span className="poster-rank eyebrow rounded-md bg-bg/80 px-2 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-sm shadow-glow">
                #{rank}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            {video.duration && (
              <span className="poster-duration meta rounded-md bg-bg/80 px-2 py-0.5 text-[10px] text-fg backdrop-blur-sm">
                {video.duration}
              </span>
            )}
          </div>

          {/* Hover play — Design Spell: Spring animation */}
          <div className="poster-card-play pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-normal ease-out group-hover:opacity-100">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-fg/95 shadow-xl transition-transform duration-slow ease-out scale-90 group-hover:scale-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-bg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>

          {/* Title + meta — Distill: Simplified */}
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
