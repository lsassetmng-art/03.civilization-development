import fs from 'fs';

const [
  ,
  ,
  corePath,
  rendererPath,
  routePath,
  markersOut,
  rendererScan,
  routeScan,
  coreScan,
  functionExtract,
  decisionOut
] = process.argv;

function readText(path) {
  return fs.readFileSync(path, 'utf8');
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countOf(text, needle) {
  if (!needle) return 0;
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function lineMatches(text, patterns, radius = 4) {
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      const re = pattern instanceof RegExp ? pattern : new RegExp(escRe(pattern));
      if (re.test(lines[i])) {
        const start = Math.max(0, i - radius);
        const end = Math.min(lines.length - 1, i + radius);
        hits.push({
          pattern: String(pattern),
          line: i + 1,
          text: lines[i],
          context: lines.slice(start, end + 1).map((line, idx) => `${start + idx + 1}: ${line}`).join('\n')
        });
        break;
      }
    }
  }
  return hits;
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
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === "'") {
        state = 'normal';
      }
      continue;
    }

    if (state === 'double') {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        state = 'normal';
      }
      continue;
    }

    if (state === 'template') {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '`') {
        state = 'normal';
      }
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
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === "'") {
        state = 'normal';
      }
      continue;
    }

    if (state === 'double') {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        state = 'normal';
      }
      continue;
    }

    if (state === 'template') {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '`') {
        state = 'normal';
      }
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
    if (open < 0) {
      return {
        name,
        found: true,
        start,
        startLine: lineNoAt(src, start),
        end: -1,
        endLine: -1,
        text: src.slice(start, Math.min(src.length, start + 6000)),
        note: 'FOUND_START_BUT_OPEN_BRACE_NOT_FOUND'
      };
    }

    const close = findMatchingBrace(src, open);
    if (close < 0) {
      return {
        name,
        found: true,
        start,
        startLine: lineNoAt(src, start),
        end: -1,
        endLine: -1,
        text: src.slice(start, Math.min(src.length, start + 12000)),
        note: 'FOUND_START_BUT_CLOSE_BRACE_NOT_FOUND'
      };
    }

    return {
      name,
      found: true,
      start,
      startLine: lineNoAt(src, start),
      end: close,
      endLine: lineNoAt(src, close),
      text: src.slice(start, close + 1),
      note: 'FOUND_FUNCTION_BOUNDARY'
    };
  }

  return {
    name,
    found: false,
    start: -1,
    startLine: -1,
    end: -1,
    endLine: -1,
    text: '',
    note: 'NOT_FOUND'
  };
}

