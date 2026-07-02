# andreapearsonofficial.com

Public author website for Andrea Pearson — YA fantasy, contemporary romance, and clean contemporary romance, plus a professional consulting section (Work With Me). Live at [andreapearsonofficial.com](https://andreapearsonofficial.com) on Firebase Hosting.

Full project context, conventions, and patterns live in [AGENTS.md](./AGENTS.md) — read that before making changes, not this file.

## Stack

Vite + React 19, React Router v7, Tailwind CSS v4, Framer Motion, Firebase (Auth, Firestore, Storage, Hosting, Cloud Functions, Analytics/GA4).

## Setup

```bash
npm install
cp .env.example .env   # fill in Firebase web app config
npm run dev
```

`.env` needs the Firebase web app config (`VITE_FIREBASE_*`) — get these from Firebase Console → Project Settings → General → Your apps. Admin actions that use the Admin SDK directly (e.g. `scripts/upload-headshot.mjs`) need `serviceAccountKey.json` in the project root (gitignored, not the same thing as `.env`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint across the frontend (`src/`) and Cloud Functions (`functions/`) |
| `npm run deploy` | Build, then deploy to Firebase Hosting |

Cloud Functions deploy separately and aren't wrapped in an npm script: `firebase deploy --only functions`.

## Admin panel

`/admin` — password-protected via Firebase Auth (hidden entry point: lock icon in the footer). Manages books, genres, series, site content, theme colors, and site analytics (Dashboard).

## Project structure

See AGENTS.md's File Structure section for the full breakdown. Short version: `src/pages/` is the public site, `src/admin/` is the admin panel, `functions/` is the one Cloud Function backing the admin Dashboard's analytics charts (queries the GA4 Data API).
