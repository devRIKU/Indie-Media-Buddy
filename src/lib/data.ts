/**
 * Unified data layer. Uses live YouTube Data API when YOUTUBE_API_KEY is set,
 * otherwise serves curated mock data so the app always looks great.
 *
 * Every page route in /app/* calls into this module — never directly into
 * youtube.ts — so live ↔ mock is a single env-flag flip.
 */
import { RAILS, PREMIUM_CHANNELS } from "./catalog";
import {
  isLiveMode,
  getLatestFromChannels,
  getVideoById,
  searchVideos as ytSearch,
  getChannel as ytChannel,
  getChannelVideos as ytChannelVideos,
} from "./youtube";
import {
  MOCK_HERO,
  MOCK_VIDEOS,
  getRelated as mockRelated,
  getVideo as mockGetVideo,
} from "./mock-data";
import type { Channel, FeaturedHeroItem, VideoItem } from "./types";

/* ──────────────────────────────────────────────────────────────────────── */
/* Hero tint palette — cycled through when building live hero items.         */
/* ──────────────────────────────────────────────────────────────────────── */
const HERO_TINTS = [
  "#ec4899", // pink
  "#ef4444", // red
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#f97316", // orange
];

/* ──────────────────────────────────────────────────────────────────────── */
/* Channel-locked hero: spotlight channels from the first rail.              */
/* ──────────────────────────────────────────────────────────────────────── */
const SPOTLIGHT_CHANNELS = (() => {
  const spotlight = RAILS.find((r) => r.slug === "spotlight");
  return spotlight?.channelIds ?? [];
})();

function buildHeroTagline(title: string, channelTitle: string): string {
  // Use a short, punchy tagline derived from the channel
  return channelTitle;
}

/* ──────────────────────────────────────────────────────────────────────── */
/* Public API                                                                */
/* ──────────────────────────────────────────────────────────────────────── */

/** Minimum rail size we want to keep after de-dup. Below this we fall back
 *  to the un-deduped source so a small curated rail never disappears. */
const RAIL_MIN_LENGTH = 3;

/**
 * Resolve a rail by slug. The caller can pass `excludeIds` to drop videos
 * already shown elsewhere on the page (e.g. the hero). The exclusion is a
 * soft preference: if filtering would leave the rail too thin, we serve the
 * full list and accept the brief overlap.
 */
export async function getRailVideos(
  slug: string,
  excludeIds: ReadonlySet<string> = new Set()
): Promise<VideoItem[]> {
  const rail = RAILS.find((r) => r.slug === slug);
  if (!rail) return [];

  if (isLiveMode() && rail.channelIds && rail.channelIds.length > 0) {
    const vids = await getLatestFromChannels(rail.channelIds, 4);
    if (vids.length > 0) {
      if (excludeIds.size === 0) return vids;
      const deduped = vids.filter((v) => !excludeIds.has(v.id));
      return deduped.length >= RAIL_MIN_LENGTH ? deduped : vids;
    }
    console.warn(`[data] live mode fell back to mock for rail "${slug}"`);
  }

  const mock = MOCK_VIDEOS[slug] ?? [];
  if (excludeIds.size === 0) return mock;
  const deduped = mock.filter((v) => !excludeIds.has(v.id));
  return deduped.length >= RAIL_MIN_LENGTH ? deduped : mock;
}

/**
 * Get hero items. In live mode, fetches top videos from the spotlight channels.
 * Falls back to curated mock hero when live mode is unavailable or returns
 * insufficient results.
 *
 * `excludeIds` lets the caller drop videos that should not appear in the
 * hero (e.g. items already shown in a rail above the hero on other pages).
 */
export async function getHero(
  excludeIds: ReadonlySet<string> = new Set()
): Promise<FeaturedHeroItem[]> {
  if (isLiveMode() && SPOTLIGHT_CHANNELS.length > 0) {
    const vids = await getLatestFromChannels(SPOTLIGHT_CHANNELS, 6);
    const filtered =
      excludeIds.size > 0 ? vids.filter((v) => !excludeIds.has(v.id)) : vids;
    if (filtered.length >= 4) {
      // Take the top 4 by view count (getLatestFromChannels already sorts)
      return filtered.slice(0, 4).map((v, i) => ({
        ...v,
        tagline: buildHeroTagline(v.title, v.channelTitle),
        tint: HERO_TINTS[i % HERO_TINTS.length],
      }));
    }
    console.warn("[data] live hero fetch returned insufficient results, using mock");
  }

  const mock = MOCK_HERO;
  if (excludeIds.size === 0) return mock;
  // Soft filter: if excluding leaves the hero empty, serve the curated set.
  const filtered = mock.filter((v) => !excludeIds.has(v.id));
  return filtered.length > 0 ? filtered : mock;
}

export async function getVideo(id: string): Promise<VideoItem | undefined> {
  if (isLiveMode()) {
    const live = await getVideoById(id);
    if (live) return live;
    console.warn(`[data] live video fetch failed for "${id}", trying mock`);
  }
  return mockGetVideo(id);
}

export async function getRelated(
  channelId: string,
  excludeId: string
): Promise<VideoItem[]> {
  if (isLiveMode()) {
    const live = await getLatestFromChannels([channelId], 8);
    if (live.length > 0)
      return live.filter((v) => v.id !== excludeId).slice(0, 6);
    console.warn(
      `[data] live related fetch failed for channel "${channelId}", using mock`
    );
  }
  return mockRelated(channelId, excludeId);
}

