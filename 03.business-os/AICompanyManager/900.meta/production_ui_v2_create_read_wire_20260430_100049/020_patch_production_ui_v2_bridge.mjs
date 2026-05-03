import fs from "node:fs";

const jsFile = process.argv[2];
const indexFile = process.argv[3];
const runTs = process.argv[4];

let js = fs.readFileSync(jsFile, "utf8");
let index = fs.readFileSync(indexFile, "utf8");

const MARK = "AICM_V2_PRODUCTION_UI_BRIDGE_AMF_AMI_V1";

const bridge = `

/* ${MARK}
 * Production UI bridge for AICM user-company v2.
 * Exact actions only:
 * - switch-company: remember selected company id
 * - add-company: create v2 company
 * - add-department: create v2 department
 * - add-organization: create v2 section
 *
 * No data migration.
 * No separate test UI.
 * No debug card.
 * No global save interception.
 */
(function () {
  "use strict";

  if (window.${MARK}) return;
  window.${MARK} = true;

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

  function requestJson(path, body) {
    var options = body ? {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    } : {
      method: "GET"
    };

    return fetch(path, options)
      .then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok || !json || json.result !== "ok") {
            throw new Error(json && json.error_message ? json.error_message : "AICM v2 API error");
          }
          return json;
        });
      });
  }

  function readLocalData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function emptyList(v) {
    return Array.isArray(v) ? v : [];
  }

  function mapRobotCatalog(ctx) {
    return emptyList(ctx.robot_catalog).map(function (r) {
      return {
        id: r.robot_pool_id || r.aiworker_model_code,
        robot_pool_id: r.robot_pool_id || "",
        aiworker_model_code: r.aiworker_model_code || "",
        name: r.display_name || r.aiworker_model_code || "",
        display_name: r.display_name || r.aiworker_model_code || "",
        selector_label: r.selector_label || r.display_name || r.aiworker_model_code || "",
        role: emptyList(r.recommended_role_codes).join(","),
        recommended_role_codes: emptyList(r.recommended_role_codes),
        manufacturer_code: r.manufacturer_code || "",
        aiworker_series_code: r.aiworker_series_code || ""
      };
    });
  }

  function mapV2ContextToLegacyState(ctx, selectedCompanyId) {
    var oldData = readLocalData();
    var companies = emptyList(ctx.companies).map(function (c) {
      return {
        id: c.aicm_user_company_id,
        company_id: c.aicm_user_company_id,
        name: c.company_name || "",
        company_name: c.company_name || "",
        business_domain: c.business_domain || "",
        company_common_rules: [],
        company_common_rules_text: c.company_common_rules_text || "",
        president_robot_id: "",
        president_robot_nickname: "",
        company_business_policy_instruction_to_president: c.president_policy_instruction_text || "",
        departments: []
      };
    });

    var companyById = {};
    companies.forEach(function (c) {
      companyById[c.id] = c;
    });

    var deptById = {};
    emptyList(ctx.departments).forEach(function (d) {
      var dept = {
        id: d.aicm_user_company_department_id,
        department_id: d.aicm_user_company_department_id,
        name: d.department_name || "",
        department_name: d.department_name || "",
        purpose: d.purpose || "",
        manager_robot_id: d.manager_robot_pool_id || "",
        manager_robot_nickname: d.manager_internal_nickname || "",
        organizations: [],
        task_ledger: [],
        review_items: []
      };
      deptById[dept.id] = dept;
      if (companyById[d.aicm_user_company_id]) {
        companyById[d.aicm_user_company_id].departments.push(dept);
      }
    });

    emptyList(ctx.sections).forEach(function (s) {
      var section = {
        id: s.aicm_user_company_section_id,
        organization_id: s.aicm_user_company_section_id,
        name: s.section_name || "",
        organization_name: s.section_name || "",
        parent_id: s.parent_section_id || "",
        purpose: s.purpose || "",
        leader_robot_id: s.leader_robot_pool_id || "",
        leader_robot_nickname: s.leader_internal_nickname || "",
        robot_ids: [],
        worker_robot_assignments: []
      };
      if (deptById[s.aicm_user_company_department_id]) {
        deptById[s.aicm_user_company_department_id].organizations.push(section);
      }
    });

    var selected = selectedCompanyId || localStorage.getItem(SELECTED_COMPANY_KEY) || "";
    if (!selected && companies[0]) selected = companies[0].id;

    return {
      aiworkers: mapRobotCatalog(ctx),
      business_robots: mapRobotCatalog(ctx),
      companies: companies,
      selected_company_id: selected,
      source: "aicm_v2_production_ui_bridge"
    };
  }

  function loadV2Context(selectedCompanyId) {
    var owner = ownerCivilizationId();
    return requestJson("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner))
      .then(function (ctx) {
        var data;
        if (emptyList(ctx.companies).length > 0) {
          data = mapV2ContextToLegacyState(ctx, selectedCompanyId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          localStorage.setItem(CONTEXT_CACHE_KEY, JSON.stringify(ctx));

          if (data.selected_company_id) {
            localStorage.setItem(SELECTED_COMPANY_KEY, data.selected_company_id);
            sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", data.selected_company_id);
            sessionStorage.setItem("AICM_PENDING_COMPANY_ID", data.selected_company_id);
          }
        }
        return ctx;
      });
  }

  function selectedCompanyId() {
    var dashboardSelect = byId("company-select");
    if (dashboardSelect && dashboardSelect.value) return dashboardSelect.value;

    var stored = localStorage.getItem(SELECTED_COMPANY_KEY);
    if (stored) return stored;

    var data = readLocalData();
    if (data && data.selected_company_id) return data.selected_company_id;
    if (data && data.companies && data.companies[0]) return data.companies[0].id || data.companies[0].company_id || "";

    return "";
  }

  function selectedDepartmentId() {
    var orgAddDepartment = byId("org-add-department");
    if (orgAddDepartment && orgAddDepartment.value) return orgAddDepartment.value;

    var departmentSelect = byId("department-select");
    if (departmentSelect && departmentSelect.value) return departmentSelect.value;

    var stored = localStorage.getItem(SELECTED_DEPARTMENT_KEY);
    if (stored) return stored;

    var cid = selectedCompanyId();
    var data = readLocalData();
    var company = emptyList(data.companies).find(function (c) {
      return c.id === cid || c.company_id === cid;
    });

    if (company && company.departments && company.departments[0]) {
      return company.departments[0].id || company.departments[0].department_id || "";
    }

    return "";
  }

  function reloadAfterSync(selectedId) {
    return loadV2Context(selectedId).then(function () {
      var url = new URL(window.location.href);
      url.searchParams.set("v", String(Date.now()));
      window.location.replace(url.toString());
    });
  }

  function handleExactAction(event) {
    var button = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
    var action;
    var cid;
    var did;

    if (!button) return;

    action = button.getAttribute("data-action") || "";

    if (action === "switch-company") {
      cid = value("company-select");
      if (cid) {
        localStorage.setItem(SELECTED_COMPANY_KEY, cid);
        sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", cid);
        sessionStorage.setItem("AICM_PENDING_COMPANY_ID", cid);
      }
      return;
    }

    if (action === "switch-department") {
      did = value("department-select");
      if (did) {
        localStorage.setItem(SELECTED_DEPARTMENT_KEY, did);
        sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", did);
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
        var newId = json.company && json.company.aicm_user_company_id ? json.company.aicm_user_company_id : "";
        if (newId) localStorage.setItem(SELECTED_COMPANY_KEY, newId);
        return reloadAfterSync(newId);
      }).catch(function (error) {
        alert("AI企業v2保存失敗: " + error.message);
      });
      return;
    }

    if (action === "add-department") {
      event.preventDefault();
      event.stopImmediatePropagation();

      cid = selectedCompanyId();
      if (!cid) {
        alert("先にAI企業を選択してください。");
        return;
      }

      requestJson("/api/aicm/v2/department/create", {
        owner_civilization_id: ownerCivilizationId(),
        aicm_user_company_id: cid,
        department_name: value("new-department-name") || "新規部門",
        purpose: value("new-department-purpose")
      }).then(function (json) {
        var newId = json.department && json.department.aicm_user_company_department_id ? json.department.aicm_user_company_department_id : "";
        if (newId) localStorage.setItem(SELECTED_DEPARTMENT_KEY, newId);
        return reloadAfterSync(cid);
      }).catch(function (error) {
        alert("部門v2保存失敗: " + error.message);
      });
      return;
    }

    if (action === "add-organization") {
      event.preventDefault();
      event.stopImmediatePropagation();

      cid = selectedCompanyId();
      did = selectedDepartmentId();

      if (!cid || !did) {
        alert("先にAI企業と部門を選択してください。");
        return;
      }

      requestJson("/api/aicm/v2/section/create", {
        owner_civilization_id: ownerCivilizationId(),
        aicm_user_company_id: cid,
        aicm_user_company_department_id: did,
        section_name: value("new-org-name") || "新規課",
        purpose: value("new-org-purpose")
      }).then(function () {
        return reloadAfterSync(cid);
      }).catch(function (error) {
        alert("課v2保存失敗: " + error.message);
      });
      return;
    }
  }

  document.addEventListener("click", handleExactAction, true);

  document.addEventListener("change", function (event) {
    if (event.target && event.target.id === "company-select" && event.target.value) {
      localStorage.setItem(SELECTED_COMPANY_KEY, event.target.value);
      sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", event.target.value);
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", event.target.value);
    }

    if (event.target && event.target.id === "department-select" && event.target.value) {
      localStorage.setItem(SELECTED_DEPARTMENT_KEY, event.target.value);
      sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", event.target.value);
    }
  }, true);

  loadV2Context(localStorage.getItem(SELECTED_COMPANY_KEY) || "").catch(function () {
    /* Initial v2 context load may be empty before first UI create. */
  });
})();
`;

if (!js.includes(MARK)) {
  js += bridge;
}

index = index.replace(
  /(phase-de-dh-workflow-final-local-ui\.js)(\?v=[^"]*)?/g,
  "$1?v=" + runTs + "_amf_ami_prod_v2"
);

fs.writeFileSync(jsFile, js);
fs.writeFileSync(indexFile, index);

console.log("production UI v2 bridge patched");
