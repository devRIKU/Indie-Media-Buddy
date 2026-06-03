"use client";

import type { VideoItem } from "@/lib/types";
import { formatViews, formatDate } from "@/lib/format";

export default function PlayerCover({
  video,
  onPlay,
}: {
  video: VideoItem;
  onPlay: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={video.backdrop ?? video.thumbnail}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, oklch(8% 0.02 55 / 0.92) 0%, oklch(8% 0.02 55 / 0.6) 45%, oklch(8% 0.02 55 / 0.15) 85%, transparent 100%), linear-gradient(180deg, transparent 50%, oklch(8% 0.02 55 / 0.7) 100%)",
        }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-bg/40 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="eyebrow text-fg-2">{video.channelTitle}</span>
        </span>
        <span className="meta rounded border border-fg/15 bg-bg/40 px-2.5 py-1 text-fg-2">
          {video.duration} · HD
        </span>
      </div>

      {/* Body */}
      <div className="max-w-heading">
        <p className="eyebrow mb-3 text-accent">Now playing</p>
        <h1 className="font-display text-2xl font-semibold leading-tight tracking-display text-fg">
          {video.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-2 meta">
          <span>{new Date(video.publishedAt).getFullYear()}</span>
          <span className="text-faint">·</span>
          <span>{formatViews(video.viewCount)} views</span>
          <span className="text-faint">·</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        {video.description && (
          <p className="prose mt-4 line-clamp-2 text-fg-2">
            {video.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={onPlay}
            className="inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold tracking-button text-accent-fg transition-[transform,background-color] hover:bg-accent-hover active:scale-[0.97] active:duration-press active:ease-press"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-0.5 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
          <button
            aria-label="Add to My List"
            className="grid h-12 w-12 place-items-center rounded-full border border-fg/15 bg-bg/40 text-fg transition-[transform,background-color] hover:bg-bg/60 active:scale-95 active:duration-press active:ease-press"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            aria-label="Like"
            className="grid h-12 w-12 place-items-center rounded-full border border-fg/15 bg-bg/40 text-fg transition-[transform,background-color] hover:bg-bg/60 active:scale-95 active:duration-press active:ease-press"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M7 14V5a2 2 0 0 1 2-2h2l3 7v4a2 2 0 0 1-2 2H8a1 1 0 0 1-1-1z" />
              <path d="M3 10v8a2 2 0 0 0 2 2h2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
