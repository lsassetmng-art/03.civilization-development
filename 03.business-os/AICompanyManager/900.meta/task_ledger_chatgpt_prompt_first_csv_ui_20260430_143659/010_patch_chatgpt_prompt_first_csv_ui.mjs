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

const promptFirstRenderCsvImportCard = `
function renderCsvImportCard(company) {
    var fileName = state.csvImportFileName || "未選択";
    var lastResult = state.csvImportLastResult || "";

    return [
      '<section class="aicm-core-card aicm-csv-panel">',
      '  <p class="aicm-eyebrow">CSV取り込み</p>',
      '  <h2>ChatGPTでCSV作成・取り込み</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <div class="aicm-csv-flow">',
      '    <div class="aicm-csv-flow-step aicm-csv-flow-main">',
      '      <span>1</span>',
      '      <div><strong>ChatGPT用プロンプト</strong><p>台帳CSVをChatGPTに作らせるためのプロンプトをコピーまたはファイル作成します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-chatgpt-prompt">ChatGPT用プロンプト</button>',
      '    </div>',
      '    <div class="aicm-csv-flow-step">',
      '      <span>2</span>',
      '      <div><strong>CSVファイル読込</strong><p>ChatGPTで作成したCSVファイルを読み込みます。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-file-open">CSVファイル読込</button>',
      '    </div>',
      '    <div class="aicm-csv-file-name"><span>ファイル名</span><strong>' + escapeHtml(fileName) + '</strong></div>',
      '    <div class="aicm-csv-flow-step">',
      '      <span>3</span>',
      '      <div><strong>CSV取り込み実行</strong><p>読み込んだCSVを部門別タスク台帳へ登録します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-import">CSV取り込み実行</button>',
      '    </div>',
      '  </div>',
      '  <input id="aicm-ledger-csv-file" class="aicm-hidden-file" type="file" accept=".csv,text/csv" data-core-file="task-ledger-csv">',
      lastResult ? '<p class="aicm-selected-note">' + escapeHtml(lastResult) + '</p>' : '',
      '</section>'
    ].join("");
  }`;

const promptFirstBuildTaskLedgerCsvPreview = `
function buildTaskLedgerCsvPreview() {
    var company = selectedCompany();
    var text = String(state.csvImportText || "");
    var parsedRows = parseCsv(text);
    var objects = csvRowsToObjects(parsedRows);
    var requiredHeaders = taskLedgerCsvColumns();

    if (!company) {
      throw new Error("先にAI企業を選択してください。");
    }

    if (parsedRows.length < 2) {
      throw new Error("CSVファイルを読み込んでください。");
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
  }`;

const promptFirstImportTaskLedgerCsv = `
async function importTaskLedgerCsv() {
    var preview = [];

    try {
      preview = buildTaskLedgerCsvPreview();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
      render();
      return;
    }

    var invalidRows = preview.filter(function (row) { return !row.valid; });
    if (invalidRows.length) {
      var message = invalidRows.slice(0, 3).map(function (row) {
        return "行" + row.row_number + ": " + row.errors.join(" / ");
      }).join(" / ");

      setMessage("error", "CSV取り込み前チェックでエラーがあります。 " + message);
      render();
      return;
    }

    var success = 0;
    var failed = 0;
    var messages = [];

    for (var i = 0; i < preview.length; i++) {
      var row = preview[i];

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

    if (failed > 0) {
      state.csvImportLastResult = "CSV取り込み: 成功 " + success + "件 / 失敗 " + failed + "件";
      setMessage("error", state.csvImportLastResult + "。 " + messages.slice(0, 3).join(" / "));
    } else {
      state.csvImportLastResult = "CSV取り込み完了: " + success + "件";
      state.csvImportText = "";
      state.csvImportFileName = "";
      setMessage("ok", state.csvImportLastResult);
    }

    state.csvImportPreview = [];
    state.screen = "task-ledger";
    render();
  }`;

const emptyRenderCsvPreviewTable = `
function renderCsvPreviewTable(preview) {
    return "";
  }`;

const emptyRenderCsvTemplatePanel = `
function renderCsvTemplatePanel() {
    return "";
  }`;

