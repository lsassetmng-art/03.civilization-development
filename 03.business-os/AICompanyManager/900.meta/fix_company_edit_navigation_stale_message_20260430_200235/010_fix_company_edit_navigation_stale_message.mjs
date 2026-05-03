import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const marker = "AICM_COMPANY_EDIT_NAV_STALE_MESSAGE_ASS_ASV_V1";

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
        return {
          start,
          end: i + 1,
          text: source.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function insertBeforeFunction(source, functionName, insertion) {
  if (source.includes(marker)) return source;

  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("Insertion anchor not found: " + functionName);

  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

function findRenderFunction(source) {
  const rootWrite = "root.innerHTML = html";
  const rootPos = source.indexOf(rootWrite);
  if (rootPos < 0) throw new Error("root.innerHTML = html anchor not found");

  const before = source.slice(0, rootPos);
  const re = /function\s+([A-Za-z0-9_]+)\s*\(/g;
  let match;
  let last = null;

  while ((match = re.exec(before))) {
    last = match[1];
  }

  if (!last) throw new Error("render function not detected");
  return last;
}

function replaceFunction(source, functionName, replacement) {
  if (functionName === "renderShell") throw new Error("STOP: renderShell replacement prohibited");
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function patchRenderFunction(source) {
  const renderName = findRenderFunction(source);
  const original = extractFunction(source, renderName).text;

  if (original.includes("AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV")) {
    return { source, renderName, changed: false };
  }

  const needle = "root.innerHTML = html;";
  const idx = original.indexOf(needle);
  if (idx < 0) throw new Error("root.innerHTML assignment not found in render function");

  const injection = `
    // AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV
    if (
      state &&
      (
        state.screen === "company-edit" ||
        state.screen === "company-change" ||
        state.screen === "company-update"
      )
    ) {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      html = renderCompanyEditPlaceholder();
    }

`;

  const patched = original.slice(0, idx) + injection + original.slice(idx);
  return { source: replaceFunction(source, renderName, patched), renderName, changed: true };
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

function patchGoBlock(source) {
  const block = findActionBlockByAction(source, "go");
  if (!block) throw new Error("go action block not found");

  if (block.text.includes("AICM_CLEAR_TRANSIENT_ON_GO_ASS_ASV")) return source;

  const brace = block.text.indexOf("{");
  const injection = `
      // AICM_CLEAR_TRANSIENT_ON_GO_ASS_ASV
      if (typeof aicmClearTransientMessage === "function") {
        var nextScreenForMessageClear = "";
        try {
          nextScreenForMessageClear = target && target.getAttribute ? String(target.getAttribute("data-screen") || "") : "";
        } catch (_) {
          nextScreenForMessageClear = "";
        }

        if (
          nextScreenForMessageClear === "company-edit" ||
          nextScreenForMessageClear === "company-change" ||
          nextScreenForMessageClear === "company-update" ||
          nextScreenForMessageClear === "department-edit" ||
          nextScreenForMessageClear === "section-edit"
        ) {
          aicmClearTransientMessage();
        }
      }
`;

  const patchedBlock = block.text.slice(0, brace + 1) + injection + block.text.slice(brace + 1);
  return source.slice(0, block.start) + patchedBlock + source.slice(block.end);
}

function helpers() {
  return `
// ${marker}
// Navigation route safety for edit screens.
// DB write confirmation remains required before POST.

function aicmClearTransientMessage() {
    if (!state) return;

    state.message = "";
    state.messageText = "";
    state.message_type = "";
    state.messageType = "";
    state.statusMessage = "";
    state.toastMessage = "";
    state.errorMessage = "";
    state.successMessage = "";
  }
`;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

src = insertBeforeFunction(src, "renderCompanyEditPlaceholder", helpers());

if (!src.includes("function renderCompanyEditPlaceholder(")) {
  src = insertBeforeFunction(src, "renderCompanyOverview", `
function renderCompanyEditPlaceholder() {
    return renderAicmCompanyUpdateScreen();
  }
`);
}

let renderPatch = patchRenderFunction(src);
src = renderPatch.source;

src = insertActionBeforeGo(src, "company-edit-open", `if (action === "company-edit-open") {
      if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
      state.screen = "company-edit";
      if (typeof render === "function") render();
      return;
    }`);

src = patchGoBlock(src);

src = src.replace(
  /data-core-action="go" data-screen="company-edit">AI企業変更/g,
  'data-core-action="company-edit-open">AI企業変更'
);

src = src.replace(
  /data-core-action="go" data-screen="company-change">AI企業変更/g,
  'data-core-action="company-edit-open">AI企業変更'
);

src = src.replace(
  /data-core-action="go" data-screen="company-update">AI企業変更/g,
  'data-core-action="company-edit-open">AI企業変更'
);

src = src.replace(
  /state\.editingDepartmentId = \([^;]+;\n\s+if \(typeof render === "function"\) render\(\);/g,
  function (m) {
    if (m.includes("aicmClearTransientMessage")) return m;
    return m.replace('if (typeof render === "function") render();', 'if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();\n      if (typeof render === "function") render();');
  }
);

src = src.replace(
  /state\.editingSectionId = \([^;]+;\n\s+if \(typeof render === "function"\) render\(\);/g,
  function (m) {
    if (m.includes("aicmClearTransientMessage")) return m;
    return m.replace('if (typeof render === "function") render();', 'if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();\n      if (typeof render === "function") render();');
  }
);

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);
if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const renderFn = extractFunction(src, renderPatch.renderName).text;
const companyEditFn = extractFunction(src, "renderCompanyEditPlaceholder").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderName: renderPatch.renderName,
  renderShellChanged: false,
  companyEditRouteCount: count(renderFn, "AICM_COMPANY_EDIT_RENDER_ROUTE_ASS_ASV"),
  companyEditOpenActionCount: count(src, 'action === "company-edit-open"'),
  companyEditButtonCount: count(src, 'data-core-action="company-edit-open">AI企業変更'),
  clearHelperCount: count(src, "function aicmClearTransientMessage("),
  clearOnGoCount: count(src, "AICM_CLEAR_TRANSIENT_ON_GO_ASS_ASV"),
  companyEditRendererCount: count(src, "function renderCompanyEditPlaceholder("),
  companyEditCallsUpdateCount: count(companyEditFn, "renderAicmCompanyUpdateScreen"),
  confirmMarkerCount: count(src, "AICM_DB_WRITE_CONFIRMATION_REQUIRED_ARY_ASB_V1"),
  directCompanySavePostCount: count(extractFunction(src, "saveCompanyUpdateFromForm").text, "aicmOrgPostJson("),
  directDepartmentSavePostCount: count(extractFunction(src, "saveDepartmentUpdateFromForm").text, "aicmOrgPostJson("),
  directSectionSavePostCount: count(extractFunction(src, "saveSectionUpdateFromForm").text, "aicmOrgPostJson(")
}));
