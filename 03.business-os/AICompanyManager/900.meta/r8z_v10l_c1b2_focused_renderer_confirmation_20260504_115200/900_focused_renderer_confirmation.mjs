import fs from 'fs';

const [
  ,
  ,
  corePath,
  prevFunctionExtractPath,
  focusedContextPath,
  rowsMapContextPath,
  buttonContextPath,
  decisionOutPath
] = process.argv;

const core = fs.readFileSync(corePath, 'utf8');
const prevExtract = fs.readFileSync(prevFunctionExtractPath, 'utf8');

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
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

function findFunctionText(src, name) {
  const patterns = [
    new RegExp(`(?:async\\s+)?function\\s+${escRe(name)}\\s*\\(`, 'm'),
    new RegExp(`(?:const|let|var)\\s+${escRe(name)}\\s*=\\s*(?:async\\s*)?(?:function\\s*)?\\(`, 'm'),
    new RegExp(`${escRe(name)}\\s*[:=]\\s*(?:async\\s*)?function\\s*\\(`, 'm')
  ];

  for (const re of patterns) {
    const m = re.exec(src);
    if (!m) continue;

    const start = m.index;
    const open = findOpenBrace(src, start);
    const close = open >= 0 ? findMatchingBrace(src, open) : -1;

    return {
      name,
      found: true,
      start,
      startLine: lineNoAt(src, start),
      end: close,
      endLine: close >= 0 ? lineNoAt(src, close) : -1,
      text: close >= 0 ? src.slice(start, close + 1) : src.slice(start, Math.min(src.length, start + 15000))
    };
  }

  return {
    name,
    found: false,
    start: -1,
    startLine: -1,
    end: -1,
    endLine: -1,
    text: ''
  };
}

function countRe(text, re) {
  return (text.match(re) || []).length;
}

function contextAround(text, patterns, radius = 8) {
  const lines = text.split(/\r?\n/);
  const out = [];
  const used = new Set();

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        const start = Math.max(0, i - radius);
        const end = Math.min(lines.length - 1, i + radius);
        const key = `${start}-${end}`;
        if (used.has(key)) continue;
        used.add(key);

        out.push(`--- context around local line ${i + 1}: ${lines[i]}`);
        for (let j = start; j <= end; j++) {
          out.push(`${String(j + 1).padStart(5, ' ')}: ${lines[j]}`);
        }
        out.push('');
      }
    }
  }

  return out.join('\n') || 'NO_CONTEXT_HITS\n';
}

