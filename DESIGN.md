# Design System — jmduarte.com

Single-page personal website. Dark mode only. Warm, not cold.

## Aesthetic Direction

Editorial, narrative-driven, personality-forward. Reference: zuhair.io.
Not a template. Not a SaaS landing page. A personal site that's recognizable from a screenshot.

The voice orb is the signature element (like Stripe's gradient or Linear's icons).

## Color Palette (oklch)

All colors use oklch color space. Source: tweakcn theme export.

| Token | Value | Description |
|-------|-------|-------------|
| `--background` | `oklch(0.2679 0.0036 106.6427)` | Warm charcoal (not cold black) |
| `--foreground` | `oklch(0.8074 0.0142 93.0137)` | Warm cream text |
| `--primary` | `oklch(0.8370 0.1280 66.2900)` | Golden amber accent |
| `--primary-foreground` | `oklch(1.0000 0 0)` | White on amber |
| `--muted` | `oklch(0.2213 0.0038 106.7070)` | Darker warm surface |
| `--muted-foreground` | `oklch(0.7713 0.0169 99.0657)` | Secondary text (warm gray) |
| `--border` | `oklch(0.3618 0.0101 106.8928)` | Opaque warm border |
| `--ring` | `oklch(0.6724 0.1308 38.7559)` | Amber focus ring |
| `--input` | `oklch(0.4336 0.0113 100.2195)` | Input border |
| `--destructive` | `oklch(0.6368 0.2078 25.3313)` | Warm red |

**Rule:** No hardcoded `rgba(255,255,255,...)` anywhere. Use tokens.
**Rule:** Borders are opaque oklch, not semi-transparent rgba. By design.

## Typography

- **Font:** Space Grotesk (kept from MVP)
- **Scale:** Default Tailwind type scale
- **Section labels:** `text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground`
- **Body text:** `text-[16px] md:text-[17px] leading-[1.7]`
- **Headings:** `text-[20px] md:text-[20px] font-medium`

## Spacing

- **Max content width:** 640px (`max-w-[640px]`)
- **Section padding:** Compact. `py-8` to `py-16` range, not generous `py-24`.
- **Section dividers:** `border-t border-border` on anchor divs, not inside content wrappers.
- **Item spacing:** `space-y-8` within sections.

## Layout

- **Hero:** `min-h-[60dvh]`, centered, voice orb above name.
- **Sections:** Left-aligned editorial flow, single column.
- **Footer:** Single line, `text-[13px]`, `py-8`.

## Voice Orb (Signature Element)

- **Size:** 80px mobile / 160px desktop
- **Position:** Always above the name, all screen sizes. Single instance (not mobile/desktop split).
- **Idle label:** "Talk to me"
- **Glow:** Amber radial gradient derived from `--primary` (not white rgba)
- **Skeleton:** Matches orb glow color (no white-to-amber flash on hydration)

## Motion Budget

Intentional, minimal. Every animation earns its place.

- **Hero entrance:** Staggered fade-in-up on individual children (0ms, 100ms, 200ms, 300ms delay). Applied to wrapper divs, not components directly.
- **Scroll-reveal:** Opacity-only fade (`opacity 0.6s ease-out`). No translateY.
- **Project hover:** `translateY(-2px)` + amber box-shadow glow, 200ms ease-out.
- **Background gradient:** Opacity animation over 20-30s. GPU-friendly.
- **Scroll-down chevron:** Static, fades out on scroll.
- **No bounce animations.** No parallax. No decorative motion.

### Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:
- Scroll-reveal sections always visible (`opacity: 1 !important`)
- Smooth scroll disabled (`scroll-behavior: auto`)
- Stagger animations still play (opacity-only, fast enough to not trigger vestibular issues)

## Background

- **Grain texture:** CSS pseudo-element with base64 SVG noise at 3-5% opacity. `position: fixed`, `pointer-events: none`.
- **Gradient:** Radial gradient from warm amber at top-left, animating opacity over 20-30s.
- **Stacking:** `bg-background` on `<html>` (not `<body>`). Pseudo-elements on body with negative z-index.

## Interactive States

- **Copy email button:** Label swaps to "Copied!" in `text-primary` (amber) for 2s, then reverts. No toast. Fallback: mailto: if clipboard unavailable.
- **Project cards:** Hover lift + amber glow. `transition: transform 200ms, box-shadow 200ms` (not `transition: all`).
- **Social links:** 18px SVG icons + label. 44px minimum tap target. `hover:opacity-70`.
- **Focus:** Amber ring via `--ring` token. Sufficient contrast against charcoal.

## Social Icons

Inline SVGs for GitHub, LinkedIn, X, Email. 18px size, `gap-2` from label text.
No icon library dependency for these four.

## Accessibility

- **Touch targets:** 44px minimum on all interactive elements.
- **Focus ring:** Amber (`--ring`), visible on `focus-visible`.
- **Color contrast:** oklch palette designed with sufficient lightness deltas.
- **JS-disabled:** Sections visible immediately (no hidden initial state).
- **Smooth scroll:** Disabled for reduced-motion users.

## What This Site Is NOT

- Not a SaaS template with card grids
- Not centered-everything layout
- Not purple/blue gradient territory
- Not decorated with blobs, circles, or wavy dividers
- Not generic hero copy ("Welcome to..." / "Your all-in-one...")
