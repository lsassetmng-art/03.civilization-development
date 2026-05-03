const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];
const analysisPath = process.argv[4];

const src0 = fs.readFileSync(corePath, "utf8");
let src = src0;
const log = [];
const analysis = [];

const removeMarkers = [
  "AICM_R8Z_V10F2H_SECTION_NEW_RUNTIME_VISIBLE_DEBUG",
  "AICM_R8Z_V10F2I_WORKER_LEAK_ALWAYS_VISIBLE_DEBUG",
  "AICM_R8Z_V10F2J_WORKER_LEAK_DOM_SOURCE_DEBUG",
  "AICM_R8Z_V10F2K_SECTION_ADD_WORKER_BLOCK_GUARD",
  "AICM_R8Z_V10F3B_REVIEW_LIST_TOP_BACK_BUTTON",
  "AICM_R8Z_V10F3C_REVIEW_LIST_BACK_SIMPLE_DASHBOARD",
  "AICM_R8Z_V10F3D_REVIEW_LIST_BACK_SINGLE_DASHBOARD"
];

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

removeMarkers.forEach((marker) => {
  const re = new RegExp("\\n\\s*//\\s*" + escRe(marker) + "_START[\\s\\S]*?//\\s*" + escRe(marker) + "_END\\s*\\n?", "g");
  const before = src.length;
  src = src.replace(re, "\n");
  const removed = before !== src.length;
  analysis.push("REMOVED_" + marker + "=" + (removed ? "true" : "false"));
});

