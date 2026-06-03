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

export async function getRailVideos(slug: string): Promise<VideoItem[]> {
  const rail = RAILS.find((r) => r.slug === slug);
  if (!rail) return [];
  if (isLiveMode() && rail.channelIds && rail.channelIds.length > 0) {
    const vids = await getLatestFromChannels(rail.channelIds, 4);
    if (vids.length > 0) return vids;
  }
  return MOCK_VIDEOS[slug] ?? [];
}

export async function getHero(): Promise<FeaturedHeroItem[]> {
  return MOCK_HERO;
}

export async function getVideo(id: string): Promise<VideoItem | undefined> {
  if (isLiveMode()) {
    const live = await getVideoById(id);
    if (live) return live;
  }
  return mockGetVideo(id);
}

export async function getRelated(channelId: string, excludeId: string): Promise<VideoItem[]> {
  if (isLiveMode()) {
    const live = await getLatestFromChannels([channelId], 8);
    if (live.length > 0) return live.filter((v) => v.id !== excludeId).slice(0, 6);
  }
  return mockRelated(channelId, excludeId);
}

export async function searchAll(q: string): Promise<VideoItem[]> {
  if (!q.trim()) return [];
  if (isLiveMode()) {
    const live = await ytSearch(q, 24);
    if (live.length > 0) return live;
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
  }
  // Mock: synthesize from catalog
  const match = Object.values(PREMIUM_CHANNELS).find((c) => c.id === id);
  return match
    ? { id: match.id, title: match.title }
    : undefined;
}

export async function getChannelVideos(id: string): Promise<VideoItem[]> {
  if (isLiveMode()) {
    const live = await ytChannelVideos(id, 24);
    if (live.length > 0) return live;
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
  nature: [
    PREMIUM_CHANNELS.natgeo.id,
    PREMIUM_CHANNELS.kurzgesagt.id,
  ],
  art: [
    PREMIUM_CHANNELS.greatart.id,
    PREMIUM_CHANNELS.nerdwriter.id,
  ],
};

export const CATEGORY_LABELS: Record<string, { title: string; subtitle: string }> = {
  science: { title: "Mind-bending Science", subtitle: "Veritasium · Kurzgesagt · Vsauce · Melodysheep · Branch Ed · 3Blue1Brown" },
  essays:  { title: "Video Essays",         subtitle: "Nerdwriter · Polyphonic · Johnny Harris" },
  shows:   { title: "Shows",                subtitle: "Vox · GLITCH · Mark Rober · MKBHD · Bon Appétit" },
  movies:  { title: "Films",                subtitle: "Long-form documentary and essay" },
  design:  { title: "Design & Tech",        subtitle: "MKBHD · Mark Rober · ArchDaily" },
  nature:  { title: "Nature",               subtitle: "National Geographic · Kurzgesagt" },
  art:     { title: "Art, Explained",       subtitle: "One painting at a time" },
};

export async function getCategoryVideos(slug: string): Promise<VideoItem[]> {
  const channels = CATEGORY_TO_CHANNELS[slug];
  if (!channels) return [];
  if (isLiveMode()) {
    const live = await getLatestFromChannels(channels, 8);
    if (live.length > 0) return live;
  }
  // Mock: pull every video whose channelId is in this category's channel list
  const channelSet = new Set(channels);
  return Object.values(MOCK_VIDEOS)
    .flat()
    .filter((v) => channelSet.has(v.channelId))
    .slice(0, 32);
}
