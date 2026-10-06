/* CourtSync — site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var D = window.CS_DATA || {};
  var LIME = '#C8FF1F', INK = '#0E1428', BLUE = '#2348E0', RED = '#B42318';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, css, text) { var n = document.createElement(tag); if (css) n.style.cssText = css; if (text != null) n.textContent = text; return n; }

  /* ---------- toast ---------- */
  var toast = $('#cs-toast'), toastT;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('on'); }, 3000);
  }

  /* ---------- sticky nav after the hero ---------- */
  var snav = $('#snav'), sheet = $('.sheet');
  function onScroll() {
    if (!snav || !sheet) return;
    var show = sheet.getBoundingClientRect().top < 90;
    snav.classList.toggle('on', show);
    snav.setAttribute('aria-hidden', show ? 'false' : 'true');
    $$('a,button', snav).forEach(function (a) { a.tabIndex = show ? 0 : -1; });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- plan + billing state ---------- */
  var billing = 'Monthly';
  function setPlan(p) {
    if (!p) return;
    var a = $('#trial-plan'), b = $('#trial-plan-label');
    if (a) a.value = p; if (b) b.textContent = p;
  }

  /* ---------- "start trial" and "book demo" triggers ---------- */
  function goTrial(p) {
    setPlan(p);
    var box = $('#trial-box') || $('#cta');
    if (box) box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    var email = $('#cs-email');
    if (email) setTimeout(function () { email.focus({ preventScroll: true }); }, reduce ? 0 : 650);
    if (p) say(p + ' plan selected — enter your email to start');
  }
  var dlg = $('#demo');
  function openDemo(p) {
    if (!dlg) return;
    var hp = $('#demo-plan'); if (hp) hp.value = p || '';
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { var f = $('#demo input[name=name]'); if (f) f.focus(); }, 40);
  }
  function closeDemo() { if (!dlg) return; if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
  if (dlg) {
    dlg.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDemo(); });
    $$('[data-close]', dlg).forEach(function (b) { b.addEventListener('click', closeDemo); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-open],[data-go]');
    if (!a) return;
    if (a.getAttribute('data-open') === 'demo') { e.preventDefault(); openDemo(a.getAttribute('data-plan')); }
    else if (a.getAttribute('data-go') === 'trial') { e.preventDefault(); goTrial(a.getAttribute('data-plan')); }
  });

  /* ---------- billing toggle ---------- */
  function setBill(k) {
    billing = k === 'y' ? 'Yearly' : 'Monthly';
    var hb = $('#trial-billing'); if (hb) hb.value = billing;
    $$('[data-bill]').forEach(function (b) {
      var on = b.getAttribute('data-bill') === k;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.background = on ? INK : 'transparent'; b.style.color = on ? '#FFFFFF' : INK;
    });
    $$('[data-price]').forEach(function (p) {
      var v = p.getAttribute('data-' + k);
      if (p.textContent === v) return;
      p.textContent = v;
      if (!reduce && p.animate) p.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    $$('[data-per]').forEach(function (p) { p.textContent = p.getAttribute('data-' + k); });
  }
  $$('[data-bill]').forEach(function (b) { b.addEventListener('click', function () { setBill(b.getAttribute('data-bill')); }); });

  /* ---------- FAQ accordion ---------- */
  var qs = $$('#faq button[aria-expanded]'), openQ = 0;
  function setQ(i) {
    qs.forEach(function (b, j) {
      var on = j === i, p = b.nextElementSibling, ic = b.querySelector('span');
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (p) p.hidden = !on;
      if (ic) { ic.style.background = on ? LIME : '#FFFFFF'; ic.style.transform = 'rotate(' + (on ? 45 : 0) + 'deg)'; }
    });
  }
  qs.forEach(function (b, i) { b.addEventListener('click', function () { openQ = openQ === i ? -1 : i; setQ(openQ); }); });
  setQ(openQ);

  /* ---------- club timeline ---------- */
  var T = D.timeline || [], grid = $('#tl-grid');
  var KIND = {
    b: { bg: BLUE, fg: '#FFFFFF', bd: '0', tag: 'Booked', tbg: BLUE, tfg: '#FFFFFF', tbd: '0' },
    l: { bg: LIME, fg: INK, bd: '0', tag: 'Live now', tbg: LIME, tfg: INK, tbd: '0' },
    c: { bg: INK, fg: '#FFFFFF', bd: '0', tag: 'Coaching', tbg: INK, tfg: '#FFFFFF', tbd: '0' },
    o: { bg: '#FFFFFF', fg: '#5B6478', bd: '1.5px dashed #C9CDC5', tag: 'Open', tbg: '#FFFFFF', tfg: INK, tbd: '1.5px dashed #9AA2B4' },
    m: { bg: BLUE, fg: '#FFFFFF', bd: '2px solid ' + LIME, tag: 'Booked by you', tbg: LIME, tfg: INK, tbd: '0' }
  };
  var day = T[0] && T[0].id, sel = null, mine = {};
  function hh(i) { var h = 7 + i; return (h < 10 ? '0' : '') + h + ':00'; }
  function dayData() { return T.filter(function (d) { return d.id === day; })[0]; }
  function firstKey(d) {
    var k = null;
    ['l', 'o'].forEach(function (want) {
      d.rows.forEach(function (r, c) { r.forEach(function (b, i) { if (!k && b[3] === want) k = d.id + '-' + c + '-' + i; }); });
    });
    return k;
  }
  function renderTL(focusKey) {
    if (!grid || !T.length) return;
    var d = dayData(); if (!sel) sel = firstKey(d);
    $$('.tl-x', grid).forEach(function (n) { n.remove(); });
    var live = 0;
    d.rows.forEach(function (row, c) {
      var nm = el('span', 'grid-row:' + (c + 2) + ';grid-column:1;font-size:13px;font-weight:800;align-self:center', 'Court ' + (c + 1));
      nm.className = 'tl-x'; grid.appendChild(nm);
      row.forEach(function (b, i) {
        var key = day + '-' + c + '-' + i, k = mine[key] ? 'm' : b[3], st = KIND[k], on = key === sel;
        if (k === 'l') live++;
        var bt = el('button', 'grid-row:' + (c + 2) + ';grid-column:' + (b[0] + 2) + ' / span ' + b[1] +
          ';height:40px;border-radius:8px;background:' + st.bg + ';color:' + st.fg + ';border:' + st.bd +
          ';font-family:Archivo,sans-serif;font-size:11px;font-weight:700;display:flex;align-items:center;padding:0 10px;white-space:nowrap;overflow:hidden;cursor:pointer;text-align:left;box-shadow:' +
          (on ? '0 0 0 3px ' + INK : 'none'), k === 'm' ? 'Yours' : b[2]);
        bt.type = 'button'; bt.className = 'tl-x blk';
        bt.setAttribute('data-key', key); bt.setAttribute('aria-pressed', on ? 'true' : 'false');
        bt.setAttribute('aria-label', 'Court ' + (c + 1) + ', ' + hh(b[0]) + ' to ' + hh(b[0] + b[1]) + ', ' + st.tag);
        bt.addEventListener('click', function () { sel = key; renderTL(key); });
        grid.appendChild(bt);
        if (focusKey === key) bt.focus({ preventScroll: true });
      });
    });
    // tabs
    $$('#tl-tabs [data-day]').forEach(function (t) {
      var on = t.getAttribute('data-day') === day;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.style.background = on ? '#FFFFFF' : 'transparent'; t.style.color = on ? INK : '#5B6478';
      t.style.boxShadow = on ? '0 1px 3px rgba(14,20,40,0.15)' : 'none';
    });
    // live badge
    var lab = $('#tl-live-label'), dot = $('#tl-live-dot');
    if (lab) lab.textContent = live ? live + ' LIVE' : 'NO LIVE MATCHES';
    if (dot) dot.style.display = live ? 'inline-block' : 'none';
    // detail bar
    var p = sel.split('-'), c = +p[1], i = +p[2], b = d.rows[c][i], k = mine[sel] ? 'm' : b[3], st = KIND[k];
    var tag = $('#tl-d-tag'), title = $('#tl-d-title'), who = $('#tl-d-who'), act = $('#tl-d-act');
    tag.textContent = st.tag; tag.style.background = st.tbg; tag.style.color = st.tfg; tag.style.border = st.tbd;
    title.textContent = 'Court ' + (c + 1) + ' · ' + hh(b[0]) + '–' + hh(b[0] + b[1]);
    who.textContent = k === 'm' ? 'Booked by you · invite 3 players to split the fee' : (b[4] || 'Free · up to 4 players');
    act.style.visibility = (k === 'o' || k === 'm') ? 'visible' : 'hidden';
    act.textContent = k === 'o' ? 'Book this slot' : 'Cancel booking';
    act.style.background = k === 'o' ? LIME : '#FFFFFF';
    act.style.border = k === 'o' ? '0' : '1px solid #C9CDC5';
  }
  $$('#tl-tabs [data-day]').forEach(function (t) {
    t.addEventListener('click', function () { day = t.getAttribute('data-day'); sel = null; renderTL(); });
  });
  var actBtn = $('#tl-d-act');
  if (actBtn) actBtn.addEventListener('click', function () {
    var d = dayData(), p = sel.split('-'), b = d.rows[+p[1]][+p[2]];
    if (mine[sel]) { delete mine[sel]; say('Booking cancelled — Court ' + (+p[1] + 1) + ' is open again'); }
    else if (b[3] === 'o') { mine[sel] = true; say('Booked — Court ' + (+p[1] + 1) + ' at ' + hh(b[0])); }
    renderTL();
  });
  renderTL();

  /* ---------- player app ---------- */
  $$('[data-chip]').forEach(function (ch) {
    ch.addEventListener('click', function () {
      var on = ch.getAttribute('aria-pressed') !== 'true';
      ch.setAttribute('aria-pressed', on ? 'true' : 'false');
      ch.style.background = on ? INK : '#FFFFFF'; ch.style.color = on ? LIME : INK;
    });
  });
  var join = $('#app-join'), slot = $('#app-slot'), appCta = $('#app-cta'), joined = false;
  function setJoined(v) {
    joined = v;
    slot.style.border = v ? '2px solid #FFFFFF' : '2px dashed #9AA2B4';
    slot.style.background = v ? LIME : 'transparent';
    slot.textContent = v ? 'YOU' : '';
    join.textContent = v ? 'You’re in ✓' : 'Join · 1 spot';
    join.style.background = v ? INK : LIME; join.style.color = v ? LIME : INK;
    appCta.textContent = v ? 'Pay your share · $12' : 'Book & split · 4 players';
    appCta.style.background = v ? LIME : INK; appCta.style.color = v ? INK : LIME;
  }
  if (join) join.addEventListener('click', function () {
    setJoined(!joined);
    say(joined ? 'You’re in — Court 4 at 19:00. 4 of 4 players.' : 'You left the game');
  });
  if (appCta) appCta.addEventListener('click', function () {
    say(joined ? 'Paid $12 — see you on Court 4 at 19:00' : 'Pick a game first, then split the fee');
  });
  $$('[data-game]').forEach(function (g) {
    g.addEventListener('click', function () {
      var on = g.getAttribute('aria-pressed') !== 'true';
      g.setAttribute('aria-pressed', on ? 'true' : 'false');
      g.style.borderColor = on ? BLUE : 'transparent';
      say(on ? 'Saved — we’ll ping you about ' + g.getAttribute('data-game') : 'Removed from saved games');
    });
  });

  /* ---------- forms (Netlify Forms) ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Hosting on Vercel? Paste your Web3Forms access key here (web3forms.com — free, emails each
  // submission to you). Leave empty to use Netlify Forms instead.
  var WEB3FORMS_KEY = '';
  function post(form) {
    if (WEB3FORMS_KEY) {
      var fd = new FormData(form);
      if (fd.get('bot-field')) return Promise.resolve(); // honeypot: silently drop bots
      var data = { access_key: WEB3FORMS_KEY, from_name: 'CourtSync website', subject: 'CourtSync — new ' + fd.get('form-name') + ' request' };
      fd.forEach(function (v, k) { if (k !== 'bot-field') data[k] = v; });
      return fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (j) { if (!j.success) throw new Error(j.message || 'Send failed'); });
    }
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }
  function busy(btn, on, label) {
    if (on) { btn.dataset.html = btn.innerHTML; btn.disabled = true; btn.style.opacity = '0.7'; btn.textContent = label || 'Sending…'; }
    else { btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = btn.dataset.html; }
  }
  function errMsg(node, text) { node.textContent = ''; node.appendChild(el('span', 'color:' + RED + ';font-weight:700', text)); }

  // trial
  var tf = $('#trial-form');
  if (tf) tf.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('#cs-email'), msg = $('#trial-msg'), btn = tf.querySelector('[type=submit]'), v = email.value.trim();
    if (!EMAIL.test(v)) {
      email.setAttribute('aria-invalid', 'true'); email.style.borderColor = RED;
      errMsg(msg, 'Please enter a valid email, like you@yourclub.com'); email.focus(); return;
    }
    email.removeAttribute('aria-invalid'); email.style.borderColor = '';
    $('#trial-billing').value = billing;
    busy(btn, true);
    post(tf).then(function () {
      var plan = $('#trial-plan').value;
      var box = $('#trial-box'); box.textContent = '';
      var card = el('div', 'display:flex;gap:16px;align-items:center;text-align:left;padding:22px 24px;border-radius:18px;background:#0E1428;color:#FFFFFF');
      var tick = el('span', 'flex:none;width:44px;height:44px;border-radius:50%;background:' + LIME + ';display:flex;align-items:center;justify-content:center');
      tick.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1428" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
      var txt = el('div');
      txt.appendChild(el('div', 'font-weight:800;font-size:18px', 'You’re on the list'));
      var line = el('div', 'font-size:15px;color:#B7BFD6;margin-top:4px');
      line.appendChild(document.createTextNode('We’ll email '));
      line.appendChild(el('b', 'color:#FFFFFF', v));
      line.appendChild(document.createTextNode(' to set up your ' + plan + ' trial (' + billing.toLowerCase() + ').'));
      txt.appendChild(line);
      card.appendChild(tick); card.appendChild(txt); box.appendChild(card);
      if (!reduce && card.animate) card.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 320 });
      say('Thanks — trial request received');
    }).catch(function () {
      busy(btn, false);
      errMsg(msg, 'Couldn’t send just now — check your connection and try again.');
    });
  });

  // demo
  var df = $('#demo-form');
  if (df) df.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#demo-msg'), btn = df.querySelector('[type=submit]');
    var name = df.elements.name, email = df.elements.email, bad = null;
    [name, email].forEach(function (f) { f.removeAttribute('aria-invalid'); f.style.borderColor = ''; });
    if (!name.value.trim()) bad = [name, 'Please add your name.'];
    else if (!EMAIL.test(email.value.trim())) bad = [email, 'Please enter a valid email, like you@yourclub.com'];
    if (bad) { bad[0].setAttribute('aria-invalid', 'true'); bad[0].style.borderColor = RED; errMsg(msg, bad[1]); bad[0].focus(); return; }
    msg.textContent = '';
    busy(btn, true);
    post(df).then(function () {
      var body = $('#demo-body'), first = name.value.trim().split(' ')[0];
      body.textContent = '';
      var wrap = el('div', 'text-align:center;padding:24px 8px 8px');
      var tick = el('div', 'width:64px;height:64px;margin:0 auto 20px;border-radius:50%;background:' + LIME + ';display:flex;align-items:center;justify-content:center');
      tick.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E1428" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
      var h = el('h2', '', 'Thanks, ' + first); h.className = 'cd'; h.style.fontSize = '52px'; h.style.margin = '0';
      var p = el('p', 'margin:14px auto 24px;max-width:340px;font-size:16px;line-height:1.55;color:#4A5368', 'We’ll reply to ' + email.value.trim() + ' to find a time for your demo.');
      var done = el('button', '', 'Done'); done.type = 'button'; done.className = 'btn'; done.style.background = INK; done.style.color = '#FFFFFF';
      done.addEventListener('click', closeDemo);
      wrap.appendChild(tick); wrap.appendChild(h); wrap.appendChild(p); wrap.appendChild(done); body.appendChild(wrap);
      done.focus();
    }).catch(function () {
      busy(btn, false);
      errMsg(msg, 'Couldn’t send just now — check your connection and try again.');
    });
  });
})();
