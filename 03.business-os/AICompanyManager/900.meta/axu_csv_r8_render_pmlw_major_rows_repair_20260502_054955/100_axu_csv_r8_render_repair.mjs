import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R8_RENDER_PMLW_MAJOR_ROWS_REPAIR_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function findFunctionStart(source, name) {
  const patterns = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];

  let best = -1;

  for (const p of patterns) {
    const i = source.indexOf(p);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }

  return best;
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
  const start = findFunctionStart(source, name);
  if (start < 0) return null;

  const open = source.indexOf('{', start);
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

const replacement = `function renderPmlwMajorRows(rows) {
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

    function value(row, keys, fallback) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") return row[key];
      }
      return fallback == null ? "" : fallback;
    }

    function rowId(row, index) {
      if (typeof aicmAxuR1MajorId === "function") {
        var id = aicmAxuR1MajorId(row);
        if (id) return id;
      }

      return String(
        value(row, [
          "aicm_manager_major_work_item_id",
          "manager_major_work_item_id",
          "pmlw_major_item_id",
          "major_item_id",
          "id"
        ], "row-" + String(index))
      );
    }

    var list = Array.isArray(rows) ? rows : [];

    if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
      var company = selectedCompany();
      list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
    }

    if (!Array.isArray(list) || list.length === 0) {
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
        var id = rowId(row, index);
        var title = value(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
        var description = value(row, ["major_item_description", "description", "note"], "");
        var department = value(row, ["department_name", "department_label"], "-");
        var section = value(row, ["section_name", "section_label"], "-");
        var priority = value(row, ["priority_code"], "normal");
        var dueDate = value(row, ["due_date"], "-");
        var status = value(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");

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

const range = findFunctionRange(src, 'renderPmlwMajorRows');

if (!range) {
  console.error('function renderPmlwMajorRows not found');
  process.exit(1);
}

src = src.slice(0, range.start) + replacement + src.slice(range.end);
fs.writeFileSync(coreFile, src, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('markerCount=' + String(countText(after, marker)));
console.log('renderPmlwMajorRowsCount=' + String(countText(after, 'function renderPmlwMajorRows')));
console.log('leaderHandoffActionCount=' + String(countText(after, 'pmlw-major-leader-handoff')));
console.log('emptyTextCount=' + String(countText(after, '登録済み大項目はまだありません')));
console.log('pmlwMajorRowsForCompanyRefCount=' + String(countText(after, 'pmlwMajorRowsForCompany')));
console.log('selectedCompanyRefCount=' + String(countText(after, 'selectedCompany')));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
