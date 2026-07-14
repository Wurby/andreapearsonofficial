# AGENTS.md — andreapearsonofficial.com

Source of truth for project context, conventions, and patterns. Read this before starting any work session.

---

## Project

Public author website for Andrea Pearson — YA fantasy, contemporary romance, and clean contemporary romance. Dual-purpose: fun and bookish for readers, professional for consulting (Work With Me). Site is live at andreapearsonofficial.com (Firebase Hosting).

---

## Tech Stack

- **Vite + React 19** — standard SPA
- **React Router v7** — file-based routing in `src/pages/`
- **Tailwind CSS v4** — `@theme` block in `src/index.css`, no `tailwind.config.js`
- **Framer Motion** — animations throughout; see patterns below
- **Firebase** — Auth (admin only), Firestore (all content), Storage (covers/headshots), Hosting, Cloud Functions (2nd gen, `functions/` — Blaze plan required), Analytics (GA4)

---

## Brand Colors

| Token | Hex | Role |
|-------|-----|------|
| `deep-space-blue` | `#002B4C` | 30% — nav, section fills, headings |
| `regal-navy` | `#003A67` | 30% — hover states, depth |
| `mint-cream` | `#F1F9F7` | 60% — page backgrounds |
| `onyx` | `#0A0C08` | body text |
| `blood-red` | `#900101` | 10% — CTAs, accents, hover moments |

60-30-10 rule strictly applied. Blood Red only on: primary CTA buttons, active nav indicator, section accent rules, hover color shifts.

---

## Type System

Seven tiers defined as custom Tailwind utilities in `src/index.css` (`@layer utilities`). Use these classes — never write raw `font-display text-Xsm md:text-Ysm` in JSX.

| Class | Font | Weight | Size |
|-------|------|--------|------|
| `text-hero` | Cormorant Garamond | 300 | `5xl → sm:7xl → md:8xl → lg:9xl` |
| `text-title` | Cormorant Garamond | 300 | `4xl → md:7xl` |
| `text-subtitle` | Cormorant Garamond | 400 | `3xl → md:6xl` |
| `text-booktitle` | Cormorant Garamond | 500 | `xl → md:2xl` |
| `text-caption` | Cormorant Garamond | 500 | `base` flat |
| `text-body` | Inter | normal | `lg` flat |
| `text-small` | Inter | normal | `base` flat |

Outside the tier system: `text-xs` for eyebrow labels, type taglines, nav UI. Global CSS sets h1=300, h2=400, h3–h6=500 automatically.

---

## Key Patterns

### Full-bleed hero detection
Nav and Layout both use this exact check (kept in sync manually — no shared constant) to decide whether to show a transparent nav or a spacer div:
```js
const isFullBleedHero =
  pathname === '/' ||
  pathname === '/about' ||
  pathname === '/books' ||
  pathname === '/newsletter' ||
  pathname === '/work-with-me' ||
  /^\/books\/[^/]+$/.test(pathname) ||
  /^\/books\/[^/]+\/series\/[^/]+$/.test(pathname)
```
Any new full-bleed hero page must be added here in both `Nav.jsx` and `Layout.jsx`.

### Framer Motion variant propagation
`whileHover="hover"` on a parent propagates the `"hover"` variant name down to all children that declare matching variant keys. Used for series stack fan animation — `SeriesCard` owns `whileHover`, `SeriesStack` children respond.

### Framer Motion gesture conflict fix
Never put `onHoverStart`/`onHoverEnd` on a child inside a parent that uses `whileHover` — it breaks FM's gesture tracking and leaves animations stuck. Fix: use raw `onMouseEnter`/`onMouseLeave` for child hover state, and a separate inner `<div>` with CSS `transform: scale()` + `transition` for any scale effect on the child.

### Mobile detection
`src/hooks/useIsMobile.js` — exports `useIsMobile(breakpoint = 640)`. Used in `BookGenre.jsx` to disable series stack animations and scale down cover widths on mobile.

### Series stack sizing
`coverW` in `BookGenre.jsx` is responsive (150px desktop, 90px mobile via `useIsMobile`). All pixel math inside `SeriesStack` scales via `s = coverW / 150`. Container dimensions are computed from `maxN` (largest series in the genre) so all stacks in a genre are uniform height.

### Button component
`src/components/Button.jsx` — pass `to` for React Router Link, `href` for external `<a>` (auto-adds `target/_blank` + `rel` for http URLs), or neither for a `<button>`. Props: `variant` (primary/outline/ghost, default primary), `size` (sm/md/lg, default lg). Spread any additional props (disabled, aria-*, etc.).

---

## File Structure

