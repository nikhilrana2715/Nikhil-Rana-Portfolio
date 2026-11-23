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

    if (at > 0) {
      // Merge: only overwrite cells that have a new non-empty value
      const cur = sh.getRange(at, 1, 1, head.length).getValues()[0];
      const row = head.map((h, i) => (rec[h] ? rec[h] : cur[i]));
      sh.getRange(at, 1, 1, head.length).setValues([row]);
    } else {
      const row = head.map(h => (h === '#' ? last : rec[h] || ''));   // # = running number (header is row 1)
      sh.appendRow(row);
    }
  } finally {
    lock.releaseLock();
  }
  return out('ok');
}

function doGet() { return out('Visitor logger is running.'); }

function out(msg) { return ContentService.createTextOutput(msg); }
