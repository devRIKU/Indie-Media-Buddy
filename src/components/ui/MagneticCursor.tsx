"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * MagneticCursor — Design Spell: Custom cursor with magnetic effect.
 * 
 * Replaces default cursor with a custom element that subtly follows
 * the mouse and magnetically attracted to interactive elements.
 * 
 * @param size      number — cursor size in px. Default 20.
 * @param color     string — cursor color. Default "var(--accent)".
 * @param blend     boolean — use mix-blend-mode difference. Default true.
 */
export default function MagneticCursor({
  size = 20,
  color = "var(--accent)",
  blend = true,
}: {
  size?: number;
  color?: string;
  blend?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Check if device supports hover (not touch)
    if (window.matchMedia("(hover: hover)").matches) {
      document.documentElement.style.cursor = "none";
    }

    return () => {
      document.documentElement.style.cursor = "";
    };
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Detect hoverable elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.dataset.magnetic
      ) {
        setIsHovering(true);
      }
    };

    const handleElementLeave = () => {
      setIsHovering(false);
    };

    document.addEventListener("mouseover", handleElementHover);
    document.addEventListener("mouseout", handleElementLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mouseout", handleElementLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && !window.matchMedia("(hover: hover)").matches) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        mixBlendMode: blend ? "difference" : "normal",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease-out",
      }}
    >
      <div
        style={{
          position: "fixed",
          left: position.x - size / 2,
          top: position.y - size / 2,
          width: isHovering ? size * 2 : size,
          height: isHovering ? size * 2 : size,
          backgroundColor: color,
          borderRadius: "50%",
          transition: "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.1s linear, top 0.1s linear",
          mixBlendMode: "difference",
        }}
      />
    </div>
  );
}
