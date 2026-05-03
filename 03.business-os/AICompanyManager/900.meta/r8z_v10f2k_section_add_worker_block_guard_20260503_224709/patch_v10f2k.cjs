const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V10F2K_SECTION_ADD_WORKER_BLOCK_GUARD";
const markerBack = "AICM_R8Z_V10F3D_REVIEW_LIST_BACK_SINGLE_DASHBOARD";

let src = fs.readFileSync(corePath, "utf8");
const log = [];

if (!src.includes(markerBack)) {
  src += `

  // ${markerBack}_START
  // Review-list navigation final: single 「戻る」 button to dashboard.
  (function installAicmR8zV10f3dReviewBackSingleDashboard() {
    function isReviewListScreen() {
      try {
        if (typeof state !== "undefined" && state && state.screen === "review-list") return true;
      } catch (_) {}

      try {
        if (typeof document !== "undefined" && document.body) {
          var text = String(document.body.innerText || "");
          return text.indexOf("レビュー・承認待ち") >= 0 && text.indexOf("レビュー待ち #") >= 0;
        }
      } catch (_) {}

      return false;
    }

    function navHtml() {
      return [
        '<section id="aicm-v10f3d-review-list-back-single" class="aicm-core-card" style="border:2px solid #94a3b8;background:#f8fafc;">',
        '  <p class="aicm-eyebrow">レビュー一覧ナビ</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-list-back-dashboard-final">戻る</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function removeOldNavs() {
      [
        "aicm-v10f3b-review-list-back",
        "aicm-v10f3c-review-list-back-simple",
        "aicm-v10f3d-review-list-back-single"
      ].forEach(function(id) {
        try {
          var node = document.getElementById(id);
          if (node) node.remove();
        } catch (_) {}
      });
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
          console.warn("AICM V10F3D review back nav failed", error);
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
        if (typeof location !== "undefined") {
          location.href = location.origin + location.pathname + "?screen=dashboard&v=r8z_v10f3d_back";
        }
      } catch (_) {}
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function(event) {
        var target = event && event.target;
        var button = target && target.closest ? target.closest('[data-core-action="review-list-back-dashboard-final"]') : null;
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
        if (window.aicmR8zV7RenderReviewList.__aicmR8zV10f3dWrapped) return true;

        var original = window.aicmR8zV7RenderReviewList;
        var wrapped = function() {
          var html = String(original.apply(this, arguments) || "");
          html = html.replace(/<section id="aicm-v10f3b-review-list-back"[\\s\\S]*?<\\/section>/g, "");
          html = html.replace(/<section id="aicm-v10f3c-review-list-back-simple"[\\s\\S]*?<\\/section>/g, "");
          html = html.replace(/<section id="aicm-v10f3d-review-list-back-single"[\\s\\S]*?<\\/section>/g, "");
          return navHtml() + html;
        };

        wrapped.__aicmR8zV10f3dWrapped = true;
        wrapped.__aicmR8zV10f3dOriginal = original;
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
        setTimeout(ensureNav, 160);
      }, true);
    }
  })();
  // ${markerBack}_END
`;
  log.push("PATCH_APPLIED: V10F3D review-list back single dashboard installed");
} else {
  log.push("SKIP: V10F3D marker already exists");
}

