import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_ROBOT_OPTION_AVAILABILITY_LABEL_AXQ_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRange(functionName) {
  const start = src.indexOf(`function ${functionName}(`);
  if (start < 0) return null;

  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) return { start, open, end: i + 1 };
  }

  return null;
}

function replaceFunction(functionName, replacement) {
  const range = findFunctionRange(functionName);
  if (!range) {
    console.error(`Function not found: ${functionName}`);
    process.exit(1);
  }

  src = src.slice(0, range.start) + replacement + src.slice(range.end);
}

function insertBeforeFunction(functionName, text) {
  const idx = src.indexOf(`function ${functionName}(`);
  if (idx < 0) {
    console.error(`Insertion anchor not found: ${functionName}`);
    process.exit(1);
  }

  src = src.slice(0, idx) + text + "\n" + src.slice(idx);
}

// ------------------------------------------------------------
// 1. Availability helpers.
// ------------------------------------------------------------
if (!src.includes(marker)) {
  insertBeforeFunction('aicmRobotOptionLabel', `
// ${marker}
// Robot option availability display helpers.
// Canonical data comes from business.vw_ai_company_manager_system_robot_selector_options.
// This is display/selectability only. It does not write DB.
function aicmAxqText(value) {
    return String(value || "").trim();
  }

function aicmAxqBool(value) {
    if (value === true) return true;
    if (value === false) return false;

    var text = String(value || "").trim().toLowerCase();
    return text === "true" || text === "t" || text === "1" || text === "yes" || text === "y";
  }

function aicmAxqNumberOrNull(value) {
    if (value === undefined || value === null || value === "") return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

function aicmAxqUnlimited(row) {
    row = row || {};
    return aicmAxqBool(
      row.unlimited_assignment_flag !== undefined ? row.unlimited_assignment_flag :
      row.unlimited_flag !== undefined ? row.unlimited_flag :
      row.is_unlimited !== undefined ? row.is_unlimited :
      row.assignment_unlimited_flag
    );
  }

function aicmAxqAvailableQuantity(row) {
    row = row || {};

    var candidates = [
      row.usable_quantity,
      row.available_quantity,
      row.remaining_quantity,
      row.contract_available_quantity,
      row.available_count,
      row.quantity_available
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      var n = aicmAxqNumberOrNull(candidates[i]);
      if (n !== null) return n;
    }

    return null;
  }

function aicmAxqAvailabilityText(row) {
    if (aicmAxqUnlimited(row)) return "利用可能:無制限";

    var qty = aicmAxqAvailableQuantity(row);
    if (qty === null) return "利用可能:確認中";
    if (qty > 0) return "利用可能:" + String(qty);

    return "利用不可";
  }

function aicmAxqSelectable(row) {
    if (aicmAxqUnlimited(row)) return true;

    var qty = aicmAxqAvailableQuantity(row);
    if (qty === null) return true;

    return qty > 0;
  }

function aicmAxqBaseRobotLabel(row) {
    row = row || {};

    var name = aicmAxqText(
      row.display_name ||
      row.aiworker_model_name ||
      row.robot_name ||
      row.robot_pool_label ||
      row.aiworker_model_code ||
      row.model_code ||
      row.robot_pool_id ||
      row.robot_id
    );

    var code = aicmAxqText(row.aiworker_model_code || row.model_code);

    if (name && code && name.indexOf(code) < 0) {
      return name + " / " + code;
    }

    return name || code || "ロボット";
  }
`);
}

// ------------------------------------------------------------
// 2. Replace label builder.
// Avoid using selector_label directly because it currently includes 利用可能:0.
// ------------------------------------------------------------
replaceFunction('aicmRobotOptionLabel', `function aicmRobotOptionLabel(row) {
    // ${marker}
    return aicmAxqBaseRobotLabel(row) + " / " + aicmAxqAvailabilityText(row);
  }`);

// ------------------------------------------------------------
// 3. Replace options builder to disable finite zero candidates.
// Keeps selected saved/current value visible even if not selectable.
// ------------------------------------------------------------
replaceFunction('aicmInlineRobotOptions', `function aicmInlineRobotOptions(roleCode, selectedValue, selectedLabel) {
    // ${marker}
    var rows = aicmInlineRobotRows(roleCode);
    var selected = typeof aicmAxnText === "function" ? aicmAxnText(selectedValue) : String(selectedValue || "").trim();
    var selectedFound = false;

    if (!rows.length && !selected) {
      return '<option value="">未設定</option><option value="" disabled>候補がありません</option>';
    }

    var options = ['<option value="">未設定</option>'];

    rows.forEach(function (row) {
      var value = typeof aicmRobotValue === "function" ? aicmRobotValue(row) : "";
      var isSelected = selected && typeof aicmAxnOptionSelected === "function" && aicmAxnOptionSelected(row, selected);
      var selectable = aicmAxqSelectable(row);

      if (isSelected) selectedFound = true;

      options.push(
        '<option value="' + escapeHtml(value) + '"' +
        (isSelected ? ' selected' : '') +
        (!selectable && !isSelected ? ' disabled' : '') +
        '>' + escapeHtml(aicmRobotOptionLabel(row)) + '</option>'
      );
    });

    if (selected && !selectedFound) {
      options.push('<option value="' + escapeHtml(selected) + '" selected>' + escapeHtml(selectedLabel || selected) + '</option>');
    }

    return options.join("");
  }`);

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(marker)}`);
console.log(`availabilityHelperCount=${countText('function aicmAxqAvailabilityText')}`);
console.log(`selectableHelperCount=${countText('function aicmAxqSelectable')}`);
console.log(`optionLabelCount=${countText('function aicmRobotOptionLabel')}`);
console.log(`inlineOptionsCount=${countText('function aicmInlineRobotOptions')}`);
console.log(`directSelectorLabelUseCount=${countText('selector_label ||') + countText('selector_label||')}`);
console.log(`unlimitedTextCount=${countText('利用可能:無制限')}`);
console.log(`disabledOptionCount=${countText(' disabled')}`);
console.log(`asyncAsyncCount=${countText('async async function')}`);
