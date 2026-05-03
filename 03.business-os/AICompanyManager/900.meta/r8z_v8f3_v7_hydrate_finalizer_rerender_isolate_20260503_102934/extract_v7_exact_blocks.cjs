const fs = require('fs');

const corePath = process.argv[2];
const outHydrate = process.argv[3];
const outRender = process.argv[4];
const outNormalize = process.argv[5];
const outAnalysis = process.argv[6];

const src = fs.readFileSync(corePath, 'utf8');
const lines = src.split(/\r?\n/);

function lineOf(pos) {
  return src.slice(0, pos).split(/\r?\n/).length;
}

function extractFunctionByName(name) {
  const patterns = [
    new RegExp('function\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\('),
    new RegExp('window\\.' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*function')
  ];

  let start = -1;

  for (const p of patterns) {
    const m = src.match(p);
    if (m && typeof m.index === 'number') {
      start = m.index;
      break;
    }
  }

  if (start < 0) return '';

  const brace = src.indexOf('{', start);
  if (brace < 0) return src.slice(start, start + 3000);

  let depth = 0;
  let inStr = '';
  let esc = false;
  let end = -1;

  for (let i = brace; i < src.length; i++) {
    const ch = src[i];

    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (ch === inStr) {
        inStr = '';
      }
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
        end = i + 1;
        break;
      }
    }
  }

  if (end < 0) end = Math.min(src.length, start + 8000);

  let suffixEnd = end;
  while (suffixEnd < src.length && /[\s;)]/.test(src[suffixEnd])) suffixEnd += 1;

  const block = src.slice(start, suffixEnd);
  const startLine = lineOf(start);
  const endLine = lineOf(suffixEnd);

  return `===== ${name} L${startLine}-L${endLine} =====\n` +
    block.split(/\r?\n/).map((line, idx) =>
      String(startLine + idx).padStart(6, ' ') + ': ' + line
    ).join('\n') + '\n';
}

function extractAroundPattern(pattern, before, after) {
  const out = [];
  const hit = new Set();

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      for (let j = Math.max(0, i - before); j <= Math.min(lines.length - 1, i + after); j++) {
        hit.add(j);
      }
    }
  }

  const sorted = [...hit].sort((a,b) => a-b);
  let prev = -99;

  for (const n of sorted) {
    if (prev !== -99 && n !== prev + 1) out.push('');
    out.push(String(n + 1).padStart(6, ' ') + ': ' + lines[n]);
    prev = n;
  }

  return out.join('\n') + '\n';
}

const hydrateBlock =
  extractFunctionByName('hydrateIfNeeded') ||
  extractAroundPattern(/function hydrateIfNeeded|aicmR8zV7Hydrating|r8z_v7_/, 35, 85);

const renderBlock =
  extractFunctionByName('aicmR8zV7RenderReviewList') ||
  extractAroundPattern(/aicmR8zV7RenderReviewList/, 35, 90);

const normalizeBlock =
  extractFunctionByName('normalize') +
  '\n' +
  extractFunctionByName('rows') +
  '\n' +
  extractFunctionByName('ctx') +
  '\n' +
  extractAroundPattern(/ctx\.review_wait_items|appState\.review_wait_items|reviewWaitItems|human_review_wait_items/, 18, 28);

fs.writeFileSync(outHydrate, hydrateBlock);
fs.writeFileSync(outRender, renderBlock);
fs.writeFileSync(outNormalize, normalizeBlock);

function has(re) { return re.test(hydrateBlock); }

const analysis = [];
analysis.push(`hydrate_block_length=${hydrateBlock.length}`);
analysis.push(`render_block_length=${renderBlock.length}`);
analysis.push(`normalize_block_length=${normalizeBlock.length}`);

analysis.push(`hydrate_has_fetch=${has(/fetch\s*\(/)}`);
analysis.push(`hydrate_has_then=${has(/\.then\s*\(/)}`);
analysis.push(`hydrate_has_catch=${has(/\.catch\s*\(/)}`);
analysis.push(`hydrate_has_finally=${has(/\.finally\s*\(/)}`);
analysis.push(`hydrate_sets_true=${has(/aicmR8zV7Hydrating\s*=\s*true/)}`);
analysis.push(`hydrate_sets_false=${has(/aicmR8zV7Hydrating\s*=\s*false/)}`);

analysis.push(`hydrate_assigns_context_payload=${has(/appState\.context\s*=\s*payload|state\.context\s*=\s*payload|appState\.context\s*=\s*ctx|state\.context\s*=\s*ctx/)}`);
analysis.push(`hydrate_assigns_review_rows=${has(/appState\.review_wait_items\s*=|state\.review_wait_items\s*=|ctx\.review_wait_items\s*=/)}`);
analysis.push(`hydrate_reads_payload_review=${has(/payload\.review_wait_items|payload\["review_wait_items"\]|review_wait_items/)}`);

analysis.push(`hydrate_calls_render_function=${has(/render\s*\(|aicmRender\s*\(|window\.aicmRender/)}`);
analysis.push(`hydrate_uses_window_aicmRender_only=${has(/window\.aicmRender/) && !has(/render\s*\(\s*\)/)}`);
analysis.push(`hydrate_has_hydrating_false_before_render=${/aicmR8zV7Hydrating\s*=\s*false[\s\S]{0,500}(render\s*\(|aicmRender\s*\(|window\.aicmRender)/.test(hydrateBlock)}`);
analysis.push(`hydrate_has_return_after_loadContext=${has(/loadContext[\s\S]{0,300}return/)}`);

analysis.push(`render_calls_hydrate_if_needed=${/hydrateIfNeeded\s*\(/.test(renderBlock)}`);
analysis.push(`render_computes_list_before_hydrate=${/var\s+list\s*=\s*rows\s*\(appState\)[\s\S]{0,300}hydrateIfNeeded/.test(renderBlock)}`);
analysis.push(`render_recomputes_list_after_hydrate=${/hydrateIfNeeded[\s\S]{0,300}var\s+list\s*=/.test(renderBlock)}`);
analysis.push(`normalize_writes_state_review=${/state\.review_wait_items\s*=|appState\.review_wait_items\s*=|ctx\.review_wait_items\s*=/.test(normalizeBlock)}`);

fs.writeFileSync(outAnalysis, analysis.join('\n') + '\n');
