import fs from 'fs';

const [,, corePath, contextPath, decisionPath] = process.argv;

const src = fs.readFileSync(corePath, 'utf8');
const lines = src.split(/\r?\n/);

const patterns = [
  'MANAGER大項目 #',
  '登録済み大項目',
  '前ページ',
  '次ページ',
  '課長へ送る',
  '削除',
  'data-core-action="pmlw-major-leader-handoff"',
  'data-core-action="pmlw-major-delete"',
  'managerMajorDeleteConfirm'
];

function includesAny(line) {
  return patterns.some(p => line.includes(p));
}

function findHits() {
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (includesAny(lines[i])) hits.push(i + 1);
  }
  return hits;
}

function nearestAbove(lineNo, re, maxBack = 220) {
  const start = Math.max(1, lineNo - maxBack);
  for (let i = lineNo; i >= start; i--) {
    if (re.test(lines[i - 1])) return { line: i, text: lines[i - 1] };
  }
  return null;
}

function contextAround(lineNo, radius = 70) {
  const start = Math.max(1, lineNo - radius);
  const end = Math.min(lines.length, lineNo + radius);
  const out = [];

  out.push(`----- HIT_CONTEXT line=${lineNo} -----`);
  out.push(`nearest function: ${JSON.stringify(nearestAbove(lineNo, /^\s*(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/, 260))}`);
  out.push(`nearest const/let/var function: ${JSON.stringify(nearestAbove(lineNo, /^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/, 260))}`);
  out.push(`nearest return array: ${JSON.stringify(nearestAbove(lineNo, /^\s*return\s+\[/, 160))}`);
  out.push(`nearest map: ${JSON.stringify(nearestAbove(lineNo, /\.map\s*\(|rows\s*\.\s*map/, 160))}`);
  out.push('');

  for (let i = start; i <= end; i++) {
    const marker = i === lineNo ? '>>>' : '   ';
    out.push(`${marker} ${String(i).padStart(6, ' ')}: ${lines[i - 1]}`);
  }

  out.push('');
  return out.join('\n');
}

const hits = findHits();
const uniqueWindows = [];
const used = new Set();

for (const lineNo of hits) {
  const bucket = Math.floor(lineNo / 120);
  if (used.has(bucket)) continue;
  used.add(bucket);
  uniqueWindows.push(lineNo);
}

const contextOut = [];
contextOut.push('AICompanyManager V10L-C1D2 exact active card block context');
contextOut.push('PATCH=NO');
contextOut.push('DB_WRITE=NO');
contextOut.push('API_POST=NO');
contextOut.push('SERVER_RESTART=NO');
contextOut.push('');
contextOut.push(`HIT_COUNT=${hits.length}`);
contextOut.push(`WINDOW_COUNT=${uniqueWindows.length}`);
contextOut.push('');

for (const lineNo of uniqueWindows) {
  contextOut.push(contextAround(lineNo, 85));
}

fs.writeFileSync(contextPath, contextOut.join('\n') + '\n');

const scored = [];

