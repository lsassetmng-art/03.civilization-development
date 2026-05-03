import fs from "node:fs";

const serverFile = process.argv[2];
const jsFile = process.argv[3];
const indexFile = process.argv[4];
const runTs = process.argv[5];

let server = fs.readFileSync(serverFile, "utf8");
let js = fs.readFileSync(jsFile, "utf8");
let index = fs.readFileSync(indexFile, "utf8");

const BRIDGE_MARK = "AICM_V2_PRODUCTION_UI_BRIDGE_AMF_AMI_V1";
const PATCH_MARK = "AICM_V2_OLD_LEGACY_COMPANY_ID_GUARD_AMR_AMU_V1";
const SERVER_SAFE_MARK = "AICM_V2_PROD_SAFE_ERROR_AMR_AMU_V1";

if (!js.includes(BRIDGE_MARK)) {
  throw new Error("Production v2 bridge marker not found. Apply production v2 bridge first.");
}

function replaceFunction(source, functionName, replacement) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) {
    throw new Error("Function not found: " + functionName);
  }

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) {
    throw new Error("Opening brace not found: " + functionName);
  }

  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === quote) {
        quote = "";
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return source.slice(0, start) + replacement + source.slice(i + 1);
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const newMapFunction = `
function mapV2ContextToLegacyState(ctx, selectedCompanyId) {
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

    function existsInV2Companies(id) {
      if (!id) return false;
      return companies.some(function (c) {
        return c.id === id || c.company_id === id;
      });
    }

    var requestedSelected = selectedCompanyId || localStorage.getItem(SELECTED_COMPANY_KEY) || "";
    var selected = existsInV2Companies(requestedSelected) ? requestedSelected : "";

    if (!selected && companies[0]) {
      selected = companies[0].id;
    }

    return {
      aiworkers: mapRobotCatalog(ctx),
      business_robots: mapRobotCatalog(ctx),
      companies: companies,
      selected_company_id: selected,
      source: "aicm_v2_production_ui_bridge_only"
    };
  }`;

const newLoadFunction = `
function loadV2Context(selectedCompanyId) {
    var owner = ownerCivilizationId();
    return requestJson("/api/aicm/v2/context?owner_civilization_id=" + encodeURIComponent(owner))
      .then(function (ctx) {
        var data = mapV2ContextToLegacyState(ctx, selectedCompanyId);
        var validCompanyIds = emptyList(ctx.companies).map(function (c) {
          return c.aicm_user_company_id;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(CONTEXT_CACHE_KEY, JSON.stringify(ctx));

        [
          "aicm.currentCompanyId",
          "aicm.currentCompanyName",
          "aicm.currentCompanyDomain",
          "aicm.settingsTargetCompanyId",
          "aicm.settingsTargetCompanyName",
          "aicm.settingsTargetCompanyDomain",
          "AICM_CURRENT_COMPANY_ID",
          "AICM_PENDING_COMPANY_ID"
        ].forEach(function (key) {
          try {
            var v = localStorage.getItem(key);
            if (v && validCompanyIds.indexOf(v) < 0) {
              localStorage.removeItem(key);
            }
          } catch (error) {}
        });

        if (data.selected_company_id) {
          localStorage.setItem(SELECTED_COMPANY_KEY, data.selected_company_id);
          sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", data.selected_company_id);
          sessionStorage.setItem("AICM_PENDING_COMPANY_ID", data.selected_company_id);
        } else {
          localStorage.removeItem(SELECTED_COMPANY_KEY);
          sessionStorage.removeItem("AICM_CURRENT_COMPANY_ID");
          sessionStorage.removeItem("AICM_PENDING_COMPANY_ID");
        }

        return ctx;
      });
  }`;

const newSelectedCompanyFunction = `
function selectedCompanyId() {
    var ctx = {};
    try {
      ctx = JSON.parse(localStorage.getItem(CONTEXT_CACHE_KEY) || "{}");
    } catch (error) {
      ctx = {};
    }

    var companies = emptyList(ctx.companies);
    function exists(id) {
      if (!id) return false;
      return companies.some(function (c) {
        return c.aicm_user_company_id === id;
      });
    }

    var candidates = [];

    var dashboardSelect = byId("company-select");
    if (dashboardSelect && dashboardSelect.value) candidates.push(dashboardSelect.value);

    var stored = localStorage.getItem(SELECTED_COMPANY_KEY);
    if (stored) candidates.push(stored);

    var data = readLocalData();
    if (data && data.selected_company_id) candidates.push(data.selected_company_id);

    for (var i = 0; i < candidates.length; i++) {
      if (exists(candidates[i])) {
        localStorage.setItem(SELECTED_COMPANY_KEY, candidates[i]);
        sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", candidates[i]);
        sessionStorage.setItem("AICM_PENDING_COMPANY_ID", candidates[i]);
        return candidates[i];
      }
    }

    if (companies[0] && companies[0].aicm_user_company_id) {
      var fallback = companies[0].aicm_user_company_id;
      localStorage.setItem(SELECTED_COMPANY_KEY, fallback);
      sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", fallback);
      sessionStorage.setItem("AICM_PENDING_COMPANY_ID", fallback);
      return fallback;
    }

    localStorage.removeItem(SELECTED_COMPANY_KEY);
    sessionStorage.removeItem("AICM_CURRENT_COMPANY_ID");
    sessionStorage.removeItem("AICM_PENDING_COMPANY_ID");
    return "";
  }`;

const newSelectedDepartmentFunction = `
function selectedDepartmentId() {
    var ctx = {};
    try {
      ctx = JSON.parse(localStorage.getItem(CONTEXT_CACHE_KEY) || "{}");
    } catch (error) {
      ctx = {};
    }

    var companyId = selectedCompanyId();
    var departments = emptyList(ctx.departments).filter(function (d) {
      return d.aicm_user_company_id === companyId;
    });

    function exists(id) {
      if (!id) return false;
      return departments.some(function (d) {
        return d.aicm_user_company_department_id === id;
      });
    }

    var candidates = [];

    var orgAddDepartment = byId("org-add-department");
    if (orgAddDepartment && orgAddDepartment.value) candidates.push(orgAddDepartment.value);

    var departmentSelect = byId("department-select");
    if (departmentSelect && departmentSelect.value) candidates.push(departmentSelect.value);

    var stored = localStorage.getItem(SELECTED_DEPARTMENT_KEY);
    if (stored) candidates.push(stored);

    for (var i = 0; i < candidates.length; i++) {
      if (exists(candidates[i])) {
        localStorage.setItem(SELECTED_DEPARTMENT_KEY, candidates[i]);
        sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", candidates[i]);
        return candidates[i];
      }
    }

    if (departments[0] && departments[0].aicm_user_company_department_id) {
      var fallback = departments[0].aicm_user_company_department_id;
      localStorage.setItem(SELECTED_DEPARTMENT_KEY, fallback);
      sessionStorage.setItem("AICM_PENDING_DEPARTMENT_ID", fallback);
      return fallback;
    }

    localStorage.removeItem(SELECTED_DEPARTMENT_KEY);
    sessionStorage.removeItem("AICM_PENDING_DEPARTMENT_ID");
    return "";
  }`;

js = replaceFunction(js, "mapV2ContextToLegacyState", newMapFunction);
js = replaceFunction(js, "loadV2Context", newLoadFunction);
js = replaceFunction(js, "selectedCompanyId", newSelectedCompanyFunction);
js = replaceFunction(js, "selectedDepartmentId", newSelectedDepartmentFunction);

const oldSwitchRe = /if \(action === "switch-company"\) \{[\s\S]*?return;\n    \}/m;
const newSwitchBlock = `if (action === "switch-company") {
      cid = selectedCompanyId();
      if (cid) {
        localStorage.setItem(SELECTED_COMPANY_KEY, cid);
        sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", cid);
        sessionStorage.setItem("AICM_PENDING_COMPANY_ID", cid);
      } else {
        localStorage.removeItem(SELECTED_COMPANY_KEY);
        sessionStorage.removeItem("AICM_CURRENT_COMPANY_ID");
        sessionStorage.removeItem("AICM_PENDING_COMPANY_ID");
      }
      return;
    }`;

if (oldSwitchRe.test(js)) {
  js = js.replace(oldSwitchRe, newSwitchBlock);
}

const oldAddDeptAlert = `alert("先にAI企業を選択してください。");`;
if (js.includes(oldAddDeptAlert)) {
  js = js.replace(
    oldAddDeptAlert,
    `alert("先にv2のAI企業を作成・選択してください。旧ローカル会社IDでは部門保存できません。");`
  );
}

const oldAddOrgAlert = `alert("先にAI企業と部門を選択してください。");`;
if (js.includes(oldAddOrgAlert)) {
  js = js.replace(
    oldAddOrgAlert,
    `alert("先にv2のAI企業と部門を作成・選択してください。旧ローカルIDでは課保存できません。");`
  );
}

if (!js.includes(PATCH_MARK)) {
  js += "\\n/* " + PATCH_MARK + " */\\n";
}

index = index.replace(
  /(phase-de-dh-workflow-final-local-ui\.js)(\?v=[^"]*)?/g,
  "$1?v=" + runTs + "_amr_amu_v2_id_guard"
);

if (server.includes("AICM_V2_PRODUCTION_UI_API_AMF_AMI_V1") && !server.includes(SERVER_SAFE_MARK)) {
  const helper = `

/* ${SERVER_SAFE_MARK} */
function _aicmV2ProdSafeErrorMessage(error) {
  var raw = error && error.message ? String(error.message) : String(error || "unknown error");
  raw = raw.replace(/postgres(?:ql)?:\\/\\/[^\\s'"]+/g, "[DATABASE_URL_REDACTED]");
  var m = raw.match(/ERROR:\\s*[^\\n]+/);
  if (m && m[0]) return "DB operation failed: " + m[0];
  if (raw.indexOf("violates foreign key constraint") >= 0) {
    return "DB operation failed: selected company/department is not a v2 record.";
  }
  return raw.slice(0, 500);
}
`;

  if (server.includes("function _aicmV2ProdHandle")) {
    server = server.replace("function _aicmV2ProdHandle", helper + "\\nfunction _aicmV2ProdHandle");
  } else {
    server += helper;
  }
}

if (server.includes("_aicmV2ProdSafeErrorMessage")) {
  server = server.replace(
    /error_message:\s*error && error\.message \? error\.message : String\(error\)/g,
    "error_message: _aicmV2ProdSafeErrorMessage(error)"
  );
}

fs.writeFileSync(serverFile, server);
fs.writeFileSync(jsFile, js);
fs.writeFileSync(indexFile, index);

console.log("v2 old legacy company_id guard patched");