const helperFunctions = `
function downloadTextFile(filename, text, mimeType) {
    var blob = new Blob([String(text || "")], { type: mimeType || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function readTaskLedgerCsvFile(file) {
    if (!file) return;

    try {
      var text = await file.text();
      state.csvImportText = text;
      state.csvImportFileName = file.name || "selected.csv";
      state.csvImportPreview = [];
      state.csvImportLastResult = "";
      setMessage("ok", "CSVファイルを読み込みました: " + state.csvImportFileName);
    } catch (error) {
      state.csvImportText = "";
      state.csvImportFileName = "";
      state.csvImportPreview = [];
      state.csvImportLastResult = "";
      setMessage("error", "CSVファイル読込に失敗しました。");
    }

    render();
  }

  function openTaskLedgerCsvFilePicker() {
    var input = document.getElementById("aicm-ledger-csv-file");
    if (input) input.click();
  }

  async function openTaskLedgerChatGptPrompt() {
    var text = taskLedgerCsvPromptText();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage("ok", "ChatGPT用プロンプトをコピーしました。");
        render();
        return;
      }
    } catch (error) {
    }

    downloadTextFile("aicm_task_ledger_chatgpt_prompt.txt", text, "text/plain;charset=utf-8");
    setMessage("ok", "ChatGPT用プロンプトファイルを作成しました。");
    render();
  }
`;

src = replaceFunction(src, "renderCsvImportCard", promptFirstRenderCsvImportCard);
src = replaceFunction(src, "buildTaskLedgerCsvPreview", promptFirstBuildTaskLedgerCsvPreview);
src = replaceFunction(src, "importTaskLedgerCsv", promptFirstImportTaskLedgerCsv);

if (src.includes("function renderCsvPreviewTable(")) {
  src = replaceFunction(src, "renderCsvPreviewTable", emptyRenderCsvPreviewTable);
}

if (src.includes("function renderCsvTemplatePanel(")) {
  src = replaceFunction(src, "renderCsvTemplatePanel", emptyRenderCsvTemplatePanel);
}

if (!src.includes("function downloadTextFile(")) {
  var helperPos = src.indexOf("function previewTaskLedgerCsv(");
  if (helperPos < 0) helperPos = src.indexOf("async function previewTaskLedgerCsv(");
  if (helperPos < 0) helperPos = src.indexOf("function importTaskLedgerCsv(");
  if (helperPos < 0) helperPos = src.indexOf("async function importTaskLedgerCsv(");
  if (helperPos < 0) throw new Error("CSV helper insertion point not found");

  src = src.slice(0, helperPos) + helperFunctions + "\n\n  " + src.slice(helperPos);
}

if (!src.includes("function readTaskLedgerCsvFile(")) {
  var readHelperPos = src.indexOf("function openTaskLedgerChatGptPrompt(");
  if (readHelperPos < 0) throw new Error("read helper insertion point not found");

  var readHelpersOnly = `
async function readTaskLedgerCsvFile(file) {
    if (!file) return;

    try {
      var text = await file.text();
      state.csvImportText = text;
      state.csvImportFileName = file.name || "selected.csv";
      state.csvImportPreview = [];
      state.csvImportLastResult = "";
      setMessage("ok", "CSVファイルを読み込みました: " + state.csvImportFileName);
    } catch (error) {
      state.csvImportText = "";
      state.csvImportFileName = "";
      state.csvImportPreview = [];
      state.csvImportLastResult = "";
      setMessage("error", "CSVファイル読込に失敗しました。");
    }

    render();
  }

  function openTaskLedgerCsvFilePicker() {
    var input = document.getElementById("aicm-ledger-csv-file");
    if (input) input.click();
  }

  `;
  src = src.slice(0, readHelperPos) + readHelpersOnly + src.slice(readHelperPos);
}

if (!src.includes("function openTaskLedgerChatGptPrompt(")) {
  var promptPos = src.indexOf("function previewTaskLedgerCsv(");
  if (promptPos < 0) promptPos = src.indexOf("async function previewTaskLedgerCsv(");
  if (promptPos < 0) promptPos = src.indexOf("function importTaskLedgerCsv(");
  if (promptPos < 0) promptPos = src.indexOf("async function importTaskLedgerCsv(");
  if (promptPos < 0) throw new Error("prompt helper insertion point not found");

  var promptHelper = `
async function openTaskLedgerChatGptPrompt() {
    var text = taskLedgerCsvPromptText();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage("ok", "ChatGPT用プロンプトをコピーしました。");
        render();
        return;
      }
    } catch (error) {
    }

    downloadTextFile("aicm_task_ledger_chatgpt_prompt.txt", text, "text/plain;charset=utf-8");
    setMessage("ok", "ChatGPT用プロンプトファイルを作成しました。");
    render();
  }

  `;
  src = src.slice(0, promptPos) + promptHelper + src.slice(promptPos);
}

