// background.js

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSheetData') {
    fetchSheetData(request.sheetUrl, request.gid)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

// ── Extract Sheet ID from any Google Sheets URL ───────────────────────────────
function extractSheetId(input) {
  input = input.trim();
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9-_]+$/.test(input)) return input;
  throw new Error('Invalid Sheet URL. Paste the full Google Sheets link.');
}

// ── Extract gid from URL (e.g. #gid=528440725 or ?gid=528440725) ─────────────
function extractGid(url) {
  const m = url.match(/[#?&]gid=(\d+)/);
  return m ? m[1] : '0';
}

function parseGviz(text) {
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!m) throw new Error('Could not parse sheet response. Make sure the sheet is public.');
  return JSON.parse(m[1]);
}

// ── Fetch sheet data via gviz/tq using gid ────────────────────────────────────
async function fetchSheetData(sheetUrl, gid) {
  const sheetId = extractSheetId(sheetUrl);

  // If gid not passed directly, try to extract from URL
  if (!gid) gid = extractGid(sheetUrl);

  const gidParam = gid ? `&gid=${gid}` : '';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json${gidParam}`;

  const resp = await fetch(url, { credentials: 'omit' });

  if (resp.status === 401 || resp.status === 403) {
    throw new Error('Sheet is private. Click Share → "Anyone with the link" → Viewer.');
  }
  if (!resp.ok) throw new Error(`Could not load sheet (${resp.status}).`);

  const text = await resp.text();
  if (text.includes('signin') || text.includes('<!DOCTYPE')) {
    throw new Error('Sheet is private. Make sure sharing is "Anyone with the link".');
  }

  const json = parseGviz(text);
  if (json.status === 'error') {
    throw new Error(json.errors?.[0]?.message || 'Error reading sheet.');
  }

  const table = json.table;
  if (!table?.cols?.length) return [];

  const headers = table.cols.map(col => (col.label || col.id || '').trim().toLowerCase());

  return (table.rows || []).map((row, i) => {
    const obj = { _rowIndex: i + 2 };
    headers.forEach((h, idx) => {
      const cell = row.c?.[idx];
      obj[h] = (cell?.v !== null && cell?.v !== undefined) ? String(cell.v).trim() : '';
    });
    return obj;
  }).filter(obj => headers.some(h => h && obj[h]));
}
