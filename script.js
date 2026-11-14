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

  /* ---------- Pull cord: drag down past threshold, or click / Enter ---------- */
  if (cord) {
    const MAX = 90, THRESHOLD = 42;
    let startY = 0, pulling = false, moved = false;
    cord.addEventListener('pointerdown', (e) => {
      pulling = true; moved = false; startY = e.clientY;
      cord.setPointerCapture(e.pointerId);
      cord.classList.add('is-dragging');
    });
    cord.addEventListener('pointermove', (e) => {
      if (!pulling) return;
      const d = Math.max(0, Math.min(MAX, e.clientY - startY));
      if (d > 4) moved = true;
      // rubber-band resistance
      cord.style.setProperty('--pull', `${d * (1 - d / (MAX * 2.2))}px`);
    });
    const release = (e) => {
      if (!pulling) return;
      pulling = false;
      const d = e.clientY - startY;
      cord.classList.remove('is-dragging');
      cord.style.setProperty('--pull', '0px');
      if (moved && d >= THRESHOLD) toggleTheme();
      else if (!moved) { // plain click: quick tug animation + toggle
        cord.style.setProperty('--pull', '28px');
        setTimeout(() => cord.style.setProperty('--pull', '0px'), 120);
        toggleTheme();
      }
    };
    cord.addEventListener('pointerup', release);
    cord.addEventListener('pointercancel', () => { pulling = false; cord.classList.remove('is-dragging'); cord.style.setProperty('--pull', '0px'); });
    cord.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
    });
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

  /* ---------- Local time + date (Ranchi, IST) ---------- */
  const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
  const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const tick = () => {
    const now = new Date();
    const t = timeFmt.format(now).replace(' ', '').toLowerCase();
    document.querySelectorAll('.js-time').forEach(el => { el.textContent = t; });
    document.querySelectorAll('.js-date').forEach(el => { el.textContent = dateFmt.format(now).replace(/ (\d{4})$/, ', $1'); });
  };
  tick(); setInterval(tick, 30000);
  document.getElementById('year').textContent = new Date().getFullYear();

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
    const canvas = document.getElementById('embers');
    const ctx = canvas.getContext('2d');
    const behind = () => [document.getElementById('main'), document.querySelector('footer'), document.querySelector('.nav'), document.getElementById('cord')].filter(Boolean);
    let open = false, timers = [], embersRaf = 0, cardRaf = 0;

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

    // ---- embers: warm sparks drifting up
    let parts = [];
    // one pre-rendered glow sprite, stamped per ember (shadowBlur per particle is far too slow)
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 32;
    { const g = sprite.getContext('2d'); const rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      rg.addColorStop(0, 'rgba(255,220,150,1)'); rg.addColorStop(.25, 'rgba(255,170,70,.9)'); rg.addColorStop(1, 'rgba(255,120,30,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 32, 32); }
    const sizeCanvas = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (anyY) => ({ x: Math.random() * innerWidth, y: anyY ? Math.random() * innerHeight : innerHeight + 10,
      r: Math.random() * 2.2 + .6, v: Math.random() * .5 + .15, sway: Math.random() * Math.PI * 2, a: Math.random() * .6 + .3 });
    let emLast = 0;
    const embers = (now) => {
      const f = Math.min(4, emLast ? (now - emLast) / 16.7 : 1); emLast = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.y -= p.v * f; p.sway += .02 * f; p.x += Math.sin(p.sway) * .3 * f;
        if (p.y < -10) Object.assign(p, spawn(false));
        const s = p.r * 6;
        ctx.globalAlpha = p.a;
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      embersRaf = open ? requestAnimationFrame(embers) : 0;
    };

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
      if (!reduceMotion) { sizeCanvas(); parts = Array.from({ length: 70 }, () => spawn(true)); emLast = 0; embersRaf = requestAnimationFrame(embers); }
      cardLast = 0; cardRaf = requestAnimationFrame(cardLoop);
    };
    const closeVault = () => {
      if (!open) return;
      open = false;
      timers.forEach(clearTimeout); timers = [];
      cancelAnimationFrame(embersRaf); cancelAnimationFrame(cardRaf);
      vault.classList.remove('is-open');
      document.body.classList.toggle('room-open', !!currentRoom);
      behind().forEach(el => { el.inert = false; });
      setTimeout(() => { if (!open) { vault.hidden = true; vault.classList.remove('is-ready'); pctEl.textContent = '0'; } }, reduceMotion ? 0 : 450);
      abilityBtn.focus({ preventScroll: true });
    };
    abilityBtn.addEventListener('click', openVault);
    document.getElementById('vaultClose').addEventListener('click', closeVault);
    vault.addEventListener('click', (e) => { if (e.target === vault) closeVault(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { e.stopImmediatePropagation(); closeVault(); } }, true);
    window.addEventListener('resize', () => { if (open && !reduceMotion) sizeCanvas(); });
    // keep Tab inside the dialog
    vault.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = [document.getElementById('vaultClose'), card];
      const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
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
          _subject: `Portfolio message from ${name}`,
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
