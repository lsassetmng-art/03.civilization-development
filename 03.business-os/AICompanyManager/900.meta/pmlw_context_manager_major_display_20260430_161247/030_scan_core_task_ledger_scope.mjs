import fs from "node:fs";

const file = process.argv[2];
const src = fs.readFileSync(file, "utf8");

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
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
      if (ch === quote) quote = "";
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
      if (depth === 0) return source.slice(start, i + 1);
    }
  }

  throw new Error("Function end not found");
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const block = extractFunction(src, "renderTaskLedgerPlaceholder");

const values = {
  RENDER_TASK_LEDGER_USES_PMLW_MAJOR: count(block, "pmlwMajorRowsForCompany"),
  RENDER_TASK_LEDGER_OLD_TASK_LEDGER_LABEL: count(block, "task_ledger"),
  RENDER_TASK_LEDGER_MANAGER_MAJOR_LABEL: count(block, "Manager大項目"),
  RENDER_TASK_LEDGER_WORKER_DIRECT_LABEL: count(block, "Worker作業"),
  RENDER_TASK_LEDGER_CSV_LABEL: count(block, "CSV")
};

for (const [key, value] of Object.entries(values)) {
  console.log(key + "=" + value);
}

console.log("");
console.log("---- renderTaskLedgerPlaceholder ----");
console.log(block);
