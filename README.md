# andreapearsonofficial.com

Public author website for Andrea Pearson — YA fantasy, contemporary romance, and clean contemporary romance, plus a professional consulting section (Work With Me). Live at [andreapearsonofficial.com](https://andreapearsonofficial.com) on Firebase Hosting.

Full project context, conventions, and patterns live in [AGENTS.md](./AGENTS.md) — read that before making changes, not this file.

## Stack

Vite + React 19, React Router v7, Tailwind CSS v4, Framer Motion, Firebase (Auth, Firestore, Storage, Hosting, Cloud Functions, Analytics/GA4).

## Setup

```bash
npm install
cp .env.example .env   # fill in Firebase web app config
npm run scrub:staging  # clone prod data into local emulators (needs serviceAccountKey.json)
npm run dev            # emulators + Vite — does not write to prod
```

`.env` needs the Firebase web app config (`VITE_FIREBASE_*`) — get these from Firebase Console → Project Settings → General → Your apps. `npm run scrub:staging` needs `serviceAccountKey.json` in the project root (gitignored) to **read** prod; it only **writes** to local emulators. See [STAGING.md](./STAGING.md).

`npm run dev` starts Firebase emulators (Auth, Firestore, Storage, Functions) plus Vite. Staging data persists in `.staging/` (gitignored). The Firestore emulator needs Java 21+; `npm run dev` / `npm run scrub:staging` point `JAVA_HOME` at Homebrew `openjdk@21` so system Java 17 can stay.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Emulators + Vite. Local staging only; prod is not written |
| `npm run scrub:staging` | Overwrite `.staging/` with a fresh clone of prod |
| `npm run build` | Production build to `dist/` (real Firebase, no emulators) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint across the frontend (`src/`) and Cloud Functions (`functions/`) |
| `npm run deploy` | Build, then deploy Hosting to **prod** (`andreapearsonofficial`) |

Cloud Functions deploy separately and aren't wrapped in an npm script: `firebase deploy --only functions`.

## Admin panel

`/admin` — password-protected via Firebase Auth (hidden entry point: lock icon in the footer). Manages books, genres, series, site content, theme colors, and site analytics (Dashboard).

## Project structure

See AGENTS.md's File Structure section for the full breakdown. Short version: `src/pages/` is the public site, `src/admin/` is the admin panel, `functions/` is the one Cloud Function backing the admin Dashboard's analytics charts (queries the GA4 Data API).
