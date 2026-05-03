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

const newRenderShell = `
function renderShell(content) {
    return [
      '<div class="aicm-core" data-core-mark="' + CORE_MARK + '">',
      '  <header class="aicm-core-header">',
      '    <h1>AI企業運営アプリ</h1>',
      '  </header>',
      '  <nav class="aicm-core-tabs" aria-label="AICompanyManager navigation">',
      '    <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボード</button>',
      '    <button type="button" data-core-action="go" data-screen="task-ledger">部門別タスク台帳</button>',
      '    <button type="button" data-core-action="go" data-screen="review-list">レビュー・承認待ち一覧</button>',
      '  </nav>',
      renderMessages(),
      '  <main class="aicm-core-main">',
      content,
      '  </main>',
      '</div>'
    ].join("");
  }`;

const newRenderDashboard = `
function renderDashboard() {
    var company = selectedCompany();
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    var sections = departments.reduce(function (acc, department) {
      return acc.concat(departmentSections(department.aicm_user_company_department_id));
    }, []);
    var placements = company ? companyPlacements(company.aicm_user_company_id) : [];

    return renderShell([
      '<section class="aicm-dashboard-grid aicm-dashboard-main-grid">',
      '  <div class="aicm-core-card aicm-card-primary">',
      '    <div class="aicm-card-title-row">',
      '      <div>',
      '        <p class="aicm-eyebrow">AI企業</p>',
      '        <h2>AI企業選択</h2>',
      '      </div>',
      '      <button type="button" data-core-action="reload">AI企業を表示</button>',
      '    </div>',
      renderCompanySelect(),
      company ? '<p class="aicm-selected-note">選択中: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  </div>',

      '  <div class="aicm-core-card">',
      '    <p class="aicm-eyebrow">会社概要</p>',
      '    <h2>会社概要</h2>',
      company ? renderCompanyOverview(company, departments, sections, placements) : renderNoCompanyCard(),
      '  </div>',
      '</section>',

      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門 / 課</p>',
      '  <h2>部門 / 課</h2>',
      renderTree(departments),
      '</section>'
    ].join(""));
  }`;

const extraScreens = `
function renderTaskLedgerPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      '  <p class="aicm-core-empty">この画面は次工程で clean core に接続します。</p>',
      '</section>'
    ].join(""));
  }

  function renderReviewListPlaceholder() {
    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">レビュー・承認待ち一覧</p>',
      '  <h2>レビュー・承認待ち一覧</h2>',
      '  <p class="aicm-core-empty">この画面は次工程で clean core に接続します。</p>',
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
    } else if (state.screen === "task-ledger") {
      html = renderTaskLedgerPlaceholder();
    } else if (state.screen === "review-list") {
      html = renderReviewListPlaceholder();
    } else {
      html = renderDashboard();
    }

    root.innerHTML = html;
  }`;

const newInjectMinimalCss = `
function injectMinimalCss() {
    if (document.getElementById("aicm-production-core-css")) return;

    var style = document.createElement("style");
    style.id = "aicm-production-core-css";
    style.textContent = [
      ".aicm-core{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:980px;margin:0 auto;padding:20px;color:#172033;background:#f6f7fb;min-height:100vh}",
      ".aicm-core-header{padding:10px 0 18px}",
      ".aicm-core-header h1{font-size:32px;margin:0;letter-spacing:-.04em}",
      ".aicm-core-tabs{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 22px}",
      ".aicm-core button{border:1px solid #d8dee9;background:#eef2ff;border-radius:14px;padding:11px 15px;font-weight:800;color:#1f2a44;box-shadow:0 4px 10px rgba(31,42,68,.06)}",
      ".aicm-core-main{display:grid;gap:16px}",
      ".aicm-core-card{background:#fff;border:1px solid #e6eaf2;border-radius:22px;padding:20px;box-shadow:0 10px 24px rgba(15,23,42,.06)}",
      ".aicm-core-card h2{font-size:26px;margin:0 0 14px;letter-spacing:-.03em}",
      ".aicm-core label{display:block;font-weight:800;margin:12px 0 6px;color:#25324a}",
      ".aicm-core input,.aicm-core select,.aicm-core textarea{width:100%;box-sizing:border-box;border:1px solid #cfd6e4;border-radius:14px;padding:12px;font-size:16px;background:#fff}",
      ".aicm-core-message{border-radius:14px;padding:12px 14px;margin:12px 0;background:#f3f4f6}",
      ".aicm-core-message-ok{background:#ecfdf5;color:#047857}",
      ".aicm-core-message-error{background:#fef2f2;color:#b91c1c}",
      ".aicm-core-empty{color:#6b7280;margin:8px 0}",
      ".aicm-dashboard-grid{display:grid;gap:16px}",
      ".aicm-dashboard-main-grid{grid-template-columns:minmax(0,1fr)}",
      ".aicm-card-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}",
      ".aicm-eyebrow{margin:0 0 6px;color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}",
      ".aicm-selected-note{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:10px 12px;margin:12px 0 0}",
      ".aicm-overview-block{display:grid;gap:14px}",
      ".aicm-overview-main strong{display:block;font-size:22px;letter-spacing:-.03em}",
      ".aicm-overview-main span{color:#5f6c80}",
      ".aicm-overview-list{display:grid;gap:10px;margin:0}",
      ".aicm-overview-list div{background:#f8fafc;border:1px solid #edf2f7;border-radius:14px;padding:10px 12px}",
      ".aicm-overview-list dt{font-size:12px;color:#64748b;font-weight:900}",
      ".aicm-overview-list dd{margin:4px 0 0;word-break:break-all}",
      ".aicm-empty-state{border:1px dashed #cbd5e1;background:#f8fafc;border-radius:18px;padding:18px}",
      ".aicm-empty-state strong{display:block;font-size:18px;margin-bottom:6px}",
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
      "@media(min-width:820px){.aicm-dashboard-main-grid{grid-template-columns:minmax(0,1fr) minmax(320px,.75fr)}}",
      "@media(max-width:720px){.aicm-core{padding:18px}.aicm-core-header h1{font-size:30px}.aicm-card-title-row{flex-direction:column}.aicm-core-tabs button{flex:1 1 auto}}"
    ].join("\\n");
    document.head.appendChild(style);
  }`;

src = replaceFunction(src, "renderShell", newRenderShell);
src = replaceFunction(src, "renderDashboard", newRenderDashboard);

if (!src.includes("function renderTaskLedgerPlaceholder(")) {
  const pos = src.indexOf("function render()");
  if (pos < 0) throw new Error("render insertion point not found");
  src = src.slice(0, pos) + extraScreens + "\n\n  " + src.slice(pos);
}

src = replaceFunction(src, "render", newRender);
src = replaceFunction(src, "injectMinimalCss", newInjectMinimalCss);

fs.writeFileSync(file, src);
console.log("production dashboard menu correction patched");
