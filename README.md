# Sasidhar Matli Portfolio

Career portfolio for **Sasidhar Reddy Matli** — SAP O2C Process Expert, Bosch Home Comfort.

Sibling to the [Mankineni Portfolio](../Mankineni%20Portfolio) — same cream paper, same
handwriting, same two-ink idea — but a different spine, because it's a different story.

## The Atlas

Pavan's page is a **road**: one long ride, seven controls. That works because his story is
a sequence.

Sasidhar's isn't a route. It's **reach**, plus one sharp turn in the middle. So the page
has three devices and no road:

**The map fills in.** A world map sits behind the timeline. Each chapter inks the countries
that first appear in it, and a counter climbs `0 → 6 → 9 → 11 → 21 → 27 → 34`.

**Two layers, not one.** Blue is where the *work* went — the roadmap's "Major Country
Projects Supported". Pencil is where he was *living*. Keeping them apart matters: the
column is about projects, so conflating the two left India blank for the eight years he
worked there. Relocation arcs connect the four home towns, including the three separate
crossings between Coimbatore and Leinfelden.

**Two inks tip over.** Blue is what he **built**; green is what he **owns**. The first
chapter is `3 built, 0 owned`. The last is `6 built, 10 owned`.

The turn is dated precisely. **December 2016**, he changed Bosch entity — BGSW, the
software company, to PTDE, Power Tools — without changing desk or town. The chapter is
called *Same city, other side*, and it's where the blue stops and the green starts. Eleven
of his 34 countries arrive before it; twenty-three after.

## Sources

Everything on the page comes from three documents in `source/` (gitignored — see below):

| File | What it gave |
|---|---|
| `Roadmap_Overview.xlsx` | the authoritative year-by-year timeline: location, entity, role, countries |
| `MATLI_Introduction.pptx` | the 16 footprint cities, the 13 process topics, personal details |
| `MyRoadMap.pptx` | nine dated milestone flags — **in the slide images, not its text** |

Those nine flags (*Developer* Dec 2006, *Onsite Coordinator* 2010, *Forms & Reprint* 2011,
*Architect* 2013, *Invoicing* and *eShop* 2014, *Order Mgmt*, *Migration Mgmt* and
*Enhanced ATP* 2015) are the only named deliverables in any source, and they make the build
side concrete. They also peak in 2015 — immediately before the turn.

## ⚠ source/ must never be committed

`source/` holds his own employer documents and personal details — not ours to republish.
GitHub Pages serves every committed file at a public URL, so a committed source file is a
published one. `source/` is in `.gitignore` and out of the git index.

```bash
git ls-files | grep -i source     # must print nothing
```

If you move this repo, copy `source/` by hand — git will not carry it.

## Status

Built from his real history; every "to be confirmed" flag is gone. What remains is a short
list of factual questions for him.

Two working notes sit in `docs/` **on your disk only** — that folder is gitignored, so
these are links for you, not for anyone who clones this:

- `docs/open-questions.md` — the 33-vs-34 country count, the KPI discrepancy, three
  unresolved entity codes, and where each answer goes.
- `docs/before-sharing.md` — read before the link leaves your laptop.

## Presenting it

Open `index.html`, `F11`, and scroll at your own pace. Fonts and the entire world map are
embedded, so it works with no network on a locked-down laptop. On a phone the map pins to
the top of the screen and the chapters scroll underneath it.

## Build

```bash
node build.mjs        # regenerates index.html and artifact.html
```

No `npm install` needed. Edit `index.template.html`, never `index.html` — the build
overwrites it.

Map geometry is **committed** as `assets/world-paths.json`, so a fresh clone builds with
nothing but node. Regenerate only to change geometry or add a country:

```bash
npm install            # d3-geo, topojson-client, world-atlas
node tools/make-map.mjs
```

## Files

| File | What it is |
|---|---|
| `index.html` | **Built. Present this.** Self-contained, no network needed. |
| `index.template.html` | The source. All content is in the data block at the top of the `<script>`. |
| `build.mjs` | Inlines fonts, map and photo → `index.html` + `artifact.html` |
| `artifact.html` | Body-only build, for publishing as a Claude Artifact |
| `tools/make-map.mjs` | Natural Earth → `assets/world-paths.json`. Output is committed. |
| `assets/world-paths.json` | 176 country outlines + graticule, Natural Earth 1 projection |
| `fonts/` | Caveat + Inter, latin woff2 (SIL Open Font License) |
| `source/` | His three originals. **Gitignored — never commit.** |
| `docs/` | Prep notes. **Local only, gitignored.** |

## Editing content

Everything is data, near the top of the `<script>`:

- `CHAPTERS` — the seven eras. Each carries `countries` (blue), `base` (pencil), `years`
  (the go-live lines), `milestones` and an optional `move` (a relocation arc).
- `BASES` / `SITES` — the four home towns, and the 16 footprint cities
- `PLATFORM` — the R/3 and S/4 lists, side by side
- `COVER` / `CLOSING` / `KIT` / `PERSON` / `TODAY` — framing copy

A toolkit entry is `['Name', 'build']` or `['Name', 'own']`. That one flag drives the chip
colour, the per-era mix bar, the toolkit card, the card's left border and the legend.

**Counts are derived, never typed.** The country tile, the counter, the "+N new" line, the
before/after split on the cover and in the closing, the years-at-Bosch figure, the entity
count and the home-town count all read the same arrays. Add a country and every one of
them moves. `AS_OF` is the single constant the tenure arithmetic hangs off.

Site cities are placed in the chapter where **their country** first appears — derived, so a
pin can never precede the country it sits in.

## Design

Creamy squared paper (`#faf6ec`) and brand blue `#2c5bd6`, both lifted from the sibling
repo. Second ink is process green `#16795c`; stamp red `#b4442f` marks sites; pencil
`#6d6a5f` carries the home layer and the relocation arcs. Three inks, not four — "where he
lived" is a pencil wash rather than a new hue, so the palette stays readable.
Single-theme by choice.

The map is real Natural Earth geometry, **not distorted**. An early version applied the
sibling repo's hand-drawn wobble to the coastlines, which mostly made Italy stop looking
like Italy. The hand comes from the stroke: each inked country is traced twice, the second
pass offset slightly, reading as a pen gone over the line.

City labels are placed by trying four positions around each pin and measuring the real
rendered box, dropping any that still collides — home towns are placed first so they always
win a slot. Without it, Europe printed "Aveirodrid". Every dropped label still appears in
full in the region panels below the map.

Hong Kong and Singapore have no outline at 1:110m and render as discs. That's the honest
rendering for a city-state, and cheaper than the 739 KB 50m dataset.

## Publishing to GitHub Pages

`index.html` is at the repo root and completely self-contained — no external requests at
all — so Pages needs no build step and no config.

```bash
gh repo create sasidhar-portfolio --public --source . --remote origin --push
# then: Settings -> Pages -> Deploy from a branch -> main -> / (root)
```

`.nojekyll` is committed so Pages serves every file as-is.

**Check `git ls-files | grep -i source` prints nothing first**, and read
`docs/before-sharing.md` on your disk.
