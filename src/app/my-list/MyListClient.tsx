"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VideoCard from "@/components/shelf/VideoCard";
import { useMyList, useContinueWatching } from "@/lib/storage";
import type { VideoItem } from "@/lib/types";

/**
 * My List + Continue Watching. Both lists are local-only (localStorage). We
 * pass the ids to a tiny server route that resolves them to full VideoItems
 * (live or mock, depending on env).
 */
export default function MyListClient() {
  const { ids: savedIds, ready: savedReady, toggle } = useMyList();
  const { ids: resumeIds, ready: resumeReady } = useContinueWatching();

  const [saved, setSaved] = useState<VideoItem[]>([]);
  const [resume, setResume] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (!savedReady || savedIds.length === 0) {
      setSaved([]);
      return;
    }
    void fetch(`/api/videos?ids=${savedIds.join(",")}`)
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => setSaved(data.items ?? []));
  }, [savedIds, savedReady]);

  useEffect(() => {
    if (!resumeReady || resumeIds.length === 0) {
      setResume([]);
      return;
    }
    void fetch(`/api/videos?ids=${resumeIds.join(",")}`)
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((data) => setResume(data.items ?? []));
  }, [resumeIds, resumeReady]);

  const empty = savedReady && saved.length === 0 && resume.length === 0;

  return (
    <section className="px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[1240px]">
        <p className="eyebrow text-accent">Personal</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-heading">
          Your list
        </h1>

        {empty && (
          <div className="mt-12 rounded-xl border border-border bg-surface p-12 text-center">
            <p className="font-display text-lg font-medium">Nothing saved yet.</p>
            <p className="prose mx-auto mt-2 text-muted">
              Tap the <span className="text-fg">My List</span> button on any film to
              save it here. We&apos;ll also remember where you left off.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-[transform,background-color] hover:bg-accent-hover active:scale-[0.97] active:duration-press active:ease-press"
            >
              Browse the catalogue
            </Link>
          </div>
        )}

        {resume.length > 0 && (
          <>
            <h2 className="heading mt-12 text-fg">Continue watching</h2>
            <div
              className="mt-6 grid gap-x-5 gap-y-10"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {resume.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </>
        )}

        {saved.length > 0 && (
          <>
            <h2 className="heading mt-12 text-fg">Saved for later</h2>
            <div
              className="mt-6 grid gap-x-5 gap-y-10"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
            >
              {saved.map((v) => (
                <div key={v.id} className="group relative">
                  <VideoCard video={v} />
                  <button
                    onClick={() => toggle(v.id)}
                    aria-label="Remove from My List"
                    className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-bg/80 text-fg-2 opacity-0 backdrop-blur-md transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="h-4 w-4"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
