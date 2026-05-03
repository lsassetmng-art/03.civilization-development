import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const marker = "AICM_HUMAN_REVIEW_QUEUE_CORE_ARN_ARQ_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
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
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return { start, end: i + 1, text: source.slice(start, i + 1) };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function listFunctions(source) {
  const names = [];
  const re = /function\s+([A-Za-z0-9_]+)\s*\(/g;
  let m;
  while ((m = re.exec(source))) names.push(m[1]);
  return names;
}

function findReviewRenderer(source) {
  const candidates = [
    "renderReviewPlaceholder",
    "renderReviewQueuePlaceholder",
    "renderReviewWaitingPlaceholder",
    "renderApprovalPlaceholder",
    "renderReviewApprovalPlaceholder"
  ];

  for (const name of candidates) {
    if (source.includes("function " + name + "(")) return name;
  }

  for (const name of listFunctions(source)) {
    let fn = "";
    try {
      fn = extractFunction(source, name).text;
    } catch (_) {
      continue;
    }

    if (fn.includes("レビュー・承認待ち一覧") || (fn.includes("レビュー") && fn.includes("承認待ち"))) {
      return name;
    }
  }

  throw new Error("review renderer function not found");
}

function replaceFunction(source, functionName, replacement) {
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function findActionBlockByAction(source, action) {
  const token = `action === "${action}"`;
  const tokenPos = source.indexOf(token);
  if (tokenPos < 0) return null;

  const ifPos = source.lastIndexOf("if", tokenPos);
  const braceStart = source.indexOf("{", tokenPos);

  if (ifPos < 0 || braceStart < 0) throw new Error("action block malformed: " + action);

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
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
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return { start: ifPos, end: i + 1 };
    }
  }

  throw new Error("action block end not found: " + action);
}

function insertActionBeforeGo(source, action, blockText) {
  if (source.includes(`action === "${action}"`)) return source;

  const goBlock = findActionBlockByAction(source, "go");
  if (!goBlock) throw new Error("go action anchor not found");

  return source.slice(0, goBlock.start) + blockText + "\n\n    " + source.slice(goBlock.start);
}

