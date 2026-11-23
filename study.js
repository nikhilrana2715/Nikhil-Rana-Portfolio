// Nikhil Rana Portfolio — Study reader (v5.8)
// study.html?c=mca&s=1&sub=os → notes file in a frame + Bar / Study (back, units, prev/next, syllabus, full tab).
(() => {
  const $ = (id) => document.getElementById(id);
  const q = new URLSearchParams(location.search);
  const { c, s, sub } = window.findSubject(q.get('c'), q.get('s'), q.get('sub'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!sub || !sub.notes) {
    $('loading').hidden = true;
    $('empty').hidden = false;
    $('unitWrap').hidden = true;
    ['prevSub', 'nextSub', 'fullLink'].forEach((id) => { $(id).hidden = true; });
    if (c) $('backLink').href = `courses.html#${c.id}${s ? `-sem-${s.n}` : ''}`;
    return;
  }

  /* ---------- Bar / Study ---------- */
  const semHref = `courses.html#${c.id}-sem-${s.n}`;
  document.title = `${sub.short || sub.name} — Study notes · Nikhil Rana`;
  $('crumb').textContent = `${c.short} · Semester ${s.n} · ${sub.code}`;
  $('subName').textContent = sub.short || sub.name;
  $('subName').title = sub.name;
  $('backLink').href = semHref;
  $('backLink').setAttribute('aria-label', `Back to ${c.short} Semester ${s.n}`);
  $('fullLink').href = sub.notes;
  if (c.syllabus) {
    $('sylLink').href = `${c.syllabus}${sub.page ? `#page=${sub.page}` : ''}`;
    $('sylLink').hidden = false;
  }
  if (sub.practice) {
    $('practiceLink').href = sub.practice;
    $('practiceLink').hidden = false;
  }

  // prev / next = other subjects in this semester that have notes
  const list = s.subjects.filter((x) => x.notes);
  const i = list.indexOf(sub);
  const pager = (el, x, label) => {
    if (!x) { el.setAttribute('aria-disabled', 'true'); el.removeAttribute('href'); el.classList.add('is-off'); return; }
    el.href = `study.html?c=${c.id}&s=${s.n}&sub=${x.id}`;
    el.setAttribute('aria-label', `${label}: ${x.short || x.name}`);
    el.title = `${label}: ${x.short || x.name}`;
  };
  pager($('prevSub'), list[i - 1], 'Previous subject');
  pager($('nextSub'), list[i + 1], 'Next subject');

  /* ---------- Reader ---------- */
  const frame = $('frame');
  const key = `nr-study:${c.id}/${s.n}/${sub.id}`;
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  $('loadingTitle').textContent = `Opening ${sub.short || sub.name}…`;
  frame.title = `${sub.name} — study notes`;

  frame.addEventListener('load', () => {
    $('loading').hidden = true;
    frame.hidden = false;
    let doc, win;
    try { doc = frame.contentDocument; win = frame.contentWindow; } catch { doc = null; }
    if (!doc) return; // cross-origin (file opened some other way): notes still readable, tools off

    // the element that actually scrolls (page itself, or an inner panel)
    const pageScroller = doc.scrollingElement || doc.documentElement;
    const findScroller = () => {
      if (pageScroller.scrollHeight > pageScroller.clientHeight + 40) return pageScroller;
      let best = null;
      doc.querySelectorAll('main, article, section, div').forEach((el) => {
        const cs = win.getComputedStyle(el);
        if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 40 && (!best || el.clientHeight > best.clientHeight)) best = el;
      });
      return best || pageScroller;
    };
    const sc = findScroller();
    const scrollTarget = sc === pageScroller ? win : sc;
    const top = () => sc.scrollTop;
    const max = () => Math.max(1, sc.scrollHeight - sc.clientHeight);
    const go = (y) => sc.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });

    // units = the notes' own section headings
    const heads = [...doc.querySelectorAll('h2')].filter((h) => h.textContent.trim());
    const sel = $('unitSelect');
    if (heads.length) {
      let u = 0;
      sel.innerHTML = '<option value="-1">Jump to…</option>' + heads.map((h, n) => {
        const t = h.textContent.replace(/\s+/g, ' ').replace(/^[^\p{L}\p{N}]+/u, '').trim();
        const isUnit = !/syllabus/i.test(t);
        const label = isUnit ? `Unit ${++u} · ${t}` : t;
        return `<option value="${n}">${label.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))}</option>`;
      }).join('');
      $('unitWrap').hidden = false;
      sel.addEventListener('change', () => {
        const h = heads[+sel.value];
        if (!h) return;
        const y = h.getBoundingClientRect().top - (sc === pageScroller ? 0 : sc.getBoundingClientRect().top) + top() - 72;
        go(Math.max(0, y));
        frame.focus();
      });
    }

    // progress bar + current unit + remember position
    let saveT = 0;
    const onScroll = (e) => {
      $('readBar').style.transform = `scaleX(${Math.min(1, top() / max())})`;
      if (heads.length) {
        const off = sc === pageScroller ? 0 : sc.getBoundingClientRect().top;
        let cur = -1;
        heads.forEach((h, n) => { if (h.getBoundingClientRect().top - off < 140) cur = n; });
        if (+sel.value !== cur && doc.activeElement !== sel) sel.value = String(cur);
      }
      if (!e) return; // first paint only — don't overwrite the saved spot
      clearTimeout(saveT);
      saveT = setTimeout(() => store.set({ y: top(), r: top() / max(), t: Date.now() }), 400);
    };
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // offer to resume
    const saved = store.get();
    if (saved && saved.y > 400) {
      const box = $('resume');
      box.hidden = false;
      const close = () => { box.hidden = true; };
      $('resumeYes').onclick = () => { go(Math.min(saved.y, max())); close(); frame.focus(); };
      $('resumeNo').onclick = () => { close(); frame.focus(); };
      setTimeout(close, 9000);
    }
  }, { once: true });

  frame.src = sub.notes;
})();
