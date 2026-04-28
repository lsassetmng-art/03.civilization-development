/* AICM_LEGACY_LOCAL_ROBOT_SELECTION_GUARD_V1 */
/* AICM_LEGACY_GUARD_ROLE_ELIGIBILITY_SEGMENT_STRICT_V2 */
(function () {
  "use strict";

  var TIMER = null;
  var ATTEMPT = 0;
  var MAX_ATTEMPT = 90;

  var TARGETS = [
    {
      role: "President",
      selectId: "company-president-robot",
      roleWords: ["President", "社長"]
    },
    {
      role: "Manager",
      selectId: "department-manager-robot",
      roleWords: ["Manager", "ExecutiveManager", "部門長"]
    },
    {
      role: "Leader",
      selectId: "section-leader-robot",
      roleWords: ["Leader", "リーダー", "課長"]
    },
    {
      role: "Worker",
      selectId: "section-worker-robot-select",
      roleWords: ["Worker", "ワーカー"]
    }
  ];

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function selectedText(select) {
    if (!select || select.selectedIndex < 0 || !select.options || !select.options[select.selectedIndex]) return "";
    return select.options[select.selectedIndex].textContent || "";
  }

  function isPlaceholderText(text) {
    var t = String(text || "");
    return !t ||
      t.indexOf("選択してください") >= 0 ||
      t.indexOf("候補を選択") >= 0 ||
      t.indexOf("BusinessOS DB候補を選択") >= 0;
  }

  function isValidBusinessOsSelection(select, target) {
    var text = selectedText(select);
    var option;

    if (!select) return false;
    if (isPlaceholderText(text)) return false;
    if (!isUuid(select.value)) return false;
    if (text.indexOf("BusinessOS DB") < 0) return false;

    option = select.options && select.selectedIndex >= 0 ? select.options[select.selectedIndex] : null;
    if (!optionMatchesRole(option, target)) return false;

    return true;
  }

  function isInvalidLegacySelection(select, target) {
    var text = selectedText(select);

    if (!select) return false;
    if (isPlaceholderText(text)) return false;
    if (isValidBusinessOsSelection(select, target)) return false;

    return true;
  }

  function optionMatchesRole(option, target) {
    var text = option ? option.textContent || "" : "";
    var rolePart = "";
    var idx;
    var i;

    if (!option || !isUuid(option.value)) return false;
    if (text.indexOf("BusinessOS DB") < 0) return false;

    idx = text.indexOf("対応:");
    if (idx < 0) return false;

    rolePart = text.slice(idx)
      .replace(/AICompanyManager/g, "AICM")
      .replace(/[^A-Za-z0-9_]+/g, " ");

    rolePart = " " + rolePart.trim() + " ";

    for (i = 0; i < target.roleWords.length; i += 1) {
      if (rolePart.indexOf(" " + target.roleWords[i] + " ") >= 0) return true;
    }

    return false;
  }

  function firstBusinessOsOption(select, target) {
    var i;
    if (!select || !select.options) return null;

    for (i = 0; i < select.options.length; i += 1) {
      if (optionMatchesRole(select.options[i], target)) return select.options[i];
    }

    return null;
  }

  function dispatchChange(select) {
    try {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (error) {
      var event = document.createEvent("Event");
      event.initEvent("change", true, true);
      select.dispatchEvent(event);
    }
  }

  function repairOne(target) {
    var select = document.getElementById(target.selectId);
    var option;

    if (!select) return { changed: false, reason: "select_not_found" };
    if (document.activeElement === select) return { changed: false, reason: "select_focused" };

    if (isValidBusinessOsSelection(select, target)) {
      select.setAttribute("data-aicm-legacy-local-guard-status", "already_valid_businessos_db");
      return { changed: false, reason: "already_valid_businessos_db" };
    }

    if (!isInvalidLegacySelection(select, target)) {
      return { changed: false, reason: "not_legacy_selection" };
    }

    option = firstBusinessOsOption(select, target);

    if (!option) {
      select.setAttribute("data-aicm-legacy-local-guard-status", "waiting_for_businessos_db_option");
      return { changed: false, reason: "waiting_for_businessos_db_option" };
    }

    select.value = option.value;
    select.setAttribute("data-aicm-legacy-local-guard-status", "repaired_to_businessos_db");
    select.setAttribute("data-aicm-legacy-local-guard-old-text", selectedText(select));
    select.setAttribute("data-aicm-legacy-local-guard-role", target.role);

    dispatchChange(select);

    return {
      changed: true,
      reason: "repaired_to_businessos_db",
      role: target.role,
      robot_pool_id: option.value,
      option_text: option.textContent || ""
    };
  }

  function run() {
    var results = {};
    var changed = false;
    var waiting = false;

    TARGETS.forEach(function (target) {
      var result = repairOne(target);
      results[target.role] = result;
      if (result.changed) changed = true;
      if (result.reason === "waiting_for_businessos_db_option" || result.reason === "select_not_found") waiting = true;
    });

    window.AICM_LEGACY_LOCAL_ROBOT_SELECTION_GUARD_STATUS = {
      ok: true,
      attempt: ATTEMPT,
      changed: changed,
      waiting: waiting,
      mode: "legacy_local_to_businessos_db_v1",
      results: results,
      db_write: false,
      api_write: false,
      quantity_consumption: false
    };

    if ((changed || waiting) && ATTEMPT < MAX_ATTEMPT) {
      schedule(650);
    }
  }

  function schedule(delay) {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(function () {
      ATTEMPT += 1;
      run();
    }, delay || 400);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { schedule(600); });
    } else {
      schedule(600);
    }

    window.addEventListener("load", function () { schedule(700); });
    window.addEventListener("focus", function () { schedule(700); });

    document.addEventListener("click", function () {
      window.setTimeout(function () { schedule(350); }, 300);
    }, true);

    document.addEventListener("change", function () {
      window.setTimeout(function () { schedule(350); }, 300);
    }, true);

    window.setTimeout(function () { schedule(1000); }, 1000);
    window.setTimeout(function () { schedule(1800); }, 1800);
    window.setTimeout(function () { schedule(3200); }, 3200);
  } catch (error) {
    window.AICM_LEGACY_LOCAL_ROBOT_SELECTION_GUARD_STATUS = {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_LEGACY_LOCAL_ROBOT_SELECTION_GUARD_V1_END */
