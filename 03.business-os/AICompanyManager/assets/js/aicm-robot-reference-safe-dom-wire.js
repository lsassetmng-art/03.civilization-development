/* AICM_ROBOT_REFERENCE_SAFE_SEPARATE_FILE_WIRE_V1 */
(function () {
  "use strict";

  var AICM_REFERENCE_CACHE = {"generated_at":"2026-04-28T08:17:46.837Z","assignment_policy":"unlimited_system_use","quantity_consumption":false,"counts":{"business.robot_pool":44,"business.robot_placement_role_catalog":16,"aiworker.robot_model_personality_profile":44,"aiworker.robot_model_public_profile":27,"cx22073jw.vw_robot_model_full_reference_v3":31},"reference_status":{"role_catalog":true,"model_pool":true,"personality":true,"public_profile":true,"cx_full_reference":true},"errors":[]};
  var STYLE_ID = "aicm-robot-reference-safe-file-style-v1";
  var TIMER = null;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".aicm-ref-safe-card{border:1px solid #d9e1ec;border-radius:12px;background:#fbfdff;padding:12px;margin-top:12px;}",
      ".aicm-ref-safe-card h3{font-size:15px;margin:0 0 8px;}",
      ".aicm-ref-safe-card p{margin:6px 0;}",
      ".aicm-ref-safe-badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#e8f2ff;color:#0b63ce;font-weight:700;font-size:12px;margin:2px;}",
      ".aicm-ref-safe-badge-ok{background:#e8fff2;color:#087443;}",
      ".aicm-ref-safe-badge-warn{background:#fff7e8;color:#9a5b00;}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function badge(ok, label) {
    return '<span class="aicm-ref-safe-badge ' + (ok ? "aicm-ref-safe-badge-ok" : "aicm-ref-safe-badge-warn") + '">' +
      esc(label + ": " + (ok ? "OK" : "未検出")) +
      '</span>';
  }

  function referenceHtml(role) {
    var cache = AICM_REFERENCE_CACHE || {};
    var status = cache.reference_status || {};
    var counts = cache.counts || {};
    var errors = cache.errors || [];

    return [
      '<div class="aicm-ref-safe-card" data-aicm-ref-role="' + esc(role) + '">',
      '<h3>ロボット参照情報: ' + esc(role) + '</h3>',
      '<p>',
      badge(!!status.role_catalog, "role catalog"),
      badge(!!status.model_pool, "model / robot pool"),
      badge(!!status.personality, "personality"),
      badge(!!status.public_profile, "public profile"),
      badge(!!status.cx_full_reference, "CX full reference"),
      '</p>',
      '<p class="aicm-muted">robot_pool: ' + esc(counts["business.robot_pool"] || 0) +
        ' / role_catalog: ' + esc(counts["business.robot_placement_role_catalog"] || 0) +
        ' / personality: ' + esc(counts["aiworker.robot_model_personality_profile"] || 0) +
        ' / public_profile: ' + esc(counts["aiworker.robot_model_public_profile"] || 0) +
        ' / cx_full_reference: ' + esc(counts["cx22073jw.vw_robot_model_full_reference_v3"] || 0) + '</p>',
      '<p class="aicm-muted">AICompanyManagerはシステム用のため、数量消費なし・無制限割当です。</p>',
      errors.length ? '<p class="aicm-muted">参照warning: ' + esc(errors.length) + '件</p>' : '',
      '</div>'
    ].join("");
  }

  function cardText(card) {
    return (card && card.textContent ? card.textContent : "").replace(/\s+/g, " ");
  }

  function targetRole(text) {
    if (text.indexOf("Presidentロボット") >= 0) return "President";
    if (text.indexOf("Managerロボット設定") >= 0 || text.indexOf("Managerロボット") >= 0) return "Manager";
    if (text.indexOf("Leaderロボット設定") >= 0 || text.indexOf("Leaderロボット") >= 0) return "Leader";
    if (text.indexOf("Workerロボット配置") >= 0 || text.indexOf("配置済みWorker") >= 0) return "Worker";
    return "";
  }

  function applyReferenceCards() {
    try {
      injectStyle();
      Array.prototype.slice.call(document.querySelectorAll(".aicm-card")).forEach(function (card) {
        var role = targetRole(cardText(card));
        if (!role) return;
        if (card.querySelector('[data-aicm-ref-role="' + role + '"]')) return;
        card.insertAdjacentHTML("beforeend", referenceHtml(role));
      });
    } catch (error) {
      if (window && window.console && window.console.warn) {
        window.console.warn("[AICM] robot reference separate wire skipped:", error && error.message ? error.message : error);
      }
    }
  }

  function scheduleApply() {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(applyReferenceCards, 100);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", applyReferenceCards);
    } else {
      applyReferenceCards();
    }

    if (document.body && window.MutationObserver) {
      new MutationObserver(scheduleApply).observe(document.body, { childList: true, subtree: true });
    }

    window.setInterval(applyReferenceCards, 2000);
  } catch (error) {
    if (window && window.console && window.console.warn) {
      window.console.warn("[AICM] robot reference separate wire init skipped:", error && error.message ? error.message : error);
    }
  }
}());
/* AICM_ROBOT_REFERENCE_SAFE_SEPARATE_FILE_WIRE_V1_END */
