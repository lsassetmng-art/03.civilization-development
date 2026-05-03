import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_COMPANY_SELECT_OWNS_COMPANY_CODE_AHM_AHP_V1";

if (src.includes(MARK)) {
  console.log("already patched");
  process.exit(0);
}

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
  if (!range) throw new Error("function not found: " + functionName);
  return source.slice(0, range.start) + replacement + source.slice(range.end);
}

function replaceFirstActionBlock(source, actionName, replacement) {
  const needle = 'if (action === "' + actionName + '") {';
  const start = source.indexOf(needle);
  if (start < 0) return { source, replaced: false };

  const open = source.indexOf("{", start);
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
      if (depth === 0) {
        return {
          source: source.slice(0, start) + replacement + source.slice(i + 1),
          replaced: true
        };
      }
    }
  }

  throw new Error("action block not closed: " + actionName);
}

src = replaceFunction(src, "companyOptions", `function companyOptions(data) {
    /* ${MARK}: option.value is company code */
    var selectedId = app.selectedCompanyId || app.companyId || "";

    return data.companies.map(function (c) {
      var id = c.company_id || c.id || "";
      var name = c.company_name || c.name || id;
      return '<option value="' + esc(id) + '"' + (id === selectedId ? " selected" : "") + '>' + esc(name) + '</option>';
    }).join("");
  }`);

src = replaceFunction(src, "currentCompany", `function currentCompany(data) {
    /* ${MARK}: current company comes from selectedCompanyId/companyId */
    var i;
    var selectedId = app.selectedCompanyId || app.companyId || "";

    if (!selectedId && data.companies[0]) {
      selectedId = data.companies[0].company_id || data.companies[0].id || "";
      app.selectedCompanyId = selectedId;
      app.companyId = selectedId;
    }

    for (i = 0; i < data.companies.length; i += 1) {
      if (
        data.companies[i].company_id === selectedId ||
        data.companies[i].id === selectedId
      ) {
        app.selectedCompanyId = selectedId;
        app.companyId = selectedId;
        return data.companies[i];
      }
    }

    return null;
  }`);

const bindRange = findFunctionRange(src, "bind");
if (!bindRange) throw new Error("function bind not found");

let bindBody = src.slice(bindRange.start, bindRange.end);

const bindInsert = `function bind() {
    /* ${MARK}: company-select change immediately stores company code */
    var companySelect = document.getElementById("company-select");
    if (companySelect) {
      companySelect.addEventListener("change", function () {
        app.selectedCompanyId = companySelect.value || "";
        app.companyId = app.selectedCompanyId;
        app.editCompanyId = "";
      });
    }`;

if (!bindBody.includes('function bind() {')) {
  throw new Error("unexpected bind signature");
}

bindBody = bindBody.replace('function bind() {', bindInsert);
src = src.slice(0, bindRange.start) + bindBody + src.slice(bindRange.end);

const switchBlock = `if (action === "switch-company") {
      /* ${MARK}: AI企業を表示 uses already selected company code */
      var selectedCompanyId = app.selectedCompanyId || val("company-select");
      if (selectedCompanyId) {
        app.selectedCompanyId = selectedCompanyId;
        app.companyId = selectedCompanyId;
        app.editCompanyId = "";
      }
      render();
      return;
    }`;

const switchResult = replaceFirstActionBlock(src, "switch-company", switchBlock);

if (switchResult.replaced) {
  src = switchResult.source;
} else {
  const insertNeedle = 'if (action === "add-company") {';
  const idx = src.indexOf(insertNeedle);
  if (idx < 0) throw new Error("switch-company not found and insertion point not found");
  src = src.slice(0, idx) + switchBlock + "\n\n    " + src.slice(idx);
}

fs.writeFileSync(file, src);
console.log("patched company select ownership only");
