import fs from "node:fs";

const corePath = process.env.CORE;
if (!corePath) throw new Error("CORE env is required");

let text = fs.readFileSync(corePath, "utf8");
const before = {
  v5bMarker: (text.match(/AICM_R8Z_V5B_STABLE_CONTEXT_HYDRATION_START/g) || []).length,
  contextAssignPatch: (text.match(/AICM_R8Z_V5B_CONTEXT_ASSIGN_PATCH/g) || []).length,
  renderPlaceholder: (text.match(/function renderReviewListPlaceholder\s*\(/g) || []).length,
  reviewWaitItemsRefs: (text.match(/review_wait_items/g) || []).length
};

function findFunctionRange(src, functionName) {
  const needle = "function " + functionName + "(";
  const start = src.indexOf(needle);
  if (start < 0) throw new Error("function not found: " + functionName);

  const open = src.indexOf("{", start);
  if (open < 0) throw new Error("function open brace not found: " + functionName);

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escape = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (inSingle) {
      if (ch === "\\") escape = true;
      else if (ch === "'") inSingle = false;
      continue;
    }

    if (inDouble) {
      if (ch === "\\") escape = true;
      else if (ch === '"') inDouble = false;
      continue;
    }

    if (inTemplate) {
      if (ch === "\\") escape = true;
      else if (ch === "`") inTemplate = false;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      continue;
    }

    if (ch === '"') {
      inDouble = true;
      continue;
    }

    if (ch === "`") {
      inTemplate = true;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1 };
    }
  }

  throw new Error("function closing brace not found: " + functionName);
}

let contextAssignPatchCount = 0;

if (!text.includes("AICM_R8Z_V5B_CONTEXT_ASSIGN_PATCH")) {
  text = text.replace(
    /(^[ \t]*state\.context\s*=\s*[^;\n]+;\n)(?![ \t]*state\.context\s*=\s*aicmR8zV5BNormalizeContext)/gm,
    function(match, assignmentLine) {
      if (assignmentLine.includes("aicmR8zV5BNormalizeContext")) return match;
      const indentMatch = assignmentLine.match(/^([ \t]*)/);
      const indent = indentMatch ? indentMatch[1] : "";
      contextAssignPatchCount += 1;
      return assignmentLine + indent + "state.context = aicmR8zV5BNormalizeContext(state.context); // AICM_R8Z_V5B_CONTEXT_ASSIGN_PATCH\n";
    }
  );
}

