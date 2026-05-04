const fs = require("fs");

const [,, corePath, verifyOut, extractOut] = process.argv;
let src = fs.readFileSync(corePath, "utf8");

const marker = "AICM_R8Z_MGR_MAJOR_CARD_C2F_B_PRE_POST_VALIDATION_GATE";
const targetFunctionName = "aicmR8zMgrMajorCardRenderConfirm";

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c++;
    from = idx + needle.length;
  }
  return c;
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = "normal";
  let escape = false;

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === "lineComment") {
      if (ch === "\n") state = "normal";
      continue;
    }
    if (state === "blockComment") {
      if (ch === "*" && nx === "/") {
        state = "normal";
        i += 1;
      }
      continue;
    }
    if (state === "single") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "'") state = "normal";
      continue;
    }
    if (state === "double") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') state = "normal";
      continue;
    }
    if (state === "template") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "`") state = "normal";
      continue;
    }

    if (ch === "/" && nx === "/") {
      state = "lineComment";
      i += 1;
      continue;
    }
    if (ch === "/" && nx === "*") {
      state = "blockComment";
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = "single";
      continue;
    }
    if (ch === '"') {
      state = "double";
      continue;
    }
    if (ch === "`") {
      state = "template";
      continue;
    }

    if (ch === "{") return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = "normal";
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === "lineComment") {
      if (ch === "\n") state = "normal";
      continue;
    }
    if (state === "blockComment") {
      if (ch === "*" && nx === "/") {
        state = "normal";
        i += 1;
      }
      continue;
    }
    if (state === "single") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "'") state = "normal";
      continue;
    }
    if (state === "double") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') state = "normal";
      continue;
    }
    if (state === "template") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "`") state = "normal";
      continue;
    }

    if (ch === "/" && nx === "/") {
      state = "lineComment";
      i += 1;
      continue;
    }
    if (ch === "/" && nx === "*") {
      state = "blockComment";
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = "single";
      continue;
    }
    if (ch === '"') {
      state = "double";
      continue;
    }
    if (ch === "`") {
      state = "template";
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionRange(text, name) {
  const re = new RegExp("(?:async\\s+)?function\\s+" + escRe(name) + "\\s*\\(", "m");
  const m = re.exec(text);
  if (!m) throw new Error("FUNCTION_NOT_FOUND: " + name);

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) throw new Error("OPEN_BRACE_NOT_FOUND: " + name);

  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error("CLOSE_BRACE_NOT_FOUND: " + name);

  return {
    name,
    start,
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function replaceFunction(text, fn, nextText) {
  return text.slice(0, fn.start) + nextText + text.slice(fn.close + 1);
}

if (count(src, marker) > 0) {
  throw new Error("C2F_B_MARKER_ALREADY_EXISTS");
}

const fn = findFunctionRange(src, targetFunctionName);
let fnText = fn.text;
const insertAt = fn.open - fn.start + 1;

const gateBlock = `
  // ${marker}_START
  // Pre-POST validation gate.
  // This block does not enable POST.
  // It only prevents the confirm panel from showing an executable state when required values are missing.
  try {
    function aicmC2fBText(value) {
      if (value === null || typeof value === "undefined") return "";
      return String(value).trim();
    }

    function aicmC2fBEscape(value) {
      return aicmC2fBText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function aicmC2fBGet(obj, keys) {
      if (!obj || typeof obj !== "object") return "";
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        var value = obj[key];
        if (value !== null && typeof value !== "undefined" && String(value).trim() !== "") {
          return String(value).trim();
        }
      }
      return "";
    }

    function aicmC2fBArr(value) {
      return Array.isArray(value) ? value : [];
    }

    function aicmC2fBRowId(row, fallbackIndex) {
      return aicmC2fBGet(row, [
        "manager_major_item_id",
        "managerMajorItemId",
        "pmlw_major_item_id",
        "major_item_id",
        "majorItemId",
        "id",
        "uuid"
      ]) || ("row_index_" + String(fallbackIndex));
    }

    var aicmC2fBSelectedRows = [];
    if (typeof aicmR8zMgrMajorCardSelectedRows === "function") {
      try {
        aicmC2fBSelectedRows = aicmR8zMgrMajorCardSelectedRows() || [];
      } catch (_) {
        aicmC2fBSelectedRows = [];
      }
    }

    var aicmC2fBSelectionState = null;
    if (typeof aicmR8zMgrMajorCardSelectionState === "function") {
      try {
        aicmC2fBSelectionState = aicmR8zMgrMajorCardSelectionState();
      } catch (_) {
        aicmC2fBSelectionState = null;
      }
    }

    var aicmC2fBState = typeof state !== "undefined" && state ? state : {};
    var aicmC2fBFallbackSelection =
      aicmC2fBState.r8zMgrMajorCardSelection && typeof aicmC2fBState.r8zMgrMajorCardSelection === "object"
        ? aicmC2fBState.r8zMgrMajorCardSelection
        : {};

    var aicmC2fBRoute =
      (aicmC2fBSelectionState && aicmC2fBSelectionState.handoffBatchRoute) ||
      aicmC2fBFallbackSelection.handoffBatchRoute ||
      {};

    var aicmC2fBMissing = [];
    var aicmC2fBStableIds = [];
    var aicmC2fBRowTitles = [];

    if (!aicmC2fBSelectedRows.length) {
      aicmC2fBMissing.push("対象大項目が選択されていません");
    }

    for (var aicmC2fBI = 0; aicmC2fBI < aicmC2fBSelectedRows.length; aicmC2fBI += 1) {
      var aicmC2fBRow = aicmC2fBSelectedRows[aicmC2fBI] || {};
      var aicmC2fBId = aicmC2fBRowId(aicmC2fBRow, aicmC2fBI);
      var aicmC2fBTitle = aicmC2fBGet(aicmC2fBRow, [
        "major_item_name",
        "manager_major_item_name",
        "title",
        "name",
        "task_name"
      ]) || aicmC2fBId;

      aicmC2fBStableIds.push(aicmC2fBId);
      aicmC2fBRowTitles.push(aicmC2fBTitle);

      if (!aicmC2fBId || aicmC2fBId.indexOf("row_index_") === 0) {
        aicmC2fBMissing.push("対象大項目IDが安定していません: " + aicmC2fBTitle);
      }
    }

    var aicmC2fBRouteApplied =
      aicmC2fBRoute.applied === true ||
      aicmC2fBRoute.applied_flag === true ||
      aicmC2fBText(aicmC2fBRoute.appliedLabel || aicmC2fBRoute.applied_label) === "適用済み";

    var aicmC2fBSectionLabel = aicmC2fBText(
      aicmC2fBRoute.sectionLabel ||
      aicmC2fBRoute.section_label ||
      aicmC2fBRoute.sectionName ||
      aicmC2fBRoute.section_name
    );

    var aicmC2fBDepartmentLabel = aicmC2fBText(
      aicmC2fBRoute.departmentLabel ||
      aicmC2fBRoute.department_label ||
      aicmC2fBRoute.departmentName ||
      aicmC2fBRoute.department_name
    );

    var aicmC2fBLeaderLabel = aicmC2fBText(
      aicmC2fBRoute.leaderLabel ||
      aicmC2fBRoute.leader_label ||
      aicmC2fBRoute.assigned_leader_label
    );

    var aicmC2fBLeaderPlacementId = aicmC2fBText(
      aicmC2fBRoute.leaderPlacementId ||
      aicmC2fBRoute.leader_placement_id ||
      aicmC2fBRoute.assigned_leader_placement_id
    );

    if (!aicmC2fBRouteApplied) aicmC2fBMissing.push("課・部門・Leaderの引き渡し先が未適用です");
    if (!aicmC2fBSectionLabel) aicmC2fBMissing.push("課が未設定です");
    if (!aicmC2fBDepartmentLabel) aicmC2fBMissing.push("部門が未設定です");
    if (!aicmC2fBLeaderLabel) aicmC2fBMissing.push("Leaderが未設定です");
    if (!aicmC2fBLeaderPlacementId) aicmC2fBMissing.push("Leader配置IDが未設定です");

    var aicmC2fBPayloadPreview = {
      selected_manager_major_item_ids: aicmC2fBStableIds,
      selected_titles: aicmC2fBRowTitles,
      route: {
        department_label: aicmC2fBDepartmentLabel,
        section_label: aicmC2fBSectionLabel,
        leader_label: aicmC2fBLeaderLabel,
        leader_placement_id: aicmC2fBLeaderPlacementId
      },
      api_post: "LOCKED_BY_C2F_B_PRE_POST_GATE",
      db_write: "NO"
    };

    if (aicmC2fBMissing.length > 0) {
      return [
        '<section class="aicm-core-card aicm-r8z-c2f-b-prepost-gate">',
        '<div class="aicm-core-section-title">課長へ送る前の実行前チェック</div>',
        '<p class="aicm-core-muted">不足項目があるため、POST実行はロックされています。</p>',
        '<div class="aicm-core-alert aicm-core-alert-warning">',
        '<strong>実行前チェックNG</strong>',
        '<ul>',
        aicmC2fBMissing.map(function (item) {
          return '<li>' + aicmC2fBEscape(item) + '</li>';
        }).join(''),
        '</ul>',
        '</div>',
        '<dl class="aicm-core-dl">',
        '<dt>部門</dt><dd>' + aicmC2fBEscape(aicmC2fBDepartmentLabel || '-') + '</dd>',
        '<dt>課</dt><dd>' + aicmC2fBEscape(aicmC2fBSectionLabel || '-') + '</dd>',
        '<dt>Leader</dt><dd>' + aicmC2fBEscape(aicmC2fBLeaderLabel || '-') + '</dd>',
        '<dt>対象大項目数</dt><dd>' + String(aicmC2fBSelectedRows.length) + '</dd>',
        '</dl>',
        '<details class="aicm-core-details">',
        '<summary>payload preview（POST未実行）</summary>',
        '<pre>' + aicmC2fBEscape(JSON.stringify(aicmC2fBPayloadPreview, null, 2)) + '</pre>',
        '</details>',
        '<div class="aicm-core-actions">',
        '<button type="button" class="aicm-core-btn" data-core-action="r8z-mgr-major-card-close-handoff-confirm">戻る</button>',
        '</div>',
        '</section>'
      ].join('');
    }
  } catch (aicmC2fBError) {
    return [
      '<section class="aicm-core-card aicm-r8z-c2f-b-prepost-gate-error">',
      '<div class="aicm-core-section-title">課長へ送る前の実行前チェック</div>',
      '<p class="aicm-core-alert aicm-core-alert-warning">確認状態を読み取れないため、POST実行はロックされています。</p>',
      '<pre>' + String(aicmC2fBError && aicmC2fBError.message ? aicmC2fBError.message : aicmC2fBError) + '</pre>',
      '<div class="aicm-core-actions">',
      '<button type="button" class="aicm-core-btn" data-core-action="r8z-mgr-major-card-close-handoff-confirm">戻る</button>',
      '</div>',
      '</section>'
    ].join('');
  }
  // ${marker}_END

`;

fnText = fnText.slice(0, insertAt) + gateBlock + fnText.slice(insertAt);
src = replaceFunction(src, fn, fnText);

fs.writeFileSync(corePath, src);

const patched = findFunctionRange(src, targetFunctionName);
const insertedStart = patched.text.indexOf(marker + "_START");
const insertedEnd = patched.text.indexOf(marker + "_END");
const inserted = insertedStart >= 0 && insertedEnd >= insertedStart
  ? patched.text.slice(insertedStart, insertedEnd + marker.length + "_END".length)
  : "";

const sampleMissing = inserted.includes("実行前チェックNG") &&
  inserted.includes("POST実行はロック") &&
  inserted.includes("payload preview") &&
  inserted.includes("部門") &&
  inserted.includes("課") &&
  inserted.includes("Leader");

const extract = [];
extract.push("AICompanyManager V10L-C2F-B patched confirm extract");
extract.push("DB_WRITE=NO");
extract.push("API_POST=NO");
extract.push("CORE_PATCH=YES");
extract.push("SERVER_PATCH=NO");
extract.push("");
extract.push("TARGET_FUNCTION=" + targetFunctionName);
extract.push("TARGET_FUNCTION_LINES=" + patched.startLine + "-" + patched.endLine);
extract.push("");
extract.push("INSERTED_BLOCK");
extract.push("============================================================");
extract.push(inserted);
extract.push("");
extract.push("PATCHED_FUNCTION");
extract.push("============================================================");
extract.push(patched.text);
fs.writeFileSync(extractOut, extract.join("\n") + "\n");

const verify = [];
verify.push("AICompanyManager V10L-C2F-B verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("SERVER_PATCH=NO");
verify.push("CORE_PATCH=YES");
verify.push("");
verify.push("TARGET_FUNCTION=" + targetFunctionName);
verify.push("TARGET_FUNCTION_LINES=" + patched.startLine + "-" + patched.endLine);
verify.push("C2F_B_MARKER_TOTAL_COUNT=" + count(src, marker));
verify.push("C2F_B_START_COUNT=" + count(src, marker + "_START"));
verify.push("C2F_B_END_COUNT=" + count(src, marker + "_END"));
verify.push("PRECHECK_NG_TEXT_COUNT=" + count(patched.text, "実行前チェックNG"));
verify.push("POST_LOCK_TEXT_COUNT=" + count(patched.text, "POST実行はロック"));
verify.push("PAYLOAD_PREVIEW_COUNT_IN_TARGET=" + count(patched.text, "payload preview"));
verify.push("DEPARTMENT_LABEL_COUNT_IN_TARGET=" + count(patched.text, "部門"));
verify.push("SECTION_LABEL_COUNT_IN_TARGET=" + count(patched.text, "課"));
verify.push("LEADER_LABEL_COUNT_IN_TARGET=" + count(patched.text, "Leader"));
verify.push("FETCH_IN_INSERTED_BLOCK=" + count(inserted, "fetch("));
verify.push("XMLHTTP_IN_INSERTED_BLOCK=" + count(inserted, "XMLHttpRequest"));
verify.push("API_POST_UNLOCK_TEXT_IN_INSERTED_BLOCK=" + count(inserted, "API_POST=YES") + count(inserted, "api_post: \"YES\""));
verify.push("SAMPLE_MISSING_GATE_RENDERABLE=" + (sampleMissing ? "YES" : "NO"));
verify.push("EXTRACT_OUT=" + extractOut);

if (count(src, marker) !== 2) throw new Error("C2F_B_MARKER_TOTAL_COUNT_NOT_2");
if (count(src, marker + "_START") !== 1) throw new Error("C2F_B_START_COUNT_NOT_1");
if (count(src, marker + "_END") !== 1) throw new Error("C2F_B_END_COUNT_NOT_1");
if (count(inserted, "fetch(") !== 0) throw new Error("FETCH_FOUND_IN_INSERTED_BLOCK");
if (count(inserted, "XMLHttpRequest") !== 0) throw new Error("XMLHTTP_FOUND_IN_INSERTED_BLOCK");
if (count(inserted, "API_POST=YES") !== 0) throw new Error("API_POST_UNLOCK_FOUND");
if (!sampleMissing) throw new Error("SAMPLE_MISSING_GATE_NOT_RENDERABLE");

fs.writeFileSync(verifyOut, verify.join("\n") + "\n");
