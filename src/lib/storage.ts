"use client";

/**
 * Client-side persistence for personal state — view progress and saved items.
 *
 * Why localStorage: this is a single-user app per browser. No backend account
 * system exists, no account is needed. Watching where you left off is a
 * personal-device concept anyway (your phone shouldn't know your laptop's
 * scrub position).
 *
 * Schema is versioned so future migrations are clean.
 */

import { useEffect, useState, useCallback } from "react";

const PROGRESS_KEY = "youplus:v1:progress";
const MY_LIST_KEY  = "youplus:v1:my-list";

/* ──────────────────────────────────────────────────────────────────────── */
/* Continue Watching — { videoId: { seconds, durationSeconds, updatedAt }}  */
/* ──────────────────────────────────────────────────────────────────────── */
export type Progress = {
  seconds: number;
  durationSeconds: number;
  updatedAt: number;
};
export type ProgressMap = Record<string, Progress>;

function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeProgress(p: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // quota or private-mode failures — silent
  }
}

export function setProgress(videoId: string, seconds: number, durationSeconds: number) {
  const cur = readProgress();
  cur[videoId] = { seconds, durationSeconds, updatedAt: Date.now() };
  writeProgress(cur);
}

export function clearProgress(videoId: string) {
  const cur = readProgress();
  delete cur[videoId];
  writeProgress(cur);
}

/** Returns ids of videos with progress between 5%–95%, most-recent first. */
export function getContinueWatchingIds(limit = 12): string[] {
  const cur = readProgress();
  return Object.entries(cur)
    .filter(([, p]) => {
      if (!p.durationSeconds) return false;
      const pct = p.seconds / p.durationSeconds;
      return pct > 0.05 && pct < 0.95;
    })
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .slice(0, limit)
    .map(([id]) => id);
}

/* ──────────────────────────────────────────────────────────────────────── */
/* My List — ordered Set of videoIds                                         */
/* ──────────────────────────────────────────────────────────────────────── */
function readMyList(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MY_LIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeMyList(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function toggleMyList(videoId: string): boolean {
  const cur = readMyList();
  const idx = cur.indexOf(videoId);
  if (idx >= 0) {
    cur.splice(idx, 1);
    writeMyList(cur);
    return false; // removed
  } else {
    cur.unshift(videoId); // newest first
    writeMyList(cur);
    return true; // added
  }
}

export function inMyList(videoId: string): boolean {
  return readMyList().includes(videoId);
}

export function getMyList(): string[] {
  return readMyList();
}

/* ──────────────────────────────────────────────────────────────────────── */
/* React hooks                                                               */
/* ──────────────────────────────────────────────────────────────────────── */

/** Subscribe to My List changes. SSR-safe. */
export function useMyList() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(readMyList());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === MY_LIST_KEY) setIds(readMyList());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((videoId: string) => {
    toggleMyList(videoId);
    setIds(readMyList());
  }, []);

  const has = useCallback((videoId: string) => ids.includes(videoId), [ids]);

  return { ids, has, toggle, ready };
}

/** Subscribe to Continue Watching ids. */
export function useContinueWatching(limit = 12) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(getContinueWatchingIds(limit));
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_KEY) setIds(getContinueWatchingIds(limit));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [limit]);

  return { ids, ready };
}

/** Read a single video's progress (0..1). Useful for VideoCard resume bar. */
export function useVideoProgress(videoId: string): number | undefined {
  const [pct, setPct] = useState<number | undefined>(undefined);
  useEffect(() => {
    const p = readProgress()[videoId];
    if (p && p.durationSeconds) setPct(p.seconds / p.durationSeconds);
  }, [videoId]);
  return pct;
}
