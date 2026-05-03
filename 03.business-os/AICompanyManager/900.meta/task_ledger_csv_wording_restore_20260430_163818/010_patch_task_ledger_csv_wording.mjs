import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

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

function replaceFunction(source, functionName, replacement) {
  const fn = extractFunction(source, functionName);
  return source.slice(0, fn.start) + replacement + source.slice(fn.end);
}

function hasFunction(source, functionName) {
  return source.includes("function " + functionName + "(");
}

const csvCardFunction = `
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
      '      <div><strong>ChatGPT用プロンプト</strong><p>部門別タスク台帳の大項目CSVをChatGPTで作成します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-chatgpt-prompt">ChatGPT用プロンプト</button>',
      '    </div>',
      '    <div class="aicm-csv-flow-step">',
      '      <div><strong>CSVファイル読込</strong><p>作成したCSVファイルを選択します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-file-open">CSVファイル読込</button>',
      '    </div>',
      '    <div class="aicm-csv-file-name">ファイル名: <strong>' + escapeHtml(fileName) + '</strong></div>',
      '    <div class="aicm-csv-flow-step">',
      '      <div><strong>CSV取り込み実行</strong><p>読み込んだCSVを部門別タスク台帳へ登録します。</p></div>',
      '      <button type="button" data-core-action="task-ledger-csv-import">CSV取り込み実行</button>',
      '    </div>',
      '  </div>',
      '  <input id="aicm-ledger-csv-file" class="aicm-hidden-file" type="file" accept=".csv,text/csv" data-core-file="task-ledger-csv">',
      lastResult ? '<p class="aicm-selected-note">' + escapeHtml(lastResult) + '</p>' : '',
      '</section>'
    ].join("");
  }`;

if (hasFunction(src, "renderCsvImportCard")) {
  src = replaceFunction(src, "renderCsvImportCard", csvCardFunction);
} else {
  const anchor = src.indexOf("function renderTaskLedgerPlaceholder(");
  if (anchor < 0) throw new Error("renderTaskLedgerPlaceholder not found");
  src = src.slice(0, anchor) + csvCardFunction + "\n\n  " + src.slice(anchor);
}

const taskLedgerReplacement = `
function renderTaskLedgerPlaceholder() {
    var company = selectedCompany();
    var rows = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">President方針やユーザー依頼を、Managerが大項目として整理し、部門・課・Leaderへ引き渡すための台帳です。</p>',
      '</section>',
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      renderPmlwMajorRows(rows),
      '</section>'
    ].join(""));
  }`;

src = replaceFunction(src, "renderTaskLedgerPlaceholder", taskLedgerReplacement);

if (!src.includes(".aicm-csv-flow{")) {
  const cssAdditions = `
      ".aicm-csv-flow{display:grid;gap:14px;margin-top:14px}",
      ".aicm-csv-flow-step{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;border:1px solid #e5e7eb;border-radius:16px;background:#f8fafc}",
      ".aicm-csv-flow-step p{margin:4px 0 0;color:#64748b}",
      ".aicm-csv-flow-main{background:#eef4ff}",
      ".aicm-csv-file-name{padding:12px 14px;border:1px solid #e5e7eb;border-radius:14px;background:#fff;color:#64748b}",
      ".aicm-hidden-file{display:none}",
`;
  const marker = '      "@media(min-width:820px)';
  const pos = src.indexOf(marker);
  if (pos >= 0) {
    src = src.slice(0, pos) + cssAdditions + src.slice(pos);
  }
}

fs.writeFileSync(file, src);
console.log("task ledger CSV wording restored");
