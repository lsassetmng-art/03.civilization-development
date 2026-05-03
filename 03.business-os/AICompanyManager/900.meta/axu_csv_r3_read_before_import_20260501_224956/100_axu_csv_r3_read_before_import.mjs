import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

const marker = 'AICM_AXU_CSV_R3_READ_BEFORE_IMPORT_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionStart(src, name) {
  const targets = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];
  let best = -1;
  for (const t of targets) {
    const i = src.indexOf(t);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }
  return best;
}

function findFunctionRange(src, name) {
  const start = findFunctionStart(src, name);
  if (start < 0) return null;

  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) {
      return { start, end: i + 1, text: src.slice(start, i + 1) };
    }
  }

  return null;
}

function insertBeforeFunction(name, text) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found for insert: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + text + '\n\n' + core.slice(range.start);
}

function replaceFunction(name, replacement) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found for replace: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + replacement + core.slice(range.end);
}

/*
 * 1. Add one canonical read-before-import helper.
 * This does not change the CSV screen.
 * It only ensures import can read the current selected file if state text is empty.
 */
if (!core.includes('function aicmCsvReadCurrentFileTextForImport')) {
  insertBeforeFunction('handleRootClick', `// ${marker}
function aicmCsvReadCurrentFileTextForImport() {
    var existing = String(state.csvImportText || state.csvImportRawText || state.csvImportFileContent || "");

    if (existing.trim()) {
      return Promise.resolve(existing);
    }

    var input = document.getElementById("aicm-ledger-csv-file");
    var file = input && input.files && input.files.length ? input.files[0] : null;

    if (!file) {
      return Promise.resolve("");
    }

    function store(text) {
      var csvText = String(text || "").replace(/^\\uFEFF/, "");
      state.csvImportText = csvText;
      state.csvImportRawText = csvText;
      state.csvImportFileContent = csvText;
      state.csvImportFileName = file.name || state.csvImportFileName || "選択済みCSV";

      try {
        state.csvImportRows = typeof parseCsv === "function" ? parseCsv(csvText) : [];
      } catch (_) {
        state.csvImportRows = [];
      }

      return csvText;
    }

    if (file && typeof file.text === "function") {
      return file.text().then(store);
    }

    return new Promise(function (resolve, reject) {
      try {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(store(reader.result));
        };
        reader.onerror = function () {
          reject(new Error("CSVファイルの読み込みに失敗しました。"));
        };
        reader.readAsText(file, "utf-8");
      } catch (error) {
        reject(error);
      }
    });
  }

async function aicmCsvImportLoadedReadBeforeImport() {
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;

    if (!company || !company.aicm_user_company_id) {
      setMessage("error", "AI企業を選択してください。");
      render();
      return;
    }

    var text = "";

    try {
      text = await aicmCsvReadCurrentFileTextForImport();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSVファイルの読み込みに失敗しました。");
      render();
      return;
    }

    if (!String(text || "").trim()) {
      setMessage("error", "CSVファイルを先に選択してください。");
      render();
      return;
    }

    var rows = typeof parseCsv === "function" ? parseCsv(text) : [];

    if (!Array.isArray(rows) || rows.length === 0) {
      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");
      render();
      return;
    }

    try {
      var payload = {
        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),
        aicm_user_company_id: company.aicm_user_company_id,
        rows: rows
      };

      var result;

      if (typeof aicmPmlwPostJson === "function") {
        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);
      } else {
        var response = await fetch("/api/aicm/v2/manager-major/import-csv", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });

        result = await response.json();

        if (!response.ok || !result || result.result !== "ok") {
          throw new Error((result && result.error_message) || "CSV取り込みに失敗しました。");
        }
      }

      var count = result.inserted_count || result.imported_count || result.created_count || rows.length;
      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";
      setMessage("ok", state.csvImportLastResult);

      if (typeof aicmPmlwReloadContext === "function") {
        await aicmPmlwReloadContext();
      } else if (typeof loadContext === "function") {
        await loadContext();
      }

      state.screen = "task-ledger";
      render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");
      render();
    }
  }`);
}

/*
 * 2. Route import action to the read-before-import helper.
 * Keep file-open/change paths as they are.
 */
{
  const range = findFunctionRange(core, 'handleRootClick');
  if (!range) {
    console.error('handleRootClick not found');
    process.exit(1);
  }

  let fn = range.text;

  const patterns = [
    /if \(action === "task-ledger-csv-import"\) \{\s*await aicmCsvImportLoaded\(\);\s*return;\s*\}/,
    /if \(action === "task-ledger-csv-import"\) \{\s*aicmCsvImportLoaded\(\);\s*return;\s*\}/,
    /if \(action === "task-ledger-csv-import"\) \{\s*await aicmAxuCsvR1ImportCsv\(\);\s*return;\s*\}/,
    /if \(action === "task-ledger-csv-import"\) \{\s*aicmAxuCsvR1ImportCsv\(\);\s*return;\s*\}/
  ];

  let replaced = false;

  for (const re of patterns) {
    if (re.test(fn)) {
      fn = fn.replace(re, [
        'if (action === "task-ledger-csv-import") {',
        '      aicmCsvImportLoadedReadBeforeImport();',
        '      return;',
        '    }'
      ].join('\\n'));
      replaced = true;
      break;
    }
  }

  if (!replaced && !fn.includes('aicmCsvImportLoadedReadBeforeImport()')) {
    const anchor = '    if (action === "go") {';

    if (!fn.includes(anchor)) {
      console.error('handleRootClick go anchor not found');
      process.exit(1);
    }

    fn = fn.replace(anchor, [
      '    if (action === "task-ledger-csv-import") {',
      '      aicmCsvImportLoadedReadBeforeImport();',
      '      return;',
      '    }',
      '',
      anchor
    ].join('\\n'));
  }

  replaceFunction('handleRootClick', fn);
}

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== before));
console.log('markerCount=' + String(countText(core, marker)));
console.log('readBeforeHelperCount=' + String(countText(core, 'function aicmCsvReadCurrentFileTextForImport')));
console.log('readBeforeImportCount=' + String(countText(core, 'async function aicmCsvImportLoadedReadBeforeImport')));
console.log('readBeforeImportCallCount=' + String(countText(core, 'aicmCsvImportLoadedReadBeforeImport();')));
console.log('fileTextCount=' + String(countText(core, 'file.text()')));
console.log('fileReaderCount=' + String(countText(core, 'FileReader')));
console.log('readAsTextCount=' + String(countText(core, 'readAsText')));
console.log('csvStateTextCount=' + String(countText(core, 'state.csvImportText')));
console.log('importEndpointCount=' + String(countText(core, '/api/aicm/v2/manager-major/import-csv')));
console.log('renderCsvImportCardCount=' + String(countText(core, 'function renderCsvImportCard')));
console.log('pasteFallbackCount=' + String(countText(core, 'CSV本文貼り付け') + countText(core, 'aicm-ledger-csv-textarea')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
