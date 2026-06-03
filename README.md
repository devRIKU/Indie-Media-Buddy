# YouPlus

Premium streaming, curated from YouTube — Vox, Veritasium, Kurzgesagt, MKBHD,
The Great Art Explained, Nerdwriter, and friends. Arranged like Apple TV+ /
Criterion Channel.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, dark editorial theme, single warm-amber accent
- Bricolage Grotesque (display) + Geist Sans (body) + Geist Mono (meta)
- YouTube IFrame Player API for playback (no API key required)
- YouTube Data API v3 for live metadata (optional)
- localStorage for personal state (Continue Watching, My List)

## Run

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app ships with **curated mock data** — real YouTube video IDs from premium
creators, thumbnails loaded directly from `i.ytimg.com`. It looks like a real
product without an API key.

## Flip to live mode

Copy `.env.example` → `.env.local`:

```
YOUTUBE_API_KEY=AIzaSy...
```

Get a key at https://console.cloud.google.com/apis/credentials. Enable the
YouTube Data API v3 — free 10,000 units / day, easily covers a small site.

When the key is present:

| Page | What goes live |
|---|---|
| `/`                  | Rails fetch latest videos from each curated channel |
| `/watch/[videoId]`   | Real video metadata, real related videos, real channel data |
| `/search?q=...`      | Real YouTube search results (top 24, by relevance) |
| `/category/[slug]`   | Latest from each channel in the category cluster |
| `/channel/[id]`      | Channel info + recent uploads |

Results are cached two ways:

1. **In-memory cache** (5 min default, 1 hr for channel videos, 12 hr for
   channel info). Process-wide, no extra service.
2. **Next.js ISR** at the route level (`revalidate = 3600`).

Net: typical browsing uses <500 quota units/day even with 100 daily visitors.

## Routes

```
/                       Home — hero + 7 curated rails
/watch/[videoId]        Watch page (YouTube embed + cover overlay)
/search?q=...           Search across YouTube
/category/[slug]        Category grids: science, essays, shows, movies, design, nature, art
/channel/[id]           Creator page
/my-list                Saved items + Continue Watching (localStorage)
/api/videos?ids=a,b,c   Resolves IDs → VideoItems (powers client-side surfaces)
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # LeftRail + TopNav shell, font loading
│   ├── page.tsx                # Home (hero + rails)
│   ├── watch/[videoId]/        # Watch page + YouTube embed
│   ├── search/                 # Search
│   ├── category/[slug]/        # Category grids
│   ├── channel/[id]/           # Creator pages
│   ├── my-list/                # Personal lists (client-side)
│   └── api/videos/             # ID → VideoItem resolver
├── components/
│   ├── nav/                    # LeftRail, TopNav
│   ├── hero/CinematicHero.tsx  # Auto-rotating featured carousel
│   ├── shelf/                  # Rail, PosterCard, VideoCard
│   ├── player/                 # YouTubeEmbed (with progress tracking), PlayerCover
│   └── ui/ProgressiveBlur.tsx  # Apple-esque layered backdrop blur primitive
└── lib/
    ├── catalog.ts              # Curated channel directory + rail defs
    ├── mock-data.ts            # Real YT video IDs as fallback data
    ├── youtube.ts              # YouTube Data API wrapper (server-only)
    ├── data.ts                 # Unified data layer (live → mock fallback)
    ├── storage.ts              # localStorage (My List, Continue Watching) + React hooks
    ├── format.ts               # View / date / duration helpers
    └── types.ts
```

## Editorial curation

Add channels in `src/lib/catalog.ts` under `PREMIUM_CHANNELS`. Create a new
rail by adding an entry to `RAILS` with a list of `channelIds`. Reorder the
home page by editing `HOME_RAIL_ORDER`. Map a category route to a channel
cluster in `src/lib/data.ts` → `CATEGORY_TO_CHANNELS`.

## Legality

YouPlus does not host video. All playback is via YouTube's official IFrame
embed (`youtube-nocookie.com`) which respects creator monetisation and counts
views toward the creator. Think of YouPlus as a hand-set magazine cover for
the open YouTube catalog — a beautiful shelf, not a re-broadcast.
