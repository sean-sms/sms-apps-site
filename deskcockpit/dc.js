/* Desk Cockpit — showcase page behavior. No libraries, no network calls. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---- nav ---- */
  var nav = $('#nav'), menu = $('#menu'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---- hero: dusk falls as you scroll, and the cockpit lights up ---- */
  var hero = $('#top');
  var stars = $('#stars');
  (function makeStars() {
    var ns = 'http://www.w3.org/2000/svg', seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    stars.setAttribute('viewBox', '0 0 1000 600');
    stars.setAttribute('preserveAspectRatio', 'none');
    for (var i = 0; i < 140; i++) {
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', (rnd() * 1000).toFixed(1));
      c.setAttribute('cy', (Math.pow(rnd(), 1.6) * 600).toFixed(1));
      c.setAttribute('r', (rnd() * 1.3 + .35).toFixed(2));
      c.setAttribute('opacity', (rnd() * .7 + .3).toFixed(2));
      stars.appendChild(c);
    }
  })();
  var ticking = false;
  function onScroll() {
    nav.classList.toggle('solid', window.scrollY > 40);
    if (reduce) return;
    var span = Math.max(1, hero.offsetHeight - window.innerHeight);
    var p = Math.max(0, Math.min(1, window.scrollY / span));
    hero.style.setProperty('--p', p.toFixed(4));
    ticking = false;
  }
  if (reduce) hero.style.setProperty('--p', '1');
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---- reveal on scroll ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- shared example cards ---- */
  var ICON = { pdf: '📄', md: '📝', png: '🖼️', jpg: '🏞️', csv: '📊', link: '🔗', figma: '🎨', github: '🐙', cal: '📅', doc: '📘', duo: '🦉', run: '🏃', ball: '⚽️', wiki: '📚', canva: '🖌️' };
  // ago: days since the card was last opened, as of today.
  var CARDS = [
    { n: 'Northwind Proposal', s: 'This Week', k: 'pdf', m: 'PDF', ago: 0, glow: true, tag: '#ff9f0a' },
    { n: 'Brand Refresh Figma', s: 'This Week', k: 'figma', m: 'figma.com', ago: 0, pin: true, tag: '#bf5af2' },
    { n: 'Standup Notes', s: 'This Week', k: 'md', m: 'MD', ago: 1 },
    { n: 'Brand Refresh Moodboard', s: 'This Week', k: 'png', m: 'PNG', ago: 3 },
    { n: 'Project Tracker', s: 'Northwind Outfitters', k: 'github', m: 'github.com', ago: 0, pin: true, tag: '#30d158' },
    { n: 'Client Calendar', s: 'Northwind Outfitters', k: 'cal', m: 'calendar.google.com', ago: 2 },
    { n: 'Design Reviews', s: 'Northwind Outfitters', k: 'doc', m: 'notion.so', ago: 4 },
    { n: 'Lisbon Itinerary', s: 'Home & Family', k: 'pdf', m: 'PDF', ago: 1, glow: true, tag: '#ffd60a' },
    { n: 'Lake Weekend', s: 'Home & Family', k: 'jpg', m: 'JPG', ago: 2 },
    { n: 'Kitchen Reno Plan', s: 'Home & Family', k: 'png', m: 'PNG', ago: 6, tag: '#30d158' },
    { n: 'Soccer Schedule', s: 'Home & Family', k: 'ball', m: 'teamsnap.com', ago: 5 },
    { n: 'Family Budget 2027', s: 'Home & Family', k: 'csv', m: 'CSV', ago: 4, pin: true },
    { n: 'Swift Documentation', s: 'Learning', k: 'doc', m: 'developer.apple.com', ago: 0 },
    { n: 'Portuguese Practice', s: 'Learning', k: 'duo', m: 'duolingo.com', ago: 1, tag: '#30d158' },
    { n: 'History of the Aeroplane', s: 'Learning', k: 'wiki', m: 'wikipedia.org', ago: 8 }
  ];
  var SECTIONS = [
    { t: 'This Week', i: '🔥' }, { t: 'Northwind Outfitters', i: '💼' }, { t: 'Home & Family', i: '❤️' }, { t: 'Learning', i: '⭐️' }
  ];
  var LOST = 'Lost Focus', DAYS = 10;

  /* ---- fast-forward the week ---- */
  var board = $('#ffBoard'), range = $('#ffRange');
  if (board) {
    var day = 0, state, nodes = {};
    var start = new Date(2026, 9, 13);
    // Resets the cards in place: each card on the board keeps a link to its own
    // state object, so they must not be replaced.
    function reset() {
      if (!state) state = CARDS.map(function (c, i) { return { id: i, c: c }; });
      state.forEach(function (s) { s.opened = -s.c.ago; s.glow = !!s.c.glow; s.pin = !!s.c.pin; s.lost = false; s.lostAt = null; });
      day = 0; range.value = 0;
    }
    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    function cardNode(s) {
      var b = el('div', 'dcard'); b.tabIndex = 0; b.setAttribute('role', 'button');
      b.appendChild(el('span', 'fi', ICON[s.c.k] || '📄'));
      b.appendChild(el('span', 'nm', s.c.n));
      var tools = el('span', 'tools');
      var g = el('button', 'tg', '✦'); g.type = 'button'; g.title = 'Glow'; g.setAttribute('aria-label', 'Glow ' + s.c.n);
      var p = el('button', 'tg', '📌'); p.type = 'button'; p.title = 'Pin'; p.setAttribute('aria-label', 'Pin ' + s.c.n);
      g.addEventListener('click', function (e) { e.stopPropagation(); s.glow = !s.glow; if (s.glow && s.lost) rescue(s); render(); });
      p.addEventListener('click', function (e) { e.stopPropagation(); s.pin = !s.pin; if (s.pin && s.lost) rescue(s); render(); });
      tools.appendChild(g); tools.appendChild(p); b.appendChild(tools);
      var mt = el('span', 'mt'); b.appendChild(mt);
      if (s.c.tag) b.style.setProperty('--tag', s.c.tag);
      function open() { s.opened = day; if (s.lost) rescue(s); render(); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); }
      b.addEventListener('click', open);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      s.g = g; s.p = p; s.mt = mt;
      return b;
    }
    function rescue(s) { s.lost = false; s.lostAt = null; s.opened = day; }
    function sweep() {
      state.forEach(function (s) {
        var protectedCard = s.glow || s.pin;
        if (!s.lost && !protectedCard && day - s.opened >= DAYS) { s.lost = true; s.lostAt = day; }
        // Dragging back in time undoes moves that hadn't happened yet.
        if (s.lost && s.lostAt != null && day < s.lostAt) { s.lost = false; s.lostAt = null; }
      });
    }
    function ago(s) {
      var d = day - s.opened;
      return d <= 0 ? 'Opened today' : d === 1 ? 'Opened yesterday' : 'Opened ' + d + ' days ago';
    }
    var secEls = {};
    function build() {
      board.innerHTML = '';
      SECTIONS.concat([{ t: LOST, i: '🕘' }]).forEach(function (sec) {
        var w = el('div', 'bsec' + (sec.t === LOST ? ' lost' : ''));
        var h = el('h3'); h.appendChild(el('span', null, sec.i)); h.appendChild(el('span', null, sec.t));
        var count = el('span', 'count', '0'); h.appendChild(count);
        var cards = el('div', 'cards');
        w.appendChild(h); w.appendChild(cards);
        board.appendChild(w);
        secEls[sec.t] = { cards: cards, count: count };
      });
      state.forEach(function (s) { nodes[s.id] = cardNode(s); });
    }
    function render() {
      sweep();
      // FLIP: remember where every card was, move them, then animate from there.
      var before = {};
      state.forEach(function (s) { before[s.id] = nodes[s.id].getBoundingClientRect(); });
      var counts = {};
      state.forEach(function (s) {
        var target = s.lost ? LOST : s.c.s;
        counts[target] = (counts[target] || 0) + 1;
        var n = nodes[s.id];
        if (n.parentNode !== secEls[target].cards) secEls[target].cards.appendChild(n);
        n.classList.toggle('glow', s.glow);
        s.g.setAttribute('aria-pressed', s.glow); s.p.setAttribute('aria-pressed', s.pin);
        s.mt.textContent = (s.glow ? 'Glowing · ' : s.pin ? 'Pinned · ' : '') + ago(s);
      });
      // Keep each section in its original order.
      Object.keys(secEls).forEach(function (t) {
        var c = secEls[t].cards;
        state.filter(function (s) { return nodes[s.id].parentNode === c; }).forEach(function (s) { c.appendChild(nodes[s.id]); });
        secEls[t].count.textContent = (counts[t] || 0) + ((counts[t] || 0) === 1 ? ' item' : ' items');
        var empty = c.querySelector('.empty');
        if (!counts[t] && !empty) c.appendChild(el('div', 'empty', t === LOST ? 'Nothing here. Everything is in use.' : 'Empty'));
        if (counts[t] && empty) empty.remove();
      });
      if (!reduce && before) {
        state.forEach(function (s) {
          var n = nodes[s.id], a = before[s.id], b = n.getBoundingClientRect();
          if (!a.width) return;
          var dx = a.left - b.left, dy = a.top - b.top;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
          n.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' });
        });
      }
      var d = new Date(start); d.setDate(d.getDate() + day);
      $('#ffDay').textContent = day === 0 ? 'Today' : '+' + day + (day === 1 ? ' day' : ' days');
      $('#ffDate').textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      syncControls();
    }
    // `day` is the one source of truth: the knob and the button are redrawn from it
    // on every render, so they can never drift apart.
    var playBtn = $('#ffPlay'), timer = null, MAX = +range.max;
    function syncControls() {
      if (+range.value !== day) range.value = day;
      var mode = timer ? 'pause' : day >= MAX ? 'replay' : 'play';
      playBtn.querySelector('.ico').textContent = mode === 'pause' ? '❚❚' : mode === 'replay' ? '↺' : '▶︎';
      playBtn.querySelector('.lbl').textContent = mode === 'pause' ? 'Pause' : mode === 'replay' ? 'Replay' : 'Play';
      playBtn.setAttribute('aria-label', mode === 'pause' ? 'Pause' : mode === 'replay' ? 'Play the three weeks again' : 'Play the next three weeks');
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } syncControls(); }
    function play() {
      stop();
      if (day >= MAX) reset();
      timer = setInterval(function () {
        day = Math.min(MAX, day + 1);
        if (day >= MAX) { clearInterval(timer); timer = null; }
        render();
      }, reduce ? 120 : 420);
      render();
    }
    playBtn.addEventListener('click', function () { if (timer) stop(); else play(); });
    function setDay(d) {
      d = Math.max(0, Math.min(MAX, Math.round(d)));
      if (timer) { clearInterval(timer); timer = null; }
      day = d; render();
    }
    range.addEventListener('input', function () { setDay(+range.value); });
    // iPhone and iPad Safari only move a slider by its knob; let a tap or drag anywhere
    // on the track set the day, and keep Safari's own handling out of the way.
    function fromPointer(e) {
      var b = range.getBoundingClientRect();
      setDay(Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)) * MAX);
    }
    range.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    range.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return; // desktop sliders already behave
      e.preventDefault(); fromPointer(e);
      try { range.setPointerCapture(e.pointerId); } catch (err) { /* capture is a nicety */ }
      function move(ev) { fromPointer(ev); }
      function up() { range.removeEventListener('pointermove', move); range.removeEventListener('pointerup', up); range.removeEventListener('pointercancel', up); }
      range.addEventListener('pointermove', move); range.addEventListener('pointerup', up); range.addEventListener('pointercancel', up);
    });
    // Safari can bring a page back from its cache, or restore the old slider position,
    // without telling the page: redraw from `day` when that happens.
    window.addEventListener('pageshow', function () { stop(); render(); });
    reset(); build(); render();
    // Play once by itself the first time the controls come into view.
    if (!reduce && 'IntersectionObserver' in window) {
      var played = false;
      var fio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !played) { played = true; fio.disconnect(); setTimeout(function () { if (!timer && day === 0) play(); }, 700); }
      }, { threshold: 0.6 });
      fio.observe($('.ff-controls'));
    }
  }

  /* ---- ⌘K palette, with the app's matching rules ---- */
  var pq = $('#pq'), pres = $('#pres'), toast = $('#ptoast');
  if (pq) {
    var fold = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var isWordChar = function (ch) { return /[\p{L}\p{N}]/u.test(ch); };
    // Mirrors FuzzyMatch.score in the app: letters in order; runs, word starts and a prefix score higher.
    function score(query, text) {
      var needle = Array.from(fold(query).replace(/\s/g, '')), hay = Array.from(fold(text));
      if (!needle.length) return { s: 0, hits: [] };
      if (needle.length > hay.length) return null;
      var sc = 0, n = 0, prev = -2, hits = [];
      for (var h = 0; h < hay.length && n < needle.length; h++) {
        if (hay[h] !== needle[n]) continue;
        sc += 1;
        if (prev === h - 1) sc += 5;
        if (h === 0 || !isWordChar(hay[h - 1])) sc += 8;
        prev = h; hits.push(h); n++;
      }
      if (n < needle.length) return null;
      if (hay.slice(0, needle.length).join('') === needle.join('')) sc += 20;
      return { s: sc * 100 - hay.length, hits: hits };
    }
    var results = [], sel = 0, toastTimer;
    function mark(name, hits) {
      var out = document.createDocumentFragment(), chars = Array.from(name), set = {};
      hits.forEach(function (i) { set[i] = true; });
      chars.forEach(function (ch, i) {
        if (set[i]) { var m = document.createElement('mark'); m.textContent = ch; out.appendChild(m); }
        else out.appendChild(document.createTextNode(ch));
      });
      return out;
    }
    function draw() {
      var q = pq.value;
      results = CARDS.map(function (c) { var r = score(q, c.n); return r && { c: c, r: r }; })
        .filter(Boolean).sort(function (a, b) { return b.r.s - a.r.s; }).slice(0, 6);
      sel = Math.min(sel, Math.max(0, results.length - 1));
      pres.innerHTML = '';
      if (!results.length) { var li = document.createElement('li'); li.className = 'none'; li.textContent = 'No cards match “' + q + '”'; pres.appendChild(li); return; }
      results.forEach(function (x, i) {
        var li = document.createElement('li'); li.setAttribute('role', 'option'); li.id = 'pr' + i;
        li.setAttribute('aria-selected', i === sel);
        var fi = document.createElement('span'); fi.className = 'fi'; fi.textContent = ICON[x.c.k] || '📄';
        var b = document.createElement('b'); b.appendChild(mark(x.c.n, q ? x.r.hits : []));
        var sm = document.createElement('small'); sm.textContent = x.c.s + ' · ' + x.c.m;
        li.appendChild(fi); li.appendChild(b); li.appendChild(sm);
        li.addEventListener('mousemove', function () { if (sel !== i) { sel = i; mark2(); } });
        li.addEventListener('click', function () { sel = i; act('Opened'); });
        pres.appendChild(li);
      });
      pq.setAttribute('aria-activedescendant', 'pr' + sel);
    }
    function mark2() { $$('li[role=option]', pres).forEach(function (li, i) { li.setAttribute('aria-selected', i === sel); }); pq.setAttribute('aria-activedescendant', 'pr' + sel); }
    function act(verb) {
      var x = results[sel]; if (!x) return;
      toast.textContent = verb + ' “' + x.c.n + '”';
      toast.classList.add('on'); clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 1800);
    }
    pq.addEventListener('input', function () { sel = 0; draw(); });
    pq.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, results.length); mark2(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + results.length) % Math.max(1, results.length); mark2(); }
      else if (e.key === 'Enter') { e.preventDefault(); act((e.metaKey || e.ctrlKey) ? 'Showed on the board:' : 'Opened'); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); act('Quick Look:'); }
      else if (e.key === 'Escape') { pq.value = ''; sel = 0; draw(); }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        $('#find').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        pq.focus({ preventScroll: true }); pq.select();
      }
    });
    // Type a demo query once when the palette first comes into view, unless the visitor got there first.
    var typed = false;
    function demo() {
      if (typed || document.activeElement === pq || pq.value) return; typed = true;
      var word = 'nwp', i = 0;
      (function step() { if (document.activeElement === pq) return; pq.value = word.slice(0, ++i); sel = 0; draw(); if (i < word.length) setTimeout(step, 260); })();
    }
    if (!reduce && 'IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { setTimeout(demo, 500); pio.disconnect(); } }, { threshold: .6 });
      pio.observe(pq);
    }
    draw();
  }

  /* ---- theatre ---- */
  var tv = $('#tv'), tcap = $('#tcap'), tplay = $('#tplay');
  if (tv) {
    var userPaused = false, visible = false;
    function setPaused(p) { tplay.classList.toggle('paused', p); tplay.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    function play() { if (userPaused || reduce) { setPaused(true); return; } var pr = tv.play(); if (pr && pr.catch) pr.catch(function () { setPaused(true); }); setPaused(false); }
    $$('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.tab').forEach(function (o) { o.setAttribute('aria-selected', o === t); });
        var v = t.dataset.v;
        tv.poster = '/deskcockpit/media/' + v + '-poster.jpg';
        tv.src = '/deskcockpit/media/' + v + '.mp4';
        tcap.textContent = t.dataset.cap;
        userPaused = false;
        if (visible || !('IntersectionObserver' in window)) play();
      });
    });
    tplay.addEventListener('click', function () {
      if (tv.paused) { userPaused = false; reduce = false; tv.play(); setPaused(false); }
      else { userPaused = true; tv.pause(); setPaused(true); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) play(); else tv.pause();
      }, { threshold: .4 }).observe(tv);
    }
    if (reduce) setPaused(true);
  }

  /* ---- looks ---- */
  $$('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.seg button').forEach(function (o) { o.setAttribute('aria-checked', o === b); });
      $$('#looksShot img').forEach(function (img) { img.classList.toggle('on', img.dataset.look === b.dataset.look); });
    });
  });
})();
