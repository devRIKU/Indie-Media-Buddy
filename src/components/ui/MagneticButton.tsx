"use client";

import { useRef, useState, useCallback, type ReactNode, type ButtonHTMLAttributes } from "react";

/**
 * MagneticButton — Design Spell: Magnetic hover effect.
 * 
 * Button subtly follows cursor when hovered, creating a tactile,
 * physical feel. Uses spring easing for natural deceleration.
 * 
 * @example
 * <MagneticButton onClick={handleClick}>
 *   <span>Watch now</span>
 * </MagneticButton>
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.15,
  ...props
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ref.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const deltaX = (clientX - centerX) * strength;
      const deltaY = (clientY - centerY) * strength;
      setPosition({ x: deltaX, y: deltaY });
    },
    [strength]
  );

  const reset = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={reset}
      className={className}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${isHovered ? 1.02 : 1})`,
        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
