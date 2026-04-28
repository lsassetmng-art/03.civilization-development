/* AICM_EXISTING_ROBOT_ASSIGNMENT_SELECT_SYNC_ROBUST_V2 */
(function () {
  "use strict";

  var TIMER = null;
  var ATTEMPT = 0;
  var MAX_ATTEMPT = 80;

  var TARGETS = [
    {
      role: "President",
      selectId: "company-president-robot",
      titleHints: ["Presidentロボット", "President robot", "社長ロボット", "Triple @President"]
    },
    {
      role: "Manager",
      selectId: "department-manager-robot",
      titleHints: ["Managerロボット設定", "Managerロボット", "部門長ロボット", "@Manager"]
    },
    {
      role: "Leader",
      selectId: "section-leader-robot",
      titleHints: ["Leaderロボット設定", "Leaderロボット", "課長", "@Leader"]
    },
    {
      role: "Worker",
      selectId: "section-worker-robot-select",
      titleHints: ["Workerロボット配置", "Worker配置", "配置済みWorker", "@Worker"]
    }
  ];

  function removePreviewNodes(root) {
    Array.prototype.slice.call((root || document).querySelectorAll("[data-aicm-placement-payload-preview]")).forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function textOf(el) {
    if (!el) return "";
    var clone = el.cloneNode(true);
    removePreviewNodes(clone);
    return (clone.textContent || "").replace(/\s+/g, " ").trim();
  }

  function isPlaceholder(select) {
    var text = "";
    if (!select) return true;
    if (select.selectedIndex >= 0 && select.options && select.options[select.selectedIndex]) {
      text = select.options[select.selectedIndex].textContent || "";
    }

    return !select.value ||
      text.indexOf("選択してください") >= 0 ||
      text.indexOf("候補を選択") >= 0 ||
      text.indexOf("BusinessOS DB候補を選択") >= 0;
  }

  function optionExists(select, value) {
    var i;
    if (!select || !value) return false;

    for (i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === value) return true;
    }

    return false;
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

  function extractUuidFromText(text) {
    var match;

    match = text.match(/Business側ロボットプール[:：]\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (match && match[1]) return match[1];

    match = text.match(/robot_pool_id["\s:：]*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (match && match[1]) return match[1];

    match = text.match(/ロボットプール[:：]\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (match && match[1]) return match[1];

    return "";
  }

  function selectCard(select) {
    if (!select) return null;
    if (select.closest) {
      return select.closest(".aicm-card") || select.closest("section") || select.closest("article");
    }
    return null;
  }

  function roleRegionText(target, select) {
    var card = selectCard(select);
    var texts = [];
    var all;
    var start;
    var end;
    var nextMarkers;
    var i;
    var marker;
    var pos;

    if (card) {
      texts.push(textOf(card));
      if (card.parentElement) texts.push(textOf(card.parentElement));
    }

    all = textOf(document.body);
    nextMarkers = ["Presidentロボット", "Managerロボット", "Leaderロボット", "Workerロボット", "会社事業方針", "会社共通ルール", "部門変更", "課変更"];

    for (i = 0; i < target.titleHints.length; i += 1) {
      marker = target.titleHints[i];
      start = all.indexOf(marker);
      if (start >= 0) {
        end = all.length;
        nextMarkers.forEach(function (m) {
          var p;
          if (m === marker) return;
          p = all.indexOf(m, start + marker.length);
          if (p > start && p < end) end = p;
        });
        texts.push(all.slice(start, end));
        break;
      }
    }

    if (target.role === "President") {
      pos = all.indexOf("@President");
      if (pos >= 0) texts.push(all.slice(Math.max(0, pos - 260), Math.min(all.length, pos + 520)));
    }
    if (target.role === "Manager") {
      pos = all.indexOf("@Manager");
      if (pos >= 0) texts.push(all.slice(Math.max(0, pos - 260), Math.min(all.length, pos + 520)));
    }
    if (target.role === "Leader") {
      pos = all.indexOf("@Leader");
      if (pos >= 0) texts.push(all.slice(Math.max(0, pos - 260), Math.min(all.length, pos + 520)));
    }
    if (target.role === "Worker") {
      pos = all.indexOf("@Worker");
      if (pos >= 0) texts.push(all.slice(Math.max(0, pos - 260), Math.min(all.length, pos + 520)));
    }

    return texts.join("\n---\n");
  }

  function findExistingRobotPoolId(target, select) {
    var text = roleRegionText(target, select);
    var id = extractUuidFromText(text);

    if (id) return id;

    return "";
  }

  function syncOne(target) {
    var select = document.getElementById(target.selectId);
    var robotPoolId;

    if (!select) return { changed: false, reason: "select_not_found" };
    if (document.activeElement === select) return { changed: false, reason: "select_focused" };
    if (!isPlaceholder(select)) return { changed: false, reason: "already_selected" };

    robotPoolId = findExistingRobotPoolId(target, select);

    if (!robotPoolId) {
      select.setAttribute("data-aicm-existing-assignment-sync-status", "no_existing_robot_pool_id_found");
      return { changed: false, reason: "no_existing_robot_pool_id_found" };
    }

    if (!optionExists(select, robotPoolId)) {
      select.setAttribute("data-aicm-existing-assignment-sync-status", "waiting_for_option");
      select.setAttribute("data-aicm-existing-assignment-sync-waiting-id", robotPoolId);
      return { changed: false, reason: "waiting_for_option" };
    }

    select.value = robotPoolId;
    select.setAttribute("data-aicm-existing-assignment-sync-status", "synced");
    select.setAttribute("data-aicm-existing-assignment-synced", "true");
    select.setAttribute("data-aicm-existing-assignment-robot-pool-id", robotPoolId);

    dispatchChange(select);

    return { changed: true, reason: "synced", robot_pool_id: robotPoolId };
  }

  function syncAll() {
    var changed = false;
    var waiting = false;
    var results = {};

    TARGETS.forEach(function (target) {
      var result = syncOne(target);
      results[target.role] = result;
      if (result.changed) changed = true;
      if (result.reason === "waiting_for_option" || result.reason === "select_not_found") waiting = true;
    });

    window.AICM_EXISTING_ROBOT_ASSIGNMENT_SELECT_SYNC_STATUS = {
      ok: true,
      changed: changed,
      waiting: waiting,
      attempt: ATTEMPT,
      mode: "existing_assignment_to_select_robust_v2",
      results: results,
      db_write: false,
      api_write: false,
      quantity_consumption: false
    };

    if ((waiting || changed) && ATTEMPT < MAX_ATTEMPT) {
      schedule(650);
    }
  }

  function schedule(delay) {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(function () {
      ATTEMPT += 1;
      syncAll();
    }, delay || 450);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { schedule(500); });
    } else {
      schedule(500);
    }

    window.addEventListener("load", function () { schedule(700); });
    window.addEventListener("focus", function () { schedule(700); });

    document.addEventListener("click", function (event) {
      var node = event.target;
      if (node && node.closest && node.closest("[data-aicm-placement-payload-preview]")) return;
      window.setTimeout(function () { schedule(350); }, 300);
    }, true);

    document.addEventListener("change", function () {
      window.setTimeout(function () { schedule(350); }, 300);
    }, true);

    window.setTimeout(function () { schedule(1000); }, 1000);
    window.setTimeout(function () { schedule(1800); }, 1800);
    window.setTimeout(function () { schedule(3000); }, 3000);
  } catch (error) {
    window.AICM_EXISTING_ROBOT_ASSIGNMENT_SELECT_SYNC_STATUS = {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_EXISTING_ROBOT_ASSIGNMENT_SELECT_SYNC_ROBUST_V2_END */
