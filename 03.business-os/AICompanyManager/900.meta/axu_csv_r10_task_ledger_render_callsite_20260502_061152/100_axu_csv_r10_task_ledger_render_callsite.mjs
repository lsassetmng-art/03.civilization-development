import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R10_TASK_LEDGER_RENDER_CALLSITE_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function countRegex(text, re) {
  const m = String(text || '').match(re);
  return m ? m.length : 0;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

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

    if (depth === 0) return i;
  }

  return -1;
}

function findFunctionRange(source, name) {
  const re = new RegExp('function\\s+' + name + '\\s*\\(', 'g');
  const m = re.exec(source);
  if (!m) return null;

  const start = m.index;
  const open = source.indexOf('{', re.lastIndex);
  if (open < 0) return null;

  const close = findMatchingBrace(source, open);
  if (close < 0) return null;

  return {
    start,
    open,
    close,
    end: close + 1,
    text: source.slice(start, close + 1)
  };
}

const helperName = 'aicmAxuCsvR10RenderPmlwMajorRows';

const helper = `function ${helperName}(rows) {
    // ${marker}
    function h(value) {
      if (typeof escapeHtml === "function") return escapeHtml(value);
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function pick(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function rowId(row, index) {
      var direct = pick(row, [
        "aicm_manager_major_work_item_id",
        "manager_major_work_item_id",
        "pmlw_major_item_id",
        "major_item_id",
        "id"
      ], "");

      if (direct) return String(direct);

      if (typeof aicmAxuR1MajorId === "function") {
        var fallback = aicmAxuR1MajorId(row);
        if (fallback) return String(fallback);
      }

      return "major-row-" + String(index);
    }

    function getRows(inputRows) {
      var list = Array.isArray(inputRows) ? inputRows : [];

      if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
        var company = selectedCompany();
        list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
      }

      return Array.isArray(list) ? list.filter(function (row) { return !!row; }) : [];
    }

    var list = getRows(rows);

    if (!list.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>President起点でAI企業業務を開始するか、CSVで部長/Manager分解済みの大項目を取り込むと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-table-wrap">',
      '  <table class="aicm-table">',
      '    <thead>',
      '      <tr>',
      '        <th>大項目</th>',
      '        <th>部門</th>',
      '        <th>課</th>',
      '        <th>優先度</th>',
      '        <th>期限</th>',
      '        <th>状態</th>',
      '        <th>操作</th>',
      '      </tr>',
      '    </thead>',
      '    <tbody>',
      list.map(function (row, index) {
        var title = pick(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
        var description = pick(row, ["major_item_description", "description", "note"], "");
        var department = pick(row, ["department_name", "department_label"], "-");
        var section = pick(row, ["section_name", "section_label"], "-");
        var priority = pick(row, ["priority_code"], "normal");
        var dueDate = pick(row, ["due_date"], "-");
        var status = pick(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");
        var id = rowId(row, index);

        return [
          '      <tr>',
          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
          '        <td>' + h(department) + '</td>',
          '        <td>' + h(section) + '</td>',
          '        <td>' + h(priority) + '</td>',
          '        <td>' + h(dueDate || "-") + '</td>',
          '        <td>' + h(status || "-") + '</td>',
          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }`;

let taskRange = findFunctionRange(src, 'renderTaskLedgerPlaceholder');

if (!taskRange) {
  console.error('renderTaskLedgerPlaceholder not found');
  process.exit(1);
}

let taskText = taskRange.text;
const beforeTaskText = taskText;

if (taskText.indexOf('renderPmlwMajorRows(rows)') >= 0) {
  taskText = taskText.replace(/renderPmlwMajorRows\s*\(\s*rows\s*\)/g, helperName + '(rows)');
} else if (taskText.indexOf('登録済み大項目はまだありません') >= 0) {
  console.error('renderTaskLedgerPlaceholder appears to contain fixed empty text but no renderPmlwMajorRows(rows) call. Stop.');
  console.error(taskText);
  process.exit(1);
} else {
  console.error('renderTaskLedgerPlaceholder does not call renderPmlwMajorRows(rows). Stop.');
  console.error(taskText);
  process.exit(1);
}

if (taskText === beforeTaskText) {
  console.error('renderTaskLedgerPlaceholder call-site was not changed.');
  process.exit(1);
}

let out = src.slice(0, taskRange.start) + taskText + src.slice(taskRange.end);

/*
 * Replace previous R10 helper if present; otherwise insert just before renderTaskLedgerPlaceholder.
 */
const existingHelperRange = findFunctionRange(out, helperName);
if (existingHelperRange) {
  out = out.slice(0, existingHelperRange.start) + helper + out.slice(existingHelperRange.end);
} else {
  const refreshedTaskRange = findFunctionRange(out, 'renderTaskLedgerPlaceholder');
  if (!refreshedTaskRange) {
    console.error('renderTaskLedgerPlaceholder lost after replacement');
    process.exit(1);
  }
  out = out.slice(0, refreshedTaskRange.start) + helper + '\n\n' + out.slice(refreshedTaskRange.start);
}

fs.writeFileSync(coreFile, out, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('markerCount=' + String(countText(after, marker)));
console.log('helperCount=' + String(countRegex(after, new RegExp('function\\\\s+' + helperName + '\\\\s*\\\\(', 'g'))));
console.log('taskPlaceholderCount=' + String(countRegex(after, /function\s+renderTaskLedgerPlaceholder\s*\(/g)));
console.log('callsiteCount=' + String(countText(after, helperName + '(rows)')));
console.log('oldCallsiteCount=' + String(countText(after, 'renderPmlwMajorRows(rows)')));
console.log('handoffActionCount=' + String(countText(after, 'pmlw-major-leader-handoff')));
console.log('emptyTextCount=' + String(countText(after, '登録済み大項目はまだありません')));
console.log('pmlwForCompanyRefCount=' + String(countText(after, 'pmlwMajorRowsForCompany')));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
