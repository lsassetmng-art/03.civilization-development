const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V10F_REVIEW_APPROVE_RETURN_CONFIRM_UI";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK")) {
  log.push("ERROR: V10D5 marker not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const helper = `

  // ${marker}_START
  // V10F: confirmation UI only. No DB write / no API POST.
  (function installAicmR8zV10fReviewConfirmUi() {
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

    function rowsFromState() {
      var s = app();
      var c = s.context && typeof s.context === "object" ? s.context : {};
      var candidates = [
        c.review_wait_items,
        s.review_wait_items,
        typeof window !== "undefined" ? window.__aicmR8zV10d5ContextRows : null,
        typeof window !== "undefined" ? window.__aicmR8zV10fContextRows : null
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        if (Array.isArray(candidates[i]) && candidates[i].length) return candidates[i];
      }

      return [];
    }

    function ownerFromState() {
      var s = app();
      var c = s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.owner_civilization_id ||
        s.ownerCivilizationId ||
        c.owner_civilization_id ||
        c.ownerCivilizationId ||
        "00000000-0000-4000-8000-000000000001"
      );
    }

    function companyFromState() {
      var s = app();
      var c = s.context && typeof s.context === "object" ? s.context : {};
      return text(
        s.selectedCompanyId ||
        s.aicm_user_company_id ||
        s.companyId ||
        c.aicm_user_company_id ||
        c.selectedCompanyId ||
        c.company_id ||
        "8b9be487-7b74-4517-9b59-6c84a82ae6aa"
      );
    }

    function fetchRows() {
      var cached = rowsFromState();
      if (cached.length) return cached;

      if (typeof XMLHttpRequest === "undefined") return [];

      var s = app();
      var owner = ownerFromState();
      var company = companyFromState();

      var url = "/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner);
      if (company) url += "&aicm_user_company_id=" + encodeURIComponent(company);
      url += "&v=r8z_v10f_" + Date.now();

      try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        s.aicmR8zV10fHttpStatus = xhr.status;
        s.aicmR8zV10fFetchUrl = url;

        if (xhr.status < 200 || xhr.status >= 300) {
          s.aicmR8zV10fError = "context http " + String(xhr.status);
          return [];
        }

        var payload = {};
        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch (parseError) {
          s.aicmR8zV10fError = text(parseError && parseError.message ? parseError.message : parseError);
          return [];
        }

        var rows = rowsFromPayload(payload);

        if (rows.length) {
          if (typeof window !== "undefined") window.__aicmR8zV10fContextRows = rows;
          if (!s.context || typeof s.context !== "object") s.context = {};
          s.context.review_wait_items = rows;
          s.review_wait_items = rows;
        }

        s.aicmR8zV10fRows = rows.length;
        return rows;
      } catch (error) {
        s.aicmR8zV10fError = text(error && error.message ? error.message : error);
        return [];
      }
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
      var rows = fetchRows();

      for (var i = 0; i < rows.length; i += 1) {
        if (reviewId(rows[i]) === id) return rows[i];
      }

      return null;
    }

    function field(label, value) {
      return '<dt>' + esc(label) + '</dt><dd>' + esc(text(value) || "-") + '</dd>';
    }

    function removeExistingConfirm() {
      if (typeof document === "undefined") return;

      var nodes = document.querySelectorAll('[data-aicm-v10f-confirm="true"]');
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
    }

    function renderConfirm(row, mode, id) {
      var isApprove = mode === "approve";
      var title = isApprove ? "承認前の最終確認" : "差し戻し前の最終確認";
      var nextStatus = isApprove ? "approved" : "returned";
      var operation = isApprove ? "承認" : "差し戻し";
      var border = isApprove ? "#22c55e" : "#f97316";
      var bg = isApprove ? "#f0fdf4" : "#fff7ed";

      return [
        '<section class="aicm-core-card" style="border:3px solid ' + border + ';background:' + bg + ';">',
        '  <p class="aicm-eyebrow">V10F / DB更新前確認</p>',
        '  <h2>' + esc(title) + '</h2>',
        '  <p class="aicm-selected-note">まだDB更新は実行しません。次工程V10GでAPI rollback smokeを行ってから本実行します。</p>',
        '  <dl class="aicm-core-detail-list">',
        field("操作予定", operation),
        field("status遷移予定", "pending → " + nextStatus),
        field("review_id", id),
        field("レビュー", row.review_title || row.title || "レビュー項目"),
        field("成果物種別", row.artifact_kind_label || row.artifact_kind_code),
        field("優先度", row.priority_code),
        field("依頼日時", row.requested_at || row.created_at),
        field("担当AI", row.responsible_ai_label || row.requested_by_ai_label),
        field("会社", row.company_name),
        '  </dl>',
        '  <div class="aicm-core-card" style="background:#ffffff;">',
        '    <p class="aicm-eyebrow">確認事項</p>',
        '    <p class="aicm-selected-note">成果物内容・AIレビュー・未解決事項を確認したうえで、次工程でDB更新を実行します。</p>',
        '  </div>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-v10f-cancel-confirm" data-review-id="' + esc(id) + '">確認を閉じる</button>',
        '    <button type="button" disabled title="V10Gで有効化予定">' + esc(operation) + 'を実行する（次工程）</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function findActionElement(target) {
      while (target && target !== document) {
        if (target.getAttribute && target.getAttribute("data-core-action")) return target;
        target = target.parentNode;
      }
      return null;
    }

    function findInsertHost(actionEl) {
      var host = actionEl;

      while (host && host !== document) {
        if (
          host.className &&
          String(host.className).indexOf("aicm-core-card") >= 0 &&
          host.innerHTML &&
          String(host.innerHTML).indexOf("次工程") >= 0
        ) {
          return host;
        }
        host = host.parentNode;
      }

      host = actionEl;
      while (host && host !== document) {
        if (host.className && String(host.className).indexOf("aicm-core-card") >= 0) return host;
        host = host.parentNode;
      }

      return null;
    }

    function visibleDebug(message) {
      try {
        var root = document.querySelector(".aicm-core-card");
        var node = document.getElementById("aicm-v10f-visible-debug");

        if (!node) {
          node = document.createElement("div");
          node.id = "aicm-v10f-visible-debug";
          node.className = "aicm-core-card";
          node.style.border = "2px solid #a855f7";
          node.style.background = "#faf5ff";
          node.innerHTML = '<p class="aicm-eyebrow">V10F confirm debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
          if (root && root.parentNode) root.parentNode.insertBefore(node, root.nextSibling);
        } else {
          node.innerHTML = '<p class="aicm-eyebrow">V10F confirm debug</p><p class="aicm-selected-note">' + esc(message) + '</p>';
        }
      } catch (_) {}
    }

    function showConfirm(actionEl, mode, id, eventSource) {
      id = text(id);
      var row = findRowById(id);

      removeExistingConfirm();

      if (!row) {
        visibleDebug("confirm row not found / mode=" + mode + " / id=" + id + " / rows=" + String(rowsFromState().length) + " / source=" + eventSource);
        return true;
      }

      var host = findInsertHost(actionEl);
      if (!host || !host.parentNode) {
        visibleDebug("confirm host not found / mode=" + mode + " / id=" + id + " / source=" + eventSource);
        return true;
      }

      var wrap = document.createElement("div");
      wrap.setAttribute("data-aicm-v10f-confirm", "true");
      wrap.innerHTML = renderConfirm(row, mode, id);

      host.parentNode.insertBefore(wrap, host.nextSibling);

      visibleDebug("confirm shown / mode=" + mode + " / id=" + id + " / source=" + eventSource);

      setTimeout(function() {
        try {
          var el = wrap.querySelector(".aicm-core-card");
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

      var mode = "";
      if (
        action === "review-v10d-preview-approve" ||
        action === "review-v10d2-preview-approve" ||
        action === "review-v10d4-preview-approve" ||
        action === "review-v10f-preview-approve"
      ) mode = "approve";

      if (
        action === "review-v10d-preview-return" ||
        action === "review-v10d2-preview-return" ||
        action === "review-v10d4-preview-return" ||
        action === "review-v10f-preview-return"
      ) mode = "return";

      if (action === "review-v10f-cancel-confirm") {
        if (event) {
          try { event.preventDefault(); } catch (_) {}
          try { event.stopPropagation(); } catch (_) {}
          try { event.stopImmediatePropagation(); } catch (_) {}
        }

        removeExistingConfirm();
        visibleDebug("confirm closed / id=" + id);
        return true;
      }

      if (!mode) return false;

      if (event) {
        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}
      }

      var s = app();
      s.aicmR8zV10fLastAction = action;
      s.aicmR8zV10fLastReviewId = id;
      s.aicmR8zV10fLastMode = mode;
      s.aicmR8zV10fLastSource = source || "";

      return showConfirm(actionEl, mode, id, source || "");
    }

    function bridge(event) {
      var actionEl = findActionElement(event && event.target);
      if (!actionEl) return;

      var action = actionEl.getAttribute("data-core-action") || "";
      if (action.indexOf("review-v10d") !== 0 && action.indexOf("review-v10f") !== 0) return;

      handle(actionEl, event, event && event.type ? event.type : "event");
    }

    function installBridge() {
      if (typeof document === "undefined" || document.__aicmR8zV10fReviewConfirmUiBridge) return;
      document.__aicmR8zV10fReviewConfirmUiBridge = true;

      document.addEventListener("click", bridge, true);
      document.addEventListener("pointerup", bridge, true);
      document.addEventListener("touchend", bridge, true);
    }

    installBridge();

    if (typeof window !== "undefined") {
      window.aicmR8zV10fShowReviewConfirm = function(actionEl, mode, id) {
        return showConfirm(actionEl, mode, id, "manual");
      };
    }
  })();
  // ${marker}_END

`;

const anchor = "// AICM_R8Z_V10D5_REVIEW_DETAIL_BRIDGE_CONTEXT_FALLBACK_END";
const idx = src.indexOf(anchor);

if (idx < 0) {
  log.push("ERROR: V10D5 end anchor not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const insertAt = idx + anchor.length;
src = src.slice(0, insertAt) + helper + src.slice(insertAt);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V10F confirmation UI inserted after V10D5");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
