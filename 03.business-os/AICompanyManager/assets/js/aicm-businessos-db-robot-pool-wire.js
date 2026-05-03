/* AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4 */
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
    { id: "company-president-robot", role: "President", label: "President配置" },
    { id: "department-manager-robot", role: "Manager", label: "Manager配置" },
    { id: "section-leader-robot", role: "Leader", label: "Leader配置" },
    { id: "section-worker-robot-select", role: "Worker", label: "Worker配置" }
  ];

  var MODEL_ROLE_MAP = {
    "HD-R5P": ["President"],
    "HD-R5": ["ExecutiveManager", "Manager"],
    "HD-R4": ["Leader"],
    "HD-R3": ["Worker"],
    "HD-R1": ["Helper"],
    "HD-R2": ["Butler", "Battler", "Security"],
    "HD-R1C": ["Friend"],
    "HD-R1A": ["Lover"],
    "HD-R2S": ["CombatSpecialist", "Security", "Battler"],
    "HD-R2G": ["StrategicCommander", "TacticalLeader", "Battler"],
    "HD-R2T-0": ["StrategicCommander", "TacticalLeader", "Security"],

    "BYD1-001": ["Worker"],
    "BYD1-002": ["Worker", "Helper"],
    "BYD1-003": ["Worker", "Specialist"],
    "BYD2-001": ["Leader"],
    "BYD2-002": ["Leader", "Manager"],
    "BYD2-003": ["President", "Manager", "ExecutiveManager"],

    "MG-NORN-001": ["Advisor", "Worker", "Lover"],
    "MG-NORN-002": ["Advisor", "Worker", "Lover"],
    "MG-NORN-003": ["Advisor", "Worker", "Lover"]
  };

  var KNOWN_MODEL_CODES = Object.keys(MODEL_ROLE_MAP).sort(function (a, b) {
    return b.length - a.length;
  });

  var SCREEN_ROLE_ALLOW = {
    President: ["President"],
    Manager: ["Manager", "ExecutiveManager"],
    Leader: ["Leader"],
    Worker: ["Worker"]
  };

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

  function rawModelField(row) {
    return String(pick(row, [
      "model_code",
      "robot_model_code",
      "aiworker_model_code",
      "model_no",
      "model_number",
      "robot_code",
      "model_id"
    ]));
  }

  function detectModelCode(row) {
    var raw = rawModelField(row);
    var text = asText(row);
    var all = raw + " " + text;
    var i;
    var code;

    for (i = 0; i < KNOWN_MODEL_CODES.length; i += 1) {
      code = KNOWN_MODEL_CODES[i];
      if (all.indexOf(code) >= 0) return code;
    }

    if (/LVS-\d{2}[FM]v\d{3}/.test(all)) return "LOVERS";

    return raw || "";
  }

  function robotId(row) {
    return String(pick(row, [
      "business_robot_id",
      "robot_pool_id",
      "pool_robot_id",
      "company_robot_id",
      "robot_id",
      "aiworker_robot_id",
      "id"
    ]) || detectModelCode(row));
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
    ]) || detectModelCode(row));
  }

  function canonicalRolesForRobot(robot) {
    var model = detectModelCode(robot);

    if (model === "LOVERS") return ["Lover"];

    if (MODEL_ROLE_MAP[model]) {
      return MODEL_ROLE_MAP[model].slice();
    }

    return [];
  }

  function robotMatchesScreenRole(robot, screenRole) {
    var allowed = SCREEN_ROLE_ALLOW[screenRole] || [];
    var roles = canonicalRolesForRobot(robot);

    return roles.some(function (role) {
      return allowed.indexOf(role) >= 0;
    });
  }

  function roleJoin(roles) {
    return roles.join("・");
  }

  function optionLabel(robot, screenRole, screenLabel) {
    var name = displayName(robot);
    var model = detectModelCode(robot);
    var roles = canonicalRolesForRobot(robot);
    var base = screenLabel + ": " + name;

    if (model) base += " / " + model;

    if (roles.length) {
      base += " / 対応: " + roleJoin(roles);
    }

    base += " / BusinessOS DB";

    return base;
  }

  function isSelectBusy(select) {
    return document.activeElement === select;
  }

  function populateSelect(select, role, screenLabel) {
    if (!select) return;
    if (isSelectBusy(select)) return;

    var current = select.value || "";
    var previousText = "";
    if (select.selectedIndex >= 0 && select.options[select.selectedIndex]) {
      previousText = select.options[select.selectedIndex].textContent || "";
    }

    var candidates = STATE.robots.filter(function (robot) {
      return robotMatchesScreenRole(robot, role);
    });

    candidates.sort(function (a, b) {
      return optionLabel(a, role, screenLabel).localeCompare(optionLabel(b, role, screenLabel), "ja");
    });

    select.setAttribute("data-aicm-businessos-db-backed", STATE.api_ok ? "true" : "false");
    select.setAttribute("data-aicm-role-filter", role);
    select.setAttribute("data-aicm-businessos-db-candidate-count", String(candidates.length));
    select.setAttribute("data-aicm-role-filter-mode", "canonical_model_role_exact_v4_label_cleanup");

    if (!STATE.api_ok) return;

    if (!candidates.length) {
      select.setAttribute("data-aicm-db-empty-exact", "true");

      var localExists = Array.prototype.slice.call(select.options).some(function (opt) {
        return opt.value === current;
      });

      if (!localExists && current) {
        var keep = document.createElement("option");
        keep.value = current;
        keep.textContent = previousText || current + " / local保持";
        keep.selected = true;
        select.appendChild(keep);
      }

      return;
    }

    var signature = role + "::label-v4::" + candidates.map(function (r) { return robotId(r); }).join("|");

    if (select.getAttribute("data-aicm-db-signature") === signature) {
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
      opt.textContent = optionLabel(robot, role, screenLabel);
      if (current && current === opt.value) opt.selected = true;
      select.appendChild(opt);
    });

    select.setAttribute("data-aicm-db-signature", signature);
  }

  function populateAllSelects() {
    SELECT_TARGETS.forEach(function (target) {
      populateSelect(document.getElementById(target.id), target.role, target.label);
    });
  }

  function roleCount(role) {
    return STATE.robots.filter(function (robot) {
      return robotMatchesScreenRole(robot, role);
    }).length;
  }

  function updateStatusLines() {
    Array.prototype.slice.call(document.querySelectorAll("[data-aicm-db-robot-pool-status]")).forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
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
          " / President=" + roleCount("President") +
          " / Manager=" + roleCount("Manager") +
          " / Leader=" + roleCount("Leader") +
          " / Worker=" + roleCount("Worker") +
          " / label cleanup / exact filter / 数量消費なし";
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
        mode: "candidate_label_cleanup_v4",
        api_ok: STATE.api_ok,
        robot_count: STATE.robots.length,
        role_catalog_count: STATE.role_catalog.length,
        candidates: {
          President: roleCount("President"),
          Manager: roleCount("Manager"),
          Leader: roleCount("Leader"),
          Worker: roleCount("Worker")
        },
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
/* AICM_BUSINESSOS_DB_ROBOT_POOL_LABEL_CLEANUP_V4_END */


/* AICM_SYSTEM_ROBOT_SELECTOR_DASHBOARD_ONLY_UI_WIRE_ALP_ALS_V1
 * Dashboard-only read wire.
 *
 * DB/API read is allowed only when the dashboard AI企業を表示 button
 * with data-action="switch-company" is clicked.
 *
 * Other screens do not fetch. They reuse:
 * - window.AICM.selectedCompanyContext
 * - sessionStorage AICM_SELECTED_COMPANY_CONTEXT
 * - cached robotSelectorOptions
 */
(function () {
  "use strict";

  var CONTEXT_KEY = "AICM_SELECTED_COMPANY_CONTEXT";
  var CURRENT_COMPANY_KEY = "AICM_CURRENT_COMPANY_ID";

  var CACHE = {
    companyId: "",
    robots: [],
    loadedAt: 0,
    loading: false,
    lastError: ""
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function selectedDashboardCompanyId() {
    var select = byId("company-select");
    return select && select.value ? select.value : "";
  }

  function currentCompanyId() {
    return selectedDashboardCompanyId() ||
      sessionStorage.getItem(CURRENT_COMPANY_KEY) ||
      sessionStorage.getItem("AICM_PENDING_COMPANY_ID") ||
      "";
  }

  function setCurrentCompanyId(companyId) {
    if (!companyId) return;
    sessionStorage.setItem(CURRENT_COMPANY_KEY, companyId);
    sessionStorage.setItem("AICM_PENDING_COMPANY_ID", companyId);
  }

  function ensureAicm() {
    window.AICM = window.AICM || {};
    return window.AICM;
  }

  function writeContext(companyId, robots) {
    var aicm = ensureAicm();
    var context = aicm.selectedCompanyContext || {};

    context.company_id = companyId || "";
    context.robotSelectorOptions = Array.isArray(robots) ? robots : [];
    context.robot_selector_loaded_at = new Date().toISOString();
    context.robot_selector_source = "business.vw_ai_company_manager_system_robot_selector_options";
    context.robot_selector_read_rule = "dashboard_switch_company_only";

    aicm.selectedCompanyContext = context;

    try {
      sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
    } catch (error) {
      // sessionStorage failure must not break UI.
    }
  }

  function restoreContext() {
    var aicm = ensureAicm();

    if (aicm.selectedCompanyContext && Array.isArray(aicm.selectedCompanyContext.robotSelectorOptions)) {
      CACHE.companyId = aicm.selectedCompanyContext.company_id || CACHE.companyId;
      CACHE.robots = aicm.selectedCompanyContext.robotSelectorOptions || [];
      return aicm.selectedCompanyContext;
    }

    try {
      var raw = sessionStorage.getItem(CONTEXT_KEY);
      if (raw) {
        var context = JSON.parse(raw);
        if (context && Array.isArray(context.robotSelectorOptions)) {
          aicm.selectedCompanyContext = context;
          CACHE.companyId = context.company_id || "";
          CACHE.robots = context.robotSelectorOptions || [];
          return context;
        }
      }
    } catch (error) {
      // ignore broken cache
    }

    return null;
  }

  function sameText(a, b) {
    return String(a || "").toLowerCase() === String(b || "").toLowerCase();
  }

  function robotRoles(robot) {
    var roles = robot && robot.recommended_role_codes;
    if (!Array.isArray(roles)) return [];
    return roles.map(function (r) { return String(r || ""); }).filter(Boolean);
  }

  function matchesRole(robot, role) {
    return robotRoles(robot).some(function (r) {
      return sameText(r, role);
    });
  }

  function optionLabel(robot) {
    return robot.selector_label ||
      ((robot.display_name || robot.aiworker_model_code || robot.robot_pool_id || "robot") +
        " / " +
        (robot.aiworker_model_code || ""));
  }

  function roleForSelect(select) {
    var id = select && select.id ? select.id : "";
    if (id === "company-president-robot") return "President";
    if (id === "department-manager-robot") return "Manager";
    if (id === "section-leader-robot") return "Leader";
    if (id === "section-worker-robot-select") return "Worker";
    if (/^worker-assignment-.*-robot$/.test(id)) return "Worker";
    return "";
  }

  function makeOption(robot, selectedValue) {
    var opt = document.createElement("option");
    var value = robot.robot_pool_id || robot.aiworker_model_code || "";
    opt.value = value;
    opt.textContent = optionLabel(robot);
    opt.dataset.robotPoolId = robot.robot_pool_id || "";
    opt.dataset.aiworkerModelCode = robot.aiworker_model_code || "";
    opt.dataset.aiworkerSeriesCode = robot.aiworker_series_code || "";
    opt.dataset.manufacturerCode = robot.manufacturer_code || "";
    opt.dataset.assignmentModeCode = robot.assignment_mode_code || "unlimited_system_use";
    opt.dataset.entitlementScopeCode = robot.entitlement_scope_code || "system_unlimited";
    opt.dataset.recommendedRoleCodes = robotRoles(robot).join(",");
    if (selectedValue && selectedValue === value) opt.selected = true;
    return opt;
  }

  function findRobotSelects() {
    return Array.prototype.slice.call(document.querySelectorAll("select")).filter(function (select) {
      return !!roleForSelect(select);
    });
  }

  function populateSelect(select, robots) {
    var role = roleForSelect(select);
    var selectedValue = select.value || "";
    var candidates;

    if (!role) return 0;

    candidates = robots.filter(function (robot) {
      return matchesRole(robot, role);
    });

    select.innerHTML = "";

    if (!candidates.length) {
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = role + "候補なし";
      select.appendChild(empty);
      return 0;
    }

    candidates.forEach(function (robot) {
      select.appendChild(makeOption(robot, selectedValue));
    });

    return candidates.length;
  }

  function roleCounts(robots) {
    var counts = { President: 0, Manager: 0, Leader: 0, Worker: 0 };

    robots.forEach(function (robot) {
      Object.keys(counts).forEach(function (role) {
        if (matchesRole(robot, role)) counts[role] += 1;
      });
    });

    return counts;
  }

  function updateStatus(robots) {
    var counts = roleCounts(robots || []);
    var text = "BusinessOS DB robot_pool: 接続済 / President=" + counts.President +
      " / Manager=" + counts.Manager +
      " / Leader=" + counts.Leader +
      " / Worker=" + counts.Worker;

    Array.prototype.forEach.call(document.querySelectorAll("p,div,span"), function (node) {
      if (!node || !node.textContent) return;
      if (node.textContent.indexOf("BusinessOS DB robot_pool") >= 0) {
        node.textContent = text;
      }
    });
  }

  function applyCached() {
    var context = restoreContext();
    var robots = CACHE.robots;

    if ((!robots || !robots.length) && context && Array.isArray(context.robotSelectorOptions)) {
      robots = context.robotSelectorOptions;
      CACHE.robots = robots;
    }

    if (!robots || !robots.length) return 0;

    var total = 0;
    findRobotSelects().forEach(function (select) {
      total += populateSelect(select, robots);
    });
    updateStatus(robots);
    return total;
  }

  function endpoint(companyId) {
    return "/api/aicm/ai-company-manager/system-robot-selector-options" +
      (companyId ? "?company_id=" + encodeURIComponent(companyId) : "");
  }

  function loadForCompany(companyId) {
    companyId = companyId || currentCompanyId();

    if (!companyId) {
      CACHE.lastError = "company_id is empty";
      return Promise.resolve([]);
    }

    if (CACHE.loading) return Promise.resolve(CACHE.robots);

    CACHE.loading = true;
    CACHE.companyId = companyId;
    setCurrentCompanyId(companyId);

    return fetch(endpoint(companyId), { cache: "no-store" })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json || json.result !== "ok" || !Array.isArray(json.robots)) {
          throw new Error(json && json.error_message ? json.error_message : "invalid robot selector response");
        }

        CACHE.robots = json.robots;
        CACHE.loadedAt = Date.now();
        CACHE.lastError = "";

        writeContext(companyId, CACHE.robots);
        applyCached();

        return CACHE.robots;
      })
      .catch(function (error) {
        CACHE.lastError = error && error.message ? error.message : String(error);

        Array.prototype.forEach.call(document.querySelectorAll("p,div,span"), function (node) {
          if (!node || !node.textContent) return;
          if (node.textContent.indexOf("BusinessOS DB robot_pool") >= 0) {
            node.textContent = "BusinessOS DB robot_pool: 未接続 / " + CACHE.lastError;
          }
        });

        return [];
      })
      .finally(function () {
        CACHE.loading = false;
      });
  }

  function isDashboardSwitchCompanyButton(target) {
    if (!target || !target.closest) return false;
    var button = target.closest("[data-action='switch-company']");
    return !!button;
  }

  function isScreenNavigationButton(target) {
    if (!target || !target.closest) return false;
    return !!target.closest("[data-screen]");
  }

  document.addEventListener("change", function (event) {
    if (event && event.target && event.target.id === "company-select") {
      setCurrentCompanyId(event.target.value || "");
    }
  }, true);

  document.addEventListener("click", function (event) {
    if (isDashboardSwitchCompanyButton(event.target)) {
      var companyId = selectedDashboardCompanyId();
      setCurrentCompanyId(companyId);

      setTimeout(function () {
        loadForCompany(companyId);
      }, 0);
      return;
    }

    if (isScreenNavigationButton(event.target)) {
      setTimeout(function () {
        applyCached();
      }, 180);
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      restoreContext();
      setTimeout(applyCached, 120);
    });
  } else {
    restoreContext();
    setTimeout(applyCached, 120);
  }

  window.AICM = window.AICM || {};
  window.AICM.systemRobotSelector = {
    marker: "AICM_SYSTEM_ROBOT_SELECTOR_DASHBOARD_ONLY_UI_WIRE_ALP_ALS_V1",
    cache: CACHE,
    loadForCompany: loadForCompany,
    applyCached: applyCached,
    restoreContext: restoreContext,
    readRule: "dashboard_switch_company_only"
  };
})();
