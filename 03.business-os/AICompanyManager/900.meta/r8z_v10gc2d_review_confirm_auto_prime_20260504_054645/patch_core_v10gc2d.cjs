const fs = require("fs");

const corePath = process.argv[2];
const logPath = process.argv[3];

const marker = "AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME";

let core = fs.readFileSync(corePath, "utf8");
const log = [];

if (!core.includes(marker)) {
  const block = `

  // ${marker}_START
  // Auto-prime review confirm buttons without requiring an extra metadata tap.
  (function installAicmR8zV10gc2dReviewConfirmAutoPrime() {
    function text(value) {
      return String(value === undefined || value === null ? "" : value).trim();
    }

    function isConfirmBody() {
      try {
        var body = String(document && document.body ? document.body.innerText || "" : "");
        return (
          body.indexOf("承認前の最終確認") >= 0 ||
          body.indexOf("差し戻し前の最終確認") >= 0 ||
          body.indexOf("承認を実行する") >= 0 ||
          body.indexOf("差し戻しを実行する") >= 0 ||
          body.indexOf("承認を実行する（次工程）") >= 0 ||
          body.indexOf("差し戻しを実行する（次工程）") >= 0
        );
      } catch (_) {
        return false;
      }
    }

    function enableDecisionButtonsNow() {
      try {
        if (typeof document === "undefined" || !document.body) return false;
        if (!isConfirmBody()) return false;

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
            button.setAttribute("data-aicm-v10gc2d-auto-primed", "true");
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
            button.setAttribute("data-aicm-v10gc2d-auto-primed", "true");
            button.textContent = "差し戻しを実行する";
            changed += 1;
          }
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2dLastPrime = {
            changed: changed,
            at: new Date().toISOString()
          };
        }

        return changed > 0;
      } catch (error) {
        try {
          console.warn("AICM V10GC2D auto prime failed", error);
        } catch (_) {}
        return false;
      }
    }

    function callExistingUpgraders() {
      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2bUpgradeButtons === "function") {
          window.aicmR8zV10gc2bUpgradeButtons();
        }
      } catch (_) {}

      try {
        if (typeof window !== "undefined" && typeof window.aicmR8zV10gc2cForceEnableReviewDecisionButtons === "function") {
          window.aicmR8zV10gc2cForceEnableReviewDecisionButtons();
        }
      } catch (_) {}
    }

    function prime() {
      callExistingUpgraders();
      enableDecisionButtonsNow();
    }

    function burstPrime() {
      prime();
      setTimeout(prime, 0);
      setTimeout(prime, 80);
      setTimeout(prime, 180);
      setTimeout(prime, 400);
      setTimeout(prime, 900);
      setTimeout(prime, 1600);
    }

    function startShortInterval() {
      try {
        if (typeof window === "undefined") return;
        if (window.aicmR8zV10gc2dPrimeInterval) return;

        var count = 0;
        window.aicmR8zV10gc2dPrimeInterval = setInterval(function() {
          count += 1;
          prime();
          if (count >= 80) {
            clearInterval(window.aicmR8zV10gc2dPrimeInterval);
            window.aicmR8zV10gc2dPrimeInterval = null;
          }
        }, 250);
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("DOMContentLoaded", function() {
        burstPrime();
        startShortInterval();
      }, true);

      document.addEventListener("visibilitychange", function() {
        burstPrime();
        startShortInterval();
      }, true);

      document.addEventListener("scroll", burstPrime, true);
      document.addEventListener("touchstart", burstPrime, true);
      document.addEventListener("pointerdown", burstPrime, true);
      document.addEventListener("focusin", burstPrime, true);
      document.addEventListener("click", burstPrime, true);

      try {
        var observer = new MutationObserver(function() {
          burstPrime();
        });

        observer.observe(document.documentElement || document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["disabled", "class", "style", "aria-disabled"]
        });

        if (typeof window !== "undefined") {
          window.aicmR8zV10gc2dObserver = observer;
        }
      } catch (_) {}
    }

    if (typeof window !== "undefined") {
      window.addEventListener("load", function() {
        burstPrime();
        startShortInterval();
      }, true);

      window.addEventListener("pageshow", function() {
        burstPrime();
        startShortInterval();
      }, true);

      window.aicmR8zV10gc2dPrimeReviewConfirmButtons = burstPrime;
    }

    var originalRenderV10GC2D = typeof render === "function" ? render : null;
    if (originalRenderV10GC2D && !originalRenderV10GC2D.__aicmR8zV10gc2dWrapped) {
      var wrappedRenderV10GC2D = function() {
        var result = originalRenderV10GC2D.apply(this, arguments);
        burstPrime();
        startShortInterval();
        return result;
      };
      wrappedRenderV10GC2D.__aicmR8zV10gc2dWrapped = true;
      wrappedRenderV10GC2D.__aicmR8zV10gc2dOriginal = originalRenderV10GC2D;
      render = wrappedRenderV10GC2D;
    }

    burstPrime();
    startShortInterval();
  })();
  // ${marker}_END
`;

  core += block;
  fs.writeFileSync(corePath, core, "utf8");
  log.push("PATCH_APPLIED: V10GC2D review confirm auto-prime appended");
} else {
  log.push("SKIP: V10GC2D marker already exists");
}

fs.writeFileSync(logPath, log.join("\\n") + "\\n");
