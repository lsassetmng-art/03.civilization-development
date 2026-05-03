import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_EXPAND_ROBOT_CANDIDATES_ATY_AUB_V1";

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

const newRoleText = `
function aicmRobotRoleText(row) {
    if (!row || typeof row !== "object") return "";

    var recommended = row.recommended_role_codes;
    var recommendedText = "";

    if (Array.isArray(recommended)) {
      recommendedText = recommended.join(" ");
    } else if (recommended && typeof recommended === "object") {
      try {
        recommendedText = JSON.stringify(recommended);
      } catch (_) {
        recommendedText = "";
      }
    } else {
      recommendedText = String(recommended || "");
    }

    return [
      recommendedText,
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.eligible_role_code,
      row.available_role_code,
      row.assignment_mode_code,
      row.role_name,
      row.role_label,
      row.position_code,
      row.position_label,
      row.role_display_name,
      row.selector_label,
      row.display_name,
      row.aiworker_model_code,
      row.aiworker_model_name,
      row.model_line_code,
      row.model_code,
      row.model_name,
      row.series_code,
      row.series_name,
      row.aiworker_series_code,
      row.manufacturer_code,
      row.robot_type_code,
      row.robot_type_label
    ].filter(Boolean).join(" ").toLowerCase();
  }`;

const newLabel = `
function aicmRobotOptionLabel(row) {
    if (!row) return "未設定";

    var base = (
      row.selector_label ||
      row.display_name ||
      row.internal_nickname ||
      row.placement_nickname ||
      row.robot_internal_nickname ||
      row.aiworker_model_name ||
      row.model_name ||
      row.robot_name ||
      row.robot_pool_label ||
      row.aiworker_model_code ||
      row.model_code ||
      row.robot_pool_id ||
      row.robot_id ||
      row.id ||
      "ロボット"
    );

    var code = row.aiworker_model_code || row.model_code || "";
    var qty = row.usable_quantity;

    var label = String(base);

    if (code && label.indexOf(String(code)) < 0) {
      label += " / " + String(code);
    }

    if (qty !== undefined && qty !== null && String(qty) !== "") {
      label += " / 利用可能:" + String(qty);
    }

    return label;
  }`;

const newRows = `
// ${marker}
function aicmInlineRobotRows(roleCode) {
    var all = aicmRobotCatalogSafe().filter(function (row) {
      return aicmRobotValue(row);
    });

    var exact = [];
    var other = [];

    all.forEach(function (row) {
      if (aicmRobotMatchesInlineRole(row, roleCode)) exact.push(row);
      else other.push(row);
    });

    var seen = Object.create(null);
    var merged = [];

    exact.concat(other).forEach(function (row) {
      var key = aicmRobotValue(row);
      if (!key || seen[key]) return;
      seen[key] = true;
      merged.push(row);
    });

    return merged;
  }`;

const newOptions = `
function aicmInlineRobotOptions(roleCode) {
    var all = aicmRobotCatalogSafe().filter(function (row) {
      return aicmRobotValue(row);
    });

    var recommended = [];
    var other = [];

    all.forEach(function (row) {
      if (aicmRobotMatchesInlineRole(row, roleCode)) recommended.push(row);
      else other.push(row);
    });

    var seen = Object.create(null);

    function optionFor(row) {
      var value = aicmRobotValue(row);
      if (!value || seen[value]) return "";
      seen[value] = true;
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(aicmRobotOptionLabel(row)) + '</option>';
    }

    if (all.length === 0) {
      return '<option value="">未設定</option><option value="" disabled>選択可能なロボット候補がありません</option>';
    }

    var parts = ['<option value="">未設定</option>'];

    if (recommended.length > 0) {
      parts.push('<optgroup label="推奨候補">');
      recommended.forEach(function (row) {
        var option = optionFor(row);
        if (option) parts.push(option);
      });
      parts.push('</optgroup>');
    }

    if (other.length > 0) {
      parts.push('<optgroup label="その他候補">');
      other.forEach(function (row) {
        var option = optionFor(row);
        if (option) parts.push(option);
      });
      parts.push('</optgroup>');
    }

    return parts.join("");
  }`;

src = replaceFunction(src, "aicmRobotRoleText", newRoleText);
src = replaceFunction(src, "aicmRobotOptionLabel", newLabel);
src = replaceFunction(src, "aicmInlineRobotRows", newRows);
src = replaceFunction(src, "aicmInlineRobotOptions", newOptions);

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const roleTextFn = extractFunction(src, "aicmRobotRoleText").text;
const labelFn = extractFunction(src, "aicmRobotOptionLabel").text;
const rowsFn = extractFunction(src, "aicmInlineRobotRows").text;
const optionsFn = extractFunction(src, "aicmInlineRobotOptions").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  recommendedRoleCodeCount: count(roleTextFn, "recommended_role_codes"),
  selectorLabelCount: count(labelFn, "selector_label"),
  displayNameCount: count(labelFn, "display_name"),
  usableQuantityCount: count(labelFn, "usable_quantity"),
  exactOtherMergeCount: count(rowsFn, "exact.concat(other)"),
  optGroupRecommendedCount: count(optionsFn, "推奨候補"),
  optGroupOtherCount: count(optionsFn, "その他候補"),
  noCandidateMessageCount: count(optionsFn, "選択可能なロボット候補がありません"),
  roleSettingOpenButtonCount: count(src, "role-setting-open")
}));
