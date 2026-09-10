# andreapearsonofficial — Project TODOs

## Phase 1 — Pre-Launch Polish

- [x] OG image / social share meta tags — full Open Graph + Twitter Card coverage added to `index.html` (og:url, og:site_name, image dimensions, canonical link). **og:image is a stopgap** using `andrea-headshot.jpg` (960×960, square) — swap for a proper 1200×630 designed share graphic once Andrea provides one; same known gap as the logo asset
- [x] Accessibility pass — alt text was already in good shape site-wide (added one defensive default on `FadingImage`). Two real, measured fixes:
  - Added a global `:focus-visible` outline (`index.css`) for consistent on-brand keyboard focus indication site-wide; fixed 8 admin inputs across 6 files that suppressed the outline via `focus:outline-none` without a strong enough replacement (added `focus-visible:ring-2`)
  - Fixed ~20 WCAG AA contrast failures found by computing actual contrast ratios for every reduced-opacity text color in use — `text-gray-400`/`text-gray-300` (2.4:1–1.3:1, both fail badly) bumped to `text-gray-600`; various `/50`-and-lower opacity text (`mint-cream`, `deep-space-blue`, `onyx`) bumped to `/60`–`/70` depending on direction (dark text needs a higher opacity floor than light text at the same background darkness, confirmed by the math). Scope: public pages only — admin panel contrast wasn't audited (lower priority, password-gated, known users)
- [x] Cross-browser check (Safari, Firefox, Chrome) — needs Joshua in-browser

---

## Phase 2 — Delivery

- [x] Tighten Firestore write rules to admin UID — both `firestore.rules` and `storage.rules` scoped writes from "any authenticated user" to Andrea's specific Auth UID (`ap@andreapearsonbooks.com`, the only account in the project). Deployed to production 2026-07-17
- [x] Custom domain + SSL — add andreapearsonofficial.com in Firebase Hosting console
- [x] Final QA pass on production URL
- [x] Deliver credentials + admin URL to Andrea

---

## Phase 3 — Staging / Test Environment

Local Firebase emulators, not a second cloud project. `npm run dev` talks only to emulators; data persists in `.staging/`; `npm run scrub:staging` overwrites that dump from prod. Prod writes only happen via production builds / `npm run deploy`. Runbook: [STAGING.md](./STAGING.md).

- [ ] Java + Firebase CLI available (Firestore emulator needs Java)
- [ ] `npm run scrub:staging` clones prod Auth / Firestore / Storage into `.staging/`
- [ ] `npm run dev` uses emulators (not prod). Admin login: cloned emails, password `staging`
- [ ] Confirm an admin write does not appear on andreapearsonofficial.com
- [ ] Confirm `npm run deploy` / `vite build` still target prod Firebase

---

## Phase 4 — A/B Testing

Post-launch deliverable — needs real production traffic to be meaningful, so it comes after Delivery rather than before it. Do this against the staging env first.

- [ ] Add Variant B fields to `AdminContent.jsx` for headline, intro, and hero CTA text
- [ ] `useVariant` hook — assigns `'a'` or `'b'` randomly on first visit, persists to `localStorage`
- [ ] Wire variant into `Home.jsx` hero (headline, intro, CTA text)
- [ ] Log impression + key click events to Firestore (`ab_events/{id}` — variant, event, page, timestamp)
- [ ] Admin analytics page — query `ab_events`, show variant A vs B table (impressions, CTA clicks, conversion rate)
- [ ] Wire additional pages/CTAs as needed (newsletter signup, book page CTA)

---

## Phase 5 — Homepage Hero Cover Sizing

Post-launch deliverable. Andrea wants to be able to resize the scattered hero book covers on the homepage herself, without needing a code change + redeploy each time (we hand-tuned these sizes/rotation/position several times by editing `SCATTER_DESKTOP`/`SCATTER_MOBILE` directly in `Home.jsx` during initial build — not sustainable for her long-term). Scope not yet decided — options:

- A single size scale/slider per breakpoint (desktop, mobile) applied uniformly to all 3 covers — simpler admin UI, less granular control
- Per-position sizing (3 desktop + 3 mobile, matching today's hardcoded array) — full control, more admin UI surface
- Natural home for this: extend the existing "Homepage Hero Covers" section in `AdminContent.jsx` (already has the position 1/2/3 book pickers from the Coming Soon Books work) rather than a new admin section
- Data model: likely new field(s) alongside `homepageHeroes` in `settings/content`, e.g. a scale/size value per slot or per breakpoint
