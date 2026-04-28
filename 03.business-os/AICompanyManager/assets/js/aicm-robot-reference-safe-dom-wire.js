/* AICM_ROBOT_REFERENCE_DECLUTTER_WIRE_V3 */
(function () {
  "use strict";

  var CACHE = {"generated_at":"2026-04-28T08:17:46.837Z","assignment_policy":"unlimited_system_use","quantity_consumption":false,"counts":{"business.robot_pool":44,"business.robot_placement_role_catalog":16,"aiworker.robot_model_personality_profile":44,"aiworker.robot_model_public_profile":27,"cx22073jw.vw_robot_model_full_reference_v3":31},"reference_status":{"role_catalog":true,"model_pool":true,"personality":true,"public_profile":true,"cx_full_reference":true},"errors":[]};
  var STYLE_ID = "aicm-robot-reference-declutter-style-v3";
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
      ".aicm-ref-compact{border:1px dashed #cbd5e1;border-radius:10px;background:#f8fafc;padding:10px;margin-top:10px;font-size:13px;}",
      ".aicm-ref-compact strong{display:block;margin-bottom:6px;}",
      ".aicm-ref-compact-badge{display:inline-block;padding:3px 7px;border-radius:999px;background:#e8f2ff;color:#0b63ce;font-weight:700;font-size:11px;margin:2px;}",
      ".aicm-ref-compact-ok{background:#e8fff2;color:#087443;}",
      ".aicm-ref-compact-warn{background:#fff7e8;color:#9a5b00;}",
      ".aicm-ref-compact-muted{color:#667085;margin-top:5px;}"
    ].join("\n");

    document.head.appendChild(style);
  }

  function badge(ok, label) {
    return '<span class="aicm-ref-compact-badge ' + (ok ? "aicm-ref-compact-ok" : "aicm-ref-compact-warn") + '">' +
      esc(label + ": " + (ok ? "OK" : "未検出")) +
      '</span>';
  }

  function compactHtml() {
    var status = CACHE.reference_status || {};
    var counts = CACHE.counts || {};
    return [
      '<div class="aicm-ref-compact" data-aicm-ref-compact="robot-reference-status">',
      '<strong>ロボット参照状態</strong>',
      '<div>',
      badge(!!status.role_catalog, "role"),
      badge(!!status.model_pool, "model"),
      badge(!!status.personality, "personality"),
      badge(!!status.public_profile, "profile"),
      badge(!!status.cx_full_reference, "CX"),
      '</div>',
      '<div class="aicm-ref-compact-muted">pool=' + esc(counts["business.robot_pool"] || 0) +
        ' / role=' + esc(counts["business.robot_placement_role_catalog"] || 0) +
        ' / profile=' + esc(counts["aiworker.robot_model_public_profile"] || 0) +
        ' / cx=' + esc(counts["cx22073jw.vw_robot_model_full_reference_v3"] || 0) +
        ' / 数量消費なし</div>',
      '</div>'
    ].join("");
  }

  function textOf(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ");
  }

  function isRobotReferenceOwner(cardText) {
    if (cardText.indexOf("BusinessOS AIWorker ロボット設定") >= 0) return true;
    if (cardText.indexOf("AICompanyManager ロボット設定導線") >= 0) return true;
    if (cardText.indexOf("画面別ロボット配置フィルタ") >= 0) return true;
    if (cardText.indexOf("保存済みロボット配置") >= 0) return true;
    return false;
  }

  function shouldNeverInject(cardText) {
    if (cardText.indexOf("Presidentロボット") >= 0) return true;
    if (cardText.indexOf("Managerロボット設定") >= 0) return true;
    if (cardText.indexOf("Leaderロボット設定") >= 0) return true;
    if (cardText.indexOf("Workerロボット配置") >= 0) return true;
    if (cardText.indexOf("会社事業方針") >= 0) return true;
    if (cardText.indexOf("会社共通ルール") >= 0) return true;
    return false;
  }

  function removeOldReferenceCards() {
    Array.prototype.slice.call(document.querySelectorAll(
      "[data-aicm-ref-role], .aicm-ref-safe-card, .aicm-ref-persist-card"
    )).forEach(function (node) {
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function apply() {
    try {
      injectStyle();
      removeOldReferenceCards();

      Array.prototype.slice.call(document.querySelectorAll(".aicm-card")).forEach(function (card) {
        var text = textOf(card);
        if (shouldNeverInject(text)) return;
        if (!isRobotReferenceOwner(text)) return;
        if (card.querySelector("[data-aicm-ref-compact='robot-reference-status']")) return;
        card.insertAdjacentHTML("beforeend", compactHtml());
      });

      window.AICM_ROBOT_REFERENCE_WIRE_STATUS = {
        ok: true,
        mode: "decluttered_compact_owner_only",
        generated_at: CACHE.generated_at,
        quantity_consumption: false,
        assignment_policy: "unlimited_system_use"
      };
    } catch (error) {
      window.AICM_ROBOT_REFERENCE_WIRE_STATUS = {
        ok: false,
        error: error && error.message ? error.message : String(error)
      };
      if (window.console && window.console.warn) {
        window.console.warn("[AICM] robot reference declutter wire skipped:", error);
      }
    }
  }

  function schedule() {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(apply, 120);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", apply);
    } else {
      apply();
    }

    window.addEventListener("load", apply);
    window.addEventListener("focus", apply);
    document.addEventListener("visibilitychange", apply);
    document.addEventListener("click", function () { window.setTimeout(apply, 180); }, true);

    if (window.MutationObserver) {
      var startObserver = function () {
        if (!document.body) return;
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
      };
      if (document.body) startObserver();
      else document.addEventListener("DOMContentLoaded", startObserver);
    }

    window.setInterval(apply, 1500);
  } catch (error) {
    if (window.console && window.console.warn) {
      window.console.warn("[AICM] robot reference declutter wire init skipped:", error);
    }
  }
}());
/* AICM_ROBOT_REFERENCE_DECLUTTER_WIRE_V3_END */
