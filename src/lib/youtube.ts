/**
 * YouTube Data API v3 wrapper — server-side only.
 *
 * Set YOUTUBE_API_KEY in .env.local to enable live mode.
 * Without a key, the app falls back to the curated mock-data.
 *
 * Channel-locked fetching:
 *   Every video returned by getLatestFromChannels() is fetched via the
 *   channel's uploads playlist — not search. This guarantees only videos
 *   from the requested channels appear. Each video's channelId is verified
 *   against the expected channel list before being returned.
 *
 * Quota budget (~44 units/day for 21 channels):
 *   - channels.list:       1 unit/call  × 21 = 21
 *   - playlistItems.list:  1 unit/call  × 21 = 21
 *   - videos.list:         1 unit/50ids      ≈ 2
 *   Free tier: 10,000 units/day → we use 0.4%.
 */
import type { VideoItem, Channel } from "./types";

const KEY = process.env.YOUTUBE_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

/** Minimum video duration in seconds. Anything shorter is a Short / clip. */
const MIN_DURATION_SECONDS = 60;

export function isLiveMode() {
  return Boolean(KEY);
}

/* ──────────────────────────────────────────────────────────────────────── */
/* In-memory cache — process-wide, survives across requests in dev + prod.  */
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
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: Record<string, { url: string }>;
    tags?: string[];
  };
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

type YTPlaylistItem = {
  snippet: {
    resourceId: { videoId: string };
    title: string;
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    thumbnails: Record<string, { url: string }>;
  };
};

type YTChannelContentDetails = {
  id: string;
  contentDetails: {
    relatedPlaylists: { uploads: string };
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
    likeCount: v.statistics.likeCount
      ? parseInt(v.statistics.likeCount, 10)
      : undefined,
    thumbnail: bestThumbnail(v.snippet.thumbnails),
    backdrop: bestThumbnail(v.snippet.thumbnails),
    tags: v.snippet.tags?.slice(0, 4),
  };
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Fetching with retry + cache                                              */
/* ──────────────────────────────────────────────────────────────────────── */
const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [1000, 2000];

async function ytFetch<T>(
  url: string,
  ttlMs: number = MEM_TTL_MS
): Promise<T | undefined> {
  const cacheKey = url;
  const hit = memGet<T>(cacheKey);
  if (hit) return hit;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: Math.floor(ttlMs / 1000) },
      });

      // Retry on 5xx
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        await delay(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      if (!res.ok) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[youtube] ${res.status} ${res.statusText} for ${url}`
          );
        }
        return undefined;
      }

      const data = (await res.json()) as T;
      memSet(cacheKey, data, ttlMs);
      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  if (process.env.NODE_ENV !== "production" && lastError) {
    console.warn(`[youtube] failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
  }
  return undefined;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Channel-locked fetching                                                   */
/* ──────────────────────────────────────────────────────────────────────── */

/**
 * Get the uploads playlist ID for a channel.
 * This is the channel's "Uploads" playlist — guaranteed to contain only
 * videos published by that channel.
 */
async function getChannelUploadsPlaylistId(
  channelId: string
): Promise<string | undefined> {
  const url =
    `${BASE}/channels?key=${KEY}&id=${channelId}` +
    `&part=contentDetails`;
  const data = await ytFetch<{ items: YTChannelContentDetails[] }>(
    url,
    24 * 60 * 60 * 1000 // cache 24h — playlist IDs don't change
  );
  return data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
}

/**
 * Get video IDs from a playlist's most recent items.
 * playlistItems.list costs 1 unit/call (vs 100 for search.list).
 */
async function getPlaylistVideoIds(
  playlistId: string,
  max: number
): Promise<string[]> {
  const url =
    `${BASE}/playlistItems?key=${KEY}&playlistId=${playlistId}` +
    `&part=snippet&maxResults=${max}`;
  const data = await ytFetch<{ items: YTPlaylistItem[] }>(
    url,
    60 * 60 * 1000 // 1h cache
  );
  return (data?.items ?? []).map((i) => i.snippet.resourceId.videoId);
}

/**
 * Safety check: verify that every video's channelId is in the expected set.
 * This is a belt-and-suspenders guarantee — even if the YouTube API returns
 * something unexpected, we never show a video from a non-premium channel.
 */
