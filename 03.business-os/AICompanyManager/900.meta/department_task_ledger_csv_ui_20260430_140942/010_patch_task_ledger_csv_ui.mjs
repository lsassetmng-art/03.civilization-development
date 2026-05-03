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
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Function end not found: " + functionName);
}

const csvHelpers = `
function taskLedgerCsvColumns() {
    return [
      "department_name",
      "section_name",
      "deliverable_name",
      "task_name",
      "work_type_code",
      "responsible_role_code",
      "task_status_code",
      "priority_code",
      "due_date",
      "reference_files_text",
      "supplemental_materials_text",
      "applicable_rules_text",
      "note",
      "handoff_link"
    ];
  }

  function taskLedgerCsvTemplateText() {
    return [
      taskLedgerCsvColumns().join(","),
      [
        "開発部",
        "UI課",
        "部門別タスク台帳UI",
        "CSV取り込み画面を実装",
        "implementation",
        "Leader",
        "todo",
        "normal",
        "",
        "",
        "画面スクショ",
        "会社共通ルール",
        "CSVプレビュー後に取り込み",
        ""
      ].join(",")
    ].join("\\n");
  }

  function taskLedgerCsvPromptText() {
    return [
      "以下のCSVカラムで、AICompanyManagerの部門別タスク台帳に取り込む行を作成してください。",
      "出力はCSVのみ。説明文やMarkdownコードブロックは不要です。",
      "",
      "必須カラム:",
      taskLedgerCsvColumns().join(","),
      "",
      "ルール:",
      "- department_name は既存の部門名に合わせる",
      "- section_name は任意。部門直下なら空欄",
      "- deliverable_name と task_name は必須",
      "- work_type_code は design / implementation / test / review / handoff のいずれか",
      "- responsible_role_code は Manager / Leader / Worker / President のいずれか",
      "- task_status_code は todo / in_progress / review_waiting / done のいずれか",
      "- priority_code は low / normal / high のいずれか",
      "- due_date は YYYY-MM-DD または空欄",
      "- reference_files_text は参照ファイル",
      "- supplemental_materials_text は補足資料",
      "- applicable_rules_text は適用ルール",
      "- note は短い補足",
      "- handoff_link は任意"
    ].join("\\n");
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuote = false;

    text = String(text || "").replace(/^\\uFEFF/, "");

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var next = text[i + 1];

      if (inQuote) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuote = false;
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuote = true;
        continue;
      }

      if (ch === ",") {
        row.push(field);
        field = "";
        continue;
      }

      if (ch === "\\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        continue;
      }

      if (ch === "\\r") {
        continue;
      }

      field += ch;
    }

    row.push(field);
    rows.push(row);

    return rows.filter(function (items) {
      return items.some(function (item) {
        return String(item || "").trim() !== "";
      });
    });
  }

  function csvRowsToObjects(rows) {
    if (!rows.length) return [];
    var headers = rows[0].map(function (h) {
      return String(h || "").trim();
    });

    return rows.slice(1).map(function (items, index) {
      var obj = { row_number: index + 2 };
      headers.forEach(function (header, i) {
        obj[header] = String(items[i] || "").trim();
      });
      return obj;
    });
  }

  function findDepartmentByName(company, name) {
    var text = String(name || "").trim();
    if (!company || !text) return null;

    var departments = companyDepartments(company.aicm_user_company_id);
    return departments.find(function (department) {
      return String(department.department_name || "").trim() === text;
    }) || null;
  }

  function findSectionByName(departmentId, name) {
    var text = String(name || "").trim();
    if (!text) return null;

    return state.context.sections.find(function (section) {
      return String(section.aicm_user_company_department_id || "") === String(departmentId || "")
        && String(section.section_name || "").trim() === text;
    }) || null;
  }

  function buildTaskLedgerCsvPreview() {
    var company = selectedCompany();
    var text = valueOf("aicm-ledger-csv-text");
    var parsedRows = parseCsv(text);
    var objects = csvRowsToObjects(parsedRows);
    var requiredHeaders = taskLedgerCsvColumns();

    if (!company) {
      throw new Error("先にAI企業を選択してください。");
    }

    if (parsedRows.length < 2) {
      throw new Error("CSVヘッダーと1行以上のデータを貼り付けてください。");
    }

    var headers = parsedRows[0].map(function (h) {
      return String(h || "").trim();
    });

    var missing = requiredHeaders.filter(function (header) {
      return headers.indexOf(header) < 0;
    });

    if (missing.length) {
      throw new Error("CSVカラム不足: " + missing.join(", "));
    }

    return objects.map(function (row) {
      var errors = [];
      var department = findDepartmentByName(company, row.department_name);
      var section = null;

      if (!department) {
        errors.push("部門が見つかりません: " + (row.department_name || "(空欄)"));
      } else if (row.section_name) {
        section = findSectionByName(department.aicm_user_company_department_id, row.section_name);
        if (!section) {
          errors.push("課が見つかりません: " + row.section_name);
        }
      }

      if (!row.deliverable_name) errors.push("成果物名が空欄です");
      if (!row.task_name) errors.push("作業名が空欄です");

      return {
        row_number: row.row_number,
        source: row,
        valid: errors.length === 0,
        errors: errors,
        payload: {
          owner_civilization_id: ownerCivilizationId(),
          aicm_user_company_id: company.aicm_user_company_id,
          aicm_user_company_department_id: department ? department.aicm_user_company_department_id : "",
          aicm_user_company_section_id: section ? section.aicm_user_company_section_id : "",
          deliverable_name: row.deliverable_name || "",
          task_name: row.task_name || "",
          work_type_code: row.work_type_code || "design",
          responsible_role_code: row.responsible_role_code || "Manager",
          task_status_code: row.task_status_code || "todo",
          priority_code: row.priority_code || "normal",
          due_date: row.due_date || "",
          reference_files_text: row.reference_files_text || "",
          supplemental_materials_text: row.supplemental_materials_text || "",
          applicable_rules_text: row.applicable_rules_text || "",
          note: row.note || "",
          handoff_link: row.handoff_link || ""
        }
      };
    });
  }

  function renderCsvImportCard(company) {
    var preview = Array.isArray(state.csvImportPreview) ? state.csvImportPreview : [];
    var validCount = preview.filter(function (row) { return row.valid; }).length;
    var errorCount = preview.length - validCount;

    return [
      '<section class="aicm-core-card aicm-csv-panel">',
      '  <p class="aicm-eyebrow">CSV取り込み</p>',
      '  <h2>CSV取り込み</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <label>CSV貼り付け<textarea id="aicm-ledger-csv-text" rows="8" placeholder="' + escapeHtml(taskLedgerCsvTemplateText()) + '"></textarea></label>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-fill-csv-template">CSVテンプレを入れる</button>',
      '    <button type="button" data-core-action="task-ledger-csv-preview">プレビュー</button>',
      preview.length ? '    <button type="button" data-core-action="task-ledger-csv-import">インポート実行</button>' : '',
      '  </div>',
      preview.length ? '<p class="aicm-selected-note">プレビュー: 有効 ' + validCount + '件 / エラー ' + errorCount + '件</p>' : '',
      renderCsvPreviewTable(preview),
      renderCsvTemplatePanel(),
      '</section>'
    ].join("");
  }

  function renderCsvPreviewTable(preview) {
    if (!preview || !preview.length) return "";

    return [
      '<div class="aicm-csv-preview">',
      '  <table>',
      '    <thead><tr><th>行</th><th>判定</th><th>部門</th><th>課</th><th>成果物</th><th>作業</th></tr></thead>',
      '    <tbody>',
      preview.map(function (row) {
        return [
          '<tr class="' + (row.valid ? 'is-valid' : 'is-error') + '">',
          '  <td>' + row.row_number + '</td>',
          '  <td>' + (row.valid ? 'OK' : escapeHtml(row.errors.join(" / "))) + '</td>',
          '  <td>' + escapeHtml(row.source.department_name || "") + '</td>',
          '  <td>' + escapeHtml(row.source.section_name || "") + '</td>',
          '  <td>' + escapeHtml(row.source.deliverable_name || "") + '</td>',
          '  <td>' + escapeHtml(row.source.task_name || "") + '</td>',
          '</tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }

  function renderCsvTemplatePanel() {
    return [
      '<details class="aicm-csv-template">',
      '  <summary>CSV作成テンプレ / ChatGPT用プロンプト</summary>',
      '  <label>CSVカラム<textarea readonly rows="3">' + escapeHtml(taskLedgerCsvColumns().join(",")) + '</textarea></label>',
      '  <label>CSVテンプレ<textarea readonly rows="4">' + escapeHtml(taskLedgerCsvTemplateText()) + '</textarea></label>',
      '  <label>ChatGPT用プロンプト<textarea readonly rows="10">' + escapeHtml(taskLedgerCsvPromptText()) + '</textarea></label>',
      '</details>'
    ].join("");
  }

  async function previewTaskLedgerCsv() {
    try {
      state.csvImportPreview = buildTaskLedgerCsvPreview();
      setMessage("ok", "CSVプレビューを作成しました。");
    } catch (error) {
      state.csvImportPreview = [];
      setMessage("error", error && error.message ? error.message : "CSVプレビューに失敗しました。");
    }
    render();
  }

  async function fillTaskLedgerCsvTemplate() {
    var el = document.getElementById("aicm-ledger-csv-text");
    if (el) {
      el.value = taskLedgerCsvTemplateText();
      setMessage("ok", "CSVテンプレを入力欄へ入れました。");
    }
    render();
  }

  async function importTaskLedgerCsv() {
    var preview = Array.isArray(state.csvImportPreview) ? state.csvImportPreview : [];
    var validRows = preview.filter(function (row) { return row.valid; });

    if (!validRows.length) {
      setMessage("error", "インポート可能な行がありません。");
      render();
      return;
    }

    var success = 0;
    var failed = 0;
    var messages = [];

    for (var i = 0; i < validRows.length; i++) {
      var row = validRows[i];

      try {
        var response = await fetch("/api/aicm/v2/task-ledger/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(row.payload)
        });

        var json = await response.json();

        if (!response.ok || !json || json.result !== "ok") {
          throw new Error((json && json.error_message) || "取り込み失敗");
        }

        success++;
      } catch (error) {
        failed++;
        messages.push("行" + row.row_number + ": " + (error && error.message ? error.message : "取り込み失敗"));
      }
    }

    if (typeof loadContext === "function") {
      await loadContext();
    }

    state.csvImportPreview = [];

    if (failed > 0) {
      setMessage("error", "CSV取り込み: 成功 " + success + "件 / 失敗 " + failed + "件。 " + messages.slice(0, 3).join(" / "));
    } else {
      setMessage("ok", "CSV取り込み完了: " + success + "件");
    }

    state.screen = "task-ledger";
    render();
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
      renderCsvImportCard(company),
      renderTaskLedgerCreateForm(company, departments),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">台帳一覧</p>',
      '  <h2>登録済みタスク</h2>',
      renderTaskLedgerRows(rows),
      '</section>'
    ].join(""));
  }`;

