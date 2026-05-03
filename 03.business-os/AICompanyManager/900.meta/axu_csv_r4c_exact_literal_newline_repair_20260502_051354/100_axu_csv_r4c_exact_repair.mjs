import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R4C_EXACT_LITERAL_NEWLINE_REPAIR_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function contextHasCsvImport(src, index) {
  const start = Math.max(0, index - 3500);
  const end = Math.min(src.length, index + 3500);
  const w = src.slice(start, end);
  return /manager-major\/import-csv|import-csv|major_item|manager_major|pmlw|department_name|section_name|priority_code/i.test(w);
}

function replaceAtRanges(src, ranges) {
  let out = '';
  let cursor = 0;

  for (const r of ranges.sort((a, b) => a.start - b.start)) {
    out += src.slice(cursor, r.start);
    out += r.replacement;
    cursor = r.end;
  }

  out += src.slice(cursor);
  return out;
}

const replacements = [];

/*
 * Repair only literal backslash-n usages near CSV import / major import code.
 * We intentionally do not globally replace all \\n in the server.
 */
const candidates = [
  '\\\\n',
  '\\\\\\\\n'
];

for (const needle of candidates) {
  let idx = src.indexOf(needle);
  while (idx >= 0) {
    if (contextHasCsvImport(src, idx)) {
      replacements.push({
        start: idx,
        end: idx + needle.length,
        replacement: '\\n',
        needle
      });
    }
    idx = src.indexOf(needle, idx + needle.length);
  }
}

let replacedCount = replacements.length;
let unique = [];
let seen = new Set();

for (const r of replacements) {
  const key = r.start + ':' + r.end;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(r);
  }
}

replacedCount = unique.length;

if (replacedCount > 0) {
  src = replaceAtRanges(src, unique);
}

/*
 * Add marker near endpoint without changing behavior.
 */
if (replacedCount > 0 && !src.includes(marker)) {
  const endpoint = 'manager-major/import-csv';
  const pos = src.indexOf(endpoint);
  if (pos >= 0) {
    const lineStart = src.lastIndexOf('\n', pos);
    const insertPos = lineStart >= 0 ? lineStart + 1 : pos;
    src = src.slice(0, insertPos) + '// ' + marker + ': repaired literal backslash-n near CSV import SQL assembly\n' + src.slice(insertPos);
  }
}

fs.writeFileSync(serverFile, src, 'utf8');

const after = fs.readFileSync(serverFile, 'utf8');

function countDangerNearCsvImport(text) {
  let count = 0;
  const re = /\\n|\\\\n/g;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (contextHasCsvImport(text, m.index)) count += 1;
  }

  return count;
}

console.log('serverChanged=' + String(before !== after));
console.log('replacedCount=' + String(replacedCount));
console.log('markerCount=' + String(countText(after, marker)));
console.log('dangerLiteralNearCsvImportBefore=' + String(countDangerNearCsvImport(before)));
console.log('dangerLiteralNearCsvImportAfter=' + String(countDangerNearCsvImport(after)));
console.log('endpointCount=' + String(countText(after, 'manager-major/import-csv')));
console.log('syntaxErrorLiteralInSourceAfter=' + String(countText(after, '),\\n    (')));
console.log('tokenEnvNameCountServer=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(after, 'async async function')));
