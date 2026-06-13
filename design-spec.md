# YouPlus · Design Specification v2

> A curated cinema for YouTube — reimagined with editorial precision,
> distilled clarity, and moments of delight.

---

## 🎯 Design Philosophy

**Core Metaphor**: The app is a *private cinema* — dark, warm, immersive. Content is the protagonist; the interface recedes into the background until needed.

**Three Pillars**:
1. **Editorial Authority** — Clean hierarchy, confident typography, cinematic pacing
2. **Quiet Luxury** — Warm darks, subtle textures, restrained ornamentation
3. **Delightful Precision** — Micro-interactions that reward attention without distracting

---

## 🎨 Color System

### Core Palette (Warm Dark Theme)
```css
--bg:          #0f0e0d;    /* Deepest surface — warm charcoal, NOT pure black */
--surface:     #1a1918;    /* Elevated panels, cards */
--surface-2:   #242322;    /* Higher elevation — modals, dropdowns */
--surface-3:   #2e2d2c;    /* Highest elevation — tooltips, popovers */

--fg:          #ebe9e8;    /* Primary text — warm white */
--fg-2:        #c8c6c5;    /* Secondary text */
--muted:       #8a8887;    /* Tertiary text, labels */
--faint:       #4a4948;    /* Dividers, subtle borders */

--accent:      #f5f0eb;    /* Primary action — warm cream */
--accent-hover:#e8e2dc;    /* Accent hover state */
--accent-press:#d9d2cb;    /* Accent press state */
--accent-fg:   #0f0e0d;    /* Text on accent background */
--accent-soft: #f5f0eb12;  /* Subtle accent background */

--border:      #2e2d2c;    /* Default borders */
--border-2:    #3a3938;    /* Emphasized borders */
```

### Semantic Colors
```css
--success:     #7ec4a0;    /* Success states */
--warning:     #e4c57a;    /* Warning states */
--error:       #e07a6a;    /* Error states */
--info:        #7ab4e0;    /* Info states */
```

---

## 🔤 Typography Scale

### Font Families
- **Display**: "Charter", Georgia, "Times New Roman", serif — *Editorial warmth*
- **Body**: Inter, -apple-system, system-ui, sans-serif — *Clean readability*
- **Mono**: "JetBrains Mono", "SF Mono", Menlo, monospace — *Technical precision*

### Type Scale (Fluid)
```css
--text-xs:      0.75rem;    /* 12px — Meta labels */
--text-sm:      0.875rem;   /* 14px — Secondary text */
--text-base:    1rem;       /* 16px — Body minimum */
--text-lg:      1.125rem;   /* 18px — Large body */
--text-xl:      1.25rem;    /* 20px — Section titles */
--text-2xl:     1.75rem;    /* 28px — Page titles */
--text-3xl:     2.25rem;    /* 36px — Hero subtitles */
--text-display: clamp(2.5rem, 5vw, 5rem); /* Hero headlines */
```

### Line Heights
- Display: 0.95 — *Tight, dramatic*
- Headings: 1.1 — *Compact, authoritative*
- Body: 1.6 — *Readable, comfortable*

---

## 📐 Spacing System

Base unit: **4px** (all values are multiples)

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

---

## 📏 Border Radius

```css
--radius-sm:   6px;    /* Chips, small elements */
--radius-md:   10px;   /* Buttons, inputs */
--radius-lg:   16px;   /* Cards */
--radius-xl:   24px;   /* Modals, large panels */
--radius-2xl:  32px;   /* Hero frames */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 🌑 Shadows

Three tiers, all warm-tinted:

```css
--shadow-sm:   0 1px 2px rgba(15, 14, 13, 0.3);
--shadow-md:   0 4px 12px rgba(15, 14, 13, 0.4);
--shadow-lg:   0 12px 40px rgba(15, 14, 13, 0.5);
--shadow-xl:   0 24px 80px rgba(15, 14, 13, 0.6);
```

---

## 🎬 Motion System

### Durations
```css
--dur-instant:  80ms;
--dur-fast:     130ms;
--dur-normal:   200ms;
--dur-slow:     350ms;
--dur-reveal:   600ms;
--dur-cinematic: 900ms;
```

### Easing Curves
```css
--ease-out:     cubic-bezier(0.22, 1, 0.36, 1);    /* Decelerate */
--ease-in-out:  cubic-bezier(0.45, 0, 0.55, 1);    /* Smooth */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy */
--ease-press:   cubic-bezier(0.23, 1, 0.32, 1);    /* Snappy */
```

### Animation Principles
1. **Purposeful** — Every animation serves a function (feedback, guidance, delight)
2. **Decelerating** — Elements slow down as they arrive (ease-out)
3. **Layered** — Different elements animate at different speeds
4. **Respectful** — Honors `prefers-reduced-motion`

---

## 🧩 Component Patterns

### Card System
- **Outer Shell**: Surface color + subtle ring + hover lift
- **Inner Core**: Background color (warm dark, never pure black)
- **Image Well**: Object-cover with scale-on-hover (1.04x)
- **Meta**: Bottom-aligned, gradient scrim for legibility

### Navigation
- **Desktop**: Floating glass pill, centered
- **Mobile**: Bottom sheet with icons, safe-area aware
- **Active State**: Pill background + spring animation

### Buttons
- **Primary**: Accent background, accent-fg text
- **Secondary**: Surface background, border ring
- **Ghost**: Transparent, hover shows surface background
- **Pill**: Rounded-full, compact, icon + label

---

## ✨ Design Spells (Delightful Details)

1. **Magnetic Hover** — Buttons subtly follow cursor on hover
2. **Parallax Depth** — Hero image moves slower than scroll
3. **Stagger Reveal** — Content fades in with 60ms delay between items
4. **Ripple Click** — Material-style ripple on interactive elements
5. **Glow Focus** — Accent-colored glow on keyboard focus
6. **Skeleton Shimmer** — Subtle shimmer while content loads
7. **Progress Pulse** — Animated progress indicator during playback
8. **Card Tilt** — Subtle 3D tilt on hover (desktop only)
9. **Text Reveal** — Words animate in with blur-to-sharp
10. **Scroll Snap** — Smooth snapping in horizontal rails

---

## 📱 Responsive Breakpoints

```css
--bp-sm:  640px;    /* Small tablets */
--bp-md:  768px;    /* Tablets, small laptops */
--bp-lg:  1024px;   /* Laptops */
--bp-xl:  1280px;   /* Desktops */
--bp-2xl: 1536px;   /* Large desktops */
```

---

## 🎯 Design Decisions

### Distilled (Simplified)
- Removed: Excessive border rings on cards (now subtle hover only)
- Reduced: Color palette from 8 to 6 core colors
- Consolidated: Button variants to 3 (primary, secondary, ghost)
- Eliminated: Redundant shadow layers

### Polished (Refined)
- Added: Consistent 4px spacing grid
- Refined: Typography scale with fluid sizing
- Enhanced: Focus states with glow effect
- Improved: Touch targets (minimum 44px)

### Delightful (Design Spells)
- Added: Magnetic hover on primary buttons
- Added: Parallax depth on hero section
- Added: Stagger reveal on content rails
- Added: Card tilt on desktop hover
- Added: Text reveal animation on headlines
