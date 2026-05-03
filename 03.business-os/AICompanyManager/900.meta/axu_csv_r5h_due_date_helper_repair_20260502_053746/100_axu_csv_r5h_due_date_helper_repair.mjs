import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R5H_DUE_DATE_HELPER_REPAIR_V1';

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

const range = findFunctionRange(src, 'aicmPmlwOptionalDateSql');

if (!range) {
  console.error('function aicmPmlwOptionalDateSql not found');
  process.exit(1);
}

const replacement = `function aicmPmlwOptionalDateSql(value) {
  // ${marker}
  const text = String(value == null ? "" : value).trim();

  if (!text) {
    return "NULL::date";
  }

  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(text)) {
    throw new Error("due_date は YYYY-MM-DD または空欄にしてください: " + text);
  }

  return sqlLiteral(text) + "::date";
}`;

src = src.slice(0, range.start) + replacement + src.slice(range.end);

fs.writeFileSync(serverFile, src, 'utf8');

const after = fs.readFileSync(serverFile, 'utf8');

console.log('serverChanged=' + String(before !== after));
console.log('markerCount=' + String(countText(after, marker)));
console.log('helperCount=' + String(countText(after, 'function aicmPmlwOptionalDateSql')));
console.log('nullDateCount=' + String(countText(after, 'NULL::date')));
console.log('sqlLiteralDateCastCount=' + String(countText(after, 'sqlLiteral(text) + "::date"')));
console.log('helperUsageCount=' + String(countText(after, 'aicmPmlwOptionalDateSql(row.due_date)')));
console.log('importFunctionCount=' + String(countText(after, 'function importManagerMajorItemsCsv')));
console.log('endpointCount=' + String(countText(after, 'manager-major/import-csv')));
console.log('tokenEnvNameCountServer=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(after, 'async async function')));
