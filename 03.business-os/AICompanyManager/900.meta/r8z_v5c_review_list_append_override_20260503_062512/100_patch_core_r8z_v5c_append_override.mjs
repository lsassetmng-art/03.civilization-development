import fs from "node:fs";

const corePath = process.env.CORE;
if (!corePath) throw new Error("CORE env is required");

let text = fs.readFileSync(corePath, "utf8");

const before = {
  v5cStart: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_START/g) || []).length,
  v5cEnd: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END/g) || []).length,
  renderReviewListPlaceholderFunction: (text.match(/function\s+renderReviewListPlaceholder\s*\(/g) || []).length,
  reviewWaitItemsRefs: (text.match(/review_wait_items/g) || []).length
};

// Remove old V5C block only, if rerun.
// Do not touch any previous R8Z/V4/V5B code.
text = text.replace(
  /\n\/\*\s*AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_START[\s\S]*?AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END\s*\*\/\n?/g,
  "\n"
);

const block = `
/* AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_START
   保守性方針:
   - 既存renderReviewListPlaceholder本体を削らない。
   - 関数範囲解析をしない。
   - 末尾overrideだけで review_wait_items 表示を安定化する。
   - DB/API POSTなし。context GETだけ。
*/
(function(){
  "use strict";

  function t(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function h(value) {
    var s = t(value);
    if (typeof escapeHtml === "function") return escapeHtml(s);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function first(row, keys, fallback) {
    row = row || {};
    for (var i = 0; i < keys.length; i += 1) {
      var k = keys[i];
      if (Object.prototype.hasOwnProperty.call(row, k)) {
        var v = t(row[k]);
        if (v) return v;
      }
    }
    return fallback || "";
  }

  function currentContext() {
    if (!window.state || typeof window.state !== "object") {
      window.state = {};
    }

    var ctx = window.state.context && typeof window.state.context === "object"
      ? window.state.context
      : {};

    window.state.context = ctx;
    return ctx;
  }

  function normalizeContext(ctx) {
    if (!window.state || typeof window.state !== "object") {
      window.state = {};
    }

    if (!ctx || typeof ctx !== "object") {
      ctx = {};
    }

    var rows = [];
    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
    else if (Array.isArray(window.state.review_wait_items)) rows = window.state.review_wait_items;

    ctx.review_wait_items = rows;
    window.state.context = ctx;
    window.state.review_wait_items = rows;

    if (ctx.owner_civilization_id) window.state.owner_civilization_id = ctx.owner_civilization_id;
    if (ctx.aicm_user_company_id) window.state.selectedCompanyId = ctx.aicm_user_company_id;

    return ctx;
  }

  function reviewRows() {
    var ctx = normalizeContext(currentContext());
    var candidates = [
      ctx.review_wait_items,
      window.state.review_wait_items,
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

  function ownerId() {
    var ctx = currentContext();
    return t(
      window.state.owner_civilization_id ||
      window.state.ownerCivilizationId ||
      ctx.owner_civilization_id ||
      ctx.ownerCivilizationId ||
      "00000000-0000-4000-8000-000000000001"
    );
  }

  function companyId() {
    var ctx = currentContext();
    return t(
      window.state.selectedCompanyId ||
      window.state.aicm_user_company_id ||
      ctx.aicm_user_company_id ||
      ctx.selectedCompanyId ||
      ctx.company_id
    );
  }

  function companyName() {
    var ctx = currentContext();
    var cid = companyId();

    var direct = t(
      window.state.selectedCompanyName ||
      ctx.selectedCompanyName ||
      ctx.company_name ||
      ctx.aicm_user_company_name
    );

    if (direct) return direct;

    var companies = [];
    if (Array.isArray(ctx.companies)) companies = ctx.companies;
    else if (Array.isArray(window.state.companies)) companies = window.state.companies;

    for (var i = 0; i < companies.length; i += 1) {
      var row = companies[i] || {};
      var id = t(row.aicm_user_company_id || row.company_id || row.id);
      if (cid && id === cid) {
        return t(row.company_name || row.name || row.display_name) || "選択中";
      }
    }

    return "選択中";
  }

  function triggerRender() {
    if (typeof window.render === "function") {
      window.render();
      return;
    }
    if (typeof window.renderApp === "function") {
      window.renderApp();
      return;
    }
    if (typeof window.aicmRender === "function") {
      window.aicmRender();
    }
  }

  function hydrateIfNeeded() {
    if (!window.state || typeof window.state !== "object") {
      window.state = {};
    }

    if (window.state.aicmR8zV5CHydrating) return;
    if (reviewRows().length > 0) return;

    var oid = ownerId();
    var cid = companyId();

    if (!oid || !cid || typeof fetch !== "function") return;

    window.state.aicmR8zV5CHydrating = true;

    var params = new URLSearchParams();
    params.set("owner_civilization_id", oid);
    params.set("aicm_user_company_id", cid);
    params.set("v", "r8z_v5c_" + Date.now());

    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
      .then(function(res) {
        return res.text().then(function(bodyText) {
          var payload = {};
          try {
            payload = bodyText ? JSON.parse(bodyText) : {};
          } catch (error) {
            payload = {};
          }

          if (res.ok && payload && payload.result === "ok") {
            normalizeContext(payload);
          } else {
            window.state.aicmR8zV5CHydrationError = payload.error_message || ("context status " + String(res.status));
          }
        });
      })
      .catch(function(error) {
        window.state.aicmR8zV5CHydrationError = String(error && error.message ? error.message : error);
      })
      .finally(function() {
        window.state.aicmR8zV5CHydrating = false;
        if (window.state.screen === "review-list") {
          triggerRender();
        }
      });
  }

  function statusLabel(row) {
    var status = first(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
    if (status === "pending") return "承認待ち";
    if (status === "approved") return "承認済み";
    if (status === "returned") return "差し戻し";
    if (status === "archived") return "アーカイブ";
    return status;
  }

  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8ZV5C() {
    var rows = reviewRows();

    if (!rows.length) {
      hydrateIfNeeded();
    }

    var html = [
      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5c">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + h(companyName()) + '</strong></p>',
      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + h(String(rows.length)) + '件</strong></p>'
    ];

    if (!rows.length) {
      html.push(
        '  <article class="aicm-core-card">',
        '    <strong>レビュー・承認待ちはありません</strong>',
        '    <p>contextの反映待ちです。数秒後に再描画されます。まだ0件の場合は、画面stateのcompanyIdとcontext APIのcompanyId不一致を確認します。</p>',
        '  </article>',
        '</section>'
      );
      return html.join("");
    }

    rows.forEach(function(row, index) {
      var id = first(row, ["aicm_human_review_item_id", "review_id", "id"], "");
      var title = first(row, ["review_title", "title"], "レビュー項目");
      var kind = first(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
      var artifact = first(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
      var priority = first(row, ["priority_label", "priority_code"], "-");
      var summary = first(row, [
        "delivery_summary_text",
        "delivery_summary_preview",
        "result_summary_text",
        "ai_review_result_text",
        "review_summary_text",
        "summary"
      ], "要約未設定");
      var requestId = first(row, ["source_request_id", "request_id"], "");
      var workerUnitId = first(row, ["related_worker_work_unit_id"], "");

      html.push(
        '  <article class="aicm-core-card aicm-review-card">',
        '    <div class="aicm-review-head">',
        '      <div>',
        '        <p class="aicm-eyebrow">レビュー #' + h(String(index + 1)) + '</p>',
        '        <h3>' + h(title) + '</h3>',
        '      </div>',
        '      <strong>' + h(statusLabel(row)) + '</strong>',
        '    </div>',
        '    <div class="aicm-review-meta">',
        '      <span>種別: ' + h(kind) + '</span>',
        '      <span>成果物: ' + h(artifact) + '</span>',
        '      <span>優先度: ' + h(priority) + '</span>',
        requestId ? '      <span>request_id: ' + h(requestId) + '</span>' : '',
        workerUnitId ? '      <span>worker_unit: ' + h(workerUnitId) + '</span>' : '',
        '    </div>',
        '    <section class="aicm-review-summary">',
        '      <h3>納品サマリー</h3>',
        '      <p>' + h(summary) + '</p>',
        '    </section>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + h(id) + '">承認</button>',
        '      <button type="button" data-core-action="human-review-return" data-review-id="' + h(id) + '">差し戻し</button>',
        '    </div>',
        '  </article>'
      );
    });

    html.push('</section>');
    return html.join("");
  };

  window.aicmR8zV5CReviewRows = reviewRows;
  window.aicmR8zV5CHydrateReviewContext = hydrateIfNeeded;
})();
AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END */
`;

text = text.replace(/\s*$/, "\n") + block + "\n";

const after = {
  v5cStart: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_START/g) || []).length,
  v5cEnd: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END/g) || []).length,
  stableRenderer: (text.match(/aicm-review-list-stable-r8z-v5c/g) || []).length,
  overrideAssignment: (text.match(/window\.renderReviewListPlaceholder\s*=/g) || []).length,
  renderReviewListPlaceholderFunction: (text.match(/function\s+renderReviewListPlaceholder\s*\(/g) || []).length,
  reviewWaitItemsRefs: (text.match(/review_wait_items/g) || []).length
};

if (after.v5cStart !== 1) throw new Error("V5C start marker count invalid: " + after.v5cStart);
if (after.v5cEnd !== 1) throw new Error("V5C end marker count invalid: " + after.v5cEnd);
if (after.stableRenderer !== 1) throw new Error("stable renderer marker count invalid: " + after.stableRenderer);
if (after.overrideAssignment < 1) throw new Error("override assignment missing");

fs.writeFileSync(corePath, text, "utf8");

console.log(JSON.stringify({
  status: "PATCHED_APPEND_ONLY",
  before,
  after,
  core_file_write: "YES",
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
}, null, 2));
