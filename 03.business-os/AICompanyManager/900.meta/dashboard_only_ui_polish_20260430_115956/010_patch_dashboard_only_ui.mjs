import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

function replaceFunction(source, functionName, replacement) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) {
    throw new Error("Function not found: " + functionName);
  }

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) {
    throw new Error("Opening brace not found: " + functionName);
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
      if (ch === quote) {
        quote = "";
      }
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

const newRenderDashboard = `
function renderDashboard() {
    var company = selectedCompany();
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    var sections = departments.reduce(function (acc, department) {
      return acc.concat(departmentSections(department.aicm_user_company_department_id));
    }, []);
    var placements = company ? companyPlacements(company.aicm_user_company_id) : [];
    var robotCount = state.context.robotCatalog.length;

    return renderShell([
      '<section class="aicm-dashboard-hero">',
      '  <div>',
      '    <p class="aicm-eyebrow">AICompanyManager</p>',
      '    <h2>AI企業ダッシュボード</h2>',
      '    <p class="aicm-hero-copy">会社、部門、課、AIワーカー配置をv2正本で管理します。</p>',
      '  </div>',
      '  <div class="aicm-hero-actions">',
      '    <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '    <button type="button" data-core-action="reload">再読込</button>',
      '  </div>',
      '</section>',

      '<section class="aicm-dashboard-grid aicm-dashboard-grid-4">',
      metricCard("AI企業", state.context.companies.length, "登録済み会社"),
      metricCard("部門", departments.length, company ? "選択会社配下" : "会社未選択"),
      metricCard("課", sections.length, company ? "選択会社配下" : "会社未選択"),
      metricCard("候補ロボット", robotCount, "AIWorker catalog"),
      '</section>',

      '<section class="aicm-dashboard-grid aicm-dashboard-grid-main">',
      '  <div class="aicm-core-card aicm-card-primary">',
      '    <div class="aicm-card-title-row">',
      '      <div>',
      '        <p class="aicm-eyebrow">Company selector</p>',
      '        <h3>AI企業選択</h3>',
      '      </div>',
      '      <button type="button" data-core-action="reload">AI企業を表示</button>',
      '    </div>',
      renderCompanySelect(),
      company ? '<p class="aicm-selected-note">選択中: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択または新規作成してください。</p>',
      '  </div>',

      '  <div class="aicm-core-card">',
      '    <p class="aicm-eyebrow">Company overview</p>',
      '    <h3>会社概要</h3>',
      company ? renderCompanyOverview(company, departments, sections, placements) : renderNoCompanyCard(),
      '  </div>',
      '</section>',

      '<section class="aicm-dashboard-grid aicm-dashboard-grid-main">',
      '  <div class="aicm-core-card">',
      '    <div class="aicm-card-title-row">',
      '      <div>',
      '        <p class="aicm-eyebrow">Organization tree</p>',
      '        <h3>部門 / 課</h3>',
      '      </div>',
      '      <button type="button" data-core-action="go" data-screen="department-new">部門追加</button>',
      '    </div>',
      renderTree(departments),
      '  </div>',

      '  <div class="aicm-core-card">',
      '    <p class="aicm-eyebrow">Quick actions</p>',
      '    <h3>操作</h3>',
      renderQuickActions(company, departments),
      '  </div>',
      '</section>'
    ].join(""));
  }`;

const helperFunctions = `
function metricCard(label, value, caption) {
    return [
      '<div class="aicm-metric-card">',
      '  <p>' + escapeHtml(label) + '</p>',
      '  <strong>' + escapeHtml(value) + '</strong>',
      '  <span>' + escapeHtml(caption) + '</span>',
      '</div>'
    ].join("");
  }

  function renderCompanyOverview(company, departments, sections, placements) {
    return [
      '<div class="aicm-overview-block">',
      '  <div class="aicm-overview-main">',
      '    <strong>' + escapeHtml(company.company_name) + '</strong>',
      '    <span>' + escapeHtml(company.business_domain || "事業領域なし") + '</span>',
      '  </div>',
      '  <dl class="aicm-overview-list">',
      '    <div><dt>会社ID</dt><dd>' + escapeHtml(company.aicm_user_company_id) + '</dd></div>',
      '    <div><dt>部門</dt><dd>' + departments.length + '件</dd></div>',
      '    <div><dt>課</dt><dd>' + sections.length + '件</dd></div>',
      '    <div><dt>Worker配置</dt><dd>' + placements.length + '件</dd></div>',
      '  </dl>',
      '</div>'
    ].join("");
  }

  function renderNoCompanyCard() {
    return [
      '<div class="aicm-empty-state">',
      '  <strong>AI企業が未選択です</strong>',
      '  <p>まずAI企業を作成すると、部門・課・Worker配置を登録できます。</p>',
      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加へ</button>',
      '</div>'
    ].join("");
  }

  function renderQuickActions(company, departments) {
    if (!company) {
      return [
        '<div class="aicm-action-list">',
        '  <button type="button" data-core-action="go" data-screen="company-new">AI企業を作成</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-action-list">',
      '  <button type="button" data-core-action="go" data-screen="company-new">AI企業新規追加</button>',
      '  <button type="button" data-core-action="go" data-screen="department-new">部門追加</button>',
      departments.length > 0 ? '  <button type="button" data-core-action="go" data-screen="section-new">課追加</button>' : '  <button type="button" data-core-action="go" data-screen="department-new">先に部門を追加</button>',
      '  <button type="button" data-core-action="go" data-screen="placement-new">Worker配置</button>',
      '</div>',
      '<p class="aicm-core-empty">編集・削除は次工程で追加します。</p>'
    ].join("");
  }
`;

const newRenderTree = `
function renderTree(departments) {
    if (departments.length === 0) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がまだありません</strong>',
        '  <p>選択中のAI企業に部門を追加すると、ここに階層表示されます。</p>',
        '  <button type="button" data-core-action="go" data-screen="department-new">部門追加へ</button>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-org-tree">',
      departments.map(function (department) {
        var sections = departmentSections(department.aicm_user_company_department_id);
        return [
          '<article class="aicm-org-node">',
          '  <div class="aicm-org-node-head">',
          '    <span class="aicm-node-badge">部門</span>',
          '    <strong>' + escapeHtml(department.department_name) + '</strong>',
          '  </div>',
          department.purpose ? '<p>' + escapeHtml(department.purpose) + '</p>' : '<p class="aicm-core-empty">目的未設定</p>',
          sections.length === 0 ? '<div class="aicm-section-empty">課なし</div>' : [
            '  <ul class="aicm-section-list">',
            sections.map(function (section) {
              return [
                '<li>',
                '  <span class="aicm-node-badge aicm-node-badge-section">課</span>',
                '  <strong>' + escapeHtml(section.section_name) + '</strong>',
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

const newInjectMinimalCss = `
function injectMinimalCss() {
    if (document.getElementById("aicm-production-core-css")) return;

    var style = document.createElement("style");
    style.id = "aicm-production-core-css";
    style.textContent = [
      ".aicm-core{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:1180px;margin:0 auto;padding:20px;color:#172033;background:#f6f7fb;min-height:100vh}",
      ".aicm-core-header{padding:10px 0 14px}",
      ".aicm-core-header h1{font-size:30px;margin:0 0 6px;letter-spacing:-.03em}",
      ".aicm-core-subtitle{color:#687386;margin:0}",
      ".aicm-core-tabs{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 18px}",
      ".aicm-core button{border:1px solid #d8dee9;background:#eef2ff;border-radius:14px;padding:11px 15px;font-weight:800;color:#1f2a44;box-shadow:0 4px 10px rgba(31,42,68,.06)}",
      ".aicm-core button:hover{filter:brightness(.98)}",
      ".aicm-core-main h2{display:none}",
      ".aicm-core-card{background:#fff;border:1px solid #e6eaf2;border-radius:22px;padding:20px;margin:0;box-shadow:0 10px 24px rgba(15,23,42,.06)}",
      ".aicm-core-card h3{font-size:22px;margin:0 0 14px;letter-spacing:-.02em}",
      ".aicm-core label{display:block;font-weight:800;margin:12px 0 6px;color:#25324a}",
      ".aicm-core input,.aicm-core select,.aicm-core textarea{width:100%;box-sizing:border-box;border:1px solid #cfd6e4;border-radius:14px;padding:12px;font-size:16px;background:#fff}",
      ".aicm-core-message{border-radius:14px;padding:12px 14px;margin:12px 0;background:#f3f4f6}",
      ".aicm-core-message-ok{background:#ecfdf5;color:#047857}",
      ".aicm-core-message-error{background:#fef2f2;color:#b91c1c}",
      ".aicm-core-empty{color:#6b7280;margin:8px 0}",
      ".aicm-dashboard-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;background:linear-gradient(135deg,#ffffff,#eef4ff);border:1px solid #dfe7f5;border-radius:28px;padding:24px;margin:10px 0 16px;box-shadow:0 14px 30px rgba(15,23,42,.07)}",
      ".aicm-dashboard-hero h2{display:block;font-size:34px;margin:4px 0 8px;letter-spacing:-.04em}",
      ".aicm-hero-copy{margin:0;color:#5f6c80}",
      ".aicm-eyebrow{margin:0 0 6px;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}",
      ".aicm-hero-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}",
      ".aicm-dashboard-grid{display:grid;gap:14px;margin:14px 0}",
      ".aicm-dashboard-grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}",
      ".aicm-dashboard-grid-main{grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr)}",
      ".aicm-metric-card{background:#fff;border:1px solid #e6eaf2;border-radius:20px;padding:18px;box-shadow:0 8px 22px rgba(15,23,42,.05)}",
      ".aicm-metric-card p{margin:0;color:#64748b;font-weight:800}",
      ".aicm-metric-card strong{display:block;font-size:30px;margin:8px 0 4px;letter-spacing:-.04em}",
      ".aicm-metric-card span{color:#7b8798;font-size:13px}",
      ".aicm-card-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}",
      ".aicm-selected-note{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:10px 12px;margin:12px 0 0}",
      ".aicm-overview-block{display:grid;gap:16px}",
      ".aicm-overview-main strong{display:block;font-size:24px;letter-spacing:-.03em}",
      ".aicm-overview-main span{color:#5f6c80}",
      ".aicm-overview-list{display:grid;gap:10px;margin:0}",
      ".aicm-overview-list div{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:10px 12px}",
      ".aicm-overview-list dt{font-size:12px;color:#64748b;font-weight:900}",
      ".aicm-overview-list dd{margin:4px 0 0;word-break:break-all}",
      ".aicm-empty-state{border:1px dashed #cbd5e1;background:#f8fafc;border-radius:18px;padding:18px}",
      ".aicm-empty-state strong{display:block;font-size:18px;margin-bottom:6px}",
      ".aicm-action-list{display:grid;gap:10px}",
      ".aicm-action-list button{width:100%;text-align:left;background:#f8fafc}",
      ".aicm-org-tree{display:grid;gap:12px}",
      ".aicm-org-node{border:1px solid #edf2f7;background:#fbfdff;border-radius:18px;padding:14px}",
      ".aicm-org-node-head{display:flex;align-items:center;gap:8px}",
      ".aicm-org-node-head strong{font-size:18px}",
      ".aicm-node-badge{display:inline-flex;align-items:center;border-radius:999px;background:#e0ecff;color:#1d4ed8;font-size:12px;font-weight:900;padding:4px 8px}",
      ".aicm-node-badge-section{background:#ecfdf5;color:#047857}",
      ".aicm-section-list{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:8px}",
      ".aicm-section-list li{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:center;background:#fff;border:1px solid #edf2f7;border-radius:14px;padding:10px}",
      ".aicm-section-list small{grid-column:2;color:#6b7280}",
      ".aicm-section-empty{margin-top:10px;color:#94a3b8;border:1px dashed #dbe3ef;border-radius:12px;padding:10px}",
      ".aicm-core-tree-node{padding:12px;border-left:4px solid #dbeafe;margin:10px 0;background:#f8fafc;border-radius:12px}",
      "@media(max-width:860px){.aicm-dashboard-hero{align-items:flex-start;flex-direction:column}.aicm-dashboard-grid-4,.aicm-dashboard-grid-main{grid-template-columns:1fr}.aicm-hero-actions{justify-content:flex-start}.aicm-card-title-row{flex-direction:column}}"
    ].join("\\n");
    document.head.appendChild(style);
  }`;

src = replaceFunction(src, "renderDashboard", newRenderDashboard);

if (!src.includes("function metricCard(")) {
  const marker = "function renderTree(";
  const pos = src.indexOf(marker);
  if (pos < 0) {
    throw new Error("Could not locate renderTree insertion point");
  }
  src = src.slice(0, pos) + helperFunctions + "\n\n  " + src.slice(pos);
}

src = replaceFunction(src, "renderTree", newRenderTree);
src = replaceFunction(src, "injectMinimalCss", newInjectMinimalCss);

fs.writeFileSync(file, src);
console.log("dashboard-only UI polish patched");
