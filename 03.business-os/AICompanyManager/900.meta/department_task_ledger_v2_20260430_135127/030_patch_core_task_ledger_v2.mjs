import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

function replaceFunction(source, functionName, replacement) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
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
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const ledgerHelpers = `
function taskLedgerRows(companyId) {
    var rows = [];

    if (state.context && Array.isArray(state.context.taskLedger)) {
      rows = state.context.taskLedger;
    } else if (state.context && Array.isArray(state.context.task_ledger)) {
      rows = state.context.task_ledger;
    }

    if (!companyId) return rows;

    return rows.filter(function (row) {
      return String(row.aicm_user_company_id || "") === String(companyId || "");
    });
  }

  function sectionsForDepartment(departmentId) {
    return state.context.sections.filter(function (section) {
      return String(section.aicm_user_company_department_id || "") === String(departmentId || "");
    });
  }

  function firstDepartmentId(company) {
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    return departments.length ? departments[0].aicm_user_company_department_id : "";
  }

  function renderTaskLedgerRows(rows) {
    if (!rows.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>台帳行がまだありません</strong>',
        '  <p>部門を選び、成果物名と作業名を入力して追加してください。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-ledger-list">',
      rows.map(function (row) {
        return [
          '<article class="aicm-ledger-row">',
          '  <div class="aicm-ledger-row-head">',
          '    <span class="aicm-node-badge">' + escapeHtml(row.priority_code || "normal") + '</span>',
          '    <strong>' + escapeHtml(row.deliverable_name || "") + '</strong>',
          '    <em>' + escapeHtml(row.task_status_code || "todo") + '</em>',
          '  </div>',
          '  <p>' + escapeHtml(row.task_name || "") + '</p>',
          '  <dl class="aicm-ledger-meta">',
          '    <div><dt>部門</dt><dd>' + escapeHtml(row.department_name || "-") + '</dd></div>',
          '    <div><dt>課</dt><dd>' + escapeHtml(row.section_name || "-") + '</dd></div>',
          '    <div><dt>作業種別</dt><dd>' + escapeHtml(row.work_type_code || "-") + '</dd></div>',
          '    <div><dt>担当</dt><dd>' + escapeHtml(row.responsible_role_code || "-") + '</dd></div>',
          '  </dl>',
          row.note ? '<p class="aicm-ledger-note">' + escapeHtml(row.note) + '</p>' : '',
          '</article>'
        ].join("");
      }).join(""),
      '</div>'
    ].join("");
  }

  function renderTaskLedgerCreateForm(company, departments) {
    if (!company) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>AI企業が未選択です</strong>',
        '  <p>ダッシュボードでAI企業を選択してください。</p>',
        '  <button type="button" data-core-action="go" data-screen="dashboard">AI企業ダッシュボードへ</button>',
        '</div>'
      ].join("");
    }

    if (!departments.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>部門がありません</strong>',
        '  <p>部門別タスク台帳を作るには、先に部門が必要です。</p>',
        '  <button type="button" data-core-action="go" data-screen="department-new">部門新規追加へ</button>',
        '</div>'
      ].join("");
    }

    var firstDepartment = departments[0];
    var sections = sectionsForDepartment(firstDepartment.aicm_user_company_department_id);

    return [
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">台帳行追加</p>',
      '  <h2>部門別タスクを追加</h2>',
      '  <div class="aicm-form-grid">',
      '    <label>部門<select id="aicm-ledger-department">',
      departments.map(function (department) {
        return '<option value="' + escapeHtml(department.aicm_user_company_department_id) + '">' + escapeHtml(department.department_name) + '</option>';
      }).join(""),
      '    </select></label>',
      '    <label>課<select id="aicm-ledger-section">',
      '      <option value="">部門直下</option>',
      sections.map(function (section) {
        return '<option value="' + escapeHtml(section.aicm_user_company_section_id) + '">' + escapeHtml(section.section_name) + '</option>';
      }).join(""),
      '    </select></label>',
      '    <label>成果物名<input id="aicm-ledger-deliverable" type="text" placeholder="例: 部門別タスク台帳UI"></label>',
      '    <label>作業名<input id="aicm-ledger-task" type="text" placeholder="例: 一覧と追加フォームを実装"></label>',
      '    <label>作業種別<select id="aicm-ledger-work-type">',
      '      <option value="design">設計</option>',
      '      <option value="implementation">実装</option>',
      '      <option value="test">テスト</option>',
      '      <option value="review">レビュー</option>',
      '      <option value="handoff">引き継ぎ</option>',
      '    </select></label>',
      '    <label>担当役割<select id="aicm-ledger-role">',
      '      <option value="Manager">Manager</option>',
      '      <option value="Leader">Leader</option>',
      '      <option value="Worker">Worker</option>',
      '      <option value="President">President</option>',
      '    </select></label>',
      '    <label>優先度<select id="aicm-ledger-priority">',
      '      <option value="normal">通常</option>',
      '      <option value="high">高</option>',
      '      <option value="low">低</option>',
      '    </select></label>',
      '    <label>状態<select id="aicm-ledger-status">',
      '      <option value="todo">未着手</option>',
      '      <option value="in_progress">作業中</option>',
      '      <option value="review_waiting">レビュー待ち</option>',
      '      <option value="done">完了</option>',
      '    </select></label>',
      '  </div>',
      '  <label>補足メモ<textarea id="aicm-ledger-note" rows="3" placeholder="短い補足だけ"></textarea></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-create">台帳行を追加</button>',
      '  </div>',
      '</section>'
    ].join("");
  }

  async function createTaskLedgerFromForm() {
    var company = selectedCompany();
    if (!company) {
      setMessage("error", "先にAI企業を選択してください。");
      render();
      return;
    }

    var departmentEl = document.getElementById("aicm-ledger-department");
    var sectionEl = document.getElementById("aicm-ledger-section");
    var deliverableEl = document.getElementById("aicm-ledger-deliverable");
    var taskEl = document.getElementById("aicm-ledger-task");

    var deliverableName = deliverableEl ? deliverableEl.value.trim() : "";
    var taskName = taskEl ? taskEl.value.trim() : "";

    if (!departmentEl || !departmentEl.value) {
      setMessage("error", "部門を選択してください。");
      render();
      return;
    }

    if (!deliverableName || !taskName) {
      setMessage("error", "成果物名と作業名を入力してください。");
      render();
      return;
    }

    var payload = {
      owner_civilization_id: ownerCivilizationId(),
      aicm_user_company_id: company.aicm_user_company_id,
      aicm_user_company_department_id: departmentEl.value,
      aicm_user_company_section_id: sectionEl ? sectionEl.value : "",
      deliverable_name: deliverableName,
      task_name: taskName,
      work_type_code: valueOf("aicm-ledger-work-type") || "design",
      responsible_role_code: valueOf("aicm-ledger-role") || "Manager",
      priority_code: valueOf("aicm-ledger-priority") || "normal",
      task_status_code: valueOf("aicm-ledger-status") || "todo",
      note: valueOf("aicm-ledger-note")
    };

    try {
      var response = await fetch("/api/aicm/v2/task-ledger/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      var json = await response.json();

      if (!response.ok || !json || json.result !== "ok") {
        throw new Error((json && json.error_message) || "台帳行追加に失敗しました。");
      }

      setMessage("ok", "部門別タスク台帳に追加しました。");

      if (typeof loadContext === "function") {
        await loadContext();
      }

      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "台帳行追加に失敗しました。");
      render();
    }
  }

  function ownerCivilizationId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (typeof OWNER_CIVILIZATION_ID !== "undefined") return OWNER_CIVILIZATION_ID;
    return "00000000-0000-4000-8000-000000000001";
  }

  function valueOf(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "") : "";
  }
`;

