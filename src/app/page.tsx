import CinematicHero from "@/components/hero/CinematicHero";
import Rail from "@/components/shelf/Rail";
import RecommendedRail from "@/components/shelf/RecommendedRail";
import { RAILS, HOME_RAIL_ORDER } from "@/lib/catalog";
import { getHero, getRailVideos } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const heroItems = await getHero();
  const heroExclude = new Set(heroItems.map((v) => v.id));
  const orderedRails = HOME_RAIL_ORDER.map(
    (slug) => RAILS.find((r) => r.slug === slug)!
  ).filter(Boolean);

  // Fetch all rail data in parallel. The first rail (spotlight) shares the
  // hero's source channels, so we drop the hero ids to avoid showing the
  // same four videos twice on the home page.
  const railData = await Promise.all(
    orderedRails.map(async (rail, idx) => ({
      rail,
      videos: await getRailVideos(
        rail.slug,
        idx === 0 ? heroExclude : undefined
      ),
    }))
  );

  return (
    <>
      <CinematicHero items={heroItems} />

      <div className="relative z-10 -mt-12 space-y-10 pb-24 sm:-mt-16 md:space-y-16 md:pb-32">
        <RecommendedRail />
        {railData.map(({ rail, videos }, idx) => (
          <Rail
            key={rail.slug}
            title={rail.title}
            subtitle={rail.subtitle}
            videos={videos}
            style={rail.style === "video" ? "video" : "poster"}
            showRank={idx === 0}
          />
        ))}
      </div>

      <footer className="mt-16 border-t border-border bg-bg px-4 py-12 sm:px-6 md:mt-20 md:px-8">
        <div className="mx-auto flex max-w-container flex-wrap items-baseline justify-between gap-6">
          <div>
            <p className="font-display text-lg font-semibold tracking-heading text-fg">
              You<span className="text-accent">+</span>
            </p>
            <p className="meta mt-2 max-w-md text-muted">
              A hand-arranged shelf for the best of YouTube. Playback is via the
              official YouTube embed — views count toward the creators.
            </p>
          </div>
          <nav aria-label="Footer" className="meta flex flex-wrap gap-x-6 gap-y-3 text-muted md:gap-x-8">
            <a href="/category/science" className="transition-colors duration-hover ease-ui hover:text-fg">Browse</a>
            <a href="/search" className="transition-colors duration-hover ease-ui hover:text-fg">Search</a>
            <a href="#" className="transition-colors duration-hover ease-ui hover:text-fg">About</a>
            <a href="#" className="transition-colors duration-hover ease-ui hover:text-fg">Privacy</a>
            <a href="#" className="transition-colors duration-hover ease-ui hover:text-fg">Terms</a>
          </nav>
        </div>
        <p className="meta mx-auto mt-10 max-w-container text-faint">
          © 2026 YouPlus. All videos by their respective creators.
        </p>
      </footer>
    </>
  );
}
