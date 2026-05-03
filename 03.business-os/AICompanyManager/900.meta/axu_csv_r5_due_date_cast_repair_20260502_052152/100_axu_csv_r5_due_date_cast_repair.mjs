import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R5_DUE_DATE_CAST_REPAIR_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function routeWindow(source) {
  const idx = source.indexOf('manager-major/import-csv');
  if (idx < 0) return null;
  return {
    idx,
    start: Math.max(0, idx - 26000),
    end: Math.min(source.length, idx + 62000)
  };
}

const win = routeWindow(src);
if (!win) {
  console.error('manager-major/import-csv route not found');
  process.exit(1);
}

let segment = src.slice(win.start, win.end);
const segmentBefore = segment;

/*
 * Minimal repair:
 * Do not touch the CTE/VALUES column declaration.
 * Only repair SELECT expressions that feed INSERT date column.
 *
 * Known failing shape:
 *   'not_started', 'draft', priority_code, due_date, note
 *
 * Correct:
 *   'not_started', 'draft', priority_code, NULLIF(due_date, '')::date, note
 */

const replacements = [
  {
    from: "priority_code, due_date, note",
    to: "priority_code, NULLIF(due_date, '')::date, note"
  },
  {
    from: "priority_code, due_date,\n",
    to: "priority_code, NULLIF(due_date, '')::date,\n"
  },
  {
    from: "priority_code,\n         due_date,\n",
    to: "priority_code,\n         NULLIF(due_date, '')::date,\n"
  },
  {
    from: "priority_code,\n          due_date,\n",
    to: "priority_code,\n          NULLIF(due_date, '')::date,\n"
  },
  {
    from: "priority_code,\n        due_date,\n",
    to: "priority_code,\n        NULLIF(due_date, '')::date,\n"
  }
];

let replacedCount = 0;

for (const r of replacements) {
  const c = countText(segment, r.from);
  if (c > 0) {
    segment = segment.split(r.from).join(r.to);
    replacedCount += c;
  }
}

/*
 * If already partially repaired, do not duplicate casts.
 */
segment = segment
  .replace(/NULLIF\(NULLIF\(due_date,\s*''\)::date,\s*''\)::date/g, "NULLIF(due_date, '')::date")
  .replace(/NULLIF\(due_date,\s*''\)::date::date/g, "NULLIF(due_date, '')::date");

if (segment !== segmentBefore && !segment.includes(marker)) {
  const routePos = segment.indexOf('manager-major/import-csv');
  const insertPos = routePos >= 0 ? Math.max(0, segment.lastIndexOf('\n', routePos) + 1) : 0;
  segment = segment.slice(0, insertPos)
    + '// ' + marker + ': cast CSV due_date text to date in import INSERT SELECT\n'
    + segment.slice(insertPos);
}

src = src.slice(0, win.start) + segment + src.slice(win.end);
fs.writeFileSync(serverFile, src, 'utf8');

const after = fs.readFileSync(serverFile, 'utf8');
const winAfter = routeWindow(after);
const segAfter = winAfter ? after.slice(winAfter.start, winAfter.end) : '';

console.log('serverChanged=' + String(before !== after));
console.log('replacedCount=' + String(replacedCount));
console.log('markerCount=' + String(countText(after, marker)));
console.log('endpointCount=' + String(countText(after, 'manager-major/import-csv')));
console.log('dueDateCastCountInRoute=' + String(countText(segAfter, "NULLIF(due_date, '')::date")));
console.log('dangerUncastPatternCount=' + String(
  countText(segAfter, "priority_code, due_date, note") +
  countText(segAfter, "priority_code, due_date,\n") +
  countText(segAfter, "priority_code,\n         due_date,\n") +
  countText(segAfter, "priority_code,\n          due_date,\n") +
  countText(segAfter, "priority_code,\n        due_date,\n")
));
console.log('doubleCastCount=' + String(
  countText(segAfter, "NULLIF(NULLIF(due_date") +
  countText(segAfter, "::date::date")
));
console.log('tokenEnvNameCountServer=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(after, 'async async function')));