function scoreCandidate(name, functionText, rendererText, routeText, coreText) {
  const local = functionText || '';
  const relatedWhole = `${local}\n${rendererText}\n${routeText}`;

  let score = 0;
  const reasons = [];

  const checks = [
    ['HAS_ROWS_MAP', /rows\s*\.\s*map|forEach\s*\(|for\s*\(/, 20],
    ['HAS_MAJOR_LABEL', /登録済み大項目|大項目|major/i, 20],
    ['HAS_PMLW', /pmlw/i, 15],
    ['HAS_MANAGER_MAJOR', /manager.*major|major.*manager/i, 15],
    ['HAS_ROUTE_TO_LEADER_LABEL', /課長へ送る|leader|handoff/i, 15],
    ['HAS_DELETE_LABEL', /削除|delete|archive/i, 10],
    ['HAS_CARD_OR_ROW_RENDER', /card|row|list|item|innerHTML|template/i, 10],
    ['HAS_INDIVIDUAL_BUTTON_HINT', /button|onclick|addEventListener|data-action/i, 10],
    ['MENTIONED_IN_RENDERER_EXTRACT', new RegExp(escRe(name)), 15],
    ['MENTIONED_IN_ROUTE_EXTRACT', new RegExp(escRe(name)), 8]
  ];

  for (const [label, re, add] of checks) {
    const target = label.includes('ROUTE') ? routeText : label.includes('RENDERER') ? rendererText : relatedWhole;
    if (re.test(target)) {
      score += add;
      reasons.push(label);
    }
  }

  const coreCount = countOf(coreText, name);
  if (coreCount > 1) {
    score += Math.min(10, coreCount);
    reasons.push(`CORE_OCCURRENCE_${coreCount}`);
  }

  return { name, score, reasons };
}

const core = readText(corePath);
const renderer = readText(rendererPath);
const route = readText(routePath);

const markers = [
  'AICM_V10L_C1',
  'AICM_V10L_B1I',
  'AICM_V10L_B1J',
  'V10L_C1',
  'V10L_B1I',
  'V10L_B1J',
  'B1I_MARKER',
  'B1J_MARKER',
  'C1_MARKER'
];

const markerLines = [];
markerLines.push('AICompanyManager V10L-C1B marker count');
markerLines.push('PATCH=NO');
markerLines.push('DB_WRITE=NO');
markerLines.push('API_POST=NO');
markerLines.push('SERVER_RESTART=NO');
markerLines.push('');
for (const marker of markers) {
  markerLines.push(`${marker}=${countOf(core, marker)}`);
}
fs.writeFileSync(markersOut, markerLines.join('\n') + '\n');

const scanPatterns = [
  /renderPmlwMajorRowsBaseAxuR1B/,
  /renderPmlwMajorRows/,
  /aicmRenderTaskLedgerSafeR8V4/,
  /aicmOpenTaskLedgerScreenR8V3Clean/,
  /登録済み大項目/,
  /課長へ送る/,
  /削除/,
  /全件選択/,
  /解除/,
  /rows\s*\.\s*map/,
  /manager.*major/i,
  /pmlw.*major/i,
  /leader/i,
  /handoff/i,
  /archive/i,
  /delete/i
];

function writeHits(path, title, hits) {
  const out = [];
  out.push(title);
  out.push('='.repeat(title.length));
  out.push('');
  if (hits.length === 0) {
    out.push('NO_HITS');
  } else {
    for (const hit of hits) {
      out.push(`--- HIT line=${hit.line} pattern=${hit.pattern}`);
      out.push(hit.context);
      out.push('');
    }
  }
  fs.writeFileSync(path, out.join('\n') + '\n');
}

writeHits(rendererScan, 'Renderer extract scan', lineMatches(renderer, scanPatterns, 5));
writeHits(routeScan, 'Route/action extract scan', lineMatches(route, scanPatterns, 5));
writeHits(coreScan, 'Core candidate scan', lineMatches(core, scanPatterns, 4));

const candidates = [
  'renderPmlwMajorRowsBaseAxuR1B',
  'renderPmlwMajorRows',
  'aicmRenderTaskLedgerSafeR8V4',
  'aicmOpenTaskLedgerScreenR8V3Clean'
];

const functions = candidates.map(name => findFunctionText(core, name));
const scored = functions.map(fn => scoreCandidate(fn.name, fn.text, renderer, route, core))
  .sort((a, b) => b.score - a.score);

const fnOut = [];
fnOut.push('AICompanyManager V10L-C1B candidate function extracts');
fnOut.push('PATCH=NO');
fnOut.push('DB_WRITE=NO');
fnOut.push('API_POST=NO');
fnOut.push('SERVER_RESTART=NO');
fnOut.push('');
for (const fn of functions) {
  fnOut.push('============================================================');
  fnOut.push(`FUNCTION=${fn.name}`);
  fnOut.push(`FOUND=${fn.found ? 'YES' : 'NO'}`);
  fnOut.push(`START_LINE=${fn.startLine}`);
  fnOut.push(`END_LINE=${fn.endLine}`);
  fnOut.push(`NOTE=${fn.note}`);
  fnOut.push('------------------------------------------------------------');
  if (fn.text) {
    fnOut.push(fn.text);
  } else {
    fnOut.push('NO_FUNCTION_TEXT_EXTRACTED');
  }
  fnOut.push('');
}
fs.writeFileSync(functionExtract, fnOut.join('\n') + '\n');

const decision = [];
decision.push('AICompanyManager V10L-C1B renderer target decision draft');
decision.push('PATCH=NO');
decision.push('DB_WRITE=NO');
decision.push('API_POST=NO');
decision.push('SERVER_RESTART=NO');
decision.push('');
decision.push('SATO_DB_REVIEW=DB作業なし。SQL/psql/PERSONA_DATABASE_URL未使用。DB_WRITE=NOを維持。');
decision.push('');
decision.push('CANDIDATE_SCORE_RANKING');
for (const item of scored) {
  decision.push(`- ${item.name}: score=${item.score}; reasons=${item.reasons.join(',') || 'none'}`);
}
decision.push('');

const best = scored[0];
decision.push(`PREFERRED_INVESTIGATION_TARGET=${best ? best.name : 'UNKNOWN'}`);
decision.push('');
decision.push('NEXT_PATCH_POLICY');
decision.push('- 自動で関数丸ごと置換しない');
decision.push('- DOM後付け探索を再追加しない');
decision.push('- setInterval / MutationObserver / 新bridge / 新server route を追加しない');
decision.push('- 実レンダラー内の操作パネル生成と rows.map のカード/行出力だけを最小差分で修正する');
decision.push('- 個別「課長へ送る」「削除」ボタンはレンダー元から出さない');
decision.push('- Yes/No確認は画面制御のみ。Yes押下でも次工程まではDB/APIを呼ばない');
decision.push('');
decision.push('REQUIRED_MANUAL_CONFIRMATION_BEFORE_PATCH');
decision.push('- 050_candidate_function_extracts.txt で、実際に登録済み大項目カード/行を描いている関数を目視確認する');
decision.push('- 020_renderer_extract_scan.txt と 040_core_renderer_candidate_scan.txt の rows.map 周辺を確認する');
decision.push('- PREFERRED_INVESTIGATION_TARGET が実表示とズレている場合は、scoreより目視結果を優先する');
fs.writeFileSync(decisionOut, decision.join('\n') + '\n');