const newRenderTaskLedger = `
function renderTaskLedgerPlaceholder() {
    var company = selectedCompany();
    var departments = company ? companyDepartments(company.aicm_user_company_id) : [];
    var rows = company ? taskLedgerRows(company.aicm_user_company_id) : [];

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '</section>',
      renderTaskLedgerCreateForm(company, departments),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">台帳一覧</p>',
      '  <h2>登録済みタスク</h2>',
      renderTaskLedgerRows(rows),
      '</section>'
    ].join(""));
  }`;

function ensureTaskLedgerInNormalizeContext(source) {
  if (source.includes("taskLedger: Array.isArray(json.task_ledger)")) return source;

  if (source.includes("function normalizeContext(")) {
    const newNormalize = `
function normalizeContext(json) {
    json = json || {};
    return {
      companies: Array.isArray(json.companies) ? json.companies : [],
      departments: Array.isArray(json.departments) ? json.departments : [],
      sections: Array.isArray(json.sections) ? json.sections : [],
      placements: Array.isArray(json.placements) ? json.placements : [],
      taskLedger: Array.isArray(json.task_ledger) ? json.task_ledger : [],
      robotCatalog: Array.isArray(json.robot_catalog) ? json.robot_catalog : []
    };
  }`;
    return replaceFunction(source, "normalizeContext", newNormalize);
  }

  return source;
}