```
src/
  pages/            — public routes (Home, About, Books, BookGenre, BookDetail, etc.)
  admin/pages/      — admin routes (AdminDashboard, AdminBooks, AdminBookForm, etc.)
  admin/components/ — admin-only shared UI (BarList — ranked bar chart used on the Dashboard)
  components/       — shared UI (Nav, Footer, BookCard, Skeleton, Layout, SocialLinks,
                      PageViewTracker, ScrollToTop)
  hooks/            — data hooks (useBooks, useGenres, useSeries, useTypes, useContent,
                      useTheme, useIsMobile)
  lib/              — Firebase init (firebase.js) + analytics helper (analytics.js)
  index.css         — Tailwind @theme tokens + @layer utilities (type scale)
functions/          — Cloud Functions (own package.json, CommonJS, separate ESLint block —
                      see eslint.config.js). getSiteAnalytics queries the GA4 Data API for
                      the admin Dashboard's analytics charts; GA4_PROPERTY_ID lives in
                      functions/.env
```

---

## Analytics

GA4 tracking wired via `firebase/analytics`, gated behind `import.meta.env.PROD` (local dev never tracked) — see `src/lib/analytics.js`'s `trackEvent()` helper. Route-change pageviews handled by `PageViewTracker.jsx` (mounted in `Layout.jsx`, public routes only). Click events: `book_buy_click`, `newsletter_signup_click`, `work_with_me_cta_click`, `social_link_click`.

Admin-facing reporting lives on the Dashboard (`/admin`, merged in — not a separate route) and reads from GA4 via the `getSiteAnalytics` Cloud Function rather than a parallel Firestore counter system — GA4 is the single source of truth, so numbers lag reality by a few hours (GA4 processing delay). Every report is "rank these categories by one metric" (nominal categorical, one series), so each renders as a horizontal ranked bar list (`BarList.jsx`) in one consistent hue with the value direct-labeled at the bar's tip — no legend, no multi-hue categorical palette in play.

---

## Firestore Schema

- `books/{id}` — title, genre, series, seriesOrder, type, coverUrl, description, books2ReadLink, freeViaNewsletter, newsletterLink, featured, comingSoon, comingSoonDate
  - `comingSoon` (bool) + `comingSoonDate` (free-text timeframe, e.g. "Spring 2027", optional) — independent of `featured`, a book can be both. Renders a "Coming Soon" badge on `BookCard`/`BookDetail`; doesn't hide `books2ReadLink` (relabels its button to "Pre-order" instead of hiding it, since the link may be a legitimate pre-order URL).
- `genres/{id}` — name, slug, bio, colors (per-genre theme override — same shape as `settings/theme`, `null` when using site defaults)
- `series/{id}` — name, genreId
- `types/{id}` — name (seeded from the original hardcoded 5 values; managed on the Genres admin page's Types column)
- `settings/content` — headline, intro, bioShort, bioLong, headshotUrl, pullQuote, newsletters, homepageHeroes, podcast, workWithMe, socialLinks, contactEmail
  - `homepageHeroes` — fixed-length-3 array of book IDs (`''` for an empty slot), index = hero position. Controls which covers scatter behind the `Home.jsx` hero headline and in what order — independent of the `featured` flag on `books/{id}` (which drives the separate Featured Titles grid). Edited on the Content page's Homepage tab; a book can only occupy one slot, picking it into a new one clears the old one.
  - `podcast` — `{ eyebrow, heading, body, spotify: {enabled, url}, youtube: {enabled, url}, applePodcasts: {enabled, url} }`. Homepage section (above "About Andrea") renders one real embed per enabled platform — see `src/lib/podcastEmbeds.js` for how each platform's public URL gets turned into an iframe src (Spotify show embed, YouTube "uploads" playlist embed, Apple Podcasts embed). Section hides itself entirely if no platform is enabled/resolves.
- `settings/theme` — deepSpaceBlue, regalNavy, mintCream, onyx, bloodRed (site-wide color defaults, editable on the Theme admin page)

---

## Current Phase

Design work is mostly complete (key gaps: logo asset awaiting Andrea — also needed as a proper OG share image, current one's a headshot stopgap — and footer polish). Admin Panel Polish, Work With Me Content Rebuild, Google Analytics, the homepage Podcast Feature, and "Coming Soon" Books are all built and verified — see `TODOS.md` for the numbered phase list and remaining work. Phase 1 there is Pre-Launch Polish, in progress (OG tags and an accessibility/contrast pass are done; cross-browser check still needs Joshua). A/B Testing is a post-launch deliverable (needs real production traffic), so it's scheduled after Delivery rather than before it.

**Design decisions are locked** — see `design-doc.md` for the full specification. Update it whenever a design decision changes.

---

## Admin

Route: `/admin` — password-protected via Firebase Auth. Hidden entry point: lock icon in footer. Admin can manage all books, genres, series, site content, and covers. The Dashboard (`/admin`, index route) is also the analytics landing page — GA4-backed charts live there, not a separate route.
