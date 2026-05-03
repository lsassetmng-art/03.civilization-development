import fs from "node:fs";

const serverFile = process.argv[2];
const jsFile = process.argv[3];
const indexFile = process.argv[4];
const runTs = process.argv[5];

let server = fs.readFileSync(serverFile, "utf8");
let js = fs.readFileSync(jsFile, "utf8");
let index = fs.readFileSync(indexFile, "utf8");

const NEW_MARK = "AICM_V2_SINGLE_PRODUCTION_BRIDGE_AMV_AMY_V1";
const SERVER_MARK = "AICM_V2_SAFE_SERVER_ERROR_AMV_AMY_V1";

/*
 * 1. Disable all previous appended v2 production bridge IIFEs.
 * They were appended as:
 * / * AICM_V2_PRODUCTION_UI_BRIDGE... * /
 * (function () { ... })();
 */
js = js.replace(
  /\/\*\s*AICM_V2_PRODUCTION_UI_BRIDGE_[\s\S]*?\n\}\)\(\);\s*/g,
  function (m) {
    return "\n/* AMV_AMY_DISABLED_OLD_V2_BRIDGE_START\n" + m + "\nAMV_AMY_DISABLED_OLD_V2_BRIDGE_END */\n";
  }
);

js = js.replace(
  /\/\*\s*AICM_V2_LOCAL_SOURCE_PURGE_HELPER_START\s*\*\/[\s\S]*?\/\*\s*AICM_V2_LOCAL_SOURCE_PURGE_HELPER_END\s*\*\//g,
  ""
);

/*
 * 2. Add one new bridge only.
 */
