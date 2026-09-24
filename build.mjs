/* ------------------------------------------------------------
   build.mjs - inlines the fonts, the world geometry and (when
   there is one) the portrait into the template, so the page is a
   single file that works with no network at all.

   Produces:
     index.html     full standalone document - open this to present
     artifact.html  body-only, for publishing as a Claude Artifact

   Run:  node build.mjs

   No node_modules needed. assets/world-paths.json is committed;
   regenerate it with `node tools/make-map.mjs` only if you want
   different map geometry.
   ------------------------------------------------------------ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/* woff2, embedded so the handwriting survives an offline laptop */
const FONTS = {
  FONT_CAVEAT: 'caveat-latin.woff2',
  FONT_INTER: 'inter-latin.woff2',
};

/* Optional. Drop a square photo at assets/SM.webp and it replaces the
   initials badge in the identity bar; with no file the page falls back
   to the monogram and nothing else changes. */
const OPTIONAL_IMAGES = {
  IMG_SM: 'SM.webp',
};

const TEMPLATE = process.argv[2] || 'index.template.html';
let html = readFileSync(join(here, TEMPLATE), 'utf8');

const inline = (token, path, mime, { optional = false } = {}) => {
  if (!html.includes(`{{${token}}}`)) return false;
  if (!existsSync(path)) {
    if (optional) return false;
    throw new Error(`missing asset for {{${token}}}: ${path}`);
  }
  const b64 = readFileSync(path).toString('base64');
  html = html.replaceAll(`{{${token}}}`, `data:${mime};base64,${b64}`);
  return true;
};

for (const [t, f] of Object.entries(FONTS)) {
  inline(t, join(here, 'fonts', f), 'font/woff2');
}

/* Optional means optional: with no file the token is replaced by an empty
   string, the page falls back to its monogram, and the unreplaced-token guard
   below still passes. */
let photo = false;
for (const [t, f] of Object.entries(OPTIONAL_IMAGES)) {
  const p = join(here, 'assets', f);
  if (existsSync(p)) photo = inline(t, p, 'image/webp') || photo;
  else html = html.replaceAll(`{{${t}}}`, '');
}

/* --- the world, as raw JSON rather than a data URI: the page parses
       it as an object literal, so there is nothing to fetch and
       nothing to decode at runtime --- */
const mapFile = join(here, 'assets', 'world-paths.json');
if (!existsSync(mapFile)) {
  throw new Error('assets/world-paths.json is missing - run: node tools/make-map.mjs');
}
const mapJson = readFileSync(mapFile, 'utf8');
/* a lone "</script" anywhere in embedded JSON would end the block early.
   Country names cannot contain one, but escaping costs nothing and means
   a future data change can never quietly break the page. */
html = html.replaceAll('{{MAP_JSON}}', mapJson.replaceAll('</', '<\\/'));

const left = html.match(/\{\{[A-Z_]+\}\}/g);
if (left) {
  throw new Error(`unreplaced tokens: ${[...new Set(left)].join(', ')}`);
}

/* artifact.html - the publisher supplies doctype/head/body itself */
writeFileSync(join(here, 'artifact.html'), html);

/* No hand-typed counts here. This string is what Slack, Teams, LinkedIn and
   Google show before anyone reaches the page, and it is the one place the
   page's derive-everything rule cannot reach - so it states no number at all
   rather than one that goes stale. It said "Thirty-one countries" while the
   page derived thirty-four. */
const DESC =
  'Nineteen years at Bosch, from ABAP developer to O2C Process Expert - told on a world '
  + 'map that fills in as the rollouts land, and the December 2016 turn that changed '
  + 'which side of the system he was on.';
const TITLE = 'Sasidhar Reddy Matli - SAP O2C Process Expert';

/* index.html - a complete document for opening straight off disk */
const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${TITLE}</title>
<meta name="description" content="${DESC}" />
<meta name="author" content="Sasidhar Reddy Matli" />
<meta name="theme-color" content="#faf6ec" />
<meta property="og:type" content="profile" />
<meta property="og:title" content="${TITLE}" />
<meta property="og:description" content="${DESC}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${TITLE}" />
<meta name="twitter:description" content="${DESC}" />
${html}
</html>`
  /* Line-ending agnostic, and the capture group re-uses the template's own
     ending rather than forcing \n. The literal '</style>\n' this replaced
     matched NOTHING on a CRLF template, so the shipped page had no <head>
     and no <body> - only a stray closing </body>. */
  .replace(/<\/style>(\r?\n)/, '</style>$1</head>$1<body>$1')
  .replace(/\r?\n<\/html>$/, '\n</body>\n</html>');

/* that replace is silent when it misses. never ship an unsplit document again */
if (!doc.includes('</head>') || !doc.includes('<body>')) {
  throw new Error(`head/body split failed: </style> anchor not found in ${TEMPLATE}`);
}

writeFileSync(join(here, 'index.html'), doc);

const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} KB`;
console.log(`source        ${TEMPLATE}`);
console.log(`portrait      ${photo ? 'assets/SM.webp' : 'none - using the monogram'}`);
console.log(`index.html    ${kb(doc)}`);
console.log(`artifact.html ${kb(html)}`);
