"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";

/**
 * Glow — Design Spell: Cursor-following glow effect.
 * 
 * Creates a soft radial gradient that follows the cursor,
 * adding a premium, interactive feel to elements.
 * 
 * @param color   string — glow color. Default "var(--accent)".
 * @param size    number — glow size in px. Default 200.
 * @param opacity number — glow opacity (0-1). Default 0.15.
 */
export default function Glow({
  children,
  className = "",
  color = "var(--accent)",
  size = 200,
  opacity = 0.15,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
  opacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const { clientX, clientY } = e;
      const { left, top } = ref.current.getBoundingClientRect();
      setPosition({ x: clientX - left, y: clientY - top });
    },
    []
  );

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className={`relative overflow-hidden ${className}`}
      style={{ isolation: "isolate" }}
    >
      {/* Glow effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${color}, transparent)`,
          opacity: isVisible ? opacity : 0,
          transition: "opacity 0.3s ease-out",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
