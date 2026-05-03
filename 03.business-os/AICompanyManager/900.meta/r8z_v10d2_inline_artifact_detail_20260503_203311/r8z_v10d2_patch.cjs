const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD")) {
  log.push("ERROR: V10D marker not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const helper = `

  // ${marker}_START
  // V10D2: show artifact detail inline directly under the clicked review row.
  // Scope: review-list only. No DB write / no API POST.
  (function installAicmR8zV10d2InlineArtifactDetail() {
    function t(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var text = t(value);
      if (typeof escapeHtml === "function") return escapeHtml(text);
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function app(appState) {
      if (appState && typeof appState === "object") return appState;
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      return {};
    }

    function ctx(appState) {
      appState = app(appState);
      if (!appState.context || typeof appState.context !== "object") appState.context = {};
      return appState.context;
    }

    function ownerId(appState) {
      appState = app(appState);
      var c = ctx(appState);
      return t(appState.owner_civilization_id || appState.ownerCivilizationId || c.owner_civilization_id || c.ownerCivilizationId || "00000000-0000-4000-8000-000000000001");
    }

    function companyId(appState) {
      appState = app(appState);
      var c = ctx(appState);
      return t(appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || c.aicm_user_company_id || c.selectedCompanyId || c.company_id || "");
    }

    function rowsFromPayload(payload) {
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

    function rows(appState) {
      appState = app(appState);
      var c = ctx(appState);
      var r = rowsFromPayload(c);

      if (!r.length && Array.isArray(appState.review_wait_items)) r = appState.review_wait_items;

      var cid = companyId(appState);
      if (cid) {
        r = r.filter(function(row) {
          var rowCompany = t(row.aicm_user_company_id || row.company_id || row.companyId);
          return !rowCompany || rowCompany === cid;
        });
      }

      return r;
    }

    function mergePayload(appState, payload) {
      appState = app(appState);
      payload = payload && typeof payload === "object" ? payload : {};
      var c = ctx(appState);
      var r = rowsFromPayload(payload);

      if (payload.result === "ok") {
        Object.keys(payload).forEach(function(key) {
          c[key] = payload[key];
        });
      }

      if (r.length) {
        c.review_wait_items = r;
        appState.review_wait_items = r;
      }

      appState.aicmR8zV10d2PayloadRows = r.length;
      appState.aicmR8zV10d2MergedAt = new Date().toISOString();
      return r;
    }

    function syncFetch(appState) {
      appState = app(appState);
      if (rows(appState).length > 0) return rows(appState);

      if (typeof XMLHttpRequest === "undefined") {
        appState.aicmR8zV10d2Error = "XMLHttpRequest unavailable";
        return [];
      }

      var owner = ownerId(appState);
      var cid = companyId(appState);
      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (cid) url += "&aicm_user_company_id=" + encodeURIComponent(cid);
      url += "&v=r8z_v10d2_" + Date.now();

      appState.aicmR8zV10d2FetchUrl = url;
      appState.aicmR8zV10d2FetchStatus = "start";

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        appState.aicmR8zV10d2HttpStatus = xhr.status;

        if (xhr.status < 200 || xhr.status >= 300) {
          appState.aicmR8zV10d2FetchStatus = "http-error";
          appState.aicmR8zV10d2Error = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          appState.aicmR8zV10d2FetchStatus = "parse-error";
          appState.aicmR8zV10d2Error = t(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        appState.aicmR8zV10d2FetchStatus = "merged";
        return mergePayload(appState, payload);
      } catch (error) {
        appState.aicmR8zV10d2FetchStatus = "error";
        appState.aicmR8zV10d2Error = t(error && error.message ? error.message : error);
        return [];
      }
    }

    function reviewId(row) {
      return t(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function selectedReviewId(appState) {
      appState = app(appState);
      return t(appState.aicmR8zV10d2SelectedReviewId || appState.aicmR8zV10dSelectedReviewId || "");
    }

    function meta(row) {
      var m = row && (row.metadata_jsonb || row.metadata || row.meta) || {};
      if (typeof m === "string") {
        try {
          m = JSON.parse(m);
        } catch (_) {
          m = { raw_metadata_text: m };
        }
      }
      if (!m || typeof m !== "object") m = {};
      return m;
    }

    function jsonPreview(value, maxLen) {
      var text = "";
      try {
        text = JSON.stringify(value || {}, null, 2);
      } catch (_) {
        text = t(value);
      }

      maxLen = maxLen || 2600;
      if (text.length > maxLen) text = text.slice(0, maxLen) + "\\n...省略";
      return text;
    }

    function renderField(label, value) {
      var text = t(value) || "-";
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text) + '</dd>';
    }

    function renderTextSection(label, value) {
      var text = t(value);
      if (!text) return "";
      return [
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
        '  <p class="aicm-selected-note" style="white-space:pre-wrap;">' + esc(text) + '</p>',
        '</section>'
      ].join("");
    }

    function renderArtifactLink(row) {
      var link = t(row && row.artifact_link);
      if (!link) return '<p class="aicm-selected-note">成果物リンク: 未登録</p>';

      return [
        '<p class="aicm-selected-note">',
        '成果物リンク: <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(link) + '</a>',
        '</p>'
      ].join("");
    }

    function nestedOutputs(row) {
      var m = meta(row);
      var ocp = m.output_collection_payload || m.aiworker_output_collection_payload || {};
      var blocks = [];

      function addBlock(label, value) {
        if (!Array.isArray(value) || !value.length) return;
        blocks.push([
          '<section class="aicm-core-card" style="background:#f8fafc;">',
          '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
          '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:300px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(value, 2400)) + '</pre>',
          '</section>'
        ].join(""));
      }

      addBlock("AIWorkerOS app read payload", ocp.aiworker_app_read_payload);
      addBlock("AIWorkerOS full pipeline board", ocp.aiworker_full_pipeline_board);
      addBlock("AIWorkerOS handoff packet board", ocp.aiworker_handoff_packet_board);
      addBlock("Runtime handoff packet", ocp.aiworker_runtime_handoff_packet);

      return blocks.join("");
    }

    function renderInlineDetail(row) {
      if (!row) return "";

      var id = reviewId(row);
      var m = meta(row);
      var title = t(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="aicm-v10d2-detail-' + esc(id) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / 選択中</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">このカードは押したレビュー項目の直下に表示しています。承認/差し戻しの前に内容を確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", id),
        renderField("レビュー種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        renderField("会社", row.company_name),
        renderField("部門", row.department_name),
        renderField("課", row.section_name),
        '  </dl>',
        renderArtifactLink(row),
        '</section>',
        renderTextSection("納品サマリー", row.delivery_summary_text),
        renderTextSection("主な変更点", row.main_changes_text),
        renderTextSection("AIレビュー結果", row.ai_review_result_text),
        renderTextSection("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d2-close-detail">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3200)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(appState, row) {
      appState = app(appState);
      var mode = t(appState.aicmR8zV10d2DecisionPreviewMode || "");
      if (!mode || !row) return "";

      var title = mode === "approve" ? "承認確認プレビュー" : "差し戻し確認プレビュー";

      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        renderField("review_id", reviewId(row)),
        renderField("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        renderField("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-clear-preview">プレビューを閉じる</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function renderListRow(appState, row, index, currentId) {
      var id = reviewId(row);
      var title = t(row.review_title || row.title || "レビュー項目");
      var summary = t(row.delivery_summary_text || row.summary || row.description || "");
      var selected = id && id === currentId;

      return [
        '<article class="aicm-core-card" style="' + (selected ? 'border:2px solid #f59e0b;' : 'border:1px solid #dbeafe;') + '">',
        '  <p class="aicm-eyebrow">レビュー待ち #' + esc(String(index + 1)) + '</p>',
        '  <h3>' + esc(title) + '</h3>',
        summary ? '  <p class="aicm-selected-note">' + esc(summary) + '</p>' : '',
        '  <dl class="aicm-core-detail-list">',
        renderField("種別", row.review_kind_label || row.review_kind_code),
        renderField("成果物", row.artifact_kind_label || row.artifact_kind_code),
        renderField("優先度", row.priority_code),
        renderField("依頼日時", row.requested_at || row.created_at),
        renderField("review_id", id),
        '  </dl>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d2-open-detail" data-review-id="' + esc(id) + '">成果物を確認</button>',
        '  </div>',
        '</article>',
        selected ? renderInlineDetail(row) + renderPreview(appState, row) : ''
      ].join("");
    }

    function renderReviewList(appState) {
      appState = app(appState);

      if (!rows(appState).length) syncFetch(appState);

      var r = rows(appState);
      var currentId = selectedReviewId(appState);

      var debug = [
        "V10D2",
        "selectedCompanyId=" + companyId(appState),
        "owner=" + ownerId(appState),
        "rows=" + String(r.length),
        "payloadRows=" + String(appState.aicmR8zV10d2PayloadRows !== undefined ? appState.aicmR8zV10d2PayloadRows : "na"),
        "http=" + String(appState.aicmR8zV10d2HttpStatus !== undefined ? appState.aicmR8zV10d2HttpStatus : "na"),
        "status=" + t(appState.aicmR8zV10d2FetchStatus || "context"),
        currentId ? "selectedReviewId=" + currentId : "",
        appState.aicmR8zV10d2Error ? "error=" + t(appState.aicmR8zV10d2Error) : ""
      ].filter(Boolean).join(" / ");

      var body = [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
        '  <h2>レビュー・承認待ち: ' + esc(String(r.length)) + '件</h2>',
        '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
        '  <p class="aicm-selected-note">「成果物を確認」を押すと、その項目の直下に詳細カードを表示します。</p>',
        '</section>',
        r.length
          ? r.map(function(row, index) { return renderListRow(appState, row, index, currentId); }).join("")
          : [
              '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
              '  <h3>レビュー待ちが取得できません</h3>',
              '  <p class="aicm-selected-note">' + esc(debug) + '</p>',
              '</section>'
            ].join("")
      ].join("");

      if (typeof renderShell === "function") return renderShell(body);
      return body;
    }

    function rerenderAndScroll(id) {
      try {
        if (typeof render === "function") render();
        else if (typeof window !== "undefined" && typeof window.aicmRender === "function") window.aicmRender();
      } catch (_) {}

      if (!id || typeof document === "undefined") return;

      setTimeout(function() {
        try {
          var el = document.getElementById("aicm-v10d2-detail-" + id);
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } catch (_) {}
      }, 80);
    }

    function setDetail(id) {
      var s = app();
      s.aicmR8zV10d2SelectedReviewId = t(id);
      s.aicmR8zV10dSelectedReviewId = t(id);
      s.aicmR8zV10d2DecisionPreviewMode = "";
      rerenderAndScroll(t(id));
    }

    function closeDetail() {
      var s = app();
      s.aicmR8zV10d2SelectedReviewId = "";
      s.aicmR8zV10dSelectedReviewId = "";
      s.aicmR8zV10d2DecisionPreviewMode = "";
      rerenderAndScroll("");
    }

    function preview(mode, id) {
      var s = app();
      s.aicmR8zV10d2SelectedReviewId = t(id) || selectedReviewId(s);
      s.aicmR8zV10dSelectedReviewId = s.aicmR8zV10d2SelectedReviewId;
      s.aicmR8zV10d2DecisionPreviewMode = mode;
      rerenderAndScroll(s.aicmR8zV10d2SelectedReviewId);
    }

    function clearPreview() {
      var s = app();
      s.aicmR8zV10d2DecisionPreviewMode = "";
      rerenderAndScroll(selectedReviewId(s));
    }

    function installClickBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10d2InlineDetailClickBridge) return;
      document.__aicmR8zV10d2InlineDetailClickBridge = true;

      document.addEventListener("click", function(event) {
        var target = event.target;
        while (target && target !== document && !(target.getAttribute && target.getAttribute("data-core-action"))) {
          target = target.parentNode;
        }

        if (!target || target === document || !(target.getAttribute)) return;

        var action = target.getAttribute("data-core-action");
        if (!action || action.indexOf("review-v10d2-") !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        var id = target.getAttribute("data-review-id") || "";

        if (action === "review-v10d2-open-detail") return setDetail(id);
        if (action === "review-v10d2-close-detail") return closeDetail();
        if (action === "review-v10d2-preview-approve") return preview("approve", id);
        if (action === "review-v10d2-preview-return") return preview("return", id);
        if (action === "review-v10d2-clear-preview") return clearPreview();
      }, true);
    }

    installClickBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10d2RenderReviewList = renderReviewList;
      window.aicmR8zV7RenderReviewList = renderReviewList;
    }
  })();
  // ${marker}_END

`;

const anchor = "// AICM_R8Z_V10D_REVIEW_ARTIFACT_DETAIL_CARD_END";
const idx = src.indexOf(anchor);

if (idx < 0) {
  log.push("ERROR: V10D end anchor not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const insertAt = idx + anchor.length;
src = src.slice(0, insertAt) + helper + src.slice(insertAt);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V10D2 inserted after V10D renderer");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
