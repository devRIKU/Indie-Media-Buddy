"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";

/**
 * CardTilt — Design Spell: 3D tilt effect on hover.
 * 
 * Creates a subtle 3D perspective tilt based on mouse position,
 * adding depth and interactivity to cards.
 * 
 * @param intensity  number — tilt intensity (0-1). Default 0.1.
 */
export default function CardTilt({
  children,
  className = "",
  intensity = 0.1,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = ref.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const rotateY = ((clientX - centerX) / (width / 2)) * intensity * 10;
      const rotateX = -((clientY - centerY) / (height / 2)) * intensity * 10;
      setTilt({ rotateX, rotateY });
    },
    [intensity]
  );

  const reset = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={reset}
      className={className}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
        transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}
