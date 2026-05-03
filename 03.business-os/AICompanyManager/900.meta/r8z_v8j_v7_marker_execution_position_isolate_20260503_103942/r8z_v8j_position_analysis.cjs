const fs = require('fs');

const corePath = process.argv[2];
const positionOut = process.argv[3];
const v7BlockOut = process.argv[4];
const markerBlockOut = process.argv[5];
const hydrateBlocksOut = process.argv[6];

const src = fs.readFileSync(corePath, 'utf8');
const lines = src.split(/\r?\n/);

function lineOf(pos) {
  return src.slice(0, pos).split(/\r?\n/).length;
}

function lineText(lineNo) {
  return lines[lineNo - 1] || '';
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findFunctionAtOrBefore(pos) {
  const before = src.slice(0, pos);
  const candidates = [];

  const patterns = [
    /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g,
    /window\.([A-Za-z_$][\w$]*)\s*=\s*function\b/g,
    /\b([A-Za-z_$][\w$]*)\s*=\s*function\b/g
  ];

  for (const p of patterns) {
    let m;
    while ((m = p.exec(before))) {
      candidates.push({
        name: m[1],
        index: m.index,
        line: lineOf(m.index),
        sig: before.slice(m.index, Math.min(before.length, m.index + 160)).split(/\r?\n/)[0]
      });
    }
  }

  candidates.sort((a,b) => b.index - a.index);
  return candidates[0] || null;
}

function findFunctionBlockByStart(start) {
  if (start < 0) return null;

  const brace = src.indexOf('{', start);
  if (brace < 0) return null;

  let depth = 0;
  let inStr = '';
  let esc = false;

  for (let i = brace; i < src.length; i++) {
    const ch = src[i];

    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = '';
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          start,
          brace,
          end: i + 1,
          startLine: lineOf(start),
          endLine: lineOf(i + 1),
          text: src.slice(start, i + 1)
        };
      }
    }
  }

  return null;
}

function findNamedBlocks(name) {
  const starts = [];
  const patterns = [
    new RegExp('function\\s+' + escapeRegExp(name) + '\\s*\\(', 'g'),
    new RegExp('window\\.' + escapeRegExp(name) + '\\s*=\\s*function\\b', 'g')
  ];

  for (const p of patterns) {
    let m;
    while ((m = p.exec(src))) {
      starts.push(m.index);
    }
  }

  return starts.map(findFunctionBlockByStart).filter(Boolean);
}

