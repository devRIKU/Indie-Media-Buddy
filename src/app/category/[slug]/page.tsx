import { notFound } from "next/navigation";
import VideoCard from "@/components/shelf/VideoCard";
import { CATEGORY_LABELS, getCategoryVideos } from "@/lib/data";

export const revalidate = 3600;

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const meta = CATEGORY_LABELS[params.slug];
  if (!meta) notFound();

  const videos = await getCategoryVideos(params.slug);

  return (
    <section className="px-4 pb-24 pt-28 sm:px-6 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <p className="eyebrow text-accent">Category</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-heading sm:text-[2.5rem] sm:leading-tight">
          {meta.title}
        </h1>
        <p className="prose mt-3 text-fg-2">{meta.subtitle}</p>

        {videos.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-surface p-8 text-center sm:p-10">
            <p className="font-display text-lg font-medium">Nothing here yet.</p>
            <p className="prose mx-auto mt-2 text-muted">
              We&apos;re still curating this shelf. Check back soon.
            </p>
          </div>
        ) : (
          <div
            className="mt-12 grid gap-x-5 gap-y-10"
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
