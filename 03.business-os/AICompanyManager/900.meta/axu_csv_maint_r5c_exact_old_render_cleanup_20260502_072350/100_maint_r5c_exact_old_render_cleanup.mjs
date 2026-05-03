import fs from 'node:fs';

const file = process.env.CORE;
const before = fs.readFileSync(file, 'utf8');
let src = before;

const functionNeedle = 'function aicmRenderManagerMajorRows';
const oldMarker = 'AICM_MANAGER_MAJOR_RENDER_CANONICAL_V1: render';
const pendingMarker = 'AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: render';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
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
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
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

function countFunctionsByPlainNeedle(text) {
  return countText(text, functionNeedle);
}

const beforeFunctionCount = countFunctionsByPlainNeedle(src);
const beforeOldMarkerCount = countText(src, oldMarker);
const beforePendingMarkerCount = countText(src, pendingMarker);

console.log('beforeFunctionRenderHelperCount=' + beforeFunctionCount);
console.log('beforeOldMarkerCount=' + beforeOldMarkerCount);
console.log('beforePendingMarkerCount=' + beforePendingMarkerCount);

if (beforeOldMarkerCount !== 1) {
  console.error('Expected exactly one old marker, found ' + beforeOldMarkerCount);
  process.exit(1);
}

if (beforePendingMarkerCount < 1) {
  console.error('Pending marker missing; stop to avoid removing wrong helper.');
  process.exit(1);
}

const markerIndex = src.indexOf(oldMarker);
const functionStart = src.lastIndexOf(functionNeedle, markerIndex);

if (functionStart < 0) {
  console.error('Could not find old render function start before old marker.');
  process.exit(1);
}

const openBrace = src.indexOf('{', functionStart);
if (openBrace < 0 || openBrace > markerIndex) {
  console.error('Could not find old render function opening brace.');
  process.exit(1);
}

const closeBrace = findMatchingBrace(src, openBrace);
if (closeBrace < 0) {
  console.error('Could not find old render function closing brace.');
  process.exit(1);
}

const oldFunctionText = src.slice(functionStart, closeBrace + 1);

if (!oldFunctionText.includes(oldMarker)) {
  console.error('Located function does not contain old marker; stop.');
  process.exit(1);
}

if (oldFunctionText.includes(pendingMarker)) {
  console.error('Located old function also contains pending marker; stop to avoid deleting new helper.');
  process.exit(1);
}

src = src.slice(0, functionStart) + '\n' + src.slice(closeBrace + 1);

fs.writeFileSync(file, src, 'utf8');

const after = fs.readFileSync(file, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('afterFunctionRenderHelperCount=' + countFunctionsByPlainNeedle(after));
console.log('afterOldMarkerCount=' + countText(after, oldMarker));
console.log('afterPendingRenderMarkerCount=' + countText(after, pendingMarker));
console.log('rowsHelperCount=' + countText(after, 'function aicmGetManagerMajorRowsForSelectedCompany'));
console.log('reloadHelperCount=' + countText(after, 'function aicmReloadTaskLedgerContext'));
console.log('placeholderCount=' + countText(after, 'function renderTaskLedgerPlaceholder'));
console.log('legacyR10HelperCount=' + countText(after, 'function aicmAxuCsvR10RenderPmlwMajorRows'));
console.log('refreshActionCount=' + countText(after, 'task-ledger-refresh'));
console.log('pendingFilterCount=' + countText(after, 'isPendingMajor'));
console.log('handoffActionCount=' + countText(after, 'pmlw-major-leader-handoff'));
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
