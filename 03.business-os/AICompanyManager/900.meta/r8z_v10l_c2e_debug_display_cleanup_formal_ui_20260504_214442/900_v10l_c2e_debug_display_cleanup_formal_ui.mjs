import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2E_DEBUG_DISPLAY_CLEANUP_FORMAL_UI';

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = 'normal';
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + escRe(name) + '\\s*\\(', 'm');
  const m = re.exec(text);
  if (!m) return null;

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) return null;

  const close = findMatchingBrace(text, open);
  if (close < 0) return null;

  return {
    name,
    start,
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function replaceFunction(text, fn, nextText) {
  return text.slice(0, fn.start) + nextText + text.slice(fn.close + 1);
}

function listFunctions(text) {
  const out = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;
  const seen = new Set();

  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    if (seen.has(name)) continue;
    seen.add(name);
    const fn = findFunctionRange(text, name);
    if (fn) out.push(fn);
  }

  return out;
}

if (count(src, marker) > 0) {
  throw new Error('C2E_MARKER_ALREADY_EXISTS');
}

const before = {
  c2d5Label: count(src, 'C2D5R2A 課を適用 debug'),
  c2d7Label: count(src, 'C2D7 handler entry debug'),
  c2d5Marker: count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY'),
  c2d7Marker: count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG'),
  routeEnrichMarker: count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY'),
  debugStateRefs: count(src, 'r8zMgrMajorCardRouteEnrichmentDebug')
};

const functions = listFunctions(src);

const targetFns = functions
  .map(fn => {
    let score = 0;
    const reasons = [];
    const t = fn.text;

    if (t.includes('C2D5R2A 課を適用 debug')) {
      score += 100;
      reasons.push('HAS_C2D5_LABEL');
    }
    if (t.includes('C2D7 handler entry debug')) {
      score += 100;
      reasons.push('HAS_C2D7_LABEL');
    }
    if (t.includes('AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY')) {
      score += 40;
      reasons.push('HAS_C2D5_MARKER');
    }
    if (t.includes('AICM_R8Z_MGR_MAJOR_CARD_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG')) {
      score += 40;
      reasons.push('HAS_C2D7_MARKER');
    }
    if (t.includes('r8zMgrMajorCardRouteEnrichmentDebug')) {
      score += 20;
      reasons.push('HAS_ROUTE_ENRICH_DEBUG_STATE');
    }
    if (t.includes('JSON.stringify') && t.includes('<pre')) {
      score += 30;
      reasons.push('HAS_PRE_JSON_DEBUG_RENDER');
    }
    if (t.includes('一括引き渡し先')) {
      score += 20;
      reasons.push('HAS_FORMAL_ROUTE_UI');
    }

    return { fn, score, reasons };
  })
  .filter(x => x.score >= 100)
  .sort((a, b) => b.score - a.score);

if (targetFns.length < 1) {
  throw new Error('DEBUG_RENDER_FUNCTION_NOT_FOUND');
}

const cleanupResults = [];

