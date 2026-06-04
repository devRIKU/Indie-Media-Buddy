"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Providers — client-only context tree.
 *
 *   • LazyMotion   — tree-shakes framer-motion to domAnimation only;
 *                    drag/layout features stay out of the bundle.
 *   • MotionConfig — global default easing & duration that respect Emil's
 *                    principles: under 300ms, never `linear`, never zero.
 *                    reducedMotion="user" honours the OS-level preference.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
