const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];

let src = fs.readFileSync(corePath, "utf8");
const log = [];

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeMarkedBlock(marker) {
  const before = src.length;
  const re = new RegExp(
    "\\n\\s*//\\s*" + esc(marker) + "_START[\\s\\S]*?//\\s*" + esc(marker) + "_END\\s*\\n?",
    "g"
  );
  src = src.replace(re, "\n");
  log.push("REMOVED_" + marker + "=" + (before !== src.length ? "true" : "false"));
}

removeMarkedBlock("AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE");
removeMarkedBlock("AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME");

const marker = "AICM_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME";

if (!src.includes(marker)) {
  const block = `

  // ${marker}_START
  // One-shot prime after opening approve/return confirm screen.
  // No MutationObserver / no interval / no auto execution.
  (function installAicmR8zV10gc2fConfirmOpenOneShotPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function bodyText() {
      try {
        return String(document && document.body ? document.body.innerText || "" : "");
      } catch (_) {
        return "";
      }
    }

    function looksLikeConfirmOpenButton(button) {
      var label = text(button && (button.innerText || button.textContent) || "");
      return (
        label.indexOf("承認確認へ進む") >= 0 ||
        label.indexOf("差し戻し確認へ進む") >= 0 ||
        label.indexOf("承認前の最終確認へ進む") >= 0 ||
        label.indexOf("差し戻し前の最終確認へ進む") >= 0
      );
    }

    function onFinalConfirmScreen() {
      var b = bodyText();
      return (
        b.indexOf("承認前の最終確認") >= 0 ||
        b.indexOf("差し戻し前の最終確認") >= 0 ||
        b.indexOf("承認を実行する") >= 0 ||
        b.indexOf("差し戻しを実行する") >= 0 ||
        b.indexOf("承認を実行する（次工程）") >= 0 ||
        b.indexOf("差し戻しを実行する（次工程）") >= 0
      );
    }

    function callV10gc2bUpgrader() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}
    }

    function enableFinalButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!onFinalConfirmScreen()) return false;

        callV10gc2bUpgrader();

        var changed = 0;
        var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));

        buttons.forEach(function(button) {
          var label = text(button.innerText || button.textContent || "");

          if (label.indexOf("承認を実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-approved");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "承認を実行する";
            changed += 1;
          }

          if (label.indexOf("差し戻しを実行") >= 0) {
            button.disabled = false;
            button.removeAttribute("disabled");
            button.removeAttribute("aria-disabled");
            button.classList.remove("disabled");
            button.style.pointerEvents = "auto";
            button.style.opacity = "1";
            button.setAttribute("data-core-action", "review-v10gc2b-execute-returned");
            button.setAttribute("data-aicm-v10gc2f-one-shot-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2fLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try { console.warn("AICM V10GC2F one-shot prime failed", error); } catch (_) {}
        return false;
      }
    }

    function oneShotPrime() {
      setTimeout(enableFinalButtonsNow, 0);
      setTimeout(enableFinalButtonsNow, 80);
      setTimeout(enableFinalButtonsNow, 180);
      setTimeout(enableFinalButtonsNow, 350);
      setTimeout(enableFinalButtonsNow, 700);
      setTimeout(enableFinalButtonsNow, 1200);
      setTimeout(enableFinalButtonsNow, 2000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest("button") : null;
        if (!button) return;

        if (looksLikeConfirmOpenButton(button)) {
          // Do not stop propagation. Let existing app route open the confirm card.
          oneShotPrime();
        }
      }, true);
    }

    var originalRenderV10GC2F = typeof render === "function" ? render : null;
    if (originalRenderV10GC2F && !originalRenderV10GC2F.__aicmR8zV10gc2fWrapped) {
      var wrappedRenderV10GC2F = function() {
        var result = originalRenderV10GC2F.apply(this, arguments);
        oneShotPrime();
        return result;
      };
      wrappedRenderV10GC2F.__aicmR8zV10gc2fWrapped = true;
      wrappedRenderV10GC2F.__aicmR8zV10gc2fOriginal = originalRenderV10GC2F;
      render = wrappedRenderV10GC2F;
    }

    setTimeout(enableFinalButtonsNow, 300);

    if (typeof window !== "undefined") {
      window.aicmR8zV10gc2fPrimeReviewConfirmButtons = oneShotPrime;
      window.aicmR8zV10gc2fEnableFinalButtonsNow = enableFinalButtonsNow;
    }
  })();
  // ${marker}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10GC2F one-shot confirm prime appended");
} else {
  log.push("SKIP: V10GC2F marker already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(logPath, log.join("\n") + "\n");
