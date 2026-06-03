import { notFound } from "next/navigation";
import VideoCard from "@/components/shelf/VideoCard";
import { getChannel, getChannelVideos } from "@/lib/data";
import { formatViews } from "@/lib/format";

export const revalidate = 3600;

export default async function ChannelPage({
  params,
}: {
  params: { id: string };
}) {
  const [channel, videos] = await Promise.all([
    getChannel(params.id),
    getChannelVideos(params.id),
  ]);
  if (!channel) notFound();

  return (
    <section className="px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex items-center gap-6 border-b border-border pb-10">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-accent font-display text-[2rem] font-semibold text-accent-fg">
            {channel.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={channel.thumbnail}
                alt={channel.title}
                className="h-full w-full object-cover"
              />
            ) : (
              channel.title.charAt(0)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="eyebrow text-accent">Creator</p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-heading sm:text-[2.25rem]">
              {channel.title}
            </h1>
            <div className="meta mt-2 flex flex-wrap items-center gap-x-3 text-muted">
              {channel.handle && <span>{channel.handle}</span>}
              {channel.subscribers != null && (
                <>
                  {channel.handle && <span className="text-faint">·</span>}
                  <span>{formatViews(channel.subscribers)} subscribers</span>
                </>
              )}
              <span className="text-faint">·</span>
              <span>{videos.length} on YouPlus</span>
            </div>
          </div>

          <button className="rounded-full bg-fg px-6 py-2.5 text-sm font-semibold text-bg transition-[transform,background-color] hover:bg-fg-2 active:scale-[0.97] active:duration-press active:ease-press">
            Follow
          </button>
        </div>

        {channel.description && (
          <p className="prose mt-8 text-fg-2">
            {channel.description.split("\n")[0]}
          </p>
        )}

        <h2 className="heading mt-12 text-fg">Recent on YouPlus</h2>

        {videos.length === 0 ? (
          <div className="mt-6 rounded-xl border border-border bg-surface p-10 text-center">
            <p className="prose mx-auto text-muted">No videos cached yet.</p>
          </div>
        ) : (
          <div
            className="mt-6 grid gap-x-5 gap-y-10"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
