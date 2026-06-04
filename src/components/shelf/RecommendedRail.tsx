"use client";

import { useMemo } from "react";
import Rail from "./Rail";
import { useMyList, useProgressMap } from "@/lib/storage";
import { getRecommendations } from "@/lib/recommend";
import { VIDEO_INDEX } from "@/lib/mock-data";

export default function RecommendedRail() {
  const { ids: myList, ready: listReady } = useMyList();
  const { map: progressMap, ready: progressReady } = useProgressMap();

  const recommendedVideos = useMemo(() => {
    if (!listReady || !progressReady) return [];
    const catalog = Object.values(VIDEO_INDEX);
    return getRecommendations(myList, progressMap, catalog, 8);
  }, [myList, progressMap, listReady, progressReady]);

  // Don't render anything until storage is loaded, or if there are no recommendations.
  if (!listReady || !progressReady || recommendedVideos.length === 0) {
    return null;
  }

  // If the user has no interaction history, the algorithm naturally falls back to
  // popular/recent videos. We can adjust the copy to reflect this.
  const hasHistory = myList.length > 0 || Object.keys(progressMap).length > 0;

  return (
    <Rail
      title={hasHistory ? "Recommended for You" : "Trending on YouPlus"}
      subtitle={hasHistory ? "Based on your watch history and saved items" : "Popular videos across the catalog"}
      videos={recommendedVideos}
      style="poster"
      showRank={false}
    />
  );
}
