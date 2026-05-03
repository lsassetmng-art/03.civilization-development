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

src = replaceFunction(src, "renderCsvImportCard", csvCardFunction);

/*
 * CSV UIでは不要になった旧文言だけを消す。
 * 会社/部門/課フォーム用 textarea は残す。
 */
src = src
  .replaceAll("CSVプレビュー後に取り込み", "CSV作成後に取り込み")
  .replaceAll("CSVプレビューを作成しました。", "CSVを確認しました。")
  .replaceAll("CSVプレビューに失敗しました。", "CSV確認に失敗しました。")
  .replaceAll("CSVテンプレを入力欄へ入れました。", "CSV入力例を確認しました。")
  .replaceAll("CSVテンプレ", "CSV入力例");

/*
 * CSVカード専用のtextarea CSSだけ削除。
 * global textarea CSSはフォーム保守のため残す。
 */
src = src.replace(/\n\s*["']\.aicm-csv-panel textarea\{[^"']*\}["'],?/g, "");

fs.writeFileSync(file, src);
console.log("CSV scoped cleanup applied");
