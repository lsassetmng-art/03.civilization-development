import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const marker = "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1";

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
      if (depth === 0) {
        return { start, end: i + 1, text: source.slice(start, i + 1) };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") {
    throw new Error("STOP: renderShell replacement is prohibited");
  }

  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
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
      if (depth === 0) return { start: ifPos, end: i + 1 };
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

function insertBeforeFunction(source, functionName, insertion) {
  if (source.includes(marker)) return source;

  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("insertion anchor not found: " + functionName);

  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

function confirmationHelpers() {
  return `
// ${marker}
// DB write operations must pass through a visible confirmation screen before POST.

function aicmOrgUpdateLabel(kind) {
    if (kind === "company") return "企業変更";
    if (kind === "department") return "部門変更";
    if (kind === "section") return "課変更";
    return "変更";
  }

  function aicmOrgUpdateBodyRows(body) {
    var keys = Object.keys(body || {}).filter(function (key) {
      return key !== "owner_civilization_id" &&
        key.indexOf("_id") === -1 &&
        key !== "aicm_user_company_id" &&
        key !== "aicm_user_company_department_id" &&
        key !== "aicm_user_company_section_id";
    });

    if (!keys.length) return '<p class="aicm-core-empty">表示できる変更項目がありません。</p>';

    return keys.map(function (key) {
      return [
        '<div class="aicm-confirm-row">',
        '  <strong>' + escapeHtml(key) + '</strong>',
        '  <p>' + escapeHtml(String(body[key] || "")) + '</p>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderAicmOrgUpdateConfirmation(payload) {
    var label = aicmOrgUpdateLabel(payload.kind);
    return renderShell([
      '<section class="aicm-core-card aicm-confirm-card">',
      '  <p class="aicm-eyebrow">確認画面</p>',
      '  <h2>' + escapeHtml(label) + 'を実行しますか？</h2>',
      '  <p class="aicm-selected-note">この操作はDBへ保存されます。内容を確認してから確定してください。</p>',
      '  <div class="aicm-confirm-list">',
      aicmOrgUpdateBodyRows(payload.body || {}),
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="org-update-confirm-execute">確定して保存</button>',
      '    <button type="button" data-core-action="org-update-confirm-cancel">戻って修正</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }

  function aicmOrgShowUpdateConfirm(payload) {
    state.pendingOrgUpdate = payload || null;
    var root = document.getElementById("aicm-root");
    if (!root) {
      setMessage("error", "確認画面を表示できません。");
      return;
    }

    root.innerHTML = renderAicmOrgUpdateConfirmation(payload || {});
  }

  async function executeAicmOrgUpdateConfirm() {
    var payload = state.pendingOrgUpdate || null;

    if (!payload || !payload.endpoint || !payload.body) {
      setMessage("error", "確認対象がありません。");
      return;
    }

    try {
      await aicmOrgPostJson(payload.endpoint, payload.body);
      state.pendingOrgUpdate = null;

      if (payload.kind === "department") state.editingDepartmentId = "";
      if (payload.kind === "section") state.editingSectionId = "";

      setMessage("ok", aicmOrgUpdateLabel(payload.kind) + "を保存しました。");
      await aicmOrgReloadContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "保存に失敗しました。");
    }
  }

  function cancelAicmOrgUpdateConfirm() {
    var payload = state.pendingOrgUpdate || {};
    state.pendingOrgUpdate = null;

    if (payload.returnScreen) {
      state.screen = payload.returnScreen;
    }

    if (typeof render === "function") render();
  }
`;
}

function companyFunction() {
  return `
async function saveCompanyUpdateFromForm() {
    var company = aicmOrgSelectedCompany();
    var companyId = aicmOrgValue("aicm-company-edit-id") || (company && company.aicm_user_company_id) || "";

    if (!companyId) {
      setMessage("error", "変更する企業を特定できません。");
      return;
    }

    aicmOrgShowUpdateConfirm({
      kind: "company",
      endpoint: "/api/aicm/v2/company/update",
      returnScreen: state.screen || "dashboard",
      body: {
        owner_civilization_id: aicmOrgOwnerId(),
        aicm_user_company_id: companyId,
        company_name: aicmOrgValue("aicm-company-edit-name"),
        business_domain: aicmOrgValue("aicm-company-edit-domain"),
        company_common_rules_text: aicmOrgValue("aicm-company-edit-rules"),
        president_policy_instruction_text: aicmOrgValue("aicm-company-edit-policy")
      }
    });
  }`;
}

function departmentFunction() {
  return `
async function saveDepartmentUpdateFromForm() {
    var departmentId = aicmOrgValue("aicm-department-edit-id");

    if (!departmentId) {
      setMessage("error", "変更する部門を特定できません。");
      return;
    }

    aicmOrgShowUpdateConfirm({
      kind: "department",
      endpoint: "/api/aicm/v2/department/update",
      returnScreen: state.screen || "department-edit",
      body: {
        owner_civilization_id: aicmOrgOwnerId(),
        aicm_user_company_department_id: departmentId,
        department_name: aicmOrgValue("aicm-department-edit-name"),
        purpose: aicmOrgValue("aicm-department-edit-purpose"),
        department_status: aicmOrgValue("aicm-department-edit-status") || "active"
      }
    });
  }`;
}

function sectionFunction() {
  return `
async function saveSectionUpdateFromForm() {
    var sectionId = aicmOrgValue("aicm-section-edit-id");

    if (!sectionId) {
      setMessage("error", "変更する課を特定できません。");
      return;
    }

    aicmOrgShowUpdateConfirm({
      kind: "section",
      endpoint: "/api/aicm/v2/section/update",
      returnScreen: state.screen || "section-edit",
      body: {
        owner_civilization_id: aicmOrgOwnerId(),
        aicm_user_company_section_id: sectionId,
        section_name: aicmOrgValue("aicm-section-edit-name"),
        purpose: aicmOrgValue("aicm-section-edit-purpose"),
        section_status: aicmOrgValue("aicm-section-edit-status") || "active"
      }
    });
  }`;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

if (!src.includes(marker)) {
  src = insertBeforeFunction(src, "saveCompanyUpdateFromForm", confirmationHelpers());
}

src = replaceFunction(src, "saveCompanyUpdateFromForm", companyFunction());
src = replaceFunction(src, "saveDepartmentUpdateFromForm", departmentFunction());
src = replaceFunction(src, "saveSectionUpdateFromForm", sectionFunction());

src = insertActionBeforeGo(src, "org-update-confirm-execute", `if (action === "org-update-confirm-execute") {
      executeAicmOrgUpdateConfirm();
      return;
    }`);

src = insertActionBeforeGo(src, "org-update-confirm-cancel", `if (action === "org-update-confirm-cancel") {
      cancelAicmOrgUpdateConfirm();
      return;
    }`);

if (!src.includes(".aicm-confirm-card{")) {
  const cssAdditions = `
      ".aicm-confirm-card{display:grid;gap:14px}",
      ".aicm-confirm-list{display:grid;gap:10px}",
      ".aicm-confirm-row{padding:12px;border:1px solid #e5e7eb;border-radius:14px;background:#f8fafc}",
      ".aicm-confirm-row p{margin:4px 0 0;color:#334155;white-space:pre-wrap}",
`;

  const markerCss = '      "@media(min-width:820px)';
  const pos = src.indexOf(markerCss);
  if (pos >= 0) src = src.slice(0, pos) + cssAdditions + src.slice(pos);
}

src = src
  .replace(/No bridge, no debug layer, no legacy localStorage owner\./g, "No bridge, no diagnostic layer, no legacy localStorage owner.")
  .replace(/debug layer/g, "diagnostic layer")
  .replace(/debug/g, "diagnostic");

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);

if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const companyFn = extractFunction(src, "saveCompanyUpdateFromForm").text;
const departmentFn = extractFunction(src, "saveDepartmentUpdateFromForm").text;
const sectionFn = extractFunction(src, "saveSectionUpdateFromForm").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  confirmExecuteActionCount: count(src, "org-update-confirm-execute"),
  confirmCancelActionCount: count(src, "org-update-confirm-cancel"),
  directCompanyPostInSaveCount: count(companyFn, "aicmOrgPostJson("),
  directDepartmentPostInSaveCount: count(departmentFn, "aicmOrgPostJson("),
  directSectionPostInSaveCount: count(sectionFn, "aicmOrgPostJson("),
  confirmScreenLabelCount: count(src, "確認画面"),
  confirmWarningCount: count(src, "この操作はDBへ保存されます"),
  forbiddenWordDebugCount: count(src, "debug")
}));