if (!src.includes("function taskLedgerRows(")) {
  const pos = src.indexOf("function renderTaskLedgerPlaceholder(");
  if (pos < 0) throw new Error("task ledger insertion point not found");
  src = src.slice(0, pos) + ledgerHelpers + "\n\n  " + src.slice(pos);
}

src = replaceFunction(src, "renderTaskLedgerPlaceholder", newRenderTaskLedger);
src = ensureTaskLedgerInNormalizeContext(src);

if (!src.includes('action === "task-ledger-create"')) {
  const markers = [
    'if (action === "go")',
    'if (action === "reload")'
  ];

  let inserted = false;

  for (const marker of markers) {
    const pos = src.indexOf(marker);
    if (pos >= 0) {
      const insert = [
        '    if (action === "task-ledger-create") {',
        '      createTaskLedgerFromForm();',
        '      return;',
        '    }',
        '',
      ].join("\\n");
      src = src.slice(0, pos) + insert + src.slice(pos);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    throw new Error("could not locate action handler insertion point");
  }
}

if (!src.includes(".aicm-ledger-list{")) {
  const cssAdditions = `
      ".aicm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
      ".aicm-ledger-list{display:grid;gap:12px}",
      ".aicm-ledger-row{border:1px solid #edf2f7;background:#fbfdff;border-radius:18px;padding:14px}",
      ".aicm-ledger-row-head{display:flex;align-items:center;gap:8px}",
      ".aicm-ledger-row-head strong{font-size:18px}",
      ".aicm-ledger-row-head em{margin-left:auto;color:#64748b;font-style:normal;font-weight:800}",
      ".aicm-ledger-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0 0}",
      ".aicm-ledger-meta div{background:#f8fafc;border:1px solid #edf2f7;border-radius:12px;padding:8px}",
      ".aicm-ledger-meta dt{font-size:11px;color:#64748b;font-weight:900}",
      ".aicm-ledger-meta dd{margin:3px 0 0}",
      ".aicm-ledger-note{background:#fff;border:1px solid #edf2f7;border-radius:12px;padding:10px;margin:10px 0 0}",
      "@media(max-width:720px){.aicm-form-grid{grid-template-columns:1fr}.aicm-ledger-meta{grid-template-columns:repeat(2,minmax(0,1fr))}}",
`;
  const marker = '      "@media(min-width:820px)';
  const pos = src.indexOf(marker);
  if (pos >= 0) {
    src = src.slice(0, pos) + cssAdditions + src.slice(pos);
  } else {
    const marker2 = '    ].join("\\n");';
    const pos2 = src.indexOf(marker2);
    if (pos2 < 0) throw new Error("CSS insertion marker not found");
    src = src.slice(0, pos2) + cssAdditions + src.slice(pos2);
  }
}

fs.writeFileSync(file, src);
console.log("core task ledger v2 patched");
