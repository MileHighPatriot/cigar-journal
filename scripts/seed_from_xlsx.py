"""Converter: lounge sheet (xlsx) plus the general list -> src/seed/catalog.json.

Standard library only. Run with: npm run seed
Bump SEED_VERSION whenever the output changes, so devices that already seeded pick up
the new cigars. Existing ids are never overwritten on a device.
"""
import json
import sys
import uuid
import zipfile
import xml.etree.ElementTree as ET

M = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
P = "http://schemas.openxmlformats.org/package/2006/relationships"

# Fixed so the phone and the laptop seed identical records and a merge never doubles the catalog.
NAMESPACE = uuid.UUID("6f1d2c1e-5b0a-4f0e-9a51-c16a47b0a001")
SEED_TIMESTAMP = "2026-10-10T00:00:00.000Z"
SEED_VERSION = 3

WRAPPER_CATEGORIES = {
    "Connecticut", "Candela", "Claro", "Natural/Sun Grown", "Cameroon", "Sumatra", "Corojo",
    "Criollo", "Habano", "Rosado", "Colorado", "Mata Fina", "San Andrés", "Maduro/Broadleaf",
}

STRENGTH = {"mild": 1, "mild-medium": 2, "medium": 3, "medium-full": 4, "full": 5}
PRICE = {"$": 1, "$$": 2, "$$$": 3}


def col_index(ref):
    n = 0
    for c in ref:
        if c.isalpha():
            n = n * 26 + (ord(c.upper()) - 64)
    return n - 1


