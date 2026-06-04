import type { VideoItem } from "./types";
import type { ProgressMap } from "./storage";

const ALPHA = 0.5;   // Tag Match Weight
const BETA = 0.3;    // Channel Affinity Weight
const GAMMA = 0.1;   // Popularity Weight
const DELTA = 0.1;   // Recency Weight
const HALF_LIFE_DAYS = 14;
const DECAY_CONSTANT = Math.LN2 / HALF_LIFE_DAYS;

/**
 * Main recommendation entrypoint. Runs synchronously on the client.
 */
export function getRecommendations(
  myList: string[],
  progressMap: ProgressMap,
  catalog: VideoItem[],
  limit = 6
): VideoItem[] {
  const currentTime = Date.now();

  // 1. Build User Profile
  const tagProfile: Record<string, number> = {};
  const channelProfile: Record<string, number> = {};

  const findVideo = (id: string) => catalog.find((v) => v.id === id);

  // Process My List (Weight 3.0, no decay since we lack timestamp)
  for (const id of myList) {
    const video = findVideo(id);
    if (!video) continue;

    const weight = 3.0;
    for (const tag of video.tags || []) {
      tagProfile[tag] = (tagProfile[tag] || 0) + weight;
    }
    const chId = video.channelId;
    channelProfile[chId] = (channelProfile[chId] || 0) + weight;
  }

  // Process Progress Map
  for (const [id, progress] of Object.entries(progressMap)) {
    const video = findVideo(id);
    if (!video) continue;

    const elapsedDays = Math.max(0, (currentTime - progress.updatedAt) / (1000 * 60 * 60 * 24));
    const temporalDecay = Math.exp(-DECAY_CONSTANT * elapsedDays);

    const completionPct = progress.seconds / Math.max(1, progress.durationSeconds);
    let baseWeight = 0;

    if (completionPct >= 0.9) {
      baseWeight = 2.0;
    } else if (completionPct >= 0.05) {
      baseWeight = 1.0 * completionPct;
    } else {
      baseWeight = -0.5;
    }

    const effectiveWeight = baseWeight * temporalDecay;

    for (const tag of video.tags || []) {
      tagProfile[tag] = (tagProfile[tag] || 0) + effectiveWeight;
    }
    const chId = video.channelId;
    channelProfile[chId] = (channelProfile[chId] || 0) + effectiveWeight;
  }

  // Normalize Tag Profile (L2)
  let tagMagnitudeSq = 0;
  for (const val of Object.values(tagProfile)) {
    tagMagnitudeSq += val * val;
  }
  const tagMagnitude = Math.sqrt(tagMagnitudeSq);
  if (tagMagnitude > 0) {
    for (const tag in tagProfile) {
      tagProfile[tag] /= tagMagnitude;
    }
  }

  // Normalize Channel Profile (Max Scaling)
  const maxChannelVal = Math.max(0, ...Object.values(channelProfile));
  if (maxChannelVal > 0) {
    for (const ch in channelProfile) {
      channelProfile[ch] /= maxChannelVal;
    }
  }

  // Max views in catalog for popularity normalization
  let maxViews = 0;
  for (const v of catalog) {
    if ((v.viewCount || 0) > maxViews) maxViews = v.viewCount || 0;
  }

  // 2. Score Candidates
  const completedIds = new Set<string>();
  const inProgressIds = new Set<string>();

  for (const [id, prog] of Object.entries(progressMap)) {
    const comp = prog.seconds / Math.max(1, prog.durationSeconds);
    if (comp >= 0.9) completedIds.add(id);
    else if (comp >= 0.05) inProgressIds.add(id);
  }

  type ScoredVideo = { video: VideoItem; score: number };
  const candidates: ScoredVideo[] = [];

  for (const video of catalog) {
    if (completedIds.has(video.id) || inProgressIds.has(video.id)) {
      continue;
    }

    // Tag Match (Cosine Similarity)
    let dotProduct = 0;
    const videoTags = video.tags || [];
    for (const tag of videoTags) {
      dotProduct += tagProfile[tag] || 0;
    }
    const candidateMagnitude = Math.sqrt(videoTags.length);
    const tagScore = candidateMagnitude > 0 ? dotProduct / candidateMagnitude : 0;

    // Channel Match
    const channelScore = channelProfile[video.channelId] || 0;

    // Popularity Score
    const views = video.viewCount || 0;
    const popScore =
      views > 0 && maxViews > 0
        ? Math.log10(views + 1) / Math.log10(maxViews + 1)
        : 0;

    // Recency Score
    let recencyScore = 0;
    if (video.publishedAt) {
      const pubDate = new Date(video.publishedAt).getTime();
      const daysOld = Math.max(0, (currentTime - pubDate) / (1000 * 60 * 60 * 24));
      recencyScore = Math.exp(-0.0005 * daysOld);
    }

    const finalScore =
      ALPHA * tagScore +
      BETA * channelScore +
      GAMMA * popScore +
      DELTA * recencyScore;

    candidates.push({ video, score: finalScore });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit).map((c) => c.video);
}
