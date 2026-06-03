import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import LeftRail from "@/components/nav/LeftRail";
import TopNav from "@/components/nav/TopNav";

/**
 * Three typefaces, chosen for an editorial / cinematic / quietly authoritative
 * brand. All variable, all free, all self-hosted (zero layout shift, no
 * third-party hop).
 *
 *  - Bricolage Grotesque (display): wide grotesque with optical sizing axis.
 *  - Geist Sans (body): Vercel's neo-grotesque. Quiet, modern, variable.
 *  - Geist Mono (meta): metric-paired companion for durations, view counts,
 *    eyebrow labels.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://youplus.app"),
  title: {
    default: "YouPlus — A curated cinema for YouTube",
    template: "%s · YouPlus",
  },
  description:
    "Vox, Veritasium, Kurzgesagt, MKBHD, and the rest of the best of YouTube — arranged like Apple TV+ instead of a feed.",
  keywords: [
    "youtube curated",
    "editorial streaming",
    "veritasium",
    "kurzgesagt",
    "vox",
    "documentary",
  ],
  openGraph: {
    title: "YouPlus — A curated cinema for YouTube",
    description:
      "The best of YouTube, arranged like Apple TV+ instead of a feed.",
    type: "website",
    siteName: "YouPlus",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouPlus — A curated cinema for YouTube",
    description:
      "The best of YouTube, arranged like Apple TV+ instead of a feed.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0915",
  width: "device-width",
  initialScale: 1,
  // We honour user zoom — never set user-scalable=no
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="overflow-x-hidden bg-bg text-fg antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <LeftRail />
        <TopNav />
        <div aria-hidden="true" className="grain-overlay" />
        <main id="main" className="min-h-[100dvh] w-full max-w-full overflow-x-hidden md:pl-[68px]">
          {children}
        </main>
      </body>
    </html>
  );
}
