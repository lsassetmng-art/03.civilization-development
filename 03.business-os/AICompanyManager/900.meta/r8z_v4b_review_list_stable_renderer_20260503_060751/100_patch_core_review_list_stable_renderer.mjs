import fs from "fs";

const corePath = process.env.CORE;
const patchOut = process.env.PATCH_OUT;

const src = fs.readFileSync(corePath, "utf8");

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = "";
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1] || "";

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
      if (depth === 0) return i;
    }
  }

  return -1;
}

function replaceFunctionBody(text, functionName, newBody) {
  const re = new RegExp("function\\s+" + functionName + "\\s*\\([^)]*\\)\\s*\\{", "m");
  const m = re.exec(text);
  if (!m) {
    throw new Error("function not found: " + functionName);
  }

  const open = text.indexOf("{", m.index);
  const close = findMatchingBrace(text, open);
  if (open < 0 || close < 0 || close <= open) {
    throw new Error("function brace not found: " + functionName);
  }

  return text.slice(0, open + 1) + "\n" + newBody + "\n" + text.slice(close);
}

const stableBody = `
  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START
  var ctx = state && state.context ? state.context : {};
  var rows = [];

  if (ctx && Array.isArray(ctx.review_wait_items)) {
    rows = ctx.review_wait_items;
  } else if (state && Array.isArray(state.review_wait_items)) {
    rows = state.review_wait_items;
  } else if (ctx && Array.isArray(ctx.human_review_items)) {
    rows = ctx.human_review_items;
  }

  function r8zV4bText(value, fallback) {
    if (value === null || typeof value === "undefined") return fallback || "";
    var text = String(value);
    return text.length ? text : (fallback || "");
  }

  function r8zV4bEsc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(r8zV4bText(value));
    return r8zV4bText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function r8zV4bCompanyName() {
    if (state && state.selectedCompanyName) return state.selectedCompanyName;
    if (ctx && Array.isArray(ctx.companies)) {
      for (var i = 0; i < ctx.companies.length; i += 1) {
        var c = ctx.companies[i] || {};
        var id = r8zV4bText(c.aicm_user_company_id || c.company_id || c.id);
        if (id && id === r8zV4bText(state && state.selectedCompanyId)) {
          return r8zV4bText(c.company_name || c.name || c.display_name, "選択中の会社");
        }
      }
      if (ctx.companies[0]) return r8zV4bText(ctx.companies[0].company_name || ctx.companies[0].name, "選択中の会社");
    }
    return "選択中の会社";
  }

  function r8zV4bSummary(row) {
    return r8zV4bText(
      row.delivery_summary_text ||
      row.delivery_summary_preview ||
      row.result_summary_text ||
      row.summary_text ||
      row.note,
      "要約未設定"
    );
  }

  var html = [
    '<section class="aicm-core-card aicm-review-list-card">',
    '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
    '  <h2>納品サマリー確認</h2>',
    '  <div class="aicm-info-box">対象会社: <strong>' + r8zV4bEsc(r8zV4bCompanyName()) + '</strong></div>',
    '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
    '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV4bEsc(String(rows.length)) + '件</strong></p>',
    '</section>'
  ];

  if (!rows.length) {
    html.push(
      '<section class="aicm-core-card aicm-empty-card">',
      '  <strong>レビュー・承認待ちはありません</strong>',
      '  <p>設計書と実装は、納品時にAIがまとめた要約だけがここに表示されます。</p>',
      '  <p>AIレビューは内部工程で通常通り実施され、ここにはAIレビュー結果の要約だけが出ます。</p>',
      '</section>'
    );
    return html.join("");
  }

  html.push('<section class="aicm-core-card aicm-review-list-items">');
  html.push('  <h3>承認待ちサマリー</h3>');

  rows.forEach(function(row, index) {
    row = row || {};
    var id = r8zV4bText(row.aicm_human_review_item_id || row.review_id || row.id);
    var title = r8zV4bText(row.review_title || row.title, "レビュー項目");
    var kind = r8zV4bText(row.review_kind_label || row.review_kind_code, "納品サマリー");
    var artifact = r8zV4bText(row.artifact_kind_label || row.artifact_kind_code, "delivery_package");
    var status = r8zV4bText(row.human_review_status_label || row.human_review_status_code, "pending");
    var priority = r8zV4bText(row.priority_label || row.priority_code, "-");
    var summary = r8zV4bSummary(row);
    var aiReview = r8zV4bText(row.ai_review_result_text || row.ai_review_summary_text || "");

    html.push(
      '<article class="aicm-core-card aicm-review-card">',
      '  <div class="aicm-review-head">',
      '    <div>',
      '      <p class="aicm-eyebrow">承認待ち #' + r8zV4bEsc(String(index + 1)) + '</p>',
      '      <h3>' + r8zV4bEsc(title) + '</h3>',
      '    </div>',
      '    <strong>' + r8zV4bEsc(status) + '</strong>',
      '  </div>',
      '  <div class="aicm-review-meta">',
      '    <span>' + r8zV4bEsc(kind) + '</span>',
      '    <span>' + r8zV4bEsc(artifact) + '</span>',
      '    <span>優先度: ' + r8zV4bEsc(priority) + '</span>',
      '  </div>',
      '  <section class="aicm-review-summary">',
      '    <h3>納品サマリー</h3>',
      '    <p>' + r8zV4bEsc(summary) + '</p>',
      aiReview ? '    <h3>AIレビュー要約</h3><p>' + r8zV4bEsc(aiReview) + '</p>' : '',
      '  </section>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV4bEsc(id) + '">承認</button>',
      '    <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV4bEsc(id) + '">差し戻し</button>',
      '  </div>',
      '</article>'
    );
  });

  html.push('</section>');
  return html.join("");
  // AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_END
`;

