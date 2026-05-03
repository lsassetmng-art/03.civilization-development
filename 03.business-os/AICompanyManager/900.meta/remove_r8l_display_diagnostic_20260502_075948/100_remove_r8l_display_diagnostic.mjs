import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

const marker = 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1';
const keepMarker = 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1';

let src = fs.readFileSync(corePath, 'utf8');
const original = src;

const beforeMarkerCount = (src.match(new RegExp(marker, 'g')) || []).length;
const keepMarkerCount = (src.match(new RegExp(keepMarker, 'g')) || []).length;

const removals = [];

function removeRegex(label, re) {
  const before = src;
  src = src.replace(re, (m) => {
    removals.push({
      label,
      chars: m.length,
      preview: m.slice(0, 260).replace(/\s+/g, ' ')
    });
    return '';
  });
  return before !== src;
}

/*
  R8Lは表示診断専用。
  markerを含む「診断パネル生成」「pre/code/details生成」「console/table/log」だけを削る。
  R8M hydration marker / helper / call は削らない。
*/

/* comment-bounded block がある場合 */
removeRegex(
  'comment bounded R8L block',
  /\/\*[\s\S]{0,600}?AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[\s\S]{0,9000}?\*\//g
);

/* single-line console diagnostics */
removeRegex(
  'console diagnostic line',
  /^[^\n]*(?:console\.(?:log|debug|info|warn|table)|window\.console\.(?:log|debug|info|warn|table))[^\n]*AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[^\n]*\n?/gm
);

/* direct JSON debug object const/let/var followed by DOM textContent append */
removeRegex(
  'const debug object plus pre append',
  /(?:const|let|var)\s+[A-Za-z0-9_$]*(?:Debug|Diagnostic|Log|RowsLog|ContextRowsLog)[A-Za-z0-9_$]*\s*=\s*\{[\s\S]{0,6000}?AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[\s\S]{0,6000}?\};\s*(?:const|let|var)\s+[A-Za-z0-9_$]*(?:Pre|Panel|Box|El|Node)[A-Za-z0-9_$]*[\s\S]{0,5000}?(?:appendChild|insertAdjacentElement|insertAdjacentHTML)\([^;]+;\s*/g
);

/* details/pre/panel DOM builder block beginning near marker */
removeRegex(
  'details/pre/panel diagnostic builder',
  /(?:const|let|var)\s+[A-Za-z0-9_$]*(?:Details|Debug|Diagnostic|Panel|Box|Pre|Log)[A-Za-z0-9_$]*\s*=\s*document\.createElement\((?:'|")(?:(?:details)|(?:pre)|(?:code)|(?:section)|(?:div))(?:'|")\);[\s\S]{0,9000}?AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[\s\S]{0,9000}?(?:appendChild|insertAdjacentElement)\([^;]+;\s*/g
);

/* insertAdjacentHTML/template literal containing marker */
removeRegex(
  'insertAdjacentHTML diagnostic template',
  /[A-Za-z0-9_$.]+\.insertAdjacentHTML\(\s*(['"])beforeend\1\s*,\s*`[\s\S]{0,12000}?AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[\s\S]{0,12000}?`\s*\);\s*/g
);

/* innerHTML/template assignment containing marker */
removeRegex(
  'innerHTML diagnostic template assignment',
  /[A-Za-z0-9_$.]+\.innerHTML\s*=\s*`[\s\S]{0,12000}?AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1[\s\S]{0,12000}?`;\s*/g
);

/*
  最後の保険:
  まだmarkerが残る場合は、markerを含む statement 単位だけ削除する。
  ただし hydration R8M marker を含む statement は対象外。
*/
let guard = 0;
while (src.includes(marker) && guard < 20) {
  guard += 1;
  const idx = src.indexOf(marker);
  const leftSemi = src.lastIndexOf(';', idx);
  const leftBrace = src.lastIndexOf('\n', idx);
  const start = Math.max(leftSemi + 1, leftBrace + 1, 0);
  const rightSemi = src.indexOf(';', idx);
  if (rightSemi < 0) break;
  const end = rightSemi + 1;
  const chunk = src.slice(start, end);
  if (chunk.includes(keepMarker)) {
    console.error('ERROR: fallback chunk contains R8M keep marker; refusing');
    process.exit(2);
  }
  removals.push({
    label: 'fallback single statement containing R8L marker',
    chars: chunk.length,
    preview: chunk.slice(0, 260).replace(/\s+/g, ' ')
  });
  src = src.slice(0, start) + src.slice(end);
}

const afterMarkerCount = (src.match(new RegExp(marker, 'g')) || []).length;
const afterKeepMarkerCount = (src.match(new RegExp(keepMarker, 'g')) || []).length;

if (beforeMarkerCount === 0) {
  console.log(JSON.stringify({
    status: 'NOOP_MARKER_NOT_FOUND',
    beforeMarkerCount,
    afterMarkerCount,
    keepMarkerCount,
    afterKeepMarkerCount,
    removals
  }, null, 2));
  process.exit(0);
}

if (afterMarkerCount !== 0) {
  console.error(JSON.stringify({
    status: 'FAILED_MARKER_STILL_PRESENT',
    beforeMarkerCount,
    afterMarkerCount,
    keepMarkerCount,
    afterKeepMarkerCount,
    removals
  }, null, 2));
  process.exit(3);
}

if (keepMarkerCount > 0 && afterKeepMarkerCount !== keepMarkerCount) {
  console.error(JSON.stringify({
    status: 'FAILED_KEEP_MARKER_CHANGED',
    beforeMarkerCount,
    afterMarkerCount,
    keepMarkerCount,
    afterKeepMarkerCount,
    removals
  }, null, 2));
  process.exit(4);
}

if (src === original) {
  console.error(JSON.stringify({
    status: 'FAILED_NO_CHANGE',
    beforeMarkerCount,
    afterMarkerCount,
    keepMarkerCount,
    afterKeepMarkerCount,
    removals
  }, null, 2));
  process.exit(5);
}

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  beforeMarkerCount,
  afterMarkerCount,
  keepMarkerCount,
  afterKeepMarkerCount,
  removalCount: removals.length,
  removals
}, null, 2));