for (const target of targetFns) {
  const fn = target.fn;
  let t = fn.text;

  const original = t;

  // Remove complete template sections/details/cards that contain the visible debug labels.
  // Conservative: only remove blocks that visibly contain the debug headings.
  const patterns = [
    /<details\b[\s\S]{0,2500}?C2D5R2A 課を適用 debug[\s\S]{0,2500}?<\/details>/g,
    /<details\b[\s\S]{0,2500}?C2D7 handler entry debug[\s\S]{0,2500}?<\/details>/g,
    /<section\b[\s\S]{0,2500}?C2D5R2A 課を適用 debug[\s\S]{0,2500}?<\/section>/g,
    /<section\b[\s\S]{0,2500}?C2D7 handler entry debug[\s\S]{0,2500}?<\/section>/g,
    /<div\b[\s\S]{0,2500}?C2D5R2A 課を適用 debug[\s\S]{0,2500}?<\/div>/g,
    /<div\b[\s\S]{0,2500}?C2D7 handler entry debug[\s\S]{0,2500}?<\/div>/g
  ];

  for (const p of patterns) {
    t = t.replace(p, '');
  }

  // If the labels remain in JS array fragments, blank only the visible debug fragment lines.
  t = t
    .replace(/[ \t]*[`'"][^`'"\n]*C2D5R2A 課を適用 debug[^`'"\n]*[`'"],?\n?/g, '')
    .replace(/[ \t]*[`'"][^`'"\n]*C2D7 handler entry debug[^`'"\n]*[`'"],?\n?/g, '');

  if (t !== original) {
    const patchedWithMarker = t.replace(
      /{\s*/,
      '{\n  // ' + marker + '_CLEANED_VISIBLE_DEBUG_BLOCKS\n'
    );

    src = replaceFunction(src, fn, patchedWithMarker);

    cleanupResults.push({
      functionName: fn.name,
      lines: fn.startLine + '-' + fn.endLine,
      score: target.score,
      reasons: target.reasons.join(','),
      beforeC2D5: count(original, 'C2D5R2A 課を適用 debug'),
      afterC2D5: count(patchedWithMarker, 'C2D5R2A 課を適用 debug'),
      beforeC2D7: count(original, 'C2D7 handler entry debug'),
      afterC2D7: count(patchedWithMarker, 'C2D7 handler entry debug')
    });
  }
}

if (cleanupResults.length < 1) {
  throw new Error('NO_DEBUG_RENDER_BLOCK_REMOVED');
}

fs.writeFileSync(corePath, src);

const after = {
  c2d5Label: count(src, 'C2D5R2A 課を適用 debug'),
  c2d7Label: count(src, 'C2D7 handler entry debug'),
  c2d5Marker: count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D5R2A_ROUTE_APPLY_RUNTIME_DEBUG_RETRY'),
  c2d7Marker: count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D7_HANDLER_ENTRY_RUNTIME_DEBUG'),
  routeEnrichMarker: count(src, 'AICM_R8Z_MGR_MAJOR_CARD_C2D11R1_ROUTE_ENRICHMENT_PATCH_RETRY'),
  debugStateRefs: count(src, 'r8zMgrMajorCardRouteEnrichmentDebug')
};

const extract = [];
extract.push('AICompanyManager V10L-C2E debug display cleanup extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('CLEANUP_RESULTS');
for (const r of cleanupResults) {
  extract.push(JSON.stringify(r));
}
extract.push('');
extract.push('BEFORE=' + JSON.stringify(before));
extract.push('AFTER=' + JSON.stringify(after));

for (const r of cleanupResults) {
  const fn = findFunctionRange(src, r.functionName);
  extract.push('');
  extract.push('============================================================');
  extract.push('PATCHED_FUNCTION=' + r.functionName);
  extract.push('LINES=' + (fn ? fn.startLine + '-' + fn.endLine : 'UNKNOWN'));
  extract.push('============================================================');
  extract.push(fn ? fn.text : 'NOT_FOUND_AFTER_PATCH');
}

fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2E verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('CLEANUP_FUNCTION_COUNT=' + cleanupResults.length);
verify.push('C2E_MARKER_COUNT=' + count(src, marker));
verify.push('VISIBLE_C2D5_LABEL_BEFORE=' + before.c2d5Label);
verify.push('VISIBLE_C2D5_LABEL_AFTER=' + after.c2d5Label);
verify.push('VISIBLE_C2D7_LABEL_BEFORE=' + before.c2d7Label);
verify.push('VISIBLE_C2D7_LABEL_AFTER=' + after.c2d7Label);
verify.push('C2D5_RUNTIME_MARKER_BEFORE=' + before.c2d5Marker);
verify.push('C2D5_RUNTIME_MARKER_AFTER=' + after.c2d5Marker);
verify.push('C2D7_RUNTIME_MARKER_BEFORE=' + before.c2d7Marker);
verify.push('C2D7_RUNTIME_MARKER_AFTER=' + after.c2d7Marker);
verify.push('C2D11R1_ROUTE_ENRICH_MARKER_BEFORE=' + before.routeEnrichMarker);
verify.push('C2D11R1_ROUTE_ENRICH_MARKER_AFTER=' + after.routeEnrichMarker);
verify.push('ROUTE_ENRICH_DEBUG_STATE_REFS_BEFORE=' + before.debugStateRefs);
verify.push('ROUTE_ENRICH_DEBUG_STATE_REFS_AFTER=' + after.debugStateRefs);
verify.push('FORMAL_ROUTE_UI_STILL_PRESENT_COUNT=' + count(src, '一括引き渡し先'));
verify.push('SECTION_LABEL_STILL_PRESENT_COUNT=' + count(src, '課'));
verify.push('DEPARTMENT_LABEL_STILL_PRESENT_COUNT=' + count(src, '部門'));
verify.push('LEADER_LABEL_STILL_PRESENT_COUNT=' + count(src, 'Leader'));
verify.push('EXTRACT_OUT=' + extractOut);

if (after.c2d5Label !== 0) throw new Error('VISIBLE_C2D5_DEBUG_LABEL_STILL_PRESENT');
if (after.c2d7Label !== 0) throw new Error('VISIBLE_C2D7_DEBUG_LABEL_STILL_PRESENT');
if (count(src, marker) < 1) throw new Error('C2E_MARKER_MISSING');
if (count(src, '一括引き渡し先') < 1) throw new Error('FORMAL_ROUTE_UI_MISSING');
if (count(src, '課') < 1) throw new Error('SECTION_LABEL_MISSING');
if (count(src, '部門') < 1) throw new Error('DEPARTMENT_LABEL_MISSING');
if (count(src, 'Leader') < 1) throw new Error('LEADER_LABEL_MISSING');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
