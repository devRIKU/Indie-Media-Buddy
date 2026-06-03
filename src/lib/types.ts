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
