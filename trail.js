/* Footer / Pixel trail (v6.3)
   A paper plane follows the cursor across a band of faint pixel cells and leaves
   a fading trail of coloured cells. No cursor (touch, or mouse elsewhere) → the
   plane flies a slow loop on autopilot. Pauses off-screen / in background tabs.
   Reduced motion → static grid with a short painted trail, plane parked.
   Tunables: PITCH (cell + gap), GAP, LIFE (ms a cell glows), EASE (follow speed). */
(() => {
  const band = document.getElementById('trail');
  if (!band) return;
  const cv = band.querySelector('canvas');
  const plane = band.querySelector('.trail__plane');
  const ctx = cv.getContext('2d');
  const zone = band.closest('.cta') || band;   // cursor anywhere on the dark footer steers

  const PITCH = 18, GAP = 4, SIZE = PITCH - GAP;
  const LIFE = 1600, EASE = 3.2, PLANE = 44;

  const root = getComputedStyle(document.documentElement);
  const COLORS = ['rust', 'brass', 'sage', 'blue', 'plum']
    .map(n => root.getPropertyValue(`--trail-${n}`).trim()).filter(Boolean);
  const CELL = root.getPropertyValue('--trail-cell').trim() || 'rgba(237,231,225,.05)';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, cols = 0, rows = 0, ox = 0, oy = 0;
  let life, hue, shade;            // per cell: glow 0..1, colour index, background tint
  const pos = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  let angle = 0, flip = 1, steering = false, lastCell = -1, t0 = performance.now();

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = band.clientWidth; H = band.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(1, Math.floor((W + GAP) / PITCH));
    rows = Math.max(1, Math.floor((H + GAP) / PITCH));
    ox = (W - (cols * PITCH - GAP)) / 2; oy = (H - (rows * PITCH - GAP)) / 2;
    life = new Float32Array(cols * rows);
    hue = new Uint8Array(cols * rows);
    // background cells: random faint tint, fading out towards both ends like a ribbon
    shade = new Float32Array(cols * rows).map((_, i) => {
      const c = i % cols, edge = Math.min(c, cols - 1 - c) / Math.max(1, cols * 0.18);
      return Math.random() < 0.55 ? (0.35 + Math.random() * 0.65) * Math.min(1, edge) : 0;
    });
    if (!pos.x) { pos.x = W * 0.2; pos.y = H / 2; }
  };

  const paint = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return;
    const i = r * cols + c;
    life[i] = 1; hue[i] = (Math.random() * COLORS.length) | 0;
  };
  // Plane entered a new cell → light it plus a ragged band above / below (chunky ribbon)
  const stamp = (x, y) => {
    const c = Math.floor((x - ox) / PITCH), r = Math.floor((y - oy) / PITCH);
    const id = r * cols + c;
    if (id === lastCell) return;
    lastCell = id;
    paint(c, r);
    if (Math.random() < 0.6) paint(c, r - 1);
    if (Math.random() < 0.6) paint(c, r + 1);
    if (Math.random() < 0.25) paint(c, r - 2);
    if (Math.random() < 0.25) paint(c, r + 2);
    if (Math.random() < 0.3) paint(c - 1, r + (Math.random() < 0.5 ? -1 : 1));
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c, x = ox + c * PITCH, y = oy + r * PITCH;
        if (shade[i]) { ctx.globalAlpha = shade[i]; ctx.fillStyle = CELL; ctx.fillRect(x, y, SIZE, SIZE); }
        if (life[i] > 0) {
          ctx.globalAlpha = Math.pow(life[i], 0.7);
          ctx.fillStyle = COLORS[hue[i]];
          ctx.fillRect(x, y, SIZE, SIZE);
        }
      }
    }
    ctx.globalAlpha = 1;
  };

  const placePlane = (bob = 0) => {
    plane.style.transform =
      `translate(${pos.x - PLANE / 2}px, ${pos.y - PLANE / 2 + bob}px) rotate(${angle}rad) scaleY(${flip})`;
  };

  // Steering: pointer over the footer → target; leave → autopilot
  const aim = e => {
    const b = band.getBoundingClientRect();
    target.x = Math.min(W - PLANE / 2, Math.max(PLANE / 2, e.clientX - b.left));
    target.y = Math.min(H - 10, Math.max(10, e.clientY - b.top));
    steering = true;
  };
  zone.addEventListener('pointermove', aim, { passive: true });
  zone.addEventListener('pointerdown', aim, { passive: true });
  zone.addEventListener('pointerleave', () => { steering = false; });

  let raf = 0, last = 0, visible = false;
  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (!steering) {                                   // lazy figure-eight across the band
      const t = (now - t0) / 1000;
      target.x = W / 2 + (W / 2 - PLANE) * Math.sin(t * 0.32);
      target.y = H / 2 + (H / 2 - 14) * Math.sin(t * 0.9);
    }
    const k = 1 - Math.exp(-dt * EASE);
    const dx = (target.x - pos.x) * k, dy = (target.y - pos.y) * k;
    pos.x += dx; pos.y += dy;
    const speed = Math.hypot(dx, dy) / dt;
    if (speed > 12) {
      const want = Math.atan2(dy, dx);
      flip = Math.cos(want) < 0 ? -1 : 1;
      let d = want - angle;
      d = Math.atan2(Math.sin(d), Math.cos(d));         // shortest turn
      angle += d * Math.min(1, dt * 10);
      stamp(pos.x - Math.cos(angle) * 12, pos.y - Math.sin(angle) * 12);   // trail starts at the tail
    }
    const decay = dt * 1000 / LIFE;
    for (let i = 0; i < life.length; i++) if (life[i] > 0) life[i] = Math.max(0, life[i] - decay);
    draw();
    placePlane(Math.sin(now / 260) * 1.5);
    raf = visible ? requestAnimationFrame(frame) : 0;
  };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  resize();
  if (reduced) {
    // static: a short painted wavy ribbon ending at the parked plane
    const still = () => {
      resize();
      const end = Math.min(cols, 16);
      for (let c = 2; c < end; c++) {
        const r = Math.round((rows - 1) / 2 + Math.sin(c / 2.2));
        paint(c, r); if (c % 2) paint(c, r + 1);
        life[r * cols + c] = 0.35 + (c / end) * 0.65;
      }
      pos.x = ox + end * PITCH; pos.y = H / 2; angle = 0; flip = 1;
      draw(); placePlane();
    };
    new ResizeObserver(still).observe(band);
    return;
  }

  new ResizeObserver(() => { resize(); draw(); }).observe(band);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(band);
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  placePlane();
})();

