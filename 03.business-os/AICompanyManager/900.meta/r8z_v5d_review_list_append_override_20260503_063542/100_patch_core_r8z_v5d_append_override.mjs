import fs from "node:fs";

const corePath = process.env.CORE;
if (!corePath) throw new Error("CORE env is required");

let text = fs.readFileSync(corePath, "utf8");

const before = {
  v5cBrokenEnd: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END\s*\*\//g) || []).length,
  v5dStart: (text.match(/\/\/ AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START/g) || []).length,
  v5dEnd: (text.match(/\/\/ AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END/g) || []).length,
  renderReviewListPlaceholderFunction: (text.match(/function\s+renderReviewListPlaceholder\s*\(/g) || []).length,
  windowOverride: (text.match(/window\.renderReviewListPlaceholder\s*=/g) || []).length
};

// Remove failed V5C block if it somehow remained.
text = text.replace(
  /\n?\/\*\s*AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_START[\s\S]*?AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END\s*\*\/\n?/g,
  "\n"
);

// Remove rerun V5D block only.
text = text.replace(
  /\n?\/\/ AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START[\s\S]*?\/\/ AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END\n?/g,
  "\n"
);

const block = `
// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START
(function () {
  "use strict";

  function r8zV5dText(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function r8zV5dEscape(value) {
    var s = r8zV5dText(value);
    if (typeof escapeHtml === "function") return escapeHtml(s);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function r8zV5dFirst(row, keys, fallback) {
    row = row || {};
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        var value = r8zV5dText(row[key]);
        if (value) return value;
      }
    }
    return fallback || "";
  }

  function r8zV5dState() {
    if (!window.state || typeof window.state !== "object") {
      window.state = {};
    }
    return window.state;
  }

  function r8zV5dContext() {
    var state = r8zV5dState();
    if (!state.context || typeof state.context !== "object") {
      state.context = {};
    }
    return state.context;
  }

  function r8zV5dNormalizeContext(ctx) {
    var state = r8zV5dState();

    if (!ctx || typeof ctx !== "object") {
      ctx = {};
    }

    var rows = [];
    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
    else if (Array.isArray(state.review_wait_items)) rows = state.review_wait_items;

    ctx.review_wait_items = rows;
    state.context = ctx;
    state.review_wait_items = rows;

    if (ctx.owner_civilization_id) state.owner_civilization_id = ctx.owner_civilization_id;
    if (ctx.aicm_user_company_id) state.selectedCompanyId = ctx.aicm_user_company_id;

    return ctx;
  }

  function r8zV5dReviewRows() {
    var state = r8zV5dState();
    var ctx = r8zV5dNormalizeContext(r8zV5dContext());

    var candidates = [
      ctx.review_wait_items,
      state.review_wait_items,
      ctx.reviewWaitItems,
      ctx.human_review_wait_items,
      ctx.humanReviewWaitItems
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      if (Array.isArray(candidates[i])) {
        return candidates[i].filter(function (row) {
          return row && typeof row === "object";
        });
      }
    }

    return [];
  }

  function r8zV5dOwnerId() {
    var state = r8zV5dState();
    var ctx = r8zV5dContext();
    return r8zV5dText(
      state.owner_civilization_id ||
      state.ownerCivilizationId ||
      ctx.owner_civilization_id ||
      ctx.ownerCivilizationId ||
      "00000000-0000-4000-8000-000000000001"
    );
  }

  function r8zV5dCompanyId() {
    var state = r8zV5dState();
    var ctx = r8zV5dContext();
    return r8zV5dText(
      state.selectedCompanyId ||
      state.aicm_user_company_id ||
      ctx.aicm_user_company_id ||
      ctx.selectedCompanyId ||
      ctx.company_id
    );
  }

  function r8zV5dCompanyName() {
    var state = r8zV5dState();
    var ctx = r8zV5dContext();
    var cid = r8zV5dCompanyId();

    var direct = r8zV5dText(
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
      var id = r8zV5dText(row.aicm_user_company_id || row.company_id || row.id);
      if (cid && id === cid) {
        return r8zV5dText(row.company_name || row.name || row.display_name) || "選択中";
      }
    }

    return "選択中";
  }

  function r8zV5dRenderAgain() {
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

  function r8zV5dHydrateIfNeeded() {
    var state = r8zV5dState();
    if (state.aicmR8zV5dHydrating) return;
    if (r8zV5dReviewRows().length > 0) return;

    var owner = r8zV5dOwnerId();
    var company = r8zV5dCompanyId();

    if (!owner || !company || typeof fetch !== "function") return;

    state.aicmR8zV5dHydrating = true;

    var params = new URLSearchParams();
    params.set("owner_civilization_id", owner);
    params.set("aicm_user_company_id", company);
    params.set("v", "r8z_v5d_" + Date.now());

    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
      .then(function (res) {
        return res.text().then(function (bodyText) {
          var payload = {};
          try {
            payload = bodyText ? JSON.parse(bodyText) : {};
          } catch (error) {
            payload = {};
          }

          if (res.ok && payload && payload.result === "ok") {
            r8zV5dNormalizeContext(payload);
          } else {
            state.aicmR8zV5dHydrationError = payload.error_message || ("context status " + String(res.status));
          }
        });
      })
      .catch(function (error) {
        state.aicmR8zV5dHydrationError = String(error && error.message ? error.message : error);
      })
      .finally(function () {
        state.aicmR8zV5dHydrating = false;
        if (state.screen === "review-list") {
          r8zV5dRenderAgain();
        }
      });
  }

  function r8zV5dStatusLabel(row) {
    var status = r8zV5dFirst(row, ["human_review_status_label", "human_review_status_code", "review_status"], "pending");
    if (status === "pending") return "承認待ち";
    if (status === "approved") return "承認済み";
    if (status === "returned") return "差し戻し";
    if (status === "archived") return "アーカイブ";
    return status;
  }

  window.renderReviewListPlaceholder = function renderReviewListPlaceholderR8zV5d() {
    var rows = r8zV5dReviewRows();

    if (!rows.length) {
      r8zV5dHydrateIfNeeded();
    }

    var html = [
      '<section class="aicm-core-card aicm-review-list-stable-r8z-v5d">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + r8zV5dEscape(r8zV5dCompanyName()) + '</strong></p>',
      '  <p class="aicm-selected-note">人間レビューは、設計書・実装・例外対応の納品時サマリーだけを確認します。AIレビューは内部工程で通常通り実施されます。</p>',
      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + r8zV5dEscape(String(rows.length)) + '件</strong></p>'
    ];

    if (!rows.length) {
      var state = r8zV5dState();
      var err = r8zV5dText(state.aicmR8zV5dHydrationError);
      html.push(
        '  <article class="aicm-core-card">',
        '    <strong>レビュー・承認待ちはありません</strong>',
        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
        err ? '    <p>context error: ' + r8zV5dEscape(err) + '</p>' : '',
        '  </article>',
        '</section>'
      );
      return html.join("");
    }

    rows.forEach(function (row, index) {
      var id = r8zV5dFirst(row, ["aicm_human_review_item_id", "review_id", "id"], "");
      var title = r8zV5dFirst(row, ["review_title", "title"], "レビュー項目");
      var kind = r8zV5dFirst(row, ["review_kind_label", "review_kind_code"], "納品サマリー");
      var artifact = r8zV5dFirst(row, ["artifact_kind_label", "artifact_kind_code"], "delivery_package");
      var priority = r8zV5dFirst(row, ["priority_label", "priority_code"], "-");
      var summary = r8zV5dFirst(row, [
        "delivery_summary_text",
        "delivery_summary_preview",
        "result_summary_text",
        "ai_review_result_text",
        "review_summary_text",
        "summary"
      ], "要約未設定");
      var requestId = r8zV5dFirst(row, ["source_request_id", "request_id"], "");
      var workerUnitId = r8zV5dFirst(row, ["related_worker_work_unit_id"], "");

      html.push(
        '  <article class="aicm-core-card aicm-review-card">',
        '    <div class="aicm-review-head">',
        '      <div>',
        '        <p class="aicm-eyebrow">レビュー #' + r8zV5dEscape(String(index + 1)) + '</p>',
        '        <h3>' + r8zV5dEscape(title) + '</h3>',
        '      </div>',
        '      <strong>' + r8zV5dEscape(r8zV5dStatusLabel(row)) + '</strong>',
        '    </div>',
        '    <div class="aicm-review-meta">',
        '      <span>種別: ' + r8zV5dEscape(kind) + '</span>',
        '      <span>成果物: ' + r8zV5dEscape(artifact) + '</span>',
        '      <span>優先度: ' + r8zV5dEscape(priority) + '</span>',
        requestId ? '      <span>request_id: ' + r8zV5dEscape(requestId) + '</span>' : '',
        workerUnitId ? '      <span>worker_unit: ' + r8zV5dEscape(workerUnitId) + '</span>' : '',
        '    </div>',
        '    <section class="aicm-review-summary">',
        '      <h3>納品サマリー</h3>',
        '      <p>' + r8zV5dEscape(summary) + '</p>',
        '    </section>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + r8zV5dEscape(id) + '">承認</button>',
        '      <button type="button" data-core-action="human-review-return" data-review-id="' + r8zV5dEscape(id) + '">差し戻し</button>',
        '    </div>',
        '  </article>'
      );
    });

    html.push('</section>');
    return html.join("");
  };

  window.aicmR8zV5dReviewRows = r8zV5dReviewRows;
  window.aicmR8zV5dHydrateReviewContext = r8zV5dHydrateIfNeeded;
})();
// AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END
`;

text = text.replace(/\s*$/, "\n") + block + "\n";

const after = {
  v5cBrokenEnd: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END\s*\*\//g) || []).length,
  v5dStart: (text.match(/\/\/ AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START/g) || []).length,
  v5dEnd: (text.match(/\/\/ AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_END/g) || []).length,
  stableRenderer: (text.match(/aicm-review-list-stable-r8z-v5d/g) || []).length,
  windowOverride: (text.match(/window\.renderReviewListPlaceholder\s*=/g) || []).length,
  renderReviewListPlaceholderFunction: (text.match(/function\s+renderReviewListPlaceholder\s*\(/g) || []).length
};

if (after.v5cBrokenEnd !== 0) throw new Error("broken V5C marker still exists: " + after.v5cBrokenEnd);
if (after.v5dStart !== 1) throw new Error("V5D start marker count invalid: " + after.v5dStart);
if (after.v5dEnd !== 1) throw new Error("V5D end marker count invalid: " + after.v5dEnd);
if (after.stableRenderer !== 1) throw new Error("stable renderer marker count invalid: " + after.stableRenderer);
if (after.windowOverride < 1) throw new Error("window override missing");

fs.writeFileSync(corePath, text, "utf8");

console.log(JSON.stringify({
  status: "PATCHED_APPEND_ONLY_V5D",
  before,
  after,
  core_file_write: "YES",
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
}, null, 2));
