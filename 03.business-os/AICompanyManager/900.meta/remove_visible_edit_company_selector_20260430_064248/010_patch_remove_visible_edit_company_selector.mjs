import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_REMOVE_VISIBLE_EDIT_COMPANY_SELECTOR_AJD_AJG_V1";

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

const range = findFunctionRange(src, "renderSettings");
if (!range) {
  throw new Error("renderSettings not found");
}

let fn = src.slice(range.start, range.end);

fn = fn.replace(
  /function renderSettings\(data, company\) \{\n\s*var editing = app\.editCompanyId \? findCompany\(data, app\.editCompanyId\) : company;/,
  `function renderSettings(data, company) {
    /* ${MARK}: edit target is dashboard-selected company only */
    var editing = company;
    var editingId = editing ? (editing.company_id || editing.id || "") : "";`
);

fn = fn.replace(
  /'\<div class="aicm-field"\>\<label\>変更対象\<\/label\>\<select id="edit-company-select"\>' \+ companyOptions\(data\) \+ '\<\/select\>\<\/div\>',\n\s*'\<button data-action="load-company-edit"\>読み込み\<\/button\>',/,
  `/* ${MARK}: visible edit-company selector removed; keep hidden id for existing save/delete payloads */
      '<input type="hidden" id="edit-company-select" value="' + esc(editingId) + '">' ,`
);

if (fn.includes('<label>変更対象</label><select id="edit-company-select">')) {
  throw new Error("visible edit-company selector still exists in renderSettings");
}

if (fn.includes('data-action="load-company-edit"')) {
  throw new Error("load-company-edit button still exists in renderSettings");
}

if (!fn.includes('type="hidden" id="edit-company-select"')) {
  throw new Error("hidden edit-company-select not inserted");
}

src = src.slice(0, range.start) + fn + src.slice(range.end);

fs.writeFileSync(file, src);
console.log("renderSettings visible edit-company selector removed");
