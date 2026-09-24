/* ------------------------------------------------------------
   make-map.mjs - turns Natural Earth (via the world-atlas npm
   package, public domain) into assets/world-paths.json:

     { w, h, scale, tx, ty, graticule, countries: [ {id, a2, n, d} ] }

   Run once.  The OUTPUT IS COMMITTED, so build.mjs and the page
   itself never need node_modules - a clone can build with nothing
   but node.  Re-run only if you want different geometry.

     node tools/make-map.mjs

   Projection is Natural Earth 1.  `scale`/`tx`/`ty` are written out
   so the page can re-project city lat/lon at runtime with exactly
   the same numbers (see projectLonLat in index.template.html) -
   that is what lets CITIES stay editable as plain coordinates
   instead of baked-in pixels.
   ------------------------------------------------------------ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

/* ISO 3166-1 numeric -> alpha-2.  Deliberately NOT the full table:
   only the countries the page actually names, plus a margin of
   likely additions.  Everything else renders as background land and
   never needs a code, so a wrong guess can't silently mislabel a
   stamp. Verified entry by entry against ISO 3166-1. */
const A2 = {
  // --- Asia Pacific -------------------------------------------------
  36: 'AU', 554: 'NZ', 356: 'IN', 392: 'JP', 156: 'CN', 344: 'HK',
  702: 'SG', 458: 'MY', 764: 'TH', 704: 'VN', 360: 'ID', 608: 'PH',
  158: 'TW', 410: 'KR',
  // --- EMEA ---------------------------------------------------------
  276: 'DE', 643: 'RU', 804: 'UA', 642: 'RO', 100: 'BG', 792: 'TR',
  784: 'AE', 504: 'MA', 724: 'ES', 620: 'PT', 348: 'HU', 203: 'CZ',
  616: 'PL', 703: 'SK', 191: 'HR', 688: 'RS',
  // --- Americas -----------------------------------------------------
  840: 'US', 124: 'CA', 170: 'CO', 152: 'CL',
  // --- margin: plausible future additions ---------------------------
  250: 'FR', 380: 'IT', 826: 'GB', 528: 'NL', 56: 'BE', 40: 'AT',
  756: 'CH', 752: 'SE', 578: 'NO', 208: 'DK', 246: 'FI', 372: 'IE',
  76: 'BR', 484: 'MX', 32: 'AR', 604: 'PE', 710: 'ZA', 818: 'EG',
  682: 'SA', 586: 'PK', 50: 'BD', 144: 'LK', 104: 'MM', 116: 'KH',
  300: 'GR', 705: 'SI', 233: 'EE', 428: 'LV',
  440: 'LT', 112: 'BY', 268: 'GE', 398: 'KZ', 364: 'IR', 368: 'IQ',
  376: 'IL', 400: 'JO', 414: 'KW', 634: 'QA', 512: 'OM', 48: 'BH',
  788: 'TN', 12: 'DZ', 566: 'NG', 404: 'KE', 231: 'ET', 288: 'GH',
};

const ANTARCTICA = 10; /* dropped: it owns a third of the height and
                          says nothing about a career */

const topo = JSON.parse(
  readFileSync(join(root, 'node_modules/world-atlas/countries-110m.json'), 'utf8')
);
const fc = feature(topo, topo.objects.countries);
fc.features = fc.features.filter((f) => Number(f.id) !== ANTARCTICA);

/* ---- fit the projection to a 1000-unit-wide canvas ---- */
const W = 1000;
const projection = geoNaturalEarth1();
projection.fitWidth(W, fc);
const [, y0] = projection.translate();
const scale = projection.scale();
const [tx, ty] = projection.translate();

/* measured height of the fitted content, so the viewBox hugs the land */
const bounds = geoPath(projection).bounds(fc);
const H = Math.ceil(bounds[1][1] - bounds[0][1]);
/* shift so the content starts at y=0 */
const shiftY = -bounds[0][1];
projection.translate([tx, ty + shiftY]);

const path = geoPath(projection);

/* round coordinates to 1dp - at this canvas size that is well under a
   device pixel, and it roughly halves the file */
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(n * 10) / 10));

const countries = fc.features
  .map((f) => {
    const d = path(f);
    if (!d) return null;
    return {
      id: Number(f.id),
      a2: A2[Number(f.id)] || null,
      n: f.properties.name,
      d: round(d),
    };
  })
  .filter(Boolean);

const graticule = round(path(geoGraticule10()) || '');

const out = {
  _source: 'Natural Earth 1:110m via world-atlas (public domain)',
  _projection: 'geoNaturalEarth1',
  w: W,
  h: H,
  scale,
  tx,
  ty: ty + shiftY,
  graticule,
  countries,
};

const file = join(root, 'assets', 'world-paths.json');
writeFileSync(file, JSON.stringify(out));

const named = countries.filter((c) => c.a2).length;
console.log(`countries   ${countries.length} (${named} carry an alpha-2 code)`);
console.log(`viewBox     0 0 ${W} ${H}`);
console.log(`projection  scale ${scale.toFixed(3)}  translate ${tx.toFixed(2)},${(ty + shiftY).toFixed(2)}`);
console.log(`written     assets/world-paths.json  ${Math.round(JSON.stringify(out).length / 1024)} KB`);
