# andreapearsonofficial.com — Phase 6 Design Specification

## Design Principles

- **Fun but clean** — bespoke and crafted, not corporate, nothing close to Material Design
- **Fun lives in**: Motion (1st), Layout (2nd), Color (3rd)
- **60-30-10 color rule** strictly applied
- Dual-purpose site: **fun for books**, **professional for consulting** (Work With Me)

---

## Color System (60-30-10)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| 60% — Dominant | Mint Cream | `#F1F9F7` | Page backgrounds, large sections |
| 30% — Secondary | Deep Space Blue + Regal Navy | `#002B4C` / `#003A67` | Nav, section fills, headings, major UI. Use both blues for depth. |
| 10% — Accent | Blood Red | `#900101` | Primary CTAs, active nav indicator, section accent rules, hover moments |

### Blood Red usage rules
- Primary CTA buttons (Buy/Read, Subscribe, Book a Session, Explore Books) — Blood Red bg, Mint Cream text
- Active nav link — small Blood Red underline indicator
- Thin accent rule under major section headings (decorative, craft feel)
- Book card title shifts to Blood Red on hover
- **Work With Me exception**: CTAs stay Blood Red; decorative section accents are removed for a more restrained, professional tone

---

## Typography

| Role | Font | Notes |
|------|------|-------|
| Headings | Cormorant Garamond | Display serif — high-contrast, editorial, literary. Used for all h1–h3. |
| Body | Inter | Cleanest neutral body font. Invisible when reading, precise when scanning. |
| Wordmark / Logo fallback | Cormorant Garamond, weight 300 | Used until final logo asset arrives from Andrea |

### Type scale — 7 tiers

All tiers are defined as custom Tailwind utilities in `src/index.css` via `@layer utilities`.

| Tier | CSS class | Font | Weight | Size | Used for |
|------|-----------|------|--------|------|----------|
| **Hero** | `text-hero` | Cormorant Garamond | 300 | `5xl → sm:7xl → md:8xl → lg:9xl` | Homepage h1 only |
| **Title** | `text-title` | Cormorant Garamond | 300 | `4xl → md:7xl` | All page h1s |
| **Subtitle** | `text-subtitle` | Cormorant Garamond | 400 | `3xl → md:6xl` | All section h2s |
| **Book Title** | `text-booktitle` | Cormorant Garamond | 500 | `xl → md:2xl` | Book card titles, series card titles |
| **Caption** | `text-caption` | Cormorant Garamond | 500 | `base` flat | h3s, small card headings |
| **Body** | `text-body` | Inter | normal | `lg` flat | All body copy / paragraphs |
| **Small** | `text-small` | Inter | normal | `base` flat | Labels, meta, UI text, buttons |

Outside the tier system (special cases):
- `text-xs` — eyebrow labels, type taglines, book count under series stacks, nav UI
- `text-7xl md:text-9xl` — 404 number (decorative one-off)
- `font-display text-xl font-medium` — nav wordmark "Andrea Pearson"

### Weight implementation
Global CSS sets weights by element: `h1 = 300`, `h2 = 400`, `h3–h6 = 500`. Large display `h3`s (homepage genre strip cards) use `text-title` sizing and override weight with `font-light`.

### Tracking
No custom letter-spacing — browser defaults throughout.

---

## Motion (Moderate)

- **Page transitions**: AnimatePresence + fade/slide (`opacity 0→1`, `y 8→0`, 200ms easeOut)
- **Scroll entrances**: Staggered fade-in on book cards and section content (`whileInView`, `once: true`)
- **Book card hover**: Scale `1.02` + title color shifts to Blood Red
- **Nav mobile overlay**: Full-screen menu links stagger in with `y 20→0` per link (80ms delay between)
- **No autoplay, no looping, no bounce** — moderate means intentional, not showy

---

## Navigation

### Desktop
- `position: fixed`, `z-50`
- **Over hero (home, scroll position = 0)**: fully transparent background, Mint Cream text
- **Scrolled / all other pages**: Mint Cream bg (`bg-mint-cream/95 backdrop-blur-sm`), Deep Space Blue text, subtle shadow
- Logo/wordmark: left — "Andrea Pearson" in Cormorant Garamond until logo asset arrives
- Links: right — Books · About · Newsletter · Work With Me · The Show (external → andreapearsonshow.com)
- Active link: small Blood Red underline indicator

### Mobile
- Hamburger icon (right side of header)
- Opens full-screen Deep Space Blue overlay
- Large Cormorant Garamond nav links centered, stagger in via Framer Motion
- Close button top-right