def load(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("{%s}si" % M):
            shared.append("".join(t.text or "" for t in si.iter("{%s}t" % M)))
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    relmap = {r.get("Id"): r.get("Target") for r in rels.findall("{%s}Relationship" % P)}
    book = {}
    for sheet in wb.find("{%s}sheets" % M).findall("{%s}sheet" % M):
        target = relmap[sheet.get("{%s}id" % R)].lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        rows = []
        for row in ET.fromstring(z.read(target)).iter("{%s}row" % M):
            cells = {}
            for c in row.findall("{%s}c" % M):
                v = c.find("{%s}v" % M)
                if c.get("t") == "s" and v is not None:
                    val = shared[int(v.text)]
                elif c.get("t") == "inlineStr":
                    val = "".join(x.text or "" for x in c.iter("{%s}t" % M))
                else:
                    val = v.text if v is not None else ""
                if val.strip():
                    cells[col_index(c.get("r"))] = val.strip()
            if cells:
                rows.append(cells)
        book[sheet.get("name")] = rows
    return book


def unknown(value):
    low = value.lower()
    return (
        not value
        or low.startswith("unverified")
        or low.startswith("varies")
        or low.startswith("sources conflict")
        or low.startswith("check the")
        or low.startswith("not listed")
    )


def clean(value):
    # The app shows no em dashes anywhere, seed text included.
    return value.replace(" — ", ", ").replace("—", ", ")


def text(value):
    return None if unknown(value) else clean(value)


def versions(value):
    low = value.lower()
    if unknown(value) or low == "none found" or "unverified" in low:
        return None
    return clean(value)


def line_name(value):
    # One brand has no known lines yet; keep the brand and leave the line empty.
    return "" if value.lower().startswith("lines vary") else clean(value)


def words(value):
    if unknown(value):
        return []
    return [w.strip().lower() for w in value.split(",") if w.strip() and not unknown(w.strip())]


def record(brand, line, **fields):
    base = {
        "id": str(uuid.uuid5(NAMESPACE, "%s|%s" % (brand.lower(), line.lower()))),
        "createdAt": SEED_TIMESTAMP,
        "updatedAt": SEED_TIMESTAMP,
        "deletedAt": None,
        "brand": brand,
        "line": line,
        "vitola": None,
        "lengthIn": None,
        "ringGauge": None,
        "shape": None,
        "wrapperType": None,
        "wrapperOrigin": None,
        "binder": None,
        "filler": None,
        "country": None,
        "factory": None,
        "strength": None,
        "priceTier": None,
        "notes": "",
        "confirmed": False,
        "source": "seed",
        "sheetFlavors": [],
        "sheetPairings": [],
        "otherWrapperVersions": None,
        "similarCigars": None,
        "wrapperLeaf": None,
        "body": None,
        "sizes": [],
        "flavors": [],
        "about": None,
        "released": None,
        "production": None,
        "sources": [],
        "researchNote": "",
        "checked": False,
    }
    base.update(fields)
    return base


def general_list(path):
    """Brand|Line|Strength|Wrapper|Country, one per line. '#' starts a comment."""
    rows = []
    with open(path, encoding="utf-8") as f:
        for number, raw in enumerate(f, 1):
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            parts = [part.strip() for part in line.split("|")]
            if len(parts) != 5:
                raise SystemExit("%s line %d: expected 5 fields" % (path, number))
            brand, name, strength, wrapper, country = parts
            if strength and strength.lower() not in STRENGTH:
                raise SystemExit("%s line %d: unknown strength %r" % (path, number, strength))
            rows.append(
                record(
                    brand,
                    name,
                    strength=STRENGTH.get(strength.lower()),
                    wrapperType=wrapper or None,
                    country=country or None,
                )
            )
    return rows


# Details research can replace on a cigar that came with an earlier catalog.
SUPERSEDED = ("line", "wrapperType", "wrapperOrigin", "binder", "filler", "country", "factory", "strength")


def load_research(folder):
    """Fact-checked research, one JSON file per batch. Keyed by brand and line as in the lists."""
    import glob
    import os

    found = {}
    for path in sorted(glob.glob(os.path.join(folder, "*.json"))):
        with open(path, encoding="utf-8") as f:
            for entry in json.load(f):
                found[(entry["brand"].lower(), entry["line"].lower())] = entry
    return found


def plain(value):
    """Lowercase with accents removed, for comparing names."""
    import unicodedata

    return "".join(c for c in unicodedata.normalize("NFD", value) if unicodedata.category(c) != "Mn").lower()


def strip_brand(name, brand):
    """ "Padrón 1964 Anniversary Series" under brand "Padron" becomes "1964 Anniversary Series"."""
    if not name:
        return None
    if plain(name).startswith(plain(brand) + " "):
        name = name[len(brand) + 1 :].strip()
    return name or None


def number(value):
    return value if isinstance(value, (int, float)) and not isinstance(value, bool) and value > 0 else None


def apply_research(cigar, entry, from_sheet):
    """Lays researched details over a catalog record. Returns False when the cigar should be dropped."""
    if not entry.get("found"):
        # A line from the general list that research could not confirm does not belong in the list.
        # A line from the lounge sheet stays: the lounge says it carries it.
        if from_sheet and entry.get("notes"):
            cigar["researchNote"] = clean(entry["notes"])
        return from_sheet

    checked = entry.get("verified") is True

    def take(field, value):
        # Research is the standard. Where it found nothing, a guess from the general list is
        # emptied instead of left standing. The lounge sheet is a real source, so its value
        # stays when research has nothing to put in its place.
        if value not in (None, "", []):
            cigar[field] = value
        elif not from_sheet:
            cigar[field] = [] if isinstance(cigar[field], list) else None

    text = lambda v: clean(v.strip()) if isinstance(v, str) and v.strip() else None
    category = entry.get("wrapperCategory")
    take("wrapperType", category if category in WRAPPER_CATEGORIES else None)
    take("wrapperLeaf", text(entry.get("wrapperLeaf")))
    take("wrapperOrigin", text(entry.get("wrapperOrigin")))
    take("binder", text(entry.get("binder")))
    take("filler", text(entry.get("filler")))
    take("country", text(entry.get("country")))
    take("factory", text(entry.get("factory")))
    take("strength", STRENGTH.get((entry.get("strength") or "").lower()))
    take("body", STRENGTH.get((entry.get("body") or "").lower()))
    sizes = []
    for size in entry.get("sizes") or []:
        name = text(size.get("name"))
        if name:
            sizes.append({"name": name, "lengthIn": number(size.get("length")), "ringGauge": number(size.get("ring"))})
    take("sizes", sizes[:10])
    take("flavors", [clean(w.strip().lower()) for w in entry.get("flavors") or [] if isinstance(w, str) and w.strip()][:6])
    take("about", text(entry.get("about")))
    released = entry.get("released")
    take("released", released if isinstance(released, int) and 1800 < released < 2100 else None)
    production = entry.get("production")
    take("production", production if production in ("regular", "limited", "discontinued") else None)
    cigar["sources"] = [u for u in entry.get("sources") or [] if isinstance(u, str) and u.startswith("http")][:3]
    cigar["researchNote"] = text(entry.get("notes")) or ""
    cigar["checked"] = checked
    official = strip_brand(text(entry.get("officialName")), cigar["brand"])
    if official:
        # The id stays tied to the original name, so devices update the record in place.
        cigar["line"] = official
    return True


def main(src, dest, general=None, research_dir=None):
    book = load(src)
    cigars = []

    rows = book["All Cigars"]
    header = [rows[0].get(i, "") for i in range(max(rows[0]) + 1)]
    col = {name: i for i, name in enumerate(header)}
    for r in rows[1:]:
        if len(r) < 2:
            continue  # footnote rows

        def get(name):
            return r.get(col[name], "")

        cigars.append(
            record(
                get("Brand"),
                line_name(get("Line")),
                strength=STRENGTH.get(get("Strength").lower()),
                wrapperType=text(get("Wrapper")),
                wrapperOrigin=text(get("Wrapper Origin / Detail")),
                binder=text(get("Binder")),
                filler=text(get("Filler")),
                sheetFlavors=words(get("Flavor Notes")),
                sheetPairings=words(get("Pairings")),
                priceTier=PRICE.get(get("Price Tier")),
                otherWrapperVersions=versions(get("Other Wrapper Versions")),
                similarCigars=text(get("If they like this, suggest")),
            )
        )

    house = book["Stanley Pappas Cigars"]
    for r in house[1:]:
        if len(r) < 2:
            continue  # source note
        cigars.append(record("Stanley Pappas", r.get(0, ""), priceTier=PRICE.get(r.get(1, ""))))

    ids = {c["id"] for c in cigars}
    if len(ids) != len(cigars):
        raise SystemExit("Duplicate brand + line in the sheet")

    sheet_count = len(cigars)
    if general:
        for cigar in general_list(general):
            # The lounge sheet wins when both list the same brand and line.
            if cigar["id"] in ids:
                continue
            ids.add(cigar["id"])
            cigars.append(cigar)
    print("%d from the lounge sheet, %d from the general list" % (sheet_count, len(cigars) - sheet_count))

    previous = {}
    if research_dir:
        research = load_research(research_dir)
        kept, dropped, checked, sheet_kept = [], [], 0, 0
        for index, cigar in enumerate(cigars):
            entry = research.get((cigar["brand"].lower(), cigar["line"].lower()))
            if entry is None:
                if index < sheet_count:
                    sheet_kept = len(kept) + 1
                kept.append(cigar)
                continue
            before = dict(cigar)
            if apply_research(cigar, entry, from_sheet=index < sheet_count):
                if index < sheet_count:
                    sheet_kept = len(kept) + 1
                kept.append(cigar)
                checked += 1 if cigar["checked"] else 0
                # What the last catalog said, for each detail research changed. A device uses it
                # to tell a value Kohlton typed from one that only came with the old list.
                was = {k: before[k] for k in SUPERSEDED if before[k] != cigar[k] and before[k] not in (None, "", [])}
                if was:
                    previous[cigar["id"]] = was
            else:
                dropped.append("%s %s" % (cigar["brand"], cigar["line"]))
        # Two entries can turn out to be one cigar under its proper name. Keep one: the lounge
        # sheet's if it has one, else the entry that already had the right name.
        by_name = {}
        for index, cigar in enumerate(kept):
            by_name.setdefault((plain(cigar["brand"]), plain(cigar["line"])), []).append((index, cigar))
        doubles = set()
        for same in by_name.values():
            if len(same) < 2:
                continue
            same.sort(key=lambda pair: (pair[0] >= sheet_kept, pair[1]["id"] in previous and "line" in previous[pair[1]["id"]], pair[0]))
            for index, cigar in same[1:]:
                doubles.add(cigar["id"])
                previous.pop(cigar["id"], None)
                dropped.append("%s %s (same cigar as another entry)" % (cigar["brand"], cigar["line"]))
        kept = [c for c in kept if c["id"] not in doubles]
        cigars = kept
        print("research: %d entries read, %d cigars checked, %d dropped as not found" % (len(research), checked, len(dropped)))
        for name in dropped:
            print("  dropped:", name)

    with open(dest, "w", encoding="utf-8") as f:
        json.dump(
            {"seedVersion": SEED_VERSION, "cigars": cigars, "previous": previous},
            f,
            ensure_ascii=False,
            indent=1,
        )
        f.write("\n")
    # A tiny file of its own, so the app can tell the list is up to date without loading it.
    import os

    with open(os.path.join(os.path.dirname(dest), "version.json"), "w", encoding="utf-8") as f:
        f.write('{ "seedVersion": %d }\n' % SEED_VERSION)
    print("Wrote %d cigars to %s" % (len(cigars), dest))


if __name__ == "__main__":
    main(
        sys.argv[1],
        sys.argv[2],
        sys.argv[3] if len(sys.argv) > 3 else None,
        sys.argv[4] if len(sys.argv) > 4 else None,
    )
