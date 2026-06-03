/**
 * YouTube Data API v3 wrapper — server-side only.
 *
 * Set YOUTUBE_API_KEY in .env.local to enable live mode.
 * Without a key, the app falls back to the curated mock-data.
 *
 * Quota notes:
 *   - search.list costs 100 units/call → most expensive
 *   - videos.list costs 1 unit/call (batched up to 50 ids)
 *   - channels.list costs 1 unit/call
 *   Daily quota is 10,000 units → ~80 search calls or ~10,000 video lookups.
 *   We aggressively cache (Next.js ISR + in-memory) to stay well under.
 */
import type { VideoItem, Channel } from "./types";

const KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

export function isLiveMode() {
  return Boolean(KEY);
}

/* ──────────────────────────────────────────────────────────────────────── */
/* In-memory cache — process-wide, survives across requests in dev + prod.  */
/*                                                                          */
/* Next.js's built-in fetch cache (revalidate) covers most cases, but for   */
/* hot paths (rail data on the home page) we add a second tier so we don't  */
/* even round-trip Next.js's cache when we just served the same key 30s ago.*/
/* ──────────────────────────────────────────────────────────────────────── */
type CacheEntry<T> = { value: T; expires: number };
const memCache = new Map<string, CacheEntry<unknown>>();
const MEM_TTL_MS = 5 * 60 * 1000; // 5 minutes

function memGet<T>(key: string): T | undefined {
  const hit = memCache.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    memCache.delete(key);
    return undefined;
  }
  return hit.value as T;
}
function memSet<T>(key: string, value: T, ttl = MEM_TTL_MS) {
  memCache.set(key, { value, expires: Date.now() + ttl });
}

/* ──────────────────────────────────────────────────────────────────────── */
/* YouTube response shapes                                                   */
/* ──────────────────────────────────────────────────────────────────────── */
type YTSearchItem = {
  id: { videoId?: string; channelId?: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: Record<string, { url: string }>;
    tags?: string[];
  };
};

type YTVideoItem = {
  id: string;
  snippet: YTSearchItem["snippet"];
  contentDetails: { duration: string };
  statistics: { viewCount: string; likeCount?: string };
};

type YTChannelItem = {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails: Record<string, { url: string }>;
  };
  statistics: { subscriberCount?: string; videoCount?: string };
  brandingSettings?: {
    image?: { bannerExternalUrl?: string };
  };
};

/* ──────────────────────────────────────────────────────────────────────── */
/* helpers                                                                   */
/* ──────────────────────────────────────────────────────────────────────── */
function parseISODuration(iso: string): { seconds: number; pretty: string } {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!m) return { seconds: 0, pretty: "" };
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  const seconds = h * 3600 + min * 60 + s;
  const pad = (n: number) => (n < 10 ? "0" + n : String(n));
  const pretty = h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
  return { seconds, pretty };
}

function bestThumbnail(thumbnails: Record<string, { url: string }>) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
}

function mapVideo(v: YTVideoItem): VideoItem {
  const { seconds, pretty } = parseISODuration(v.contentDetails.duration);
  return {
    id: v.id,
    title: v.snippet.title,
    description: v.snippet.description,
    channelId: v.snippet.channelId,
    channelTitle: v.snippet.channelTitle,
    publishedAt: v.snippet.publishedAt,
    duration: pretty,
    durationSeconds: seconds,
    viewCount: parseInt(v.statistics.viewCount || "0", 10),
    likeCount: v.statistics.likeCount ? parseInt(v.statistics.likeCount, 10) : undefined,
    thumbnail: bestThumbnail(v.snippet.thumbnails),
    backdrop: bestThumbnail(v.snippet.thumbnails),
    tags: v.snippet.tags?.slice(0, 4),
  };
}

