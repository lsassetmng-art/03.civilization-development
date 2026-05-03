import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const displayMarker = 'AICM_ROLE_CONFIRM_DISPLAY_LABEL_AXH_R1_V1';
const syncMarker = 'AICM_ROLE_SYNC_REQUEST_BODY_AXH_R1_V1';

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

    if (depth === 0) {
      return { start, open, end: i + 1 };
    }
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

// ------------------------------------------------------------
// 1. Confirmation summary display fix.
// Replace entire aicmAvdRoleSummaryRows().
// ------------------------------------------------------------
replaceFunction('aicmAvdRoleSummaryRows', `function aicmAvdRoleSummaryRows(prefix) {
    // ${displayMarker}
    var rows = [];

    function textById(id) {
      if (typeof aicmAvdTextById === "function") return aicmAvdTextById(id);
      var el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    }

    function selectedLabelFromElement(el) {
      if (!el) return "";

      if (el.tagName && String(el.tagName).toLowerCase() === "select") {
        var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
        var label = opt ? String(opt.textContent || opt.innerText || "").trim() : "";

        if (label && label !== "未設定" && label !== "候補がありません") {
          return label;
        }

        return "";
      }

      return String(el.value || "").trim();
    }

    function selectedLabelById(id) {
      return selectedLabelFromElement(document.getElementById(id));
    }

    function findByIds(ids) {
      for (var i = 0; i < ids.length; i += 1) {
        var el = document.getElementById(ids[i]);
        if (el) return el;
      }
      return null;
    }

    function push(label, robotId, nicknameId) {
      var robot = selectedLabelById(robotId);
      var nickname = textById(nicknameId);

      rows.push([label + "ロボット", robot || "未設定"]);
      rows.push([label + "社内通称", nickname || "未設定"]);
    }

    if (prefix === "company") {
      push("社長", "aicm-company-president-robot", "aicm-company-president-robot-nickname");
    }

    if (prefix === "department") {
      push("部長", "aicm-department-manager-robot", "aicm-department-manager-robot-nickname");
    }

    if (prefix === "section") {
      push("課長", "aicm-section-leader-robot", "aicm-section-leader-robot-nickname");

      var workerRows = [];
      var index = 0;

      while (index < 30) {
        var robotEl = findByIds([
          "aicm-inline-worker-" + String(index) + "-robot",
          "aicm-role-worker-robot-" + String(index),
          "aicm-role-worker-section-robot-" + String(index),
          "aicm-role-worker-section-new-robot-" + String(index)
        ]);

        var nickEl = findByIds([
          "aicm-inline-worker-" + String(index) + "-nickname",
          "aicm-role-worker-nickname-" + String(index),
          "aicm-role-worker-section-nickname-" + String(index),
          "aicm-role-worker-section-new-nickname-" + String(index)
        ]);

        if (!robotEl && !nickEl) break;

        var robotLabel = selectedLabelFromElement(robotEl);
        var nickname = nickEl ? String(nickEl.value || "").trim() : "";

        if (robotLabel || nickname) {
          workerRows.push((robotLabel || "未設定") + (nickname ? " / " + nickname : ""));
        }

        index += 1;
      }

      rows.push(["従業員設定", workerRows.length ? workerRows.join("\\n") : "未設定"]);
    }

    return rows;
  }`);

// ------------------------------------------------------------
// 2. Placement sync body fix.
// Replace entire aicmAxcSyncRolePlacementsForPayload().
// Existing requestJson pattern is requestJson(endpoint, bodyObject).
// ------------------------------------------------------------
replaceFunction('aicmAxcSyncRolePlacementsForPayload', `async function aicmAxcSyncRolePlacementsForPayload(payload) {
  // ${syncMarker}
  var rows = payload && Array.isArray(payload.rolePlacements) ? payload.rolePlacements : [];

  if (!rows.length) {
    return { result: "ok", skipped: true };
  }

  var body = payload.body || {};
  var companyId = body.aicm_user_company_id || "";

  if (!companyId && state && state.selectedCompanyId) {
    companyId = state.selectedCompanyId;
  }

  return requestJson("/api/aicm/v2/placement/sync-role-settings", {
    owner_civilization_id: ownerId(),
    aicm_user_company_id: companyId,
    role_placements: rows
  });
}`);

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`displayMarkerCount=${countText(displayMarker)}`);
console.log(`syncMarkerCount=${countText(syncMarker)}`);
console.log(`badSyncMethodCount=${countText('method: "POST"')}`);
console.log(`badSyncJsonCount=${countText('body: JSON.stringify')}`);
console.log(`oldSummaryRobotValueReadCount=${countText('var robot = aicmAvdTextById(robotId)')}`);
console.log(`oldWorkerJsonSummaryCount=${countText('JSON.stringify(workerRows)')}`);
console.log(`syncEndpointCount=${countText('/api/aicm/v2/placement/sync-role-settings')}`);
