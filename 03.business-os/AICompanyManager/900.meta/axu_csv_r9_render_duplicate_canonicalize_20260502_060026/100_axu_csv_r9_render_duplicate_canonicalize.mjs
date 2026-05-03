import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R9_RENDER_DUPLICATE_CANONICAL_V1';

function countRegex(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
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

function findExactFunctionRanges(source, name) {
  const re = new RegExp('function\\s+' + name + '\\s*\\(', 'g');
  const ranges = [];
  let m;

  while ((m = re.exec(source)) !== null) {
    const start = m.index;
    const open = source.indexOf('{', re.lastIndex);
    if (open < 0) continue;

    const close = findMatchingBrace(source, open);
    if (close < 0) continue;

    ranges.push({
      start,
      open,
      close,
      end: close + 1,
      text: source.slice(start, close + 1)
    });
  }

  return ranges;
}

const canonical = `function renderPmlwMajorRows(rows) {
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

    function normalizedRows(inputRows) {
      var list = Array.isArray(inputRows) ? inputRows : [];

      if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
        var company = selectedCompany();
        list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
      }

      if (!Array.isArray(list)) return [];

      return list.filter(function (row) {
        return !!row;
      });
    }

    function majorId(row, index) {
      var known = pick(row, [
        "aicm_manager_major_work_item_id",
        "manager_major_work_item_id",
        "pmlw_major_item_id",
        "major_item_id",
        "id"
      ], "");

      if (known) return String(known);

      if (typeof aicmAxuR1MajorId === "function") {
        var fallback = aicmAxuR1MajorId(row);
        if (fallback) return String(fallback);
      }

      return "major-row-" + String(index);
    }

    var list = normalizedRows(rows);

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
        var id = majorId(row, index);
        var title = pick(row, ["major_item_name", "title", "task_name", "deliverable_name"], "-");
        var description = pick(row, ["major_item_description", "description", "note"], "");
        var department = pick(row, ["department_name", "department_label"], "-");
        var section = pick(row, ["section_name", "section_label"], "-");
        var priority = pick(row, ["priority_code"], "normal");
        var dueDate = pick(row, ["due_date"], "-");
        var status = pick(row, ["handoff_status_code", "decomposition_status_code", "status_code"], "-");

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

const ranges = findExactFunctionRanges(src, 'renderPmlwMajorRows');

if (!ranges.length) {
  console.error('renderPmlwMajorRows function not found');
  process.exit(1);
}

let out = src;

/*
 * Remove duplicate exact renderPmlwMajorRows definitions from the end,
 * then replace the first one with canonical.
 */
for (let i = ranges.length - 1; i >= 0; i -= 1) {
  const r = ranges[i];

  if (i === 0) {
    out = out.slice(0, r.start) + canonical + out.slice(r.end);
  } else {
    out = out.slice(0, r.start) + '\n\n// ' + marker + '_REMOVED_DUPLICATE_' + String(i) + '\n' + out.slice(r.end);
  }
}

fs.writeFileSync(coreFile, out, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('beforeExactRenderCount=' + String(ranges.length));
console.log('afterExactRenderCount=' + String(countRegex(after, /function\s+renderPmlwMajorRows\s*\(/g)));
console.log('baseRenderCount=' + String(countRegex(after, /function\s+renderPmlwMajorRowsBase[A-Za-z0-9_]*\s*\(/g)));
console.log('markerCount=' + String(countText(after, marker)));
console.log('removedDuplicateMarkerCount=' + String(countText(after, marker + '_REMOVED_DUPLICATE_')));
console.log('handoffActionCount=' + String(countText(after, 'pmlw-major-leader-handoff')));
console.log('emptyTextCount=' + String(countText(after, '登録済み大項目はまだありません')));
console.log('pmlwForCompanyRefCount=' + String(countText(after, 'pmlwMajorRowsForCompany')));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
