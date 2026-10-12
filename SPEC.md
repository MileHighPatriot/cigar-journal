# Cigar Journal: Phase 1 spec

Written 2026-10-10. Status: waiting for Kohlton's approval. No app code exists yet.

This file stands on its own. A fresh session should be able to build Phase 1 from it without the original brief.

## 1. What this is

A personal cigar journal for Kohlton, who works the floor at the Stanley Pappas cigar lounge in Denver. It is not a business site and not for guests.

- Mostly used on an iPhone in the lounge: one-handed, dim warm light, weak signal.
- Later browsed on a Mac laptop: search, compare, stats.
- Goal: log a smoke in under a minute with one thumb, or in full detail third by third. Data is never lost: it autosaves, works offline, and can be backed up and restored, photos included.

It exists because cigar apps are glitchy. The build must be the opposite of the common complaints:

| Complaint in app reviews | What this app does |
|---|---|
| Entries vanish or fail to save | Autosave on every change, drafts, soft delete with Undo, backups |
| Every rating ends up 4.0 | Lounge 100: four 1 to 10 scales mapped to a 100-point score |
| One review per cigar | Every smoke is its own entry; cigar pages show the trend |
| Boutique cigars missing | "Add new cigar" is always visible; manual entry always works |
| No import or export | Full backup file with photos, plus CSV |
| iOS crashes, apps pulled from the store | Home Screen web app (PWA), no App Store |

## 2. Decisions from the interview (2026-10-10)

These came from Kohlton's answers and override the original brief where they differ.

1. **Hosting changed.** The brief said no repo, remote, or host. Kohlton changed that: make a GitHub repo and put the app live on GitHub Pages with a clickable address.
   - Repo: `MileHighPatriot/cigar-journal`, public (GitHub Free needs a public repo for Pages), plus the Cursor Origin copy `milehigh-patriot/cigar-journal`.
   - Live address: `https://milehighpatriot.github.io/cigar-journal/`
   - Nothing has been created on GitHub or Origin yet. The build session does it (section 16, step 0).
   - "No commit until I say save" still holds. "Save" now means commit, push to both hosts, and the live site updates a minute or two later.
   - Journal entries and photos never go to GitHub. Only code and the seed catalog are public. The site carries `noindex`.
2. **Seed file.** Use `~/Downloads/stanley_pappas_cigar_list.xlsx` (dated Oct 9). The build session copies it to `seed/stanley-cigar-guide.xlsx`. The Downloads copy is left alone.
3. ~~Each size is its own cigar.~~ **Changed 2026-10-10: the size is noted on each smoke** (`vitola`, `lengthIn`, `ringGauge` on the smoke), picked from chips on the last log step. A cigar stays one entry per line with one score trend. A cigar's own size fields remain for cigars Kohlton adds by hand, and a smoke with no size falls back to them. See section 23.
4. **Extra sheet columns kept:** "Other Wrapper Versions" and "If they like this, suggest", as reference text on the cigar page. Not kept: Smoke Time, Best For, Wrapper Confidence, Tried it.
5. **Extra field:** "Price paid" on a smoke, for singles bought and smoked the same day. It feeds spend by month.
6. **Sheet flavor notes show on the cigar page only.** Nothing is suggested in the tag picker while tasting.

## 3. Stack

Static single-page app. No server in Phase 1. Node on this Mac is v22.23.1, which meets every engine range below. Versions were read from the npm registry on 2026-10-10. Install the listed major and let npm pick the latest patch.

### Runtime dependencies

| Package | Version | Why it is here |
|---|---|---|
| react, react-dom | 19.3 | The UI. Same stack as Kohlton's Luper Ledger, which already builds and deploys to Pages from this Mac. Preact 11 came out ten days ago and its Vite preset support is unconfirmed. |
| wouter | 3.13 | Tiny router with a hash-location hook. Hash routes need no server fallback on GitHub Pages. |
| idb | 8.0 | Thin promise wrapper over IndexedDB (about 1 kB). All we need is transactions and indexes. Dexie is larger and its extras are not needed at 500 entries. |
| fflate | 0.8 | Builds and reads the backup zip in the browser, streaming, without recompressing photos. |
| lucide-react | 1.55 | One outline icon set. Tree-shaken, and `strokeWidth={1.5}` matches the design. |
| @fontsource/libre-caslon-display | 5.3 | Self-hosted woff2 for titles and the score numeral. |
| @fontsource-variable/ibm-plex-sans | 5.3 | Self-hosted woff2, one file for all weights. |
| @supabase/supabase-js | 2.117 | Added 2026-10-10 for automatic sync: sign-in with token refresh, the database call, and photo storage. Loaded as its own chunk (55 kB gzipped) only when sync is configured. |

No state library (a small store with `useSyncExternalStore`), no CSS framework (plain CSS with custom properties and CSS modules), no chart library (hand-drawn SVG), no date library (`Intl.DateTimeFormat`).

### Dev dependencies

| Package | Version | Why |
|---|---|---|
| vite | 8.3 | Dev server and static build. |
| @vitejs/plugin-react | 6.1 | React support for Vite 8. |
| typescript | 6.0 (pin `~6.0.3`) | Type checking. TypeScript 7.0 is brand new; 6.0 is what Luper Ledger uses with this same Vite and Vitest. |
| vite-plugin-pwa | 2.0 | Manifest and Workbox service worker. See the note below. |
| vitest | 5.0 | Unit tests. |
| fake-indexeddb | 6.2 | IndexedDB in unit tests (merge, repository). |
| @biomejs/biome | 2.5 | Lint and format in one package, with no TypeScript peer limits. |
| @vite-pwa/assets-generator | latest | One-time icon generation from one SVG. Check its version with `npm view` before installing. |

**vite-plugin-pwa note.** 2.0.0 was released on 2026-10-03 and its docs site still shows older text. Read the 2.0 release notes before configuring it. If the build or the offline check fails for a reason traced to the plugin, pin `1.3.x`, which also supports Vite 8. A known deprecation warning about `inlineDynamicImports` under Vite 8 is not fatal.

**Seed converter.** `scripts/seed_from_xlsx.py` uses only Python's standard library (`zipfile` and `xml.etree`), run with `/usr/bin/python3 -I`. That avoids adding an xlsx package. The same approach read this exact file cleanly during planning.

## 4. Data model

IndexedDB database `cigar-journal`, version 1. The name must stay unique because Kohlton's other GitHub Pages sites share the `milehighpatriot.github.io` address (section 17).

Every synced record has:

| Field | Type | Notes |
|---|---|---|
| id | string | UUID from `crypto.randomUUID()` |
| createdAt | string | ISO 8601 UTC from `toISOString()` |
| updatedAt | string | Set on every write. Merge and future sync compare this. |
| deletedAt | string or null | Soft delete. Deleting also bumps updatedAt. |

### Stores

| Store | Key | Indexes | Holds |
|---|---|---|---|
| cigars | id | updatedAt | Catalog records |
| smokes | id | updatedAt, cigarId, lotId | Journal entries, including drafts |
| lots | id | updatedAt, cigarId | Humidor lots |
| wishlist | id | updatedAt | Wishlist items |
| customTags | id | updatedAt | Flavor tags Kohlton adds |
| photos | id | updatedAt, smokeId | Photo details (no image bytes) |
| photoFull | id | none | `{ id, mime, bytes: ArrayBuffer }` |
| photoThumb | id | none | `{ id, mime, bytes: ArrayBuffer }` |
| meta | key | none | Device-only settings. Never exported or synced. |

Image bytes are stored as ArrayBuffer plus MIME type, not Blob. Blob-in-IndexedDB bugs showed up on iOS as recently as 18.4, and no primary source says they are gone.

### Cigar

