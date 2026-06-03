"use client";

import Link from "next/link";
import type { VideoItem } from "@/lib/types";
import { formatViews, formatDate } from "@/lib/format";

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
      className={[
        "group block w-[300px] flex-shrink-0 sm:w-[340px]",
        "transition-transform duration-lift ease-ui will-change-transform",
        "hover:-translate-y-0.5",
        "active:translate-y-0 active:duration-press active:ease-press",
      ].join(" ")}
    >
      {/* OUTER SHELL */}
      <div
        className={[
          "relative aspect-video overflow-hidden p-1.5 ring-1 ring-fg/8 shadow-card",
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
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-image ease-reveal group-hover:scale-[1.04]"
          />

          {video.duration && (
            <div className="meta absolute bottom-2 right-2 rounded-full border border-fg/15 bg-bg/70 px-2 py-0.5 text-[10px] font-medium text-fg backdrop-blur-md">
              {video.duration}
            </div>
          )}

          {/* Hover play — split bg-tint and pill into separate transitions */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-bg/0 opacity-0 transition-[opacity,background-color] duration-hover ease-ui group-hover:bg-bg/30 group-hover:opacity-100">
            <span
              className={[
                "grid h-12 w-12 place-items-center rounded-full bg-fg/95 shadow-card-hover",
                "scale-[0.95] transition-transform duration-lift ease-ui",
                "group-hover:scale-100",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5 fill-bg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>

          {progress != null && (
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-fg/15">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="card-title line-clamp-2 text-fg transition-colors duration-hover ease-ui group-hover:text-accent">
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
          {video.publishedAt && (
            <>
              <span className="text-faint">·</span>
              <span>{formatDate(video.publishedAt)}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
