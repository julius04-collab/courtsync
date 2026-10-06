// Site-only pieces that don't belong on the design canvas.
const LOGO = '<span style="width:30px;height:30px;border-radius:9px;background:#0E1428;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8FF1F" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"></circle><path d="M5.5 6.5c3 2.5 3 8.5 0 11M18.5 6.5c-3 2.5-3 8.5 0 11"></path></svg></span>';

const SITE_CSS = `<style>
@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}
html{scroll-padding-top:90px}
:focus-visible{outline:3px solid #2348E0;outline-offset:3px}
button:disabled{cursor:progress}
.blk:hover{filter:brightness(1.06)}
[data-game]:hover,[data-chip]:hover,#app-join:hover,#app-cta:hover{filter:brightness(0.97)}

/* sticky nav */
.snav{position:fixed;left:50%;top:12px;z-index:100;width:min(1120px,calc(100% - 24px));display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 8px 8px 14px;border-radius:16px;
  background:rgba(255,255,255,0.78);border:1px solid rgba(14,20,40,0.08);box-shadow:0 18px 40px -24px rgba(14,20,40,0.45);
  backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4);
  transform:translate(-50%,-140%);transition:transform .45s cubic-bezier(.2,.8,.2,1);font-family:Archivo,sans-serif}
.snav.on{transform:translate(-50%,0)}
.snav a{color:#0E1428;text-decoration:none}
.snav-links{display:flex;gap:4px;font-size:14px;font-weight:600}
.snav-links a{padding:9px 12px;border-radius:9px}.snav-links a:hover{background:rgba(14,20,40,0.06)}
@media (max-width:860px){.snav-links{display:none}}

/* demo dialog */
#demo{width:min(560px,calc(100% - 24px));max-height:calc(100% - 24px);padding:0;border:0;border-radius:24px;background:#FFFFFF;color:#0E1428;box-shadow:0 40px 100px -30px rgba(14,20,40,0.6);font-family:Archivo,sans-serif}
#demo::backdrop{background:rgba(14,20,40,0.5);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
#demo[open]{animation:dlg .3s cubic-bezier(.2,.8,.2,1)}
@keyframes dlg{from{opacity:0;transform:translateY(24px) scale(.97)}}
@media (prefers-reduced-motion: reduce){#demo[open]{animation:none}}
.dlg-in{position:relative;padding:32px}
.dlg-x{position:absolute;right:16px;top:16px;width:44px;height:44px;border-radius:50%;border:0;background:#F2F3EF;cursor:pointer;display:flex;align-items:center;justify-content:center}
.fld{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:#3A4256;flex:1 1 200px;min-width:0}
.fld input,.fld select,.fld textarea{font:500 16px Archivo,sans-serif;color:#0E1428;background:#F2F3EF;border:1px solid #DADDD6;border-radius:12px;padding:0 14px;height:50px;width:100%}
.fld textarea{height:auto;padding:12px 14px;resize:vertical}
.fld input:focus,.fld select:focus,.fld textarea:focus{outline:2px solid #2348E0;outline-offset:1px;background:#FFFFFF}
.row2{display:flex;gap:12px;flex-wrap:wrap}

/* toast */
#cs-toast{position:fixed;left:50%;bottom:24px;z-index:200;transform:translate(-50%,140%);max-width:calc(100% - 32px);padding:14px 20px;border-radius:14px;background:#0E1428;color:#FFFFFF;font:700 15px Archivo,sans-serif;box-shadow:0 20px 40px -20px rgba(14,20,40,0.7);transition:transform .35s cubic-bezier(.2,.8,.2,1);pointer-events:none}
#cs-toast::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:#C8FF1F;margin-right:10px;vertical-align:middle}
#cs-toast.on{transform:translate(-50%,0)}
</style>`;

const SNAV = `<header id="snav" class="snav" aria-hidden="true">
  <a href="#top" aria-label="CourtSync home" style="display:flex;align-items:center;gap:10px">${LOGO}<span class="cd" style="font-size:22px">CourtSync</span></a>
  <nav class="snav-links" aria-label="Sections">
    <a href="#how">How it works</a><a href="#product">Product</a><a href="#players">Players</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a>
  </nav>
  <a href="#demo" data-open="demo" class="btn" style="min-height:44px;padding:0 18px;background:#C8FF1F;color:#0E1428;font-size:14px">Book a demo</a>
</header>`;

const DIALOG = `<dialog id="demo" aria-labelledby="demo-title">
  <div class="dlg-in">
    <button type="button" class="dlg-x" data-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E1428" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>
    <div id="demo-body">
      <div class="eyebrow">BOOK A DEMO</div>
      <h2 id="demo-title" class="cd" style="margin:12px 0 10px;font-size:clamp(38px,10vw,52px);padding-right:48px">See CourtSync<br>on your courts</h2>
      <p style="margin:0 0 22px;font-size:16px;line-height:1.55;color:#4A5368">A 20-minute video call. We’ll set up a sample of your club and walk you through bookings, payments and live scoring.</p>
      <form id="demo-form" name="demo" method="POST" action="/thanks.html" data-netlify="true" netlify-honeypot="bot-field" novalidate style="display:flex;flex-direction:column;gap:14px">
        <input type="hidden" name="form-name" value="demo">
        <input type="hidden" name="plan" id="demo-plan" value="">
        <p hidden><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <div class="row2">
          <label class="fld">Your name<input name="name" required autocomplete="name"></label>
          <label class="fld">Work email<input name="email" type="email" required autocomplete="email" inputmode="email"></label>
        </div>
        <div class="row2">
          <label class="fld">Club name<input name="club" autocomplete="organization"></label>
          <label class="fld">Number of courts<select name="courts"><option>1–3</option><option selected>4–6</option><option>7–12</option><option>13 or more</option></select></label>
        </div>
        <label class="fld">Anything we should know? <span style="font-weight:500;color:#8A92A3">(optional)</span><textarea name="message" rows="3"></textarea></label>
        <p id="demo-msg" aria-live="polite" style="margin:0;min-height:20px;font-size:14px"></p>
        <button type="submit" class="btn" style="background:#0E1428;color:#FFFFFF;min-height:54px">Request a demo <svg class="ar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>
      </form>
    </div>
  </div>
</dialog>`;

const THANKS = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thanks — CourtSync</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap" rel="stylesheet">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F2F3EF;color:#0E1428;font-family:Archivo,sans-serif;text-align:center;padding:24px}
h1{font-stretch:68%;font-weight:900;text-transform:uppercase;line-height:.86;font-size:clamp(56px,10vw,120px);margin:0}
p{font-size:18px;line-height:1.6;color:#4A5368;max-width:420px;margin:20px auto 28px}
a{display:inline-flex;align-items:center;min-height:52px;padding:0 24px;border-radius:12px;background:#0E1428;color:#fff;font-weight:800;text-decoration:none}</style></head>
<body><main><h1>Thanks.<br><span style="background:#C8FF1F;padding:0 12px">We got it.</span></h1>
<p>Your details reached the CourtSync team. We’ll be in touch by email shortly.</p>
<a href="/">Back to CourtSync</a></main></body></html>`;

module.exports = { SITE_CSS, SNAV, DIALOG, THANKS };
