"use client";

import Link from "next/link";
import { useState } from "react";
import type { VideoItem } from "@/lib/types";
import YouTubeEmbed from "@/components/player/YouTubeEmbed";
import PlayerCover from "@/components/player/PlayerCover";
import { formatViews, formatDate } from "@/lib/format";
import { useMyList } from "@/lib/storage";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";

/**
 * WatchClient — single-film view.
 *
 *   • One radius scale: lg (cards), xl (player frame), full (pills).
 *   • Inner image wells use --bg (warm dark), never pure black.
 *   • Local ActionButton / PillLink replace the previous HeroUI Button.
 *   • The channel card's initial avatar sits inside an amber chip.
 *   • All action CTAs share the same ghost-pill + active-amber pattern.
 */
export default function WatchClient({
  video,
  related,
}: {
  video: VideoItem;
  related: VideoItem[];
}) {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const { has, toggle } = useMyList();
  const saved = has(video.id);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.backdrop ?? video.thumbnail}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-25 saturate-125"
          style={{ filter: "blur(80px)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, transparent 0%, rgba(19, 19, 19, 0.78) 80%), linear-gradient(180deg, rgba(19, 19, 19, 0.4) 0%, var(--bg) 70%)",
          }}
        />
      </div>

      <section className="px-4 pb-24 pt-32 sm:px-8">
        <div className="mx-auto max-w-[1240px]">
          <Reveal delay={0} y={32} blur={8}>
            <div
              className="relative overflow-hidden rounded-xl p-2 ring-1 ring-fg/10 shadow-player"
              style={{
                background:
                  "linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)",
              }}
            >
              <div
                className="relative aspect-video w-full overflow-hidden rounded-lg"
                style={{
                  background: "var(--bg)",
                  boxShadow:
                    "inset 0 1px 1px rgba(255,255,255,0.06)",
                }}
              >
                {playing ? (
                  <YouTubeEmbed videoId={video.id} autoplay />
                ) : (
                  <PlayerCover video={video} onPlay={() => setPlaying(true)} />
                )}
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <Reveal delay={80}>
                <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
                  <div className="min-w-0">
                    <Eyebrow variant="quiet" className="mb-3">
                      Now watching
                    </Eyebrow>
                    <h1 className="font-display text-2xl font-semibold leading-tight tracking-heading text-fg sm:text-[2.25rem]">
                      {video.title}
                    </h1>
                    <div className="meta mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                      <span>{formatViews(video.viewCount)} views</span>
                      <span className="text-faint">·</span>
                      <span>{formatDate(video.publishedAt)}</span>
                      {video.duration && (
                        <>
                          <span className="text-faint">·</span>
                          <span>{video.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <ActionButton
                      active={liked}
                      onClick={() => setLiked((l) => !l)}
                      activeLabel="Liked"
                      inactiveLabel="Like"
                      icon={
                        <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M7 14V5a2 2 0 0 1 2-2h2l3 7v4a2 2 0 0 1-2 2H8a1 1 0 0 1-1-1z" />
                          <path d="M3 10v8a2 2 0 0 0 2 2h2" />
                        </svg>
                      }
                    />
                    <ActionButton
                      active={saved}
                      onClick={() => toggle(video.id)}
                      activeLabel="Saved"
                      inactiveLabel="Save"
                      icon={
                        <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M5 5h14v16l-7-4-7 4z" />
                        </svg>
                      }
                    />
                    <PillLink
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
                        </svg>
                      }
                    >
                      YouTube
                    </PillLink>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div
                  className="relative rounded-lg p-1.5 ring-1 ring-fg/8"
                  style={{
                    background:
                      "linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)",
                  }}
                >
                  <div
                    className="flex items-center gap-4 rounded-md bg-surface/60 p-4"
                    style={{
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    <Link
                      href={`/channel/${video.channelId}`}
                      aria-label={`${video.channelTitle} creator page`}
                      className="grid h-14 w-14 shrink-0 place-items-center bg-accent font-display text-xl font-semibold text-accent-fg transition-transform duration-lift ease-ui hover:scale-[1.05] active:scale-100 active:duration-press active:ease-press rounded-lg"
                    >
                      {video.channelTitle.charAt(0)}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/channel/${video.channelId}`}
                        className="font-display text-lg font-semibold tracking-heading text-fg transition-colors duration-hover ease-ui hover:text-accent"
                      >
                        {video.channelTitle}
                      </Link>
                      <p className="meta mt-0.5 text-muted">
                        Curated on YouPlus
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Follow this channel"
                      className="group inline-flex h-9 items-center gap-2 rounded-full bg-fg px-4 font-semibold text-bg transition-transform duration-lift ease-ui hover:scale-[1.03] active:scale-100 active:duration-press active:ease-press"
                    >
                      <span>Follow</span>
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-bg/10 transition-transform duration-lift ease-ui group-hover:translate-x-0.5 group-hover:-translate-y-px">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3 w-3">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={240}>
                <div
                  className="mt-6 rounded-lg p-1.5 ring-1 ring-fg/8"
                  style={{
                    background:
                      "linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)",
                  }}
                >
                  <div
                    className="rounded-md bg-surface/60 p-7"
                    style={{
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    <Eyebrow variant="accent" className="mb-4">About this film</Eyebrow>
                    <p className="prose text-fg-2">
                      {video.description ?? "No description provided."}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <aside>
              <Reveal delay={320}>
                <h2 className="eyebrow mb-5 text-muted">More to watch</h2>
                <div className="flex flex-col gap-5">
                  {related.map((v, i) => (
                    <Reveal key={v.id} delay={360 + i * 60} y={16} blur={4}>
                      <Link
                        href={`/watch/${v.id}`}
                        className="group grid grid-cols-[168px_1fr] gap-3 transition-transform duration-lift ease-ui hover:-translate-y-0.5 active:translate-y-0 active:duration-press active:ease-press"
                      >
                        <div
                          className="relative overflow-hidden rounded-md ring-1 ring-fg/8"
                          style={{
                            background:
                              "linear-gradient(160deg, var(--surface-2) 0%, var(--bg) 100%)",
                          }}
                        >
                          <div
                            className="relative aspect-video w-full overflow-hidden rounded-sm"
                            style={{
                              background: "var(--bg)",
                              boxShadow:
                                "inset 0 1px 1px rgba(255,255,255,0.06)",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={v.thumbnail}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-image ease-reveal group-hover:scale-[1.05]"
                            />
                            {v.duration && (
                              <span className="meta absolute bottom-1.5 right-1.5 rounded-full border border-fg/10 bg-bg/70 px-2 py-0.5 text-[10px] text-fg backdrop-blur-md">
                                {v.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 self-center">
                          <h3 className="card-title line-clamp-2 text-fg transition-colors duration-hover ease-ui group-hover:text-accent">
                            {v.title}
                          </h3>
                          <p className="meta mt-1.5 text-muted">
                            {v.channelTitle} · {formatViews(v.viewCount)} views
                          </p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Local primitives — replace the previous HeroUI Button + Tooltip duo     */
/* ─────────────────────────────────────────────────────────────────────── */

function ActionButton({
  active,
  onClick,
  activeLabel,
  inactiveLabel,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  activeLabel: string;
  inactiveLabel: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[transform,background-color,color,box-shadow] duration-hover ease-ui active:scale-95 active:duration-press active:ease-press " +
        (active
          ? "bg-accent-soft text-accent ring-1 ring-accent/40"
          : "bg-surface text-fg-2 ring-1 ring-border hover:bg-surface-2 hover:text-fg")
      }
    >
      {icon}
      <span>{active ? activeLabel : inactiveLabel}</span>
    </button>
  );
}

function PillLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-fg-2 ring-1 ring-border transition-[transform,background-color,color] duration-hover ease-ui hover:bg-surface-2 hover:text-fg active:scale-95 active:duration-press active:ease-press"
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}
