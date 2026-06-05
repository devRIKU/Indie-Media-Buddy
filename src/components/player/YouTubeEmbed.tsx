"use client";

import { useEffect, useRef, useState } from "react";
import { setProgress } from "@/lib/storage";

/**
 * YouTube IFrame embed with progress tracking.
 *
 * We load the IFrame Player API once globally, then poll currentTime every
 * 5 seconds while playing and persist into localStorage so the home page's
 * Continue Watching rail works.
 */

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLIFrameElement,
        opts: {
          events: {
            onReady?: (e: { target: YTPlayerInstance }) => void;
            onStateChange?: (e: { data: number; target: YTPlayerInstance }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayerInstance = {
  getCurrentTime: () => number;
  getDuration: () => number;
};

const API_SRC = "https://www.youtube.com/iframe_api";

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${API_SRC}"]`);
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = API_SRC;
      tag.async = true;
      document.head.appendChild(tag);
    }
    const check = () => {
      if (window.YT && window.YT.Player) resolve();
      else setTimeout(check, 50);
    };
    check();
  });
}

export default function YouTubeEmbed({
  videoId,
  autoplay = false,
}: {
  videoId: string;
  autoplay?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loaded, setLoaded] = useState(false);

  const src =
    `https://www.youtube.com/embed/${videoId}` +
    `?controls=1` +
    `&modestbranding=1` +
    `&rel=0` +
    `&showinfo=0` +
    `&iv_load_policy=3` +
    `&autoplay=${autoplay ? 1 : 0}` +
    `&enablejsapi=1`;

  useEffect(() => {
    setLoaded(true);
    let cancelled = false;

    loadYouTubeAPI().then(() => {
      if (cancelled || !iframeRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (e) => {
            // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
            if (e.data === 1) startPolling();
            else stopPolling();
            if (e.data === 0) {
              // ended — record full duration so the card doesn't show "resume"
              const d = e.target.getDuration();
              setProgress(videoId, d, d);
            }
          },
        },
      });
    });

    function startPolling() {
      if (pollRef.current) return;
      pollRef.current = setInterval(() => {
        const p = playerRef.current;
        if (!p) return;
        try {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (t > 0 && d > 0) setProgress(videoId, t, d);
        } catch {
          /* iframe gone */
        }
      }, 5000);
    }

    function stopPolling() {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [videoId]);

  return (
    <div className="video-wrapper">
      {/* Skeleton — matches the iframe's 16:9 silhouette so the shape never
          jumps. A faint accent indicator + a slow shimmer reads as "loading
          this specific thing" rather than "generic loading". */}
      {!loaded && (
        <div className="absolute inset-0 overflow-hidden bg-surface" aria-busy="true" aria-live="polite">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "linear-gradient(110deg, #1a1919 0%, #2a2929 50%, #1a1919 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.6s var(--ease-ui) infinite",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <span className="meta text-faint">Loading film…</span>
          </div>
          <style jsx>{`
            @keyframes shimmer {
              from { background-position: 200% 0; }
              to   { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
