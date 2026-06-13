"use client";

import { useRef, useCallback, type ReactNode, type MouseEvent } from "react";

/**
 * Ripple — Design Spell: Material-style ripple effect.
 * 
 * Creates a ripple animation on click, providing tactile feedback.
 * Uses CSS animations for 60fps performance.
 * 
 * @example
 * <Ripple>
 *   <button>Click me</button>
 * </Ripple>
 */
export default function Ripple({
  children,
  className = "",
  color = "rgba(245, 240, 235, 0.3)",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      const size = Math.max(width, height) * 2;

      // Create ripple element
      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-expand 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        pointer-events: none;
      `;

      ref.current.appendChild(ripple);

      // Remove after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    },
    [color]
  );

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      style={{ isolation: "isolate" }}
    >
      {children}
      <style jsx>{`
        @keyframes ripple-expand {
          from {
            transform: scale(0);
            opacity: 1;
          }
          to {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
