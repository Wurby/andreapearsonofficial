# Local staging (Firebase emulators)

`npm run dev` talks to **local emulators**, not prod. Staging data lives in `.staging/` and survives restarts. Prod is only reachable from a production build / `npm run deploy`.

Analytics: pageviews are still off in Vite (`trackEvent` is prod-only). The admin Dashboard function, when emulated, reads the existing prod GA4 property (read-only).

## You need

- Firebase CLI (`firebase --version`)
- Java 21+ for the Firestore emulator. System `java` can stay 17 — `npm run dev` / `npm run scrub:staging` set `JAVA_HOME` to Homebrew `openjdk@21` (`brew install openjdk@21`)
- `serviceAccountKey.json` in the repo root (gitignored) — **read** prod when scrubbing

## Commands

| Command | What it does |
|---|---|
| `npm run scrub:staging` | Overwrite `.staging/` with a clone of prod Auth + Firestore + Storage. Cloned admin password becomes `staging`. |
| `npm run dev` | Start emulators (import `.staging/` if present) + Vite. Saves `.staging/` on exit. |
| Emulator UI | [http://127.0.0.1:4000](http://127.0.0.1:4000) |
| `npm run deploy` | Production Hosting only (`--project andreapearsonofficial`). Vite production builds do **not** connect to emulators. |

`npm run dev:prod` is an escape hatch that runs Vite against **real** prod Firebase. Do not use it unless you intend to write to prod.

## First-time

```bash
npm install
npm run scrub:staging
npm run dev
```

Log into `/admin` with a cloned account email and password `staging`.

Change anything. Reload. It persists in `.staging/`. Prod is unchanged.

To throw staging away and copy prod again: `npm run scrub:staging` (works while `npm run dev` is running, or on its own).

## Safety

- `src/lib/firebase.js` connects to emulators only when `VITE_USE_EMULATORS=true`, which `npm run dev` sets. `npm run dev:prod` and `vite build` do not, so they talk to real Firebase. Restart Vite after switching commands — a leftover tab will keep the old bundle.
- `scripts/scrub-staging.mjs` dumps prod first with **no** emulator env vars set, then writes only to `127.0.0.1` emulator ports. It refuses to run if those env vars are already set.
- `.staging/` is gitignored.
