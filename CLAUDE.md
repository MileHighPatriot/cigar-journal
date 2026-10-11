# Cigar Journal

Kohlton's personal cigar journal: an offline-capable Home Screen web app (PWA) for logging smokes one-handed on his iPhone in the lounge, with a laptop layout for search, compare, and stats. Local-first: IndexedDB on each device is the source of truth. No backend in Phase 1.

**SPEC.md is the source of truth.** Read it before building. Build only Phase 1. Stop at the design checkpoint (SPEC section 16, step 4) and wait for Kohlton's OK on the look.

## Status

Phase 1 build in progress, one tab at a time at Kohlton's request (he looks at each before the next). Done: setup, shell and PWA, data layer, journal list, quick log, Cigars tab, Humidor tab, Settings and backup, Wishlist, Stats, Compare, full log. Every Phase 1 screen is built; what is left is the final acceptance pass in SPEC section 19 and Kohlton's phone checks. SPEC section 23 lists what changed along the way.

## Commands

- Dev server: `npm run dev` (port 5173, bound to the network)
- Build: `npm run build`
- Type-check: `npm run typecheck`
- Lint: `npm run lint` (`npx biome check --write .` applies safe fixes)
- Tests: `npm test`
- Preview the production build: `npm run preview` (port 4173)
- Regenerate the seed catalog: `npm run seed`
- Regenerate icons: `npm run icons`
- Sample data: open `#/dev` in the dev server (not in production builds)

## Addresses (each has its own separate data)

- Live, the real app: https://milehighpatriot.github.io/cigar-journal/ (live since 2026-10-10; each save updates it)
- Mac: http://localhost:5173 (dev), http://localhost:4173 (preview; offline and install checks happen here)
- Phone layout preview on home Wi-Fi: http://kohltons-macbook-pro.local:5173, or by IP from `ipconfig getifaddr en0`. Plain HTTP, so no offline or install there. Test data only.

## Rules

- **No commit and no push until Kohlton says "save".** Save = commit, push `main` to both GitHub and Cursor Origin (`git push origin main` covers both; check `git remote -v` first), confirm both with `git ls-remote`, confirm the Pages run finished, then one line back with the live address. Never force-push. If a push is rejected, stop and say so.
- The brief first said no remote and no deploy. Kohlton changed that in the interview on 2026-10-10: public GitHub repo, Cursor Origin copy, live on GitHub Pages. Pushing on "save" is the only deploy. Nothing else gets deployed anywhere.
- The repo is public. Never commit journal data, photos, backup files, the seed xlsx, tokens, or keys.
- Kohlton's real journal lives in the installed app. After the first deploy, any schema change needs a forward-only IndexedDB migration and a test. Never drop a store. Never auto-reload the app.
- Other sites share the `milehighpatriot.github.io` address. Only touch the `cigar-journal` database and caches this app created. No localStorage.
- **No em dashes in any visible UI text.** Copy is short, plain, and friendly.
- No analytics, trackers, or third-party requests at runtime. Fonts are self-hosted.
- Ask before installing anything system-wide (Homebrew, mkcert) or changing Mac settings. No accounts or sign-ups.
- Keep changes to what SPEC.md needs. No extra features, files, docs, or refactors. List ideas as follow-ups.
- Justify any new dependency in SPEC section 3 before adding it.

## Design

- Tokens: `src/styles/tokens.css`. Nothing else hard-codes a color, radius, or font.
- Dark only. Libre Caslon Display for titles and the score numeral (24 px and up), IBM Plex Sans for the rest, tabular numbers for scores, dates, and counts.
- Tap targets at least 48 by 48 px. Tap scales and chips, never drag sliders. Primary actions in the bottom half on phone.
- The brass "band" rule belongs on smoke cards only.
- The look is lively on purpose (score rings, charts, color dots, motion; SPEC section 23), but no artwork or stock pictures of cigars: Kohlton's own photos are the pictures. Honor reduced motion.
- The "avoid" list in SPEC section 12 is binding.

## Verify before calling anything done

1. Build, type-check, lint, and tests all pass (commands above, once they exist).
2. Run the acceptance checks in SPEC section 19 for real and report each result.
3. Screenshots go in `./screenshots/` as `<width>-<screen>.png` at 375, 768, and 1440 px. At each width: no console errors and no sideways scroll.
4. Em dash check: `grep -rn "—" src index.html public` finds nothing.
5. Offline check: build, preview at localhost:4173, load once, stop the server, reload. The journal and photos still show.
6. Hand Kohlton the phone checks from SPEC section 19 (install, camera, HEIC, offline, backup, timer).

## Report format

SPEC section 20. Outcome first. Plain words. Brief.
