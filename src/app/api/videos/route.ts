/**
 * GET /api/videos?ids=a,b,c
 *
 * Resolves a list of YouTube video IDs (max 50) into full VideoItem objects.
 * Live mode hits the YouTube Data API; mock mode uses the local index.
 *
 * Used by client-side surfaces (My List, Continue Watching) that store ids
 * in localStorage and need to hydrate them on render.
 */
import { NextRequest, NextResponse } from "next/server";
import { getVideosByIds, isLiveMode } from "@/lib/youtube";
import { VIDEO_INDEX } from "@/lib/mock-data";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  if (isLiveMode()) {
    const items = await getVideosByIds(ids);
    if (items.length > 0) return NextResponse.json({ items });
  }

  // Mock fallback
  const items = ids.map((id) => VIDEO_INDEX[id]).filter(Boolean);
  return NextResponse.json({ items });
}