/* Margin / Pixel trail (v6.7)
   The empty side margins (outside the 1200px container) hide a pixel grid. Only while the
   cursor is IN a margin: the grid shows faintly around it and moving leaves a fading trail of
   coloured cells. Canvas is fixed behind all content (z-index −1), so any section with its own
   background (footer, hall…) simply covers it. Mouse screens with ≥ 48px margins only;
   off for reduced motion. Idle = nothing drawn, loop stopped. */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const PITCH = 18, GAP = 4, SIZE = PITCH - GAP;
  const LIFE = 1400;           // ms a trail cell glows
  const R = 110;               // px radius of the faint grid around the cursor
  const MIN_MARGIN = 48;       // narrower margins → effect off

  const cv = document.createElement('canvas');
  cv.className = 'margin-trail';
  cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ctx = cv.getContext('2d');

  let W = 0, H = 0, cols = 0, rows = 0, left = 0, right = 0, life = null, hue = null;
  let colors = [], cellColor = '';
  const mouse = { x: -1, y: -1, in: false };
  let glow = 0;                // 0…1 eased visibility of the grid spotlight
  let lastCell = -1, raf = 0, last = 0;

  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors = [1, 2, 3, 4, 5].map(i => s.getPropertyValue(`--margin-${i}`).trim()).filter(Boolean);
    cellColor = s.getPropertyValue('--margin-cell').trim();
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = document.documentElement.clientWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / PITCH); rows = Math.ceil(H / PITCH);
    life = new Float32Array(cols * rows); hue = new Uint8Array(cols * rows);
    const cw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--container')) || 1200;
    const m = (W - cw) / 2;
    left = m; right = W - m;
  };
  const inMargin = x => (left >= MIN_MARGIN) && (x < left - 6 || x > right + 6);
  const cellOk = c => { const x = c * PITCH; return x + SIZE < left - 4 || x > right + 4; };   // never paint over content column

  const paint = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows || !cellOk(c)) return;
    const i = r * cols + c; life[i] = 1; hue[i] = (Math.random() * colors.length) | 0;
  };
  const stamp = () => {
    const c = Math.floor(mouse.x / PITCH), r = Math.floor(mouse.y / PITCH), id = r * cols + c;
    if (id === lastCell) return;
    lastCell = id;
    paint(c, r);
    if (Math.random() < .5) paint(c, r - 1);
    if (Math.random() < .5) paint(c, r + 1);
    if (Math.random() < .35) paint(c - 1, r);
    if (Math.random() < .35) paint(c + 1, r);
    if (Math.random() < .2) paint(c + (Math.random() < .5 ? -1 : 1), r + (Math.random() < .5 ? -1 : 1));
  };

  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const blocked = document.body.classList.contains('room-open');
    glow += ((mouse.in && !blocked ? 1 : 0) - glow) * (1 - Math.exp(-dt * 8));
    const decay = dt * 1000 / LIFE;
    let alive = false;
    for (let i = 0; i < life.length; i++) if (life[i] > 0) { life[i] = Math.max(0, life[i] - decay); alive = alive || life[i] > 0; }

    ctx.clearRect(0, 0, W, H);
    // faint grid spotlight around the cursor
    if (glow > 0.01 && mouse.x >= 0) {
      ctx.fillStyle = cellColor;
      const c0 = Math.max(0, Math.floor((mouse.x - R) / PITCH)), c1 = Math.min(cols - 1, Math.floor((mouse.x + R) / PITCH));
      const r0 = Math.max(0, Math.floor((mouse.y - R) / PITCH)), r1 = Math.min(rows - 1, Math.floor((mouse.y + R) / PITCH));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
        if (!cellOk(c)) continue;
        const d = Math.hypot(c * PITCH + SIZE / 2 - mouse.x, r * PITCH + SIZE / 2 - mouse.y);
        if (d > R) continue;
        ctx.globalAlpha = glow * (1 - d / R);
        ctx.fillRect(c * PITCH, r * PITCH, SIZE, SIZE);
      }
    }
    // trail
    if (alive) for (let i = 0; i < life.length; i++) {
      if (!life[i]) continue;
      ctx.globalAlpha = Math.pow(life[i], .7) * .85;
      ctx.fillStyle = colors[hue[i]];
      ctx.fillRect((i % cols) * PITCH, ((i / cols) | 0) * PITCH, SIZE, SIZE);
    }
    ctx.globalAlpha = 1;
    raf = (alive || glow > 0.01 || mouse.in) ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX; mouse.y = e.clientY;
    const was = mouse.in;
    mouse.in = inMargin(e.clientX);
    if (mouse.in && !document.body.classList.contains('room-open')) stamp();
    if (mouse.in || was) kick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.in = false; kick(); });
  addEventListener('scroll', () => { lastCell = -1; }, { passive: true });   // cells are viewport-fixed
  addEventListener('resize', () => { resize(); kick(); });
  // theme toggle (pull cord) changes data-theme → re-read colours
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', readColors);

  readColors(); resize();
})();
