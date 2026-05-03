const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const markerBack = "AICM_R8Z_V10F3_REVIEW_CONFIRM_BACK_BUTTON";
const markerRuntime = "AICM_R8Z_V10F2H_SECTION_NEW_RUNTIME_VISIBLE_DEBUG";

let src = fs.readFileSync(corePath, "utf8");
const log = [];

if (!src.includes(markerBack)) {
  const oldButtonBlock = [
    "'  <div class=\"aicm-dashboard-action-row\">',",
    "'    <button type=\"button\" data-core-action=\"review-v10f-cancel-confirm\" data-review-id=\"' + esc(id) + '\">確認を閉じる</button>',",
    "'    <button type=\"button\" disabled title=\"V10Gで有効化予定\">' + esc(operation) + 'を実行する（次工程）</button>',",
    "'  </div>',"
  ].join("\n");

  const newButtonBlock = [
    "'  <div class=\"aicm-dashboard-action-row\">',",
    "'    <button type=\"button\" data-core-action=\"review-v10f-cancel-confirm\" data-review-id=\"' + esc(id) + '\">成果物詳細へ戻る</button>',",
    "'    <button type=\"button\" data-core-action=\"review-v10f-back-list\" data-review-id=\"' + esc(id) + '\">レビュー一覧へ戻る</button>',",
    "'    <button type=\"button\" disabled title=\"V10Gで有効化予定\">' + esc(operation) + 'を実行する（次工程）</button>',",
    "'  </div>',"
  ].join("\n");

  if (src.includes(oldButtonBlock)) {
    src = src.replace(oldButtonBlock, newButtonBlock);
    log.push("PATCH_APPLIED: V10F confirm card back buttons inserted");
  } else {
    log.push("WARN: exact V10F button block not found; installing event/back compatibility only");
  }

  const handleNeedle = `if (action === "review-v10f-cancel-confirm") {`;
  if (src.includes(handleNeedle) && !src.includes("review-v10f-back-list")) {
    const insert = `
      if (action === "review-v10f-back-list") {
        if (event) {
          try { event.preventDefault(); } catch (_) {}
          try { event.stopPropagation(); } catch (_) {}
          try { event.stopImmediatePropagation(); } catch (_) {}
        }

        removeExistingConfirm();
        try {
          var s = app();
          s.screen = "review-list";
          if (typeof render === "function") render();
        } catch (_) {}
        visibleDebug("back to review-list / id=" + id);
        return true;
      }

`;
    src = src.replace(handleNeedle, insert + handleNeedle);
    log.push("PATCH_APPLIED: V10F back-list action handler inserted");
  }

  src += `\n// ${markerBack}_APPLIED\n`;
} else {
  log.push("SKIP: V10F3 back marker already exists");
}