function classify(fn) {
  const text = fn.text || '';
  const callsRenderPmlw = /renderPmlwMajorRows\s*\(/.test(text);
  const callsBase = /renderPmlwMajorRowsBaseAxuR1B\s*\(/.test(text);
  const hasRowsMap = /rows\s*\.\s*map|\.map\s*\(\s*\(?\s*(row|item|major|r)\b/.test(text);
  const hasRegisteredMajorLabel = /登録済み大項目/.test(text);
  const hasSendLeaderLabel = /課長へ送る/.test(text);
  const hasDeleteLabel = /削除/.test(text);
  const hasButton = /<button|button|data-action|onclick|addEventListener/.test(text);
  const hasHtmlTemplate = /innerHTML|return\s+`|join\s*\(\s*['"`]{2}\s*\)|map\s*\(/.test(text);
  const hasIndividualActions = /課長へ送る|削除|send.*leader|delete|archive|handoff/i.test(text);

  let role = 'UNKNOWN';
  if (hasRowsMap && hasHtmlTemplate && (hasRegisteredMajorLabel || hasSendLeaderLabel || hasDeleteLabel)) {
    role = 'LIKELY_CARD_ROW_RENDERER';
  } else if ((callsRenderPmlw || callsBase) && !hasRowsMap) {
    role = 'LIKELY_WRAPPER_OR_SCREEN_RENDERER';
  } else if (callsRenderPmlw || callsBase) {
    role = 'MIXED_WRAPPER_AND_RENDERER';
  }

  let patchFitScore = 0;
  const reasons = [];

  const add = (cond, points, reason) => {
    if (cond) {
      patchFitScore += points;
      reasons.push(reason);
    }
  };

  add(hasRowsMap, 30, 'HAS_ROWS_MAP');
  add(hasHtmlTemplate, 20, 'HAS_HTML_TEMPLATE');
  add(hasRegisteredMajorLabel, 20, 'HAS_REGISTERED_MAJOR_LABEL');
  add(hasSendLeaderLabel, 15, 'HAS_SEND_LEADER_LABEL');
  add(hasDeleteLabel, 15, 'HAS_DELETE_LABEL');
  add(hasButton, 10, 'HAS_BUTTON_OR_ACTION');
  add(hasIndividualActions, 10, 'HAS_INDIVIDUAL_ACTIONS');
  add(callsRenderPmlw, -10, 'CALLS_RENDER_PMLW_MAJOR_ROWS');
  add(callsBase, -10, 'CALLS_BASE_RENDERER');

  return {
    name: fn.name,
    found: fn.found,
    startLine: fn.startLine,
    endLine: fn.endLine,
    length: text.length,
    role,
    patchFitScore,
    facts: {
      callsRenderPmlw,
      callsBase,
      hasRowsMap,
      hasRegisteredMajorLabel,
      hasSendLeaderLabel,
      hasDeleteLabel,
      hasButton,
      hasHtmlTemplate,
      hasIndividualActions,
      rowMapCount: countRe(text, /rows\s*\.\s*map/g),
      mapCount: countRe(text, /\.map\s*\(/g),
      buttonCount: countRe(text, /button|<button/g),
      sendLeaderLabelCount: countRe(text, /課長へ送る/g),
      deleteLabelCount: countRe(text, /削除/g)
    },
    reasons
  };
}

const candidates = [
  'aicmRenderTaskLedgerSafeR8V4',
  'renderPmlwMajorRows',
  'renderPmlwMajorRowsBaseAxuR1B',
  'aicmOpenTaskLedgerScreenR8V3Clean'
];

const functions = candidates.map(name => findFunctionText(core, name));
const classified = functions.map(classify).sort((a, b) => b.patchFitScore - a.patchFitScore);

const focused = [];
focused.push('AICompanyManager V10L-C1B2 focused renderer context');
focused.push('PATCH=NO');
focused.push('DB_WRITE=NO');
focused.push('API_POST=NO');
focused.push('SERVER_RESTART=NO');
focused.push('');

for (const fn of functions) {
  const c = classify(fn);
  focused.push('============================================================');
  focused.push(`FUNCTION=${fn.name}`);
  focused.push(`FOUND=${fn.found ? 'YES' : 'NO'}`);
  focused.push(`START_LINE=${fn.startLine}`);
  focused.push(`END_LINE=${fn.endLine}`);
  focused.push(`ROLE=${c.role}`);
  focused.push(`PATCH_FIT_SCORE=${c.patchFitScore}`);
  focused.push(`REASONS=${c.reasons.join(',') || 'none'}`);
  focused.push(`FACTS=${JSON.stringify(c.facts)}`);
  focused.push('------------------------------------------------------------');
  focused.push(contextAround(fn.text, [
    /登録済み大項目/,
    /rows\s*\.\s*map/,
    /\.map\s*\(/,
    /課長へ送る/,
    /削除/,
    /button|<button/,
    /innerHTML/,
    /data-action|onclick|addEventListener/
  ], 10));
  focused.push('');
}

fs.writeFileSync(focusedContextPath, focused.join('\n') + '\n');

const rowsOut = [];
rowsOut.push('AICompanyManager V10L-C1B2 rows.map focused context');
rowsOut.push('');
for (const fn of functions) {
  rowsOut.push('============================================================');
  rowsOut.push(`FUNCTION=${fn.name}`);
  rowsOut.push('------------------------------------------------------------');
  rowsOut.push(contextAround(fn.text, [
    /rows\s*\.\s*map/,
    /\.map\s*\(/,
    /majorRows/,
    /pmlwMajor/,
    /managerMajor/,
    /major_items/,
    /pmlw_major/
  ], 14));
  rowsOut.push('');
}
fs.writeFileSync(rowsMapContextPath, rowsOut.join('\n') + '\n');

const buttonOut = [];
buttonOut.push('AICompanyManager V10L-C1B2 button/action focused context');
buttonOut.push('');
for (const fn of functions) {
  buttonOut.push('============================================================');
  buttonOut.push(`FUNCTION=${fn.name}`);
  buttonOut.push('------------------------------------------------------------');
  buttonOut.push(contextAround(fn.text, [
    /課長へ送る/,
    /削除/,
    /button|<button/,
    /data-action/,
    /onclick/,
    /addEventListener/,
    /archive/i,
    /handoff/i,
    /leader/i,
    /delete/i
  ], 14));
  buttonOut.push('');
}
fs.writeFileSync(buttonContextPath, buttonOut.join('\n') + '\n');

const best = classified[0];

const decision = [];
decision.push('AICompanyManager V10L-C1B2 final renderer target decision');
decision.push('PATCH=NO');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('SERVER_RESTART=NO');
decision.push('');
decision.push('SATO_DB_REVIEW=DB作業なし。SQL/psql/PERSONA_DATABASE_URL未使用。DB_WRITE=NOを維持。');
decision.push('');
decision.push('RANKING_BY_PATCH_FIT');
for (const c of classified) {
  decision.push(`- ${c.name}: patchFitScore=${c.patchFitScore}; role=${c.role}; lines=${c.startLine}-${c.endLine}; reasons=${c.reasons.join(',') || 'none'}; facts=${JSON.stringify(c.facts)}`);
}
decision.push('');
decision.push(`PATCH_TARGET_CANDIDATE=${best ? best.name : 'UNKNOWN'}`);
decision.push(`PATCH_TARGET_ROLE=${best ? best.role : 'UNKNOWN'}`);
decision.push('');
decision.push('INTERPRETATION_RULE');
decision.push('- LIKELY_CARD_ROW_RENDERER が最優先。ここが実カード/行の生成元。');
decision.push('- aicmRenderTaskLedgerSafeR8V4 が上位でも、単なる画面全体レンダラーなら rows.map 実体を持つ関数を優先する。');
decision.push('- renderPmlwMajorRows が wrapper で BaseAxuR1B を呼ぶだけなら BaseAxuR1B を最小修正対象にする。');
decision.push('- BaseAxuR1B が実カード/行生成元なら、次工程では BaseAxuR1B 内だけを最小差分修正する。');
decision.push('');
decision.push('NEXT_PATCH_POLICY');
decision.push('- 次工程 V10L-C1B_MINIMAL_RENDERER_PATCH では PATCH_TARGET_CANDIDATE を目視確認してから使う。');
decision.push('- 操作パネルは登録済み大項目リスト直上にレンダーする。');
decision.push('- checkbox は同じ rows.map のカード/行内に出す。');
decision.push('- 個別「課長へ送る」「削除」はレンダー元から出さない。');
decision.push('- 全件選択は未送信分のみ。');
decision.push('- Yes/No確認は対象タイトル一覧のみ。');
decision.push('- Yes押下でもDB/APIは呼ばず、次の実行解放工程まで画面制御だけ。');
decision.push('- DOM後付け探索、setInterval、MutationObserver、新bridge、新server routeは禁止。');
fs.writeFileSync(decisionOutPath, decision.join('\n') + '\n');
