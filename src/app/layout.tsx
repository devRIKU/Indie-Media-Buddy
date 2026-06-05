import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import TopNav from "@/components/nav/TopNav";
import MobileBottomNav from "@/components/nav/MobileBottomNav";
import Providers from "./providers";

/**
 * Three typefaces, chosen for an editorial / cinematic / quietly authoritative
 * brand.
 *
 *  - Hanken Grotesk (display): clean, variable grotesque with high editorial feel.
 *  - Inter (body): classic, highly readable sans-serif.
 *  - Geist Mono (meta): companion for durations, view counts, and eyebrow labels.
 */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
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
    description: "The best of YouTube, arranged like Apple TV+ instead of a feed.",
    type: "website",
    siteName: "YouPlus",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouPlus — A curated cinema for YouTube",
    description: "The best of YouTube, arranged like Apple TV+ instead of a feed.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0915",
  width: "device-width",
  initialScale: 1,
};

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${hanken.variable} ${inter.variable} ${GeistMono.variable}`}
    >
      <body className="overflow-x-hidden bg-bg text-fg antialiased">
        <BackgroundGradientAnimation 
          containerClassName="fixed inset-0 -z-50 pointer-events-auto opacity-30" 
          interactive={false} 
          size="100%" 
        />
        <Providers>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          {/*
            Nav system — minimal by design:
              • TopNav        : floating pill, desktop only (md+)
              • MobileBottomNav: pill with icons, mobile/tablet only (<md)
            The sidebar from v1 is gone. The interface now leaves the canvas
            to the editorial content.
          */}
          <TopNav />
          <MobileBottomNav />
          <div aria-hidden="true" className="grain-overlay" />
          <main
            id="main"
            className="min-h-[100dvh] w-full max-w-full overflow-x-hidden pb-24 md:pb-0 relative z-10"
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