| Field | Type |
|---|---|
| brand | string |
| line | string |
| vitola | string or null (size name, for example "Robusto") |
| lengthIn | number or null (inches) |
| ringGauge | number or null |
| shape | "parejo", "box-pressed", "figurado", or null |
| wrapperType | string or null (Connecticut, Habano, Maduro/Broadleaf, and so on) |
| wrapperOrigin | string or null |
| binder, filler | string or null |
| country, factory | string or null |
| strength | 1 to 5 or null (section 6 scale) |
| priceTier | 1, 2, 3, or null ($, $$, $$$) |
| notes | string |
| confirmed | boolean. False for seeded records until Kohlton taps "Looks right" or edits it. Shows an "Unconfirmed" label. |
| source | "seed" or "manual" |
| sheetFlavors | string[] (from the sheet's Flavor Notes, shown on the cigar page only) |
| sheetPairings | string[] (from Pairings) |
| otherWrapperVersions | string or null |
| similarCigars | string or null (from "If they like this, suggest") |

Two cigars are the same line when brand and line match after trimming and lowercasing. The cigar page lists them under "Other sizes". "Add another size" makes a new cigar that copies the blend fields and clears vitola, length, and ring gauge.

### Smoke

| Field | Type |
|---|---|
| status | "draft" or "complete" |
| mode | "quick" or "full" |
| draftStep | string or null (the step to reopen on resume) |
| cigarId | string (required; a smoke is created the moment a cigar is picked) |
| lotId | string or null (set when logged from the humidor) |
| pricePaid | number or null (USD; only when lotId is null) |
| smokedAt | string (defaults to now; editable) |
| timerStartedAt, timerStoppedAt | string or null |
| durationMin | number or null (filled from the timer on stop; editable by hand) |
| prelight | `{ wrapperNotes, footAroma, coldDraw: string; cutType: "straight", "v-cut", "punch", "other", or null; lightMethod: "torch", "soft flame", "match", "cedar spill", "other", or null }` |
| thirds | `{ first, second, final }`, each `{ tags: string[], strength: 1-5 or null, body: 1-5 or null, retrohale: string, note: string, issues: string[] }`. Issues: tight draw, loose draw, canoe, tunneling, run, relight, touch-up. |
| draw | "tight", "ideal", "loose", or null |
| burn | "even", "wavy", "uneven", or null |
| ashFirmness | "firm", "flaky", or null |
| ashColor | "light", "dark", or null |
| smokeVolume | "light", "medium", "full", or null |
| relights, touchUps | number (default 0) |
| strength, body | 1 to 5 or null (whole cigar) |
| quickTags | string[] (up to 3 in quick log) |
| pairingType | coffee, espresso, tea, bourbon, rye, scotch, rum, tequila, cognac, beer, wine, port, soda, water, other, or null |
| pairingName | string |
| setting | "lounge" (default, shown as "Stanley Pappas lounge"), "home", "patio", "other" |
| settingOther | string |
| company | string |
| environment | "indoor", "outdoor", or null |
| conditions, mood | string |
| ratings | `{ appearance, smoking, flavor, overall }`, each 1 to 10 in half steps, or null |
| score | number or null (exact, 3 decimals) |
| rubricVersion | 1 |
| wouldBuyAgain | "no", "single", "few", "box", or null |
| summary | string |

Worked-out values, never stored:
- **Verdict**: from the rounded score (section 5).
- **Effective tags**: quickTags plus all thirds' tags, de-duplicated. Search, filters, stats, and CSV use these.
- **Effective strength**: the smoke's `strength` if set, else the rounded mean of the thirds' strengths, else the cigar's strength.

### Humidor lot

| Field | Type |
|---|---|
| cigarId | string |
| quantityPurchased | number |
| quantityRemoved | number (given away or tossed; default 0) |
| purchaseDate | string (date) |
| priceEach | number or null |
| boughtAt | string (default "Stanley Pappas") |
| boxDate | string (date) or null |
| boxCode | string |
| restUntil | string (date) or null |
| notes | string |

**Remaining is worked out, not stored**: `quantityPurchased - quantityRemoved - (smokes with this lotId that are not deleted)`. Drafts count, since the cigar is already out of the box. This is what makes the humidor safe to merge between devices, and it makes delete and Undo correct with no extra code.

- Days aged: today minus boxDate if set, else purchaseDate.
- Ready to smoke: remaining above 0 and restUntil empty or not in the future.
- Humidor value: sum of remaining times priceEach.

### Wishlist item

`cigarId`, `why`, `heardFrom`, `status` ("open" or "bought"), `boughtLotId` (string or null). "Bought it" opens the new-lot form filled in with that cigar. Saving the lot sets status to "bought" and links the lot.

### Custom tag

`label` (lowercase), `family` (one of the family keys in section 7). Smokes store tag labels as plain strings. If two custom tag records share a label after a merge, the picker shows it once.

### Photo

`smokeId`, `kind` ("band", "stick", "wrapper", "foot", "ash", "setting", "box"), `width`, `height`, `byteSize`, `order`. Image bytes never change after capture. Bytes of a photo deleted more than 30 days ago are removed at startup; its record stays so the delete carries to the other device.

### Meta keys (this device only)

`seedVersion`, `lastExportAt`, `backupBannerSnoozedUntil`, `persistResult`, `installHintDismissed`, `lastLogMode`, `deviceId`.

### Data layer shape (so sync plugs in later)

```
UI  ->  store (in-memory cache, useSyncExternalStore)  ->  Repository interface  ->  IdbRepository
                                                                 ^
                                                Phase 2: SyncEngine reads and writes here too
```

- `Repository` is the only code that touches IndexedDB. Methods: `getAll(store)`, `put(store, record)`, `softDelete(store, id)`, `restore(store, id)`, `changedSince(store, iso)`, plus photo byte read and write.
- `put` stamps `updatedAt`. A write resolves only after the IndexedDB transaction completes. The UI shows "Saved" only then.
- All non-photo records load into memory at startup. At 500 smokes that is a few hundred kB.
- `changedSince` uses the `updatedAt` index. Phase 2 sync is "push what changed since last sync, pull what changed remotely, newer updatedAt wins", which is the same rule backup merge uses in Phase 1. Both share `src/data/merge.ts`.
- Schema changes after the first deploy must bump the database version with a forward-only migration and a unit test. Never drop a store. Real data will be on the phone.

## 5. Lounge 100 scoring

Cigar Aficionado's four categories and weights, collected on a 1 to 10 tap scale with half points, converted to the 100-point range the magazines use.

| Category | Weight | What it covers | Anchor 1 | Anchor 5 | Anchor 10 |
|---|---|---|---|---|---|
| Appearance & construction | 0.15 | wrapper, veins, firmness, cap | Rough | Average | Flawless |
| Smoking characteristics | 0.25 | draw, burn, ash, smoke volume and temperature, relights | Fought it | Decent | Effortless |
| Flavor | 0.25 | richness, complexity, balance, no harshness | Harsh | Pleasant | Stunning |
| Overall impression | 0.35 | would I reach for it again, how it held together | No thanks | Fine | Top shelf |

**Formula.** `weighted = sum(rating x weight)`, `score = 50 + 5 x weighted`. Range 55 to 100.

Do the math in whole numbers so there is no floating-point drift: with `h = rating x 2` and weights 15, 25, 25, 35, `n = sum(h x w)` and `score = 50 + n / 40`. Store `score` to 3 decimals, the raw ratings, and `rubricVersion: 1`.

**Display.** Round half up to a whole number: `50 + floor((n + 20) / 40)`.

**Fixtures (unit tests):**

| Appearance | Smoking | Flavor | Overall | Exact | Shown |
|---|---|---|---|---|---|
| 7 | 7 | 7 | 7 | 85 | 85 |
| 8 | 7 | 9 | 8.5 | 90.875 | 91 |
| 10 | 10 | 10 | 10 | 100 | 100 |
| 6 | 8 | 6 | 5.5 | 81.625 | 82 |
| 1 | 1 | 1 | 1 | 55 | 55 |

**Verdict**, from the shown (rounded) score so the number and the label never disagree. Adapted from halfwheel's buy guidance.

| Shown score | Verdict |
|---|---|
| 88 and up | Box-worthy |
| 86 to 87 | Buy a few |
| 84 to 85 | Worth a single |
| under 84 | Pass |

Verdict tests: 83 is Pass, 84 is Worth a single, 86 is Buy a few, 88 is Box-worthy.

A smoke with any rating missing has no score and no verdict. It shows "No score" and stats skip it.

**Strength and body** are separate from the score. Both use the lounge sheet's 5-step scale: 1 Mild, 2 Mild-Medium, 3 Medium, 4 Medium-Full, 5 Full.

## 6. Seed catalog

Source: `seed/stanley-cigar-guide.xlsx`, copied from `~/Downloads/stanley_pappas_cigar_list.xlsx` by the build session. If the file is missing, skip seeding and tell Kohlton.

What the file holds (read on 2026-10-10):

| Tab | Rows | Used |
|---|---|---|
| All Cigars | 119 cigars, 33 brands, 16 columns, plus 4 footnote rows with one cell each | Yes |
| Stanley Pappas Cigars | 8 house cigars, 4 columns, plus 1 source-note row | Yes |
| Mild, Medium, Full, Unrated | Subsets of All Cigars | No |
| Brands We Carry, Summary, Guide | Reference | No |

`npm run seed` runs `scripts/seed_from_xlsx.py` once and writes `src/seed/catalog.json`, which is committed and ships with the app. The xlsx itself is gitignored (office files can carry author details, and the repo is public). No xlsx parser ships to the browser.

**All Cigars mapping**

| Sheet column | Cigar field | Rule |
|---|---|---|
| Brand, Line | brand, line | As written |
| Strength | strength | Mild 1, Mild-Medium 2, Medium 3, Medium-Full 4, Full 5. "Varies" (7 rows) becomes null. |
| Wrapper | wrapperType | "Varies/Unverified" (18 rows) becomes null |
| Wrapper Origin / Detail | wrapperOrigin | Values starting with "Unverified" become null |
| Binder, Filler | binder, filler | "Unverified" and "Sources conflict" become null |
| Flavor Notes | sheetFlavors | Split on commas, lowercase. "Unverified" becomes an empty list. |
| Pairings | sheetPairings | Split on commas. "Check the band" becomes an empty list. |
| Price Tier | priceTier | $ 1, $$ 2, $$$ 3. Blank (7 rows) becomes null. |
| Other Wrapper Versions | otherWrapperVersions | Blank on 67 rows |
| If they like this, suggest | similarCigars | "Check the humidor" becomes null |

Skip rows with fewer than 2 filled cells (the footnotes).

**Stanley Pappas Cigars mapping.** brand "Stanley Pappas", line from Product (Georgios, Stavros, Evgenios, Theodoros, Steely, Kostaki, Ioannis, Lady Victoria), priceTier from Price Tier. Status is dropped. Everything else is null.

**Seed record rules**
- 127 records. Each gets `confirmed: false`, `source: "seed"`, no vitola, length, ring gauge, shape, country, or factory. The shelf has not been checked and the sheet has no sizes.
- **Fixed ids.** The script derives each id from brand and line (UUID version 5 style, SHA-1 of `brand|line` under a fixed namespace), and sets createdAt and updatedAt to the script's run time. The phone and the laptop then seed identical records, so a backup merge does not double the catalog, and any edit Kohlton makes is newer and wins.
- Seeding runs once per device (`meta.seedVersion`). It only adds ids that are not already present, deleted ones included.
- Sheet flavor notes appear on the cigar page as "From the lounge sheet", next to Kohlton's own tags. They are not offered in the tag picker.

## 7. Flavor tags

The picker is family first, then the word. Recently used tags come first (worked out from the last 30 tagged smokes). Custom tags can be added to any family.

| Family | Words |
|---|---|
| Wood | cedar, oak, hickory, toasted wood, sweet wood, charred wood, sandalwood, wood |
| Earth & Mineral | earth, sweet earth, mineral, graphite, mushroom, salt |
| Leather & Animal | leather, suede, barnyard, musk |
| Cream & Dairy | cream, butter, milk |
| Pepper | black pepper, white pepper, red pepper, pepper |
| Baking Spice | cinnamon, nutmeg, clove, allspice, anise, baking spice, spice |
| Sweet | honey, caramel, molasses, vanilla, toffee, butterscotch, brown sugar, sweet tobacco, sweet |
| Cocoa & Coffee | cocoa, dark cocoa, chocolate, dark chocolate, milk chocolate, bitter chocolate, coffee, roasted coffee, espresso, mocha |
| Nut | almond, peanut, cashew, walnut, hazelnut, pecan, nuts |
| Toast & Bread | toast, bread, graham cracker, biscuit, cereal |
| Fruit | cherry, black cherry, dark cherry, dried cherry, fig, raisin, dried fruit, ripe fruit, citrus, orange peel |
| Floral & Tea | floral, black tea, green tea, chamomile |
| Herbal & Vegetal | hay, grass, herbs, mint |

Every flavor word in the lounge sheet is covered. The sheet's variants map to these labels when shown as tags: creamy to cream, nutty to nuts, woody to wood, toasty to toast, buttery to butter, spicy and its "light", "rich", and "gentle" forms to spice, light pepper to pepper, light cedar to cedar. Sheet words that describe feel and not flavor (smooth, rich, mellow, mild, balanced, hearty) are not tags.

**Off-notes** (a separate group, each with a one-line tip):

| Tag | Tip |
|---|---|
| ammonia | Young or under-rested. Give the rest of the box more time. |
| sulfur | Often from the light. Let it settle or purge once. |
| bitter | Usually too hot. Slow down and let it cool. |
| tar | Buildup at the head. Re-cut or purge. |
| cardboard | Stale or dried out. Check how it was stored. |
| sour | Too wet or under-fermented. Dry-box the next one. |

## 8. Storage, autosave, and backup

### Autosave
- Taps (scores, chips, toggles) save at once. Text fields save 400 ms after the last keystroke and also on blur.
- Flush any pending write on `visibilitychange` to hidden and on `pagehide`.
- A small "Saved" label appears after the transaction completes. If a write fails, show the error in place and keep the text on screen. Never fail silently.
- Entry text and photos save in separate transactions. A photo failure never blocks the text.

### Drafts and the timer
- A full log is a smoke with `status: "draft"` from the first tap. There is no separate draft store. Reloading reopens it at `draftStep` with every field intact.
- The timer stores `timerStartedAt`. Elapsed time is always `now - timerStartedAt`, so it survives a reload or the phone locking. Stop sets `timerStoppedAt` and fills `durationMin`. Minutes can also be typed by hand.
- Drafts show as a "Resume" card at the top of the Journal.

### Delete and Undo
Delete is a soft delete with a toast that offers Undo for 8 seconds. Undo clears `deletedAt`. Deleting a smoke soft-deletes its photos too, and Undo brings them back.

### Protected storage
- Call `navigator.storage.persist()` after the first save and at each launch of the installed app. Store the result and show it in Settings as "Storage protected: Yes" or "No".
- WebKit grants it to an installed Home Screen app for its own address. In a plain Safari tab it returns false. If it is false, Settings explains that in one line and points to the install steps.
- Settings shows storage used from `navigator.storage.estimate()`, labeled as an estimate for this address (the number covers every site at `milehighpatriot.github.io` in that browser).
- A full-storage failure surfaces as `QuotaExceededError` on the request or transaction. Message: "Storage is full. Your notes are saved, but this photo was not. Export a backup, then free up space."

### Backup file
- **Export backup** writes one file: `cigar-journal-YYYY-MM-DD-HHmm.cigarbak`. It is a normal zip under a custom extension, so Safari on the Mac does not auto-unzip it. Rename it to `.zip` to look inside.

```
manifest.json     { format: "cigar-journal-backup", formatVersion: 1, dbVersion, exportedAt, counts }
data.json         { cigars, smokes, lots, wishlist, customTags, photos }  (deleted records included)
photos/<id>.jpg   full images (not for deleted photos)
thumbs/<id>.jpg   thumbnails
```

- Built with fflate's streaming zip. Photos are stored without recompression, one at a time, so memory stays low. Show progress.
- On the iPhone, hand the file to `navigator.share({ files })` when `navigator.canShare` allows it. That opens the share sheet with AirDrop. Otherwise fall back to a download link. Plain download links are unreliable inside an installed iOS app.
- After a successful export set `meta.lastExportAt`.

### Import
- **Import backup (merge)**: for each record, add it if the id is new; replace it if the incoming `updatedAt` is newer; otherwise keep the local one (ties keep local). Deleted records carry over because `deletedAt` travels with the record. Photo bytes are written when that photo id has none locally and the photo is not deleted.
- **Restore (replace everything)**: a confirm sheet that names what will be replaced, offers "Export current data first", and needs a second deliberate tap on a destructive button. Read and validate the whole file before deleting anything.
- Both validate `manifest.format` and `formatVersion`, write all non-photo records in one transaction, then photos in batches. End with a plain summary: "Added 12, updated 3, unchanged 240, photos added 9."
- The file picker has no `accept` filter, so iOS lets Kohlton pick the AirDropped file from Files.
- Restore and "clear all data" only clear this app's own database. Never touch other databases or caches at this address.

### CSV
**Export CSV** writes `cigar-journal-smokes-YYYY-MM-DD.csv`, one row per completed smoke that is not deleted. UTF-8 with a byte-order mark, CRLF line ends. Any field with a comma, quote, or line break is wrapped in quotes with quotes doubled.

Columns: date, brand, line, vitola, length_in, ring_gauge, wrapper, country, score, score_exact, verdict, appearance, smoking, flavor, overall, strength, body, minutes, tags, tags_first, tags_second, tags_final, draw, burn, relights, touch_ups, pairing_type, pairing_name, setting, company, would_buy_again, from_humidor, price_paid, summary, id.

### Backup reminder
If the last export was more than 7 days ago (or never) and any record has changed since, show a quiet banner on the Journal: "Last backup 9 days ago. 4 new entries." with "Back up now" and "Later". Later hides it for a day.

### Phone and laptop in Phase 1
Export on one device, AirDrop the file, Import on the other. Merge works both ways.

## 9. Photos

- Two buttons: **Take photo** (`<input type="file" accept="image/*" capture="environment">`, opens the rear camera on iOS) and **Choose photo** (`<input type="file" accept="image/*">`, the library). Desktop browsers ignore `capture` and show a file picker.
- Kinds: band, stick (the whole cigar; added at Kohlton's request on 2026-10-10), wrapper, foot, ash, setting, box/label. Several per smoke. Kind is picked with chips after capture and defaults to band.
- Pipeline (`src/photos/pipeline.ts`):
  1. Decode with `createImageBitmap(file, { imageOrientation: "from-image", resizeWidth or resizeHeight })` so a 48 MP frame is never held at full size. Fall back to an `<img>` element if that throws.
  2. Draw to a canvas at 1600 px on the long edge. Never upscale. `toBlob("image/jpeg", 0.8)`.
  3. Make a 400 px thumbnail the same way at quality 0.7.
  4. Read both into ArrayBuffers, save, then close the bitmap and zero the canvas size.
- **Orientation**: browsers apply EXIF orientation themselves when decoding. Do not also rotate by hand, or the photo turns twice.
- **Location**: canvas output carries pixels only, so EXIF and GPS are gone. Keep it that way. Never store the original file.
- **HEIC**: iOS hands library photos to web pages as JPEG by default, and camera shots arrive as JPEG. Safari can decode HEIC anyway; Chrome cannot. Never assume the format: decode and re-encode. If decoding fails, say "This photo format can't be read in this browser. Open it in Safari or save it as a JPEG first."
- Lists use thumbnails only, loaded when a card nears the viewport, with object URLs revoked when the card unmounts.

## 10. PWA and offline

- vite-plugin-pwa with the `generateSW` strategy and `registerType: "prompt"`. Auto-update reloads the page and can drop what is being typed, so it is never used.
- Precache everything: `globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico,json,webmanifest}"]`. The default only covers js, css, and html. Raise `maximumFileSizeToCacheInBytes` if any file is over 2 MiB.
- When a new version is waiting (`useRegisterSW` from `virtual:pwa-register/react`, `needRefresh`), show a quiet "Update ready" row with a Reload button. Never reload on its own.
- The service worker only exists in the production build. Test offline with build plus preview, not `vite dev`.
- `base` comes from `VITE_BASE_PATH` (default `/`; the Pages workflow sets `/cigar-journal/`). All asset and manifest paths must respect it.
- Manifest: `name` "Cigar Journal", `short_name` "Journal", `display` "standalone", `theme_color` and `background_color` `#16110D`, `start_url` and `scope` at the base path, icons 192, 512, and a separate 512 maskable.
- `index.html` head: viewport with `viewport-fit=cover`, `theme-color` `#16110D`, `apple-touch-icon` 180 px, `apple-mobile-web-app-status-bar-style` `black-translucent`, `robots` `noindex`. Layout pads with `env(safe-area-inset-*)`.
- Icon: one SVG source in `public/icon.svg`, a plain brass band mark on `#16110D`. Generate PNGs once with `npm run icons`.
- No analytics, trackers, or third-party requests at runtime. Fonts are self-hosted. Everything works offline after the first load.

### iOS facts the app must respect
- **A Safari tab and the installed Home Screen app do not share data.** Adding to the Home Screen copies cookies only. IndexedDB starts empty in the installed app.
- **Data is tied to the exact address** (scheme, host, and port).
- **Safari can delete a tab's data** after 7 days of Safari use without a visit to the site. The installed Home Screen app is exempt. This also applies to Safari on the Mac.

So:
- In an iOS Safari tab (not standalone), show a one-time hint on first open: "Add this to your Home Screen first. Tap Share, then Add to Home Screen. Entries saved here in Safari do not move to the Home Screen app." Dismissable. The same advice stays in Settings while not installed.
- On the Mac, if `navigator.storage.persisted()` is false, Settings suggests installing it there too (Chrome: Install; Safari: File, Add to Dock). The Mac copy is a second copy; the phone plus backup files are the record.

## 11. Screens and flows

Hash routes: `#/` journal, `#/smokes/:id`, `#/smokes/:id/edit`, `#/log`, `#/log/:id/scores`, `#/log/:id/finish`, `#/cigars`, `#/cigars/:id`, `#/humidor`, `#/humidor/:lotId`, `#/wishlist`, `#/stats`, `#/compare`, `#/more`, `#/settings`. The app opens straight to the journal. No landing page.

### Phone (under 768 px): one-handed logging

- Bottom tab bar: Journal, Humidor, a raised center **Log** button, Stats, More (Cigars, Wishlist, Settings and backup).
- Primary actions sit in the bottom half. Every tap target is at least 48 by 48 px. Tap scales and chips only, no drag sliders.
- Each flow has a sticky bottom action bar.

**Quick log** (target under 60 seconds, 8 taps or fewer when the cigar exists):

| Step | Screen | Taps |
|---|---|---|
| 1 | Tap **Log**. Opens the cigar picker. A Quick / Full switch at the top remembers the last choice. | 1 |
| 2 | Pick a cigar. The list shows "In your humidor" rows first (with the count left), then recent cigars, then search results as you type. "Add new cigar" is always pinned above the keyboard. Picking a humidor row sets the lot. | 2 |
| 3 | **Scores.** Four scales, one per category. Each is a 2-by-5 grid of numbers 1 to 10 (about 62 by 48 px each at 375 wide). Tap a number to set it. Tap it again for the half point above it. The anchor words sit under 1, 5, and 10. After each pick the next scale scrolls into the lower half of the screen. The score and verdict appear at the top once all four are set. | 3 to 6 |
| 4 | Tap **Next**. | 7 |
| 5 | **Finish.** Up to 3 flavor tags from recent ones (or open the picker), Take photo, Choose photo, optional price paid. Tap **Save**. Saves as complete and opens the smoke with "Saved" showing. | 8 |

Adding a new cigar from the picker needs only a brand or a line. Everything else can be filled in later.

**Full log.** Same picker with Full selected. A step strip across the top jumps to any step. Every field is optional. The sticky bar has Back and Next, and Finish on the last step.

| Step | Fields |
|---|---|
| Pre-light | wrapper look and feel, foot aroma, cold draw notes, cut type chips, light method chips |
| Smoke | Timer (Start, Stop, or type minutes). Tabs for First, Second, Final third: flavor tags, strength, body, retrohale note, short note, issue chips. |
| Construction | draw, burn, ash firmness and color, smoke volume, relight and touch-up counters, whole-cigar strength and body |
| Setting | pairing type and name, setting, company, indoor or outdoor, conditions note, mood |
| Scores | the four scales, the score and verdict, Would buy again (no, single, a few, box) |
| Wrap up | summary note, photos, price paid, date and time |

A quick log can become a full log later with "Add detail" on the smoke page.

**Other phone screens**
- **Journal**: Resume card for drafts, backup banner, install hint, search field, then smoke cards. A card has the brass band rule with the brand in small caps, line and size, date, thumbnail, score numeral, verdict, and up to 3 tags. The list renders 60 at a time and grows as you scroll.
- **Smoke detail**: photos, score and verdict, the four ratings, flavors by third, construction, pairing and setting, notes. Actions: Edit, Add detail, Copy summary, Delete.
- **Cigar page**: details with an "Unconfirmed" label when seeded, Edit, "Looks right", Other sizes, Add another size, every smoke of it with a score trend line, "From the lounge sheet" notes, Add to humidor, Add to wishlist.
- **Humidor**: total value, Ready to smoke list, all lots with count left, days aged, and rest-until date. Add lot. A lot page has "Log a smoke from this lot".
- **Wishlist**: cigar, why, where heard. "Bought it" moves it to the humidor.
- **Stats**: the same numbers as laptop, stacked.
- **Settings and backup**: Export backup, Import backup, Restore, Export CSV, last backup date, Storage protected, storage used, install help, Update ready, catalog seed count.

**Copy summary** puts plain text on the clipboard, for example:

```
Padron 1964 Anniversary Exclusivo (5.5 x 50)
Oct 10, 2026 · Stanley Pappas lounge · 68 min
Lounge 100: 91 · Box-worthy
First third: cedar, cocoa, white pepper
Second third: espresso, leather
Final third: dark chocolate, earth
Pairing: bourbon, Eagle Rare
Note: Burned razor sharp. Would buy a box.
```

Empty lines are left out.

### Laptop (1024 px and up): browse, compare, stats

- Left sidebar: Journal, Cigars, Humidor, Wishlist, Stats, Compare, Settings. A "New log" button at the top.
- **Journal** is two panes: list on the left, detail on the right. A view switch offers a sortable table: date, cigar, score, strength, wrapper, smoke time.
- **Search** across brand, line, notes, and tags. **Filters**: score range, wrapper, strength, country, flavor tag, date range, pairing, would buy again.
- **Compare**: pick 2 or 3 smokes or cigars. Columns side by side: scores, per-third flavors, strength and body, construction. For a cigar, the column uses the average of its smokes.
- **Stats**: smokes count, average score, score distribution, top rated, average score by wrapper, country, strength, and brand (only groups with 2 or more smokes), most common flavor tags, total smoke time, spend by month, humidor value, ready-to-smoke count. Charts are plain SVG in the palette.
  - Spend by month = lot purchases by purchase date (`quantityPurchased x priceEach`) plus `pricePaid` on smokes by smoke date.
- **Keyboard**: `/` focuses search, `n` starts a new log (neither fires while typing in a field), `Esc` closes sheets. Everything is reachable by keyboard with a visible focus ring.

### Tablet (768 to 1023 px)
Phone layout with wider content: bottom tab bar, single pane, a two-column card grid. Compare is laptop only; under 1024 px its route shows one line, "Compare needs a wider screen. Open it on your laptop." No broken in-between states.

## 12. Design: "after-hours lounge"

Dark, warm, quiet, premium, like a good humidor room at night. Kohlton's own photos carry the visual interest. The interface stays calm. Dark only in Phase 1.

Tokens live in `src/styles/tokens.css` as CSS custom properties. Nothing else hard-codes a color, radius, or font.

| Token | Value | Use |
|---|---|---|
| --bg | #16110D | Page background |
| --surface | #211912 | Cards, bars |
| --raised | #2C2219 | Sheets, selected rows |
| --hairline | #3A2E23 | Dividers and card outlines (decorative) |
| --control-border | #8A7964 | Input and unselected chip outlines. New token; see below. |
| --text | #F0E6D6 | Primary text |
| --text-2 | #B3A48E | Secondary text, placeholders |
| --brass | #C9A063 | Buttons, active tab, score numerals, focus ring |
| --on-brass | #16110D | Text on brass |
| --cedar | #7E9A6A | "Ready" and success |
| --error | #E07A6A | Error text |
| --destructive | #8E332C | Destructive button fill, with --text on it |

Contrast ratios, computed during planning:

| Text | on --bg | on --surface | on --raised |
|---|---|---|---|
| --text | 15.17 | 14.02 | 12.59 |
| --text-2 | 7.69 | 7.11 | 6.38 |
| --brass | 7.76 | 7.17 | 6.44 |
| --cedar | 6.00 | 5.54 | 4.98 |
| --error | 6.39 | 5.91 | 5.30 |

--on-brass on --brass is 7.76. --text on --destructive is 6.39. All pass AA for body text.

**Added pairing.** The hairline is only 1.2 to 1.4 to 1 against the surfaces, which is right for a quiet divider but too faint to mark the edge of an input or an unselected chip. `--control-border` #8A7964 gives 4.46, 4.12, and 3.70 to 1, above the 3 to 1 needed for control outlines. The build must re-check any other new pairing.

**Type**
- Libre Caslon Display: page titles and the big score numeral, 24 px and up only.
- IBM Plex Sans: everything else. `font-variant-numeric: tabular-nums` on scores, dates, and counts. Check in the build that tabular figures really apply in the self-hosted file (measure "111" against "000"). If not, load the non-variable `@fontsource/ibm-plex-sans` files.
- Body 16 px minimum on phone. Nothing under 12 px.

**Shape and spacing.** 4 px spacing base. 6 px radius on cards and chips, 12 px on bottom sheets. Hairline borders, no drop shadows. Icons at 1.5 px stroke.

**Signature detail.** A slim brass rule across the top of each smoke card with the brand in small caps, like a cigar band. Used there and nowhere else.

**Motion.** 150 to 200 ms ease-out for sheets and state changes. With `prefers-reduced-motion`, changes are instant, including the scale auto-scroll.

**Avoid.** Cream or off-white backgrounds, wood-grain or leather textures, gold-foil gradients, stock cigar or smoke-wisp imagery, purple or blue gradients, glassmorphism, pill-shaped buttons, emoji as icons, italic accent words in headings, "01 / 02 / 03" section labels, Inter, Roboto, or Arial, tiny low-contrast gray text, a marketing landing page, confetti or gamified badges.

**Copy.** Short, plain, friendly. No em dashes in any visible text.

## 13. Accessibility and quality

- Every input has a label. Chip groups and scales are real radio or checkbox groups with names.
- Visible focus: 2 px brass outline with a 2 px offset.
- Fully keyboard-operable on the laptop.
- AA contrast for all text.
- Works in iOS Safari, as an installed Home Screen app, and in Chrome and Safari on the Mac.
- Journal list and search stay quick at 500 entries. Search runs in memory over one lowercase text blob per smoke. Target: the list updates in under 50 ms.

## 14. Repo, hosting, and saving

- Local folder `~/cigar-journal`. `git init` is done on branch `main`. Nothing is committed.
- Remotes follow the cigar-lounge-mastery setup: `origin` fetches from Cursor Origin and pushes to both hosts, and a `github` remote exists for comparing.
- `.github/workflows/deploy-pages.yml` is modeled on `~/luper-vault/.github/workflows/deploy-pages.yml`: on push to `main`, run `npm ci`, `npm test`, `npm run build` with `VITE_BASE_PATH=/cigar-journal/`, then upload `dist` and deploy with `actions/configure-pages` (`enablement: true`), `upload-pages-artifact`, and `deploy-pages`. No `404.html` copy is needed with hash routes.
- **Save rule.** Do not commit or push until Kohlton says "save". On save: commit with a clear message under the global git identity (MileHighPatriot; never set a per-repo email), push `main` to both hosts, confirm both with `git ls-remote`, confirm the Pages run finished, and reply in one line with the live address. Never force-push. If a push is rejected, stop and say so.
- `.gitignore`: `node_modules`, `dist`, `dev-dist`, `screenshots`, `seed/*.xlsx`, `certs`, `.DS_Store`.
- Ask before installing anything system-wide (Homebrew packages, mkcert) or changing Mac settings. No accounts or sign-ups beyond creating these two repos.

## 15. iPhone preview plan

There are three addresses, and **each one has its own separate data**:

| Address | For | Offline and install |
|---|---|---|
| `https://milehighpatriot.github.io/cigar-journal/` | The real app. Install this one. The real journal lives here. | Yes |
| `http://kohltons-macbook-pro.local:5173` (dev) and `:4173` (preview) | Checking layout on the phone before a save. Fallback by IP: `http://10.0.0.19:5173`. Re-check the IP with `ipconfig getifaddr en0`; it can change. | No. Plain HTTP on a `.local` name is not a secure context, so no service worker. |
| `http://localhost:5173` and `:4173` on the Mac | Building, tests, and all offline and install checks before a save | Yes at localhost |

- Vite config: `server: { host: true, port: 5173, strictPort: true }` and `preview: { host: true, port: 4173, strictPort: true }`. Fixed ports matter because the port is part of the address.
- The Mac's Bonjour name comes from `scutil --get LocalHostName` (currently `Kohltons-MacBook-Pro`). iPhones on the same Wi-Fi normally resolve `.local` names, but that is not confirmed from Apple's docs, so always print the IP too.
- Anything entered at a `.local` or localhost address is throwaway test data. Say so whenever handing over those addresses.

**Optional local HTTPS (not needed now that Pages provides HTTPS; do not install without asking):**
1. `brew install mkcert`, then `mkcert -install`.
2. `mkdir -p certs && cd certs && mkcert kohltons-macbook-pro.local localhost 127.0.0.1 10.0.0.19`
3. Point `server.https` and `preview.https` at the two generated files.
4. AirDrop `rootCA.pem` from the folder printed by `mkcert -CAROOT` to the iPhone. Never share `rootCA-key.pem`.
5. On the iPhone: Settings, General, VPN & Device Management, install the profile. Then Settings, General, About, Certificate Trust Settings, turn on full trust for the mkcert root.
6. Open `https://kohltons-macbook-pro.local:4173`.

Whether a service worker registers under a user-trusted mkcert certificate on current iOS was not confirmed from a primary source.

## 16. Phase 1 build order

The design checkpoint comes early. Do not build past step 4 without Kohlton's OK on the look.

0. **Setup.** Copy the seed xlsx into `seed/`. Scaffold Vite, React, TypeScript, Biome, Vitest. Create the repos and remotes (nothing is pushed until "save"):
   ```
   gh repo create MileHighPatriot/cigar-journal --public --description "Personal cigar journal"
   ~/.local/bin/origin repo create milehigh-patriot/cigar-journal --default-branch main
   git remote add origin https://origin.cursor.com/milehigh-patriot/cigar-journal.git
   git remote set-url --add --push origin https://origin.cursor.com/milehigh-patriot/cigar-journal.git
   git remote set-url --add --push origin https://github.com/MileHighPatriot/cigar-journal.git
   git remote add github https://github.com/MileHighPatriot/cigar-journal.git
   ```
   Add the Pages workflow.
1. **Shell and PWA.** Design tokens, self-hosted fonts, base styles, tab bar and sidebar, manifest, icons, service worker, update prompt, install hint. Every deployed version is installable and works offline from the first save.
2. **Data layer.** The complete version 1 schema (every store in section 4), repository, in-memory store, scoring and verdict with tests, merge with tests, seed script and seeding. The schema is complete before anything is deployed, because Kohlton may start logging real smokes right after the checkpoint.
3. **Journal list and quick log.** Smoke card with the band rule, the cigar picker, the scores screen, the finish screen, the photo pipeline, autosave and "Saved". Add the dev-only data generator (`#/dev`, compiled out of production) with plain warm-toned placeholder images, clearly not stock photos.
4. **DESIGN CHECKPOINT. Stop here.** Screenshots at 375 and 1440 px of the journal list and the quick-log flow, saved to `./screenshots/`. Show them with one or two lines on how they match section 12. Wait for the OK. If Kohlton says "save", it goes live and he can judge it on his phone.
5. Full log: pre-light, timer, thirds, construction, setting, scores, wrap up, drafts and resume.
6. Smoke detail, Copy summary, delete and Undo. Cigar pages, catalog editing, sizes, score trend.
7. Humidor lots and aging, Ready to smoke, value. Wishlist and "Bought it".
8. Laptop layout: two-pane journal, table view, search, filters, keyboard shortcuts. Tablet pass.
9. Compare and Stats.
10. Export, import, restore, CSV, backup reminder, Settings.
11. Run every acceptance check in section 19 for real, fix what fails, then report (section 20).

## 17. Risks

1. **Shared address.** Kohlton's GitHub account already has 19 other Pages sites, and those without a custom domain live at `milehighpatriot.github.io` too. In a Mac browser they share one storage area: clearing website data for any of them clears the journal copy in that browser, and the storage estimate covers all of them. None of the sibling repos checked on this Mac register a service worker or clear caches or databases. Mitigations: unique database name, no localStorage, never clear caches we did not create, backups. A custom domain later would be a new address and need one export and import.
2. **Safari's 7-day cleanup** for data in tabs, on the phone and the Mac. Mitigations: install hint, `persist()`, backup reminder.
3. **The installed app can still be evicted** under heavy storage pressure. No source promises otherwise. Persisted addresses are skipped, so `persist()` plus backups is the defense.
4. **Backup size grows** with photos (about 0.4 MB each). A year could be several hundred MB to build in the browser and AirDrop. Streaming zip keeps memory down; test with a large set (phone check 6).
5. **Share sheet with a `.cigarbak` file** is not confirmed on a real device. If AirDrop does not appear, switch the iOS file name to end in `.zip` and keep `.cigarbak` on the Mac.
6. **vite-plugin-pwa 2.0 is one week old.** Fallback is 1.3.x.
7. **Last-write-wins by device clock.** Editing the same smoke on both devices between backups keeps only the newer edit of that whole record. Fine for one person; noted for Phase 2.
8. **Public repo.** Code and the seed catalog are visible to anyone. No journal data, photos, tokens, or keys ever go in the repo.
9. **A live site with real data.** Every push to `main` updates the app Kohlton is using. Schema changes need migrations and tests. Never auto-reload.
10. **Score spread depends on honest scoring.** A 7 across the board is 85 and an 8 is 90, so most cigars will land between 80 and 95, as in the magazines. The anchor words are what keep scores apart over time.

## 18. Later phases (do not build, even partly)

### Phase 2
- Automatic sync between phone and laptop, and a host and domain of Kohlton's choice.
- Humidor humidity and temperature log.
- A light theme.
- Fill the "Tried it? / My notes" column of the lounge sheet from the journal.
- A shareable image card for a smoke.

**Sync options** (vendor pages read 2026-10-10; workload is one user, two devices, about 0.5 GB of photos a year):

| | Cloudflare D1 + R2 + Worker | Supabase | PocketBase |
|---|---|---|---|
| Monthly cost | $0. Free R2 is 10 GB, about 20 years of photos. | $0 for about 2 years, then $25 (free file storage is 1 GB) | About $2.50 to $7 (Fly.io or a small VPS); PocketHost is $9.99 |
| Auth for one person | A long random token entered once per device and checked by the Worker. Cloudflare Access (free up to 50 users) is the alternative. | Email magic link or code, sign-ups turned off, row-level security | Email and password or one-time code (needs SMTP) |
| Where photos live | R2 bucket, served through the Worker | Private Storage bucket with signed URLs | The server's disk or S3-compatible storage |
| Code to write | Most: a small sync API (pull changed, push changed, photo up and down) | Least: tables and rules | Little: collections and rules |
| Upkeep | Deploy the Worker | None on the server. Free projects pause after a week idle and are resumed by hand. | Most: server, upgrades, backups. Still pre-1.0 with no compatibility promise. |
| Main risk | Bugs in our own API | The 1 GB cap, pausing, no free backups, and it would use the second of 2 free project slots (Luper Ledger has the first) | Breaking changes, and a server Kohlton has to run |

**Recommendation: Cloudflare D1 + R2 with a small Worker.** Photos are nearly all of the storage, and R2's free 10 GB outlasts Supabase's free 1 GB by a decade. The sync this app needs is tiny because the app is already local-first: "send what changed, fetch what changed, newer wins", the same rule as backup merge. Supabase is the runner-up and the fastest to build, and Kohlton already knows it from Luper Ledger, but it turns into $25 a month in about two years. The Phase 1 data layer works with any of the three.

### Phase 3 (list only)
Band photo or barcode lookup. AI tasting help. "If you liked this, try" suggestions from Kohlton's own history.

## 19. Acceptance checks

Run all of these in the build session, for real. Commands assume the scripts in section 21.

- [ ] `npm run build` exits 0. `npm run typecheck` and `npm run lint` are clean.
- [ ] `npm test` passes, covering: the Lounge 100 formula with the five fixtures in section 5; the verdict bands at 83, 84, 86, 88; backup merge (newer updatedAt wins, soft deletes carry over, ties keep local); CSV escaping of commas, quotes, and line breaks; humidor remaining count; seeding is idempotent.
- [ ] **Backup round trip**: with 3 smokes (one with 2 photos), 1 humidor lot, and 1 wishlist item: export, clear all data, import. Show that counts match, every field of one smoke matches, and both photos match byte for byte. Show the steps and results.
- [ ] **Draft safety**: start a full log, fill two thirds, reload. Everything is still there and the timer shows the right elapsed time.
- [ ] **Humidor**: logging a smoke from a lot of 5 leaves 4. Deleting that smoke puts the lot back to 5. Undo returns it to 4.
- [ ] **Offline**: `npm run build && npm run preview`, open `http://localhost:4173`, load once, stop the server, reload. The app opens and shows the journal with photos. Show the steps and save `./screenshots/offline-reload.png`.
- [ ] **Manifest and service worker** register with no errors: name, icons including apple-touch-icon, standalone display, theme color `#16110D`.
- [ ] **Photos**: a JPEG with EXIF orientation 6 comes out upright; the saved bytes contain no EXIF segment; the long edge is 1600 px or less; a 400 px thumbnail exists.
- [ ] **Screenshots** with Claude in Chrome at 375, 768, and 1440 px wide: journal list, quick log, full log on the second third, smoke detail, cigar page, compare (1440 only), stats, humidor, settings/backup. Save as `./screenshots/<width>-<screen>.png`, for example `375-journal.png`, `1440-compare.png`. At each width: no console errors, and `document.documentElement.scrollWidth` is not greater than `clientWidth`. If Claude in Chrome is not available in the session, say so and use Playwright with `channel: "chrome"`.
- [ ] **One-handed check at 375 by 667**: on the quick-log screens, measure and report that Next and Save sit in the bottom half of the viewport and every tap target in the flow is at least 48 by 48 px. List any that are not, then fix them.
- [ ] **Quick log tap count**: walk the flow with clicks in Chrome and report the taps from Log to Saved. Target 8 or fewer when the cigar exists, not counting typing or optional flavor tags.
- [ ] **Contrast**: list every text and background pair actually used and its ratio. All body text is at least 4.5 to 1; control outlines at least 3 to 1.
- [ ] **Performance**: with the dev-only generator, create 500 fake smokes. Report how long a search takes to update the list (`performance.now()`), and confirm the list scrolls smoothly. Remove the fake data afterwards.
- [ ] **No em dashes**: `grep -rn "—" src index.html public` finds nothing.
- [ ] **Live site** (after the first save): the Pages workflow run succeeds; `https://milehighpatriot.github.io/cigar-journal/` loads with no console errors; the manifest and service worker load under `/cigar-journal/`; a reload with the network off still opens the app.
- [ ] **Phone checks Kohlton does himself.** Hand him this list with the live address:
  1. *Install.* Open the live address in Safari. Tap Share, then Add to Home Screen. Open it from the Home Screen. It should fill the screen with no Safari bars.
  2. *Protected storage.* In the installed app, save one smoke, then open More, Settings. "Storage protected" should say Yes.
  3. *Camera.* Log, pick a cigar, score it, tap Take photo. The rear camera should open directly. Take a portrait shot of a band. It should appear upright.
  4. *Library photo (HEIC).* Tap Choose photo and pick a recent iPhone photo. It should appear and still be there after closing and reopening the app.
  5. *Offline in the lounge.* Turn on Airplane Mode, open the app from the Home Screen, log a quick smoke with a photo, close the app, reopen it. The smoke and photo are there.
  6. *Backup.* More, Settings, Export backup. The share sheet opens. AirDrop the file to the Mac. On the Mac, open the live address, Settings, Import backup, pick the file. The smokes and photos appear.
  7. *Timer.* Start a full log and the timer, lock the phone for two minutes, unlock. The elapsed time is right.

## 20. Report back

**At the design checkpoint:** the screenshots and one or two lines on how they match section 12.

**At the end of the build**, in plain words, kept brief:
1. Outcome in the first sentence: done, partly done, or blocked.
2. How to open it: the live address, the laptop address, the `.local` preview address and what it is for, and how to install it to the Home Screen.
3. Each acceptance check with the command or steps run and the result; screenshot paths.
4. Files created, one line each.
5. Assumptions made where this spec was unclear.
6. Follow-ups and ideas noticed but not built.
7. Anything left undone and why.

## 21. File layout and scripts

```
cigar-journal/
  SPEC.md, CLAUDE.md
  index.html
  package.json, tsconfig.json, vite.config.ts, biome.json, .gitignore
  .github/workflows/deploy-pages.yml
  public/            icon.svg and generated icons
  seed/              stanley-cigar-guide.xlsx (local only, gitignored)
  scripts/           seed_from_xlsx.py
  screenshots/       (gitignored)
  src/
    main.tsx, App.tsx, routes.ts
    styles/          tokens.css, base.css
    data/            types.ts, db.ts, repository.ts, store.ts, merge.ts, seed.ts
    seed/            catalog.json (generated, committed)
    domain/          scoring.ts, humidor.ts, stats.ts, search.ts, tags.ts, summary.ts
    photos/          pipeline.ts, usePhotoUrl.ts
    backup/          exportBackup.ts, importBackup.ts, csv.ts
    pwa/             register.ts, installHint.ts, storage.ts
    components/      shared UI: TabBar, Sidebar, SmokeCard, TapScale, ChipGroup, TagPicker, Sheet, Toast, and so on
    screens/         Journal, Log, SmokeDetail, SmokeEdit, Cigars, CigarPage, Humidor, Wishlist, Stats, Compare, Settings
    dev/             fakeData.ts, DevScreen.tsx (dev builds only)
  tests/             scoring, verdict, merge, csv, humidor, seed
```

Scripts to define in `package.json`:

| Script | Runs |
|---|---|
| `npm run dev` | `vite` on port 5173, bound to the network |
| `npm run build` | `tsc --noEmit && vite build` |
| `npm run preview` | `vite preview` on port 4173, bound to the network |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `biome check .` |
| `npm test` | `vitest run` |
| `npm run seed` | `/usr/bin/python3 -I scripts/seed_from_xlsx.py seed/stanley-cigar-guide.xlsx src/seed/catalog.json seed/general-cigars.txt seed/research` |
| `npm run icons` | the assets generator on `public/icon.svg` |

## 22. Scope rules

- Build everything in sections 4 to 15 completely. If something is not in Phase 1, do not build it, even partly. List ideas at the end of the report.
- Keep changes to what this spec needs. No extra features, files, docs, abstractions, or refactors.
- Local, reversible actions are fine. Ask before anything hard to reverse: deleting files you did not create, `reset --hard`, anything that touches a live service beyond a normal "save".

## 23. Build notes (where the build differs from the text above)

- **Anchor words** were shortened so they fit inside a 62 px button at 375 wide (section 5 shows the final words).
- **Scale auto-scroll**: after a first pick, the scale just rated stays in full view under the score readout and the next one lands mid-screen. That keeps the second tap for a half point in reach.
- **Seed timestamps** are a fixed value in the script, not its run time, so re-running `npm run seed` gives an identical file.
- **Micallef** has no known lines in the sheet, so it is seeded with a brand and an empty line.
- **Styles** are plain CSS files in `src/styles/` (tokens, fonts, base, app), not CSS modules.
- **Fonts** are loaded with our own `@font-face` rules pointing at the two Latin woff2 files in the fontsource packages, so only two font files ship.
- **Screenshots** were taken with Playwright driving Chrome (`channel: "chrome"`, borrowed from `~/site-audit`), because Claude in Chrome was not available in the build session.
- **Bigger cigar list** (Kohlton's request, 2026-10-10): `seed/general-cigars.txt` adds 819 lines across the major brands, written from general knowledge and not checked against the makers. The seed script merges it after the lounge sheet (the sheet wins on the same brand and line), for 946 cigars in 121 brands, all unconfirmed. `SEED_VERSION` is 2, so a device that seeded the first list gains the new cigars without touching its own edits. Bump it again whenever the list changes.
- **Size on the smoke**: see decision 3 in section 2. Records saved before the size fields existed get them as empty when loaded, so no database version bump was needed. Common sizes live in `src/domain/sizes.ts`.
- **Livelier look** (Kohlton's request, 2026-10-10; no artwork of cigars, since his own photos of bands and sticks are the pictures). This loosens "the interface stays calm" in section 12, within the same palette and fonts:
  - Journal header card with the average as a score ring, counts, and a line chart of the last 12 scores, over a slow drifting glow.
  - Score rings around score numerals everywhere (70 to 100 mapped onto the circle). "Box-worthy" reads in cedar green.
  - Flavor tags carry a dot in their family's color (`--fam-*` tokens). Wrapper names carry a leaf-shade dot (`--leaf-*`). The picker shows a brass medallion with the brand's initials.
  - The newest smoke shows its photo wide across the card; other cards use an 88 px thumbnail. Month headings break up the list.
  - Motion: screens and cards ease in, rings and bars fill, numerals count up, taps press and pop. All of it stops under `prefers-reduced-motion`.
  - The soft glow on the Log button is the one exception to "no drop shadows".
  - Build the remaining screens in this livelier style.
- **Cigars tab** (built 2026-10-10 at Kohlton's request, so the list can be browsed without starting a log): `#/cigars` lists every cigar grouped by brand with search, All / Smoked / Added by me, and strength and wrapper filters; `#/cigars/:id` is the cigar page (details, Unconfirmed and "Looks right", Edit, "Log this cigar", your smokes with a score trend, flavors found, lounge-sheet notes). Saving an edit marks a seeded cigar confirmed. "Remove from list" shows only for a cigar with no smokes. The edit form uses an explicit Save button, not autosave.
  - **Phone tab bar is now Journal, Cigars, Log, Humidor, More.** Stats moved under More on the phone; the laptop sidebar still lists everything.
  - "Add to humidor" and "Add to wishlist" on the cigar page come with those tabs.
- **Humidor tab** (built 2026-10-10): `#/humidor` shows on-hand, ready, and value totals with a ready-versus-resting bar, then lots under Ready to smoke (longest aged first), Resting (soonest ready first), and Finished. Each lot card has one mark per cigar, filled while it is still in the box (a bar above 20). `#/humidor/:id` is the lot page: Log a smoke from this lot, Edit, Gave one away (with Undo), Remove lot (with Undo), lot details, and the smokes taken from it. Lots are added from the Humidor tab or from a cigar's page ("Add to humidor"), with rest chips for 2 weeks, 1, 3, and 6 months. The cigar page shows what is on hand.
- **Settings and backup** (built 2026-10-10): `#/settings` has Export backup, Import backup (merge), Export CSV, and Restore (replace everything), plus storage protection, storage used, install help, the cigar count, and when this version was built.
  - Export packs the file first, then shows a "Backup ready" sheet with Share or AirDrop and Download. The hand-over happens from a fresh tap because browsers only allow sharing right after one.
  - Import and Restore read and check the whole file before anything on the device changes. Restore's destructive button needs two taps and offers "Export current data first". After a restore the cigar list is topped up from the current catalog, in case the backup came from an older version.
  - The manifest also records `photoFiles`, the number of photos whose bytes are inside, so a cut-off file is caught.
  - The backup reminder shows on the Journal when the last export is over 7 days old (or never) and something changed. "Later" hides it for a day.
  - The backup round trip, restore, bad-file refusal, and CSV were run for real in Chrome at 375, 768, and 1440 and all passed. Sharing from the installed iPhone app still needs the phone check in section 19.
- **Wishlist tab** (built 2026-10-10): `#/wishlist` lists what Kohlton wants to try, with why and where he heard about it. "Bought it" opens the add-to-humidor form with the cigar filled in; saving marks the wish bought and links it to the new lot. Wishes are added from the Wishlist tab or a cigar's page. The cigar chooser used by the wishlist and humidor forms can also add a cigar that is not in the list.
- **Stats tab** (built 2026-10-10): `#/stats` leads with headline numbers (average score in a ring, smokes, time smoking, spend over 12 months, humidor value, ready to smoke), then Score spread (columns in two-point ranges), Top rated, Average score by wrapper, country, strength, or brand (a dot on a 70 to 100 scale per group, groups of 2 or more only), Flavors you find most, and Spend by month. Charts are plain HTML and CSS in one hue (brass), not SVG; every column can be hovered, tapped, or tabbed to for its exact value.
  - With 500 fake smokes loaded: a journal search redrew the list in 15 to 51 ms (two screen frames, about 33 ms, is the floor of the measurement), scrolling dropped at most 1 frame in 120, and only 60 to 120 cards were in the page at a time. The fake data was removed afterwards.
- **Compare tab** (built 2026-10-10, laptop only as planned): `#/compare` switches between Smokes and Cigars and takes 2 or 3 picks, chosen inside the screen. Rows cover scores (the clear leader in each row is marked), flavors overall and by third, strength and body, construction, and wrapper, size, time, pairing, and price. A cigar's column is the average of its completed smokes, with "Usually ..." for the most common draw and burn. The picks are kept while moving around the app, but not across a reload. Under 1024 px the route shows the one-line notice.
- **Full log** (built 2026-10-10): `#/log/:id/full/:step` with eight steps on a strip that jumps to any of them: Pre-light, First third, Second third, Final third, Construction, Setting, Scores, Wrap up. Each third is its own step (not tabs inside one step), so the step in the address is exactly where a reload or Resume reopens. The timer sits at the top of every step. Pre-light has the photo buttons and files new shots as "Stick"; Wrap up has them too, with the note, date and time, price, and size. Every field is optional and "Finish" is on the last step. The same screen edits a finished smoke ("Edit", or "Add detail" on a quick log), where the last button reads "Done".
  - The smoke page now shows everything recorded (by third, pre-light, construction, pairing and setting) and has Edit or Add detail, Copy summary, and Delete.
  - The flavor chips are the 12 most recent flavors topped up with a starter set, fixed in place while a screen is open so they do not move as they are tapped. The quick log's last step uses the same field.
  - Draft safety was run for real at 375, 768, and 1440: two thirds filled, page reloaded, and every field came back on the same step. The timer was checked against the wall clock across a reload (5 s before, 8 s after, start time unchanged).
- **Saves start in the same instant as the tap** (fixed 2026-10-10). Writes used to wait on a promise chain before reaching IndexedDB, so a reload or a closed app within a few milliseconds of a tap could drop the entry: in a stress test that reloaded the moment the next screen appeared, 11 of 12 new logs were lost. Now every write opens its transaction, places its puts, and calls `commit()` in the same tick as the tap, and order is kept by the browser running same-store transactions in the order they start. After the fix the same test kept 12 of 12, typed text reloaded mid-pause kept 8 of 8, and a last tap followed by an instant reload kept 8 of 8. Keep it this way: never put an `await` between a tap and `putMany`.
- **Page shrunk on a real iPhone** (reported by Kohlton 2026-10-10, in Chrome on his iPhone): the app filled only about 5/8 of the screen with a blank strip down the right. The likely cause was the header glow: two large circles positioned up to 120 px past the header's edge and drifting further with a transform, relying on `overflow: hidden` to clip them. The numbers match (about 215 px of overhang on a 375 px screen is 5/8), and it did not reproduce in desktop Chrome or in Playwright's WebKit at iPhone sizes, so it is confirmed only by his phone. The glows now fill the header exactly and only fade. `html` also has `overflow-x: hidden` as a guard. Rule: nothing is positioned or animated outside its own box, even inside a clipping parent. Layout checks now also run in Playwright's WebKit (`webkit-2359` in the Playwright cache).
- **Kohlton uses Chrome** on both his iPhone and his MacBook (said 2026-10-10), not Safari. Do not steer him to Safari. Chrome on iPhone can add the app to the Home Screen from its Share icon in the address bar (iOS 16.4 or later), and the install hint says so when it detects Chrome. The photo error no longer says to open Safari. Whether data kept in a Chrome tab on iPhone is ever cleared the way a Safari tab's can be was not confirmed, so the Home Screen app plus backups is still the safe place for the real journal.
- **Automatic sync, pulled forward from Phase 2** (Kohlton's request, 2026-10-10; he chose Supabase over the Cloudflare recommendation because he already has an account, on the condition that it does not affect Luper Ledger).
  - **A Supabase project of its own.** Never reuse or touch the Ledger's project (`wdinlqgnqaslnsunkxld`). `supabase/journal.sql` sets up everything: one `records` table holding each synced record as JSON, a `push_records` function that keeps the newer `updatedAt` per record, and a private `journal-photos` bucket. Row-level security limits every row and file to its owner.
  - **Sign-in:** email and password, entered once per device in Settings. The session is kept in the app's own database (`meta.syncSession`), not localStorage, because other sites share the address.
  - **Engine** (`src/sync/engine.ts`, behind the `Remote` interface in `src/sync/remote.ts`): pull what the server took since the last pull (with a one-minute overlap), merge with the same newer-wins rule as backup import, push what changed here since the last push, then move photos (each image goes up or down at most once). Seeded cigars nobody has edited are never sent.
  - **When it runs:** on opening the app, a few seconds after any save, on coming back online or to the foreground, and every 3 minutes while open. It never blocks a save and fails quietly offline.
  - **Build settings:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, from GitHub repo variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the Pages workflow and from `.env.local` on the Mac. A build without them hides the Sync card and leaves the library out.
  - **Set up 2026-10-10:** project `tqgyzgdmavgsdkhvshay` (named "cigar jounaral"), created by Kohlton in the dashboard, with `journal.sql` run in the SQL Editor and "Confirm email" turned off. Its URL and publishable key are in `.env.local` and in the repo variables. Sync is the one deliberate exception to "no third-party calls at runtime".
  - **Tested for real** with two separate browser profiles and a temporary test account: 14 smokes, 4 lots, and 13 photos went phone to server to laptop and matched byte for byte; a smoke logged on the laptop reached the phone without pressing Sync; a delete carried across; a round with nothing changed took about half a second; and a request with no login saw zero rows. A smoke still being logged can show up on the other device as "In progress" until it is finished.
  - **Limits to know:** the free plan holds 1 GB of photos (about two years at the planned rate) and pauses a project after a week with no activity; a paused project is resumed from the Supabase dashboard. Backup export still works and is still worth doing now and then.
- **Fills the window** (Kohlton's request at the design checkpoint, 2026-10-10): no screen sits in a narrow centered column. From 768 px up the log flow spans the full width: cigar rows flow into columns, the four scales sit two by two with no scrolling, and Finish puts flavors beside photos. On a laptop the journal's right pane opens the newest smoke when none is picked, and the smoke detail fills its pane (photo beside the details once the pane is 820 px or wider). Build the remaining screens the same way.
- **Stick photos**: a "Stick" photo type was added next to Band and Wrapper at Kohlton's request.
- **Pages had to be switched on by hand** before the first deploy: `gh api -X POST repos/MileHighPatriot/cigar-journal/pages -f build_type=workflow`. The workflow's own token cannot create the Pages site.
- **Researched cigar details** (Kohlton's request, 2026-10-10: "all information" for every cigar in the list, findable by search; he chose web research only, run by several agents at once with accuracy as the standard).
  - **How it was gathered:** the list was split into 53 batches by brand. For each batch one agent looked every cigar up on the maker's site, halfwheel, Cigar Aficionado, and the big retailers, and a second, independent agent then re-opened the sources and corrected or emptied anything it could not back up. A field no source states is left empty, never guessed. Result (2026-10-11): of the 946 cigars, 936 were found and 917 passed the fact-check. 19 were found but could not be fully confirmed; they keep the Unconfirmed notice and a note saying what is unsettled. 8 general-list lines could not be found, or belong to another brand, and were dropped (All Saints Dedicación Maduro, Ashton Benchmade, Diesel Cask Aged, La Aurora Barrel Aged by Karl Malone, Nestor Miranda Don Lino Africa, Punch Golden Circle, Rojas Statement Habano, Te-Amo Clasico). 3 pairs turned out to be one cigar under two names and were merged (Rocky Patel Quarter Century, Protocol Themis, Romeo y Julieta Reserve). Two lounge-sheet entries stay unconfirmed because the sheet lists them and research could not find them (Kristoff Corojo Maduro, and Micallef with no line). The list is now 935 cigars in 121 brands, 914 of them checked. Some batches ran out of web searches partway and finished by opening known pages directly, and rockypatel.com was down, so its facts come from archived copies of the maker's pages and from halfwheel.
  - **Where it lives:** the fact-checked results are in `seed/research/batch-NN.json` (committed; they are public facts with their source links). `npm run seed` lays them over the lounge sheet and the general list and writes `src/seed/catalog.json`. To correct a cigar, edit its entry there and re-run the seed.
  - **New cigar fields** (all optional, filled with empty values when an older record is loaded, so no database version change): `wrapperLeaf`, `body`, `sizes` (name, length, ring), `flavors` (published tasting notes), `about`, `released`, `production`, `sources`, `researchNote`, `checked`.
  - **Rules of the merge:** research wins over both lists. On a checked cigar from the general list, a field research could not source is emptied, so an old guess never sits beside the checked mark. The lounge sheet is a real source, so its value stays when research has nothing. A general-list cigar that research could not find at all is dropped; a lounge-sheet cigar always stays. When research gives the proper line name the record takes it and keeps its id (ids still come from the original brand and line).
  - **Updating devices that already have the list** (`SEED_VERSION` 3, `src/data/seed.ts`): a seeded cigar nobody touched is replaced; a cigar Kohlton edited or marked "Looks right" keeps what he typed, gets its empty fields filled, and has a value corrected only when it still equals what the old catalog said (the catalog carries those old values under `previous`); a dropped cigar is hidden unless a smoke, a lot, or a wish refers to it or he edited it. None of this changes `updatedAt`, so untouched seeded cigars still never sync. Known gap: a dropped cigar logged on one device between the two devices updating can stay listed on one and hidden on the other.
  - **Cigar page:** About, Profile (strength on a five-step Mild to Full meter; body only when a source gives it separately), Blend, Where it is made, Sizes it comes in, Tasting notes as published, Good to know, then his own smokes and notes, the lounge sheet, and Sources (one link per site). A checked cigar shows "Details checked against published sources" in place of the Unconfirmed notice. The edit form gained Body and Wrapper leaf; sizes, published notes, and About are not editable in the app yet.
  - **Opening speed:** the catalog is now about 1.5 MB (277 KB compressed), so the app loads it only when the device's `seedVersion` is behind `src/seed/version.json`, which the seed script writes alongside the catalog.
  - **Search:** the Cigars tab also matches wrapper leaf and origin, binder, filler, factory, strength word, published notes, size names, and About. All three search boxes ignore accents ("damaso" finds Dámaso).
- **A much bigger cigar list** (Kohlton's request, 2026-10-11: he had searched for sticks that were not there, such as the Liga Privada Year of the Rat, and asked for the list to be expanded). He approved three things: sweep the makers' catalogs for lines missing from the brands already listed, add brands he did not have, and make search forgiving.
  - **Finding what was missing:** one agent per batch of brands read each maker's own catalog and the brand pages at Neptune Cigar, Famous Smoke, Holt's, and Small Batch Cigar, and listed every line not already in the app. Cigars International blocks automated visits and was not used. That found 1,794 missing lines in the 121 existing brands (976 regular, 766 limited, 52 discontinued). For new brands, the retailers' full brand lists were compared with the app: 169 brands were swept (53 carried by two or more of the retailers, 116 boutique brands from Neptune and Small Batch), giving 994 lines in 158 brands. Left out on purpose: house and bundle brands sold by only one big retailer, and machine-made cigars.
  - **Research and fact-check:** the same method as the first round (one agent researches a batch, a second re-opens the sources and corrects or empties what it cannot back up), over 154 batches. Of 2,788 lines, 2,787 were found and 2,733 passed the fact-check. The 54 that did not pass are real cigars with one detail unsettled (most often strength, with the maker's site down); the unsettled field is empty and they do not carry the checked mark. One was not a cigar of its own (The Circus is a line of El Viejo Continente) and was not added.
  - **Doubles removed when merging:** 57 cigars came back twice under two brand names and one copy was left out: ACID lines listed under both Acid and Drew Estate, Cain under Nub, Gellis Family under Warped, Guardian of the Farm under its own name and Aganorsa Leaf, J.C. Newman's La Unica, Alcazar, Havana Q, Sarzedas, and LeRoy Neiman under their own names, Nasser under AJ Fernandez, and a few more. The rule: keep the copy under the brand already in the list, or else the name on the band. Seven were re-filed the same way (five ACID Subculture lines to Acid, one Gellis Family line, Chateau Real Maduro to Drew Estate). Three joint releases stay under both makers because each entry describes that maker's half (Fuente y Padrón Legends, La Union, Nereus). Te-Amo Clasico, dropped in the first round, was found this time and is back.
  - **Result:** 3,665 cigars in 267 brands, 3,591 of them checked. 23 of the new entries are Cuban (Ramon Allones and Partagas). The new files are `seed/research/more-NNN.json`, read by the same seed script; a research entry that matches no cigar in the two lists now makes a record of its own, with the same kind of fixed id. `SEED_VERSION` is 4. The seed script also corrects the lounge sheet's spelling of Plasencia.
  - **Size:** the catalog is now about 5.2 MB (930 KB compressed). It still loads only when a device's list is behind, and the offline cache limit in `vite.config.ts` was raised to 8 MB so it is still saved for offline use.
  - **Forgiving search** (`closestCigars` in `src/domain/search.ts`): when nothing matches every word, the Cigars tab and the log picker show the closest names in place of an empty page, under "No exact match. These are the closest." It drops words that match nothing and forgives a letter or two of misspelling ("liga pravada year of the rat", "cao flathead habano"). In the Cigars tab, cigars with every word in their name now come ahead of ones that only mention the words in their details.
- **The cigar box finish** (Kohlton's request, 2026-10-11: the brown looked "plain and boring"). Three bright illustrated themes were mocked up first (a Havana night skyline, Miami neon, pastel Old Havana) and turned down as "too cartoony"; he prefers the brown and asked for it to be upgraded, with on-theme illustration allowed ("cigar boxes, cigar leafs"). He picked the version with band detailing. This replaces "no artwork of cigars" in section 12 and the lively-look note above.
  - **Materials:** the page background is a dark wrapper leaf with veins (`leaf.jpg`), darkened for reading and lit by a lamp glow from the top. Page headers, the tab bar, and the sidebar are cedar (`cedar.jpg`). Both textures and the two smoke layers were generated for this app by a script (procedural noise drawn in Chrome and saved as small images, about 330 KB together) and live in `src/assets/textures/`. They are precached, so they work offline.
  - **Headers** (`HeroArt` and `finish.css`): a double gold rule with a brass stud at each corner, like a box label; two layers of smoke rising slowly; and a fine gold line drawing behind the numbers: crossed tobacco leaves on Journal, one leaf on Cigars and Wishlist, an open cigar box on Humidor, a woven label rosette on Stats, Compare, and Settings. The smoke moves only as a background inside the header's own box, in keeping with the iPhone layout rule.
  - **Type and metal:** titles and score numerals are gold foil (a gradient clipped to the text), 34 px titles. Primary buttons, selected chips, and the Log button are brass with an embossed edge; the Log button has a slow ember glow.
  - **Band detailing:** each journal card wears an oxblood band between two gold edges with the brand in gold; month headings are centered between two rules; "Box-worthy" carries a small gold seal; section titles on detail pages run into a gold rule.
  - **Palette:** brighter gold, cream text, oxblood, and a richer green were added. All of it is in `tokens.css`; `finish.css` holds no colors of its own. Strength and wrapper shades are unchanged.
  - **Left out on purpose:** a color per brand (he was unsure), and bigger photo layouts (he has no photos yet).
- **Phone matches the laptop** (Kohlton's request, 2026-10-11: the phone "wasnt the same thing as the web version"; he wants the same tabs and the same steps on both). This replaces the five-slot tab bar and the More screen in section 11.
  - **Tabs:** the phone and tablet bar now shows the same seven tabs as the laptop sidebar, in the same order: Journal, Cigars, Humidor, Wishlist, Stats, Compare, Settings. The More screen is gone. The label size shrinks a little on narrow phones so all seven fit (`--text-tab`).
  - **Log button:** it no longer sits in the bar. It floats just above the bar's right end as its own fixed box, with the same brass and ember glow. Pages keep extra room at the bottom so the last row can scroll clear of it, and messages appear above it.
  - **Steps:** a device that has never chosen now starts in the Full log (the eight steps), on the phone as on the laptop. Quick is still one tap away on the picker, and the choice is remembered per device.
  - **Compare on the phone:** it used to say to open it on a laptop. It now works at every width. Two columns always fit beside the row labels; a third, and the Add button, scroll sideways inside the table's own box while the labels stay put. That box is positioned so nothing in a column can widen the page (the screen-reader text in a third column did, in the first try).
- **Graphics pass** (Kohlton's request, 2026-10-12: work on "the graphics and the visuals", "overall everything"). Same brown, same cigar box finish, redrawn.
  - **Page background:** `leaf.jpg` was redrawn (1280 by 640, shown at 640 px wide). The old one read as wood planks: bright, straight, evenly spaced lines. The new one is lit like a surface: a few wavy veins that swell and thin, a fine net of cross veins, a pebbled grain, and soft mottling.
  - **Smoke:** `smoke-a.webp` and `smoke-b.webp` were redrawn as thin ribbons (many fine strands carried up through a flow, so they fold like real smoke) on a clear background, in place of the gray smears. It is fainter, and it thins toward the left where the words are. From 768 px up the smoke is shown at full size so one ribbon does not repeat across a wide header.
  - **Header frame:** the plain double rule and four diamond studs became one label frame (`--frame` in `tokens.css`, laid on with `border-image`): a double gold rule with scooped corners and a stud in each.
  - **Line drawings moved out from behind the numbers.** Each drawing now sits in the title row, in whatever room is left between the title and the button (`.hero-etch`, a flex item), so it cannot sit behind a button or a figure. Lines keep their weight at any size. Journal has crossed leaves, Cigars two crossed cigars, Humidor the open box, Wishlist a leaf, and Stats, Compare, and Settings the woven seal. Compare shows its drawing from 768 px up only, because the switch fills the row on a phone.
  - **Empty screens:** the three plain rings are gone. Journal shows an ashtray with a resting cigar and a wisp of smoke, Humidor an empty open box, Wishlist a leaf, Stats the seal, and Compare two crossed cigars. All are drawn in `HeroArt.tsx` (`Etching`).
  - **Tab icons:** Cigars (a lit cigar), Humidor (a box with its lid open), and Compare (two cigars side by side) are drawn for this app in `src/components/icons.tsx`. The other four are still from lucide.
  - **Brass and cedar:** chart columns and bars are brass with a highlight, brand medallions are solid brass coins, the brand headings in the cigar list are a cedar strip, and the log flow's top and bottom bars are cedar like the tab bar.
  - **How the textures are made:** a throwaway script draws them in Chrome (seeded noise, so a re-run gives the same picture) and saves them. It is not in the repo, the same as the first set.
  - Checked at 390, 768, and 1440 in Chrome and at 390 in Playwright's WebKit: no sideways scroll and no console errors.
- **Home screen and a new logo** (Kohlton's request, 2026-10-12: "lets make a homescreen for it... a landing page", and "a new logo... really cool and original").
  - **The logo** is a C and a J. The C is a gold crescent. The J is a cigar with an oxblood band and a lit foot, and the smoke off the foot sweeps under the C to make the J's tail. It is drawn in `src/components/Logo.tsx` (colors from tokens) and, on a tile with the scooped label frame, in `public/icon.svg`. `npm run icons` rebuilt the Home Screen icon, the favicon, and the other sizes from that file. Two other ideas were drawn and dropped (a cigar crossed with a quill in a seal, and a journal whose pages are leaves).
  - **Home** (`src/screens/Home.tsx`) is now what opens first, at `#/`. It shows the logo, a greeting by time of day and the date, a large Log a smoke button (plus Resume when a log is in progress), four tiles that link to their tabs (smokes logged, average score, in the humidor, want to try), the last smoke, and up to four cigars that are ready to smoke, longest aged first.
  - **The journal moved to `#/journal`.** Every "back to journal" link, the delete and draft-kept returns, and the "/" search key now go there. `#/smokes/:id` is unchanged. An unknown address opens Home.
  - **Tabs:** Home is the first of eight tabs on every screen size, with the mark as its icon. Tab labels shrink slightly so eight fit across a 375 px phone. The sidebar's name and mark link to Home.
  - Checked at 375, 390, 768, and 1440 in Chrome and at 375 and 390 in Playwright's WebKit: no sideways scroll and no console errors.
- **Step 4 status**: steps 0 to 3 are built. Humidor, Stats, Cigars, Wishlist, Compare, and Settings show a one-line placeholder until their steps. The Full switch on the picker saves the choice but still runs the quick flow until step 5.

## 24. Ideas noticed during planning (not in Phase 1)

- "Changes since last backup" export, so the weekly AirDrop stays small as photos pile up.
- A "Recently deleted" list. Deletes are already soft, so this would be cheap.
- A custom subdomain so the journal has an address of its own, apart from the other github.io sites.
- A "Recommend to" line on a smoke for the floor (offered in the interview, not picked).
