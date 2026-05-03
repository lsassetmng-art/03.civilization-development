import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_RECOMMENDED_ONLY_ROBOT_COMBOS_AUK_AUN_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function hashText(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

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
      if (depth === 0) return { start, end: i + 1, text: source.slice(start, i + 1) };
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") throw new Error("STOP: renderShell replacement prohibited");
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

const newRows = `
// ${marker}
function aicmInlineRobotRows(roleCode) {
    var all = aicmRobotCatalogSafe().filter(function (row) {
      return aicmRobotValue(row);
    });

    var recommended = all.filter(function (row) {
      return aicmRobotMatchesInlineRole(row, roleCode);
    });

    var seen = Object.create(null);
    var rows = [];

    recommended.forEach(function (row) {
      var key = aicmRobotValue(row);
      if (!key || seen[key]) return;
      seen[key] = true;
      rows.push(row);
    });

    return rows;
  }`;

const newOptions = `
function aicmInlineRobotOptions(roleCode) {
    var rows = aicmInlineRobotRows(roleCode);

    if (rows.length === 0) {
      return '<option value="">未設定</option><option value="" disabled>推奨候補がありません</option>';
    }

    return [
      '<option value="">未設定</option>'
    ].concat(rows.map(function (row) {
      return '<option value="' + escapeHtml(aicmRobotValue(row)) + '">' + escapeHtml(aicmRobotOptionLabel(row)) + '</option>';
    })).join("");
  }`;

src = replaceFunction(src, "aicmInlineRobotRows", newRows);
src = replaceFunction(src, "aicmInlineRobotOptions", newOptions);

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const rowsFn = extractFunction(src, "aicmInlineRobotRows").text;
const optionsFn = extractFunction(src, "aicmInlineRobotOptions").text;
const workerFn = extractFunction(src, "renderAicmWorkerInlineRows").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  rowsUsesRecommendedOnly: count(rowsFn, "recommended.forEach"),
  rowsHasOtherConcat: count(rowsFn, "exact.concat(other)") + count(rowsFn, "other.forEach"),
  recommendedOptgroupCount: count(optionsFn, "推奨候補"),
  otherOptgroupCount: count(optionsFn, "その他候補"),
  noRecommendedMessageCount: count(optionsFn, "推奨候補がありません"),
  selectorLabelCount: count(src, "selector_label"),
  displayNameCount: count(src, "display_name"),
  usableQuantityCount: count(src, "usable_quantity"),
  workerRowsHelperCount: count(src, "function renderAicmWorkerInlineRows("),
  workerSlotIndexCount: count(workerFn, "data-worker-slot-index"),
  workerAddActionCount: count(src, 'inline-worker-slot-add'),
  roleSettingOpenCount: count(src, 'role-setting-open')
}));
