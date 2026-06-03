"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal — scroll-interpolation entry primitive.
 *
 * Elements never appear statically on load. As they enter the viewport, they
 * execute a gentle, heavy fade-up with blur resolve, simulating mass and
 * spring. Cubic-bezier (0.22, 1, 0.36, 1) — out-quart-ish, the Apple-style
 * curve that makes UI feel like physical objects decelerating.
 *
 * One-shot (disconnects after first reveal). Honours prefers-reduced-motion.
 *
 * @param delay  ms — stagger neighbouring elements by passing 0, 60, 120, ...
 * @param y      px — initial Y offset. Default 24.
 * @param blur   px — initial blur radius. Default 6.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  y = 24,
  blur = 6,
  className = "",
  threshold = 0.12,
}: {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  y?: number;
  blur?: number;
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
        // 700ms reveal: deliberate but not posing. ease-reveal token.
        transition:
          "transform 700ms var(--ease-reveal), opacity 700ms var(--ease-reveal), filter 700ms var(--ease-reveal)",
        transitionDelay: `${delay}ms`,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        opacity: shown ? 1 : 0,
        filter: shown ? "blur(0)" : `blur(${blur}px)`,
        willChange: shown ? undefined : "transform, opacity, filter",
      }}
    >
      {children}
    </Component>
  );
}
