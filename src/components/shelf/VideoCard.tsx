"use client";

import Link from "next/link";
import type { VideoItem } from "@/lib/types";
import { formatViews } from "@/lib/format";

/**
 * VideoCard — 16:9 horizontal card.
 *
 * Distilled design:
 *   • Simplified outer shell — single ring, no gradient background
 *   • Clean image well with subtle hover scale
 *   • Minimal meta row — channel + views only
 *   • Refined hover states with smooth transitions
 *
 * Design Spells:
 *   • Subtle tilt on hover (desktop only)
 *   • Play button with spring animation
 *   • Progress bar with pulse animation
 */
export default function VideoCard({
  video,
  progress,
}: {
  video: VideoItem;
  progress?: number;
}) {
  return (
    <Link
      href={`/watch/${video.id}`}
      aria-label={`Watch ${video.title}`}
      className="video-card-link group block w-[300px] flex-shrink-0 sm:w-[340px]"
    >
      {/* Card container */}
      <div className="video-card relative aspect-video overflow-hidden rounded-lg ring-1 ring-fg/8 transition-all duration-slow ease-out group-hover:ring-fg/15 group-hover:shadow-lg">
        {/* Image well — Distill: no gradient background, just clean dark */}
        <div className="relative h-full w-full overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="video-card-image absolute inset-0 h-full w-full object-cover transition-transform duration-cinematic ease-out group-hover:scale-[1.05]"
          />

          {/* Duration badge — simplified */}
          {video.duration && (
            <span className="video-card-duration meta absolute bottom-2 right-2 rounded-md bg-bg/80 px-2 py-0.5 text-[10px] font-medium text-fg backdrop-blur-sm">
              {video.duration}
            </span>
          )}

          {/* Hover play — Design Spell: Spring animation */}
          <div className="video-card-play pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-normal ease-out group-hover:opacity-100">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-fg/95 shadow-lg transition-transform duration-slow ease-out scale-90 group-hover:scale-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-bg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>

          {/* Progress bar — Design Spell: Pulse animation on active */}
          {progress != null && (
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-fg/10">
              <div
                className="h-full bg-accent transition-all duration-normal ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Meta — Distill: Simplified, cleaner hierarchy */}
      <div className="video-card-meta mt-3 px-1">
        <h3 className="card-title line-clamp-2 text-fg transition-colors duration-normal ease-out group-hover:text-accent">
          {video.title}
        </h3>
        <p className="meta mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted">
          <span className="truncate">{video.channelTitle}</span>
          {video.viewCount != null && (
            <>
              <span className="text-faint">·</span>
              <span>{formatViews(video.viewCount)} views</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
