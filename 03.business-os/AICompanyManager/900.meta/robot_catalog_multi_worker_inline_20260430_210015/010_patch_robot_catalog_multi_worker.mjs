import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_ROBOT_CATALOG_MULTI_WORKER_ATU_ATX_V1";

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

function removeFunctionIfExists(source, functionName) {
  while (source.includes("function " + functionName + "(")) {
    const fn = extractFunction(source, functionName);
    source = source.slice(0, fn.start) + source.slice(fn.end);
  }
  return source;
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") throw new Error("STOP: renderShell replacement prohibited");
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function insertBeforeFunction(source, functionName, insertion) {
  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("Insertion anchor not found: " + functionName);
  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

function findActionBlockByAction(source, action) {
  const token = `action === "${action}"`;
  const tokenPos = source.indexOf(token);
  if (tokenPos < 0) return null;

  const ifPos = source.lastIndexOf("if", tokenPos);
  const braceStart = source.indexOf("{", tokenPos);
  if (ifPos < 0 || braceStart < 0) throw new Error("action block malformed: " + action);

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
      if (depth === 0) return { start: ifPos, end: i + 1, text: source.slice(ifPos, i + 1) };
    }
  }

  throw new Error("action block end not found: " + action);
}

function insertActionBeforeGo(source, action, blockText) {
  if (source.includes(`action === "${action}"`)) return source;

  const goBlock = findActionBlockByAction(source, "go");
  if (!goBlock) throw new Error("go action anchor not found");

  return source.slice(0, goBlock.start) + blockText + "\n\n    " + source.slice(goBlock.start);
}

