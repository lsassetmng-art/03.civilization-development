import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_SURGICAL_SELECTED_COMPANY_STATE_AFO_AFR_V1";

function findFunctionRange(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) return null;

  const open = source.indexOf("{", start);
  if (open < 0) return null;

  let i = open + 1;
  let depth = 1;
  let quote = "";
  let escape = false;
  let lineComment = false;
  let blockComment = false;

  for (; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        quote = "";
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: i + 1 };
    }
  }

  return null;
}

function replaceFunction(source, functionName, replacement) {
  const range = findFunctionRange(source, functionName);
  if (!range) throw new Error("Function not found: " + functionName);
  return source.slice(0, range.start) + replacement + source.slice(range.end);
}

function patchFunctionBody(source, functionName, patcher) {
  const range = findFunctionRange(source, functionName);
  if (!range) throw new Error("Function not found: " + functionName);
  const body = source.slice(range.start, range.end);
  const patched = patcher(body);
  return source.slice(0, range.start) + patched + source.slice(range.end);
}

if (src.includes(MARK)) {
  console.log("already patched");
  process.exit(0);
}

// ------------------------------------------------------------
// 1. currentCompany(data)
//    Existing bug: falls back to data.companies[0] too easily.
// ------------------------------------------------------------
src = replaceFunction(src, "currentCompany", `function currentCompany(data) {
    /* ${MARK}: selected company state is canonical */
    var i;
    var selectedId = app.companyId || "";

    if (!selectedId) {
      try {
        selectedId = sessionStorage.getItem("AICM_CURRENT_COMPANY_ID") || sessionStorage.getItem("AICM_PENDING_COMPANY_ID") || "";
      } catch (error) {
        selectedId = "";
      }
    }

    if (!selectedId) {
      try {
        selectedId = localStorage.getItem("AICM_CURRENT_COMPANY_ID") || localStorage.getItem("aicm.currentCompanyId") || "";
      } catch (error2) {
        selectedId = "";
      }
    }

    if (selectedId) {
      for (i = 0; i < data.companies.length; i += 1) {
        if (data.companies[i].id === selectedId || data.companies[i].company_id === selectedId) {
          app.companyId = data.companies[i].id || data.companies[i].company_id;
          return data.companies[i];
        }
      }
    }

    if (data.companies[0]) {
      app.companyId = data.companies[0].id || data.companies[0].company_id || "";
      return data.companies[0];
    }

    return null;
  }`);

// ------------------------------------------------------------
// 2. companyOptions(data)
//    Preserve selected company in both dashboard and settings.
// ------------------------------------------------------------
src = replaceFunction(src, "companyOptions", `function companyOptions(data) {
    /* ${MARK}: option selected follows app.companyId */
    return data.companies.map(function (c) {
      var id = c.id || c.company_id || "";
      var name = c.name || c.company_name || id;
      return '<option value="' + esc(id) + '"' + (id === app.companyId ? " selected" : "") + '>' + esc(name) + '</option>';
    }).join("");
  }`);

// ------------------------------------------------------------
// 3. renderSettings(data, company)
//    Existing bug: stale app.editCompanyId can override selected company.
// ------------------------------------------------------------
src = patchFunctionBody(src, "renderSettings", function (body) {
  const before = 'var editing = app.editCompanyId ? findCompany(data, app.editCompanyId) : company;';
  const after = [
    'var editing = company;',
    '    /* ' + MARK + ': settings screen uses dashboard-selected company */',
    '    if (company && (company.id || company.company_id)) {',
    '      app.companyId = company.id || company.company_id;',
    '      app.editCompanyId = app.companyId;',
    '      try {',
    '        sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", app.companyId);',
    '        sessionStorage.setItem("AICM_PENDING_COMPANY_ID", app.companyId);',
    '      } catch (error) {}',
    '    }'
  ].join("\n");

  if (!body.includes(before)) {
    throw new Error("renderSettings editing line not found");
  }

  return body.replace(before, after);
});

// ------------------------------------------------------------
// 4. bind() data-screen transition
//    Before AI企業設定 transition, capture dashboard company-select.
// ------------------------------------------------------------
src = patchFunctionBody(src, "bind", function (body) {
  const before = 'app.screen = button.getAttribute("data-screen");';
  const after = [
    'var nextScreen = button.getAttribute("data-screen");',
    '        /* ' + MARK + ': capture dashboard selected company before screen transition */',
    '        if (nextScreen === "settings" || nextScreen === "department-detail" || nextScreen === "organization-detail" || nextScreen === "dashboard") {',
    '          var companySelect = document.getElementById("company-select");',
    '          if (companySelect && companySelect.value) {',
    '            app.companyId = companySelect.value;',
    '            app.editCompanyId = companySelect.value;',
    '            try {',
    '              sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", companySelect.value);',
    '              sessionStorage.setItem("AICM_PENDING_COMPANY_ID", companySelect.value);',
    '            } catch (error) {}',
    '          }',
    '        }',
    '        app.screen = nextScreen;'
  ].join("\n");

  if (!body.includes(before)) {
    throw new Error("bind app.screen assignment line not found");
  }

  return body.replace(before, after);
});

// ------------------------------------------------------------
// 5. switch-company action
//    Ensure AI企業を表示 sets both companyId and editCompanyId.
// ------------------------------------------------------------
const switchBlock = `if (action === "switch-company") {
      var selectedCompanyId = val("company-select");
      if (selectedCompanyId) {
        app.companyId = selectedCompanyId;
        app.editCompanyId = selectedCompanyId;
        app.departmentId = "";
        app.organizationId = "";
        try {
          sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", selectedCompanyId);
          sessionStorage.setItem("AICM_PENDING_COMPANY_ID", selectedCompanyId);
        } catch (error) {}
      }
      render();
      return;
    }`;

const switchRe = /if \(action === "switch-company"\) \{[\s\S]*?render\(\);\s*return;\s*\}/;

if (switchRe.test(src)) {
  src = src.replace(switchRe, switchBlock);
} else {
  const addCompanyNeedle = 'if (action === "add-company") {';
  const idx = src.indexOf(addCompanyNeedle);
  if (idx < 0) throw new Error("Cannot find add-company block for switch-company insertion");
  src = src.slice(0, idx) + switchBlock + "\n\n    " + src.slice(idx);
}

// ------------------------------------------------------------
// 6. load-company-edit action
//    If legacy edit selector is used, align selected company too.
// ------------------------------------------------------------
const loadCompanyRe = /if \(action === "load-company-edit"\) \{[\s\S]*?render\(\);\s*return;\s*\}/;
const loadCompanyBlock = `if (action === "load-company-edit") {
      var editTargetCompanyId = val("edit-company-select") || app.companyId;
      if (editTargetCompanyId) {
        app.companyId = editTargetCompanyId;
        app.editCompanyId = editTargetCompanyId;
        try {
          sessionStorage.setItem("AICM_CURRENT_COMPANY_ID", editTargetCompanyId);
          sessionStorage.setItem("AICM_PENDING_COMPANY_ID", editTargetCompanyId);
        } catch (error) {}
      }
      render();
      return;
    }`;

if (loadCompanyRe.test(src)) {
  src = src.replace(loadCompanyRe, loadCompanyBlock);
} else {
  console.log("load-company-edit block not found; skipped");
}

fs.writeFileSync(file, src);
console.log("patched " + file);
