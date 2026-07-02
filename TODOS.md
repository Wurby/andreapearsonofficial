# andreapearsonofficial — Project TODOs

## Brand Colors

| Name | Hex |
|------|-----|
| Deep Space Blue | #002B4C |
| Regal Navy | #003A67 |
| Mint Cream | #F1F9F7 |
| Onyx | #0A0C08 |
| Blood Red | #900101 |

---

## Stack

- Vite + React 19
- React Router v7
- Tailwind CSS v4 (no component libraries)
- Framer Motion
- Firebase: Auth, Firestore, Storage, Hosting

---

## Phase 1 — Admin Panel Polish ← implemented, pending visual review

- [x] Dashboard
  - [x] Remove the `SECTIONS` link-card list (redundant with sidebar nav) — keep stats row only
- [x] Login
  - [x] Sign-out (in `AdminLayout.jsx`) should navigate to `/` (public home) after `signOut(auth)`
- [x] Books list
  - [x] Series filter: never disabled regardless of genre selection; narrows to the selected genre when one is picked; added a "No series assigned" option
  - [x] Add a "Featured" filter
  - [x] Sortable columns (asc/desc toggle) for Title, Genre, Series, Type
  - [x] Style the filter dropdowns
  - [x] Move "+ Add Book" button inline with the filter row instead of floating top-right
  - [ ] Delete confirm still uses native `window.confirm()` — left as-is by default; swap for a styled modal on request
- [x] Book form
  - [x] Inline "add new genre" affordance on the form
  - [x] Inline "add new type" affordance on the form
  - [x] Convert `TYPES` (hardcoded array) into a real Firestore `types` collection (`useTypes.js`, auto-seeded with the 5 original values so existing books resolve correctly)
- [x] Genres
  - [x] Fix delete link color to `blood-red`
  - [x] Add a second column for Types management (name list + add/delete) — flex layout, collapses to single column on narrow screens; container widened to `max-w-5xl`
- [x] Series
  - [x] Inline "add new genre" option within the Add Series form
  - [x] Style the genre dropdown in the Add Series form
- [x] Theme
  - [x] Add per-genre color override editing here too (same `genre.colors` field as the Genres page — stays in sync)
  - [x] Confirmed genre colors already cascade to books/series pages under that genre via `ThemeContext` — no fix needed
- [x] Content
  - [x] Break into tabs: Homepage / Author Bio / Newsletters / Social Links / Contact Links (single Save button still saves all tabs at once)

**Not yet visually verified in browser — Joshua to review each page.**

---

## Phase 2 — Work With Me Content Rebuild ← implemented, pending visual review

`WorkWithMe.jsx` is ~150 lines of almost entirely hardcoded copy with no Content-settings surface (found during Phase 1 admin content audit). Needs a structured schema addition, not flat fields:

- [x] Add a repeatable "consultants" array to content schema (name, tagline, bio paragraphs, CTA) — replaces the two hardcoded blocks (Andrea Pearson, Nolan J. Skinner). Stored under `settings/content.workWithMe.consultants`, each `{ name, tagline, bio, ctaLabel }`; `bio` is a single string, paragraphs separated by a blank line
- [x] Add editable fields for the "Done-for-You Services" block (heading, tag, body paragraphs) — `workWithMe.doneForYou.{heading, tag, body}`
- [x] Add editable fields for "Speaking & Workshops" (body paragraphs, "Andrea speaks to" bullet list, "Speaking Topics" bullet list) — `workWithMe.speaking.{body, speaksTo[], speaksToNote, topics[], ctaLabel}`, bullet lists are repeatable string-array fields with add/remove
- [x] Resolve the separate hardcoded contact email (`ap@andreapearsonbooks.com`, used 3x for `CONSULTATION_EMAIL`/`SPEAKING_EMAIL`/visible link) — decided: own field, `workWithMe.contactEmail`, distinct from the generic `contactLinks` array (that array is a different concept — arbitrary footer/contact link list, not a single canonical CTA address)
- [x] Build the corresponding admin UI — new "Work With Me" tab on the Content page (`AdminContent.jsx`), between Newsletters and Social Links
- [x] Wire `WorkWithMe.jsx` to read all of the above instead of hardcoded JSX — admin form seeds from the existing hardcoded copy as defaults (`DEFAULT_WORK_WITH_ME`) so the public page won't go blank until Andrea/Joshua opens the tab and hits Save once

**Not yet visually verified in browser — Joshua to review, then save the Work With Me tab once in admin to persist the migrated defaults to Firestore.**

Also flagged as cleanup (not schema-related, do opportunistically): `TYPE_LABELS` duplicated in `BookDetail.jsx`/`BookCard.jsx`, "{n} book(s)" pluralization duplicated in `BookGenre.jsx`/`SeriesDetail.jsx`, Nav/Footer link lists duplicated, "The Show" URL hardcoded in 3 places.

---

## Phase 3 — Google Analytics + A/B Testing

- [ ] Google Analytics integration (measurementId: G-SHHGS0FHKL)
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
- [ ] Final QA pass on production URL
- [ ] Deliver credentials + admin URL to Andrea
