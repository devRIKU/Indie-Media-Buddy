"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal — Scroll-triggered reveal animation.
 *
 * Design Spell: Stagger reveal with blur-to-sharp effect.
 * Elements fade in with a subtle blur that resolves as they enter viewport.
 * Uses Apple-style easing for natural deceleration.
 *
 * One-shot (disconnects after first reveal). Honors prefers-reduced-motion.
 *
 * @param delay  ms — stagger neighbouring elements by passing 0, 60, 120, ...
 * @param y      px — initial Y offset. Default 24.
 * @param blur   px — initial blur radius. Default 6.
 * @param scale  number — initial scale. Default 1 (no scale).
 * @param rotate number — initial rotate in degrees. Default 0.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  y = 24,
  blur = 6,
  scale = 1,
  rotate = 0,
  className = "",
  threshold = 0.12,
}: {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  y?: number;
  blur?: number;
  scale?: number;
  rotate?: number;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;

    // Respect reduced motion — render fully shown immediately
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(true);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const Component = Tag as React.ElementType;

  return (
    <Component
      ref={ref as never}
      className={className}
      style={{
        transition:
          "transform 700ms var(--ease-out), opacity 700ms var(--ease-out), filter 700ms var(--ease-out)",
        transitionDelay: `${delay}ms`,
        transform: shown
          ? "translateY(0) scale(1) rotate(0deg)"
          : `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`,
        opacity: shown ? 1 : 0,
        filter: shown ? "blur(0)" : `blur(${blur}px)`,
        willChange: shown ? undefined : "transform, opacity, filter",
      }}
    >
      {children}
    </Component>
  );
}