function verifyChannelOwnership(
  videos: VideoItem[],
  allowedChannelIds: Set<string>
): VideoItem[] {
  return videos.filter((v) => allowedChannelIds.has(v.channelId));
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Public API                                                                */
/* ──────────────────────────────────────────────────────────────────────── */

/**
 * Get latest videos for a list of channels — channel-locked.
 *
 * Fetches each channel's uploads playlist, then resolves full video metadata.
 * Results are filtered (no Shorts), verified (channelId check), and sorted
 * by viewCount descending.
 */
export async function getLatestFromChannels(
  channelIds: string[],
  perChannel = 4
): Promise<VideoItem[]> {
  if (!KEY || channelIds.length === 0) return [];

  const allowedSet = new Set(channelIds);

  // Step 1: Get uploads playlist IDs for all channels (1 unit/call, cached 24h)
  // Per-channel error isolation: one bad channel shouldn't kill the whole rail.
  type PlaylistRef = { channelId: string; playlistId: string };
  const playlistSettled = await Promise.allSettled(
    channelIds.map(async (cid): Promise<PlaylistRef | null> => {
      const pid = await getChannelUploadsPlaylistId(cid);
      return pid ? { channelId: cid, playlistId: pid } : null;
    })
  );
  const playlistIds: PlaylistRef[] = playlistSettled.flatMap((r, i) => {
    if (r.status === "fulfilled") {
      return r.value ? [r.value] : [];
    }
    console.warn(
      `[youtube] getChannelUploadsPlaylistId for ${channelIds[i]} failed: ${
        r.reason instanceof Error ? r.reason.message : String(r.reason)
      }`
    );
    return [];
  });

  // Step 2: Fetch video IDs from each playlist (1 unit/call)
  // We use allSettled here too — a failed playlist returns []. The fallback
  // for the request is handled by the caller (data.ts / API route).
  const allVideoIds: string[] = [];
  const idSettled = await Promise.allSettled(
    playlistIds.map((p) => getPlaylistVideoIds(p.playlistId, perChannel + 2))
  );
  idSettled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      allVideoIds.push(...r.value);
    } else {
      console.warn(
        `[youtube] getPlaylistVideoIds ${i} failed: ${
          r.reason instanceof Error ? r.reason.message : String(r.reason)
        }`
      );
    }
  });

  if (allVideoIds.length === 0) return [];

  // Step 3: Get full video metadata (1 unit per 50 IDs)
  const videos = await getVideosByIds(allVideoIds);

  // Step 4: Verify channel ownership — drop any video not from an allowed channel
  const owned = verifyChannelOwnership(videos, allowedSet);

  // Step 5: Filter out Shorts and sort by viewCount
  const filtered = owned
    .filter((v) => (v.durationSeconds ?? 0) >= MIN_DURATION_SECONDS)
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));

  return filtered;
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

  // Per-chunk error isolation: a single bad chunk (network blip, 5xx, etc.)
  // shouldn't nuke the whole list. We log + skip it and keep the rest.
  const settled = await Promise.allSettled(
    chunks.map(async (chunk) => {
      const url =
        `${BASE}/videos?key=${KEY}&id=${chunk.join(",")}` +
        `&part=snippet,contentDetails,statistics`;
      const data = await ytFetch<{ items: YTVideoItem[] }>(url, 60 * 60 * 1000);
      return data?.items ?? [];
    })
  );

  const flat: YTVideoItem[] = [];
  for (let i = 0; i < settled.length; i++) {
    const r = settled[i];
    if (r.status === "fulfilled") {
      flat.push(...r.value);
    } else {
      console.warn(
        `[youtube] getVideosByIds chunk ${i} failed: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`
      );
    }
  }
  return flat.map(mapVideo);
}

/**
 * Search videos — used only for the user-initiated Search page.
 * NOTE: This can return videos from any channel (not channel-locked).
 * The search page is the only place where open-ended discovery is intentional.
 */
export async function searchVideos(q: string, max = 24): Promise<VideoItem[]> {
  if (!KEY) return [];
  const url =
    `${BASE}/search?key=${KEY}&q=${encodeURIComponent(q)}` +
    `&part=snippet&type=video&maxResults=${max}&order=relevance`;
  const data = await ytFetch<{ items: YTSearchItem[] }>(url, 10 * 60 * 1000);
  const ids = (data?.items ?? [])
    .map((i) => i.id.videoId)
    .filter(Boolean) as string[];
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

/**
 * Latest videos for a single channel — used on the channel page.
 * Uses the channel-locked playlist approach.
 */
export async function getChannelVideos(
  channelId: string,
  max = 24
): Promise<VideoItem[]> {
  if (!KEY) return [];

  const playlistId = await getChannelUploadsPlaylistId(channelId);
  if (!playlistId) return [];

  const ids = await getPlaylistVideoIds(playlistId, max + 4); // extra for Shorts filtering
  if (ids.length === 0) return [];

  const videos = await getVideosByIds(ids);

  // Channel page shows that channel's own videos, so verify + filter Shorts
  return videos
    .filter(
      (v) =>
        v.channelId === channelId &&
        (v.durationSeconds ?? 0) >= MIN_DURATION_SECONDS
    )
    .slice(0, max);
}

export type { Channel };
