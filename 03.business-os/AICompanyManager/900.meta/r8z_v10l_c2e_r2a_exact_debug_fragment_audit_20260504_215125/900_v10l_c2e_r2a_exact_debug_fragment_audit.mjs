import fs from 'fs';

const [,, corePath, verifyOut, decisionOut, hitsOut, fragmentOut, functionOut] = process.argv;
const src = fs.readFileSync(corePath, 'utf8');
const lines = src.split(/\r?\n/);

const labels = [
  'C2D5R2A 課を適用 debug',
  'C2D7 handler entry debug'
];

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
    const ch = text[i], nx = text[i + 1];
    if (state === 'lineComment') { if (ch === '\n') state = 'normal'; continue; }
    if (state === 'blockComment') { if (ch === '*' && nx === '/') { state = 'normal'; i++; } continue; }
    if (state === 'single') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === "'") state = 'normal'; continue; }
    if (state === 'double') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '"') state = 'normal'; continue; }
    if (state === 'template') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '`') state = 'normal'; continue; }
    if (ch === '/' && nx === '/') { state = 'lineComment'; i++; continue; }
    if (ch === '/' && nx === '*') { state = 'blockComment'; i++; continue; }
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '"') { state = 'double'; continue; }
    if (ch === '`') { state = 'template'; continue; }
    if (ch === '{') return i;
  }
  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = 'normal';
  let escape = false;
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i], nx = text[i + 1];
    if (state === 'lineComment') { if (ch === '\n') state = 'normal'; continue; }
    if (state === 'blockComment') { if (ch === '*' && nx === '/') { state = 'normal'; i++; } continue; }
    if (state === 'single') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === "'") state = 'normal'; continue; }
    if (state === 'double') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '"') state = 'normal'; continue; }
    if (state === 'template') { if (escape) escape = false; else if (ch === '\\') escape = true; else if (ch === '`') state = 'normal'; continue; }
    if (ch === '/' && nx === '/') { state = 'lineComment'; i++; continue; }
    if (ch === '/' && nx === '*') { state = 'blockComment'; i++; continue; }
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '"') { state = 'double'; continue; }
    if (ch === '`') { state = 'template'; continue; }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function listFunctions(text) {
  const out = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const start = m.index;
    const open = findOpenBrace(text, start);
    if (open < 0) continue;
    const close = findMatchingBrace(text, open);
    if (close < 0) continue;
    out.push({
      name,
      start,
      open,
      close,
      startLine: lineNoAt(text, start),
      endLine: lineNoAt(text, close),
      text: text.slice(start, close + 1)
    });
  }
  return out;
}

function findNearestFunction(functions, idx) {
  return functions.find(f => f.start <= idx && idx <= f.close) || null;
}

function classifyLine(line) {
  const s = line.trim();

  if (s.startsWith("'") || s.startsWith('"') || s.startsWith('`')) return 'string-array-line';
  if (s.includes("push(") || s.includes(".push(")) return 'push-line';
  if (s.includes("return [")) return 'return-array';
  if (s.includes("join(")) return 'join-line';
  if (s.includes("<details") || s.includes("<section") || s.includes("<div")) return 'html-open-line';
  if (s.includes("</details>") || s.includes("</section>") || s.includes("</div>")) return 'html-close-line';
  return 'other';
}

function safeWindowAroundLine(lineNo, radius) {
  const start = Math.max(1, lineNo - radius);
  const end = Math.min(lines.length, lineNo + radius);
  const out = [];
  for (let i = start; i <= end; i++) {
    out.push(String(i).padStart(6, ' ') + ': ' + lines[i - 1]);
  }
  return { start, end, text: out.join('\n') };
}

const functions = listFunctions(src);
const hits = [];

for (const label of labels) {
  let from = 0;
  while (true) {
    const idx = src.indexOf(label, from);
    if (idx < 0) break;

    const lineNo = lineNoAt(src, idx);
    const fn = findNearestFunction(functions, idx);
    const lineText = lines[lineNo - 1] || '';

    hits.push({
      label,
      index: idx,
      lineNo,
      lineText,
      lineType: classifyLine(lineText),
      functionName: fn ? fn.name : 'NO_FUNCTION',
      functionLines: fn ? `${fn.startLine}-${fn.endLine}` : 'NO_FUNCTION'
    });

    from = idx + label.length;
  }
}

const grouped = new Map();
for (const h of hits) {
  const key = `${h.functionName}:${h.functionLines}`;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(h);
}

