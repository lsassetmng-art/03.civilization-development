import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

function replaceFunction(source, functionName, replacement) {
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
        return source.slice(0, start) + replacement + source.slice(i + 1);
      }
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const newRenderCompanyOverview = `
function renderCompanyOverview(company, departments, sections, placements) {
    return [
      '<div class="aicm-overview-block">',
      '  <div class="aicm-overview-main">',
      '    <strong>' + escapeHtml(company.company_name) + '</strong>',
      '    <span>' + escapeHtml(company.business_domain || "事業領域なし") + '</span>',
      '  </div>',
      '  <div class="aicm-overview-count-row">',
      '    <div><dt>部門</dt><dd>' + departments.length + '件</dd></div>',
      '    <div><dt>課</dt><dd>' + sections.length + '件</dd></div>',
      '    <div><dt>Worker配置</dt><dd>' + placements.length + '件</dd></div>',
      '  </div>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="go" data-screen="settings">AI企業変更</button>',
      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '  </div>',
      '</div>'
    ].join("");
  }`;

const newRenderTree = `
function renderTree(departments) {
    if (departments.length === 0) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がまだありません</strong>',
        '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
        '  <div class="aicm-dashboard-action-row">',
        '    <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
        '  </div>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-tree-toolbar">',
      '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加</button>',
      '  <button type="button" data-core-action="go" data-screen="department-edit">部門変更</button>',
      '  <button type="button" data-core-action="go" data-screen="section-new">課新規追加</button>',
      '  <button type="button" data-core-action="go" data-screen="section-edit">課変更</button>',
      '</div>',
      '<div class="aicm-org-tree">',
      departments.map(function (department) {
        var sections = departmentSections(department.aicm_user_company_department_id);
        return [
          '<article class="aicm-org-node">',
          '  <div class="aicm-org-node-head">',
          '    <span class="aicm-node-badge">部門</span>',
          '    <strong>' + escapeHtml(department.department_name) + '</strong>',
          '    <button type="button" data-core-action="go" data-screen="department-edit">変更</button>',
          '  </div>',
          department.purpose ? '<p>' + escapeHtml(department.purpose) + '</p>' : '<p class="aicm-core-empty">目的未設定</p>',
          sections.length === 0 ? '<div class="aicm-section-empty">課なし</div>' : [
            '  <ul class="aicm-section-list">',
            sections.map(function (section) {
              return [
                '<li>',
                '  <span class="aicm-node-badge aicm-node-badge-section">課</span>',
                '  <strong>' + escapeHtml(section.section_name) + '</strong>',
                '  <button type="button" data-core-action="go" data-screen="section-edit">変更</button>',
                section.purpose ? '<small>' + escapeHtml(section.purpose) + '</small>' : '',
                '</li>'
              ].join("");
            }).join(""),
            '  </ul>'
          ].join(""),
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }`;

const extraEditScreens = `
function renderDepartmentEditPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門変更</p>',
      '  <h2>部門変更</h2>',
      '  <p class="aicm-core-empty">部門変更は次工程で保存処理を接続します。</p>',
      '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ戻る</button>',
      '</section>'
    ].join(""));
  }

  function renderSectionEditPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">課変更</p>',
      '  <h2>課変更</h2>',
      '  <p class="aicm-core-empty">課変更は次工程で保存処理を接続します。</p>',
      '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ戻る</button>',
      '</section>'
    ].join(""));
  }
`;

const newRender = `
function render() {
    if (!root) return;

    var html = "";

    if (state.screen === "company-new") {
      html = renderCompanyNew();
    } else if (state.screen === "department-new") {
      html = renderDepartmentNew();
    } else if (state.screen === "section-new") {
      html = renderSectionNew();
    } else if (state.screen === "placement-new") {
      html = renderPlacementNew();
    } else if (state.screen === "settings") {
      html = renderSettings();
    } else if (state.screen === "department-edit") {
      html = renderDepartmentEditPlaceholder();
    } else if (state.screen === "section-edit") {
      html = renderSectionEditPlaceholder();
    } else if (state.screen === "task-ledger") {
      html = renderTaskLedgerPlaceholder();
    } else if (state.screen === "review-list") {
      html = renderReviewListPlaceholder();
    } else {
      html = renderDashboard();
    }

    root.innerHTML = html;
  }`;

const cssAdditions = `
      ".aicm-overview-count-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}",
      ".aicm-overview-count-row div{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:12px}",
      ".aicm-overview-count-row dt{font-size:12px;color:#64748b;font-weight:900}",
      ".aicm-overview-count-row dd{font-size:22px;font-weight:900;margin:4px 0 0}",
      ".aicm-dashboard-action-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}",
      ".aicm-tree-toolbar{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 14px}",
      ".aicm-org-node-head button,.aicm-section-list button{margin-left:auto;padding:7px 10px;border-radius:10px;font-size:13px}",
      "@media(max-width:520px){.aicm-overview-count-row{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.aicm-overview-count-row div{padding:10px 8px}.aicm-overview-count-row dd{font-size:18px}.aicm-dashboard-action-row button,.aicm-tree-toolbar button{flex:1 1 44%}}",
`;

function addCssBeforeMedia(source) {
  if (source.includes(".aicm-overview-count-row{")) return source;
  const marker = '      "@media(min-width:820px)';
  const pos = source.indexOf(marker);
  if (pos < 0) throw new Error("CSS insertion marker not found");
  return source.slice(0, pos) + cssAdditions + source.slice(pos);
}

src = replaceFunction(src, "renderCompanyOverview", newRenderCompanyOverview);
src = replaceFunction(src, "renderTree", newRenderTree);

if (!src.includes("function renderDepartmentEditPlaceholder(")) {
  const pos = src.indexOf("function render()");
  if (pos < 0) throw new Error("render insertion point not found");
  src = src.slice(0, pos) + extraEditScreens + "\n\n  " + src.slice(pos);
}

src = replaceFunction(src, "render", newRender);
src = addCssBeforeMedia(src);

fs.writeFileSync(file, src);
console.log("dashboard overview/action correction patched");
