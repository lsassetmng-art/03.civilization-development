import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const marker = "AICM_INLINE_ROLE_SETTINGS_ATQ_ATT_V1";

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

function helpers() {
  return `
// ${marker}
// Inline role settings are displayed on add/edit screens.
// This phase is UI-only. DB write remains confirmation-gated in later phases.

function aicmRobotCatalogSafe() {
    var ctx = typeof aicmCtxSafe === "function" ? aicmCtxSafe() : (state.context || state || {});
    return Array.isArray(ctx.robot_catalog) ? ctx.robot_catalog : [];
  }

function aicmRobotRoleText(row) {
    if (!row || typeof row !== "object") return "";

    return [
      row.role_code,
      row.placement_role_code,
      row.assignment_role_code,
      row.eligible_role_code,
      row.role_name,
      row.role_label,
      row.aiworker_model_code,
      row.aiworker_model_name,
      row.model_line_code,
      row.series_code
    ].filter(Boolean).join(" ").toLowerCase();
  }

function aicmRobotMatchesInlineRole(row, roleCode) {
    var text = aicmRobotRoleText(row);

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
    if (!row) return "未選択";

    return (
      row.aiworker_model_name ||
      row.aiworker_model_code ||
      row.robot_name ||
      row.robot_pool_label ||
      row.model_name ||
      row.model_code ||
      row.robot_pool_id ||
      "ロボット"
    );
  }

function aicmInlineRobotOptions(roleCode) {
    var all = aicmRobotCatalogSafe();
    var filtered = all.filter(function (row) {
      return aicmRobotMatchesInlineRole(row, roleCode);
    });

    if (filtered.length === 0) filtered = all;

    return [
      '<option value="">未設定</option>'
    ].concat(filtered.map(function (row) {
      var id = row.robot_pool_id || row.aiworker_model_id || row.aiworker_model_code || row.model_code || "";
      var label = aicmRobotOptionLabel(row);
      return '<option value="' + escapeHtml(id) + '">' + escapeHtml(label) + '</option>';
    })).join("");
  }

function renderAicmInlineRoleSetting(roleCode, title, subtitle, fieldPrefix) {
    var safePrefix = fieldPrefix || roleCode;

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

function aicmInjectInlineRoleSettingsForAddScreens(html) {
    if (!state || !state.screen || !html) return html;

    var extra = "";

    if (state.screen === "company-new") {
      extra = renderAicmInlineRoleSetting("president", "社長設定", "AI企業全体の方針を受けるPresidentを設定します。", "president-company-new");
    }

    if (state.screen === "department-new") {
      extra = renderAicmInlineRoleSetting("manager", "部長設定", "この部門を統括するManagerを設定します。", "manager-department-new");
    }

    if (state.screen === "section-new") {
      extra = [
        renderAicmInlineRoleSetting("leader", "課長設定", "この課を統括するLeaderを設定します。", "leader-section-new"),
        renderAicmInlineRoleSetting("worker", "従業員設定", "この課に配置するWorkerを設定します。", "worker-section-new")
      ].join("");
    }

    if (!extra) return html;
    if (html.indexOf("aicm-inline-role-setting-card") >= 0) return html;

    if (html.indexOf("</main></div>") >= 0) {
      return html.replace("</main></div>", extra + "</main></div>");
    }

    if (html.indexOf("</main>") >= 0) {
      return html.replace("</main>", extra + "</main>");
    }

    return html + extra;
  }
`;
}

function patchRenderForAddInjection(source) {
  const renderFn = extractFunction(source, "render");
  let text = renderFn.text;

  if (!text.includes("AICM_INLINE_ROLE_ADD_SCREEN_INJECTION_ATQ_ATT")) {
    const anchor = "root.innerHTML = html;";
    const idx = text.indexOf(anchor);
    if (idx < 0) throw new Error("root.innerHTML = html not found in render");

    const injection = `
    // AICM_INLINE_ROLE_ADD_SCREEN_INJECTION_ATQ_ATT
    if (typeof aicmInjectInlineRoleSettingsForAddScreens === "function") {
      html = aicmInjectInlineRoleSettingsForAddScreens(html);
    }

`;

    text = text.slice(0, idx) + injection + text.slice(idx);
  }

  return replaceFunction(source, "render", text);
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

src = removeFunctionIfExists(src, "aicmRobotCatalogSafe");
src = removeFunctionIfExists(src, "aicmRobotRoleText");
src = removeFunctionIfExists(src, "aicmRobotMatchesInlineRole");
src = removeFunctionIfExists(src, "aicmRobotOptionLabel");
src = removeFunctionIfExists(src, "aicmInlineRobotOptions");
src = removeFunctionIfExists(src, "renderAicmInlineRoleSetting");
src = removeFunctionIfExists(src, "renderAicmRoleSettingCard");
src = removeFunctionIfExists(src, "aicmInjectInlineRoleSettingsForAddScreens");

src = insertBeforeFunction(src, "renderCompanyEditPlaceholder", helpers());
src = patchRenderForAddInjection(src);

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const renderRoleFn = extractFunction(src, "renderAicmRoleSettingCard").text;
const inlineFn = extractFunction(src, "renderAicmInlineRoleSetting").text;
const injectFn = extractFunction(src, "aicmInjectInlineRoleSettingsForAddScreens").text;
const renderFn = extractFunction(src, "render").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  inlineRoleHelperCount: count(src, "function renderAicmInlineRoleSetting("),
  roleCardHelperCount: count(src, "function renderAicmRoleSettingCard("),
  roleSettingOpenButtonCount: count(renderRoleFn, "role-setting-open") + count(inlineFn, "role-setting-open"),
  roleSettingOpenActionCount: count(src, 'action === "role-setting-open"'),
  companyNewInjectionCount: count(injectFn, 'state.screen === "company-new"'),
  departmentNewInjectionCount: count(injectFn, 'state.screen === "department-new"'),
  sectionNewInjectionCount: count(injectFn, 'state.screen === "section-new"'),
  renderInjectionCount: count(renderFn, "AICM_INLINE_ROLE_ADD_SCREEN_INJECTION_ATQ_ATT"),
  presidentSettingCount: count(src, "社長設定"),
  managerSettingCount: count(src, "部長設定"),
  leaderSettingCount: count(src, "課長設定"),
  workerSettingCount: count(src, "従業員設定"),
  selectFieldCount: count(inlineFn, "<select"),
  nicknameFieldCount: count(inlineFn, "社内通称")
}));