if (!src.includes('action === "task-ledger-csv-file-open"')) {
  var actionPos = src.indexOf('if (action === "task-ledger-csv-preview")');
  if (actionPos < 0) actionPos = src.indexOf('if (action === "task-ledger-csv-import")');
  if (actionPos < 0) actionPos = src.indexOf('if (action === "task-ledger-create")');
  if (actionPos < 0) throw new Error("CSV file action insertion point not found");

  var actionBlock = [
    '    if (action === "task-ledger-csv-file-open") {',
    '      openTaskLedgerCsvFilePicker();',
    '      return;',
    '    }',
    '',
    '    if (action === "task-ledger-chatgpt-prompt") {',
    '      openTaskLedgerChatGptPrompt();',
    '      return;',
    '    }',
    ''
  ].join("\n");

  src = src.slice(0, actionPos) + actionBlock + src.slice(actionPos);
} else if (!src.includes('action === "task-ledger-chatgpt-prompt"')) {
  var promptActionPos = src.indexOf('if (action === "task-ledger-csv-file-open")');
  if (promptActionPos < 0) throw new Error("prompt action insertion point not found");

  var promptAction = [
    '    if (action === "task-ledger-chatgpt-prompt") {',
    '      openTaskLedgerChatGptPrompt();',
    '      return;',
    '    }',
    ''
  ].join("\n");

  src = src.slice(0, promptActionPos) + promptAction + src.slice(promptActionPos);
}

if (!src.includes("readTaskLedgerCsvFile(target.files && target.files[0])")) {
  var listenerPos = src.indexOf('root.addEventListener("click"');
  if (listenerPos < 0) throw new Error("file change listener insertion point not found");

  var changeListener = [
    '  root.addEventListener("change", function (event) {',
    '    var target = event.target;',
    '    if (target && target.getAttribute && target.getAttribute("data-core-file") === "task-ledger-csv") {',
    '      readTaskLedgerCsvFile(target.files && target.files[0]);',
    '    }',
    '  });',
    ''
  ].join("\n");

  src = src.slice(0, listenerPos) + changeListener + src.slice(listenerPos);
}

/*
 * Remove visible CSV template action if present.
 */
src = src.replace(
  /\s*if \(action === "task-ledger-create-csv-template-file"\) \{[\s\S]*?\n\s*}\n\s*/g,
  "\n"
);

/*
 * CSS for prompt-first CSV flow.
 */
if (!src.includes(".aicm-csv-flow{")) {
  const cssAdditions = `
      ".aicm-hidden-file{display:none}",
      ".aicm-csv-flow{display:grid;gap:12px;margin-top:12px}",
      ".aicm-csv-flow-step{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #edf2f7;background:#f8fafc;border-radius:16px;padding:12px}",
      ".aicm-csv-flow-step span{display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:#e0ecff;color:#1d4ed8;font-weight:900}",
      ".aicm-csv-flow-step strong{display:block}",
      ".aicm-csv-flow-step p{margin:4px 0 0;color:#64748b;font-size:13px}",
      ".aicm-csv-flow-main{background:#eef2ff}",
      ".aicm-csv-file-name{border:1px solid #edf2f7;background:#fff;border-radius:14px;padding:10px 12px;min-width:0}",
      ".aicm-csv-file-name span{display:block;color:#64748b;font-size:12px;font-weight:900}",
      ".aicm-csv-file-name strong{display:block;word-break:break-all;margin-top:4px}",
      "@media(max-width:620px){.aicm-csv-flow-step{grid-template-columns:auto minmax(0,1fr)}.aicm-csv-flow-step button{grid-column:1 / -1}}",
`;
  const marker = '      "@media(min-width:820px)';
  const pos = src.indexOf(marker);
  if (pos >= 0) {
    src = src.slice(0, pos) + cssAdditions + src.slice(pos);
  }
}

fs.writeFileSync(file, src);
console.log("task ledger CSV ChatGPT prompt-first UI patched");
