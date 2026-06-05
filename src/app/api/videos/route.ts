/**
 * GET /api/videos?ids=a,b,c
 *
 * Resolves a list of YouTube video IDs (max 50, deduped, order-preserved)
 * into full VideoItem objects.
 *
 * Behavior matrix (kept consistent so the client can rely on a single shape):
 *   1. Empty / missing ids            → 200, { items: [] }
 *   2. Live mode succeeds w/ ≥1 hit   → 200, live items (in input order)
 *   3. Live mode empty / throws       → 200, mock items (in input order)
 *      + warn logged server-side
 *   4. All input ids unknown          → 200, { items: [] }
 *
 * Used by client-side surfaces (My List, Continue Watching) that store ids
 * in localStorage and need to hydrate them on render.
 */
import { NextRequest, NextResponse } from "next/server";
import { getVideosByIds, isLiveMode } from "@/lib/youtube";
import { VIDEO_INDEX } from "@/lib/mock-data";
import type { VideoItem, VideosByIdsResponse } from "@/lib/types";

export const runtime = "nodejs";

const MAX_IDS = 50;
const ID_PATTERN = /^[A-Za-z0-9_-]{6,20}$/;

function parseIds(raw: string): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const piece of raw.split(",")) {
    const id = piece.trim();
    if (!id) continue;
    if (!ID_PATTERN.test(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_IDS) break;
  }
  return out;
}

/** Reorder `items` to match the order of `requested` ids, dropping missing. */
function reorderToInputOrder(items: VideoItem[], requested: string[]): VideoItem[] {
  const byId = new Map(items.map((v) => [v.id, v]));
  const out: VideoItem[] = [];
  for (const id of requested) {
    const v = byId.get(id);
    if (v) out.push(v);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const ids = parseIds(req.nextUrl.searchParams.get("ids") ?? "");

  if (ids.length === 0) {
    return NextResponse.json<VideosByIdsResponse>(
      { items: [], source: "empty", requested: [], missing: [] },
      { status: 200 }
    );
  }

  // Live path — guarded so a thrown error never bubbles up as a 500.
  if (isLiveMode()) {
    try {
      const live = await getVideosByIds(ids);
      if (live.length > 0) {
        const ordered = reorderToInputOrder(live, ids);
        const missing = ids.filter((id) => !ordered.some((v) => v.id === id));
        if (process.env.NODE_ENV !== "production" && missing.length) {
          console.warn(
            `[api/videos] live mode: ${missing.length}/${ids.length} ids not resolved`,
            { missing }
          );
        }
        return NextResponse.json<VideosByIdsResponse>({
          items: ordered,
          source: "live",
          requested: ids,
          missing,
        });
      }
      console.warn(
        `[api/videos] live mode returned no items for ${ids.length} ids; falling back to mock`
      );
    } catch (err) {
      console.warn(
        `[api/videos] live mode threw; falling back to mock:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  // Mock fallback — preserves input order, reports missing ids explicitly.
  const mockItems = ids
    .map((id) => VIDEO_INDEX[id])
    .filter((v): v is VideoItem => Boolean(v));
  const missing = ids.filter((id) => !VIDEO_INDEX[id]);

  return NextResponse.json<VideosByIdsResponse>({
    items: mockItems,
    source: mockItems.length > 0 ? "mock" : "empty",
    requested: ids,
    missing,
  });
}