async function ytFetch<T>(url: string, ttlMs: number = MEM_TTL_MS): Promise<T | undefined> {
  const cacheKey = url;
  const hit = memGet<T>(cacheKey);
  if (hit) return hit;

  const res = await fetch(url, {
    next: { revalidate: Math.floor(ttlMs / 1000) },
  });
  if (!res.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[youtube] ${res.status} ${res.statusText} for ${url}`);
    }
    return undefined;
  }
  const data = (await res.json()) as T;
  memSet(cacheKey, data, ttlMs);
  return data;
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Public API                                                                */
/* ──────────────────────────────────────────────────────────────────────── */

/** Get latest videos for a list of channels. Backs the editorial rails. */
export async function getLatestFromChannels(
  channelIds: string[],
  perChannel = 4
): Promise<VideoItem[]> {
  if (!KEY) return [];

  const searchResults = await Promise.all(
    channelIds.map(async (cid) => {
      const url =
        `${BASE}/search?key=${KEY}&channelId=${cid}` +
        `&part=snippet&order=date&type=video&maxResults=${perChannel}`;
      const data = await ytFetch<{ items: YTSearchItem[] }>(url, 60 * 60 * 1000);
      return data?.items ?? [];
    })
  );

  const ids: string[] = [];
  for (const arr of searchResults) {
    for (const item of arr) if (item.id.videoId) ids.push(item.id.videoId);
  }
  if (ids.length === 0) return [];

  return getVideosByIds(ids);
}

export async function getVideoById(id: string): Promise<VideoItem | undefined> {
  if (!KEY) return undefined;
  const url = `${BASE}/videos?key=${KEY}&id=${id}&part=snippet,contentDetails,statistics`;
  const data = await ytFetch<{ items: YTVideoItem[] }>(url, 60 * 60 * 1000);
  const v = data?.items?.[0];
  return v ? mapVideo(v) : undefined;
}

export async function getVideosByIds(ids: string[]): Promise<VideoItem[]> {
  if (!KEY || ids.length === 0) return [];
  // YouTube allows up to 50 ids per call. Chunk if needed.
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const url =
        `${BASE}/videos?key=${KEY}&id=${chunk.join(",")}` +
        `&part=snippet,contentDetails,statistics`;
      const data = await ytFetch<{ items: YTVideoItem[] }>(url, 60 * 60 * 1000);
      return data?.items ?? [];
    })
  );
  return results.flat().map(mapVideo);
}

export async function searchVideos(q: string, max = 24): Promise<VideoItem[]> {
  if (!KEY) return [];
  const url =
    `${BASE}/search?key=${KEY}&q=${encodeURIComponent(q)}` +
    `&part=snippet&type=video&maxResults=${max}&order=relevance`;
  const data = await ytFetch<{ items: YTSearchItem[] }>(url, 10 * 60 * 1000);
  const ids = (data?.items ?? []).map((i) => i.id.videoId).filter(Boolean) as string[];
  if (ids.length === 0) return [];
  return getVideosByIds(ids);
}

export async function getChannel(id: string): Promise<Channel | undefined> {
  if (!KEY) return undefined;
  const url = `${BASE}/channels?key=${KEY}&id=${id}&part=snippet,statistics,brandingSettings`;
  const data = await ytFetch<{ items: YTChannelItem[] }>(url, 12 * 60 * 60 * 1000);
  const c = data?.items?.[0];
  if (!c) return undefined;
  return {
    id: c.id,
    title: c.snippet.title,
    handle: c.snippet.customUrl,
    description: c.snippet.description,
    thumbnail: bestThumbnail(c.snippet.thumbnails),
    subscribers: c.statistics.subscriberCount
      ? parseInt(c.statistics.subscriberCount, 10)
      : undefined,
  };
}

/** Latest videos for a single channel — used on the channel page. */
export async function getChannelVideos(channelId: string, max = 24): Promise<VideoItem[]> {
  if (!KEY) return [];
  const url =
    `${BASE}/search?key=${KEY}&channelId=${channelId}` +
    `&part=snippet&order=date&type=video&maxResults=${max}`;
  const data = await ytFetch<{ items: YTSearchItem[] }>(url, 60 * 60 * 1000);
  const ids = (data?.items ?? []).map((i) => i.id.videoId).filter(Boolean) as string[];
  if (ids.length === 0) return [];
  return getVideosByIds(ids);
}

export type { Channel };