function insertBeforeFunction(source, functionName, insertion) {
  if (source.includes(marker)) return source;

  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("core insertion anchor not found: " + functionName);

  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

function makeHelperCode() {
  return `
// ${marker}
// Human review queue UI.
// Human review only shows delivery summaries / exception summaries.
// AI review remains internal; the UI displays ai_review_result_text summary only.

function aicmHumanReviewOwnerId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (state && state.owner_civilization_id) return state.owner_civilization_id;
    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
    return "00000000-0000-4000-8000-000000000001";
  }

  function aicmHumanReviewRows() {
    var ctx = state.context || state || {};
    var rows = ctx.review_wait_items || state.review_wait_items || [];
    return Array.isArray(rows) ? rows : [];
  }

  function aicmHumanReviewRowsForCompany(companyId) {
    return aicmHumanReviewRows().filter(function (row) {
      return !companyId || row.aicm_user_company_id === companyId;
    });
  }

  function aicmHumanReviewActionElement() {
    if (typeof target !== "undefined" && target && target.getAttribute) return target;
    if (typeof button !== "undefined" && button && button.getAttribute) return button;
    if (typeof event !== "undefined" && event && event.target && event.target.closest) {
      return event.target.closest("[data-review-id]") || event.target.closest("[data-core-action]");
    }
    if (typeof window !== "undefined" && window.event && window.event.target && window.event.target.closest) {
      return window.event.target.closest("[data-review-id]") || window.event.target.closest("[data-core-action]");
    }
    if (typeof document !== "undefined" && document.activeElement && document.activeElement.getAttribute) {
      return document.activeElement;
    }
    return null;
  }

  async function aicmHumanReviewPostJson(path, body) {
    var response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });

    var text = await response.text();
    var json = {};

    try {
      json = text ? JSON.parse(text) : {};
    } catch (_) {
      json = { result: "error", message: text || "Invalid server response" };
    }

    if (!response.ok || (json.result && json.result !== "ok")) {
      throw new Error(json.message || json.error || ("API failed: " + path));
    }

    return json;
  }

  async function aicmHumanReviewReload() {
    if (typeof aicmPmlwReloadContext === "function") {
      await aicmPmlwReloadContext();
      return;
    }

    if (typeof loadContext === "function") {
      await loadContext();
      return;
    }

    var owner = encodeURIComponent(aicmHumanReviewOwnerId());
    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
    var json = await response.json();

    if (json && json.result === "ok") {
      state.context = json;
    }

    if (typeof render === "function") render();
  }

  async function approveHumanReviewFromAction() {
    var el = aicmHumanReviewActionElement();
    var reviewId = el && el.getAttribute ? el.getAttribute("data-review-id") : "";

    if (!reviewId) {
      setMessage("error", "レビュー項目を特定できません。");
      return;
    }

    try {
      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/approve", {
        owner_civilization_id: aicmHumanReviewOwnerId(),
        aicm_human_review_item_id: reviewId,
        human_reviewer_label: "user",
        human_review_note: ""
      });

      setMessage("ok", "レビューを承認しました。");
      await aicmHumanReviewReload();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "承認に失敗しました。");
    }
  }

  async function returnHumanReviewFromAction() {
    var el = aicmHumanReviewActionElement();
    var reviewId = el && el.getAttribute ? el.getAttribute("data-review-id") : "";

    if (!reviewId) {
      setMessage("error", "レビュー項目を特定できません。");
      return;
    }

    var note = "";
    try {
      if (typeof window !== "undefined" && window.prompt) {
        note = window.prompt("差し戻し理由を入力してください。", "") || "";
      }
    } catch (_) {}

    try {
      await aicmHumanReviewPostJson("/api/aicm/v2/human-review/return", {
        owner_civilization_id: aicmHumanReviewOwnerId(),
        aicm_human_review_item_id: reviewId,
        human_reviewer_label: "user",
        human_review_note: note
      });

      setMessage("ok", "レビューを差し戻しました。");
      await aicmHumanReviewReload();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "差し戻しに失敗しました。");
    }
  }

  function renderHumanReviewRows(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>レビュー・承認待ちはありません</strong>',
        '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
        '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
        '</div>'
      ].join("");
    }

    return rows.map(function (row) {
      var id = row.aicm_human_review_item_id || "";
      var title = row.review_title || "レビュー項目";
      var kind = row.review_kind_label || row.review_kind_code || "納品サマリー";
      var artifact = row.artifact_kind_label || row.artifact_kind_code || "";
      var status = row.human_review_status_label || row.human_review_status_code || "承認待ち";
      var company = row.company_name || "";
      var department = row.department_name || "";
      var section = row.section_name || "";
      var aiLabel = row.responsible_ai_label || row.requested_by_ai_label || "";
      var summary = row.delivery_summary_text || "要約未設定";
      var changes = row.main_changes_text || "";
      var aiReview = row.ai_review_result_text || "";
      var unresolved = row.unresolved_issues_text || "";
      var link = row.artifact_link || "";

      return [
        '<article class="aicm-core-card aicm-review-card">',
        '  <div class="aicm-review-head">',
        '    <div>',
        '      <p class="aicm-eyebrow">' + escapeHtml(kind) + (artifact ? ' / ' + escapeHtml(artifact) : '') + '</p>',
        '      <h2>' + escapeHtml(title) + '</h2>',
        '    </div>',
        '    <span class="aicm-pill">' + escapeHtml(status) + '</span>',
        '  </div>',
        '  <div class="aicm-review-meta">',
        company ? '<span>会社: ' + escapeHtml(company) + '</span>' : '',
        department ? '<span>部門: ' + escapeHtml(department) + '</span>' : '',
        section ? '<span>課: ' + escapeHtml(section) + '</span>' : '',
        aiLabel ? '<span>担当AI: ' + escapeHtml(aiLabel) + '</span>' : '',
        '  </div>',
        '  <section class="aicm-review-summary">',
        '    <h3>納品サマリー</h3>',
        '    <p>' + escapeHtml(summary) + '</p>',
        changes ? '    <h3>主な変更点</h3><p>' + escapeHtml(changes) + '</p>' : '',
        aiReview ? '    <h3>AIレビュー結果</h3><p>' + escapeHtml(aiReview) + '</p>' : '',
        unresolved ? '    <h3>注意点 / 未解決事項</h3><p>' + escapeHtml(unresolved) + '</p>' : '',
        link ? '    <p><a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">成果物を開く</a></p>' : '',
        '  </section>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="human-review-approve" data-review-id="' + escapeHtml(id) + '">承認</button>',
        '    <button type="button" data-core-action="human-review-return" data-review-id="' + escapeHtml(id) + '">差し戻し</button>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }
`;
}

function makeReviewRenderer(functionName) {
  return `
function ${functionName}() {
    var company = selectedCompany();
    var rows = company ? aicmHumanReviewRowsForCompany(company.aicm_user_company_id) : aicmHumanReviewRows();

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
      '</section>',
      renderHumanReviewRows(rows)
    ].join(""));
  }`;
}

const reviewRendererName = findReviewRenderer(src);
src = insertBeforeFunction(src, reviewRendererName, makeHelperCode());
src = replaceFunction(src, reviewRendererName, makeReviewRenderer(reviewRendererName));

src = insertActionBeforeGo(src, "human-review-approve", `if (action === "human-review-approve") {
      approveHumanReviewFromAction();
      return;
    }`);

src = insertActionBeforeGo(src, "human-review-return", `if (action === "human-review-return") {
      returnHumanReviewFromAction();
      return;
    }`);

if (!src.includes(".aicm-review-card{")) {
  const cssAdditions = `
      ".aicm-review-card{display:grid;gap:14px}",
      ".aicm-review-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}",
      ".aicm-review-meta{display:flex;flex-wrap:wrap;gap:8px;color:#64748b;font-size:13px}",
      ".aicm-review-meta span{background:#f8fafc;border:1px solid #e5e7eb;border-radius:999px;padding:5px 10px}",
      ".aicm-review-summary{display:grid;gap:8px}",
      ".aicm-review-summary h3{margin:6px 0 0;font-size:14px}",
      ".aicm-review-summary p{margin:0;color:#334155;white-space:pre-wrap}",
`;
  const markerCss = '      "@media(min-width:820px)';
  const pos = src.indexOf(markerCss);

  if (pos >= 0) {
    src = src.slice(0, pos) + cssAdditions + src.slice(pos);
  }
}

fs.writeFileSync(file, src);

console.log(JSON.stringify({
  changed: true,
  reviewRendererName,
  markerCount: count(src, marker),
  approveActionCount: count(src, "human-review-approve"),
  returnActionCount: count(src, "human-review-return"),
  reviewWaitLabelCount: count(src, "レビュー・承認待ち一覧"),
  summaryLabelCount: count(src, "納品サマリー")
}));
