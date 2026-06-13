"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

/**
 * Parallax — Design Spell: Parallax depth effect.
 * 
 * Creates a subtle parallax effect based on scroll or mouse position,
 * adding depth and dimension to elements.
 * 
 * @param speed   number — parallax speed (0-1). Default 0.1.
 * @param mode    "scroll" | "mouse" — effect trigger. Default "scroll".
 */
export default function Parallax({
  children,
  className = "",
  speed = 0.1,
  mode = "scroll",
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  mode?: "scroll" | "mouse";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (mode === "scroll") {
      const handleScroll = () => {
        if (!ref.current) return;
        const { top, height } = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementCenter = top + height / 2;
        const viewportCenter = windowHeight / 2;
        const distance = elementCenter - viewportCenter;
        setOffset(distance * speed);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [mode, speed]);

  const handleMouse = () => {
    if (mode !== "mouse" || !ref.current) return;
    const { top, height } = ref.current.getBoundingClientRect();
    const elementCenter = top + height / 2;
    const viewportCenter = window.innerHeight / 2;
    const distance = elementCenter - viewportCenter;
    setOffset(distance * speed);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        transition: "transform 0.1s linear",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
