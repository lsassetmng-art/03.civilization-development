import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

const marker = 'AICM_AXU_CSV_R1_FILE_CHANGE_HANDLER_V1';

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
    console.error('function not found for insertBeforeFunction: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + text + '\n\n' + core.slice(range.start);
}

function replaceFunction(name, replacement) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found for replaceFunction: ' + name);
    process.exit(1);
  }
  core = core.slice(0, range.start) + replacement + core.slice(range.end);
}

/*
 * 1. Add CSV helper functions once.
 * Keep them small and app-local. No token exposure. No DB access here.
 */
if (!core.includes('function aicmAxuCsvR1OpenFileInput()')) {
  insertBeforeFunction('handleRootClick', [
    '// ' + marker,
    'function aicmAxuCsvR1OpenFileInput() {',
    '    var input = document.getElementById("aicm-ledger-csv-file");',
    '    if (!input) {',
    '      setMessage("error", "CSVファイル入力が見つかりません。");',
    '      render();',
    '      return;',
    '    }',
    '',
    '    try {',
    '      input.value = "";',
    '    } catch (_) {}',
    '',
    '    input.click();',
    '  }',
    '',
    'function aicmAxuCsvR1ReadSelectedFile(input) {',
    '    var file = input && input.files && input.files.length ? input.files[0] : null;',
    '',
    '    if (!file) {',
    '      state.csvImportFileName = "未選択";',
    '      state.csvImportText = "";',
    '      state.csvImportRows = [];',
    '      setMessage("error", "CSVファイルが選択されていません。");',
    '      render();',
    '      return;',
    '    }',
    '',
    '    function finish(text) {',
    '      var csvText = String(text || "").replace(/^\\uFEFF/, "");',
    '      state.csvImportFileName = file.name || "選択済みCSV";',
    '      state.csvImportText = csvText;',
    '      state.csvImportRawText = csvText;',
    '      state.csvImportFileContent = csvText;',
    '      state.csvImportLastResult = "";',
    '',
    '      try {',
    '        state.csvImportRows = typeof parseCsv === "function" ? parseCsv(csvText) : [];',
    '      } catch (_) {',
    '        state.csvImportRows = [];',
    '      }',
    '',
    '      setMessage("ok", "CSVファイルを読み込みました: " + state.csvImportFileName);',
    '      render();',
    '    }',
    '',
    '    function failRead(error) {',
    '      state.csvImportFileName = file.name || "選択済みCSV";',
    '      state.csvImportText = "";',
    '      state.csvImportRows = [];',
    '      setMessage("error", error && error.message ? error.message : "CSVファイルの読み込みに失敗しました。");',
    '      render();',
    '    }',
    '',
    '    if (file && typeof file.text === "function") {',
    '      file.text().then(finish).catch(failRead);',
    '      return;',
    '    }',
    '',
    '    var reader = new FileReader();',
    '    reader.onload = function () { finish(reader.result); };',
    '    reader.onerror = function () { failRead(new Error("CSVファイルの読み込みに失敗しました。")); };',
    '    reader.readAsText(file, "utf-8");',
    '  }',
    '',
    'async function aicmAxuCsvR1ImportCsv() {',
    '    var company = typeof selectedCompany === "function" ? selectedCompany() : null;',
    '',
    '    if (!company || !company.aicm_user_company_id) {',
    '      setMessage("error", "AI企業を選択してください。");',
    '      render();',
    '      return;',
    '    }',
    '',
    '    var text = String(state.csvImportText || state.csvImportRawText || state.csvImportFileContent || "");',
    '',
    '    if (!text.trim()) {',
    '      setMessage("error", "CSVファイルを先に読み込んでください。");',
    '      render();',
    '      return;',
    '    }',
    '',
    '    var rows = typeof parseCsv === "function" ? parseCsv(text) : [];',
    '',
    '    if (!Array.isArray(rows) || rows.length === 0) {',
    '      setMessage("error", "取り込めるCSV行がありません。ヘッダーとデータ行を確認してください。");',
    '      render();',
    '      return;',
    '    }',
    '',
    '    try {',
    '      var payload = {',
    '        owner_civilization_id: typeof aicmPmlwOwnerId === "function" ? aicmPmlwOwnerId() : ownerCivilizationId(),',
    '        aicm_user_company_id: company.aicm_user_company_id,',
    '        rows: rows',
    '      };',
    '',
    '      var result;',
    '',
    '      if (typeof aicmPmlwPostJson === "function") {',
    '        result = await aicmPmlwPostJson("/api/aicm/v2/manager-major/import-csv", payload);',
    '      } else {',
    '        var response = await fetch("/api/aicm/v2/manager-major/import-csv", {',
    '          method: "POST",',
    '          headers: { "content-type": "application/json" },',
    '          body: JSON.stringify(payload)',
    '        });',
    '        result = await response.json();',
    '        if (!response.ok || !result || result.result !== "ok") {',
    '          throw new Error((result && result.error_message) || "CSV取り込みに失敗しました。");',
    '        }',
    '      }',
    '',
    '      var count = result.inserted_count || result.imported_count || result.created_count || rows.length;',
    '      state.csvImportLastResult = "CSV取り込み完了: " + count + "件";',
    '      setMessage("ok", state.csvImportLastResult);',
    '',
    '      if (typeof aicmPmlwReloadContext === "function") {',
    '        await aicmPmlwReloadContext();',
    '      } else if (typeof loadContext === "function") {',
    '        await loadContext();',
    '      } else {',
    '        render();',
    '      }',
    '',
    '      state.screen = "task-ledger";',
    '      render();',
    '    } catch (error) {',
    '      setMessage("error", error && error.message ? error.message : "CSV取り込みに失敗しました。");',
    '      render();',
    '    }',
    '  }'
  ].join('\n'));
}

