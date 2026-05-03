const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];

const marker = "AICM_R8Z_V10GC2I_CONFIRM_SCREEN_AUTO_DEBUG_NO_CLICK";

let core = fs.readFileSync(corePath, "utf8");
const log = [];

if (!core.includes(marker)) {
  const block = `

  // ${marker}_START
  // Confirm-screen auto debug. Does not require clicking disabled button. No POST.
  (function installAicmR8zV10gc2iConfirmScreenAutoDebug() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function esc(value) {
      var s = text(value);
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

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function onConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
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

    function findReviewId() {
      try {
        var node = document.querySelector("[data-review-item-id],[data-review-id],[data-aicm-human-review-item-id]");
        if (node) {
          var v = text(
            node.getAttribute("data-review-item-id") ||
            node.getAttribute("data-review-id") ||
            node.getAttribute("data-aicm-human-review-item-id") ||
            ""
          );
          if (isUuid(v)) return v;
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
      try {
        var node = document.querySelector("[data-owner-civilization-id],[data-owner-id]");
        if (node) {
          var v = text(node.getAttribute("data-owner-civilization-id") || node.getAttribute("data-owner-id") || "");
          if (isUuid(v)) return v;
        }
      } catch (_) {}

      return deepFind(app(), [
        "owner_civilization_id",
        "ownerCivilizationId",
        "owner_id",
        "ownerId"
      ], 0);
    }

    function findReviewerLabel() {
      try {
        var node = document.querySelector("[data-human-reviewer-label],[data-reviewer-label]");
        if (node) {
          var v = text(node.getAttribute("data-human-reviewer-label") || node.getAttribute("data-reviewer-label") || "");
          if (v) return v;
        }
      } catch (_) {}

      return deepFind(app(), [
        "human_reviewer_label",
        "humanReviewerLabel",
        "reviewer_label",
        "reviewerLabel"
      ], 0) || "user";
    }

    function collectDecisionButtons() {
      try {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));
        return buttons
          .map(function(button, index) {
            var label = text(button.innerText || button.textContent || "");
            var isTarget =
              label.indexOf("承認を実行") >= 0 ||
              label.indexOf("差し戻しを実行") >= 0 ||
              (button.getAttribute("data-core-action") || "").indexOf("review-v10gc2b-execute") >= 0;

            if (!isTarget) return null;

            return {
              index: index,
              label: label,
              disabled: String(!!button.disabled),
              hasDisabledAttr: String(button.hasAttribute("disabled")),
              ariaDisabled: text(button.getAttribute("aria-disabled") || ""),
              dataCoreAction: text(button.getAttribute("data-core-action") || ""),
              dataReviewItemId: text(button.getAttribute("data-review-item-id") || ""),
              className: text(button.className || ""),
              style: text(button.getAttribute("style") || "")
            };
          })
          .filter(Boolean);
      } catch (_) {
        return [];
      }
    }

    function missingKeys(payload) {
      return ["aicm_human_review_item_id", "owner_civilization_id", "human_reviewer_label"].filter(function(key) {
        return !text(payload[key]);
      });
    }

    function renderDebugCard() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onConfirmScreen()) return false;

        var s = app();
        var reviewId = findReviewId();
        var ownerId = findOwnerCivilizationId();
        var reviewerLabel = findReviewerLabel();
        var buttons = collectDecisionButtons();

        var payload = {
          aicm_human_review_item_id: reviewId,
          owner_civilization_id: ownerId,
          human_reviewer_label: reviewerLabel,
          human_review_note: ""
        };

        var missing = missingKeys(payload);

        var buttonHtml = buttons.length
          ? buttons.map(function(b) {
              return [
                "<div style='border:1px solid #ef4444;border-radius:12px;padding:10px;margin:10px 0;background:#fff;'>",
                "<b>button #" + esc(b.index) + "</b>",
                "<dl class='aicm-core-detail-list'>",
                "<dt>label</dt><dd>" + esc(b.label) + "</dd>",
                "<dt>disabled</dt><dd>" + esc(b.disabled) + "</dd>",
                "<dt>has disabled attr</dt><dd>" + esc(b.hasDisabledAttr) + "</dd>",
                "<dt>aria-disabled</dt><dd>" + esc(b.ariaDisabled) + "</dd>",
                "<dt>data-core-action</dt><dd>" + esc(b.dataCoreAction) + "</dd>",
                "<dt>data-review-item-id</dt><dd>" + esc(b.dataReviewItemId) + "</dd>",
                "<dt>class</dt><dd>" + esc(b.className) + "</dd>",
                "<dt>style</dt><dd>" + esc(b.style) + "</dd>",
                "</dl>",
                "</div>"
              ].join("");
            }).join("")
          : "<p class='aicm-selected-note'>実行ボタンがDOMから見つかりません。</p>";

        var html = [
          "<section id='aicm-v10gc2i-confirm-auto-debug-card' class='aicm-core-card' style='border:3px solid #ef4444;background:#fef2f2;'>",
          "<p class='aicm-eyebrow'>V10GC2I / 確認画面AUTO DEBUG / NO POST</p>",
          "<h2>承認・差し戻し確認画面の状態</h2>",
          "<p class='aicm-selected-note'>クリック不要のdebugです。DB更新・POSTは実行しません。</p>",
          "<dl class='aicm-core-detail-list'>",
          "<dt>on_confirm_screen</dt><dd>true</dd>",
          "<dt>decision_button_count</dt><dd>" + esc(String(buttons.length)) + "</dd>",
          "<dt>aicm_human_review_item_id</dt><dd>" + esc(reviewId) + "</dd>",
          "<dt>owner_civilization_id</dt><dd>" + esc(ownerId) + "</dd>",
          "<dt>human_reviewer_label</dt><dd>" + esc(reviewerLabel) + "</dd>",
          "<dt>missing_required_keys</dt><dd>" + esc(missing.join(",")) + "</dd>",
          "<dt>state_screen</dt><dd>" + esc(s.screen || "") + "</dd>",
          "<dt>timestamp</dt><dd>" + esc(new Date().toISOString()) + "</dd>",
          "</dl>",
          "<h3>実行ボタンDOM</h3>",
          buttonHtml,
          "</section>"
        ].join("");

        var existing = document.getElementById("aicm-v10gc2i-confirm-auto-debug-card");
        if (existing) existing.remove();

        var wrap = document.createElement("div");
        wrap.innerHTML = html;

        var main = document.querySelector("main") || document.body;
        var firstCard = main.querySelector(".aicm-core-card") || main.firstChild;

        if (firstCard && firstCard.parentNode) {
          firstCard.parentNode.insertBefore(wrap.firstChild, firstCard);
        } else {
          main.insertBefore(wrap.firstChild, main.firstChild);
        }

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2iLastDebug = {
            reviewId: reviewId,
            ownerId: ownerId,
            reviewerLabel: reviewerLabel,
            missing: missing,
            buttons: buttons,
            at: new Date().toISOString()
          };
        }

        return true;
      } catch (error) {
        try { console.warn("V10GC2I confirm auto debug failed", error); } catch (_) {}
        return false;
      }
    }

    function burst() {
      setTimeout(renderDebugCard, 0);
      setTimeout(renderDebugCard, 100);
      setTimeout(renderDebugCard, 300);
      setTimeout(renderDebugCard, 700);
      setTimeout(renderDebugCard, 1200);
      setTimeout(renderDebugCard, 2000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function() {
        burst();
      }, true);
      document.addEventListener("scroll", function() {
        burst();
      }, true);
      document.addEventListener("touchstart", function() {
        burst();
      }, true);
    }

    var originalRenderV10GC2I = typeof render === "function" ? render : null;
    if (originalRenderV10GC2I && !originalRenderV10GC2I.__aicmR8zV10gc2iWrapped) {
      var wrappedRenderV10GC2I = function() {
        var result = originalRenderV10GC2I.apply(this, arguments);
        burst();
        return result;
      };
      wrappedRenderV10GC2I.__aicmR8zV10gc2iWrapped = true;
      wrappedRenderV10GC2I.__aicmR8zV10gc2iOriginal = originalRenderV10GC2I;
      render = wrappedRenderV10GC2I;
    }

    setTimeout(burst, 300);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2iRenderConfirmDebug = renderDebugCard;
    }
  })();
  // ${marker}_END
`;

  core += block;
  fs.writeFileSync(corePath, core, "utf8");
  log.push("PATCH_APPLIED: V10GC2I confirm screen auto debug appended");
} else {
  log.push("SKIP: V10GC2I marker already exists");
}

fs.writeFileSync(logPath, log.join("\\n") + "\\n");
