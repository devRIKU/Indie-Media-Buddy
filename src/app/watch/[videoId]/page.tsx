import { getVideo, getRelated } from "@/lib/data";
import { MOCK_VIDEOS } from "@/lib/mock-data";
import WatchClient from "./WatchClient";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function WatchPage({
  params,
}: {
  params: { videoId: string };
}) {
  let video = await getVideo(params.videoId);
  if (!video) {
    // Fallback: pick the first mock video so demo links never 404
    video = Object.values(MOCK_VIDEOS).flat()[0];
    if (!video) notFound();
  }
  const related = await getRelated(video.channelId, video.id);
  return <WatchClient video={video} related={related} />;
}