if (!js.includes(NEW_MARK)) {
  js += `

/* ${NEW_MARK}
 * Single production bridge.
 * Exact actions only. No debug card. No global save client.
 */
(function () {
  "use strict";

  if (window.${NEW_MARK}) return;
  window.${NEW_MARK} = true;

  var STORAGE_KEY = "AICM_PHASE_AN_SPLIT_ADD_EDIT_STATE";
  var OWNER_KEY = "AICM_OWNER_CIVILIZATION_ID";
  var SELECTED_COMPANY_KEY = "AICM_V2_SELECTED_COMPANY_ID";
  var SELECTED_DEPARTMENT_KEY = "AICM_V2_SELECTED_DEPARTMENT_ID";
  var CONTEXT_CACHE_KEY = "AICM_V2_SELECTED_COMPANY_CONTEXT";
  var DEFAULT_OWNER = "00000000-0000-4000-8000-000000000001";

  function byId(id) {
    return document.getElementById(id);
  }

  function value(id) {
    var el = byId(id);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function ownerCivilizationId() {
    var stored = localStorage.getItem(OWNER_KEY);
    if (stored) return stored;
    localStorage.setItem(OWNER_KEY, DEFAULT_OWNER);
    return DEFAULT_OWNER;
  }

  function list(v) {
    return Array.isArray(v) ? v : [];
  }

  function requestJson(path, body) {
    var options = body ? {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    } : { method: "GET" };

    return fetch(path, options).then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok || !json || json.result !== "ok") {
          throw new Error(json && json.error_message ? json.error_message : "AICM v2 API error");
        }
        return json;
      });
    });
  }

  function mapRobotCatalog(ctx) {
    return list(ctx.robot_catalog).map(function (r) {
      return {
        id: r.robot_pool_id || r.aiworker_model_code,
        robot_pool_id: r.robot_pool_id || "",
        aiworker_model_code: r.aiworker_model_code || "",
        name: r.display_name || r.aiworker_model_code || "",
        display_name: r.display_name || r.aiworker_model_code || "",
        selector_label: r.selector_label || r.display_name || r.aiworker_model_code || "",
        recommended_role_codes: list(r.recommended_role_codes),
        manufacturer_code: r.manufacturer_code || "",
        aiworker_series_code: r.aiworker_series_code || ""
      };
    });
  }

  function v2CompanyExists(ctx, id) {
    if (!id) return false;
    return list(ctx.companies).some(function (c) {
      return c.aicm_user_company_id === id;
    });
  }

  function v2DepartmentExists(ctx, companyId, departmentId) {
    if (!departmentId) return false;
    return list(ctx.departments).some(function (d) {
      return d.aicm_user_company_id === companyId &&
        d.aicm_user_company_department_id === departmentId;
    });
  }

  function buildLegacyState(ctx, requestedCompanyId) {
    var companies = list(ctx.companies).map(function (c) {
      return {
        id: c.aicm_user_company_id,
        company_id: c.aicm_user_company_id,
        name: c.company_name || "",
        company_name: c.company_name || "",
        business_domain: c.business_domain || "",
        company_common_rules: [],
        company_common_rules_text: c.company_common_rules_text || "",
        departments: []
      };
    });

    var companyById = {};
    companies.forEach(function (c) { companyById[c.id] = c; });

    var deptById = {};
    list(ctx.departments).forEach(function (d) {
      var dept = {
        id: d.aicm_user_company_department_id,
        department_id: d.aicm_user_company_department_id,
        name: d.department_name || "",
        department_name: d.department_name || "",
        purpose: d.purpose || "",
        organizations: [],
        task_ledger: [],
        review_items: []
      };
      deptById[dept.id] = dept;
      if (companyById[d.aicm_user_company_id]) {
        companyById[d.aicm_user_company_id].departments.push(dept);
      }
    });

    list(ctx.sections).forEach(function (s) {
      var sec = {
        id: s.aicm_user_company_section_id,
        organization_id: s.aicm_user_company_section_id,
        name: s.section_name || "",
        organization_name: s.section_name || "",
        purpose: s.purpose || "",
        robot_ids: [],
        worker_robot_assignments: []
      };
      if (deptById[s.aicm_user_company_department_id]) {
        deptById[s.aicm_user_company_department_id].organizations.push(sec);
      }
    });

    var selected = v2CompanyExists(ctx, requestedCompanyId) ? requestedCompanyId : "";
    if (!selected && companies[0]) selected = companies[0].id;

    return {
      companies: companies,
      aiworkers: mapRobotCatalog(ctx),
      business_robots: mapRobotCatalog(ctx),
      selected_company_id: selected,
      source: "aicm_v2_single_production_bridge"
    };
  }

  function saveContext(ctx, requestedCompanyId) {
    var data = buildLegacyState(ctx, requestedCompanyId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(CONTEXT_CACHE_KEY, JSON.stringify(ctx));

    if (data.selected_company_id) {
      localStorage.setItem(SELECTED_COMPANY_KEY, data.selected_company_id);
      sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", data.selected_company_id);
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", data.selected_company_id);
    } else {
      localStorage.removeItem(SELECTED_COMPANY_KEY);
      sessionStorage.removeItem("AICM_CURRENT_COMPANY_ID");
      sessionStorage.removeItem("AICM_PENDING_COMPANY_ID");
    }

    return data;
  }

  function loadContext(requestedCompanyId) {
    return requestJson("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(ownerCivilizationId()))
      .then(function (ctx) {
        saveContext(ctx, requestedCompanyId || localStorage.getItem(SELECTED_COMPANY_KEY) || "");
        return ctx;
      });
  }

  function readCtx() {
    try {
      return JSON.parse(localStorage.getItem(CONTEXT_CACHE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function selectedCompanyIdStrict() {
    var ctx = readCtx();
    var candidates = [];

    var sel = byId("company-select");
    if (sel && sel.value) candidates.push(sel.value);

    var stored = localStorage.getItem(SELECTED_COMPANY_KEY);
    if (stored) candidates.push(stored);

    for (var i = 0; i < candidates.length; i++) {
      if (v2CompanyExists(ctx, candidates[i])) return candidates[i];
    }

    if (list(ctx.companies)[0]) return list(ctx.companies)[0].aicm_user_company_id;
    return "";
  }

  function selectedDepartmentIdStrict(companyId) {
    var ctx = readCtx();
    var candidates = [];

    var orgAddDepartment = byId("org-add-department");
    if (orgAddDepartment && orgAddDepartment.value) candidates.push(orgAddDepartment.value);

    var departmentSelect = byId("department-select");
    if (departmentSelect && departmentSelect.value) candidates.push(departmentSelect.value);

    var stored = localStorage.getItem(SELECTED_DEPARTMENT_KEY);
    if (stored) candidates.push(stored);

    for (var i = 0; i < candidates.length; i++) {
      if (v2DepartmentExists(ctx, companyId, candidates[i])) return candidates[i];
    }

    var first = list(ctx.departments).find(function (d) {
      return d.aicm_user_company_id === companyId;
    });

    return first ? first.aicm_user_company_department_id : "";
  }

  function hardReload(companyId) {
    return loadContext(companyId).then(function () {
      var url = new URL(window.location.href);
      url.searchParams.set("v", String(Date.now()));
      window.location.replace(url.toString());
    });
  }

  function handleClick(event) {
    var btn = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
    if (!btn) return;

    var action = btn.getAttribute("data-action") || "";

    if (action === "switch-company") {
      var ctx = readCtx();
      var raw = value("company-select");
      if (v2CompanyExists(ctx, raw)) {
        localStorage.setItem(SELECTED_COMPANY_KEY, raw);
        sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", raw);
        sessionStorage.setItem("AICM_PENDING_COMPANY_ID", raw);
      } else {
        localStorage.removeItem(SELECTED_COMPANY_KEY);
        sessionStorage.removeItem("AICM_CURRENT_COMPANY_ID");
        sessionStorage.removeItem("AICM_PENDING_COMPANY_ID");
      }
      return;
    }

    if (action === "add-company") {
      event.preventDefault();
      event.stopImmediatePropagation();

      requestJson("/api/aicm/v2/company/create", {
        owner_civilization_id: ownerCivilizationId(),
        company_name: value("new-company-name") || "新規AI企業",
        business_domain: value("new-company-domain")
      }).then(function (json) {
        var id = json.company && json.company.aicm_user_company_id ? json.company.aicm_user_company_id : "";
        if (id) localStorage.setItem(SELECTED_COMPANY_KEY, id);
        return hardReload(id);
      }).catch(function (e) {
        alert("AI企業v2保存失敗: " + e.message);
      });
      return;
    }

    if (action === "add-department") {
      event.preventDefault();
      event.stopImmediatePropagation();

      var companyId = selectedCompanyIdStrict();
      if (!companyId) {
        alert("先にAI企業新規追加でv2会社を作成してください。旧ローカル会社では部門保存できません。");
        return;
      }

      requestJson("/api/aicm/v2/department/create", {
        owner_civilization_id: ownerCivilizationId(),
        aicm_user_company_id: companyId,
        department_name: value("new-department-name") || "新規部門",
        purpose: value("new-department-purpose")
      }).then(function (json) {
        var id = json.department && json.department.aicm_user_company_department_id ? json.department.aicm_user_company_department_id : "";
        if (id) localStorage.setItem(SELECTED_DEPARTMENT_KEY, id);
        return hardReload(companyId);
      }).catch(function (e) {
        alert("部門v2保存失敗: " + e.message);
      });
      return;
    }

    if (action === "add-organization") {
      event.preventDefault();
      event.stopImmediatePropagation();

      var cid = selectedCompanyIdStrict();
      var did = selectedDepartmentIdStrict(cid);

      if (!cid || !did) {
        alert("先にv2会社とv2部門を作成してください。旧ローカルIDでは課保存できません。");
        return;
      }

      requestJson("/api/aicm/v2/section/create", {
        owner_civilization_id: ownerCivilizationId(),
        aicm_user_company_id: cid,
        aicm_user_company_department_id: did,
        section_name: value("new-org-name") || "新規課",
        purpose: value("new-org-purpose")
      }).then(function () {
        return hardReload(cid);
      }).catch(function (e) {
        alert("課v2保存失敗: " + e.message);
      });
      return;
    }
  }

  document.addEventListener("click", handleClick, true);

  document.addEventListener("change", function (event) {
    if (event.target && event.target.id === "company-select") {
      var ctx = readCtx();
      var id = event.target.value;
      if (v2CompanyExists(ctx, id)) {
        localStorage.setItem(SELECTED_COMPANY_KEY, id);
      }
    }
  }, true);

  loadContext(localStorage.getItem(SELECTED_COMPANY_KEY) || "").catch(function () {});
})();
`;
}

