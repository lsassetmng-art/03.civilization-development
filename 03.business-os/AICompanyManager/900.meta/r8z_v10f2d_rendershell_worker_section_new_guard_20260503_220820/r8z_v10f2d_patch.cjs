const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];
const analysisPath = process.argv[4];

const marker = "AICM_R8Z_V10F2D_RENDERSHELL_WORKER_SECTION_NEW_GUARD";
const log = [];
const analysis = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, "SKIP_ALREADY_EXISTS\n");
  process.exit(0);
}

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex, source = src) {
  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function findFunction(name, source = src) {
  const patterns = [
    new RegExp(`function\\s+${name}\\s*\\(`, "g"),
    new RegExp(`${name}\\s*=\\s*function\\s*\\(`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*function\\s*\\(`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*=>`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*[^\\n=]*=>`, "g")
  ];

  for (const re of patterns) {
    const m = re.exec(source);
    if (!m) continue;

    const start = m.index;
    const open = source.indexOf("{", start);
    if (open < 0) continue;

    const end = scanBraceEnd(open, source);
    if (end < 0) continue;

    return {
      name,
      start,
      open,
      end,
      line: lineNo(start),
      text: source.slice(start, end)
    };
  }

  return null;
}

function identifiersCalled(text) {
  const set = new Set();
  const re = /\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  const skip = new Set([
    "if","for","while","switch","catch","function","return",
    "String","Number","Boolean","Array","Object","Date","JSON","Math",
    "parseInt","parseFloat","isNaN","isFinite","encodeURIComponent",
    "setTimeout","clearTimeout","alert","confirm","console"
  ]);

  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    if (!skip.has(name)) set.add(name);
  }

  return Array.from(set).sort();
}

function hasWorkerTerms(text) {
  return /従業員設定|従業員設定ロボット|従業員|worker|Worker|robot|ロボット|placement|配置/i.test(text);
}

function hasShellSafeWorkerTerms(text) {
  return /従業員設定|従業員設定ロボット|従業員行を追加|worker|Worker|robot|ロボット|placement|配置/i.test(text);
}

function findCallEnd(source, openParen) {
  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openParen; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

const renderShell = findFunction("renderShell");

if (!renderShell) {
  log.push("ERROR: renderShell not found");
  analysis.push("PATCH_DECISION=RENDER_SHELL_NOT_FOUND");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(2);
}

analysis.push("RENDER_SHELL_FOUND=true");
analysis.push("RENDER_SHELL_LINE=" + renderShell.line);

const calls = identifiersCalled(renderShell.text);
analysis.push("RENDER_SHELL_CALLS=" + calls.join(","));

const candidates = [];

for (const name of calls) {
  const fn = findFunction(name);
  const fnText = fn ? fn.text : "";

  let score = 0;
  if (/worker|placement|robot|employee|staff|member/i.test(name)) score += 60;
  if (/従業員設定ロボット/.test(fnText)) score += 100;
  if (/従業員設定/.test(fnText)) score += 80;
  if (/従業員行を追加/.test(fnText)) score += 50;
  if (/worker|Worker|robot|ロボット|placement|配置/i.test(fnText)) score += 40;
  if (/selectedSectionId|selectedSection|state\.placements|placements|section_id|sectionId/.test(fnText)) score += 20;
  if (/escapeHtml|renderNav|renderHeader|renderFooter/.test(name)) score -= 100;
  if (name === "renderShell") score -= 300;

  candidates.push({
    name,
    defined: !!fn,
    line: fn ? fn.line : 0,
    score,
    text: fnText
  });
}

candidates.sort((a, b) => b.score - a.score);

analysis.push("CANDIDATES_BEGIN");
for (const c of candidates) {
  analysis.push([
    "name=" + c.name,
    "defined=" + c.defined,
    "line=" + c.line,
    "score=" + c.score,
    "worker_text=" + hasWorkerTerms(c.text)
  ].join("\t"));
}
analysis.push("CANDIDATES_END");

const workerCandidates = candidates.filter(c =>
  c.defined &&
  c.score > 0 &&
  hasShellSafeWorkerTerms(c.name + "\n" + c.text)
);

analysis.push("WORKER_CANDIDATE_COUNT=" + workerCandidates.length);

if (workerCandidates.length !== 1) {
  log.push("ERROR: expected exactly one renderShell worker candidate, got " + workerCandidates.length);
  analysis.push("PATCH_DECISION=WORKER_CANDIDATE_COUNT_NOT_ONE");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(3);
}

const target = workerCandidates[0];
analysis.push("PATCH_DECISION=TARGET_SELECTED");
analysis.push("WORKER_SHELL_CALL_NAME=" + target.name);
analysis.push("WORKER_SHELL_CALL_LINE=" + target.line);
analysis.push("WORKER_SHELL_CALL_SCORE=" + target.score);

const helper = `

  // ${marker}_HELPER_START
  function aicmR8zV10f2dIsSectionNewScreen() {
    try {
      if (typeof state !== "undefined" && state && state.screen === "section-new") return true;
      if (typeof window !== "undefined" && window.state && window.state.screen === "section-new") return true;
    } catch (_) {}
    return false;
  }

  function aicmR8zV10f2dEscape(value) {
    var text = String(value === undefined || value === null ? "" : value).trim();
    if (typeof escapeHtml === "function") return escapeHtml(text);
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function aicmR8zV10f2dSectionNewWorkerEmptyCard() {
    return [
      '<section class="aicm-core-card" data-aicm-v10f2d-section-new-worker-empty="true" style="border:2px solid #38bdf8;background:#eff6ff;">',
      '  <p class="aicm-eyebrow">従業員設定</p>',
      '  <h2>従業員は未設定です</h2>',
      '  <p class="aicm-selected-note">新規課では、既存課の従業員設定を引き継ぎません。</p>',
      '  <p class="aicm-selected-note">課を保存したあと、課詳細から従業員を配置してください。</p>',
      '  <p class="aicm-selected-note">V10F2D: renderShell worker guard / section-new</p>',
      '</section>'
    ].join("");
  }

  function aicmR8zV10f2dRenderShellWorkerForScreen(renderOriginal) {
    if (aicmR8zV10f2dIsSectionNewScreen()) {
      return aicmR8zV10f2dSectionNewWorkerEmptyCard();
    }

    if (typeof renderOriginal === "function") {
      return renderOriginal();
    }

    return "";
  }
  // ${marker}_HELPER_END
`;

let patched = src.slice(0, renderShell.start) + helper + src.slice(renderShell.start);

// Recompute renderShell after inserting helper.
src = patched;
const renderShellAfter = findFunction("renderShell");

if (!renderShellAfter) {
  log.push("ERROR: renderShell not found after helper insert");
  analysis.push("PATCH_DECISION=RENDER_SHELL_NOT_FOUND_AFTER_HELPER");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(4);
}

const localText = renderShellAfter.text;
const callRe = new RegExp("\\b" + target.name + "\\s*\\(", "g");
const matches = [];
let m;

while ((m = callRe.exec(localText))) {
  matches.push(m.index);
}

analysis.push("TARGET_CALL_COUNT_IN_RENDER_SHELL=" + matches.length);

if (matches.length !== 1) {
  log.push("ERROR: target call count in renderShell is not one: " + matches.length);
  analysis.push("PATCH_DECISION=TARGET_CALL_COUNT_NOT_ONE");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(5);
}

const callStartGlobal = renderShellAfter.start + matches[0];
const openParenGlobal = src.indexOf("(", callStartGlobal);
const closeParenGlobal = findCallEnd(src, openParenGlobal);

if (openParenGlobal < 0 || closeParenGlobal < 0) {
  log.push("ERROR: call bounds not found");
  analysis.push("PATCH_DECISION=CALL_BOUNDS_NOT_FOUND");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(6);
}

const originalCall = src.slice(callStartGlobal, closeParenGlobal + 1);

const replacement =
  'aicmR8zV10f2dRenderShellWorkerForScreen(function () { return ' +
  originalCall +
  '; })';

patched = src.slice(0, callStartGlobal) + replacement + src.slice(closeParenGlobal + 1);

fs.writeFileSync(corePath, patched, "utf8");

analysis.push("CALLSITE_PATCHED=true");
analysis.push("CALLSITE_LINE=" + lineNo(callStartGlobal));
analysis.push("ORIGINAL_CALL=" + originalCall);
analysis.push("REPLACEMENT_CALL=" + replacement);

log.push("PATCH_APPLIED: renderShell worker call guarded for section-new");
log.push("WORKER_SHELL_CALL_NAME=" + target.name);

fs.writeFileSync(patchLog, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
