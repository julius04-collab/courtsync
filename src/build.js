// Turns a .dc.html artboard into a plain, self-contained index.html.
const fs = require('fs');
const { JSDOM } = require('jsdom');

const src = fs.readFileSync(process.argv[2], 'utf8');
const out = process.argv[3];

// 1) Run the component's renderVals() to get its data.
const scriptMatch = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
class DCLogic { constructor() { this.props = {}; this.state = null; } setState() {} }
const Component = new Function('DCLogic', scriptMatch[1] + '\nreturn Component;')(DCLogic);
const comp = new Component();
const vals = comp.renderVals();
// FAQ: render every answer; a small script handles open/close.
if (vals.faqs) vals.faqs = vals.faqs.map((q) => Object.assign({}, q, { open: true }));

// 2) Expand the template.
const dom = new JSDOM(src);
const doc = dom.window.document;
const xdc = doc.querySelector('x-dc');
const helmet = xdc.querySelector('helmet');

function lookup(path, scope) {
  path = path.trim();
  if (path === 'true') return true;
  if (path === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
  const parts = path.split('.');
  let v = scope;
  for (const p of parts) { if (v == null) return undefined; v = v[p]; }
  return v;
}
function interp(str, scope) {
  return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, p) => {
    const v = lookup(p, scope);
    return v == null || typeof v === 'function' ? '' : String(v);
  });
}
function render(node, scope) {
  const kids = Array.from(node.childNodes);
  for (const k of kids) {
    if (k.nodeType === 3) { if (k.nodeValue.includes('{{')) k.nodeValue = interp(k.nodeValue, scope); continue; }
    if (k.nodeType !== 1) continue;
    const tag = k.tagName.toLowerCase();
    if (tag === 'sc-for') {
      const list = lookup(k.getAttribute('list').replace(/[{}]/g, ''), scope) || [];
      const as = k.getAttribute('as');
      const frag = doc.createDocumentFragment();
      list.forEach((item, i) => {
        const wrap = doc.createElement('div');
        wrap.innerHTML = k.innerHTML;
        render(wrap, Object.assign({}, scope, { [as]: item, $index: i }));
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
      });
      k.replaceWith(frag);
      continue;
    }
    if (tag === 'sc-if') {
      const v = lookup(k.getAttribute('value').replace(/[{}]/g, ''), scope);
      if (v) { render(k, scope); const frag = doc.createDocumentFragment(); while (k.firstChild) frag.appendChild(k.firstChild); k.replaceWith(frag); }
      else k.remove();
      continue;
    }
    for (const a of Array.from(k.attributes)) {
      if (/^on[A-Z]/.test(a.name) || /^on[a-z]+$/i.test(a.name) && a.value.includes('{{')) { k.removeAttribute(a.name); continue; }
      if (a.name.startsWith('hint-')) { k.removeAttribute(a.name); continue; }
      if (a.value.includes('{{')) k.setAttribute(a.name, interp(a.value, scope));
    }
    render(k, scope);
  }
}
helmet.remove();
render(xdc, vals);

const headBits = helmet.innerHTML;
const title = (doc.querySelector('title') || { textContent: 'CourtSync' }).textContent;
const { SITE_CSS, SNAV, DIALOG, THANKS } = require('./template.js');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="The operating system for padel clubs. Bookings, payments, live scores and leagues — on every court, at once.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://courtsynk.netlify.app/">
<meta property="og:site_name" content="CourtSync">
<meta property="og:title" content="CourtSync — Padel club software">
<meta property="og:description" content="The operating system for padel clubs. Bookings, payments, live scores and leagues — on every court, at once.">
<meta property="og:image" content="https://courtsynk.netlify.app/og.png">
<meta property="og:image:secure_url" content="https://courtsynk.netlify.app/og.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="CourtSync — a padel court seen from above with the CourtSync name on it">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="CourtSync — Padel club software">
<meta name="twitter:description" content="The operating system for padel clubs. Bookings, payments, live scores and leagues.">
<meta name="twitter:image" content="https://courtsynk.netlify.app/og.png">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230E1428'/%3E%3Cg fill='none' stroke='%23C8FF1F' stroke-width='3' stroke-linecap='round'%3E%3Ccircle cx='16' cy='16' r='10'/%3E%3Cpath d='M8.5 9.5c3.5 3 3.5 10 0 13M23.5 9.5c-3.5 3-3.5 10 0 13'/%3E%3C/g%3E%3C/svg%3E">
${headBits}
${SITE_CSS}
</head>
<body>
${SNAV}
${xdc.innerHTML}
${DIALOG}
<div id="cs-toast" role="status" aria-live="polite"></div>
<script>window.CS_DATA = ${JSON.stringify({ timeline: vals.tlRaw })};</script>
<script>
${fs.readFileSync(__dirname + '/site.js', 'utf8')}
</script>
</body>
</html>
`;
fs.writeFileSync(out, html);
fs.writeFileSync(require('path').join(require('path').dirname(out), 'thanks.html'), THANKS);
console.log('wrote', out, html.length, 'bytes');
