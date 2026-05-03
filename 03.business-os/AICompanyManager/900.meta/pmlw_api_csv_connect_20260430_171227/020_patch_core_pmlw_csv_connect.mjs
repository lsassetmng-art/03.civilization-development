import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const marker = "AICM_PMLW_CSV_CONNECT_ARB_ARE_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
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

function findIfBlockByAction(source, action) {
  const token = `action === "${action}"`;
  const tokenPos = source.indexOf(token);
  if (tokenPos < 0) return null;

  const ifPos = source.lastIndexOf("if", tokenPos);
  if (ifPos < 0) throw new Error("if not found for action: " + action);

  const braceStart = source.indexOf("{", tokenPos);
  if (braceStart < 0) throw new Error("brace not found for action: " + action);

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
        return { start: ifPos, end: i + 1 };
      }
    }
  }

  throw new Error("action if block end not found: " + action);
}

function replaceActionBlock(source, action, replacement) {
  const block = findIfBlockByAction(source, action);

  if (block) {
    return source.slice(0, block.start) + replacement + source.slice(block.end);
  }

  const goBlock = findIfBlockByAction(source, "go");
  if (!goBlock) throw new Error("action insertion anchor not found: go");

  return source.slice(0, goBlock.start) + replacement + "\n\n    " + source.slice(goBlock.start);
}

function insertBeforeFunction(source, functionName, insertion) {
  if (source.includes(marker)) return source;

  const pos = source.indexOf("function " + functionName + "(");
  if (pos < 0) throw new Error("Core insertion anchor not found: " + functionName);

  return source.slice(0, pos) + insertion + "\n\n  " + source.slice(pos);
}

const helperCode = `
// ${marker}
// PMLW CSV/UI connector. Uses existing clean core state and selectedCompany().
function aicmPmlwOwnerId() {
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    if (state && state.owner_civilization_id) return state.owner_civilization_id;
    if (state && state.context && state.context.owner_civilization_id) return state.context.owner_civilization_id;
    return "00000000-0000-4000-8000-000000000001";
  }

  async function aicmPmlwPostJson(path, body) {
    var response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });

    var text = await response.text();
    var json = {};

    try {
      json = text ? JSON.parse(text) : {};
    } catch (_) {
      json = { result: "error", message: text || "Invalid server response" };
    }

    if (!response.ok || (json.result && json.result !== "ok")) {
      throw new Error(json.message || json.error || ("API failed: " + path));
    }

    return json;
  }

  async function aicmPmlwReloadContext() {
    if (typeof loadContext === "function") {
      await loadContext();
      return;
    }

    if (typeof refreshContext === "function") {
      await refreshContext();
      return;
    }

    var owner = encodeURIComponent(aicmPmlwOwnerId());
    var response = await fetch("/api/aicm/v2/context?owner_civilization_id=" + owner);
    var json = await response.json();

    if (json && json.result === "ok") {
      state.context = json;
    }

    if (typeof render === "function") {
      render();
    }
  }

  function aicmPmlwCsvPromptText() {
    return [
      "以下のCSVカラムで、AICompanyManagerの部門別タスク台帳に取り込むManager大項目行を作成してください。",
      "出力はCSVのみ。説明文やMarkdownコードブロックは不要です。",
      "",
      "CSVカラム:",
      "department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note",
      "",
      "ルール:",
      "- department_name は既存部門名に合わせる",
      "- section_name は既存課名に合わせる",
      "- major_item_name はManagerがLeaderへ渡す大項目名",
      "- major_item_description は大項目の説明",
      "- assigned_leader_label は未定なら空欄",
      "- priority_code は low / normal / high / urgent のいずれか",
      "- due_date は YYYY-MM-DD。未定なら空欄",
      "- note は短い補足だけ",
      "",
      "例:",
      "department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note",
      "開発部,UI課,銀行業務UI整理,銀行業務に必要なUI領域を大項目として整理する,,normal,,"
    ].join("\\n");
  }

  async function handleTaskLedgerChatGptPrompt() {
    var text = aicmPmlwCsvPromptText();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setMessage("ok", "ChatGPT用プロンプトをコピーしました。");
        return;
      }
    } catch (_) {}

    if (typeof downloadTextFile === "function") {
      downloadTextFile("aicm_manager_major_csv_prompt.txt", text, "text/plain;charset=utf-8");
      setMessage("ok", "ChatGPT用プロンプトファイルを作成しました。");
      return;
    }

    setMessage("error", "プロンプトのコピーに失敗しました。");
  }

  function parseAicmCsv(text) {
    var rows = [];
    var row = [];
    var cell = "";
    var inQuotes = false;
    var value = String(text || "");

    for (var i = 0; i < value.length; i += 1) {
      var ch = value[i];
      var next = value[i + 1];

      if (inQuotes && ch === '"' && next === '"') {
        cell += '"';
        i += 1;
        continue;
      }

      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && ch === ",") {
        row.push(cell);
        cell = "";
        continue;
      }

      if (!inQuotes && (ch === "\\n" || ch === "\\r")) {
        if (ch === "\\r" && next === "\\n") i += 1;
        row.push(cell);
        cell = "";

        if (row.some(function (v) { return String(v || "").trim() !== ""; })) {
          rows.push(row);
        }

        row = [];
        continue;
      }

      cell += ch;
    }

    row.push(cell);
    if (row.some(function (v) { return String(v || "").trim() !== ""; })) {
      rows.push(row);
    }

    if (rows.length < 2) return [];

    var headers = rows[0].map(function (v) {
      return String(v || "").trim();
    });

    return rows.slice(1).map(function (values) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[header] = String(values[index] || "").trim();
      });
      return obj;
    }).filter(function (obj) {
      return Object.keys(obj).some(function (key) {
        return String(obj[key] || "").trim() !== "";
      });
    });
  }

  async function importTaskLedgerCsvToPmlwMajor() {
    var company = selectedCompany();

    if (!company) {
      setMessage("error", "AI企業を選択してください。");
      return;
    }

    var text = String(state.csvImportText || "").trim();

    if (!text) {
      setMessage("error", "CSVファイルを読み込んでください。");
      return;
    }

    try {
      var rows = parseAicmCsv(text);

      if (!rows.length) {
        setMessage("error", "取り込めるCSV行がありません。");
        return;
      }

      var result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", {
        owner_civilization_id: aicmPmlwOwnerId(),
        aicm_user_company_id: company.aicm_user_company_id,
        rows: rows
      });

      var count = result.inserted_count || 0;
      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
      setMessage("ok", state.csvImportLastResult);

      await aicmPmlwReloadContext();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
    }
  }
`;

src = insertBeforeFunction(src, "renderCsvImportCard", helperCode);

src = replaceActionBlock(src, "task-ledger-chatgpt-prompt", `if (action === "task-ledger-chatgpt-prompt") {
      handleTaskLedgerChatGptPrompt();
      return;
    }`);

src = replaceActionBlock(src, "task-ledger-csv-import", `if (action === "task-ledger-csv-import") {
      importTaskLedgerCsvToPmlwMajor();
      return;
    }`);

fs.writeFileSync(file, src);

console.log(JSON.stringify({
  changed: true,
  markerCount: count(src, marker),
  importEndpointCount: count(src, "/api/aicm/v2/manager-major/import-csv"),
  promptActionCount: count(src, "task-ledger-chatgpt-prompt"),
  importActionCount: count(src, "task-ledger-csv-import")
}));
