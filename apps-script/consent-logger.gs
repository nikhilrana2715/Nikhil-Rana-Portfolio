/**
 * Portfolio — Visitor log (v5.9)
 * Paste into Apps Script — either from the sheet (Extensions → Apps Script) or as a standalone
 * project (script.google.com → New project; needed when several Google accounts are signed in
 * and the sheet's Apps Script link fails) → replace Code.gs with this → Save → Deploy → New deployment
 *   → Web app · Execute as: Me · Who has access: Anyone → copy the /exec URL
 *   → put it in script.js CONSENT_LOG_URL.
 *
 * One row per visitor (Visitor ID).
 *   type=consent → creates / updates the row (choice, location, device …)
 *   type=resume  → same row gets Name + Email (from "View resume" gate)
 *   type=contact → same row gets Name + Email (from contact form)
 * Empty incoming values never wipe what's already in the row.
 * The URL is public (static site), so every field is validated + length-capped here.
 */
const SHEET_ID = '13Wd2zWfqNAXmrHoU2UTesOU17IP_eNb8-epabqIUTdo';  // works bound or standalone
const SHEET_NAME = 'Sheet1';
const HEADERS = ['#', 'Time (IST)', 'Visitor ID', 'Name', 'Email', 'Choice', 'Name from',
                 'City', 'Region', 'Country', 'Network / Company', 'Timezone',
                 'Device', 'Browser / OS', 'Screen', 'Language', 'Came from', 'Page'];
const SOURCE = { consent: '', resume: 'Resume gate', contact: 'Contact form' };

function doPost(e) {
  const p = (e && e.parameter) || {};
  const type = p.type in SOURCE ? p.type : '';
  const vid = String(p.vid || '');
  if (!type || !/^[a-f0-9]{24}$/.test(vid)) return out('bad request');

  const cap = (v, n) => String(v || '').trim().replace(/^[=+\-@]/, "'").slice(0, n || 120); // no formula injection
  const choice = p.choice === 'all' ? 'Accept all' : p.choice === 'essential' ? 'Essential only' : '';
  if (type === 'consent' && !choice) return out('bad request');
  const email = cap(p.email, 120);
  if (type !== 'consent' && (!/^\S+@\S+\.\S+$/.test(email) || !cap(p.name, 80))) return out('bad request');

  const rec = {
    'Time (IST)': Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a'),
    'Visitor ID': vid,
    'Name': cap(p.name, 80),
    'Email': email,
    'Choice': choice,
    'Name from': SOURCE[type],
    'City': cap(p.city, 60), 'Region': cap(p.region, 60), 'Country': cap(p.country, 8),
    'Network / Company': cap(p.org, 100),
    'Timezone': cap(p.tz, 60), 'Device': cap(p.device, 20), 'Browser / OS': cap(p.browser, 60),
    'Screen': cap(p.screen, 20), 'Language': cap(p.lang, 20),
    'Came from': cap(p.ref, 200), 'Page': cap(p.page, 200)
  };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    const idCol = head.indexOf('Visitor ID') + 1;

    // Find this visitor's row
    const last = sh.getLastRow();
    let at = -1;
    if (last > 1) {
      const ids = sh.getRange(2, idCol, last - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) if (ids[i][0] === vid) { at = i + 2; break; }
    }

    let row, num;
    if (at > 0) {
      // Merge: only overwrite cells that have a new non-empty value
      const cur = sh.getRange(at, 1, 1, head.length).getValues()[0];
      row = head.map((h, i) => (rec[h] ? rec[h] : cur[i]));
      sh.getRange(at, 1, 1, head.length).setValues([row]);
      num = cur[0];
    } else {
      // New visitor → new row at the bottom; earlier rows are never touched
      num = last;   // # = running number (header is row 1)
      row = head.map(h => (h === '#' ? num : rec[h] || ''));
      sh.appendRow(row);
    }
    notify(type, at < 0, num, head, row);
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

/* Email the sheet owner (Execute as: Me → that's Nikhil) on every new / updated row.
   No address in code (repo is public). Gmail quota ~100 mails/day on a free account. */
function notify(type, isNew, num, head, row) {
  try {
    const to = Session.getEffectiveUser().getEmail();
    if (!to) return;
    const v = h => String(row[head.indexOf(h)] || '');
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const place = [v('City'), v('Country')].filter(Boolean).join(', ') || 'unknown place';
    const who = v('Name') ? `${v('Name')} (${v('Email')})` : 'Anonymous visitor';
    const what = type === 'resume' ? 'viewed your resume'
      : type === 'contact' ? 'sent a message'
      : isNew ? `new visitor · ${v('Choice')}` : `visited again · ${v('Choice')}`;
    const subject = `Portfolio #${num}: ${who} ${what} — ${place}`;

    const rows = head.filter(h => h !== '#' && v(h)).map(h =>
      `<tr><td style="padding:6px 12px;color:#7D7773;white-space:nowrap">${esc(h)}</td>` +
      `<td style="padding:6px 12px;color:#1A1818">${esc(v(h))}</td></tr>`).join('');
    const html =
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1A1818">` +
      `<p style="margin:0 0 12px"><b>${esc(who)}</b> ${esc(what)} — ${esc(place)}</p>` +
      `<table style="border-collapse:collapse;background:#F5F1EC;border-radius:8px">${rows}</table>` +
      `<p style="margin:16px 0 0"><a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit">Open the full sheet</a></p></div>`;

    const opts = { to, subject, htmlBody: html, name: 'Portfolio Visitor Log' };
    const email = v('Email');
    if (/^\S+@\S+\.\S+$/.test(email)) opts.replyTo = email;   // Reply goes to the visitor
    MailApp.sendEmail(opts);
  } catch (err) {
    console.error('notify failed: ' + err);   // never block the sheet write
  }
}

/* Run once from the editor (select "authorize" → Run) to grant the Send email permission. */
function authorize() { MailApp.getRemainingDailyQuota(); SpreadsheetApp.openById(SHEET_ID); }

function doGet() { return out('Visitor logger is running.'); }

function out(msg) { return ContentService.createTextOutput(msg); }
