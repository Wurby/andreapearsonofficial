# andreapearsonofficial — Project TODOs

## Phase 1 — Pre-Launch Polish

- [x] OG image / social share meta tags — full Open Graph + Twitter Card coverage added to `index.html` (og:url, og:site_name, image dimensions, canonical link). **og:image is a stopgap** using `andrea-headshot.jpg` (960×960, square) — swap for a proper 1200×630 designed share graphic once Andrea provides one; same known gap as the logo asset
- [x] Accessibility pass — alt text was already in good shape site-wide (added one defensive default on `FadingImage`). Two real, measured fixes:
  - Added a global `:focus-visible` outline (`index.css`) for consistent on-brand keyboard focus indication site-wide; fixed 8 admin inputs across 6 files that suppressed the outline via `focus:outline-none` without a strong enough replacement (added `focus-visible:ring-2`)
  - Fixed ~20 WCAG AA contrast failures found by computing actual contrast ratios for every reduced-opacity text color in use — `text-gray-400`/`text-gray-300` (2.4:1–1.3:1, both fail badly) bumped to `text-gray-600`; various `/50`-and-lower opacity text (`mint-cream`, `deep-space-blue`, `onyx`) bumped to `/60`–`/70` depending on direction (dark text needs a higher opacity floor than light text at the same background darkness, confirmed by the math). Scope: public pages only — admin panel contrast wasn't audited (lower priority, password-gated, known users)
- [x] Cross-browser check (Safari, Firefox, Chrome) — needs Joshua in-browser

---

## Phase 2 — Delivery

- [ ] Tighten Firestore write rules to admin UID
- [ ] Custom domain + SSL — add andreapearsonofficial.com in Firebase Hosting console
- [ ] Transfer GA4 property + GCP project ownership from Joshua's Google account to Andrea's (currently both live under Joshua's account)
- [ ] Final QA pass on production URL
- [ ] Deliver credentials + admin URL to Andrea

---

## Phase 3 — A/B Testing

Post-launch deliverable — needs real production traffic to be meaningful, so it comes after Delivery rather than before it.

- [ ] Add Variant B fields to `AdminContent.jsx` for headline, intro, and hero CTA text
- [ ] `useVariant` hook — assigns `'a'` or `'b'` randomly on first visit, persists to `localStorage`
- [ ] Wire variant into `Home.jsx` hero (headline, intro, CTA text)
- [ ] Log impression + key click events to Firestore (`ab_events/{id}` — variant, event, page, timestamp)
- [ ] Admin analytics page — query `ab_events`, show variant A vs B table (impressions, CTA clicks, conversion rate)
- [ ] Wire additional pages/CTAs as needed (newsletter signup, book page CTA)
