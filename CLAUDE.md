# Cigar Journal

Kohlton's personal cigar journal: an offline-capable Home Screen web app (PWA) for logging smokes one-handed on his iPhone in the lounge, with a laptop layout for search, compare, and stats. Local-first: IndexedDB on each device is the source of truth. No backend in Phase 1.

**SPEC.md is the source of truth.** Read it before building. Build only Phase 1. Stop at the design checkpoint (SPEC section 16, step 4) and wait for Kohlton's OK on the look.

## Status

Phase 1 build in progress, one tab at a time at Kohlton's request (he looks at each before the next). Done: setup, shell and PWA, data layer, journal list, quick log, Cigars tab, Humidor tab, Settings and backup, Wishlist, Stats, Compare, full log. Every Phase 1 screen is built; what is left is the final acceptance pass in SPEC section 19 and Kohlton's phone checks. SPEC section 23 lists what changed along the way. Since 2026-10-12 a new smoke starts with the cigar's published flavor notes, and flavors are edited in one place (the Flavors step), not on each third. Since 2026-10-15 there is a Lounge tab: the sticks the lounge humidor stocks, split by strength, with a finder and flashcards. A lounge entry lives on the cigar record (`lounge`, SPEC section 4), not in a store of its own. Since 2026-10-16 the Cigars tab has a Select mode to add several sticks with one spot. The Lounge tab does not offer the old one-tap sheet add. A stick gets on the list only when he adds it. There is no lounge price field. Each lounge row has "Like this": the sheet's suggestions that are in the lounge, close matches by strength, and pairings.

The cigar list is researched (2026-10-11): 3,665 cigars in 267 brands, 3,591 fact-checked against maker and retailer sites. The first 935 came from the lounge sheet and a general list; the rest were found by sweeping makers' catalogs and four retailers (SPEC section 23). The results live in `seed/research/` (`batch-NN.json` and `more-NNN.json`); fix a cigar there and run `npm run seed`, and bump `SEED_VERSION` in the script so devices pick it up. Flavor notes found in a second, notes-only pass (2026-10-13, 248 cigars) live in `seed/flavor-notes.json`; 446 cigars have no published notes and stay empty. Never fill a cigar detail from memory: a field with no source stays empty.

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
- The repo is public. Never commit journal data, photos, backup files, the seed xlsx, tokens, or keys. The Supabase URL and anon key are public by design and live in repo variables and `.env.local`; the database password and any access token never go in the repo.
- Sync uses a Supabase project of its own. Never touch the Luper Ledger project (`wdinlqgnqaslnsunkxld`).
- Kohlton's real journal lives in the installed app. After the first deploy, any schema change needs a forward-only IndexedDB migration and a test. Never drop a store. Never auto-reload the app.
- Saves must reach IndexedDB in the same tick as the tap: no `await` between a user action and `putMany` (SPEC section 23 has the stress test that caught this).
- Never position or animate anything outside its own box, even inside an `overflow: hidden` parent. On a real iPhone that widened the page and shrank the whole app (SPEC section 23).
- Other sites share the `milehighpatriot.github.io` address. Only touch the `cigar-journal` database and caches this app created. No localStorage.
- **No em dashes in any visible UI text.** Copy is short, plain, and friendly.
- No analytics, trackers, or third-party requests at runtime. Fonts are self-hosted.
- Ask before installing anything system-wide (Homebrew, mkcert) or changing Mac settings. No accounts or sign-ups.
- Keep changes to what SPEC.md needs. No extra features, files, docs, or refactors. List ideas as follow-ups.
- Justify any new dependency in SPEC section 3 before adding it.

## Design

- Tokens: `src/styles/tokens.css`. Nothing else hard-codes a color, radius, or font.
- The finish (`src/styles/finish.css`, Havana label, 2026-10-24): cigar-label lithographs on every tab, the log, and the detail pages (`LabelArt`, pictures in `src/assets/`). Home shows the villa. Each page also carries a larger, see-through plate of its own (`ground-*.jpg`), low on the dark mount, and it is not the header picture. Label red on actions, a short red rule under each title. A smoke card wears a rail in that cigar's wrapper shade. Ready is palm green. No skyline drawing, neon, or pastel street.
- The logo (`Logo.tsx`, and `public/icon.svg` for the app icon): a crescent C and a cigar J, cream on the dark mount, label-red band, gold foot. After changing `public/icon.svg`, run `npm run icons`.
- Home (`#/`) is the front page; the journal list is at `#/journal`. Home leads with Log and the last smoke. The four counts sit under that.
- Dark only. Fraunces for titles and the score numeral (24 px and up), IBM Plex Sans for the rest, tabular numbers for scores, dates, and counts.
- Tap targets at least 48 by 48 px. Tap scales and chips, never drag sliders. Primary actions in the bottom half on phone. The floating Log button is that action.
- The wrapper rail belongs on smoke cards only.
- Score rings, charts, and wrapper and flavor dots stay. No stock photos. Honor reduced motion. Nothing glows or loops.
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