/*
 * 2. Wire click handler:
 * - CSVファイル読込 -> hidden input click
 * - CSV取り込み実行 -> import helper
 */
{
  const range = findFunctionRange(core, 'handleRootClick');
  if (!range) {
    console.error('handleRootClick not found');
    process.exit(1);
  }

  let fn = range.text;

  if (!fn.includes('aicmAxuCsvR1OpenFileInput()')) {
    const branch = [
      '    if (action === "task-ledger-csv-file-open") {',
      '      aicmAxuCsvR1OpenFileInput();',
      '      return;',
      '    }',
      ''
    ].join('\n');

    const anchor = '    if (action === "go") {';

    if (!fn.includes(anchor)) {
      console.error('handleRootClick go anchor not found');
      process.exit(1);
    }

    fn = fn.replace(anchor, branch + anchor);
  }

  if (!fn.includes('aicmAxuCsvR1ImportCsv()')) {
    const branch = [
      '    if (action === "task-ledger-csv-import") {',
      '      aicmAxuCsvR1ImportCsv();',
      '      return;',
      '    }',
      ''
    ].join('\n');

    const anchor = '    if (action === "go") {';

    if (!fn.includes(anchor)) {
      console.error('handleRootClick go anchor not found for import');
      process.exit(1);
    }

    fn = fn.replace(anchor, branch + anchor);
  }

  replaceFunction('handleRootClick', fn);
}

/*
 * 3. Wire change handler:
 * hidden file input change -> read file into state.
 */
{
  const range = findFunctionRange(core, 'handleRootChange');
  if (!range) {
    console.error('handleRootChange not found');
    process.exit(1);
  }

  let fn = range.text;

  if (!fn.includes('aicmAxuCsvR1ReadSelectedFile')) {
    const anchor = '    var fieldName = field.getAttribute("data-core-field") || "";';

    if (!fn.includes(anchor)) {
      console.error('handleRootChange fieldName anchor not found');
      process.exit(1);
    }

    const insert = [
      '    var fileKind = field.getAttribute("data-core-file") || "";',
      '    if (fileKind === "task-ledger-csv") {',
      '      aicmAxuCsvR1ReadSelectedFile(field);',
      '      return;',
      '    }',
      '',
      anchor
    ].join('\n');

    fn = fn.replace(anchor, insert);
  }

  replaceFunction('handleRootChange', fn);
}

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== before));
console.log('markerCount=' + String(countText(core, marker)));
console.log('openHelperCount=' + String(countText(core, 'function aicmAxuCsvR1OpenFileInput()')));
console.log('readHelperCount=' + String(countText(core, 'function aicmAxuCsvR1ReadSelectedFile')));
console.log('importHelperCount=' + String(countText(core, 'async function aicmAxuCsvR1ImportCsv()')));
console.log('fileTextCount=' + String(countText(core, 'file.text()')));
console.log('fileReaderCount=' + String(countText(core, 'FileReader')));
console.log('readAsTextCount=' + String(countText(core, 'readAsText')));
console.log('fileOpenBranchCount=' + String(countText(core, 'action === "task-ledger-csv-file-open"')));
console.log('csvImportBranchCount=' + String(countText(core, 'action === "task-ledger-csv-import"')));
console.log('dataCoreFileChangeCount=' + String(countText(core, 'fileKind === "task-ledger-csv"')));
console.log('csvStateTextCount=' + String(countText(core, 'state.csvImportText')));
console.log('serverImportEndpointCount=' + String(countText(core, '/api/aicm/v2/manager-major/import-csv')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