export async function searchAll(q: string): Promise<VideoItem[]> {
  if (!q.trim()) return [];
  if (isLiveMode()) {
    const live = await ytSearch(q, 24);
    if (live.length > 0) return live;
    console.warn(`[data] live search returned no results for "${q}", using mock`);
  }
  // Mock mode: simple substring match against the local index
  const needle = q.toLowerCase();
  const all = Object.values(MOCK_VIDEOS).flat();
  return all
    .filter(
      (v) =>
        v.title.toLowerCase().includes(needle) ||
        v.channelTitle.toLowerCase().includes(needle) ||
        v.tags?.some((t) => t.toLowerCase().includes(needle))
    )
    .slice(0, 24);
}

export async function getChannel(id: string): Promise<Channel | undefined> {
  if (isLiveMode()) {
    const live = await ytChannel(id);
    if (live) return live;
    console.warn(`[data] live channel fetch failed for "${id}", using mock`);
  }
  // Mock: synthesize from catalog
  const match = Object.values(PREMIUM_CHANNELS).find((c) => c.id === id);
  return match ? { id: match.id, title: match.title } : undefined;
}

export async function getChannelVideos(id: string): Promise<VideoItem[]> {
  if (isLiveMode()) {
    const live = await ytChannelVideos(id, 24);
    if (live.length > 0) return live;
    console.warn(
      `[data] live channel videos fetch failed for "${id}", using mock`
    );
  }
  return Object.values(MOCK_VIDEOS)
    .flat()
    .filter((v) => v.channelId === id)
    .slice(0, 24);
}

/**
 * Category pages. We map a category slug to a set of channels in the catalog,
 * then merge their latest videos.
 */
const CATEGORY_TO_CHANNELS: Record<string, string[]> = {
  science: [
    PREMIUM_CHANNELS.veritasium.id,
    PREMIUM_CHANNELS.kurzgesagt.id,
    PREMIUM_CHANNELS.smarter.id,
    PREMIUM_CHANNELS.primer.id,
    PREMIUM_CHANNELS.vsauce.id,
    PREMIUM_CHANNELS.branch.id,
    PREMIUM_CHANNELS.melodysheep.id,
    PREMIUM_CHANNELS.threeblueonebrown.id,
  ],
  essays: [
    PREMIUM_CHANNELS.nerdwriter.id,
    PREMIUM_CHANNELS.polyphonic.id,
    PREMIUM_CHANNELS.johnnyharris.id,
  ],
  shows: [
    PREMIUM_CHANNELS.vox.id,
    PREMIUM_CHANNELS.bonappetit.id,
    PREMIUM_CHANNELS.natgeo.id,
    PREMIUM_CHANNELS.mkbhd.id,
    PREMIUM_CHANNELS.glitch.id,
    PREMIUM_CHANNELS.markrober.id,
  ],
  movies: [
    PREMIUM_CHANNELS.greatart.id,
    PREMIUM_CHANNELS.nerdwriter.id,
    PREMIUM_CHANNELS.natgeo.id,
  ],
  design: [
    PREMIUM_CHANNELS.mkbhd.id,
    PREMIUM_CHANNELS.markrober.id,
    PREMIUM_CHANNELS.archdaily.id,
    PREMIUM_CHANNELS.bonappetit.id,
  ],
  nature: [PREMIUM_CHANNELS.natgeo.id, PREMIUM_CHANNELS.kurzgesagt.id],
  art: [PREMIUM_CHANNELS.greatart.id, PREMIUM_CHANNELS.nerdwriter.id],
};

export const CATEGORY_LABELS: Record<
  string,
  { title: string; subtitle: string }
> = {
  science: {
    title: "Mind-bending Science",
    subtitle:
      "Veritasium · Kurzgesagt · Vsauce · Melodysheep · Branch Ed · 3Blue1Brown",
  },
  essays: {
    title: "Video Essays",
    subtitle: "Nerdwriter · Polyphonic · Johnny Harris",
  },
  shows: {
    title: "Shows",
    subtitle: "Vox · GLITCH · Mark Rober · MKBHD · Bon Appétit",
  },
  movies: { title: "Films", subtitle: "Long-form documentary and essay" },
  design: { title: "Design & Tech", subtitle: "MKBHD · Mark Rober · ArchDaily" },
  nature: { title: "Nature", subtitle: "National Geographic · Kurzgesagt" },
  art: { title: "Art, Explained", subtitle: "One painting at a time" },
};

export async function getCategoryVideos(slug: string): Promise<VideoItem[]> {
  const channels = CATEGORY_TO_CHANNELS[slug];
  if (!channels) return [];
  if (isLiveMode()) {
    const live = await getLatestFromChannels(channels, 8);
    if (live.length > 0) return live;
    console.warn(
      `[data] live category fetch failed for "${slug}", using mock`
    );
  }
  // Mock: pull every video whose channelId is in this category's channel list
  const channelSet = new Set(channels);
  return Object.values(MOCK_VIDEOS)
    .flat()
    .filter((v) => channelSet.has(v.channelId))
    .slice(0, 32);
}
