import fs from 'node:fs';

const file = process.env.CORE;
const before = fs.readFileSync(file, 'utf8');
let src = before;

const renderName = 'aicmRenderManagerMajorRows';
const oldMarker = 'AICM_MANAGER_MAJOR_RENDER_CANONICAL_V1: render';
const newMarker = 'AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: render';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function isWs(ch) {
  return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
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
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
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

function findAllFunctionRanges(source, name) {
  const ranges = [];
  const needle = 'function ' + name;
  let pos = 0;

  while (pos < source.length) {
    const start = source.indexOf(needle, pos);
    if (start < 0) break;

    let p = start + needle.length;
    while (p < source.length && isWs(source[p])) p += 1;

    if (source[p] !== '(') {
      pos = start + needle.length;
      continue;
    }

    const open = source.indexOf('{', p);
    if (open < 0) {
      pos = p + 1;
      continue;
    }

    const close = findMatchingBrace(source, open);
    if (close < 0) {
      pos = open + 1;
      continue;
    }

    ranges.push({
      start,
      end: close + 1,
      text: source.slice(start, close + 1)
    });

    pos = close + 1;
  }

  return ranges;
}

const ranges = findAllFunctionRanges(src, renderName);
const oldRanges = ranges.filter(r => r.text.includes(oldMarker));
const newRanges = ranges.filter(r => r.text.includes(newMarker));

console.log('beforeRenderHelperCount=' + ranges.length);
console.log('beforeOldRenderHelperCount=' + oldRanges.length);
console.log('beforePendingRenderHelperCount=' + newRanges.length);
console.log('beforeOldMarkerCount=' + countText(src, oldMarker));
console.log('beforePendingMarkerCount=' + countText(src, newMarker));

if (oldRanges.length !== 1) {
  console.error('Expected exactly one old render helper to remove, found ' + oldRanges.length);
  process.exit(1);
}

if (newRanges.length !== 1) {
  console.error('Expected exactly one pending render helper to keep, found ' + newRanges.length);
  process.exit(1);
}

const remove = oldRanges[0];
src = src.slice(0, remove.start) + '\n' + src.slice(remove.end);

fs.writeFileSync(file, src, 'utf8');

const after = fs.readFileSync(file, 'utf8');
const afterRanges = findAllFunctionRanges(after, renderName);
const afterOldRanges = afterRanges.filter(r => r.text.includes(oldMarker));
const afterNewRanges = afterRanges.filter(r => r.text.includes(newMarker));

console.log('coreChanged=' + String(before !== after));
console.log('afterRenderHelperCount=' + afterRanges.length);
console.log('afterOldRenderHelperCount=' + afterOldRanges.length);
console.log('afterPendingRenderHelperCount=' + afterNewRanges.length);
console.log('afterOldMarkerCount=' + countText(after, oldMarker));
console.log('afterPendingMarkerCount=' + countText(after, newMarker));
console.log('rowsHelperCount=' + findAllFunctionRanges(after, 'aicmGetManagerMajorRowsForSelectedCompany').length);
console.log('reloadHelperCount=' + findAllFunctionRanges(after, 'aicmReloadTaskLedgerContext').length);
console.log('placeholderCount=' + findAllFunctionRanges(after, 'renderTaskLedgerPlaceholder').length);
console.log('legacyR10HelperCount=' + findAllFunctionRanges(after, 'aicmAxuCsvR10RenderPmlwMajorRows').length);
console.log('refreshActionCount=' + countText(after, 'task-ledger-refresh'));
console.log('pendingFilterRefCount=' + countText(after, 'isPendingMajor'));
console.log('handoffActionCount=' + countText(after, 'pmlw-major-leader-handoff'));
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
