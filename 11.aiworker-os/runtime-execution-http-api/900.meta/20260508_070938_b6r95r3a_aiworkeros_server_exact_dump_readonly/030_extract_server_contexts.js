const fs = require('fs');

const serverPath = process.argv[2];
const outContexts = process.argv[3];
const outFunctions = process.argv[4];
const outRouteMap = process.argv[5];
const outAnchors = process.argv[6];

const src = fs.readFileSync(serverPath, 'utf8');
const lines = src.split(/\r?\n/);

const patterns = [
  '/aiworker/v1/runtime-execution/request',
  'fn_runtime_execution_create_request_with_route_v1',
  'fn_runtime_execution_submit_worker_output',
  'fn_runtime_execution_mark_delivery_ready',
  'REQUESTED_INTERNAL_ONLY',
  'accepted',
  'app-read-payload',
  'pipeline-board',
  'delivery',
  'runtime_worker_output',
  'runtime_output_artifact',
  'runtime_delivery_package',
  'buildRuntimeBrainContext',
  'renderPromptBrainContext',
  'request_status_code',
  'result_summary_text',
  'delivery_summary_text',
  'payload',
  'response'
];

function contextFor(pattern, radius = 35) {
  const lowerPattern = pattern.toLowerCase();
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lowerPattern)) hits.push(i);
  }
  const chunks = [];
  for (const hit of hits) {
    const start = Math.max(0, hit - radius);
    const end = Math.min(lines.length - 1, hit + radius);
    chunks.push({ pattern, hit: hit + 1, start: start + 1, end: end + 1 });
  }
  return chunks;
}

let contexts = '';
for (const p of patterns) {
  contexts += `\n============================================================\nPATTERN=${p}\n============================================================\n`;
  const chunks = contextFor(p);
  if (chunks.length === 0) {
    contexts += 'NO_HIT\n';
    continue;
  }
  for (const c of chunks) {
    contexts += `\n--- HIT line=${c.hit} window=${c.start}-${c.end} ---\n`;
    for (let i = c.start - 1; i <= c.end - 1; i++) {
      contexts += `${String(i + 1).padStart(6, ' ')}: ${lines[i]}\n`;
    }
  }
}
fs.writeFileSync(outContexts, contexts);

function findFunctionStartAround(lineIndex) {
  for (let i = lineIndex; i >= Math.max(0, lineIndex - 80); i--) {
    const s = lines[i];
    if (/^\s*(async\s+)?function\s+[A-Za-z0-9_$]+\s*\(/.test(s)) return i;
    if (/^\s*const\s+[A-Za-z0-9_$]+\s*=\s*(async\s*)?\(/.test(s)) return i;
    if (/^\s*const\s+[A-Za-z0-9_$]+\s*=\s*async\s+function/.test(s)) return i;
    if (/^\s*[A-Za-z0-9_$]+\s*:\s*(async\s*)?\(/.test(s)) return i;
  }
  return Math.max(0, lineIndex - 40);
}

function findBlockEnd(start) {
  let depth = 0;
  let seenBrace = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') { depth++; seenBrace = true; }
      if (ch === '}') depth--;
    }
    if (seenBrace && depth <= 0 && i > start) return i;
    if (i - start > 260) return i;
  }
  return Math.min(lines.length - 1, start + 160);
}

let functionBlocks = '';
const functionTargetPatterns = [
  '/aiworker/v1/runtime-execution/request',
  'fn_runtime_execution_create_request_with_route_v1',
  'REQUESTED_INTERNAL_ONLY',
  'accepted',
  'pipeline-board',
  'app-read-payload'
];

const emitted = new Set();
for (const p of functionTargetPatterns) {
  const lower = p.toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].toLowerCase().includes(lower)) continue;
    const start = findFunctionStartAround(i);
    const end = findBlockEnd(start);
    const key = `${start}:${end}`;
    if (emitted.has(key)) continue;
    emitted.add(key);
    functionBlocks += `\n============================================================\nFUNCTION_BLOCK_FOR_PATTERN=${p}\nHIT_LINE=${i + 1}\nBLOCK=${start + 1}-${end + 1}\n============================================================\n`;
    for (let j = start; j <= end; j++) {
      functionBlocks += `${String(j + 1).padStart(6, ' ')}: ${lines[j]}\n`;
    }
  }
}
fs.writeFileSync(outFunctions, functionBlocks || 'NO_FUNCTION_BLOCKS_FOUND\n');

let routeMap = '';
for (let i = 0; i < lines.length; i++) {
  const s = lines[i];
  if (
    s.includes('url.pathname') ||
    s.includes('req.method') ||
    s.includes('/aiworker/') ||
    s.includes('/health') ||
    /case\s+['"`]\//.test(s)
  ) {
    routeMap += `${String(i + 1).padStart(6, ' ')}: ${s}\n`;
  }
}
fs.writeFileSync(outRouteMap, routeMap || 'NO_ROUTE_LINES_FOUND\n');

let anchors = '';
const anchorRegexes = [
  /fn_runtime_execution_create_request_with_route_v1/,
  /REQUESTED_INTERNAL_ONLY/,
  /result\s*:\s*['"`]accepted['"`]/,
  /accepted/i,
  /sendJson|writeHead|res\.end|return\s+json|return\s+send/i,
  /request_id/,
  /payload_jsonb|runtimePayload|requestPayload|payload/i
];

for (let i = 0; i < lines.length; i++) {
  for (const re of anchorRegexes) {
    if (re.test(lines[i])) {
      anchors += `${String(i + 1).padStart(6, ' ')}: ${lines[i]}\n`;
      break;
    }
  }
}
fs.writeFileSync(outAnchors, anchors || 'NO_ANCHORS_FOUND\n');
