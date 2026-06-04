import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        fg: "var(--fg)",
        "fg-2": "var(--fg-2)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: "var(--border)",
        "border-2": "var(--border-2)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-press": "var(--accent-press)",
        "accent-fg": "var(--accent-fg)",
        "accent-soft": "var(--accent-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Charter", "Georgia", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
      fontSize: {
        xs:      ["var(--text-xs)",   { lineHeight: "var(--lh-meta)" }],
        sm:      ["var(--text-sm)",   { lineHeight: "var(--lh-body)" }],
        base:    ["var(--text-base)", { lineHeight: "var(--lh-body)" }],
        lg:      ["var(--text-lg)",   { lineHeight: "var(--lh-snug)" }],
        xl:      ["var(--text-xl)",   { lineHeight: "var(--lh-snug)" }],
        "2xl":   ["var(--text-2xl)",  { lineHeight: "var(--lh-tight)" }],
        display: ["var(--text-display)", { lineHeight: "var(--lh-display)", letterSpacing: "var(--tr-display)" }],
      },
      fontWeight: {
        regular:  "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
      },
      lineHeight: {
        display: "var(--lh-display)",
        tight:   "var(--lh-tight)",
        snug:    "var(--lh-snug)",
        card:    "var(--lh-card)",
        meta:    "var(--lh-meta)",
        body:    "var(--lh-body)",
      },
      letterSpacing: {
        display: "var(--tr-display)",
        heading: "var(--tr-heading)",
        button:  "var(--tr-button)",
        body:    "var(--tr-body)",
        eyebrow: "var(--tr-eyebrow)",
      },
      borderRadius: {
        none: "0",
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl":"var(--radius-2xl)",
        full: "9999px",
      },
      maxWidth: {
        body:    "var(--measure-body)",
        heading: "var(--measure-heading)",
        display: "var(--measure-display)",
        container: "1440px",
      },
      boxShadow: {
        card:       "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        player:     "var(--shadow-player)",
        inner:      "inset 0 1px 1px rgba(255,255,255,0.06)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      transitionTimingFunction: {
        DEFAULT:  "var(--ease-ui)",
        press:    "var(--ease-press)",
        ui:       "var(--ease-ui)",
        movement: "var(--ease-movement)",
        reveal:   "var(--ease-reveal)",
      },
      transitionDuration: {
        DEFAULT: "var(--dur-hover)",
        press:   "var(--dur-press)",
        hover:   "var(--dur-hover)",
        lift:    "var(--dur-lift)",
        nav:     "var(--dur-nav)",
        reveal:  "var(--dur-reveal)",
        image:   "var(--dur-image)",
      },
      animation: {
        "fade-in": "fadeIn 600ms cubic-bezier(.2,.7,.2,1) both",
        "slide-up": "slideUp 700ms cubic-bezier(.2,.7,.2,1) both",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
