import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R7_PMLW_MAJOR_UI_FILTER_REPAIR_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function findFunctionStart(source, name) {
  const patterns = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];

  let best = -1;

  for (const p of patterns) {
    const i = source.indexOf(p);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }

  return best;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) return i;
  }

  return -1;
}

function findFunctionRange(source, name) {
  const start = findFunctionStart(source, name);
  if (start < 0) return null;

  const open = source.indexOf('{', start);
  if (open < 0) return null;

  const close = findMatchingBrace(source, open);
  if (close < 0) return null;

  return {
    start,
    open,
    close,
    end: close + 1,
    text: source.slice(start, close + 1)
  };
}

const replacement = `function pmlwMajorRowsForCompany(companyId) {
    // ${marker}
    var ctx = state && state.context ? state.context : {};
    var targetCompanyId = String(companyId || "");

    function asArray(value) {
      return Array.isArray(value) ? value : [];
    }

    function rowCompanyId(row) {
      return String(
        row && (
          row.aicm_user_company_id ||
          row.company_id ||
          row.user_company_id ||
          row.companyId ||
          ""
        ) || ""
      );
    }

    function rowOrder(row) {
      var n = Number(
        row && (
          row.display_order ||
          row.sort_order ||
          row.row_order ||
          0
        )
      );

      return Number.isFinite(n) ? n : 0;
    }

    var rows = []
      .concat(asArray(ctx.pmlw_major_items))
      .concat(asArray(ctx.manager_major_items))
      .concat(asArray(ctx.major_items));

    var filtered = rows.filter(function (row) {
      if (!row) return false;

      var cid = rowCompanyId(row);

      if (!targetCompanyId) return true;
      if (!cid) return true;

      return cid === targetCompanyId;
    });

    filtered.sort(function (a, b) {
      var ao = rowOrder(a);
      var bo = rowOrder(b);

      if (ao !== bo) return ao - bo;

      var an = String((a && (a.major_item_name || a.title || a.task_name)) || "");
      var bn = String((b && (b.major_item_name || b.title || b.task_name)) || "");

      return an.localeCompare(bn, "ja");
    });

    return filtered;
  }`;

let range = findFunctionRange(src, 'pmlwMajorRowsForCompany');

if (range) {
  src = src.slice(0, range.start) + replacement + src.slice(range.end);
} else {
  const anchor = 'function renderPmlwMajorRows';
  const pos = src.indexOf(anchor);

  if (pos < 0) {
    console.error('Neither pmlwMajorRowsForCompany nor renderPmlwMajorRows found.');
    process.exit(1);
  }

  src = src.slice(0, pos) + replacement + '\n\n' + src.slice(pos);
}

fs.writeFileSync(coreFile, src, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('markerCount=' + String(countText(after, marker)));
console.log('pmlwMajorRowsForCompanyCount=' + String(countText(after, 'function pmlwMajorRowsForCompany')));
console.log('pmlwMajorItemsRefCount=' + String(countText(after, 'pmlw_major_items')));
console.log('managerMajorItemsRefCount=' + String(countText(after, 'manager_major_items')));
console.log('majorItemsRefCount=' + String(countText(after, 'major_items')));
console.log('renderPmlwMajorRowsCount=' + String(countText(after, 'function renderPmlwMajorRows')));
console.log('leaderHandoffActionCount=' + String(countText(after, 'pmlw-major-leader-handoff')));
console.log('badLiteralNewlineCount=' + String(countText(after, "\\\\n      ")));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
