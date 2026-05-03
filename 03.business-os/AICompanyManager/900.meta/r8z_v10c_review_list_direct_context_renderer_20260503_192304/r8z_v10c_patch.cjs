const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V10C_REVIEW_LIST_DIRECT_CONTEXT_RENDERER";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE")) {
  log.push("ERROR: V7 review-list route bridge marker not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

if (!src.includes('state.screen === "review-list"')) {
  log.push("ERROR: review-list render route not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const helper = `

  // ${marker}_START
  // Final review-list renderer override. Scope is review-list display only.
  // It does not touch task ledger / leader handoff / delete paths.
  (function installAicmR8zV10cReviewListDirectContextRenderer() {
    function v10cText(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function v10cEsc(value) {
      var text = v10cText(value);
      if (typeof escapeHtml === "function") return escapeHtml(text);
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function v10cState(appState) {
      if (appState && typeof appState === "object") return appState;
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      return {};
    }

    function v10cContext(appState) {
      appState = v10cState(appState);
      if (!appState.context || typeof appState.context !== "object") appState.context = {};
      return appState.context;
    }

    function v10cOwnerId(appState) {
      appState = v10cState(appState);
      var ctx = v10cContext(appState);
      return v10cText(
        appState.owner_civilization_id ||
        appState.ownerCivilizationId ||
        ctx.owner_civilization_id ||
        ctx.ownerCivilizationId ||
        "00000000-0000-4000-8000-000000000001"
      );
    }

    function v10cCompanyId(appState) {
      appState = v10cState(appState);
      var ctx = v10cContext(appState);
      return v10cText(
        appState.selectedCompanyId ||
        appState.aicm_user_company_id ||
        appState.companyId ||
        ctx.aicm_user_company_id ||
        ctx.selectedCompanyId ||
        ctx.company_id ||
        ""
      );
    }

    function v10cRowsFromPayload(payload) {
      payload = payload && typeof payload === "object" ? payload : {};

      var candidates = [
        payload.review_wait_items,
        payload.human_review_wait_items,
        payload.humanReviewWaitItems,
        payload.context && payload.context.review_wait_items,
        payload.data && payload.data.review_wait_items
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

    function v10cMergePayload(appState, payload) {
      appState = v10cState(appState);
      payload = payload && typeof payload === "object" ? payload : {};

      var rows = v10cRowsFromPayload(payload);
      var ctx = v10cContext(appState);

      if (payload.result === "ok") {
        Object.keys(payload).forEach(function(key) {
          ctx[key] = payload[key];
        });
      }

      if (rows.length > 0) {
        ctx.review_wait_items = rows;
        appState.review_wait_items = rows;

        if (typeof state !== "undefined" && state && state !== appState) {
          if (!state.context || typeof state.context !== "object") state.context = {};
          state.context.review_wait_items = rows;
          state.review_wait_items = rows;
        }
      }

      if (payload.owner_civilization_id) {
        appState.owner_civilization_id = payload.owner_civilization_id;
      }

      appState.aicmR8zV10cPayloadRows = rows.length;
      appState.aicmR8zV10cMergedAt = new Date().toISOString();

      return rows;
    }

    function v10cRows(appState) {
      appState = v10cState(appState);
      var ctx = v10cContext(appState);

      var rows = v10cRowsFromPayload(ctx);
      if (!rows.length && Array.isArray(appState.review_wait_items)) rows = appState.review_wait_items;

      var companyId = v10cCompanyId(appState);
      if (companyId) {
        rows = rows.filter(function(row) {
          var rowCompany = v10cText(row.aicm_user_company_id || row.company_id || row.companyId);
          return !rowCompany || rowCompany === companyId;
        });
      }

      return rows;
    }

    function v10cSyncFetch(appState) {
      appState = v10cState(appState);

      if (v10cRows(appState).length > 0) return v10cRows(appState);
      if (typeof XMLHttpRequest === "undefined") {
        appState.aicmR8zV10cError = "XMLHttpRequest unavailable";
        return [];
      }

      var owner = v10cOwnerId(appState);
      var company = v10cCompanyId(appState);

      if (!owner) {
        appState.aicmR8zV10cError = "owner missing";
        return [];
      }

      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (company) url += "&aicm_user_company_id=" + encodeURIComponent(company);
      url += "&v=r8z_v10c_" + Date.now();

      appState.aicmR8zV10cFetchUrl = url;
      appState.aicmR8zV10cFetchStatus = "start";

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        appState.aicmR8zV10cHttpStatus = xhr.status;
        appState.aicmR8zV10cFetchStatus = "done";

        if (xhr.status < 200 || xhr.status >= 300) {
          appState.aicmR8zV10cError = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          appState.aicmR8zV10cError = "parse error: " + v10cText(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        var rows = v10cMergePayload(appState, payload);
        appState.aicmR8zV10cFetchStatus = "merged";
        return rows;
      } catch (error) {
        appState.aicmR8zV10cFetchStatus = "error";
        appState.aicmR8zV10cError = v10cText(error && error.message ? error.message : error);
        return [];
      }
    }

    function v10cReviewId(row) {
      return v10cText(
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      );
    }

    function v10cRenderRow(row, index) {
      var reviewId = v10cReviewId(row);
      var title = v10cText(row.review_title || row.title || row.delivery_title || "レビュー項目");
      var summary = v10cText(row.delivery_summary_text || row.summary || row.description || "");
      var aiReview = v10cText(row.ai_review_result_text || "");
      var kind = v10cText(row.review_kind_label || row.review_kind_code || "");
      var artifact = v10cText(row.artifact_kind_label || row.artifact_kind_code || "");
      var priority = v10cText(row.priority_code || "");
      var requested = v10cText(row.requested_at || row.created_at || "");
      var responsible = v10cText(row.responsible_ai_label || row.requested_by_ai_label || "");

      var buttons = reviewId
        ? [
            '<div class="aicm-dashboard-action-row">',
            '  <button type="button" data-core-action="human-review-approve" data-review-id="' + v10cEsc(reviewId) + '" data-human-review-id="' + v10cEsc(reviewId) + '">承認</button>',
            '  <button type="button" data-core-action="human-review-return" data-review-id="' + v10cEsc(reviewId) + '" data-human-review-id="' + v10cEsc(reviewId) + '">差し戻し</button>',
            '</div>'
          ].join("")
        : [
            '<p class="aicm-core-message aicm-core-message-error">',
            'レビューIDがcontextに含まれていないため、承認/差し戻しは次工程でID露出を確認します。',
            '</p>'
          ].join("");

      return [
        '<article class="aicm-core-card" style="border:1px solid #dbeafe;">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + v10cEsc(String(index + 1)) + '</p>',
        '  <h3>' + v10cEsc(title) + '</h3>',
        summary ? '  <p class="aicm-selected-note">' + v10cEsc(summary) + '</p>' : '',
        aiReview ? '  <p class="aicm-selected-note"><strong>AIレビュー:</strong> ' + v10cEsc(aiReview) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>種別</dt><dd>' + v10cEsc(kind || "-") + '</dd>',
        '    <dt>成果物</dt><dd>' + v10cEsc(artifact || "-") + '</dd>',
        '    <dt>優先度</dt><dd>' + v10cEsc(priority || "-") + '</dd>',
        '    <dt>依頼日時</dt><dd>' + v10cEsc(requested || "-") + '</dd>',
        '    <dt>担当AI</dt><dd>' + v10cEsc(responsible || "-") + '</dd>',
        '    <dt>review_id</dt><dd>' + v10cEsc(reviewId || "-") + '</dd>',
        '  </dl>',
        buttons,
        '</article>'
      ].join("");
    }

    function v10cRenderReviewList(appState) {
      appState = v10cState(appState);

      var beforeRows = v10cRows(appState);
      if (!beforeRows.length) {
        v10cSyncFetch(appState);
      }

      var rows = v10cRows(appState);
      var debug = [
        "V10C",
        "selectedCompanyId=" + v10cCompanyId(appState),
        "owner=" + v10cOwnerId(appState),
        "rows=" + String(rows.length),
        "payloadRows=" + String(appState.aicmR8zV10cPayloadRows !== undefined ? appState.aicmR8zV10cPayloadRows : "na"),
        "http=" + String(appState.aicmR8zV10cHttpStatus !== undefined ? appState.aicmR8zV10cHttpStatus : "na"),
        "status=" + v10cText(appState.aicmR8zV10cFetchStatus || "none"),
        appState.aicmR8zV10cError ? "error=" + v10cText(appState.aicmR8zV10cError) : ""
      ].filter(Boolean).join(" / ");

      var body = rows.length
        ? [
            '<section class="aicm-core-card">',
            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
            '  <h2>レビュー・承認待ち: ' + v10cEsc(String(rows.length)) + '件</h2>',
            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
            '</section>',
            rows.map(v10cRenderRow).join("")
          ].join("")
        : [
            '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
            '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
            '  <h2>レビュー・承認待ち: 0件</h2>',
            '  <p class="aicm-selected-note">' + v10cEsc(debug) + '</p>',
            '  <p class="aicm-core-message aicm-core-message-error">context APIからレビュー待ちを取得できませんでした。</p>',
            '  <div class="aicm-dashboard-action-row">',
            '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
            '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳へ</button>',
            '  </div>',
            '</section>'
          ].join("");

      if (typeof renderShell === "function") {
        return renderShell(body);
      }

      return body;
    }

    if (typeof window !== "undefined") {
      window.aicmR8zV10cRenderReviewList = v10cRenderReviewList;
      window.aicmR8zV7RenderReviewList = v10cRenderReviewList;
    }
  })();
  // ${marker}_END

`;

const anchors = [
  "// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_END",
  "// AICM_R8Z_V7_REVIEW_LIST_ROUTE_BRIDGE_START"
];

let inserted = false;

for (const anchor of anchors) {
  const idx = src.indexOf(anchor);
  if (idx >= 0) {
    src = src.slice(0, idx) + helper + "\n" + src.slice(idx);
    log.push("PATCH_APPLIED: inserted before " + anchor);
    inserted = true;
    break;
  }
}

if (!inserted) {
  log.push("ERROR: safe review-list anchor not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(4);
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
