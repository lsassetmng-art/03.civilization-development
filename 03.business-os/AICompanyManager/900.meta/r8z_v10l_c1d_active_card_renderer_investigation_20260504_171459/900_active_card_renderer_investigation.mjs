import fs from 'fs';

const [,, corePath, hitsOut, candidatesOut, extractOut, decisionOut] = process.argv;
const src = fs.readFileSync(corePath, 'utf8');

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
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
      i++;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
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

  for (let i = openIndex; i < text.length; i++) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i++;
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
      i++;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i++;
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

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function allFunctions(text) {
  const out = [];
  const re = /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let m;

  while ((m = re.exec(text))) {
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

const funcs = allFunctions(src);

const visualPatterns = [
  'MANAGER大項目 #',
  'MANAGER大項目',
  '登録済み大項目',
  '前ページ',
  '次ページ',
  '表示 1-20',
  '課長へ送る',
  '削除',
  'data-core-action="pmlw-major-leader-handoff"',
  'data-core-action="pmlw-major-delete"',
  'managerMajorDeleteConfirm',
  'aicm-core-card',
  'aicm-dashboard-action-row'
];

const hitLines = [];
hitLines.push('AICompanyManager V10L-C1D visual label hits');
hitLines.push('PATCH=NO');
hitLines.push('DB_WRITE=NO');
hitLines.push('API_POST=NO');
hitLines.push('');

const lines = src.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  for (const p of visualPatterns) {
    if (lines[i].includes(p)) {
      hitLines.push(`line=${i + 1} pattern=${p}`);
      hitLines.push(lines[i]);
      hitLines.push('');
      break;
    }
  }
}
fs.writeFileSync(hitsOut, hitLines.join('\n') + '\n');

function scoreFunction(fn) {
  const t = fn.text;

  let score = 0;
  const reasons = [];

  function add(points, label, cond) {
    if (cond) {
      score += points;
      reasons.push(label);
    }
  }

  add(40, 'HAS_MANAGER_CARD_LABEL_HASH', t.includes('MANAGER大項目 #'));
  add(30, 'HAS_MANAGER_MAJOR_LABEL', t.includes('MANAGER大項目'));
  add(30, 'HAS_REGISTERED_MAJOR_TITLE', t.includes('登録済み大項目'));
  add(20, 'HAS_PREV_NEXT_PAGING', t.includes('前ページ') || t.includes('次ページ'));
  add(20, 'HAS_OLD_HANDOFF_BUTTON', t.includes('data-core-action="pmlw-major-leader-handoff"') || t.includes('課長へ送る'));
  add(20, 'HAS_DELETE_BUTTON', t.includes('削除') || t.includes('managerMajorDeleteConfirm'));
  add(15, 'HAS_CARD_CLASS', t.includes('aicm-core-card'));
  add(15, 'HAS_ACTION_ROW', t.includes('aicm-dashboard-action-row'));
  add(15, 'HAS_ROWS_MAP_OR_MAP', /rows\s*\.\s*map|\.map\s*\(/.test(t));
  add(10, 'HAS_PAGINATION_MATH', /page|offset|limit|slice/i.test(t));
  add(10, 'HAS_MAJOR_ID', /major.*id|pmlw.*major|manager.*major/i.test(t));
  add(-20, 'IS_OLD_TABLE_RENDERER', fn.name === 'renderPmlwMajorRowsBaseAxuR1B');

  return {
    name: fn.name,
    startLine: fn.startLine,
    endLine: fn.endLine,
    score,
    reasons,
    counts: {
      managerHash: count(t, 'MANAGER大項目 #'),
      managerLabel: count(t, 'MANAGER大項目'),
      registered: count(t, '登録済み大項目'),
      handoff: count(t, '課長へ送る'),
      delete: count(t, '削除'),
      oldHandoffAction: count(t, 'data-core-action="pmlw-major-leader-handoff"'),
      card: count(t, 'aicm-core-card'),
      checkbox: count(t, 'type="checkbox"')
    },
    text: t
  };
}

const ranked = funcs
  .map(scoreFunction)
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

const candLines = [];
candLines.push('AICompanyManager V10L-C1D active card renderer candidates');
candLines.push('PATCH=NO');
candLines.push('DB_WRITE=NO');
candLines.push('API_POST=NO');
candLines.push('');
ranked.slice(0, 12).forEach(c => {
  candLines.push(`- ${c.name}: score=${c.score}; lines=${c.startLine}-${c.endLine}; reasons=${c.reasons.join(',')}; counts=${JSON.stringify(c.counts)}`);
});
fs.writeFileSync(candidatesOut, candLines.join('\n') + '\n');

const extractLines = [];
extractLines.push('AICompanyManager V10L-C1D active card renderer extracts');
extractLines.push('PATCH=NO');
extractLines.push('DB_WRITE=NO');
extractLines.push('API_POST=NO');
extractLines.push('');

ranked.slice(0, 5).forEach(c => {
  extractLines.push('============================================================');
  extractLines.push(`FUNCTION=${c.name}`);
  extractLines.push(`SCORE=${c.score}`);
  extractLines.push(`LINES=${c.startLine}-${c.endLine}`);
  extractLines.push(`REASONS=${c.reasons.join(',')}`);
  extractLines.push('------------------------------------------------------------');
  extractLines.push(c.text);
  extractLines.push('');
});
fs.writeFileSync(extractOut, extractLines.join('\n') + '\n');

const best = ranked[0];

const decision = [];
decision.push('AICompanyManager V10L-C1D active card renderer decision');
decision.push('PATCH=NO');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('SERVER_RESTART=NO');
decision.push('');
decision.push('SCREENSHOT_OBSERVATION=現在表示は表ではなくカードUI。MANAGER大項目 #n / 個別「課長へ送る」「削除」ボタンが残っている。');
decision.push('PREVIOUS_PATCH_RESULT=renderPmlwMajorRowsBaseAxuR1B は実表示経路ではなかった可能性が高い。');
decision.push('');
decision.push(`ACTIVE_CARD_RENDERER_CANDIDATE=${best ? best.name : 'UNKNOWN'}`);
decision.push(`ACTIVE_CARD_RENDERER_LINES=${best ? best.startLine + '-' + best.endLine : 'UNKNOWN'}`);
decision.push(`ACTIVE_CARD_RENDERER_SCORE=${best ? best.score : 0}`);
decision.push(`ACTIVE_CARD_RENDERER_REASONS=${best ? best.reasons.join(',') : 'none'}`);
decision.push('');
decision.push('NEXT_POLICY');
decision.push('- 次工程では ACTIVE_CARD_RENDERER_CANDIDATE だけを最小差分修正する');
decision.push('- DOM後付け探索はしない');
decision.push('- server/API/DB route は触らない');
decision.push('- 個別「課長へ送る」「削除」をカード内から消す');
decision.push('- 登録済み大項目の一番上に集約操作パネルを出す');
decision.push('- 各カードにcheckboxを出す');
decision.push('- Yes/No確認はDB/APIなしの画面制御だけ');
decision.push('');
decision.push('FILES_TO_REVIEW');
decision.push(`- ${candidatesOut}`);
decision.push(`- ${extractOut}`);
fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