const helperBlock = `
// AICM_R8Z_V5B_STABLE_CONTEXT_HYDRATION_START
// 保守性方針:
// - context API の payload を state.context と state.review_wait_items に同期する。
// - review-list renderer は state/context の正本だけを見る。
// - 会社IDのハードコードはしない。既存state/contextからのみ取得する。
// - 画面ごとの個別DB/API POSTはしない。
function aicmR8zV5BText(value) {
  if (value === null || typeof value === "undefined") return "";
  return String(value).trim();
}

function aicmR8zV5BEscape(value) {
  var text = aicmR8zV5BText(value);
  if (typeof escapeHtml === "function") return escapeHtml(text);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function aicmR8zV5BFirst(row, keys, fallback) {
  row = row || {};
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      var value = aicmR8zV5BText(row[key]);
      if (value) return value;
    }
  }
  return fallback || "";
}

function aicmR8zV5BNormalizeContext(ctx) {
  if (!ctx || typeof ctx !== "object") return ctx;

  var rows = [];
  if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
  else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
  else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
  else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;

  ctx.review_wait_items = rows;
  state.context = ctx;
  state.review_wait_items = rows;

  if (ctx.owner_civilization_id) state.owner_civilization_id = ctx.owner_civilization_id;
  if (ctx.aicm_user_company_id) state.selectedCompanyId = ctx.aicm_user_company_id;

  return ctx;
}

function aicmR8zV5BContext() {
  var ctx = state.context && typeof state.context === "object" ? state.context : {};
  if (Array.isArray(ctx.review_wait_items)) {
    state.review_wait_items = ctx.review_wait_items;
    return ctx;
  }

  if (Array.isArray(state.review_wait_items)) {
    ctx.review_wait_items = state.review_wait_items;
    state.context = ctx;
    return ctx;
  }

  return aicmR8zV5BNormalizeContext(ctx) || {};
}

function aicmR8zV5BReviewRows() {
  var ctx = aicmR8zV5BContext();
  var candidates = [
    ctx.review_wait_items,
    state.review_wait_items,
    ctx.reviewWaitItems,
    ctx.human_review_wait_items,
    ctx.humanReviewWaitItems
  ];

  for (var i = 0; i < candidates.length; i += 1) {
    if (Array.isArray(candidates[i])) {
      return candidates[i].filter(function(row) {
        return row && typeof row === "object";
      });
    }
  }

  return [];
}

function aicmR8zV5BCurrentOwnerId() {
  var ctx = state.context || {};
  return aicmR8zV5BText(
    state.owner_civilization_id ||
    ctx.owner_civilization_id ||
    state.ownerCivilizationId ||
    ctx.ownerCivilizationId
  );
}

function aicmR8zV5BCurrentCompanyId() {
  var ctx = state.context || {};
  return aicmR8zV5BText(
    state.selectedCompanyId ||
    state.aicm_user_company_id ||
    ctx.aicm_user_company_id ||
    ctx.selectedCompanyId ||
    ctx.company_id
  );
}

function aicmR8zV5BCurrentCompanyName() {
  var ctx = state.context || {};
  var companyId = aicmR8zV5BCurrentCompanyId();
  var direct = aicmR8zV5BText(
    state.selectedCompanyName ||
    ctx.selectedCompanyName ||
    ctx.company_name ||
    ctx.aicm_user_company_name
  );

  if (direct) return direct;

  var companies = [];
  if (Array.isArray(ctx.companies)) companies = ctx.companies;
  else if (Array.isArray(state.companies)) companies = state.companies;

  for (var i = 0; i < companies.length; i += 1) {
    var row = companies[i] || {};
    var id = aicmR8zV5BText(row.aicm_user_company_id || row.company_id || row.id);
    if (companyId && id === companyId) {
      return aicmR8zV5BText(row.company_name || row.name || row.display_name) || "選択中";
    }
  }

  return "選択中";
}

function aicmR8zV5BTriggerRender() {
  if (typeof render === "function") {
    render();
    return;
  }

  if (typeof renderApp === "function") {
    renderApp();
    return;
  }

  if (typeof aicmRender === "function") {
    aicmRender();
  }
}

function aicmR8zV5BMaybeHydrateContext(reason) {
  if (state.aicmR8zV5BHydrationRunning) return;
  if (aicmR8zV5BReviewRows().length > 0) return;

  var ownerId = aicmR8zV5BCurrentOwnerId();
  var companyId = aicmR8zV5BCurrentCompanyId();

  if (!ownerId || !companyId || typeof fetch !== "function") return;

  state.aicmR8zV5BHydrationRunning = true;

  setTimeout(function() {
    var params = new URLSearchParams();
    params.set("owner_civilization_id", ownerId);
    params.set("aicm_user_company_id", companyId);
    params.set("v", "r8z_v5b_" + Date.now());

    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
      .then(function(response) {
        return response.text().then(function(text) {
          var payload = {};
          try {
            payload = text ? JSON.parse(text) : {};
          } catch (error) {
            payload = {};
          }

          if (response.ok && payload && payload.result === "ok") {
            aicmR8zV5BNormalizeContext(payload);
          }
        });
      })
      .catch(function(error) {
        state.aicmR8zV5BHydrationError = String(error && error.message ? error.message : error);
      })
      .finally(function() {
        state.aicmR8zV5BHydrationRunning = false;
        if (state.screen === "review-list") aicmR8zV5BTriggerRender();
      });
  }, 0);
}

function aicmR8zV5BReviewStatusLabel(row) {
  var status = aicmR8zV5BFirst(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
  if (status === "pending") return "承認待ち";
  if (status === "approved") return "承認済み";
  if (status === "returned") return "差し戻し";
  if (status === "archived") return "アーカイブ";
  return status;
}
// AICM_R8Z_V5B_STABLE_CONTEXT_HYDRATION_END
`;

if (!text.includes("AICM_R8Z_V5B_STABLE_CONTEXT_HYDRATION_START")) {
  const insertNeedle = "function renderReviewListPlaceholder() {";
  if (!text.includes(insertNeedle)) {
    throw new Error("insert target not found: renderReviewListPlaceholder");
  }
  text = text.replace(insertNeedle, helperBlock + "\n" + insertNeedle);
}

