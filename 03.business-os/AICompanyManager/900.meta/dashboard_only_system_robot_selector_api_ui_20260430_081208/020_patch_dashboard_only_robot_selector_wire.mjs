import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_SYSTEM_ROBOT_SELECTOR_DASHBOARD_ONLY_UI_WIRE_ALP_ALS_V1";

if (!src.includes(MARK)) {
  src += `

/* ${MARK}
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
    marker: "${MARK}",
    cache: CACHE,
    loadForCompany: loadForCompany,
    applyCached: applyCached,
    restoreContext: restoreContext,
    readRule: "dashboard_switch_company_only"
  };
})();
`;
}

fs.writeFileSync(file, src);
console.log("dashboard-only robot selector UI wire patched");
