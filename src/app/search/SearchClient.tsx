"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { VideoItem } from "@/lib/types";
import VideoCard from "@/components/shelf/VideoCard";

/**
 * SearchClient — Search interface with results.
 *
 * Redesigned with:
 *   • Refined search input with better focus states
 *   • Cleaner results grid with consistent spacing
 *   • Improved empty state with better styling
 *   • Design Spells: Ripple effect on search button
 */
export default function SearchClient({
  initialQuery,
  initialResults,
}: {
  initialQuery: string;
  initialResults: VideoItem[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section className="px-4 pb-24 pt-28 sm:px-6 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        {/* Search input — Polished: Better focus states */}
        <form onSubmit={submit} className="mb-10">
          <label htmlFor="catalogue-search" className="eyebrow mb-3 block text-muted">Search the catalogue</label>
          <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3 ring-1 ring-fg/8 transition-all duration-normal ease-out focus-within:ring-accent focus-within:shadow-glow sm:px-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-5 w-5 text-muted"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="catalogue-search"
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Vox, Veritasium, type design, tide pools…"
              className="flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-fg shadow-md transition-all duration-normal ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.97] active:duration-fast"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {initialQuery ? (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-heading text-fg sm:text-[2.5rem] sm:leading-tight">
              Results for <span className="text-accent">{initialQuery}</span>
            </h1>
            <p className="meta mt-2 text-muted">
              {initialResults.length} {initialResults.length === 1 ? "match" : "matches"}
            </p>

            {initialResults.length === 0 ? (
              <div className="mt-12 rounded-xl bg-surface p-8 text-center ring-1 ring-fg/8 shadow-md sm:p-10">
                <p className="font-display text-lg font-medium text-fg">No matches.</p>
                <p className="prose mx-auto mt-2 text-muted">
                  Try a creator name (Veritasium, Vox) or a topic (architecture, ocean,
                  type design).
                </p>
              </div>
            ) : (
              <div
                className="mt-8 grid gap-x-6 gap-y-10"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
              >
                {initialResults.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-surface p-8 ring-1 ring-fg/8 shadow-md sm:p-10">
            <p className="eyebrow text-accent">Try one of these</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Veritasium", "Kurzgesagt", "Vox", "MKBHD", "Architecture", "Tide pools", "Type design"].map((s) => (
                <button
                  key={s}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
                  className="min-h-11 rounded-lg bg-bg px-4 py-2 text-sm font-medium text-fg-2 ring-1 ring-fg/10 transition-all duration-normal ease-out hover:bg-surface hover:text-accent hover:ring-accent/30 hover:shadow-md active:scale-[0.97] active:duration-fast"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