const newReviewRenderer = `function renderReviewListPlaceholder() {
  var rows = aicmR8zV5BReviewRows();
  var companyName = aicmR8zV5BCurrentCompanyName();

  if (!rows.length) {
    aicmR8zV5BMaybeHydrateContext("review-list-empty");
  }

  var html = [
    '<section class="aicm-core-card aicm-review-list-stable-r8z-v5b">',
    '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
    '  <h2>納品サマリー確認</h2>',
    '  <p class="aicm-selected-note">対象会社: <strong>' + aicmR8zV5BEscape(companyName) + '</strong></p>',
    '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
    '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + aicmR8zV5BEscape(String(rows.length)) + '件</strong></p>'
  ];

  if (!rows.length) {
    html.push(
      '  <article class="aicm-core-card">',
      '    <strong>レビュー・承認待ちはありません</strong>',
      '    <p>context APIにレビュー対象が届いていない、または画面stateへの反映待ちです。数秒後に再描画されます。</p>',
      '  </article>',
      '</section>'
    );
    return html.join("");
  }

  rows.forEach(function(row, index) {
    var id = aicmR8zV5BFirst(row, ["aicm_human_review_item_id", "review_id", "id"], "");
    var title = aicmR8zV5BFirst(row, ["review_title", "title"], "レビュー項目");
    var kind = aicmR8zV5BFirst(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
    var artifact = aicmR8zV5BFirst(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
    var status = aicmR8zV5BReviewStatusLabel(row);
    var priority = aicmR8zV5BFirst(row, ["priority_label", "priority_code"], "-");
    var summary = aicmR8zV5BFirst(row, [
      "delivery_summary_text",
      "delivery_summary_preview",
      "result_summary_text",
      "ai_review_result_text",
      "review_summary_text",
      "summary"
    ], "要約未設定");
    var requestId = aicmR8zV5BFirst(row, ["source_request_id", "request_id"], "");
    var workerUnitId = aicmR8zV5BFirst(row, ["related_worker_work_unit_id"], "");

    html.push(
      '  <article class="aicm-core-card aicm-review-card">',
      '    <div class="aicm-review-head">',
      '      <div>',
      '        <p class="aicm-eyebrow">レビュー #' + aicmR8zV5BEscape(String(index + 1)) + '</p>',
      '        <h3>' + aicmR8zV5BEscape(title) + '</h3>',
      '      </div>',
      '      <strong>' + aicmR8zV5BEscape(status) + '</strong>',
      '    </div>',
      '    <div class="aicm-review-meta">',
      '      <span>種別: ' + aicmR8zV5BEscape(kind) + '</span>',
      '      <span>成果物: ' + aicmR8zV5BEscape(artifact) + '</span>',
      '      <span>優先度: ' + aicmR8zV5BEscape(priority) + '</span>',
      requestId ? '      <span>request_id: ' + aicmR8zV5BEscape(requestId) + '</span>' : '',
      workerUnitId ? '      <span>worker_unit: ' + aicmR8zV5BEscape(workerUnitId) + '</span>' : '',
      '    </div>',
      '    <section class="aicm-review-summary">',
      '      <h3>納品サマリー</h3>',
      '      <p>' + aicmR8zV5BEscape(summary) + '</p>',
      '    </section>',
      '    <div class="aicm-dashboard-action-row">',
      '      <button type="button" data-core-action="human-review-approve" data-review-id="' + aicmR8zV5BEscape(id) + '">承認</button>',
      '      <button type="button" data-core-action="human-review-return" data-review-id="' + aicmR8zV5BEscape(id) + '">差し戻し</button>',
      '    </div>',
      '  </article>'
    );
  });

  html.push('</section>');
  return html.join("");
}`;

const range = findFunctionRange(text, "renderReviewListPlaceholder");
text = text.slice(0, range.start) + newReviewRenderer + text.slice(range.end);

const after = {
  v5bMarker: (text.match(/AICM_R8Z_V5B_STABLE_CONTEXT_HYDRATION_START/g) || []).length,
  contextAssignPatch: (text.match(/AICM_R8Z_V5B_CONTEXT_ASSIGN_PATCH/g) || []).length,
  renderPlaceholder: (text.match(/function renderReviewListPlaceholder\s*\(/g) || []).length,
  reviewWaitItemsRefs: (text.match(/review_wait_items/g) || []).length,
  v5bRenderer: (text.match(/aicm-review-list-stable-r8z-v5b/g) || []).length,
  contextAssignPatchCount
};

if (after.v5bMarker !== 1) throw new Error("v5b marker count invalid: " + after.v5bMarker);
if (after.renderPlaceholder !== 1) throw new Error("renderReviewListPlaceholder count invalid: " + after.renderPlaceholder);
if (after.v5bRenderer !== 1) throw new Error("v5b renderer count invalid: " + after.v5bRenderer);

fs.writeFileSync(corePath, text, "utf8");

console.log(JSON.stringify({
  status: "PATCHED",
  before,
  after,
  core_file_write: "YES",
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
}, null, 2));
