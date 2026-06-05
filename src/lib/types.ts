export type VideoItem = {
  id: string; // YouTube video id
  title: string;
  description?: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string; // e.g. "12:48"
  durationSeconds?: number;
  viewCount?: number;
  likeCount?: number;
  /** 16:9 thumbnail (maxres or hq) */
  thumbnail: string;
  /** Optional widescreen art for hero */
  backdrop?: string;
  /** Optional 2:3 poster art (we synthesize when YouTube doesn't have one) */
  poster?: string;
  tags?: string[];
  category?: string;
};

export type Channel = {
  id: string;
  title: string;
  handle?: string;
  description?: string;
  thumbnail?: string;
  subscribers?: number;
};

export type RailStyle = "poster" | "video" | "hero";

export type RailDefinition = {
  slug: string;
  title: string;
  subtitle?: string;
  style: RailStyle;
  /** YouTube playlist IDs to merge for this rail (curated). */
  playlistIds?: string[];
  /** Or channel IDs whose latest videos make the rail. */
  channelIds?: string[];
  /** Or static video IDs. */
  videoIds?: string[];
};

export type FeaturedHeroItem = VideoItem & {
  /** Tagline for the cinematic hero. */
  tagline: string;
  /** Hex color tint for the bloom behind the hero. */
  tint: string;
};

/**
 * Response shape for GET /api/videos?ids=...
 * Kept in /lib/types so both the server route and the client can import it
 * without pulling in `next/server` into the client bundle.
 */
export type VideosByIdsResponse = {
  items: VideoItem[];
  /** How the response was sourced. Useful for client-side debugging. */
  source: "live" | "mock" | "empty";
  /** Echo of the requested ids in the order they were resolved (or attempted). */
  requested: string[];
  /** Ids from the request that we couldn't resolve. Helps clients prune localStorage. */
  missing: string[];
};
