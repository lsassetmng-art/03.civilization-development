import fs from "node:fs";
import crypto from "node:crypto";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const marker = "AICM_DASHBOARD_COMPANY_OVERVIEW_ASO_ASR_V1";

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

function replaceFunction(source, functionName, replacementText) {
  if (functionName === "renderShell") {
    throw new Error("STOP: renderShell replacement prohibited");
  }

  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacementText + source.slice(fn.end);
}

function insertBeforeFunction(source, functionName, insertion) {
  if (source.includes(marker)) return source;

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

  if (ifPos < 0 || braceStart < 0) {
    throw new Error("Action block malformed: " + action);
  }

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

  throw new Error("Action block end not found: " + action);
}

function insertActionBeforeGo(source, action, blockText) {
  if (source.includes(`action === "${action}"`)) return source;

  const goBlock = findActionBlockByAction(source, "go");
  if (!goBlock) throw new Error("go action anchor not found");

  return source.slice(0, goBlock.start) + blockText + "\n\n    " + source.slice(goBlock.start);
}

function makeOverviewFunction() {
  return `
function renderCompanyOverview() {
    var company = null;

    if (typeof selectedCompany === "function") {
      company = selectedCompany();
    }

    if (!company && typeof aicmOrgSelectedCompany === "function") {
      company = aicmOrgSelectedCompany();
    }

    if (!company) {
      return [
        '<div class="aicm-core-card">',
        '  <p class="aicm-eyebrow">会社概要</p>',
        '  <h2>会社概要</h2>',
        '  <div class="aicm-empty-state">',
        '    <strong>AI企業が未選択です</strong>',
        '    <p>AI企業を選択すると、部門・課・Worker配置の概要を確認できます。</p>',
        '    <div class="aicm-dashboard-action-row">',
        '      <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join("");
    }

    var companyId = company.aicm_user_company_id || "";
    var departments = typeof aicmOrgDepartmentsForCompany === "function" ? aicmOrgDepartmentsForCompany(companyId) : [];
    var sections = typeof aicmOrgSectionsForCompany === "function" ? aicmOrgSectionsForCompany(companyId) : [];
    var ctx = typeof aicmOrgCtx === "function" ? aicmOrgCtx() : (state.context || state || {});
    var placements = Array.isArray(ctx.placements) ? ctx.placements.filter(function (row) {
      return row.aicm_user_company_id === companyId;
    }) : [];

    return [
      '<div class="aicm-core-card">',
      '  <p class="aicm-eyebrow">会社概要</p>',
      '  <h2>' + escapeHtml(company.company_name || "AI企業") + '</h2>',
      company.business_domain ? '  <p class="aicm-selected-note">' + escapeHtml(company.business_domain) + '</p>' : '',
      '  <div class="aicm-company-overview-stats">',
      '    <div class="aicm-company-overview-stat"><span>部門</span><strong>' + String(departments.length) + '件</strong></div>',
      '    <div class="aicm-company-overview-stat"><span>課</span><strong>' + String(sections.length) + '件</strong></div>',
      '    <div class="aicm-company-overview-stat"><span>Worker配置</span><strong>' + String(placements.length) + '件</strong></div>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="company-edit">AI企業変更</button>',
      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '  </div>',
      '</div>'
    ].join("");
  }`;
}

function makeCompanyEditRenderer() {
  return `
// ${marker}
// Dashboard company overview must return only a card fragment.
// Company update uses this dedicated screen renderer.

function renderCompanyEditPlaceholder() {
    return renderAicmCompanyUpdateScreen();
  }`;
}

function patchCompanyRoute(source) {
  let after = source;

  after = after.replace(
    /(case\s+["']company-(?:edit|change|update)["']\s*:\s*return\s+)renderCompanyOverview\(\)/g,
    "$1renderCompanyEditPlaceholder()"
  );

  after = after.replace(
    /(screen\s*===\s*["']company-(?:edit|change|update)["'][\\s\\S]{0,260}?return\s+)renderCompanyOverview\(\)/g,
    "$1renderCompanyEditPlaceholder()"
  );

  after = after.replace(
    /(state\.screen\s*===\s*["']company-(?:edit|change|update)["'][\\s\\S]{0,260}?return\s+)renderCompanyOverview\(\)/g,
    "$1renderCompanyEditPlaceholder()"
  );

  return after;
}

const renderShellBeforeHash = hashText(extractFunction(src, "renderShell").text);

src = replaceFunction(src, "renderCompanyOverview", makeOverviewFunction());

if (!src.includes("function renderCompanyEditPlaceholder(")) {
  src = insertBeforeFunction(src, "renderCompanyOverview", makeCompanyEditRenderer());
}

src = patchCompanyRoute(src);

src = insertActionBeforeGo(src, "company-edit-open", `if (action === "company-edit-open") {
      state.screen = "company-edit";
      if (typeof render === "function") render();
      return;
    }`);

if (!src.includes(".aicm-company-overview-stats{")) {
  const cssAdditions = `
      ".aicm-company-overview-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}",
      ".aicm-company-overview-stat{padding:12px;border:1px solid #e5e7eb;border-radius:14px;background:#f8fafc}",
      ".aicm-company-overview-stat span{display:block;color:#64748b;font-size:13px;font-weight:700}",
      ".aicm-company-overview-stat strong{display:block;margin-top:4px;font-size:20px}",
`;

  const markerCss = '      "@media(min-width:820px)';
  const pos = src.indexOf(markerCss);
  if (pos >= 0) {
    src = src.slice(0, pos) + cssAdditions + src.slice(pos);
  }
}

const renderShellAfterHash = hashText(extractFunction(src, "renderShell").text);

if (renderShellBeforeHash !== renderShellAfterHash) {
  throw new Error("STOP: renderShell changed unexpectedly");
}

fs.writeFileSync(file, src);

const overview = extractFunction(src, "renderCompanyOverview").text;
const edit = extractFunction(src, "renderCompanyEditPlaceholder").text;

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  renderShellChanged: false,
  overviewHasCompanySummaryLabel: overview.includes("会社概要"),
  overviewCallsRenderShellCount: count(overview, "renderShell("),
  overviewToUpdateCount: count(overview, "renderAicmCompanyUpdateScreen"),
  companyEditRendererCount: count(src, "function renderCompanyEditPlaceholder("),
  companyEditCallsUpdateCount: count(edit, "renderAicmCompanyUpdateScreen"),
  nestedShellRiskCount: count(overview, "AI企業運営アプリ")
}));
