# CourtSync

Landing page for CourtSync — padel club software (bookings, split payments, live scores, leagues).

Live: https://courtsynk.netlify.app

## Structure

- `site/` — the deployable static site (`index.html`, `thanks.html`, `og.png`). No build step needed to host it.
- `src/design.dc.html` — design source the site is generated from.
- `src/build.js` — turns the design source into `site/index.html`.
- `src/site.js` — interactions (timeline, pricing toggle, player app, demo dialog, forms).
- `src/template.js` — site-only pieces: sticky nav, demo dialog, toast, `thanks.html`.
- `src/og.html` — source for the 1200×630 share image.

## Rebuild

```bash
cd src
npm i jsdom
node build.js design.dc.html ../site/index.html
```

## Forms

The trial and demo forms use Netlify Forms (`data-netlify="true"`).
Enable **Forms → form detection** in Netlify, then redeploy.