function findAllHydrateBlocks() {
  const starts = [];
  const p = /\bfunction\s+hydrateIfNeeded\s*\(/g;
  let m;
  while ((m = p.exec(src))) starts.push(m.index);

  return starts.map(findFunctionBlockByStart).filter(Boolean);
}

function numbered(block) {
  if (!block) return '';
  return `===== L${block.startLine}-L${block.endLine} =====\n` +
    block.text.split(/\r?\n/).map((line, idx) =>
      String(block.startLine + idx).padStart(6, ' ') + ': ' + line
    ).join('\n') + '\n';
}

function around(pos, before = 45, after = 65) {
  const line = lineOf(pos);
  const start = Math.max(1, line - before);
  const end = Math.min(lines.length, line + after);
  const out = [];
  out.push(`===== around L${line}, range L${start}-L${end} =====`);
  for (let n = start; n <= end; n++) {
    out.push(String(n).padStart(6, ' ') + ': ' + lineText(n));
  }
  return out.join('\n') + '\n';
}

const v7RenderBlocks = findNamedBlocks('aicmR8zV7RenderReviewList');
const allHydrateBlocks = findAllHydrateBlocks();

const v8gPos = src.indexOf('AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE');
const v8hPos = src.indexOf('AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER');

const v8gFunction = v8gPos >= 0 ? findFunctionAtOrBefore(v8gPos) : null;
const v8hFunction = v8hPos >= 0 ? findFunctionAtOrBefore(v8hPos) : null;

let activeHydrateCandidate = null;
let activeHydrateIndex = -1;

if (v7RenderBlocks.length > 0) {
  const rb = v7RenderBlocks[0];
  // V7 renderer calls hydrateIfNeeded lexically. The active one should be the nearest hydrateIfNeeded before renderer start
  // in the same closure region.
  for (let i = 0; i < allHydrateBlocks.length; i++) {
    const hb = allHydrateBlocks[i];
    if (hb.start < rb.start) {
      activeHydrateCandidate = hb;
      activeHydrateIndex = i;
    }
  }
}

const hydrateSummaries = allHydrateBlocks.map((b, idx) => ({
  idx,
  startLine: b.startLine,
  endLine: b.endLine,
  hasV7Fetch: /r8z_v7_|aicmR8zV7Hydrating/.test(b.text),
  hasV8G: /AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE/.test(b.text),
  hasV8H: /AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER/.test(b.text),
  hasReviewMergeCall: /aicmR8zV8gMergeReviewWaitItemsFromPayload/.test(b.text),
  hasSetFalse: /aicmR8zV7Hydrating\s*=\s*false/.test(b.text),
  hasRenderCall: /render\s*\(|aicmRender\s*\(|window\.aicmRender/.test(b.text),
  firstLine: src.slice(b.start, Math.min(src.length, b.start + 180)).split(/\r?\n/)[0]
}));

const activeSummary = activeHydrateCandidate ? hydrateSummaries[activeHydrateIndex] : null;

const position = [];
position.push(`v7_render_block_count=${v7RenderBlocks.length}`);
position.push(`hydrate_if_needed_count=${allHydrateBlocks.length}`);
position.push(`v8g_marker_pos=${v8gPos}`);
position.push(`v8g_marker_line=${v8gPos >= 0 ? lineOf(v8gPos) : -1}`);
position.push(`v8h_marker_pos=${v8hPos}`);
position.push(`v8h_marker_line=${v8hPos >= 0 ? lineOf(v8hPos) : -1}`);
position.push(`v8g_parent_function=${v8gFunction ? v8gFunction.name : ''}`);
position.push(`v8g_parent_line=${v8gFunction ? v8gFunction.line : -1}`);
position.push(`v8h_parent_function=${v8hFunction ? v8hFunction.name : ''}`);
position.push(`v8h_parent_line=${v8hFunction ? v8hFunction.line : -1}`);
position.push(`active_hydrate_index=${activeHydrateIndex}`);
position.push(`active_hydrate_start_line=${activeHydrateCandidate ? activeHydrateCandidate.startLine : -1}`);
position.push(`active_hydrate_end_line=${activeHydrateCandidate ? activeHydrateCandidate.endLine : -1}`);

if (activeSummary) {
  for (const [k, v] of Object.entries(activeSummary)) {
    position.push(`active_${k}=${v}`);
  }
}

hydrateSummaries.forEach((s) => {
  position.push(`hydrate_${s.idx}_range=L${s.startLine}-L${s.endLine}`);
  position.push(`hydrate_${s.idx}_hasV7Fetch=${s.hasV7Fetch}`);
  position.push(`hydrate_${s.idx}_hasV8G=${s.hasV8G}`);
  position.push(`hydrate_${s.idx}_hasV8H=${s.hasV8H}`);
  position.push(`hydrate_${s.idx}_hasReviewMergeCall=${s.hasReviewMergeCall}`);
  position.push(`hydrate_${s.idx}_hasSetFalse=${s.hasSetFalse}`);
  position.push(`hydrate_${s.idx}_hasRenderCall=${s.hasRenderCall}`);
});

position.push(`v8_markers_inside_active_hydrate=${!!(activeSummary && activeSummary.hasV8G && activeSummary.hasV8H)}`);
position.push(`active_hydrate_has_review_merge=${!!(activeSummary && activeSummary.hasReviewMergeCall)}`);
position.push(`active_hydrate_has_render=${!!(activeSummary && activeSummary.hasRenderCall)}`);

fs.writeFileSync(positionOut, position.join('\n') + '\n');

let v7Out = '';
v7RenderBlocks.forEach((b, idx) => {
  v7Out += `\n===== V7_RENDER_BLOCK_${idx} =====\n` + numbered(b);
});
if (activeHydrateCandidate) {
  v7Out += `\n===== ACTIVE_HYDRATE_CANDIDATE =====\n` + numbered(activeHydrateCandidate);
}
fs.writeFileSync(v7BlockOut, v7Out || 'NO_V7_BLOCK\n');

let markerOut = '';
if (v8gPos >= 0) markerOut += '\n===== V8G_MARKER_AROUND =====\n' + around(v8gPos);
if (v8hPos >= 0) markerOut += '\n===== V8H_MARKER_AROUND =====\n' + around(v8hPos);
fs.writeFileSync(markerBlockOut, markerOut || 'NO_MARKER_BLOCK\n');

let hydOut = '';
allHydrateBlocks.forEach((b, idx) => {
  hydOut += `\n===== HYDRATE_BLOCK_${idx} =====\n` + numbered(b);
});
fs.writeFileSync(hydrateBlocksOut, hydOut || 'NO_HYDRATE_BLOCKS\n');