const hitText = [];
hitText.push('AICompanyManager V10L-C2E-R2A debug label hits');
hitText.push('DB_WRITE=NO');
hitText.push('API_POST=NO');
hitText.push('CORE_PATCH=NO');
hitText.push('');
for (const h of hits) {
  hitText.push(`label=${h.label}; line=${h.lineNo}; type=${h.lineType}; function=${h.functionName}; functionLines=${h.functionLines}`);
  hitText.push(`  lineText=${h.lineText}`);
}
fs.writeFileSync(hitsOut, hitText.join('\n') + '\n');

const fragText = [];
fragText.push('AICompanyManager V10L-C2E-R2A exact debug fragments');
fragText.push('DB_WRITE=NO');
fragText.push('API_POST=NO');
fragText.push('CORE_PATCH=NO');
fragText.push('');

for (const h of hits) {
  const win = safeWindowAroundLine(h.lineNo, 18);
  fragText.push('============================================================');
  fragText.push(`LABEL=${h.label}`);
  fragText.push(`LINE=${h.lineNo}`);
  fragText.push(`FUNCTION=${h.functionName}`);
  fragText.push(`WINDOW=${win.start}-${win.end}`);
  fragText.push('============================================================');
  fragText.push(win.text);
  fragText.push('');
}
fs.writeFileSync(fragmentOut, fragText.join('\n') + '\n');

const functionText = [];
functionText.push('AICompanyManager V10L-C2E-R2A debug function extracts');
functionText.push('DB_WRITE=NO');
functionText.push('API_POST=NO');
functionText.push('CORE_PATCH=NO');
functionText.push('');

for (const [key, hs] of grouped.entries()) {
  const [fnName, fnLines] = key.split(':');
  const fn = functions.find(f => f.name === fnName && `${f.startLine}-${f.endLine}` === fnLines);
  functionText.push('============================================================');
  functionText.push(`TARGET=${key}`);
  functionText.push(`HITS=${hs.map(h => h.label + '@L' + h.lineNo).join(', ')}`);
  functionText.push('============================================================');
  functionText.push(fn ? fn.text : 'FUNCTION_NOT_FOUND');
  functionText.push('');
}
fs.writeFileSync(functionOut, functionText.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2E-R2A verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('CORE_PATCH=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('CORE_FUNCTION_COUNT=' + functions.length);
verify.push('C2D5_VISIBLE_LABEL_COUNT=' + count(src, 'C2D5R2A 課を適用 debug'));
verify.push('C2D7_VISIBLE_LABEL_COUNT=' + count(src, 'C2D7 handler entry debug'));
verify.push('DEBUG_HIT_COUNT=' + hits.length);
verify.push('DEBUG_RENDER_FUNCTION_GROUP_COUNT=' + grouped.size);
verify.push('ALL_HITS_IN_STRING_ARRAY_LINES=' + (hits.every(h => h.lineType === 'string-array-line') ? 'YES' : 'NO'));
verify.push('HITS_OUT=' + hitsOut);
verify.push('FRAGMENT_OUT=' + fragmentOut);
verify.push('FUNCTION_OUT=' + functionOut);
fs.writeFileSync(verifyOut, verify.join('\n') + '\n');

const decision = [];
decision.push('AICompanyManager V10L-C2E-R2A decision');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('CORE_PATCH=NO');
decision.push('SERVER_PATCH=NO');
decision.push('');
decision.push('CONCLUSION=EXACT_DEBUG_FRAGMENTS_EXTRACTED_PATCH_NOT_APPLIED');
decision.push('DEBUG_RENDER_FUNCTION_GROUP_COUNT=' + grouped.size);
decision.push('ALL_HITS_IN_STRING_ARRAY_LINES=' + (hits.every(h => h.lineType === 'string-array-line') ? 'YES' : 'NO'));
decision.push('');
decision.push('TARGET_GROUPS');
for (const [key, hs] of grouped.entries()) {
  decision.push(`- ${key}: ${hs.map(h => h.label + '@L' + h.lineNo + '[' + h.lineType + ']').join(', ')}`);
}
decision.push('');
decision.push('NEXT_POLICY');
decision.push('- R2Bでは広範囲regex削除禁止');
decision.push('- 060_debug_function_extracts.txtを見て、debug表示用の配列要素だけを削る');
decision.push('- 関数名/関数宣言/閉じ括弧は絶対に触らない');
decision.push('- node --check失敗時は即restore');
decision.push('- DB/API/server routeは触らない');

fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