if (!src.includes("function renderCsvImportCard(")) {
  const pos = src.indexOf("function renderTaskLedgerPlaceholder(");
  if (pos < 0) throw new Error("task ledger insertion point not found");
  src = src.slice(0, pos) + csvHelpers + "\n\n  " + src.slice(pos);
}

src = replaceFunction(src, "renderTaskLedgerPlaceholder", newRenderTaskLedger);

if (!src.includes('action === "task-ledger-csv-preview"')) {
  const marker = 'if (action === "task-ledger-create")';
  let pos = src.indexOf(marker);

  if (pos < 0) {
    pos = src.indexOf('if (action === "go")');
  }

  if (pos < 0) throw new Error("action insertion point not found");

  const actionBlock = [
    '    if (action === "task-ledger-fill-csv-template") {',
    '      fillTaskLedgerCsvTemplate();',
    '      return;',
    '    }',
    '',
    '    if (action === "task-ledger-csv-preview") {',
    '      previewTaskLedgerCsv();',
    '      return;',
    '    }',
    '',
    '    if (action === "task-ledger-csv-import") {',
    '      importTaskLedgerCsv();',
    '      return;',
    '    }',
    ''
  ].join("\n");

  src = src.slice(0, pos) + actionBlock + src.slice(pos);
}

if (!src.includes(".aicm-csv-panel{")) {
  const cssAdditions = `
      ".aicm-csv-panel textarea{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px}",
      ".aicm-csv-preview{overflow:auto;border:1px solid #edf2f7;border-radius:14px;margin-top:14px}",
      ".aicm-csv-preview table{width:100%;border-collapse:collapse;background:#fff;font-size:13px}",
      ".aicm-csv-preview th,.aicm-csv-preview td{border-bottom:1px solid #edf2f7;padding:8px;text-align:left;vertical-align:top}",
      ".aicm-csv-preview tr.is-error td{background:#fff5f5;color:#991b1b}",
      ".aicm-csv-preview tr.is-valid td:first-child{font-weight:900}",
      ".aicm-csv-template{margin-top:14px;border:1px solid #edf2f7;background:#f8fafc;border-radius:14px;padding:12px}",
      ".aicm-csv-template summary{font-weight:900;cursor:pointer}",
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
console.log("task ledger CSV production UI patched");