---

## Home Page Structure

1. **Full-bleed hero** — `min-h-screen`, Deep Space Blue background
   - Wordmark top-left in nav; hero text centered
   - Hero headline (`text-hero`) from Firestore `content.headline`
   - Sub-text (`text-body`) from Firestore `content.intro`
   - Two CTAs: **Explore Books** (Blood Red → `/books`) + **The Show** (outline → external)
   - Scattered book covers: 3 canted covers on desktop (top-left, middle-right, bottom-left), 3 smaller peeking covers on mobile (top-left, middle-right, bottom-left corners)
   - Top scrim (`h-36` gradient) protects nav readability over book covers
   - Radial haze behind central text: tighter on desktop (45% ellipse, 0.48 opacity), wider + stronger on mobile (80% ellipse, 0.72 opacity)
   - Scroll indicator at bottom

2. **Bio + headshot section** — Mint Cream bg
   - Split layout: bio text (left) + headshot (right) on desktop; stacked on mobile
   - Short bio from Firestore `content.bioShort`
   - "Read more →" link to `/about`
   - Headshot from Firestore `content.headshotUrl`

3. **Featured books grid** — Mint Cream bg
   - Section heading with Blood Red accent rule
   - Up to 6 books where `book.featured === true`
   - 1-col mobile → 2-col sm → 3-col lg → 4-col desktop grid
   - Staggered scroll entrance animation

4. **Genre showcase strip** — Onyx bg
   - 3 genre cards: Fantasy · Romance · Clean Romance
   - Each card: genre name in `text-title` + book count + "Explore →"
   - Links to `/books/:genre`

---

## Book Card

- Cover image: `aspect-[2/3]`, `overflow-hidden` (no rounding)
- Title: `text-booktitle` Cormorant Garamond
- Hover: scale `1.02`, title shifts to Blood Red
- Type label (Novella, Short Story, etc.) in `text-xs` Inter, subdued — always rendered to keep card heights uniform
- Buy/Read CTA: Blood Red button (`text-xs`)
- Newsletter CTA: outline Deep Space Blue button, "Get for free here →" (`text-xs`)
- Both button types use `border` so box sizing is identical and buttons align

---

## Series Stack (Book Genre page)

- Animated book stack per series — books fan out on hover via Framer Motion variants
- Individual book lift on hover via CSS scale (separate inner div to avoid FM gesture conflict)
- Container dimensions uniform across all series in a genre so titles align
- Cover width: 150px desktop, 90px mobile (all pixel math scales proportionally)
- Mobile: no fan animation, no hover state — static diagonal stack only
- Grid: 1-col mobile → 2-col sm → 3-col md

---

## Loading States

Pattern: **skeleton shimmer** (`animate-pulse`) across all pages.
- Book card skeleton: cover placeholder + two text lines
- Text skeleton: 3 lines, last one shorter
- Replaces all `if (loading) return null` patterns

---

## Page-by-Page Notes

### About
- Headshot prominent, full bio text
- Genre bio links as styled cards (not plain list)

### Genre Bio (/about/:genre)
- Consistent with About layout
- Genre name as large Cormorant heading
- Blood Red accent rule under heading

### Books Landing
- Genre cards: more visual, colored fill or cover-art treatment
- Each card shows genre name + book count

### Book Genre (/books/:genre)
- Genre hero band: Deep Space Blue, full-bleed under transparent nav (`pt-24`)
- Hero is two-column on desktop: genre name + genre bio (right-aligned); stacked on mobile
- Genre bio placeholder shown when bio not yet set
- Series stack grid below hero, then standalone titles section
- Standalone books grid: 1-col mobile → 2-col sm → 3-col md → 4-col lg → 5-col xl

### Book Detail
- Large cover image (not tiny)
- Generous whitespace
- Blood Red "Buy / Read" CTA

### Newsletter
- Three CTAs styled distinctly per genre
- Generous layout, not a plain list

### Work With Me
- More restrained than book pages
- Blood Red on CTAs only, no decorative accents
- Clean, professional, trust-building

### 404
- On-brand — large Cormorant Garamond 404, Blood Red accent, link home

---

## Data Changes

| Change | Why |
|--------|-----|
| Add `featured: boolean` to book schema | Powers homepage featured books grid |
| Add `headshotUrl: string` to `settings/content` | Powers bio+headshot section on Home + About |
| Admin: featured toggle in BookForm | Andrea controls which books appear on homepage |
| Admin: headshotUrl field in Content editor | Admin can update headshot without code changes |
