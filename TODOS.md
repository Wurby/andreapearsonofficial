# andreapearsonofficial — Project TODOs

Staging is in (`npm run dev` → emulators, `npm run scrub:staging` to re-clone prod). Runbook: [STAGING.md](./STAGING.md).

---

## Waiting on Andrea

- [ ] Logo asset (also needed as a proper OG share image — `og:image` is still the headshot stopgap)

---

## Phase 1 — A/B Testing

Post-launch. Needs real production traffic. Build and try it on staging first.

- [ ] Add Variant B fields to `AdminContent.jsx` for headline, intro, and hero CTA text
- [ ] `useVariant` hook — assigns `'a'` or `'b'` randomly on first visit, persists to `localStorage`
- [ ] Wire variant into `Home.jsx` hero (headline, intro, CTA text)
- [ ] Log impression + key click events to Firestore (`ab_events/{id}` — variant, event, page, timestamp)
- [ ] Admin analytics page — query `ab_events`, show variant A vs B table (impressions, CTA clicks, conversion rate)
- [ ] Wire additional pages/CTAs as needed (newsletter signup, book page CTA)

---

## Phase 2 — Homepage Hero Cover Sizing

Post-launch. Andrea wants to resize the scattered homepage hero covers herself, without a code change + redeploy (those sizes live in `SCATTER_DESKTOP` / `SCATTER_MOBILE` in `Home.jsx`). Scope not yet decided:

- A single size scale/slider per breakpoint (desktop, mobile) applied uniformly to all 3 covers — simpler admin UI, less granular control
- Per-position sizing (3 desktop + 3 mobile, matching today's hardcoded array) — full control, more admin UI surface
- Natural home: extend "Homepage Hero Covers" in `AdminContent.jsx` rather than a new admin section
- Data model: new field(s) alongside `homepageHeroes` in `settings/content`
