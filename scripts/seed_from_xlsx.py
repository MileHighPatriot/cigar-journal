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
SEED_VERSION = 2

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


def main(src, dest, general=None):
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

    with open(dest, "w", encoding="utf-8") as f:
        json.dump({"seedVersion": SEED_VERSION, "cigars": cigars}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("Wrote %d cigars to %s" % (len(cigars), dest))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