if (!src.includes(marker)) {
  src += `

  // ${marker}_START
  // Section-add worker block guard. UI only. No DB write / no API POST.
  (function installAicmR8zV10f2kSectionAddWorkerBlockGuard() {
    var DEBUG_IDS = [
      "aicm-v10f2h-section-new-runtime-debug",
      "aicm-v10f2i-worker-leak-debug",
      "aicm-v10f2j-worker-leak-dom-source-debug"
    ];

    function textOf(node) {
      try {
        return String(node && (node.innerText || node.textContent) || "").replace(/\\s+/g, " ").trim();
      } catch (_) {
        return "";
      }
    }

    function addDebugHideStyle() {
      try {
        if (typeof document === "undefined") return;
        if (document.getElementById("aicm-v10f2k-hide-old-debug-style")) return;

        var style = document.createElement("style");
        style.id = "aicm-v10f2k-hide-old-debug-style";
        style.textContent = [
          "#aicm-v10f2h-section-new-runtime-debug{display:none!important}",
          "#aicm-v10f2i-worker-leak-debug{display:none!important}",
          "#aicm-v10f2j-worker-leak-dom-source-debug{display:none!important}"
        ].join("\\n");
        document.head.appendChild(style);
      } catch (_) {}
    }

    function cloneMainTextWithoutDebug() {
      try {
        if (typeof document === "undefined" || !document.body) return "";
        var clone = document.body.cloneNode(true);
        DEBUG_IDS.forEach(function(id) {
          var node = clone.querySelector("#" + id);
          if (node) node.remove();
        });
        var navs = clone.querySelectorAll("#aicm-v10f3b-review-list-back,#aicm-v10f3c-review-list-back-simple,#aicm-v10f3d-review-list-back-single");
        navs.forEach(function(node) { node.remove(); });
        return textOf(clone);
      } catch (_) {
        return "";
      }
    }

    function looksLikeSectionAddScreen() {
      var text = cloneMainTextWithoutDebug();

      if (text.indexOf("課の新規追加") >= 0) return true;
      if (text.indexOf("課新規追加") >= 0) return true;
      if (text.indexOf("課追加") >= 0) return true;

      // 現在の画面は「課設定」系で、保存前確認導線を持つ新規/編集共用フォーム。
      // 既存課のID/詳細表示が見えない状態で従業員設定が出る場合、新規追加扱いに寄せる。
      if (
        text.indexOf("課設定") >= 0 &&
        text.indexOf("保存時は確認画面を通して登録します") >= 0 &&
        text.indexOf("従業員設定ロボット") >= 0 &&
        text.indexOf("review_id") < 0
      ) {
        return true;
      }

      return false;
    }

    function isOldDebugOrNav(node) {
      if (!node || !node.id) return false;
      return DEBUG_IDS.indexOf(node.id) >= 0 ||
        node.id === "aicm-v10f3b-review-list-back" ||
        node.id === "aicm-v10f3c-review-list-back-simple" ||
        node.id === "aicm-v10f3d-review-list-back-single";
    }

    function clearControls(node) {
      try {
        var controls = node.querySelectorAll("select,input,textarea");
        controls.forEach(function(control) {
          try {
            if (control.tagName === "SELECT") {
              control.selectedIndex = 0;
              control.value = "";
            } else if (control.type === "checkbox" || control.type === "radio") {
              control.checked = false;
            } else {
              control.value = "";
            }
          } catch (_) {}
        });
      } catch (_) {}
    }

    function findWorkerCards() {
      var cards = [];
      try {
        var candidates = document.querySelectorAll(".aicm-core-card, section, article, div");
        candidates.forEach(function(node) {
          if (!node || isOldDebugOrNav(node)) return;

          var text = textOf(node);
          if (!text) return;

          var hasWorkerTitle =
            text.indexOf("従業員設定") >= 0 ||
            text.indexOf("従業員設定ロボット") >= 0 ||
            text.indexOf("従業員行を追加") >= 0 ||
            text.indexOf("この課に配置するWorkerを設定します") >= 0;

          if (!hasWorkerTitle) return;

          // 大きすぎるroot/mainを消さないため、近いcardだけを優先
          var isReasonableBlock = text.length < 5000 || node.classList.contains("aicm-core-card");
          if (!isReasonableBlock) return;

          cards.push(node);
        });
      } catch (_) {}

      // 親子重複を避け、内側カード優先
      return cards.filter(function(node) {
        return !cards.some(function(other) {
          return other !== node && node.contains(other);
        });
      });
    }

    function infoHtml(count) {
      return [
        '<section id="aicm-v10f2k-section-add-worker-guard-info" class="aicm-core-card" style="border:2px solid #38bdf8;background:#eff6ff;">',
        '  <p class="aicm-eyebrow">V10F2K / 課追加の従業員設定</p>',
        '  <h2>従業員は未設定です</h2>',
        '  <p class="aicm-selected-note">新規課では、既存課の従業員設定を引き継ぎません。</p>',
        '  <p class="aicm-selected-note">課を保存したあと、課詳細から従業員を配置してください。</p>',
        '  <p class="aicm-selected-note">除去した従業員設定ブロック: ' + String(count || 0) + '件</p>',
        '</section>'
      ].join("");
    }

    function ensureInfo(count) {
      try {
        if (document.getElementById("aicm-v10f2k-section-add-worker-guard-info")) return;
        var main = document.querySelector("main") || document.body;
        var wrap = document.createElement("div");
        wrap.innerHTML = infoHtml(count);

        var firstCard = main.querySelector(".aicm-core-card");
        if (firstCard && firstCard.parentNode) {
          firstCard.parentNode.insertBefore(wrap.firstChild, firstCard);
        } else {
          main.insertBefore(wrap.firstChild, main.firstChild);
        }
      } catch (_) {}
    }

    function applyGuard() {
      try {
        addDebugHideStyle();

        DEBUG_IDS.forEach(function(id) {
          var node = document.getElementById(id);
          if (node) node.remove();
        });

        if (!looksLikeSectionAddScreen()) return;

        var cards = findWorkerCards();
        var removed = 0;

        cards.forEach(function(card) {
          try {
            if (!card || isOldDebugOrNav(card)) return;
            clearControls(card);
            card.remove();
            removed += 1;
          } catch (_) {}
        });

        ensureInfo(removed);
      } catch (error) {
        if (typeof console !== "undefined" && console && console.warn) {
          console.warn("AICM V10F2K section add worker guard failed", error);
        }
      }
    }

    function schedule() {
      setTimeout(applyGuard, 0);
      setTimeout(applyGuard, 160);
      setTimeout(applyGuard, 500);
      setTimeout(applyGuard, 1200);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", schedule, true);
      document.addEventListener("change", schedule, true);
    }

    var originalRenderV10F2K = typeof render === "function" ? render : null;
    if (originalRenderV10F2K && !originalRenderV10F2K.__aicmR8zV10f2kWrapped) {
      var wrappedRenderV10F2K = function() {
        var result = originalRenderV10F2K.apply(this, arguments);
        schedule();
        return result;
      };
      wrappedRenderV10F2K.__aicmR8zV10f2kWrapped = true;
      wrappedRenderV10F2K.__aicmR8zV10f2kOriginal = originalRenderV10F2K;
      render = wrappedRenderV10F2K;
    }

    schedule();

    if (typeof window !== "undefined") {
      window.aicmR8zV10f2kApplySectionAddWorkerGuard = applyGuard;
    }
  })();
  // ${marker}_END
`;
  log.push("PATCH_APPLIED: V10F2K section-add worker block guard installed");
} else {
  log.push("SKIP: V10F2K marker already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
