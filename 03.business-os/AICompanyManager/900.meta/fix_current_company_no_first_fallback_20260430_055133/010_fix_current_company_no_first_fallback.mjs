import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_CURRENT_COMPANY_NO_FIRST_FALLBACK_AHE_AHH_V1";

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
      if (depth === 0) {
        return { start, end: i + 1 };
      }
    }
  }

  return null;
}

const range = findFunctionRange(src, "currentCompany");
if (!range) {
  throw new Error("function currentCompany(data) not found");
}

const replacement = `function currentCompany(data) {
    /* ${MARK}: do not return first company after user selection */
    var i;
    var selectedId = app.companyId || "";

    if (!selectedId && data.companies[0]) {
      app.companyId = data.companies[0].id || data.companies[0].company_id || "";
      selectedId = app.companyId;
    }

    for (i = 0; i < data.companies.length; i += 1) {
      if (
        data.companies[i].id === selectedId ||
        data.companies[i].company_id === selectedId
      ) {
        return data.companies[i];
      }
    }

    return null;
  }`;

src = src.slice(0, range.start) + replacement + src.slice(range.end);

fs.writeFileSync(file, src);
console.log("patched currentCompany only");
