import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R4_SERVER_SQL_NEWLINE_REPAIR_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

const routeNeedle = 'manager-major/import-csv';
const routeIndex = src.indexOf(routeNeedle);

if (routeIndex < 0) {
  console.error('manager-major/import-csv route not found');
  process.exit(1);
}

/*
 * Keep patch local to the import route neighborhood.
 * The bug is source text like:
 *   .join(",\\n    ")
 * which produces runtime SQL containing literal:
 *   ,\n
 *
 * Correct source text is:
 *   .join(",\n    ")
 * which produces a real newline in SQL.
 */
const start = Math.max(0, routeIndex - 24000);
const end = Math.min(src.length, routeIndex + 52000);

let segment = src.slice(start, end);
const segmentBefore = segment;

const beforeDoubleSlashN = countText(segment, '\\\\n');
const beforeJoinDoubleSlashN =
  countText(segment, '.join(",\\\\n') +
  countText(segment, ".join(',\\\\n") +
  countText(segment, 'join(",\\\\n') +
  countText(segment, "join(',\\\\n");

segment = segment
  .split('",\\\\n').join('",\\n')
  .split("',\\\\n").join("',\\n")
  .split(',\\\\n').join(',\\n')
  .split(')\\\\n').join(')\\n');

const afterDoubleSlashN = countText(segment, '\\\\n');
const afterJoinDoubleSlashN =
  countText(segment, '.join(",\\\\n') +
  countText(segment, ".join(',\\\\n") +
  countText(segment, 'join(",\\\\n') +
  countText(segment, "join(',\\\\n");

if (segment !== segmentBefore && !segment.includes(marker)) {
  const routeLine = '// ' + marker + ': repaired literal double-backslash-n in manager-major/import-csv SQL assembly\n';
  segment = routeLine + segment;
}

src = src.slice(0, start) + segment + src.slice(end);

fs.writeFileSync(serverFile, src, 'utf8');

const after = fs.readFileSync(serverFile, 'utf8');
const routeIndexAfter = after.indexOf(routeNeedle);
const startAfter = Math.max(0, routeIndexAfter - 24000);
const endAfter = Math.min(after.length, routeIndexAfter + 52000);
const segmentAfter = after.slice(startAfter, endAfter);

console.log('serverChanged=' + String(before !== after));
console.log('routeFound=' + String(routeIndexAfter >= 0));
console.log('markerCount=' + String(countText(after, marker)));
console.log('beforeDoubleSlashNInRouteWindow=' + String(beforeDoubleSlashN));
console.log('afterDoubleSlashNInRouteWindow=' + String(countText(segmentAfter, '\\\\n')));
console.log('beforeJoinDoubleSlashN=' + String(beforeJoinDoubleSlashN));
console.log('afterJoinDoubleSlashN=' + String(afterJoinDoubleSlashN));
console.log('remainingDangerJoinCount=' + String(
  countText(segmentAfter, '.join(",\\\\n') +
  countText(segmentAfter, ".join(',\\\\n") +
  countText(segmentAfter, 'join(",\\\\n') +
  countText(segmentAfter, "join(',\\\\n")
));
console.log('routeEndpointCount=' + String(countText(after, routeNeedle)));
console.log('tokenLeakCountServer=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(after, 'async async function')));