for (const lineNo of uniqueWindows) {
  const start = Math.max(1, lineNo - 120);
  const end = Math.min(lines.length, lineNo + 120);
  const block = lines.slice(start - 1, end).join('\n');

  let score = 0;
  const reasons = [];

  function add(cond, points, reason) {
    if (cond) {
      score += points;
      reasons.push(reason);
    }
  }

  add(block.includes('MANAGER大項目 #'), 40, 'HAS_SCREENSHOT_CARD_LABEL');
  add(block.includes('登録済み大項目'), 25, 'HAS_REGISTERED_MAJOR_TITLE');
  add(block.includes('前ページ') || block.includes('次ページ'), 20, 'HAS_PAGING');
  add(block.includes('課長へ送る'), 20, 'HAS_HANDOFF_BUTTON');
  add(block.includes('削除'), 20, 'HAS_DELETE_BUTTON');
  add(block.includes('data-core-action="pmlw-major-leader-handoff"'), 25, 'HAS_OLD_HANDOFF_ACTION');
  add(block.includes('data-core-action="pmlw-major-delete"'), 25, 'HAS_OLD_DELETE_ACTION');
  add(block.includes('aicm-core-card'), 15, 'HAS_CARD_CLASS');
  add(/\.map\s*\(|rows\s*\.\s*map/.test(block), 15, 'HAS_MAP');
  add(/slice\s*\(|page|pageSize|offset|limit/i.test(block), 10, 'HAS_PAGING_LOGIC');

  scored.push({
    lineNo,
    start,
    end,
    score,
    reasons,
    nearestFunction: nearestAbove(lineNo, /^\s*(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/, 260),
    nearestAssignedFunction: nearestAbove(lineNo, /^\s*(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*(?:async\s*)?(?:function|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/, 260),
    nearestReturnArray: nearestAbove(lineNo, /^\s*return\s+\[/, 160),
    nearestMap: nearestAbove(lineNo, /\.map\s*\(|rows\s*\.\s*map/, 160)
  });
}

scored.sort((a, b) => b.score - a.score);

const best = scored[0];

const decision = [];
decision.push('AICompanyManager V10L-C1D2 card block patch target decision');
decision.push('PATCH=NO');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('SERVER_RESTART=NO');
decision.push('');
decision.push('IMPORTANT=前回の ACTIVE_CARD_RENDERER_CANDIDATE=h は広すぎるため、そのままpatch禁止。');
decision.push('');
decision.push('RANKING');
for (const s of scored.slice(0, 10)) {
  decision.push(`- hitLine=${s.lineNo}; window=${s.start}-${s.end}; score=${s.score}; reasons=${s.reasons.join(',')}; nearestFunction=${s.nearestFunction ? s.nearestFunction.text.trim() + ' @L' + s.nearestFunction.line : 'none'}; nearestAssignedFunction=${s.nearestAssignedFunction ? s.nearestAssignedFunction.text.trim() + ' @L' + s.nearestAssignedFunction.line : 'none'}; nearestReturnArray=${s.nearestReturnArray ? 'L' + s.nearestReturnArray.line : 'none'}; nearestMap=${s.nearestMap ? 'L' + s.nearestMap.line : 'none'}`);
}
decision.push('');
decision.push(`PATCH_WINDOW=${best ? best.start + '-' + best.end : 'UNKNOWN'}`);
decision.push(`PATCH_ANCHOR_LINE=${best ? best.lineNo : 'UNKNOWN'}`);
decision.push(`PATCH_NEAREST_FUNCTION=${best && best.nearestFunction ? best.nearestFunction.text.trim() + ' @L' + best.nearestFunction.line : 'UNKNOWN'}`);
decision.push(`PATCH_NEAREST_ASSIGNED_FUNCTION=${best && best.nearestAssignedFunction ? best.nearestAssignedFunction.text.trim() + ' @L' + best.nearestAssignedFunction.line : 'UNKNOWN'}`);
decision.push(`PATCH_NEAREST_RETURN_ARRAY=${best && best.nearestReturnArray ? 'L' + best.nearestReturnArray.line : 'UNKNOWN'}`);
decision.push(`PATCH_NEAREST_MAP=${best && best.nearestMap ? 'L' + best.nearestMap.line : 'UNKNOWN'}`);
decision.push('');
decision.push('NEXT_POLICY');
decision.push('- 次は PATCH_WINDOW の中だけを対象にする');
decision.push('- 関数名 h 全体を丸ごと置換しない');
decision.push('- 個別 課長へ送る / 削除 のHTML行を特定して消す');
decision.push('- カード先頭またはタイトル直前にcheckboxを入れる');
decision.push('- 登録済み大項目タイトル直下に集約操作パネルを入れる');
decision.push('- DB/API/server route は触らない');
decision.push('');
decision.push(`CONTEXT_FILE=${contextPath}`);

fs.writeFileSync(decisionPath, decision.join('\n') + '\n');