if (!src.includes(markerRuntime)) {
  const runtimeBlock = `

  // ${markerRuntime}_START
  // Runtime visible debug only. No DB write / no API POST.
  (function installAicmR8zV10f2hSectionNewRuntimeDebug() {
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

    function countArray(value) {
      return Array.isArray(value) ? value.length : -1;
    }

    function countWorkersFromDom() {
      try {
        if (typeof document === "undefined" || !document.body) return -1;
        var html = String(document.body.innerText || "");
        var m1 = (html.match(/従業員設定/g) || []).length;
        var m2 = (html.match(/従業員設定ロボット/g) || []).length;
        var m3 = (html.match(/従業員行を追加/g) || []).length;
        return m1 + m2 + m3;
      } catch (_) {
        return -2;
      }
    }

    function renderDebugHtml() {
      var s = app();
      var ctx = s.context && typeof s.context === "object" ? s.context : {};
      var placements = Array.isArray(s.placements) ? s.placements : (Array.isArray(ctx.placements) ? ctx.placements : []);
      var selectedSectionId = text(s.selectedSectionId || s.sectionEditId || s.editingSectionId || "");
      var matchingPlacements = placements.filter(function(row) {
        var sid = text(row && (row.aicm_section_id || row.section_id || row.sectionId || row.organization_id || row.org_id));
        return selectedSectionId && sid === selectedSectionId;
      });

      return [
        '<section id="aicm-v10f2h-section-new-runtime-debug" class="aicm-core-card" style="border:3px solid #ef4444;background:#fff1f2;">',
        '  <p class="aicm-eyebrow">V10F2H / 課新規追加 runtime debug</p>',
        '  <h2>課新規追加の従業員漏れ調査</h2>',
        '  <dl class="aicm-core-detail-list">',
        '    <dt>screen</dt><dd>' + esc(s.screen) + '</dd>',
        '    <dt>selectedSectionId</dt><dd>' + esc(selectedSectionId || '-') + '</dd>',
        '    <dt>selectedSection</dt><dd>' + esc(s.selectedSection ? 'exists' : 'empty') + '</dd>',
        '    <dt>currentSection</dt><dd>' + esc(s.currentSection ? 'exists' : 'empty') + '</dd>',
        '    <dt>context.placements</dt><dd>' + esc(String(countArray(ctx.placements))) + '</dd>',
        '    <dt>state.placements</dt><dd>' + esc(String(countArray(s.placements))) + '</dd>',
        '    <dt>matching placements for selectedSectionId</dt><dd>' + esc(String(matchingPlacements.length)) + '</dd>',
        '    <dt>sectionPlacementDraft</dt><dd>' + esc(String(countArray(s.sectionPlacementDraft))) + '</dd>',
        '    <dt>workerPlacementDraft</dt><dd>' + esc(String(countArray(s.workerPlacementDraft))) + '</dd>',
        '    <dt>sectionNewDraft.workerPlacements</dt><dd>' + esc(String(s.sectionNewDraft ? countArray(s.sectionNewDraft.workerPlacements) : -1)) + '</dd>',
        '    <dt>DOM worker text hits</dt><dd>' + esc(String(countWorkersFromDom())) + '</dd>',
        '    <dt>V10F2G cleared</dt><dd>' + esc(String(!!s.aicmR8zV10f2gSectionNewStateCleared)) + '</dd>',
        '  </dl>',
        '  <p class="aicm-selected-note">このカードの数値を貼れば、次で本修正できます。</p>',
        '</section>'
      ].join("");
    }

    function ensureDebug() {
      try {
        var s = app();
        if (!s || s.screen !== "section-new") return;
        if (typeof document === "undefined" || !document.body) return;

        var existing = document.getElementById("aicm-v10f2h-section-new-runtime-debug");
        if (existing) {
          existing.outerHTML = renderDebugHtml();
          return;
        }

        var root = document.querySelector("main") || document.body;
        var wrap = document.createElement("div");
        wrap.innerHTML = renderDebugHtml();
        root.insertBefore(wrap.firstChild, root.firstChild);
      } catch (error) {
        if (typeof console !== "undefined" && console && console.warn) {
          console.warn("AICM V10F2H runtime debug failed", error);
        }
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("click", function() {
        setTimeout(ensureDebug, 120);
        setTimeout(ensureDebug, 500);
      }, true);
    }

    var originalRenderV10F2H = typeof render === "function" ? render : null;
    if (originalRenderV10F2H && !originalRenderV10F2H.__aicmR8zV10f2hWrapped) {
      var wrappedRenderV10F2H = function() {
        var result = originalRenderV10F2H.apply(this, arguments);
        setTimeout(ensureDebug, 0);
        setTimeout(ensureDebug, 200);
        return result;
      };
      wrappedRenderV10F2H.__aicmR8zV10f2hWrapped = true;
      wrappedRenderV10F2H.__aicmR8zV10f2hOriginal = originalRenderV10F2H;
      render = wrappedRenderV10F2H;
    }

    setTimeout(ensureDebug, 500);

    if (typeof window !== "undefined") {
      window.aicmR8zV10f2hEnsureSectionNewDebug = ensureDebug;
    }
  })();
  // ${markerRuntime}_END
`;

  src += runtimeBlock;
  log.push("PATCH_APPLIED: V10F2H section-new runtime visible debug installed");
} else {
  log.push("SKIP: V10F2H runtime marker already exists");
}

fs.writeFileSync(corePath, src, "utf8");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
