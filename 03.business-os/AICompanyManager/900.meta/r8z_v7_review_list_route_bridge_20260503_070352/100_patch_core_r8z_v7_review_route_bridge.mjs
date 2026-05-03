import fs from "node:fs";

const corePath = process.env.CORE;
if (!corePath) throw new Error("CORE env is required");

let text = fs.readFileSync(corePath, "utf8");

const before = {
  directRouteCall: (text.match(/html\s*=\s*renderReviewListPlaceholder\(\);/g) || []).length,
  v7RoutePatch: (text.match(/AICM_R8Z_V7_ROUTE_BRIDGE_CALL/g) || []).length,
  v7Marker: (text.match(/AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START/g) || []).length,
  v5dMarker: (text.match(/AICM_R8Z_V5D_REVIEW_LIST_APPEND_OVERRIDE_START/g) || []).length,
  brokenV5C: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END\s*\*\//g) || []).length
};

if (before.brokenV5C !== 0) {
  throw new Error("broken V5C marker remains; stop before patch");
}

// Rerun cleanup for V7 only.
text = text.replace(
  /\n?\/\/ AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START[\s\S]*?\/\/ AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END\n?/g,
  "\n"
);

// Reset previous V7 route bridge if rerun.
text = text.replace(
  /^([ \t]*)html\s*=\s*\(typeof window !== "undefined" && typeof window\.aicmR8zV7RenderReviewList === "function"[\s\S]*?AICM_R8Z_V7_ROUTE_BRIDGE_CALL.*$/gm,
  "$1html = renderReviewListPlaceholder();"
);

let routePatchCount = 0;
text = text.replace(
  /^([ \t]*)html\s*=\s*renderReviewListPlaceholder\(\);\s*$/m,
  function (_match, indent) {
    routePatchCount += 1;
    return indent + 'html = (typeof window !== "undefined" && typeof window.aicmR8zV7RenderReviewList === "function" ? window.aicmR8zV7RenderReviewList(state) : renderReviewListPlaceholder()); // AICM_R8Z_V7_ROUTE_BRIDGE_CALL';
  }
);

if (routePatchCount !== 1) {
  throw new Error("route patch count invalid: " + routePatchCount);
}

const bridge = `
// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START
(function () {
  "use strict";

  function t(value) {
    if (value === null || typeof value === "undefined") return "";
    return String(value).trim();
  }

  function esc(value) {
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
      var key = keys[i];
      if (Object.prototype.hasOwnProperty.call(row, key)) {
        var value = t(row[key]);
        if (value) return value;
      }
    }
    return fallback || "";
  }

  function normalize(appState, ctx) {
    appState = appState || {};
    if (!ctx || typeof ctx !== "object") ctx = {};

    var rows = [];
    if (Array.isArray(ctx.review_wait_items)) rows = ctx.review_wait_items;
    else if (Array.isArray(ctx.reviewWaitItems)) rows = ctx.reviewWaitItems;
    else if (Array.isArray(ctx.human_review_wait_items)) rows = ctx.human_review_wait_items;
    else if (Array.isArray(ctx.humanReviewWaitItems)) rows = ctx.humanReviewWaitItems;
    else if (Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;

    ctx.review_wait_items = rows;
    appState.context = ctx;
    appState.review_wait_items = rows;

    if (ctx.owner_civilization_id) appState.owner_civilization_id = ctx.owner_civilization_id;
    if (ctx.aicm_user_company_id) appState.selectedCompanyId = ctx.aicm_user_company_id;

    return ctx;
  }

  function ctx(appState) {
    appState = appState || {};
    return normalize(appState, appState.context && typeof appState.context === "object" ? appState.context : {});
  }

  function rows(appState) {
    appState = appState || {};
    var c = ctx(appState);
    var candidates = [
      c.review_wait_items,
      appState.review_wait_items,
      c.reviewWaitItems,
      c.human_review_wait_items,
      c.humanReviewWaitItems
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

  function ownerId(appState) {
    appState = appState || {};
    var c = appState.context || {};
    return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
  }

  function companyId(appState) {
    appState = appState || {};
    var c = appState.context || {};
    return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id);
  }

  function companyName(appState) {
    appState = appState || {};
    var c = appState.context || {};
    var cid = companyId(appState);

    var direct = t(appState.selectedCompanyName || c.selectedCompanyName || c.company_name || c.aicm_user_company_name);
    if (direct) return direct;

    var companies = Array.isArray(c.companies) ? c.companies : [];
    for (var i = 0; i < companies.length; i += 1) {
      var row = companies[i] || {};
      var id = t(row.aicm_user_company_id || row.company_id || row.id);
      if (cid && id === cid) return t(row.company_name || row.name || row.display_name) || "選択中";
    }
    return "選択中";
  }

  function rerender() {
    if (typeof window.render === "function") return window.render();
    if (typeof window.renderApp === "function") return window.renderApp();
    if (typeof window.aicmRender === "function") return window.aicmRender();
  }

  function hydrateIfNeeded(appState) {
    appState = appState || {};
    if (appState.aicmR8zV7Hydrating) return;
    if (rows(appState).length > 0) return;

    var owner = ownerId(appState);
    var company = companyId(appState);

    if (!owner || !company || typeof fetch !== "function") {
      appState.aicmR8zV7HydrationError = "missing owner/company owner=" + owner + " company=" + company;
      return;
    }

    appState.aicmR8zV7Hydrating = true;

    var params = new URLSearchParams();
    params.set("owner_civilization_id", owner);
    params.set("aicm_user_company_id", company);
    params.set("v", "r8z_v7_" + Date.now());

    fetch("/api/aicm/v2/context?" + params.toString(), { method: "GET" })
      .then(function (res) {
        return res.text().then(function (bodyText) {
          var payload = {};
          try {
            payload = bodyText ? JSON.parse(bodyText) : {};
          } catch (_error) {
            payload = {};
          }

          if (res.ok && payload && payload.result === "ok") {
            normalize(appState, payload);
          } else {
            appState.aicmR8zV7HydrationError = payload.error_message || ("context status " + String(res.status));
          }
        });
      })
      .catch(function (error) {
        appState.aicmR8zV7HydrationError = String(error && error.message ? error.message : error);
      })
      .finally(function () {
        appState.aicmR8zV7Hydrating = false;
        if (appState.screen === "review-list") rerender();
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

  window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {
    appState = appState || {};
    var list = rows(appState);

    if (!list.length) hydrateIfNeeded(appState);

    var debug = [
      "selectedCompanyId=" + companyId(appState),
      "owner=" + ownerId(appState),
      "rows=" + String(list.length),
      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",
      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : ""
    ].filter(Boolean).join(" / ");

    var html = [
      '<section class="aicm-core-card aicm-review-list-stable-r8z-v7">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>納品サマリー確認</h2>',
      '  <p class="aicm-selected-note">対象会社: <strong>' + esc(companyName(appState)) + '</strong></p>',
      '  <p class="aicm-selected-note">レビュー・承認待ち: <strong>' + esc(String(list.length)) + '件</strong></p>',
      '  <p class="aicm-selected-note">R8Z-V7: ' + esc(debug) + '</p>'
    ];

    if (!list.length) {
      html.push(
        '  <article class="aicm-core-card">',
        '    <strong>レビュー・承認待ちはありません</strong>',
        '    <p>context反映待ちです。数秒後に再描画されます。</p>',
        '  </article>',
        '</section>'
      );
      return html.join("");
    }

    list.forEach(function (row, index) {
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
        '        <p class="aicm-eyebrow">レビュー #' + esc(String(index + 1)) + '</p>',
        '        <h3>' + esc(title) + '</h3>',
        '      </div>',
        '      <strong>' + esc(statusLabel(row)) + '</strong>',
        '    </div>',
        '    <div class="aicm-review-meta">',
        '      <span>種別: ' + esc(kind) + '</span>',
        '      <span>成果物: ' + esc(artifact) + '</span>',
        '      <span>優先度: ' + esc(priority) + '</span>',
        requestId ? '      <span>request_id: ' + esc(requestId) + '</span>' : '',
        workerUnitId ? '      <span>worker_unit: ' + esc(workerUnitId) + '</span>' : '',
        '    </div>',
        '    <section class="aicm-review-summary">',
        '      <h3>納品サマリー</h3>',
        '      <p>' + esc(summary) + '</p>',
        '    </section>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="human-review-approve" data-review-id="' + esc(id) + '">承認</button>',
        '      <button type="button" data-core-action="human-review-return" data-review-id="' + esc(id) + '">差し戻し</button>',
        '    </div>',
        '  </article>'
      );
    });

    html.push('</section>');
    return html.join("");
  };
})();
// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END
`;

text = text.replace(/\s*$/, "\n") + bridge + "\n";

const after = {
  directRouteCall: (text.match(/html\s*=\s*renderReviewListPlaceholder\(\);/g) || []).length,
  v7RoutePatch: (text.match(/AICM_R8Z_V7_ROUTE_BRIDGE_CALL/g) || []).length,
  v7Marker: (text.match(/AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START/g) || []).length,
  v7Renderer: (text.match(/aicmR8zV7RenderReviewList/g) || []).length,
  stableClass: (text.match(/aicm-review-list-stable-r8z-v7/g) || []).length,
  brokenV5C: (text.match(/AICM_R8Z_V5C_REVIEW_LIST_APPEND_OVERRIDE_END\s*\*\//g) || []).length
};

if (after.brokenV5C !== 0) throw new Error("broken V5C marker remains after patch");
if (after.directRouteCall !== 0) throw new Error("direct route call still remains: " + after.directRouteCall);
if (after.v7RoutePatch !== 1) throw new Error("v7 route patch count invalid: " + after.v7RoutePatch);
if (after.v7Marker !== 1) throw new Error("v7 marker count invalid: " + after.v7Marker);
if (after.stableClass !== 1) throw new Error("stable class count invalid: " + after.stableClass);

fs.writeFileSync(corePath, text, "utf8");

console.log(JSON.stringify({
  status: "PATCHED_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE",
  before,
  after,
  core_file_write: "YES",
  db_write: "NO",
  api_post: "NO",
  persistent_db_write: "NO",
  physical_delete: "NO"
}, null, 2));
