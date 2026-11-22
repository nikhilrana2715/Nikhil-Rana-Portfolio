// Nikhil Rana Portfolio — My courses page (v5.8). Data lives in courses-data.js.
(() => {
  const PROGRAMS = window.COURSES;
  const STATUS = window.COURSE_STATUS;
  const TYPE = window.COURSE_TYPE;
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- Mobile nav ---------- */
  const root = document.documentElement;
  const burger = $('burger');
  const links = $('navLinks');
  const closeNav = () => { links.classList.remove('is-open'); root.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    root.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  const nav = document.querySelector('.nav');
  const navBorder = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', navBorder, { passive: true });
  navBorder();

  /* ---------- Clock pill (visitor time; city from home page cache) ---------- */
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  let city = tz.split('/').pop().replace(/_/g, ' ').replace('Calcutta', 'Kolkata');
  try { const g = JSON.parse(sessionStorage.getItem('nr-geo')); if (g?.city) city = g.city; } catch { /* none */ }
  const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const tick = () => {
    const d = new Date();
    document.querySelectorAll('.js-time').forEach((el) => { el.textContent = timeFmt.format(d).replace(' ', '').toLowerCase(); });
    document.querySelectorAll('.js-date').forEach((el) => { el.textContent = dateFmt.format(d); });
    document.querySelectorAll('.js-city').forEach((el) => { el.textContent = city; });
  };
  tick(); setInterval(tick, 15000);
  $('year').textContent = new Date().getFullYear();

  /* ---------- Card / Program ---------- */
  const progressOf = (p) => {
    const total = p.semesters.length;
    const done = p.semesters.filter((s) => s.status === 'done').length;
    const now = p.semesters.find((s) => s.status === 'now');
    return { total, done, now, pct: Math.round(((done + (now ? 0.5 : 0)) / total) * 100) };
  };

  const programsEl = $('programs');
  programsEl.innerHTML = PROGRAMS.map((p) => {
    const pr = progressOf(p);
    const state = pr.done === pr.total ? 'done' : 'now';
    const where = pr.now ? `Semester ${pr.now.n} of ${pr.total}` : `${pr.total} semesters`;
    return `
      <a class="program program--${p.tone}" href="#${p.id}" data-program="${p.id}" role="listitem" aria-label="Open ${esc(p.short)} semesters">
        <span class="program__top">
          <span class="program__badge" aria-hidden="true">${esc(p.short)}</span>
          <span class="status status--${state}">${STATUS[state]}</span>
        </span>
        <span class="program__name">${esc(p.name)}</span>
        <span class="program__years mono">${esc(p.years)} · ${where}</span>
        <span class="program__bar" aria-hidden="true"><i style="--v:${pr.pct}"></i></span>
        <span class="program__cta">Open semesters <span aria-hidden="true">→</span></span>
      </a>`;
  }).join('');

  /* ---------- Card / Subject ---------- */
  const syllabusLink = (p, page, label = 'Syllabus') => p.syllabus
    ? `<a class="btn btn--link body-sm" href="${esc(p.syllabus)}${page ? `#page=${page}` : ''}" target="_blank" rel="noopener">${label} ↗</a>`
    : '';

  const subjectCard = (p, s, x) => {
    const meta = [x.credits ? `${x.credits} credit${x.credits > 1 ? 's' : ''}` : null, x.units?.length ? `${x.units.length} units` : null, x.info || null].filter(Boolean).join(' · ');
    const head = `
      <span class="subject__top">
        <span class="subject__code mono">${esc(x.code)}</span>
        <span class="subject__type">${TYPE[x.type] || ''}</span>
      </span>
      <span class="subject__name">${esc(x.name)}</span>
      ${meta ? `<span class="subject__meta muted body-sm">${esc(meta)}</span>` : ''}`;
    if (x.notes) {
      const units = x.units?.length
        ? `<ol class="subject__units" aria-label="Units">${x.units.map((u, i) => `<li><b>${pad(i + 1)}</b>${esc(u)}</li>`).join('')}</ol>`
        : '';
      return `
        <li><a class="subject subject--notes" href="study.html?c=${p.id}&amp;s=${s.n}&amp;sub=${x.id}">
          ${head}${units}
          <span class="subject__cta">Study notes ${arrow}</span>
        </a></li>`;
    }
    return `
      <li><div class="subject subject--soon">
        ${head}
        <span class="subject__foot"><span class="subject__soon">Notes coming</span>${syllabusLink(p, x.page)}</span>
      </div></li>`;
  };

  /* ---------- Selected course: progress + Accordion / Semester ---------- */
  const courseEl = $('course');
  let current = null;
  const renderCourse = (p) => {
    const pr = progressOf(p);
    $('courseKicker').textContent = `${p.short} · ${p.years}`;
    $('courseTitle').textContent = p.name;
    $('courseLead').textContent = p.lead;
    $('courseMeta').innerHTML = [
      ['Semesters', pr.total],
      ['Completed', `${pr.done} / ${pr.total}`],
      ['Now', pr.now ? `Semester ${pr.now.n}` : 'Finished'],
      p.college ? ['University', p.college] : null,
    ].filter(Boolean).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');

    $('semProgress').innerHTML = p.semesters.map((s) => `
      <li class="sem-progress__step is-${s.status}">
        <a href="#${p.id}-sem-${s.n}" aria-label="Semester ${s.n}, ${STATUS[s.status]}"><b>${pad(s.n)}</b><span>Sem ${s.n}</span></a>
      </li>`).join('');

    $('sems').innerHTML = p.semesters.map((s) => {
      const main = s.subjects.filter((x) => x.type !== 'lab');
      const labs = s.subjects.filter((x) => x.type === 'lab');
      const credits = s.subjects.reduce((a, x) => a + (x.credits || 0), 0);
      const withNotes = s.subjects.filter((x) => x.notes).length;
      const summary = s.subjects.length
        ? `<div class="sem__summary">
             <span class="sem__facts body-sm"><b>${s.subjects.length}</b> subjects · <b>${credits}</b> credits${withNotes ? ` · <b>${withNotes}</b> with notes` : ''}</span>
             ${syllabusLink(p, null, 'Full syllabus')}
           </div>`
        : '';
      const body = s.subjects.length
        ? `${summary}
           <p class="caption">Subjects · ${main.length}</p>
           <ul class="subjects">${main.map((x) => subjectCard(p, s, x)).join('')}</ul>
           ${labs.length ? `<p class="caption sem__sub">Practicals · ${labs.length}</p><ul class="subjects subjects--labs">${labs.map((x) => subjectCard(p, s, x)).join('')}</ul>` : ''}`
        : `<p class="sem__empty muted body-sm">Subjects will be added soon.</p>`;
      const open = s.status === 'now' || (!pr.now && s.n === pr.total);
      return `
        <details class="sem is-${s.status}" id="${p.id}-sem-${s.n}"${open ? ' open' : ''}>
          <summary class="sem__head">
            <span class="sem__n mono">${pad(s.n)}</span>
            <span class="sem__title">Semester ${s.n}${withNotes ? `<span class="sem__badge">${withNotes} notes</span>` : ''}</span>
            <span class="sem__year mono">${esc(s.year)}</span>
            <span class="status status--${s.status}">${STATUS[s.status]}</span>
            <span class="sem__chev" aria-hidden="true"></span>
          </summary>
          <div class="sem__body">${body}</div>
        </details>`;
    }).join('');

    // semester steps: open + scroll to that semester (hash stays on the course)
    $('semProgress').querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      openSem(a.getAttribute('href').slice(1));
    }));

    programsEl.querySelectorAll('.program').forEach((el) => {
      const on = el.dataset.program === p.id;
      el.classList.toggle('is-active', on);
      el.toggleAttribute('aria-current', on);
    });
    courseEl.hidden = false;
    courseEl.classList.remove('is-in'); void courseEl.offsetWidth; courseEl.classList.add('is-in');
    current = p.id;
  };

  const openSem = (id) => {
    const d = document.getElementById(id);
    if (!d) return false;
    d.open = true;
    d.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    d.querySelector('summary').focus({ preventScroll: true });
    return true;
  };

  /* ---------- Routing: #mca · #mca-sem-1 (Back button works) ---------- */
  const route = (focus) => {
    const hash = location.hash.slice(1);
    const id = hash.split('-sem-')[0];
    const p = PROGRAMS.find((x) => x.id === id);
    if (p) {
      if (current !== p.id) renderCourse(p);
      if (hash.includes('-sem-')) { openSem(hash); return; }
      if (focus) {
        courseEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        $('courseTitle').focus({ preventScroll: true });
      }
    } else if (!id) {   // other hashes (#main, #top) leave the open course alone
      courseEl.hidden = true; current = null;
      programsEl.querySelectorAll('.program').forEach((el) => { el.classList.remove('is-active'); el.removeAttribute('aria-current'); });
    }
  };
  window.addEventListener('hashchange', () => route(true));
  // on first load the browser's own anchor/scroll restore runs too — route after it
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  route(false);
  if (location.hash) window.addEventListener('load', () => setTimeout(() => route(true), 60), { once: true });
})();