let next = src;
const before = {
  stableMarkerCount: (src.match(/AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START/g) || []).length,
  placeholderFunctionCount: (src.match(/function\s+renderReviewListPlaceholder\s*\(/g) || []).length,
  reviewRouteCount: (src.match(/state\.screen\s*===\s*["']review-list["']/g) || []).length,
  routeCallsPlaceholder: (src.match(/html\s*=\s*renderReviewListPlaceholder\s*\(\s*\)\s*;/g) || []).length
};

next = replaceFunctionBody(next, "renderReviewListPlaceholder", stableBody);

const routeRe = /(state\.screen\s*===\s*["']review-list["']\s*\)\s*\{\s*)html\s*=\s*[A-Za-z0-9_$]+\s*\(\s*\)\s*;/m;
if (routeRe.test(next)) {
  next = next.replace(routeRe, "$1html = renderReviewListPlaceholder();");
}

const after = {
  stableMarkerCount: (next.match(/AICM_R8Z_V4B_REVIEW_LIST_STABLE_RENDERER_START/g) || []).length,
  placeholderFunctionCount: (next.match(/function\s+renderReviewListPlaceholder\s*\(/g) || []).length,
  reviewRouteCount: (next.match(/state\.screen\s*===\s*["']review-list["']/g) || []).length,
  routeCallsPlaceholder: (next.match(/html\s*=\s*renderReviewListPlaceholder\s*\(\s*\)\s*;/g) || []).length,
  changed: next !== src
};

if (after.stableMarkerCount !== 1) {
  throw new Error("stable marker count invalid: " + after.stableMarkerCount);
}
if (after.placeholderFunctionCount !== 1) {
  throw new Error("placeholder function count invalid: " + after.placeholderFunctionCount);
}
if (after.reviewRouteCount < 1) {
  throw new Error("review-list route not found");
}
if (after.routeCallsPlaceholder < 1) {
  throw new Error("review-list route does not call renderReviewListPlaceholder");
}
if (!next.includes("delivery_summary_preview")) {
  throw new Error("delivery_summary_preview fallback missing");
}
if (!next.includes("review_wait_items")) {
  throw new Error("review_wait_items reference missing");
}

fs.writeFileSync(corePath, next);

const result = {
  status: "PATCHED",
  before,
  after,
  core_file_write: "YES",
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
};

fs.writeFileSync(patchOut, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
