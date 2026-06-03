import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[640px] text-center">
        <p className="eyebrow text-accent">404 · Off the shelf</p>

        <h1
          className="mt-4 font-display font-semibold text-fg"
          style={{
            fontSize: "clamp(2.25rem, 5vw, 4.5rem)",
            lineHeight: "0.98",
            letterSpacing: "var(--tr-display)",
          }}
        >
          We can&apos;t find that one.
        </h1>

        <p className="prose mx-auto mt-6 text-fg-2">
          The page you were after isn&apos;t in the catalogue. It may have been
          unlisted by its creator, or the link may be slightly off. The shelves
          are still where you left them.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-button text-accent-fg transition-[transform,background-color] hover:bg-accent-hover active:scale-[0.97] active:duration-press active:ease-press"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
            </svg>
            Take me home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium tracking-button text-fg-2 transition-[transform,color] hover:text-fg active:scale-[0.97] active:duration-press active:ease-press"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            Search the catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
