const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const markerBack = "AICM_R8Z_V10F3C_REVIEW_LIST_BACK_SIMPLE_DASHBOARD";
const markerDebug = "AICM_R8Z_V10F2J_WORKER_LEAK_DOM_SOURCE_DEBUG";

let src = fs.readFileSync(corePath, "utf8");
const log = [];

if (!src.includes(markerBack)) {
  const block = `

  // ${markerBack}_START
  // Override review-list nav: single 「戻る」 button to dashboard. UI only.
  (function installAicmR8zV10f3cReviewListBackSimple() {
    function isReviewListScreen() {
      try {
        if (typeof state !== "undefined" && state && state.screen === "review-list") return true;
        if (typeof document !== "undefined" && document.body) {
          var text = String(document.body.innerText || "");
          return text.indexOf("レビュー・承認待ち") >= 0 && text.indexOf("レビュー待ち #") >= 0;
        }
      } catch (_) {}
      return false;
    }

    function navHtml() {
      return [
        '<section id="aicm-v10f3c-review-list-back-simple" class="aicm-core-card" style="border:2px solid #94a3b8;background:#f8fafc;">',
        '  <p class="aicm-eyebrow">V10F3C / レビュー一覧ナビ</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-list-back-dashboard">戻る</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function removeOldNavs() {
      try {
        var old1 = document.getElementById("aicm-v10f3b-review-list-back");
        if (old1) old1.remove();
        var old2 = document.getElementById("aicm-v10f3c-review-list-back-simple");
        if (old2) old2.remove();
      } catch (_) {}
    }

    function ensureNav() {
      try {
        if (!isReviewListScreen()) return;
        if (typeof document === "undefined" || !document.body) return;

        removeOldNavs();

        var main = document.querySelector("main") || document.body;
        var wrap = document.createElement("div");
        wrap.innerHTML = navHtml();

        var firstCard = main.querySelector(".aicm-core-card") || main.firstChild;
        if (firstCard && firstCard.parentNode) {
          firstCard.parentNode.insertBefore(wrap.firstChild, firstCard);
        } else {
          main.insertBefore(wrap.firstChild, main.firstChild);
        }
      } catch (error) {
        if (typeof console !== "undefined" && console && console.warn) {
          console.warn("AICM V10F3C simple back nav failed", error);
        }
      }
    }

    function goDashboard() {
      try {
        if (typeof state !== "undefined" && state) {
          state.screen = "dashboard";
        } else if (typeof window !== "undefined" && window.state) {
          window.state.screen = "dashboard";
        }

        if (typeof render === "function") {
          render();
          return;
        }
      } catch (_) {}

      try {
        var url = new URL(String(location.href));
        url.searchParams.set("screen", "dashboard");
        location.href = url.toString();
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest('[data-core-action="review-list-back-dashboard"]') : null;
        if (!button) return;

        try { event.preventDefault(); } catch (_) {}
        try { event.stopPropagation(); } catch (_) {}
        try { event.stopImmediatePropagation(); } catch (_) {}

        goDashboard();
      }, true);
    }

    function wrapReviewRenderer() {
      try {
        if (typeof window === "undefined") return false;
        if (typeof window.aicmR8zV7RenderReviewList !== "function") return false;
        if (window.aicmR8zV7RenderReviewList.__aicmR8zV10f3cWrapped) return true;

        var original = window.aicmR8zV7RenderReviewList;
        var wrapped = function() {
          var html = original.apply(this, arguments);
          var source = String(html || "");
          source = source.replace(/<section id="aicm-v10f3b-review-list-back"[\\s\\S]*?<\\/section>/g, "");
          if (source.indexOf("aicm-v10f3c-review-list-back-simple") >= 0) return source;
          return navHtml() + source;
        };

        wrapped.__aicmR8zV10f3cWrapped = true;
        wrapped.__aicmR8zV10f3cOriginal = original;
        window.aicmR8zV7RenderReviewList = wrapped;
        return true;
      } catch (_) {
        return false;
      }
    }

    wrapReviewRenderer();
    setTimeout(wrapReviewRenderer, 0);
    setTimeout(wrapReviewRenderer, 200);
    setTimeout(ensureNav, 300);

    if (typeof document !== "undefined") {
      document.addEventListener("click", function() {
        setTimeout(wrapReviewRenderer, 0);
        setTimeout(ensureNav, 180);
      }, true);
    }

    if (typeof window !== "undefined") {
      window.aicmR8zV10f3cEnsureReviewListBackSimple = ensureNav;
    }
  })();
  // ${markerBack}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10F3C simple review-list back to dashboard installed");
} else {
  log.push("SKIP: V10F3C marker already exists");
}

if (!src.includes(markerDebug)) {
  const block = `

  // ${markerDebug}_START
  // DOM source debug excluding debug cards. Debug only, no DB/API.
  (function installAicmR8zV10f2jWorkerLeakDomSourceDebug() {
    function esc(value) {
      var s = String(value === undefined || value === null ? "" : value).trim();
      if (typeof escapeHtml === "function") return escapeHtml(s);
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function cloneBodyWithoutDebug() {
      try {
        if (typeof document === "undefined" || !document.body) return null;
        var clone = document.body.cloneNode(true);
        var debugNodes = clone.querySelectorAll(
          '#aicm-v10f2h-section-new-runtime-debug,' +
          '#aicm-v10f2i-worker-leak-debug,' +
          '#aicm-v10f2j-worker-leak-dom-source-debug,' +
          '#aicm-v10f3b-review-list-back,' +
          '#aicm-v10f3c-review-list-back-simple'
        );
        debugNodes.forEach(function(node) { node.remove(); });
        return clone;
      } catch (_) {
        return null;
      }
    }

    function cleanText(value) {
      return String(value || "")
        .replace(/\\s+/g, " ")
        .trim()
        .slice(0, 280);
    }

    function bodyTextNoDebug() {
      var clone = cloneBodyWithoutDebug();
      return clone ? String(clone.innerText || "") : "";
    }

    function countNoDebug(pattern) {
      var text = bodyTextNoDebug();
      var re = new RegExp(pattern, "g");
      return (text.match(re) || []).length;
    }

    function collectHeadings(clone) {
      if (!clone) return "-";
      var nodes = Array.prototype.slice.call(clone.querySelectorAll("h1,h2,h3,.aicm-eyebrow")).slice(0, 18);
      return nodes.map(function(n, i) {
        return "#" + (i + 1) + " " + cleanText(n.innerText || n.textContent || "");
      }).join(" / ") || "-";
    }

    function collectButtons(clone) {
      if (!clone) return "-";
      var nodes = Array.prototype.slice.call(clone.querySelectorAll("button")).slice(0, 24);
      return nodes.map(function(n, i) {
        var action = n.getAttribute("data-core-action") || "";
        var screen = n.getAttribute("data-screen") || "";
        return "#" + (i + 1) + " " + cleanText(n.innerText || n.textContent || "") +
          (action ? " action=" + action : "") +
          (screen ? " screen=" + screen : "");
      }).join(" / ") || "-";
    }

    function collectLabels(clone) {
      if (!clone) return "-";
      var nodes = Array.prototype.slice.call(clone.querySelectorAll("label,dt")).slice(0, 30);
      return nodes.map(function(n, i) {
        return "#" + (i + 1) + " " + cleanText(n.innerText || n.textContent || "");
      }).join(" / ") || "-";
    }

    function collectSelects(clone) {
      if (!clone) return "-";
      var nodes = Array.prototype.slice.call(clone.querySelectorAll("select")).slice(0, 18);
      return nodes.map(function(sel, i) {
        var label = "";
        try {
          var parentText = cleanText(sel.parentElement ? sel.parentElement.innerText : "");
          label = parentText.slice(0, 80);
        } catch (_) {}
        var selected = "";
        try {
          selected = cleanText(sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : "");
        } catch (_) {}
        return "#" + (i + 1) + " selected=" + selected + " parent=" + label;
      }).join(" / ") || "-";
    }

    function collectWorkerNeighborhood(text) {
      var keywords = ["従業員設定ロボット", "従業員設定", "従業員行を追加", "ASIC Workers", "HD-R3", "MG-NORN", "社内通称"];
      var out = [];
      keywords.forEach(function(k) {
        var idx = text.indexOf(k);
        if (idx >= 0) {
          out.push(k + ": " + cleanText(text.slice(Math.max(0, idx - 80), idx + 360)));
        }
      });
      return out.join(" || ") || "-";
    }

    function shouldShow() {
      var text = bodyTextNoDebug();
      if (text.indexOf("課の新規追加") >= 0) return true;
      if (text.indexOf("課追加") >= 0) return true;
      if (text.indexOf("従業員設定") >= 0) return true;
      if (text.indexOf("従業員設定ロボット") >= 0) return true;
      if (text.indexOf("従業員行を追加") >= 0) return true;
      return false;
    }

    function debugHtml() {
      var clone = cloneBodyWithoutDebug();
      var text = bodyTextNoDebug();

      return [
        '<section id="aicm-v10f2j-worker-leak-dom-source-debug" class="aicm-core-card" style="border:3px solid #7c3aed;background:#f5f3ff;">',
        '  <p class="aicm-eyebrow">V10F2J / DOM SOURCE DEBUG</p>',
        '  <h2>従業員UIの実DOM発生源</h2>',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>DOM no-debug 従業員設定</dt><dd>' + esc(String(countNoDebug("従業員設定"))) + '</dd>',
        '    <dt>DOM no-debug 従業員設定ロボット</dt><dd>' + esc(String(countNoDebug("従業員設定ロボット"))) + '</dd>',
        '    <dt>DOM no-debug 従業員行を追加</dt><dd>' + esc(String(countNoDebug("従業員行を追加"))) + '</dd>',
        '    <dt>headings</dt><dd>' + esc(collectHeadings(clone)) + '</dd>',
        '    <dt>buttons</dt><dd>' + esc(collectButtons(clone)) + '</dd>',
        '    <dt>labels/dt</dt><dd>' + esc(collectLabels(clone)) + '</dd>',
        '    <dt>selects</dt><dd>' + esc(collectSelects(clone)) + '</dd>',
        '    <dt>worker neighborhood</dt><dd>' + esc(collectWorkerNeighborhood(text)) + '</dd>',
        '  </dl>',
        '  <p class="aicm-selected-note">この紫枠の値で、次に本修正します。</p>',
        '</section>'
      ].join("");
    }

    function ensureDebug() {
      try {
        if (!shouldShow()) return;
        if (typeof document === "undefined" || !document.body) return;

        var existing = document.getElementById("aicm-v10f2j-worker-leak-dom-source-debug");
        if (existing) {
          existing.outerHTML = debugHtml();
          return;
        }

        var main = document.querySelector("main") || document.body;
        var wrap = document.createElement("div");
        wrap.innerHTML = debugHtml();

        var firstCard = main.querySelector(".aicm-core-card") || main.firstChild;
        if (firstCard && firstCard.parentNode) {
          firstCard.parentNode.insertBefore(wrap.firstChild, firstCard);
        } else {
          main.insertBefore(wrap.firstChild, main.firstChild);
        }
      } catch (error) {
        if (typeof console !== "undefined" && console && console.warn) {
          console.warn("AICM V10F2J DOM source debug failed", error);
        }
      }
    }

    function schedule() {
      setTimeout(ensureDebug, 0);
      setTimeout(ensureDebug, 200);
      setTimeout(ensureDebug, 700);
      setTimeout(ensureDebug, 1400);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", schedule, true);
    }

    var originalRenderV10F2J = typeof render === "function" ? render : null;
    if (originalRenderV10F2J && !originalRenderV10F2J.__aicmR8zV10f2jWrapped) {
      var wrappedRenderV10F2J = function() {
        var result = originalRenderV10F2J.apply(this, arguments);
        schedule();
        return result;
      };
      wrappedRenderV10F2J.__aicmR8zV10f2jWrapped = true;
      wrappedRenderV10F2J.__aicmR8zV10f2jOriginal = originalRenderV10F2J;
      render = wrappedRenderV10F2J;
    }

    schedule();

    if (typeof window !== "undefined") {
      window.aicmR8zV10f2jEnsureWorkerLeakDomSourceDebug = ensureDebug;
    }
  })();
  // ${markerDebug}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10F2J DOM source debug installed");
} else {
  log.push("SKIP: V10F2J marker already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
