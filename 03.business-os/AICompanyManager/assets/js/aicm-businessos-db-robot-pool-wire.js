/* AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_V1 */
(function () {
  "use strict";

  var TIMER = null;
  var API_URL = "./api/aicm/business-robot-pool";
  var STATE = {
    loaded: false,
    loading: false,
    api_ok: false,
    robots: [],
    role_catalog: [],
    last_error: "",
    counts: {}
  };

  var REMOVE_PANEL_TITLES = [
    "BusinessOS AIWorker ロボット設定",
    "AICompanyManager ロボット設定導線",
    "画面別ロボット配置フィルタ",
    "保存済みロボット配置"
  ];

  var SELECT_TARGETS = [
    { id: "company-president-robot", role: "President", label: "President" },
    { id: "department-manager-robot", role: "Manager", label: "Manager" },
    { id: "section-leader-robot", role: "Leader", label: "Leader" },
    { id: "section-worker-robot-select", role: "Worker", label: "Worker" }
  ];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function textOf(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
  }

  function removeBusinessOsPanels() {
    Array.prototype.slice.call(document.querySelectorAll(".aicm-card, section, article")).forEach(function (node) {
      var text = textOf(node);
      var hit = REMOVE_PANEL_TITLES.some(function (title) { return text.indexOf(title) >= 0; });

      if (!hit) return;

      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  function pick(row, keys) {
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (row && row[keys[i]] != null && row[keys[i]] !== "") return row[keys[i]];
    }
    return "";
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value == null || value === "") return [];
    if (typeof value === "string") {
      try {
        var parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (error) {}
      return value.split(/[ ,/|]+/).filter(Boolean);
    }
    return [value];
  }

  function normalizeRole(value) {
    return String(value || "").trim();
  }

  function rowString(row) {
    try {
      return JSON.stringify(row || {});
    } catch (error) {
      return "";
    }
  }

  function robotId(row) {
    return String(pick(row, [
      "business_robot_id",
      "robot_pool_id",
      "pool_robot_id",
      "company_robot_id",
      "robot_id",
      "aiworker_robot_id",
      "model_id",
      "model_code",
      "id"
    ]));
  }

  function modelCode(row) {
    return String(pick(row, [
      "model_code",
      "robot_model_code",
      "aiworker_model_code",
      "model_no",
      "model_number",
      "robot_code"
    ]));
  }

  function displayName(row) {
    return String(pick(row, [
      "display_name",
      "robot_display_name",
      "robot_name",
      "model_name_ja",
      "model_name",
      "name",
      "model_code",
      "id"
    ]));
  }

  function directRoles(row) {
    var roles = [];

    [
      "role_code",
      "aicm_role",
      "default_role",
      "placement_role_code",
      "worker_role",
      "role",
      "role_codes",
      "assignable_roles",
      "assignable_role_codes",
      "eligible_roles"
    ].forEach(function (key) {
      asArray(row && row[key]).forEach(function (role) {
        role = normalizeRole(role);
        if (role && roles.indexOf(role) < 0) roles.push(role);
      });
    });

    return roles;
  }

  function catalogRolesForRobot(robot, catalog) {
    var roles = [];
    var rid = robotId(robot);
    var model = modelCode(robot);
    var rText = rowString(robot);

    catalog.forEach(function (row) {
      var cRole = normalizeRole(pick(row, [
        "role_code",
        "placement_role_code",
        "aicm_role",
        "role",
        "role_name"
      ]));

      if (!cRole) return;

      var cRobotId = String(pick(row, [
        "business_robot_id",
        "robot_pool_id",
        "pool_robot_id",
        "robot_id",
        "aiworker_robot_id",
        "model_id",
        "id"
      ]));

      var cModel = String(pick(row, [
        "model_code",
        "robot_model_code",
        "aiworker_model_code",
        "model_no",
        "model_number"
      ]));

      var cText = rowString(row);
      var match = false;

      if (rid && cRobotId && rid === cRobotId) match = true;
      if (model && cModel && model === cModel) match = true;
      if (!match && model && cText.indexOf(model) >= 0) match = true;
      if (!match && rid && cText.indexOf(rid) >= 0) match = true;
      if (!match && cModel && rText.indexOf(cModel) >= 0) match = true;

      if (match && roles.indexOf(cRole) < 0) roles.push(cRole);
    });

    return roles;
  }

  function rolesForRobot(robot) {
    var roles = directRoles(robot);
    catalogRolesForRobot(robot, STATE.role_catalog).forEach(function (role) {
      if (roles.indexOf(role) < 0) roles.push(role);
    });
    return roles;
  }

  function robotMatchesRole(robot, wantedRole) {
    var roles = rolesForRobot(robot);
    var text = rowString(robot);

    if (roles.indexOf(wantedRole) >= 0) return true;

    if (wantedRole === "President") {
      return roles.indexOf("ExecutiveManager") < 0 && text.indexOf("HD-R5P") >= 0;
    }

    if (wantedRole === "Manager") {
      return roles.indexOf("ExecutiveManager") >= 0 || roles.indexOf("Manager") >= 0;
    }

    return false;
  }

  function optionLabel(robot, role) {
    var name = displayName(robot);
    var model = modelCode(robot);
    var roles = rolesForRobot(robot);
    var suffix = [];

    if (model) suffix.push(model);
    if (roles.length) suffix.push(roles.join("/"));

    return name + (suffix.length ? " / " + suffix.join(" / ") : "") + " / BusinessOS DB";
  }

  function populateSelect(select, role) {
    var selected = select.value || "";
    var candidates = STATE.robots.filter(function (robot) {
      return robotMatchesRole(robot, role);
    });

    select.setAttribute("data-aicm-businessos-db-backed", STATE.api_ok ? "true" : "false");
    select.setAttribute("data-aicm-role-filter", role);

    if (!STATE.api_ok) {
      return;
    }

    select.innerHTML = "";

    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = candidates.length ? "BusinessOS DB候補を選択" : "BusinessOS DB候補なし";
    select.appendChild(empty);

    candidates.forEach(function (robot) {
      var opt = document.createElement("option");
      opt.value = robotId(robot);
      opt.textContent = optionLabel(robot, role);
      if (selected && selected === opt.value) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function populateAllSelects() {
    SELECT_TARGETS.forEach(function (target) {
      var select = document.getElementById(target.id);
      if (!select) return;
      populateSelect(select, target.role);
    });
  }

  function statusLine() {
    return "BusinessOS DB robot_pool 接続: " +
      (STATE.api_ok ? "OK" : "未接続") +
      " / robot_pool=" + String(STATE.counts.robot_pool || STATE.robots.length || 0) +
      " / role_catalog=" + String(STATE.counts.role_catalog || STATE.role_catalog.length || 0) +
      " / 数量消費なし";
  }

  function placeSmallStatus() {
    Array.prototype.slice.call(document.querySelectorAll(".aicm-card")).forEach(function (card) {
      var text = textOf(card);

      if (text.indexOf("AI企業設定") < 0 && text.indexOf("部門詳細") < 0 && text.indexOf("課詳細") < 0) return;
      if (card.querySelector("[data-aicm-db-robot-pool-status]")) return;

      var p = document.createElement("p");
      p.className = "aicm-muted";
      p.setAttribute("data-aicm-db-robot-pool-status", "true");
      p.textContent = statusLine();
      card.appendChild(p);
    });
  }

  function applyUi() {
    try {
      removeBusinessOsPanels();
      populateAllSelects();
      placeSmallStatus();

      window.AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_STATUS = {
        ok: true,
        api_ok: STATE.api_ok,
        robot_count: STATE.robots.length,
        role_catalog_count: STATE.role_catalog.length,
        quantity_consumption: false,
        assignment_policy: "unlimited_system_use",
        last_error: STATE.last_error
      };
    } catch (error) {
      window.AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_STATUS = {
        ok: false,
        error: error && error.message ? error.message : String(error)
      };
      if (window.console && window.console.warn) {
        window.console.warn("[AICM] BusinessOS DB robot_pool wire skipped:", error);
      }
    }
  }

  function fetchPool() {
    if (STATE.loading) return Promise.resolve();
    STATE.loading = true;

    return fetch(API_URL, { cache: "no-store" })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, status: res.status, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok || !result.body || result.body.result !== "ok") {
          STATE.api_ok = false;
          STATE.last_error = "API failed: " + result.status;
          return;
        }

        STATE.api_ok = true;
        STATE.loaded = true;
        STATE.last_error = "";
        STATE.robots = Array.isArray(result.body.robots) ? result.body.robots : [];
        STATE.role_catalog = Array.isArray(result.body.role_catalog) ? result.body.role_catalog : [];
        STATE.counts = result.body.counts || {};
      })
      .catch(function (error) {
        STATE.api_ok = false;
        STATE.last_error = error && error.message ? error.message : String(error);
      })
      .then(function () {
        STATE.loading = false;
        applyUi();
      });
  }

  function schedule() {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(function () {
      if (!STATE.loaded) fetchPool();
      else applyUi();
    }, 100);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        fetchPool().then(applyUi);
      });
    } else {
      fetchPool().then(applyUi);
    }

    window.addEventListener("load", schedule);
    window.addEventListener("focus", schedule);
    document.addEventListener("visibilitychange", schedule);
    document.addEventListener("click", function () { window.setTimeout(schedule, 150); }, true);

    if (window.MutationObserver) {
      var startObserver = function () {
        if (!document.body) return;
        new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
      };
      if (document.body) startObserver();
      else document.addEventListener("DOMContentLoaded", startObserver);
    }

    window.setInterval(function () {
      fetchPool().then(applyUi);
    }, 5000);
  } catch (error) {
    if (window.console && window.console.warn) {
      window.console.warn("[AICM] BusinessOS DB robot_pool wire init skipped:", error);
    }
  }
}());
/* AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_V1_END */
