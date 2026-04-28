/* AICM_BUSINESSOS_DB_ROBOT_POOL_STABLE_WIRE_V2 */
(function () {
  "use strict";

  var API_URL = "./api/aicm/business-robot-pool";
  var STATE = {
    api_ok: false,
    loaded: false,
    loading: false,
    robots: [],
    role_catalog: [],
    counts: {},
    last_error: "",
    last_apply_at: 0
  };

  var REMOVE_PANEL_TITLES = [
    "BusinessOS AIWorker ロボット設定",
    "AICompanyManager ロボット設定導線",
    "画面別ロボット配置フィルタ",
    "保存済みロボット配置"
  ];

  var SELECT_TARGETS = [
    { id: "company-president-robot", role: "President" },
    { id: "department-manager-robot", role: "Manager" },
    { id: "section-leader-robot", role: "Leader" },
    { id: "section-worker-robot-select", role: "Worker" }
  ];

  function textOf(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
  }

  function removeBusinessOsPanels() {
    Array.prototype.slice.call(document.querySelectorAll(".aicm-card, section, article")).forEach(function (node) {
      var text = textOf(node);
      var hit = REMOVE_PANEL_TITLES.some(function (title) { return text.indexOf(title) >= 0; });
      if (hit && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function pick(row, keys) {
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (row && row[keys[i]] != null && row[keys[i]] !== "") return row[keys[i]];
    }
    return "";
  }

  function asText(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    try { return JSON.stringify(value); } catch (error) { return String(value); }
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
      "eligible_roles",
      "role_name",
      "role_layer_name_ja"
    ].forEach(function (key) {
      asArray(row && row[key]).forEach(function (role) {
        role = String(role || "").trim();
        if (role && roles.indexOf(role) < 0) roles.push(role);
      });
    });
    return roles;
  }

  function catalogRolesForRobot(robot) {
    var roles = [];
    var rid = robotId(robot);
    var model = modelCode(robot);
    var rText = asText(robot);

    STATE.role_catalog.forEach(function (row) {
      var cRole = String(pick(row, [
        "role_code",
        "placement_role_code",
        "aicm_role",
        "role",
        "role_name",
        "role_layer_name_ja"
      ]) || "").trim();

      if (!cRole) return;

      var cRobotId = String(pick(row, [
        "business_robot_id",
        "robot_pool_id",
        "pool_robot_id",
        "robot_id",
        "aiworker_robot_id",
        "model_id",
        "id"
      ]) || "");

      var cModel = String(pick(row, [
        "model_code",
        "robot_model_code",
        "aiworker_model_code",
        "model_no",
        "model_number"
      ]) || "");

      var cText = asText(row);
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
    catalogRolesForRobot(robot).forEach(function (role) {
      if (roles.indexOf(role) < 0) roles.push(role);
    });
    return roles;
  }

  function normalizeRoleText(text) {
    return String(text || "").toLowerCase();
  }

  function robotMatchesRole(robot, wantedRole) {
    var roles = rolesForRobot(robot);
    var text = normalizeRoleText(asText(robot) + " " + roles.join(" ") + " " + modelCode(robot) + " " + displayName(robot));

    if (roles.indexOf(wantedRole) >= 0) return true;

    if (wantedRole === "President") {
      return text.indexOf("president") >= 0 || text.indexOf("hd-r5p") >= 0 || text.indexOf("プレジデント") >= 0;
    }

    if (wantedRole === "Manager") {
      return text.indexOf("manager") >= 0 || text.indexOf("executivemanager") >= 0 || text.indexOf("hd-r5") >= 0 || text.indexOf("マネージャー") >= 0;
    }

    if (wantedRole === "Leader") {
      return text.indexOf("leader") >= 0 || text.indexOf("hd-r4") >= 0 || text.indexOf("リーダー") >= 0;
    }

    if (wantedRole === "Worker") {
      return text.indexOf("worker") >= 0 || text.indexOf("hd-r3") >= 0 || text.indexOf("ワーカー") >= 0;
    }

    return false;
  }

  function optionLabel(robot) {
    var name = displayName(robot) || robotId(robot);
    var model = modelCode(robot);
    var roles = rolesForRobot(robot);
    var parts = [];
    if (model) parts.push(model);
    if (roles.length) parts.push(roles.join("/"));
    parts.push("BusinessOS DB");
    return name + " / " + parts.join(" / ");
  }

  function isSelectBusy(select) {
    return document.activeElement === select;
  }

  function populateSelect(select, role) {
    if (!select) return;
    if (isSelectBusy(select)) return;

    var current = select.value || "";
    var previousText = "";
    if (select.selectedIndex >= 0 && select.options[select.selectedIndex]) {
      previousText = select.options[select.selectedIndex].textContent || "";
    }

    var candidates = STATE.robots.filter(function (robot) {
      return robotMatchesRole(robot, role);
    });

    select.setAttribute("data-aicm-businessos-db-backed", STATE.api_ok ? "true" : "false");
    select.setAttribute("data-aicm-role-filter", role);
    select.setAttribute("data-aicm-businessos-db-candidate-count", String(candidates.length));

    if (!STATE.api_ok) return;

    /*
     * Do not destroy local value if DB candidates are empty.
     * This avoids BusinessOS DB候補なし overwriting accepted local state.
     */
    if (!candidates.length) {
      if (!select.querySelector("option[data-aicm-db-empty='true']")) {
        var exists = Array.prototype.slice.call(select.options).some(function (opt) {
          return opt.value === current;
        });
        if (!exists && current) {
          var keep = document.createElement("option");
          keep.value = current;
          keep.textContent = previousText || current + " / local保持";
          keep.selected = true;
          select.appendChild(keep);
        }
      }
      return;
    }

    var signature = candidates.map(function (r) { return robotId(r); }).join("|");
    if (select.getAttribute("data-aicm-db-signature") === signature && select.getAttribute("data-aicm-db-role") === role) {
      return;
    }

    select.innerHTML = "";

    var empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "BusinessOS DB候補を選択";
    select.appendChild(empty);

    candidates.forEach(function (robot) {
      var opt = document.createElement("option");
      opt.value = robotId(robot);
      opt.textContent = optionLabel(robot);
      if (current && current === opt.value) opt.selected = true;
      select.appendChild(opt);
    });

    select.setAttribute("data-aicm-db-signature", signature);
    select.setAttribute("data-aicm-db-role", role);
  }

  function populateAllSelects() {
    SELECT_TARGETS.forEach(function (target) {
      populateSelect(document.getElementById(target.id), target.role);
    });
  }

  function updateStatusLines() {
    Array.prototype.slice.call(document.querySelectorAll("[data-aicm-db-robot-pool-status]")).forEach(function (node) {
      node.parentNode.removeChild(node);
    });

    ["AI企業設定", "部門詳細", "課詳細"].forEach(function (title) {
      Array.prototype.slice.call(document.querySelectorAll(".aicm-card")).forEach(function (card) {
        var text = textOf(card);
        if (text.indexOf(title) < 0) return;
        if (card.querySelector("[data-aicm-db-robot-pool-status]")) return;

        var p = document.createElement("p");
        p.className = "aicm-muted";
        p.setAttribute("data-aicm-db-robot-pool-status", "true");
        p.textContent = "BusinessOS DB robot_pool: " +
          (STATE.api_ok ? "接続OK" : "未接続") +
          " / robots=" + String(STATE.counts.robot_pool || STATE.robots.length || 0) +
          " / roles=" + String(STATE.counts.role_catalog || STATE.role_catalog.length || 0) +
          " / 数量消費なし";
        card.appendChild(p);
      });
    });
  }

  function applyUi() {
    try {
      var now = Date.now();
      if (now - STATE.last_apply_at < 250) return;
      STATE.last_apply_at = now;

      removeBusinessOsPanels();
      populateAllSelects();
      updateStatusLines();

      window.AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_STATUS = {
        ok: true,
        mode: "stable_one_shot_no_focus_rewrite",
        api_ok: STATE.api_ok,
        robot_count: STATE.robots.length,
        role_catalog_count: STATE.role_catalog.length,
        last_error: STATE.last_error,
        quantity_consumption: false,
        assignment_policy: "unlimited_system_use"
      };
    } catch (error) {
      window.AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_STATUS = {
        ok: false,
        error: error && error.message ? error.message : String(error)
      };
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

  function scheduleLightApply() {
    window.clearTimeout(window.AICM_DB_ROBOT_POOL_WIRE_TIMER);
    window.AICM_DB_ROBOT_POOL_WIRE_TIMER = window.setTimeout(function () {
      if (STATE.loaded) applyUi();
      else fetchPool();
    }, 200);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        fetchPool();
      });
    } else {
      fetchPool();
    }

    window.addEventListener("load", scheduleLightApply);
    window.addEventListener("focus", scheduleLightApply);

    document.addEventListener("click", function (event) {
      var target = event.target;
      if (target && target.tagName && String(target.tagName).toLowerCase() === "select") return;
      window.setTimeout(scheduleLightApply, 250);
    }, true);

    /*
     * No interval polling.
     * No MutationObserver loop.
     * Avoids Android Chrome select blink/freeze.
     */
  } catch (error) {
    window.AICM_BUSINESSOS_DB_ROBOT_POOL_WIRE_STATUS = {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_BUSINESSOS_DB_ROBOT_POOL_STABLE_WIRE_V2_END */
