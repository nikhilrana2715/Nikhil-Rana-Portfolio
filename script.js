// Nikhil Rana Portfolio — interactions (v2.1)
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- No service worker here: remove any stray one + its stale caches ---------- */
  // (another app that once ran on this origin can leave a worker serving old CSS/JS)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(async (regs) => {
      if (!regs.length) return;
      await Promise.all(regs.map(r => r.unregister()));
      if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k)));
      if (navigator.serviceWorker.controller && !sessionStorage.getItem('sw-cleared')) {
        sessionStorage.setItem('sw-cleared', '1');
        location.reload(); // load fresh files once
      }
    }).catch(() => { /* ignore */ });
  }

  /* ---------- Theme (light = brand default) ---------- */
  const getStored = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
  const setStored = (v) => { try { localStorage.setItem('theme', v); } catch { /* ignore */ } };
  const cord = document.getElementById('cord');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    cord?.setAttribute('aria-pressed', String(t === 'dark'));
  };
  const toggleTheme = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStored(next);
  };
  applyTheme(getStored() || 'light');

  /* ---------- Pull cord: verlet rope physics ----------
     - mouse passing through the rope pushes it aside
     - grab the bob and swing / throw it anywhere; let go and it swings back
     - pull it down past its length (stretch >= PULL) and release -> lights toggle
     - plain click / Enter / Space -> tug + toggle */
  const canvas = document.getElementById('cordCanvas');
  if (cord && canvas) {
    const ctx = canvas.getContext('2d');
    const N = 20;                 // rope points
    const PULL = 34;              // stretch (px) needed to toggle
    const STRETCH_MAX = 80;       // rubber-band limit when pulling
    const PUSH_R = 16;            // hover push radius
    const GRAVITY = 1500;         // px/s^2
    const DAMP = reduceMotion ? 0.86 : 0.985;
    let pts = [], seg = 10, anchor = { x: 0, y: -4 }, total = 0;
    let dpr = 1, W = 0, H = 0;
    let drag = null;              // { id, ox, oy, sx, sy, moved, maxStretch }
    let mouse = null, raf = 0, still = 0, last = 0;

    const layout = () => {
      // use the canvas's real CSS box (excludes scrollbar) so rope + bob share one coordinate space
      W = canvas.clientWidth || document.documentElement.clientWidth;
      H = canvas.clientHeight || document.documentElement.clientHeight;
      dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const mobile = W <= 860;
      const right = mobile ? 64 : Math.min(96, Math.max(64, W * 0.06));
      const len = mobile ? 72 : Math.min(230, Math.max(110, H * 0.26));
      const ax = W - right - 22;
      const dx = ax - anchor.x;
      anchor = { x: ax, y: -4 };
      seg = len / (N - 1); total = len;
      if (!pts.length) {
        pts = Array.from({ length: N }, (_, i) => ({ x: ax, y: -4 + i * seg, px: ax, py: -4 + i * seg }));
      } else {
        pts.forEach(p => { p.x += dx; p.px += dx; });
      }
    };

    const clampStretch = (x, y) => {
      const dx = x - anchor.x, dy = y - anchor.y, d = Math.hypot(dx, dy) || 1;
      if (d <= total) return { x, y, s: 0 };
      const ex = d - total;
      const s = STRETCH_MAX * (1 - Math.exp(-ex / STRETCH_MAX)); // rubber band
      const k = (total + s) / d;
      return { x: anchor.x + dx * k, y: anchor.y + dy * k, s };
    };

    // only a (roughly) downward pull counts as switching the light — sideways swings don't
    const pullAmount = (x, y) => {
      const dx = x - anchor.x, dy = y - anchor.y, d = Math.hypot(dx, dy) || 1;
      return dy / d > 0.85 ? clampStretch(x, y).s : 0; // within ~32° of straight down
    };

    const step = (dt) => {
      const g = GRAVITY * dt * dt;
      for (let i = 1; i < N; i++) {
        const p = pts[i];
        let vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
        const vmax = 60; // cap per-step velocity (keeps throws sane)
        const v = Math.hypot(vx, vy); if (v > vmax) { vx *= vmax / v; vy *= vmax / v; }
        p.px = p.x; p.py = p.y;
        p.x += vx; p.y += vy + g * (i === N - 1 ? 2.2 : 1); // bob is heavier
      }
      const end = pts[N - 1];
      let target = null;
      if (drag) {
        target = clampStretch(drag.tx, drag.ty);
        drag.maxStretch = Math.max(drag.maxStretch, pullAmount(drag.tx, drag.ty));
      }
      // hover push (mouse only, not while dragging)
      if (mouse && !drag && !reduceMotion) {
        for (let i = 2; i < N; i++) {
          const p = pts[i], dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < PUSH_R && d > 0.01) { const k = (PUSH_R - d) / d * 0.5; p.x += dx * k; p.y += dy * k * 0.3; }
        }
      }
      // constraints
      const len = drag ? seg * (1 + (target.s / total)) : seg; // stretch evenly while pulling
      for (let it = 0; it < 14; it++) {
        pts[0].x = anchor.x; pts[0].y = anchor.y;
        if (target) { end.x = target.x; end.y = target.y; }
        for (let i = 0; i < N - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.0001;
          const diff = (d - len) / d;
          const aFixed = i === 0, bFixed = !!target && i + 1 === N - 1;
          const wa = aFixed ? 0 : (bFixed ? 1 : 0.5), wb = bFixed ? 0 : (aFixed ? 1 : 0.5);
          a.x += dx * diff * wa; a.y += dy * diff * wa;
          b.x -= dx * diff * wb; b.y -= dy * diff * wb;
        }
      }
      if (target) { end.x = target.x; end.y = target.y; }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const path = () => {
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < N - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[N - 1].x, pts[N - 1].y);
      };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.save(); ctx.translate(2, 3); path(); ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); // soft shadow
      path(); ctx.strokeStyle = '#7A6A50'; ctx.lineWidth = 4; ctx.stroke();              // solid outline: always visible, never gappy
      path(); ctx.strokeStyle = '#CDB894'; ctx.lineWidth = 2.4; ctx.stroke();            // light core
      ctx.setLineDash([2.5, 2.5]); path(); ctx.strokeStyle = 'rgba(122,106,80,.75)'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.setLineDash([]); // twist
      // bob follows the last segment's angle
      const a = pts[N - 2], b = pts[N - 1];
      const ang = -Math.atan2(b.x - a.x, b.y - a.y);
      cord.style.transform = `translate(${b.x - 22}px, ${b.y - 4}px) rotate(${ang}rad)`; // cap overlaps rope end
    };

    const energy = () => {
      let e = 0; for (let i = 1; i < N; i++) e += Math.abs(pts[i].x - pts[i].px) + Math.abs(pts[i].y - pts[i].py);
      return e;
    };

    const tick = (t) => {
      const dt = Math.min(1 / 30, (t - last) / 1000 || 1 / 60); last = t;
      const sub = 2; for (let s = 0; s < sub; s++) step(dt / sub);
      draw();
      // sleep when at rest
      if (!drag && !mouse && energy() < 0.05) { if (++still > 20) { raf = 0; return; } } else still = 0;
      raf = requestAnimationFrame(tick);
    };
    const wake = () => { still = 0; if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };

    const tug = () => { // click / keyboard: yank the bob down, then toggle
      const end = pts[N - 1]; end.py = end.y - 22;
      for (let i = N - 6; i < N - 1; i++) pts[i].py = pts[i].y - 10;
      toggleTheme(); wake();
    };

    cord.addEventListener('pointerdown', (e) => {
      const end = pts[N - 1];
      drag = { id: e.pointerId, ox: e.clientX - end.x, oy: e.clientY - end.y, sx: e.clientX, sy: e.clientY, tx: end.x, ty: end.y, moved: false, maxStretch: 0 };
      cord.setPointerCapture(e.pointerId);
      cord.classList.add('is-dragging');
      wake();
    });
    cord.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.tx = e.clientX - drag.ox; drag.ty = e.clientY - drag.oy;
      drag.maxStretch = Math.max(drag.maxStretch, pullAmount(drag.tx, drag.ty));
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 5) drag.moved = true;
    });
    const release = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { moved, maxStretch } = drag;
      drag = null; cord.classList.remove('is-dragging');
      if (!moved) tug();
      else if (maxStretch >= PULL) toggleTheme();
      wake();
    };
    cord.addEventListener('pointerup', release);
    cord.addEventListener('pointercancel', (e) => { if (drag && e.pointerId === drag.id) { drag = null; cord.classList.remove('is-dragging'); wake(); } });
    cord.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tug(); }
    });

    // mouse brushing through the rope
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || drag) return;
      const near = e.clientY < total + 120 && Math.abs(e.clientX - anchor.x) < total + 60;
      mouse = near ? { x: e.clientX, y: e.clientY } : null;
      if (near) wake();
    }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) mouse = null; });

    layout(); draw(); cord.classList.add('is-ready');
    // small settle swing on load so it looks alive
    if (!reduceMotion) { pts[N - 1].px -= 6; wake(); }
    window.addEventListener('resize', () => { layout(); wake(); });
  }

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  const closeNav = () => { links.classList.remove('is-open'); root.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    root.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* ---------- Header border on scroll ---------- */
  const nav = document.querySelector('.nav');
  const navBorder = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', navBorder, { passive: true });
  navBorder();

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* ---------- Active nav link ---------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navMap = new Map([...links.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && navMap.has(en.target.id)) {
        navMap.forEach(a => a.classList.remove('is-active'));
        navMap.get(en.target.id).classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Visitor's local time + date + location ----------
     Time uses the visitor's own timezone. Location: first a guess from the
     timezone name (instant, offline), then city/country/coords from an IP
     lookup (get.geojs.io, no key, no permission prompt). Cached per session.
     Fills .js-time .js-date .js-tz .js-loc .js-city .js-coords */
  let tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  let timeFmt, dateFmt, tzFmt;
  const makeFmts = () => {
    try {
      timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
      dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
      tzFmt = new Intl.DateTimeFormat('en-IN', { timeZoneName: 'short', timeZone: tz });
    } catch (e) { tz = 'UTC'; makeFmts(); }
  };
  makeFmts();
  const setAll = (sel, txt) => document.querySelectorAll(sel).forEach(el => { el.textContent = txt; });
  const tick = () => {
    const now = new Date();
    setAll('.js-time', timeFmt.format(now).replace(' ', '').toLowerCase());
    setAll('.js-date', dateFmt.format(now).replace(/ (\d{4})$/, ', $1'));
    const z = tzFmt.formatToParts(now).find(p => p.type === 'timeZoneName');
    setAll('.js-tz', z ? z.value : tz);
  };
  tick(); setInterval(tick, 30000);
  document.getElementById('year').textContent = new Date().getFullYear();

  const showLoc = ({ city, cc, lat, lon }) => {
    setAll('.js-city', city || 'your city');
    setAll('.js-loc', [city, cc].filter(Boolean).join(', ') || 'your city');
    if (lat != null && lon != null) {
      const f = (v, p, n) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? p : n}`;
      setAll('.js-coords', `${f(+lat, 'N', 'S')} · ${f(+lon, 'E', 'W')}`);
    }
    document.querySelectorAll('[data-loc-label]').forEach(el => {
      el.setAttribute('aria-label', `Your local time${city ? ' in ' + city : ''}`);
    });
  };
  // Instant guess from timezone name, e.g. "America/New_York" -> "New York"
  // (browser language is NOT a location — en-US phones in India would show "US")
  const TZ_ALIAS = { Calcutta: 'Kolkata', Saigon: 'Ho Chi Minh', Katmandu: 'Kathmandu', Rangoon: 'Yangon', Kiev: 'Kyiv' };
  const tzCity = (tz.split('/').pop() || '').replace(/_/g, ' ');
  showLoc({ city: TZ_ALIAS[tzCity] || tzCity, cc: '' });

  const applyGeo = g => {
    if (!g) return;
    if (g.timezone && g.timezone !== tz) { tz = g.timezone; makeFmts(); tick(); }
    showLoc({ city: g.city || g.region, cc: g.country_code, lat: g.latitude, lon: g.longitude });
  };
  let cached = null;
  try { cached = JSON.parse(sessionStorage.getItem('nr-geo')); } catch (e) {}
  if (cached) applyGeo(cached);
  else if ('fetch' in window) {
    fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(g => {
        if (!g) return;
        const keep = { city: g.city, region: g.region, country_code: g.country_code, latitude: g.latitude, longitude: g.longitude, timezone: g.timezone };
        try { sessionStorage.setItem('nr-geo', JSON.stringify(keep)); } catch (e) {}
        applyGeo(keep);
      })
      .catch(() => {});
  }

  /* ---------- Story timeline ---------- */
  const timeline = document.getElementById('timeline');
  if (timeline) {
    const items = [...timeline.querySelectorAll('.tl')];
    const odo = document.getElementById('odo');
    const periodEl = document.getElementById('storyPeriod');
    const idxEl = document.getElementById('storyIdx');
    const barEl = document.getElementById('storyBar');
    const story = document.getElementById('story');
    const dial = document.getElementById('dial');
    const glowA = story.querySelector('.glow--a');
    const glowB = story.querySelector('.glow--b');
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('storyTotal').textContent = pad(items.length);

    // Odometer: one 0–9 strip per digit
    const firstYear = items[0].dataset.year;
    const strips = [...firstYear].map(() => {
      const col = document.createElement('span');
      col.className = 'odo__col';
      const strip = document.createElement('span');
      strip.className = 'odo__strip';
      strip.setAttribute('aria-hidden', 'true');
      for (let d = 0; d <= 9; d++) { const s = document.createElement('span'); s.textContent = d; strip.appendChild(s); }
      col.appendChild(strip); odo.appendChild(col);
      return strip;
    });
    const setYear = (year) => {
      odo.setAttribute('aria-label', year);
      [...year].forEach((ch, i) => {
        strips[i].style.transitionDelay = `${(strips.length - 1 - i) * 70}ms`;
        strips[i].style.transform = `translateY(${-Number(ch)}em)`;
      });
    };

    // Rail: fill + dot
    const fill = document.createElement('span'); fill.className = 'timeline__fill';
    const dot = document.createElement('span'); dot.className = 'timeline__dot';
    timeline.append(fill, dot);

    // Dial: three rings of ticks (decorative)
    if (dial) {
      const ns = 'http://www.w3.org/2000/svg';
      const rings = [[290, 48, 16, 1.4], [210, 72, 7, 1], [140, 96, 5, .8]];
      rings.forEach(([r, n, len, w]) => {
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2;
          const l = document.createElementNS(ns, 'line');
          const long = k % 4 === 0 ? len * 1.6 : len;
          l.setAttribute('x1', (Math.cos(a) * r).toFixed(1));
          l.setAttribute('y1', (Math.sin(a) * r).toFixed(1));
          l.setAttribute('x2', (Math.cos(a) * (r - long)).toFixed(1));
          l.setAttribute('y2', (Math.sin(a) * (r - long)).toFixed(1));
          l.setAttribute('stroke', 'currentColor');
          l.setAttribute('stroke-width', w);
          dial.appendChild(l);
        }
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('r', r - len - 14); c.setAttribute('fill', 'none');
        c.setAttribute('stroke', 'currentColor'); c.setAttribute('stroke-width', '.6');
        dial.appendChild(c);
      });
    }

    let active = -1;
    const activate = (i) => {
      if (i === active) return;
      active = i;
      const el = items[i];
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
      setYear(el.dataset.year);
      periodEl.textContent = el.dataset.period;
      idxEl.textContent = pad(i + 1);
      barEl.style.width = `${((i + 1) / items.length) * 100}%`;
      // .tl is static, so the heading's offsetParent is the timeline itself
      const y = el.querySelector('.h-md').offsetTop + 10;
      dot.style.top = `${y}px`;
      fill.style.height = `${y}px`;
      const [a, b] = (el.dataset.glow || '').split(',');
      if (a) glowA.style.backgroundColor = a;
      if (b) glowB.style.backgroundColor = b;
    };

    // Pick the item closest to the viewport centre
    const update = () => {
      const mid = window.innerHeight / 2;
      let best = 0, bestDist = Infinity;
      items.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      activate(best);
      if (dial && !reduceMotion) {
        const r = story.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
        dial.style.transform = `rotate(${p * 120}deg)`;
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { active = -1; update(); });
    onScroll(); update();
  }

  /* ---------- Hero: flip notepad cycles through roles ---------- */
  const flip = document.getElementById('flip');
  if (flip) {
    const words = flip.dataset.words.split('|');
    const front = flip.querySelector('.flip__page--front .flip__word');
    const next = flip.querySelector('.flip__page--next .flip__word');
    const countEl = flip.querySelector('.flip__count b');
    const rings = flip.querySelector('.flip__rings');
    for (let k = 0; k < 13; k++) rings.appendChild(document.createElement('i'));
    flip.querySelector('.flip__count').lastChild.textContent = ` / ${String(words.length).padStart(2, '0')}`;
    let idx = 0, onScreen = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; }).observe(flip);
    const turn = () => {
      if (document.hidden || !onScreen) return;
      const n = (idx + 1) % words.length;
      next.textContent = words[n];
      flip.classList.add('is-flipping');
      setTimeout(() => {
        idx = n;
        front.textContent = words[idx];
        countEl.textContent = String(idx + 1).padStart(2, '0');
        flip.classList.remove('is-flipping');
      }, reduceMotion ? 250 : 650);
    };
    setInterval(turn, 2600);
  }

  /* ---------- Hero: colour spotlight on the B&W portrait ---------- */
  const portrait = document.getElementById('portrait');
  if (portrait) {
    const cur = { x: 0, y: 0, r: 0 }, tgt = { x: 0, y: 0, r: 0 };
    let raf = 0, last = 0;
    const paint = () => {
      portrait.style.setProperty('--mx', `${cur.x}px`);
      portrait.style.setProperty('--my', `${cur.y}px`);
      portrait.style.setProperty('--r', `${cur.r}px`);
    };
    const loop = (now) => {
      // frame-rate independent easing (same speed at 30, 60 or 120 fps)
      const f = Math.min(30, (now - (last || now - 16.7)) / 16.7); last = now;
      const k = reduceMotion ? 1 : 1 - Math.pow(1 - 0.16, f);
      const kr = reduceMotion ? 1 : 1 - Math.pow(1 - 0.1, f);
      cur.x += (tgt.x - cur.x) * k; cur.y += (tgt.y - cur.y) * k; cur.r += (tgt.r - cur.r) * kr;
      paint();
      const settled = Math.abs(tgt.x - cur.x) < .5 && Math.abs(tgt.y - cur.y) < .5 && Math.abs(tgt.r - cur.r) < .5;
      raf = settled ? 0 : requestAnimationFrame(loop);
      if (!raf) last = 0;
    };
    const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
    const at = (e) => { const b = portrait.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top, w: b.width }; };
    portrait.addEventListener('pointerenter', (e) => {
      const p = at(e);
      if (cur.r < 1) { cur.x = p.x; cur.y = p.y; } // start the spot where the cursor enters
      tgt.x = p.x; tgt.y = p.y; tgt.r = Math.max(120, p.w * .42); kick();
    });
    portrait.addEventListener('pointermove', (e) => { const p = at(e); tgt.x = p.x; tgt.y = p.y; tgt.r = Math.max(120, p.w * .42); kick(); });
    const out = () => { tgt.r = 0; kick(); };
    portrait.addEventListener('pointerleave', out);
    portrait.addEventListener('pointercancel', out);
    portrait.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') setTimeout(out, 900); }); // touch: tap shows colour briefly
  }

  /* ---------- Hero: ability card pill ---------- */
  // Pill opens the vault: loader → 3D trading card (hover tilt, drag rotate, double-click flip)
  const abilityBtn = document.getElementById('abilityBtn');
  const vault = document.getElementById('vault');
  if (abilityBtn && vault) {
    const pctEl = document.getElementById('vaultPct');
    const card = document.getElementById('tcard');
    const inner = document.getElementById('tcardInner');
    const behind = () => [document.getElementById('main'), document.querySelector('footer'), document.querySelector('.nav'), document.getElementById('cord')].filter(Boolean);
    let open = false, timers = [], cardRaf = 0;

    // ---- card motion: rotY = drag/flip angle, tilt = hover lean (all eased in one rAF loop)
    const st = { rot: 0, rotT: 0, tx: 0, ty: 0, txT: 0, tyT: 0, vel: 0, drag: false, lastX: 0, hx: 50, hxT: 50 };
    let cardLast = 0;
    const cardLoop = (now) => {
      // frame-rate independent: same feel at 30, 60 or 120 fps
      const f = Math.min(30, cardLast ? (now - cardLast) / 16.7 : 1); cardLast = now;
      if (!st.drag) { st.rotT += st.vel * Math.min(f, 4); st.vel *= Math.pow(0.92, f); if (Math.abs(st.vel) < 0.02) st.vel = 0; }
      const e = reduceMotion ? 1 : 1 - Math.pow(0.88, f);
      st.rot += (st.rotT - st.rot) * (st.drag ? 1 - Math.pow(0.5, f) : e);
      st.tx += (st.txT - st.tx) * e; st.ty += (st.tyT - st.ty) * e; st.hx += (st.hxT - st.hx) * e;
      inner.style.transform = `rotateX(${st.tx.toFixed(2)}deg) rotateY(${(st.rot + st.ty).toFixed(2)}deg)`;
      vault.style.setProperty('--hx', `${st.hx.toFixed(1)}%`);
      spot.x += (spot.xT - spot.x) * e * 0.5; spot.y += (spot.yT - spot.y) * e * 0.5;
      vault.style.setProperty('--mx', `${spot.x.toFixed(1)}%`); vault.style.setProperty('--my', `${spot.y.toFixed(1)}%`);
      cardRaf = open ? requestAnimationFrame(cardLoop) : 0;
    };
    const lean = (e) => {
      if (st.drag) return;
      const b = card.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      const py = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
      st.tyT = (px - .5) * 24; st.txT = -(py - .5) * 18; st.hxT = 100 - px * 100;
    };
    const rest = () => { st.txT = 0; st.tyT = 0; st.hxT = 50; };
    card.addEventListener('pointermove', lean);
    card.addEventListener('pointerleave', rest);
    card.addEventListener('pointerdown', (e) => { st.drag = true; st.vel = 0; st.lastX = e.clientX; card.setPointerCapture(e.pointerId); rest(); });
    card.addEventListener('pointermove', (e) => {
      if (!st.drag) return;
      const dx = e.clientX - st.lastX; st.lastX = e.clientX;
      st.rotT += dx * 0.6; st.vel = dx * 0.6;
    });
    const endDrag = () => { if (!st.drag) return; st.drag = false; };
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    const flipCard = () => { st.vel = 0; st.rotT = Math.round(st.rotT / 180) * 180 + 180; };
    card.addEventListener('dblclick', flipCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); }
      if (e.key === 'ArrowLeft') st.rotT -= 30;
      if (e.key === 'ArrowRight') st.rotT += 30;
    });

    // ---- studio spotlight follows the cursor (mouse only; eased in cardLoop)
    const spot = { x: 50, y: 45, xT: 50, yT: 45 };
    vault.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduceMotion) return;
      spot.xT = (e.clientX / innerWidth) * 100; spot.yT = (e.clientY / innerHeight) * 100;
    });

    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const openVault = () => {
      if (open) return;
      open = true;
      Object.assign(st, { rot: 0, rotT: 0, tx: 0, ty: 0, txT: 0, tyT: 0, vel: 0, drag: false, hx: 50, hxT: 50 });
      vault.hidden = false; vault.classList.remove('is-ready');
      document.body.classList.add('room-open');
      behind().forEach(el => { el.inert = true; });
      requestAnimationFrame(() => vault.classList.add('is-open'));
      document.getElementById('vaultClose').focus({ preventScroll: true });
      // loader 0 → 100
      const t0 = performance.now(), dur = reduceMotion ? 300 : 1300;
      const count = (now) => {
        if (!open) return;
        const k = Math.min(1, (now - t0) / dur);
        pctEl.textContent = Math.round((1 - Math.pow(1 - k, 2)) * 100);
        if (k < 1) requestAnimationFrame(count);
        else later(() => { vault.classList.add('is-ready'); card.focus({ preventScroll: true }); }, 200);
      };
      requestAnimationFrame(count);
      vault.scrollTop = 0;
      cardLast = 0; cardRaf = requestAnimationFrame(cardLoop);
    };
    const closeVault = () => {
      if (!open) return;
      open = false;
      timers.forEach(clearTimeout); timers = [];
      cancelAnimationFrame(cardRaf);
      vault.classList.remove('is-open');
      document.body.classList.toggle('room-open', !!currentRoom);
      behind().forEach(el => { el.inert = false; });
      setTimeout(() => { if (!open) { vault.hidden = true; vault.classList.remove('is-ready'); pctEl.textContent = '0'; } }, reduceMotion ? 0 : 450);
      abilityBtn.focus({ preventScroll: true });
    };
    abilityBtn.addEventListener('click', openVault);
    document.getElementById('vaultClose').addEventListener('click', closeVault);
    vault.addEventListener('click', (e) => {
      if (e.target === vault || e.target.id === 'vaultStage') closeVault();
      if (e.target.closest('[data-vault-close]')) closeVault(); // "Get in touch" → close, then follow #contact
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { e.stopImmediatePropagation(); closeVault(); } }, true);
    // keep Tab inside the dialog: close, card, panel links
    vault.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [document.getElementById('vaultClose'), card, ...vault.querySelectorAll('.vault__panel a')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
    });
  }

  /* ---------- Work: hall of doors → rooms (#/games, #/web, #/apps) ---------- */
  const hall = document.getElementById('hall');
  const flash = document.getElementById('flash');
  const rooms = new Map([...document.querySelectorAll('.room')].map(r => [r.id.replace('room-', ''), r]));
  const setNavH = () => root.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
  setNavH(); window.addEventListener('resize', setNavH);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let currentRoom = null, busy = false;

  if (hall) {
    const doors = [...hall.querySelectorAll('.door')];
    const panels = [...hall.querySelectorAll('.hall__panel')];
    const peek = (door) => {
      hall.classList.toggle('is-peek', !!door);
      doors.forEach(d => d.classList.toggle('is-active', d === door));
      panels.forEach(p => p.classList.toggle('is-on', !!door && p.dataset.for === door.dataset.room));
    };
    doors.forEach(d => {
      d.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !busy) peek(d); });
      d.addEventListener('focus', () => { if (!busy && d.matches(':focus-visible')) peek(d); });
      d.addEventListener('blur', () => { if (!busy) peek(null); });
      d.addEventListener('click', e => { e.preventDefault(); enterRoom(d); });
    });
    hall.querySelector('.hall__doors').addEventListener('pointerleave', () => { if (!busy) peek(null); });
    hall.addEventListener('pointermove', e => {
      const r = hall.getBoundingClientRect();
      hall.style.setProperty('--cx', `${e.clientX - r.left + 14}px`);
      hall.style.setProperty('--cy', `${e.clientY - r.top + 14}px`);
    });

    // Door swings open → camera pushes into the light → room
    async function enterRoom(door) {
      if (busy) return;
      busy = true;
      const id = door.dataset.room;
      if (!reduceMotion) {
        peek(door);
        door.classList.add('is-open');
        await wait(450);
        const strip = hall.querySelector('.hall__doors');
        const fr = door.querySelector('.door__frame').getBoundingClientRect();
        const sr = strip.getBoundingClientRect();
        strip.style.transformOrigin = `${fr.left + fr.width / 2 - sr.left}px ${fr.top + fr.height * .55 - sr.top}px`;
        strip.style.transform = 'scale(5)';
        flash.classList.add('is-on');
        await wait(650);
      }
      history.pushState({ fromHall: true }, '', `#/${id}`);
      route();
      await wait(60);
      strip_reset(door);
      flash.classList.remove('is-on');
      busy = false;
    }
    function strip_reset(door) {
      const strip = hall.querySelector('.hall__doors');
      strip.style.transition = 'none';
      strip.style.transform = '';
      door.classList.remove('is-open');
      peek(null);
      requestAnimationFrame(() => { strip.style.transition = ''; });
    }
  }

  // Stacked cards: the card underneath shrinks a little as the next one slides over it
  const stackScroll = (room) => {
    const cards = [...room.querySelectorAll('.shot')];
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) { c.style.setProperty('--p', 0); return; }
      const top = parseFloat(getComputedStyle(next).top) || 0;
      const d = next.getBoundingClientRect().top - top;
      c.style.setProperty('--p', Math.min(1, Math.max(0, 1 - d / c.offsetHeight)).toFixed(3));
    });
  };

  const openRoom = (id) => {
    const room = rooms.get(id);
    if (!room || currentRoom === room) return;
    if (currentRoom) closeRoom(true);
    currentRoom = room;
    room.hidden = false;
    document.body.classList.add('room-open');
    setBackgroundInert(true);
    const sc = room.querySelector('.room__scroll');
    sc.scrollTop = 0;
    if (!sc.dataset.bound) {
      sc.dataset.bound = '1';
      sc.addEventListener('scroll', () => requestAnimationFrame(() => stackScroll(room)), { passive: true });
    }
    requestAnimationFrame(() => { room.classList.add('is-open'); stackScroll(room); });
    room.querySelector('.room__head .display').focus({ preventScroll: true });
  };
  // While a room is open, the page behind it can't be tabbed into or read out
  const background = [document.getElementById('main'), document.querySelector('footer')].filter(Boolean);
  const setBackgroundInert = (on) => background.forEach(el => { el.inert = on; });

  const closeRoom = (instant, refocus) => {
    const room = currentRoom;
    if (!room) return;
    currentRoom = null;
    room.classList.remove('is-open');
    document.body.classList.remove('room-open');
    setBackgroundInert(false);
    const done = () => { if (room !== currentRoom) room.hidden = true; };
    if (instant || reduceMotion) done(); else setTimeout(done, 500);
    if (refocus) hall?.querySelector(`.door[data-room="${room.id.replace('room-', '')}"]`)?.focus({ preventScroll: true });
  };
  const route = () => {
    const m = location.hash.match(/^#\/(games|web|apps)$/);
    if (m) openRoom(m[1]);
    else closeRoom(false, !location.hash || location.hash === '#work'); // back to the hall → focus its door
  };
  const leaveRoom = () => {
    if (history.state?.fromHall) history.back();
    else { history.replaceState(null, '', '#work'); route(); document.getElementById('work')?.scrollIntoView(); }
  };
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', leaveRoom));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && currentRoom) leaveRoom(); });
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  route();

  /* ---------- Contact form → FormSubmit.co → Nikhil's inbox ---------- */
  // Static site, no backend: FormSubmit relays the message by email.
  // First ever submission sends an activation email to the inbox — click it once.
  const MAIL_TO = 'nikhilrana21422@gmail.com';           // shown to visitors only as fallback
  const FORM_ID = '0c88452e7d7fb71cfdfb4317eb335a7b';     // FormSubmit alias for MAIL_TO (keeps address out of the request URL)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const sendBtn = form.querySelector('button[type="submit"]');
  let sending = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) {
      status.textContent = 'Please fill in your name, a valid email and a message.';
      status.className = 'form__status is-err';
      return;
    }
    const { name, email, message, _honey } = Object.fromEntries(new FormData(form));
    if (_honey) return; // bot filled the hidden trap field
    sending = true;
    sendBtn.disabled = true;
    const label = sendBtn.textContent;
    sendBtn.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'form__status';
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, email, message,
          _replyto: email,
          // sender is always FormSubmit (no service may send "as" the visitor's Gmail);
          // subject shows who wrote, and Reply goes to the visitor via _replyto
          _subject: `${name} (${email}) — Portfolio message`,
          _template: 'basic', // plain, simple email
          _captcha: 'false'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (/activat/i.test(data.message || '')) {
        // FormSubmit not activated yet for this site — owner must click the link in the activation email
        console.warn('FormSubmit:', data.message);
        throw new Error('needs-activation');
      }
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || `HTTP ${res.status}`);
      status.textContent = 'Message sent — thanks! I\'ll reply to your email soon.';
      status.className = 'form__status is-ok';
      form.reset();
    } catch (err) {
      console.warn('Contact form failed:', err);
      status.innerHTML = '';
      status.append('Could not send right now. Please email me directly at ');
      const a = document.createElement('a');
      a.href = `mailto:${MAIL_TO}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(message)}`;
      a.textContent = MAIL_TO;
      status.append(a, '.');
      status.className = 'form__status is-err';
    } finally {
      sending = false;
      sendBtn.disabled = false;
      sendBtn.textContent = label;
    }
  });
})();
