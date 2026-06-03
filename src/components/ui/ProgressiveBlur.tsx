/**
 * ProgressiveBlur — Apple-esque layered backdrop blur.
 *
 * A single `backdrop-filter: blur(...)` is binary: either an area is blurred or
 * it isn't. The visionOS / iOS / Apple TV+ effect ramps blur strength *along*
 * an axis (sharp at one edge → heavy at the other). The canonical recipe is a
 * stack of 4 layers, each with a heavier blur and a more aggressive mask, so
 * the human eye reads them as one smooth gradient.
 *
 * Use this for: scroll-edge nav fade, hero bottom fade-into-content, rail edge
 * fades, sticky-section bottom shadows. Avoid it elsewhere — it is rendered by
 * the GPU and is not free.
 *
 * @example
 *   <ProgressiveBlur position="top" height={120} />
 *   <ProgressiveBlur position="bottom" height={180} intensity="strong" />
 */

type Position = "top" | "bottom" | "left" | "right";
type Intensity = "subtle" | "medium" | "strong";

const SCALES: Record<Intensity, number[]> = {
  subtle: [1, 2, 4, 8],
  medium: [2, 4, 8, 16],
  strong: [4, 8, 16, 32],
};

/** maps a position to a CSS `to <side>` direction for the masks */
const MASK_DIR: Record<Position, string> = {
  top: "to top",
  bottom: "to bottom",
  left: "to left",
  right: "to right",
};

/** maps a position to a CSS edge to anchor the band */
const EDGE: Record<Position, React.CSSProperties> = {
  top:    { top: 0,    left: 0,  right: 0  },
  bottom: { bottom: 0, left: 0,  right: 0  },
  left:   { top: 0,    bottom: 0, left: 0   },
  right:  { top: 0,    bottom: 0, right: 0  },
};

const IS_HORIZONTAL: Record<Position, boolean> = {
  top: false,
  bottom: false,
  left: true,
  right: true,
};

export default function ProgressiveBlur({
  position = "bottom",
  height,
  width,
  intensity = "medium",
  className = "",
  style,
}: {
  position?: Position;
  /** vertical-band height in px (only for position=top|bottom). Default 120. */
  height?: number;
  /** horizontal-band width in px (only for position=left|right). Default 80. */
  width?: number;
  intensity?: Intensity;
  className?: string;
  style?: React.CSSProperties;
}) {
  const horiz = IS_HORIZONTAL[position];
  const bandSize = horiz ? (width ?? 80) : (height ?? 120);
  const blurs = SCALES[intensity];
  const dir = MASK_DIR[position];

  const bandStyle: React.CSSProperties = {
    position: "absolute",
    ...EDGE[position],
    pointerEvents: "none",
    ...(horiz
      ? { width: bandSize }
      : { height: bandSize }),
    ...style,
  };

  return (
    <div className={className} style={bandStyle} aria-hidden="true">
      {blurs.map((blur, i) => {
        // Stop positions ramp from 0 → 100 as i increases. Each layer is masked
        // so the heavier blurs only show toward the deep edge.
        const stops = [
          (i / blurs.length) * 100,
          ((i + 1) / blurs.length) * 100,
        ];
        return (
          <div
            key={blur}
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: `linear-gradient(${dir}, black ${stops[0]}%, transparent ${stops[1]}%)`,
              WebkitMaskImage: `linear-gradient(${dir}, black ${stops[0]}%, transparent ${stops[1]}%)`,
            }}
          />
        );
      })}
    </div>
  );
}
