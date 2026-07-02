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

## Phase 3 — Google Analytics

Scoped via `/grill-me` on 2026-07-02. GA4 is the single source of truth for all reporting — no parallel Firestore counters — so admin dashboard numbers lag reality by a few hours (GA4 processing delay) rather than being live. No cookie consent banner or privacy policy page (Utah/US audience, not pursuing EU-style consent gating). Local dev traffic excluded via `import.meta.env.PROD` gate; no other exclusion mechanism. GA4 property + GCP project currently live under Joshua's Google account — ownership transfers to Andrea at delivery (see Phase 6).

**Client-side tracking**

- [x] Wire up `firebase/analytics` (`getAnalytics()`) using the `measurementId` already present in `firebaseConfig` — new `src/lib/analytics.js` wraps it in a `trackEvent()` helper (handles `isSupported()` + the PROD gate in one place so call sites don't repeat it)
- [x] Route-change listener (same pattern as `ScrollToTop`) fires a `page_view` event on every in-app navigation — `PageViewTracker.jsx`, mounted in `Layout.jsx` (public routes only, not admin)
- [x] `book_buy_click` event (params: bookId, bookTitle, genre) on the book detail page's buy/read link
- [x] `newsletter_signup_click` event (params: newsletterLabel) on Newsletter page subscribe buttons
- [x] `work_with_me_cta_click` event (params: ctaType, consultantName) on Work With Me CTAs — both the per-consultant "Book a Session" and the "Inquire About Speaking" buttons
- [x] `social_link_click` event (params: platform) on the shared `SocialLinks` component — covers footer + Work With Me in one place
- [x] Gate all tracking calls behind `import.meta.env.PROD` — handled centrally in `src/lib/analytics.js`

**Admin dashboard — merged into `/admin` (first Cloud Function in this project)**

Originally its own `/admin/analytics` page; redesigned via `/dataviz` and folded into the Dashboard on 2026-07-02 so the admin's landing page IS the overview. `/admin/analytics` now redirects to `/admin`. Every report is "rank these categories by one metric" (nominal categorical, single series per chart), so each chart is a horizontal ranked bar list in one consistent hue (deep-space-blue) with the value direct-labeled at the bar's tip — no legend needed, no palette validator run (that's for multi-hue categorical palettes, not applicable here). New shared component: `src/admin/components/BarList.jsx`. Refetch on day-range change holds the previous render at reduced opacity rather than flashing to a loading skeleton.

- [x] Confirm whether GA4 is already linked via Firebase Console — confirmed linked (Firebase Console → Analytics showed the "no data yet" empty-chart dashboard, not a setup/enable prompt; a GA4 property already exists, it's just never received events)
- [x] Register custom dimensions in GA4 Admin for each event param above (bookId, bookTitle, genre, ctaType, consultantName, platform, newsletterLabel) so the Data API can report on them — caught and fixed a `BookTitle`/`bookTitle` casing mismatch (GA4 event params are case-sensitive) before it caused a silent data gap
- [x] Cloud Function (`functions/index.js`, `getSiteAnalytics`) queries the GA4 Data API via `batchRunReports` for: top books by views, top books by buy-clicks, top genres by views, top pages by views, newsletter/Work With Me/social click breakdowns, top traffic sources. GA4 property ID lives in `functions/.env` (non-secret, committed per Firebase convention). Book/genre views are derived from the standard `pagePath` dimension (no custom dimension needed) and decorated with human titles/names via a Firestore lookup at call time
- [x] Grant the function's GCP runtime service account "Viewer" access on the GA4 property — confirmed identity directly via the Cloud Functions v2 API rather than console UI: `210016091249-compute@developer.gserviceaccount.com`
- [x] Function verifies the caller's Firebase Auth token before returning data — `onCall` provides `request.auth` automatically; function throws `unauthenticated` if absent
- [x] Admin page UI: 7/30/90-day toggle, one report per chart — originally its own `AdminAnalytics.jsx` page with plain tables, later redesigned as ranked bar charts and merged into `AdminDashboard.jsx` (see note above)
- [x] Enable the Google Analytics Data API (`analyticsdata.googleapis.com`) on the GCP project — separate step from granting the service account GA4 Viewer access; missed it initially and hit a 500 (`PERMISSION_DENIED`) on first real call. Enabled directly via the Service Usage API rather than console UI
- [x] Fixed `batchRunReports` request count — GA4 caps batches at 5 requests, we had 6; split into two concurrent 3-request batches
- [x] Fixed a destructuring bug introduced by the batch split (`batchRunReports` resolves to a 3-tuple `[response, request, raw]`, and `Promise.all` wraps that again — was one level too shallow, verified against the real client shape before redeploying)

**Client-side tracking verified live** — GA4 Realtime report showed activity from the deployed site on 2026-07-02. **Cloud Function pipeline confirmed working end-to-end (no errors)** — auth check, GA4 Data API call, and Firestore lookups all succeed. `/admin/analytics` still shows empty tables as of 2026-07-02, which is expected: GA4 standard reports (what the Data API queries) lag Realtime by a few hours. Re-check after that delay before treating an empty dashboard as a bug.

Explicitly out of scope for this phase: cookie consent banner, Firestore view/click counters, real-time/instant dashboard data.

---

## Phase 4 — Podcast Feature (Homepage)

Andrea wants something on the homepage for her podcast ("The Show" — theandreapearsonshow.com, currently just an external footer link in `Footer.jsx`). Scope, placement, and content model (episode list? latest-episode embed? just a promo banner?) not yet decided — figure out in detail when we get here.

---

## Phase 5 — A/B Testing

- [ ] Add Variant B fields to `AdminContent.jsx` for headline, intro, and hero CTA text
- [ ] `useVariant` hook — assigns `'a'` or `'b'` randomly on first visit, persists to `localStorage`
- [ ] Wire variant into `Home.jsx` hero (headline, intro, CTA text)
- [ ] Log impression + key click events to Firestore (`ab_events/{id}` — variant, event, page, timestamp)
- [ ] Admin analytics page — query `ab_events`, show variant A vs B table (impressions, CTA clicks, conversion rate)
- [ ] Wire additional pages/CTAs as needed (newsletter signup, book page CTA)

---

## Phase 6 — Pre-Launch Polish

- [ ] OG image / social share meta tags
- [ ] Accessibility pass (alt text, focus states, contrast)
- [ ] Cross-browser check (Safari, Firefox, Chrome)

---

## Phase 7 — Delivery

- [ ] Tighten Firestore write rules to admin UID
- [ ] Custom domain + SSL — add andreapearsonofficial.com in Firebase Hosting console
- [ ] Transfer GA4 property + GCP project ownership from Joshua's Google account to Andrea's (see Phase 3)
- [ ] Final QA pass on production URL
- [ ] Deliver credentials + admin URL to Andrea
