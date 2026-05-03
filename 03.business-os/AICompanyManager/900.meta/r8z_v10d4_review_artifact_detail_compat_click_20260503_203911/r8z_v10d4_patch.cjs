const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V10D4_REVIEW_DETAIL_COMPAT_CLICK_BRIDGE";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW")) {
  log.push("ERROR: V10D2 marker not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const helper = `

  // ${marker}_START
  // V10D4: compatibility click bridge for review artifact detail.
  // Scope: review-list only. No DB write / no API POST.
  (function installAicmR8zV10d4ReviewDetailCompatClickBridge() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var s = text(value);
      if (typeof escapeHtml === "function") return escapeHtml(s);
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function app() {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
      if (typeof window !== "undefined" && window.state && typeof window.state === "object") return window.state;
      return {};
    }

    function rowsFromState() {
      var s = app();
      var ctx = s.context && typeof s.context === "object" ? s.context : {};
      var candidates = [
        ctx.review_wait_items,
        s.review_wait_items,
        ctx.human_review_wait_items,
        s.human_review_wait_items
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i])) return candidates[i];
      }

      return [];
    }

    function reviewId(row) {
      return text(row && (
        row.aicm_human_review_item_id ||
        row.human_review_item_id ||
        row.review_id ||
        row.id ||
        ""
      ));
    }

    function findRowById(id) {
      id = text(id);
      if (!id) return null;

      var rows = rowsFromState();
      for (var i = 0; i < rows.length; i += 1) {
        if (reviewId(rows[i]) === id) return rows[i];
      }

      return null;
    }

    function detailId(id) {
      return "aicm-v10d4-detail-" + text(id);
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
      var out = "";
      try {
        out = JSON.stringify(value || {}, null, 2);
      } catch (_) {
        out = text(value);
      }
      maxLen = maxLen || 3200;
      if (out.length > maxLen) out = out.slice(0, maxLen) + "\\n...省略";
      return out;
    }

    function field(label, value) {
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
    }

    function section(label, value) {
      var v = text(value);
      if (!v) return "";
      return [
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
        '  <p class="aicm-selected-note" style="white-space:pre-wrap;">' + esc(v) + '</p>',
        '</section>'
      ].join("");
    }

    function artifactLink(row) {
      var link = text(row && row.artifact_link);
      if (!link) return '<p class="aicm-selected-note">成果物リンク: 未登録</p>';
      return '<p class="aicm-selected-note">成果物リンク: <a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(link) + '</a></p>';
    }

    function nestedOutputs(row) {
      var m = meta(row);
      var ocp = m.output_collection_payload || m.aiworker_output_collection_payload || {};
      var blocks = [];

      function add(label, value) {
        if (!Array.isArray(value) || !value.length) return;
        blocks.push([
          '<section class="aicm-core-card" style="background:#f8fafc;">',
          '  <p class="aicm-eyebrow">' + esc(label) + '</p>',
          '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:300px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(value, 2600)) + '</pre>',
          '</section>'
        ].join(""));
      }

      add("AIWorkerOS app read payload", ocp.aiworker_app_read_payload);
      add("AIWorkerOS full pipeline board", ocp.aiworker_full_pipeline_board);
      add("AIWorkerOS handoff packet board", ocp.aiworker_handoff_packet_board);
      add("Runtime handoff packet", ocp.aiworker_runtime_handoff_packet);

      return blocks.join("");
    }

    function renderDetail(row, id) {
      var m = meta(row);
      var title = text(row.review_title || row.title || "レビュー項目");

      return [
        '<section id="' + esc(detailId(id)) + '" class="aicm-core-card" style="border:3px solid #f59e0b;background:#fffbeb;">',
        '  <p class="aicm-eyebrow">成果物確認 / V10D4</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">この詳細カードはクリック互換bridgeで押した行の直下に挿入しています。承認/差し戻しの前に確認してください。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("レビュー種別", row.review_kind_label || row.review_kind_code),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        field("部門", row.department_name),
        field("課", row.section_name),
        '  </dl>',
        artifactLink(row),
        '</section>',
        section("納品サマリー", row.delivery_summary_text),
        section("主な変更点", row.main_changes_text),
        section("AIレビュー結果", row.ai_review_result_text),
        section("未解決事項", row.unresolved_issues_text),
        nestedOutputs(row),
        '<section class="aicm-core-card" style="background:#fff7ed;border:1px solid #fdba74;">',
        '  <p class="aicm-eyebrow">次工程</p>',
        '  <h3>承認/差し戻しへ進む前の確認</h3>',
        '  <p class="aicm-selected-note">ここではDB更新しません。次のV10Eでrollback smokeを行います。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10d4-preview-approve" data-review-id="' + esc(id) + '">承認確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-preview-return" data-review-id="' + esc(id) + '">差し戻し確認へ進む</button>',
        '    <button type="button" data-core-action="review-v10d4-close-detail" data-review-id="' + esc(id) + '">詳細を閉じる</button>',
        '  </div>',
        '</section>',
        '<section class="aicm-core-card" style="background:#f8fafc;">',
        '  <p class="aicm-eyebrow">metadata_jsonb</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + esc(jsonPreview(m, 3400)) + '</pre>',
        '</section>'
      ].join("");
    }

    function renderPreview(row, mode, id) {
      var title = mode === "approve" ? "承認確認プレビュー / V10D4" : "差し戻し確認プレビュー / V10D4";
      return [
        '<section class="aicm-core-card" style="border:2px solid #38bdf8;">',
        '  <p class="aicm-eyebrow">' + esc(title) + '</p>',
        '  <h2>' + esc(row.review_title || "レビュー項目") + '</h2>',
        '  <p class="aicm-selected-note">これはプレビューです。DB更新はまだ実行しません。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("review_id", id),
        field("操作予定", mode === "approve" ? "承認" : "差し戻し"),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        '  </dl>',
        '</section>'
      ].join("");
    }

    function removeExistingDetails() {
      if (typeof document === "undefined") return;
      var existing = document.querySelectorAll('[data-aicm-v10d4-detail="true"]');
      for (var i = 0; i < existing.length; i += 1) {
        if (existing[i] && existing[i].parentNode) existing[i].parentNode.removeChild(existing[i]);
      }
    }

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function setVisibleDebug(message) {
      var s = app();
      s.aicmR8zV10d4Debug = message;
      s.aicmR8zV10d4ClickedAt = new Date().toISOString();

      try {
        var root = document.querySelector(".aicm-core-card");
        if (root && !document.getElementById("aicm-v10d4-visible-debug")) {
          var node = document.createElement("div");
          node.id = "aicm-v10d4-visible-debug";
          node.className = "aicm-core-card";
          node.style.border = "2px solid #38bdf8";
          node.style.background = "#eff6ff";
          node.innerHTML = '<p class="aicm-eyebrow">V10D4 click debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
          root.parentNode.insertBefore(node, root.nextSibling);
        } else {
          var debug = document.getElementById("aicm-v10d4-visible-debug");
          if (debug) debug.innerHTML = '<p class="aicm-eyebrow">V10D4 click debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
        }
      } catch (_) {}
    }

    function insertDetailAfterButton(actionEl, row, id, previewMode) {
      if (!actionEl || typeof document === "undefined") return false;

      removeExistingDetails();

      var host = actionEl;
      while (host && host !== document) {
        if (host.className && String(host.className).indexOf("aicm-core-card") >= 0) break;
        host = host.parentNode;
      }

      if (!host || host === document || !host.parentNode) return false;

      var wrap = document.createElement("div");
      wrap.setAttribute("data-aicm-v10d4-detail", "true");
      wrap.innerHTML = renderDetail(row, id) + (previewMode ? renderPreview(row, previewMode, id) : "");

      host.parentNode.insertBefore(wrap, host.nextSibling);

      setTimeout(function() {
        try {
          var el = document.getElementById(detailId(id));
          if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } catch (_) {}
      }, 80);

      return true;
    }

    function handle(actionEl, event, source) {
      if (!actionEl) return false;

      var action = actionEl.getAttribute("data-core-action") || "";
      var id = actionEl.getAttribute("data-review-id") || actionEl.getAttribute("data-human-review-id") || "";

      var supported = {
        "review-v10d-open-detail": "open",
        "review-v10d2-open-detail": "open",
        "review-v10d4-open-detail": "open",
        "review-v10d-preview-approve": "approve",
        "review-v10d2-preview-approve": "approve",
        "review-v10d4-preview-approve": "approve",
        "review-v10d-preview-return": "return",
        "review-v10d2-preview-return": "return",
        "review-v10d4-preview-return": "return",
        "review-v10d-close-detail": "close",
        "review-v10d2-close-detail": "close",
        "review-v10d4-close-detail": "close"
      };

      var mode = supported[action];
      if (!mode) return false;

      if (event) {
        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}
      }

      var s = app();
      s.aicmR8zV10d4LastAction = action;
      s.aicmR8zV10d4LastReviewId = id;
      s.aicmR8zV10d4LastSource = source || "";

      if (mode === "close") {
        removeExistingDetails();
        s.aicmR8zV10d4SelectedReviewId = "";
        setVisibleDebug("closed / action=" + action);
        return true;
      }

      var row = findRowById(id);
      if (!row) {
        setVisibleDebug("clicked but row not found / action=" + action + " / id=" + id + " / rows=" + String(rowsFromState().length));
        return true;
      }

      s.aicmR8zV10d4SelectedReviewId = id;
      s.aicmR8zV10d2SelectedReviewId = id;
      s.aicmR8zV10dSelectedReviewId = id;

      var previewMode = "";
      if (mode === "approve") previewMode = "approve";
      if (mode === "return") previewMode = "return";

      var inserted = insertDetailAfterButton(actionEl, row, id, previewMode);
      setVisibleDebug("clicked / source=" + (source || "") + " / action=" + action + " / id=" + id + " / inserted=" + String(inserted));

      return true;
    }

    function bridge(event) {
      var actionEl = findActionElement(event && event.target);
      if (!actionEl) return;

      var action = actionEl.getAttribute("data-core-action") || "";
      if (action.indexOf("review-v10d") !== 0) return;

      handle(actionEl, event, event && event.type ? event.type : "event");
    }

    function installBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10d4CompatClickBridge) return;
      document.__aicmR8zV10d4CompatClickBridge = true;

      document.addEventListener("click", bridge, true);
      document.addEventListener("pointerup", bridge, true);
      document.addEventListener("touchend", bridge, true);
    }

    installBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10d4HandleReviewDetailAction = function(actionEl) {
        return handle(actionEl, null, "manual");
      };
    }
  })();
  // ${marker}_END

`;

const anchor = "// AICM_R8Z_V10D2_INLINE_ARTIFACT_DETAIL_UNDER_ROW_END";
const idx = src.indexOf(anchor);

if (idx < 0) {
  log.push("ERROR: V10D2 end anchor not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const insertAt = idx + anchor.length;
src = src.slice(0, insertAt) + helper + src.slice(insertAt);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V10D4 compat click bridge inserted after V10D2");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
