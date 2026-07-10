# andreapearsonofficial — Project TODOs

## Phase 1 — Podcast Feature (Homepage)

- [x] Visually verify in browser — confirm all three embeds render correctly, the admin toggles/URL fields work as expected, and the section sits in the right spot on the page

---

## Phase 2 — "Coming Soon" Books

Andrea wants a way to mark a book as not yet released so it can appear on the site ahead of launch. Scope not yet decided — likely a `comingSoon` flag (and/or a `releaseDate` field) on the book schema, an admin toggle on the book form, and a visual treatment on `BookCard`/`BookDetail` (badge, release date display, buy/read link hidden or disabled until release). Also decide whether "coming soon" books should be filterable on the Books admin list and whether they're excluded from any "featured" rotation until released.

---

## Phase 3 — A/B Testing

- [ ] Add Variant B fields to `AdminContent.jsx` for headline, intro, and hero CTA text
- [ ] `useVariant` hook — assigns `'a'` or `'b'` randomly on first visit, persists to `localStorage`
- [ ] Wire variant into `Home.jsx` hero (headline, intro, CTA text)
- [ ] Log impression + key click events to Firestore (`ab_events/{id}` — variant, event, page, timestamp)
- [ ] Admin analytics page — query `ab_events`, show variant A vs B table (impressions, CTA clicks, conversion rate)
- [ ] Wire additional pages/CTAs as needed (newsletter signup, book page CTA)

---

## Phase 4 — Pre-Launch Polish

- [ ] OG image / social share meta tags
- [ ] Accessibility pass (alt text, focus states, contrast)
- [ ] Cross-browser check (Safari, Firefox, Chrome)

---

## Phase 5 — Delivery

- [ ] Tighten Firestore write rules to admin UID
- [ ] Custom domain + SSL — add andreapearsonofficial.com in Firebase Hosting console
- [ ] Transfer GA4 property + GCP project ownership from Joshua's Google account to Andrea's (currently both live under Joshua's account)
- [ ] Final QA pass on production URL
- [ ] Deliver credentials + admin URL to Andrea