function helpers() {
  return `
// ${marker}
// Robot catalog option mapping is intentionally broad because Business robot selector views may evolve.
// Worker settings support multiple rows. Actual DB write remains confirmation-gated in later phases.

function aicmRobotCatalogSafe() {
    var candidates = [];
    var ctx = typeof aicmCtxSafe === "function" ? aicmCtxSafe() : {};

    if (ctx && typeof ctx === "object") {
      candidates.push(ctx.robot_catalog);
      candidates.push(ctx.robotCatalog);
      candidates.push(ctx.robots);
      candidates.push(ctx.robot_pool);
      candidates.push(ctx.robot_pool_items);
      candidates.push(ctx.available_robots);
      candidates.push(ctx.availableRobots);
      candidates.push(ctx.worker_robot_catalog);
      candidates.push(ctx.aiworker_catalog);
    }

    if (state && typeof state === "object") {
      candidates.push(state.robot_catalog);
      candidates.push(state.robotCatalog);
      candidates.push(state.robots);
      candidates.push(state.available_robots);
      candidates.push(state.context && state.context.robot_catalog);
      candidates.push(state.ctx && state.ctx.robot_catalog);
      candidates.push(state.data && state.data.robot_catalog);
    }

    for (var i = 0; i < candidates.length; i++) {
      if (Array.isArray(candidates[i]) && candidates[i].length > 0) return candidates[i];
    }

    return [];
  }

function aicmRobotValue(row) {
    if (!row || typeof row !== "object") return "";

    return String(
      row.robot_pool_id ||
      row.business_robot_pool_id ||
      row.aicm_robot_pool_id ||
      row.worker_pool_id ||
      row.placement_robot_pool_id ||
      row.aiworker_model_id ||
      row.aiworker_model_code ||
      row.model_id ||
      row.model_code ||
      row.robot_id ||
      row.id ||
      ""
    );
  }

function aicmRobotRoleText(row) {
    if (!row || typeof row !== "object") return "";

    return [
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.eligible_role_code,
      row.available_role_code,
      row.role_name,
      row.role_label,
      row.position_code,
      row.position_label,
      row.role_display_name,
      row.aiworker_model_code,
      row.aiworker_model_name,
      row.model_line_code,
      row.model_code,
      row.model_name,
      row.series_code,
      row.series_name,
      row.robot_type_code,
      row.robot_type_label
    ].filter(Boolean).join(" ").toLowerCase();
  }

function aicmRobotMatchesInlineRole(row, roleCode) {
    var text = aicmRobotRoleText(row);

    if (!text) return true;

    if (roleCode === "president") {
      return text.indexOf("president") >= 0 || text.indexOf("社長") >= 0 || text.indexOf("プレジデント") >= 0 || text.indexOf("r5p") >= 0;
    }

    if (roleCode === "manager") {
      return text.indexOf("manager") >= 0 || text.indexOf("部長") >= 0 || text.indexOf("マネージャ") >= 0 || text.indexOf("r5") >= 0;
    }

    if (roleCode === "leader") {
      return text.indexOf("leader") >= 0 || text.indexOf("課長") >= 0 || text.indexOf("リーダ") >= 0 || text.indexOf("r4") >= 0;
    }

    if (roleCode === "worker") {
      return text.indexOf("worker") >= 0 || text.indexOf("従業員") >= 0 || text.indexOf("ワーカー") >= 0 || text.indexOf("r3") >= 0;
    }

    return true;
  }

function aicmRobotOptionLabel(row) {
    if (!row) return "未設定";

    var base = (
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
    if (code && String(base).indexOf(String(code)) < 0) {
      return String(base) + " / " + String(code);
    }

    return String(base);
  }

function aicmInlineRobotRows(roleCode) {
    var all = aicmRobotCatalogSafe();
    var filtered = all.filter(function (row) {
      return aicmRobotMatchesInlineRole(row, roleCode);
    }).filter(function (row) {
      return aicmRobotValue(row);
    });

    if (filtered.length === 0) {
      filtered = all.filter(function (row) {
        return aicmRobotValue(row);
      });
    }

    return filtered;
  }

function aicmInlineRobotOptions(roleCode) {
    var rows = aicmInlineRobotRows(roleCode);

    if (rows.length === 0) {
      return '<option value="">未設定</option><option value="" disabled>選択可能なロボット候補がありません</option>';
    }

    return [
      '<option value="">未設定</option>'
    ].concat(rows.map(function (row) {
      return '<option value="' + escapeHtml(aicmRobotValue(row)) + '">' + escapeHtml(aicmRobotOptionLabel(row)) + '</option>';
    })).join("");
  }

function aicmWorkerSlotCount() {
    if (!state) return 3;

    var n = Number(state.inlineWorkerSlotCount || 3);
    if (!Number.isFinite(n) || n < 3) n = 3;
    if (n > 20) n = 20;
    state.inlineWorkerSlotCount = n;

    return n;
  }

function renderAicmWorkerInlineRows(fieldPrefix) {
    var count = aicmWorkerSlotCount();
    var safePrefix = fieldPrefix || "worker";
    var rows = [];

    for (var i = 0; i < count; i++) {
      rows.push([
        '<div class="aicm-worker-inline-row">',
        '  <label>従業員設定ロボット ' + String(i + 1) + '<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot-' + String(i) + '" data-inline-role-code="worker" data-worker-slot-index="' + String(i) + '">',
        aicmInlineRobotOptions("worker"),
        '  </select></label>',
        '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname-' + String(i) + '" type="text" placeholder="例: ウルフ@従業員' + String(i + 1) + '"></label>',
        '</div>'
      ].join(""));
    }

    return rows.join("");
  }

function renderAicmInlineRoleSetting(roleCode, title, subtitle, fieldPrefix) {
    var safePrefix = fieldPrefix || roleCode;

    if (roleCode === "worker") {
      return [
        '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
        '  <p class="aicm-eyebrow">役職設定</p>',
        '  <h2>' + escapeHtml(title) + '</h2>',
        subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
        renderAicmWorkerInlineRows(safePrefix),
        '  <button type="button" data-core-action="inline-worker-slot-add">従業員行を追加</button>',
        '  <p class="aicm-core-empty">従業員は複数設定できます。保存時は確認画面を通して登録します。</p>',
        '</section>'
      ].join("");
    }

    return [
      '<section class="aicm-core-card aicm-inline-role-setting-card" data-inline-role="' + escapeHtml(roleCode) + '">',
      '  <p class="aicm-eyebrow">役職設定</p>',
      '  <h2>' + escapeHtml(title) + '</h2>',
      subtitle ? '  <p class="aicm-selected-note">' + escapeHtml(subtitle) + '</p>' : '',
      '  <label>' + escapeHtml(title) + 'ロボット<select id="aicm-role-' + escapeHtml(safePrefix) + '-robot" data-inline-role-code="' + escapeHtml(roleCode) + '">',
      aicmInlineRobotOptions(roleCode),
      '  </select></label>',
      '  <label>社内通称<input id="aicm-role-' + escapeHtml(safePrefix) + '-nickname" type="text" placeholder="例: ウルフ@' + escapeHtml(title.replace("設定", "")) + '"></label>',
      '  <p class="aicm-core-empty">保存時は確認画面を通して登録します。</p>',
      '</section>'
    ].join("");
  }

function renderAicmRoleSettingCard(roleCode, title, subtitle, scope) {
    var prefix = roleCode;

    if (scope && scope.sectionId) prefix = roleCode + "-section";
    else if (scope && scope.departmentId) prefix = roleCode + "-department";
    else if (scope && scope.companyId) prefix = roleCode + "-company";

    return renderAicmInlineRoleSetting(roleCode, title, subtitle, prefix);
  }
`;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

const helperNames = [
  "aicmRobotCatalogSafe",
  "aicmRobotValue",
  "aicmRobotRoleText",
  "aicmRobotMatchesInlineRole",
  "aicmRobotOptionLabel",
  "aicmInlineRobotRows",
  "aicmInlineRobotOptions",
  "aicmWorkerSlotCount",
  "renderAicmWorkerInlineRows",
  "renderAicmInlineRoleSetting",
  "renderAicmRoleSettingCard"
];

for (const name of helperNames) {
  src = removeFunctionIfExists(src, name);
}

src = insertBeforeFunction(src, "aicmInjectInlineRoleSettingsForAddScreens", helpers());

src = insertActionBeforeGo(src, "inline-worker-slot-add", `if (action === "inline-worker-slot-add") {
      if (!state.inlineWorkerSlotCount) state.inlineWorkerSlotCount = 3;
      state.inlineWorkerSlotCount = Math.min(20, Number(state.inlineWorkerSlotCount || 3) + 1);
      if (typeof render === "function") render();
      return;
    }`);

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const inlineFn = extractFunction(src, "renderAicmInlineRoleSetting").text;
const workerFn = extractFunction(src, "renderAicmWorkerInlineRows").text;
const optionsFn = extractFunction(src, "aicmInlineRobotOptions").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  robotCatalogSafeCount: count(src, "function aicmRobotCatalogSafe("),
  robotValueHelperCount: count(src, "function aicmRobotValue("),
  inlineRobotOptionsCount: count(src, "function aicmInlineRobotOptions("),
  workerRowsHelperCount: count(src, "function renderAicmWorkerInlineRows("),
  workerSlotCountHelperCount: count(src, "function aicmWorkerSlotCount("),
  workerAddActionCount: count(src, 'action === "inline-worker-slot-add"'),
  workerAddButtonCount: count(inlineFn, "inline-worker-slot-add"),
  workerMultipleMessageCount: count(inlineFn, "従業員は複数設定できます"),
  workerSelectCountInWorkerFn: count(workerFn, "data-worker-slot-index"),
  noCandidateMessageCount: count(optionsFn, "選択可能なロボット候補がありません"),
  roleSettingOpenButtonCount: count(inlineFn, "role-setting-open")
}));
