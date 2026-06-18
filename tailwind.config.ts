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
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        fg: {
          DEFAULT: "var(--fg)",
          2: "var(--fg-2)",
        },
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: {
          DEFAULT: "var(--border)",
          2: "var(--border-2)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          press: "var(--accent-press)",
          fg: "var(--accent-fg)",
          soft: "var(--accent-soft)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Outfit", "Segoe UI", "system-ui", "sans-serif"],
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
        "3xl":   ["var(--text-3xl)",  { lineHeight: "var(--lh-tight)" }],
        display: ["var(--text-display)", { lineHeight: "var(--lh-display)", letterSpacing: "var(--tr-display)" }],
      },
      fontWeight: {
        regular:  "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
        extrabold: "800",
        black:    "900",
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
        full: "var(--radius-full)",
      },
      maxWidth: {
        body:    "var(--measure-body)",
        heading: "var(--measure-heading)",
        display: "var(--measure-display)",
        container: "1440px",
      },
      boxShadow: {
        sm:   "var(--shadow-sm)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        xl:   "var(--shadow-xl)",
        glow: "var(--shadow-glow)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      transitionTimingFunction: {
        DEFAULT:  "var(--ease-out)",
        out:      "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        spring:   "var(--ease-spring)",
        press:    "var(--ease-press)",
      },
      transitionDuration: {
        DEFAULT: "var(--dur-normal)",
        instant: "var(--dur-instant)",
        fast:    "var(--dur-fast)",
        normal:  "var(--dur-normal)",
        slow:    "var(--dur-slow)",
        reveal:  "var(--dur-reveal)",
        cinematic: "var(--dur-cinematic)",
      },
      animation: {
        "fade-in": "fadeIn 600ms var(--ease-out) both",
        "slide-up": "slideUp 700ms var(--ease-out) both",
        "scale-in": "scaleIn 500ms var(--ease-spring) both",
        "blur-in": "blurIn 500ms var(--ease-out) both",
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
      keyframes: {
        moveHorizontal: {
          "0%": { transform: "translateX(-50%) translateY(-10%)" },
          "50%": { transform: "translateX(50%) translateY(10%)" },
          "100%": { transform: "translateX(-50%) translateY(-10%)" },
        },
        moveInCircle: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        moveVertical: {
          "0%": { transform: "translateY(-50%)" },
          "50%": { transform: "translateY(50%)" },
          "100%": { transform: "translateY(-50%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        blurIn: {
          from: { opacity: "0", filter: "blur(8px)" },
          to: { opacity: "1", filter: "blur(0px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
