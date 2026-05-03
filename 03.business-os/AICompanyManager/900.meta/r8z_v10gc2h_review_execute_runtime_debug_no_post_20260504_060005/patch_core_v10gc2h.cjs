const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];

const marker = "AICM_R8Z_V10GC2H_REVIEW_EXECUTE_RUNTIME_DEBUG_NO_POST";

let core = fs.readFileSync(corePath, "utf8");
const log = [];

if (!core.includes(marker)) {
  const block = `

  // ${marker}_START
  // Runtime debug only. Captures approve/return execution click and prevents POST.
  (function installAicmR8zV10gc2hRuntimeDebugNoPost() {
    var APPROVE_ROUTE = "/api/aicm/v2/human-review/approve";
    var RETURN_ROUTE = "/api/aicm/v2/human-review/return";

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

    function isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text(value));
    }

    function deepFind(obj, keyCandidates, depth) {
      if (!obj || typeof obj !== "object" || depth > 6) return "";

      for (var i = 0; i < keyCandidates.length; i += 1) {
        var key = keyCandidates[i];
        if (obj[key] !== undefined && obj[key] !== null && text(obj[key]) !== "") {
          return text(obj[key]);
        }
      }

      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (!/review|item|confirm|selected|detail|owner|civilization|human|reviewer|label|context|state|id/i.test(k)) continue;
        var nested = deepFind(obj[k], keyCandidates, depth + 1);
        if (nested) return nested;
      }

      return "";
    }

    function findReviewId(button) {
      var fromButton = button ? text(
        button.getAttribute("data-review-item-id") ||
        button.getAttribute("data-review-id") ||
        button.getAttribute("data-aicm-human-review-item-id") ||
        ""
      ) : "";

      if (isUuid(fromButton)) return fromButton;

      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var fromDom = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(fromDom)) return fromDom;
        }
      } catch (_) {}

      return deepFind(app(), [
        "aicm_human_review_item_id",
        "review_item_id",
        "review_id",
        "reviewId",
        "id"
      ], 0);
    }

    function findOwnerCivilizationId() {
      var s = app();

      try {
        var dom = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (dom) {
          var v = text(dom.getAttribute("data-owner-civilization-id") || dom.getAttribute("data-owner-id") || "");
          if (isUuid(v)) return v;
        }
      } catch (_) {}

      return deepFind(s, [
        "owner_civilization_id",
        "ownerCivilizationId",
        "owner_id",
        "ownerId"
      ], 0);
    }

    function findReviewerLabel() {
      var s = app();

      try {
        var dom = document.querySelector("[data-human-reviewer-label],[data-reviewer-label]");
        if (dom) {
          var v = text(dom.getAttribute("data-human-reviewer-label") || dom.getAttribute("data-reviewer-label") || "");
          if (v) return v;
        }
      } catch (_) {}

      var fromState = deepFind(s, [
        "human_reviewer_label",
        "humanReviewerLabel",
        "reviewer_label",
        "reviewerLabel"
      ], 0);

      return fromState || "user";
    }

    function noteValue() {
      try {
        var node = document.querySelector('[data-aicm-review-decision-note], textarea[name="human_review_note"], textarea[name="review_decision_note"], textarea[name="return_reason"]');
        return node ? text(node.value) : "";
      } catch (_) {
        return "";
      }
    }

    function actionKind(action, button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      if (action.indexOf("approved") >= 0 || label.indexOf("承認") >= 0) return "approved";
      if (action.indexOf("returned") >= 0 || label.indexOf("差し戻し") >= 0) return "returned";
      return "";
    }

    function buildPayload(kind, reviewId, ownerId, reviewerLabel, note) {
      return {
        aicm_human_review_item_id: reviewId,
        human_review_note: note || "",
        human_reviewer_label: reviewerLabel || "",
        owner_civilization_id: ownerId || ""
      };
    }

    function missingKeys(payload) {
      var required = [
        "aicm_human_review_item_id",
        "human_review_note",
        "human_reviewer_label",
        "owner_civilization_id"
      ];

      return required.filter(function(key) {
        return payload[key] === undefined || payload[key] === null || text(payload[key]) === "";
      });
    }

    function debugHtml(info) {
      return [
        '<section id="aicm-v10gc2h-runtime-debug-card" class="aicm-core-card" style="border:3px solid #ef4444;background:#fef2f2;">',
        '  <p class="aicm-eyebrow">V10GC2H / 実行クリックDEBUG / NO POST</p>',
        '  <h2>承認・差し戻し実行の原因追及</h2>',
        '  <p class="aicm-selected-note">このdebug中はPOSTを止めています。DB更新は起きません。</p>',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>clicked_action</dt><dd>' + esc(info.action) + '</dd>',
        '    <dt>kind</dt><dd>' + esc(info.kind) + '</dd>',
        '    <dt>route</dt><dd>' + esc(info.route) + '</dd>',
        '    <dt>button_label</dt><dd>' + esc(info.buttonLabel) + '</dd>',
        '    <dt>button_disabled</dt><dd>' + esc(info.buttonDisabled) + '</dd>',
        '    <dt>button_data_core_action</dt><dd>' + esc(info.buttonDataCoreAction) + '</dd>',
        '    <dt>aicm_human_review_item_id</dt><dd>' + esc(info.reviewId) + '</dd>',
        '    <dt>owner_civilization_id</dt><dd>' + esc(info.ownerId) + '</dd>',
        '    <dt>human_reviewer_label</dt><dd>' + esc(info.reviewerLabel) + '</dd>',
        '    <dt>human_review_note</dt><dd>' + esc(info.note) + '</dd>',
        '    <dt>payload_keys</dt><dd>' + esc(Object.keys(info.payload || {}).join(",")) + '</dd>',
        '    <dt>missing_required_keys</dt><dd>' + esc(info.missing.join(",")) + '</dd>',
        '    <dt>state_screen</dt><dd>' + esc(info.stateScreen) + '</dd>',
        '    <dt>timestamp</dt><dd>' + esc(info.at) + '</dd>',
        '  </dl>',
        '</section>'
      ].join("");
    }

    function showDebug(info) {
      try {
        var existing = document.getElementById("aicm-v10gc2h-runtime-debug-card");
        if (existing) existing.remove();

        var wrap = document.createElement("div");
        wrap.innerHTML = debugHtml(info);

        var main = document.querySelector("main") || document.body;
        var first = main.querySelector(".aicm-core-card") || main.firstChild;

        if (first && first.parentNode) {
          first.parentNode.insertBefore(wrap.firstChild, first);
        } else {
          main.insertBefore(wrap.firstChild, main.firstChild);
        }
      } catch (error) {
        try { console.warn("V10GC2H debug card failed", error); } catch (_) {}
      }
    }

    function captureClick(event, button) {
      var action = button.getAttribute("data-core-action") || "";
      var kind = actionKind(action, button);
      var route = kind === "approved" ? APPROVE_ROUTE : kind === "returned" ? RETURN_ROUTE : "";
      var reviewId = findReviewId(button);
      var ownerId = findOwnerCivilizationId();
      var reviewerLabel = findReviewerLabel();
      var note = noteValue();
      var payload = buildPayload(kind, reviewId, ownerId, reviewerLabel, note);
      var missing = missingKeys(payload);

      var s = app();

      var info = {
        action: action,
        kind: kind,
        route: route,
        buttonLabel: text(button.innerText || button.textContent || ""),
        buttonDisabled: String(!!button.disabled),
        buttonDataCoreAction: action,
        reviewId: reviewId,
        ownerId: ownerId,
        reviewerLabel: reviewerLabel,
        note: note,
        payload: payload,
        missing: missing,
        stateScreen: text(s.screen || ""),
        at: new Date().toISOString()
      };

      if (typeof window !== "undefined") {
        window.aicmR8zV10gc2hLastDebugInfo = info;
      }

      showDebug(info);

      // Debug only: block real POST.
      try { event.preventDefault(); } catch (_) {}
      try { event.stopPropagation(); } catch (_) {}
      try { event.stopImmediatePropagation(); } catch (_) {}

      return false;
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        var action = button.getAttribute("data-core-action") || "";
        var label = text(button.innerText || button.textContent || "");

        var isExecute =
          action === "review-v10gc2b-execute-approved" ||
          action === "review-v10gc2b-execute-returned" ||
          label.indexOf("承認を実行") >= 0 ||
          label.indexOf("差し戻しを実行") >= 0;

        if (!isExecute) return;

        captureClick(event, button);
      }, true);
    }

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2hShowRuntimeDebug = function() {
        var button = document.querySelector('[data-core-action="review-v10gc2b-execute-approved"],[data-core-action="review-v10gc2b-execute-returned"]');
        if (!button) return null;
        var fakeEvent = {
          preventDefault: function(){},
          stopPropagation: function(){},
          stopImmediatePropagation: function(){}
        };
        captureClick(fakeEvent, button);
        return window.aicmR8zV10gc2hLastDebugInfo || null;
      };
    }
  })();
  // ${marker}_END
`;

  core += block;
  fs.writeFileSync(corePath, core, "utf8");
  log.push("PATCH_APPLIED: V10GC2H runtime debug no-post appended");
} else {
  log.push("SKIP: V10GC2H marker already exists");
}

fs.writeFileSync(logPath, log.join("\\n") + "\\n");