/*
 * 3. Redact DB URL from server-side v2 errors.
 */
if (!server.includes(SERVER_SAFE_MARK)) {
  const safeFn = `

/* ${SERVER_MARK} */
function _aicmV2SafePublicError(error) {
  var raw = error && error.message ? String(error.message) : String(error || "unknown error");
  raw = raw.replace(/postgres(?:ql)?:\\/\\/[^\\s'"]+/g, "[DATABASE_URL_REDACTED]");
  if (raw.indexOf("violates foreign key constraint") >= 0) {
    return "DB operation failed: selected company or department is not a v2 record.";
  }
  var m = raw.match(/ERROR:\\s*[^\\n]+/);
  if (m && m[0]) return "DB operation failed: " + m[0];
  return raw.slice(0, 400);
}
`;

  server += safeFn;
}

server = server.replace(
  /error_message:\s*error && error\.message \? error\.message : String\(error\)/g,
  "error_message: _aicmV2SafePublicError(error)"
);

index = index.replace(
  /(phase-de-dh-workflow-final-local-ui\.js)(\?v=[^"]*)?/g,
  "$1?v=" + runTs + "_amv_amy_single_v2_bridge"
);

fs.writeFileSync(serverFile, server);
fs.writeFileSync(jsFile, js);
fs.writeFileSync(indexFile, index);

console.log("single v2 bridge rebuilt");