const v10f4Marker = "AICM_R8Z_V10F4A_REVIEW_LIST_COMMON_NAV_AND_SECTION_WORKER_SOURCE_GUARD";

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex, source = src) {
  let depth = 0, quote = "", esc = false, lineComment = false, blockComment = false;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];

    if (lineComment) { if (ch === "\n") lineComment = false; continue; }
    if (blockComment) { if (ch === "*" && next === "/") { blockComment = false; i++; } continue; }

    if (quote) {
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") { lineComment = true; i++; continue; }
    if (ch === "/" && next === "*") { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { quote = ch; continue; }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

function findFunctionsContaining(patterns) {
  const results = [];
  const re = /function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    const start = m.index;
    const open = src.indexOf("{", start);
    const end = scanBraceEnd(open);
    if (open < 0 || end < 0) continue;
    const text = src.slice(start, end);

    const hit = patterns.some((p) => text.includes(p));
    if (!hit) continue;

    results.push({ name, start, open, end, line: lineNo(start), text });
  }
  return results;
}

function insertBeforeRender(source, block) {
  const idx = source.indexOf("function render(");
  if (idx >= 0) return source.slice(0, idx) + block + source.slice(idx);

  const idx2 = source.indexOf("function renderReviewList");
  if (idx2 >= 0) return source.slice(0, idx2) + block + source.slice(idx2);

  return source + block;
}

const commonNavBlock = `

  // ${v10f4Marker}_COMMON_NAV_START
  function aicmR8zV10f4aText(value) {
    return String(value === undefined || value === null ? "" : value).trim();
  }

  function aicmR8zV10f4aIsSectionCreateScreen() {
    try {
      if (typeof state !== "undefined" && state && state.screen === "section-new") return true;
      if (typeof window !== "undefined" && window.state && window.state.screen === "section-new") return true;
    } catch (_) {}
    return false;
  }

  function aicmR8zV10f4aCommonNavHtml() {
    return [
      '<section id="aicm-v10f4a-common-screen-nav" class="aicm-core-card" style="border:2px solid #cbd5e1;background:#f8fafc;">',
      '  <p class="aicm-eyebrow">AI企業運営アプリ</p>',
      '  <h1>AI企業運営アプリ</h1>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
      '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳</button>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="worker-runtime-request">AI実行Workbench</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  function aicmR8zV10f4aInstallReviewListCommonNav() {
    try {
      if (typeof window === "undefined") return false;
      if (typeof window.aicmR8zV7RenderReviewList !== "function") return false;
      if (window.aicmR8zV7RenderReviewList.__aicmR8zV10f4aWrapped) return true;

      var original = window.aicmR8zV7RenderReviewList;
      var wrapped = function() {
        var html = String(original.apply(this, arguments) || "");
        html = html.replace(/<section id="aicm-v10f3b-review-list-back"[\\s\\S]*?<\\/section>/g, "");
        html = html.replace(/<section id="aicm-v10f3c-review-list-back-simple"[\\s\\S]*?<\\/section>/g, "");
        html = html.replace(/<section id="aicm-v10f3d-review-list-back-single"[\\s\\S]*?<\\/section>/g, "");
        html = html.replace(/<section id="aicm-v10f4a-common-screen-nav"[\\s\\S]*?<\\/section>/g, "");
        return aicmR8zV10f4aCommonNavHtml() + html;
      };

      wrapped.__aicmR8zV10f4aWrapped = true;
      wrapped.__aicmR8zV10f4aOriginal = original;
      window.aicmR8zV7RenderReviewList = wrapped;
      return true;
    } catch (_) {
      return false;
    }
  }

  (function aicmR8zV10f4aInstallCommonNavBootstrap() {
    aicmR8zV10f4aInstallReviewListCommonNav();
    setTimeout(aicmR8zV10f4aInstallReviewListCommonNav, 0);
    setTimeout(aicmR8zV10f4aInstallReviewListCommonNav, 250);
  })();
  // ${v10f4Marker}_COMMON_NAV_END
`;

if (!src.includes(v10f4Marker + "_COMMON_NAV_START")) {
  src = insertBeforeRender(src, commonNavBlock);
  log.push("PATCH_APPLIED: common nav helper installed for review-list");
} else {
  log.push("SKIP: common nav marker already exists");
}

const candidates = findFunctionsContaining([
  "この課に配置するWorkerを設定します",
  "従業員設定ロボット"
]);

analysis.push("WORKER_RENDERER_CANDIDATE_COUNT=" + candidates.length);
analysis.push("WORKER_RENDERER_CANDIDATES_BEGIN");

const safeCandidates = [];

candidates.forEach((fn) => {
  let score = 0;
  if (fn.text.includes("この課に配置するWorkerを設定します")) score += 80;
  if (fn.text.includes("従業員設定ロボット")) score += 80;
  if (fn.text.includes("従業員行を追加")) score += 40;
  if (/worker|Worker|placement|robot|ロボット/i.test(fn.name)) score += 40;
  if (fn.text.length < 9000) score += 20;
  if (fn.text.includes("AI企業運営アプリ")) score -= 100;
  if (fn.text.includes("レビュー・承認待ち")) score -= 100;
  if (fn.name === "render" || fn.name === "renderShell" || fn.name === "renderSectionNew") score -= 200;

  const safe =
    score >= 140 &&
    fn.name !== "render" &&
    fn.name !== "renderShell" &&
    fn.name !== "renderSectionNew" &&
    fn.text.length < 12000;

  analysis.push([
    "name=" + fn.name,
    "line=" + fn.line,
    "length=" + fn.text.length,
    "score=" + score,
    "safe=" + safe
  ].join("\t"));

  if (safe) safeCandidates.push({ ...fn, score });
});

analysis.push("WORKER_RENDERER_CANDIDATES_END");
analysis.push("SAFE_WORKER_RENDERER_COUNT=" + safeCandidates.length);

if (!src.includes(v10f4Marker + "_WORKER_GUARD_CALL")) {
  if (safeCandidates.length === 1) {
    const fn = safeCandidates[0];
    const insert = `
    if (typeof aicmR8zV10f4aIsSectionCreateScreen === "function" && aicmR8zV10f4aIsSectionCreateScreen()) {
      return ""; // ${v10f4Marker}_WORKER_GUARD_CALL
    }
`;

    const insertAt = fn.open + 1;
    src = src.slice(0, insertAt) + insert + src.slice(insertAt);

    analysis.push("WORKER_GUARD_PATCHED=true");
    analysis.push("WORKER_GUARD_FUNCTION=" + fn.name);
    analysis.push("WORKER_GUARD_LINE=" + fn.line);
    log.push("PATCH_APPLIED: section-new guard inserted into " + fn.name);
  } else {
    analysis.push("WORKER_GUARD_PATCHED=false");
    analysis.push("WORKER_GUARD_REASON=SAFE_TARGET_NOT_UNIQUE");
    log.push("WARN: worker renderer guard not patched; safe target count=" + safeCandidates.length);
  }
} else {
  analysis.push("WORKER_GUARD_PATCHED=already");
  log.push("SKIP: worker guard already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
