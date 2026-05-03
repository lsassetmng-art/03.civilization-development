const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const markerBack = "AICM_R8Z_V10F3B_REVIEW_LIST_TOP_BACK_BUTTON";
const markerDebug = "AICM_R8Z_V10F2I_WORKER_LEAK_ALWAYS_VISIBLE_DEBUG";

let src = fs.readFileSync(corePath, "utf8");
const log = [];

if (!src.includes(markerBack)) {
  const block = `

  // ${markerBack}_START
  // Review-list screen top back button. UI only. No DB write / no API POST.
  (function installAicmR8zV10f3bReviewListTopBackButton() {
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

    function isReviewListScreen() {
      try {
        var s = app();
        if (s && s.screen === "review-list") return true;
        if (typeof document !== "undefined" && document.body) {
          var body = String(document.body.innerText || "");
          if (body.indexOf("レビュー・承認待ち") >= 0 && body.indexOf("レビュー待ち #") >= 0) return true;
        }
      } catch (_) {}
      return false;
    }

    function backButtonHtml() {
      return [
        '<section id="aicm-v10f3b-review-list-back" class="aicm-core-card" style="border:2px solid #94a3b8;background:#f8fafc;">',
        '  <p class="aicm-eyebrow">V10F3B / レビュー一覧ナビ</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="review-list-back-previous">前の画面へ戻る</button>',
        '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
        '  </div>',
        '</section>'
      ].join("");
    }

    function ensureBackButton() {
      try {
        if (!isReviewListScreen()) return;
        if (typeof document === "undefined" || !document.body) return;

        var existing = document.getElementById("aicm-v10f3b-review-list-back");
        if (existing) return;

        var main = document.querySelector("main") || document.body;
        var wrap = document.createElement("div");
        wrap.innerHTML = backButtonHtml();

        var firstCard = main.querySelector(".aicm-core-card") || main.firstChild;
        if (firstCard && firstCard.parentNode) {
          firstCard.parentNode.insertBefore(wrap.firstChild, firstCard);
        } else {
          main.insertBefore(wrap.firstChild, main.firstChild);
        }
      } catch (error) {
        if (typeof console !== "undefined" && console && console.warn) {
          console.warn("AICM V10F3B review-list back inject failed", error);
        }
      }
    }

    function goBack() {
      var s = app();
      var target = "";
      try {
        target = text(s.aicmPreviousScreen || s.previousScreen || s.lastScreen || "");
      } catch (_) {
        target = "";
      }

      if (!target || target === "review-list" || target === "review-detail" || target === "review-confirm") {
        target = "dashboard";
      }

      try {
        s.screen = target;
        if (typeof render === "function") render();
      } catch (_) {}

      setTimeout(ensureBackButton, 0);
    }

    document.addEventListener("click", function(event) {
      var target = event && event.target;
      var button = target && target.closest ? target.closest('[data-core-action="review-list-back-previous"]') : null;
      if (!button) return;

      try { event.preventDefault(); } catch (_) {}
      try { event.stopPropagation(); } catch (_) {}
      try { event.stopImmediatePropagation(); } catch (_) {}

      goBack();
    }, true);

    function wrapReviewRenderer() {
      try {
        if (typeof window === "undefined") return false;
        if (typeof window.aicmR8zV7RenderReviewList !== "function") return false;
        if (window.aicmR8zV7RenderReviewList.__aicmR8zV10f3bWrapped) return true;

        var original = window.aicmR8zV7RenderReviewList;
        var wrapped = function() {
          var html = original.apply(this, arguments);
          var source = String(html || "");
          if (source.indexOf("aicm-v10f3b-review-list-back") >= 0) return source;
          return backButtonHtml() + source;
        };

        wrapped.__aicmR8zV10f3bWrapped = true;
        wrapped.__aicmR8zV10f3bOriginal = original;
        window.aicmR8zV7RenderReviewList = wrapped;
        return true;
      } catch (_) {
        return false;
      }
    }

    wrapReviewRenderer();
    setTimeout(wrapReviewRenderer, 0);
    setTimeout(wrapReviewRenderer, 200);
    setTimeout(ensureBackButton, 300);

    document.addEventListener("click", function() {
      setTimeout(wrapReviewRenderer, 0);
      setTimeout(ensureBackButton, 180);
    }, true);

    if (typeof window !== "undefined") {
      window.aicmR8zV10f3bEnsureReviewListBack = ensureBackButton;
    }
  })();
  // ${markerBack}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10F3B review-list top back button installed");
} else {
  log.push("SKIP: V10F3B marker already exists");
}

if (!src.includes(markerDebug)) {
  const block = `

  // ${markerDebug}_START
  // Always-visible worker leak debug when section/worker UI appears. Debug only.
  (function installAicmR8zV10f2iWorkerLeakAlwaysVisibleDebug() {
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

    function arr(value) {
      return Array.isArray(value) ? value : [];
    }

    function arrCount(value) {
      return Array.isArray(value) ? value.length : -1;
    }

    function bodyText() {
      try {
        if (typeof document === "undefined" || !document.body) return "";
        return String(document.body.innerText || "");
      } catch (_) {
        return "";
      }
    }

    function countText(pattern) {
      var b = bodyText();
      var re = new RegExp(pattern, "g");
      return (b.match(re) || []).length;
    }

    function shouldShowDebug() {
      var s = app();
      var screen = text(s.screen);
      var b = bodyText();

      if (screen === "section-new" || screen === "section-edit" || screen === "placement-new") return true;
      if (b.indexOf("従業員設定") >= 0) return true;
      if (b.indexOf("従業員設定ロボット") >= 0) return true;
      if (b.indexOf("従業員行を追加") >= 0) return true;
      if (b.indexOf("課の新規追加") >= 0 || b.indexOf("課新規") >= 0) return true;

      return false;
    }

    function placementRows() {
      var s = app();
      var ctx = s.context && typeof s.context === "object" ? s.context : {};
      if (Array.isArray(s.placements)) return s.placements;
      if (Array.isArray(ctx.placements)) return ctx.placements;
      if (Array.isArray(ctx.organization_placements)) return ctx.organization_placements;
      if (Array.isArray(ctx.section_placements)) return ctx.section_placements;
      return [];
    }

    function matchingPlacementCount(selectedSectionId) {
      var sidWanted = text(selectedSectionId);
      if (!sidWanted) return 0;

      return placementRows().filter(function(row) {
        var sid = text(row && (
          row.aicm_section_id ||
          row.section_id ||
          row.sectionId ||
          row.organization_id ||
          row.org_id ||
          row.aicm_organization_id
        ));
        return sid && sid === sidWanted;
      }).length;
    }

    function debugHtml() {
      var s = app();
      var ctx = s.context && typeof s.context === "object" ? s.context : {};
      var selectedSectionId = text(
        s.selectedSectionId ||
        s.sectionEditId ||
        s.editingSectionId ||
        s.placementEditingSectionId ||
        s.workerPlacementSectionId ||
        ""
      );

      return [
        '<section id="aicm-v10f2i-worker-leak-debug" class="aicm-core-card" style="border:3px solid #dc2626;background:#fff1f2;">',
        '  <p class="aicm-eyebrow">V10F2I / 従業員漏れ runtime debug</p>',
        '  <h2>課追加・従業員表示の状態</h2>',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>screen</dt><dd>' + esc(s.screen || "-") + '</dd>',
        '    <dt>selectedCompanyId</dt><dd>' + esc(s.selectedCompanyId || s.selected_company_id || "-") + '</dd>',
        '    <dt>selectedDepartmentId</dt><dd>' + esc(s.selectedDepartmentId || s.departmentId || "-") + '</dd>',
        '    <dt>selectedSectionId</dt><dd>' + esc(selectedSectionId || "-") + '</dd>',
        '    <dt>selectedSection</dt><dd>' + esc(s.selectedSection ? "exists" : "empty") + '</dd>',
        '    <dt>currentSection</dt><dd>' + esc(s.currentSection ? "exists" : "empty") + '</dd>',
        '    <dt>editingSectionId</dt><dd>' + esc(s.editingSectionId || "-") + '</dd>',
        '    <dt>sectionEditId</dt><dd>' + esc(s.sectionEditId || "-") + '</dd>',
        '    <dt>context.placements</dt><dd>' + esc(String(arrCount(ctx.placements))) + '</dd>',
        '    <dt>state.placements</dt><dd>' + esc(String(arrCount(s.placements))) + '</dd>',
        '    <dt>placementRows resolved</dt><dd>' + esc(String(placementRows().length)) + '</dd>',
        '    <dt>matching placements for selectedSectionId</dt><dd>' + esc(String(matchingPlacementCount(selectedSectionId))) + '</dd>',
        '    <dt>sectionPlacementDraft</dt><dd>' + esc(String(arrCount(s.sectionPlacementDraft))) + '</dd>',
        '    <dt>workerPlacementDraft</dt><dd>' + esc(String(arrCount(s.workerPlacementDraft))) + '</dd>',
        '    <dt>sectionNewDraft.workerPlacements</dt><dd>' + esc(String(s.sectionNewDraft ? arrCount(s.sectionNewDraft.workerPlacements) : -1)) + '</dd>',
        '    <dt>DOM 従業員設定</dt><dd>' + esc(String(countText("従業員設定"))) + '</dd>',
        '    <dt>DOM 従業員設定ロボット</dt><dd>' + esc(String(countText("従業員設定ロボット"))) + '</dd>',
        '    <dt>DOM 従業員行を追加</dt><dd>' + esc(String(countText("従業員行を追加"))) + '</dd>',
        '    <dt>V10F2G cleared</dt><dd>' + esc(String(!!s.aicmR8zV10f2gSectionNewStateCleared)) + '</dd>',
        '  </dl>',
        '  <p class="aicm-selected-note">この赤枠の値を貼ってください。次で本修正します。</p>',
        '</section>'
      ].join("");
    }

    function ensureDebug() {
      try {
        if (!shouldShowDebug()) return;
        if (typeof document === "undefined" || !document.body) return;

        var existing = document.getElementById("aicm-v10f2i-worker-leak-debug");
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
          console.warn("AICM V10F2I worker leak debug failed", error);
        }
      }
    }

    function scheduleDebug() {
      setTimeout(ensureDebug, 0);
      setTimeout(ensureDebug, 150);
      setTimeout(ensureDebug, 500);
      setTimeout(ensureDebug, 1000);
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function() {
        scheduleDebug();
      }, true);
    }

    var originalRenderV10F2I = typeof render === "function" ? render : null;
    if (originalRenderV10F2I && !originalRenderV10F2I.__aicmR8zV10f2iWrapped) {
      var wrappedRenderV10F2I = function() {
        var result = originalRenderV10F2I.apply(this, arguments);
        scheduleDebug();
        return result;
      };
      wrappedRenderV10F2I.__aicmR8zV10f2iWrapped = true;
      wrappedRenderV10F2I.__aicmR8zV10f2iOriginal = originalRenderV10F2I;
      render = wrappedRenderV10F2I;
    }

    scheduleDebug();

    if (typeof window !== "undefined") {
      window.aicmR8zV10f2iEnsureWorkerLeakDebug = ensureDebug;
    }
  })();
  // ${markerDebug}_END
`;

  src += block;
  log.push("PATCH_APPLIED: V10F2I always-visible worker leak debug installed");
} else {
  log.push("SKIP: V10F2I marker already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
