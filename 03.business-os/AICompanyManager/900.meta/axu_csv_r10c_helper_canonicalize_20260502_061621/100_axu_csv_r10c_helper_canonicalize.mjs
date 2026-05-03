import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R10_TASK_LEDGER_RENDER_CALLSITE_V1';
const helperName = 'aicmAxuCsvR10RenderPmlwMajorRows';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function isWs(ch) {
  return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
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

function findAllFunctionRanges(source, name) {
  const ranges = [];
  const needle = 'function ' + name;
  let pos = 0;

  while (pos < source.length) {
    const start = source.indexOf(needle, pos);
    if (start < 0) break;

    let p = start + needle.length;
    while (p < source.length && isWs(source[p])) p += 1;

    if (source[p] !== '(') {
      pos = start + needle.length;
      continue;
    }

    const open = source.indexOf('{', p);
    if (open < 0) {
      pos = p + 1;
      continue;
    }

    const close = findMatchingBrace(source, open);
    if (close < 0) {
      pos = open + 1;
      continue;
    }

    ranges.push({
      start,
      open,
      close,
      end: close + 1,
      text: source.slice(start, close + 1)
    });

    pos = close + 1;
  }

  return ranges;
}

function findFunctionRange(source, name) {
  const ranges = findAllFunctionRanges(source, name);
  return ranges.length ? ranges[0] : null;
}

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

    function selectedCompanyIdForMajorRows() {
      if (typeof selectedCompany === "function") {
        var company = selectedCompany();
        if (company && company.aicm_user_company_id) return String(company.aicm_user_company_id);
      }

      if (state && state.selectedCompanyId) return String(state.selectedCompanyId);

      return "";
    }

    function rowCompanyId(row) {
      return String(
        row && (
          row.aicm_user_company_id ||
          row.company_id ||
          row.user_company_id ||
          row.companyId ||
          ""
        ) || ""
      );
    }

    function contextRowsForSelectedCompany() {
      var ctx = state && state.context ? state.context : {};
      var companyId = selectedCompanyIdForMajorRows();

      var all = []
        .concat(Array.isArray(ctx.pmlw_major_items) ? ctx.pmlw_major_items : [])
        .concat(Array.isArray(ctx.manager_major_items) ? ctx.manager_major_items : [])
        .concat(Array.isArray(ctx.major_items) ? ctx.major_items : []);

      if (!companyId) return all;

      return all.filter(function (row) {
        var cid = rowCompanyId(row);
        return !cid || cid === companyId;
      });
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

    function rowOrder(row) {
      var n = Number(
        row && (
          row.display_order ||
          row.sort_order ||
          row.row_order ||
          0
        )
      );

      return Number.isFinite(n) ? n : 0;
    }

    function getRows(inputRows) {
      var list = Array.isArray(inputRows) ? inputRows.filter(function (row) { return !!row; }) : [];

      if (!list.length) {
        list = contextRowsForSelectedCompany();
      }

      if (!list.length && typeof selectedCompany === "function" && typeof pmlwMajorRowsForCompany === "function") {
        var company = selectedCompany();
        list = company ? pmlwMajorRowsForCompany(company.aicm_user_company_id) : [];
      }

      list = Array.isArray(list) ? list.filter(function (row) { return !!row; }) : [];

      list.sort(function (a, b) {
        var ao = rowOrder(a);
        var bo = rowOrder(b);

        if (ao !== bo) return ao - bo;

        var an = String(pick(a, ["major_item_name", "title", "task_name", "deliverable_name"], ""));
        var bn = String(pick(b, ["major_item_name", "title", "task_name", "deliverable_name"], ""));

        return an.localeCompare(bn, "ja");
      });

      return list;
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

const beforeHelperRanges = findAllFunctionRanges(src, helperName);

let out = src;

for (let i = beforeHelperRanges.length - 1; i >= 0; i -= 1) {
  const r = beforeHelperRanges[i];
  out = out.slice(0, r.start) + '\n' + out.slice(r.end);
}

let taskRange = findFunctionRange(out, 'renderTaskLedgerPlaceholder');

if (!taskRange) {
  console.error('renderTaskLedgerPlaceholder not found');
  process.exit(1);
}

let taskText = taskRange.text;

taskText = taskText.split('renderPmlwMajorRows(rows)').join(helperName + '(rows)');

if (taskText.indexOf(helperName + '(rows)') < 0) {
  console.error('renderTaskLedgerPlaceholder has no R10 helper call-site after replacement.');
  console.error(taskText);
  process.exit(1);
}

out = out.slice(0, taskRange.start) + taskText + out.slice(taskRange.end);

const refreshedTaskRange = findFunctionRange(out, 'renderTaskLedgerPlaceholder');

if (!refreshedTaskRange) {
  console.error('renderTaskLedgerPlaceholder lost after replacement');
  process.exit(1);
}

out = out.slice(0, refreshedTaskRange.start) + helper + '\n\n' + out.slice(refreshedTaskRange.start);

fs.writeFileSync(coreFile, out, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');
const afterHelperRanges = findAllFunctionRanges(after, helperName);
const afterTaskRange = findFunctionRange(after, 'renderTaskLedgerPlaceholder');
const afterTaskText = afterTaskRange ? afterTaskRange.text : '';

console.log('coreChanged=' + String(before !== after));
console.log('beforeHelperCount=' + String(beforeHelperRanges.length));
console.log('afterHelperCount=' + String(afterHelperRanges.length));
console.log('afterMarkerCount=' + String(countText(after, marker)));
console.log('afterTaskPlaceholderCount=' + String(findAllFunctionRanges(after, 'renderTaskLedgerPlaceholder').length));
console.log('taskHelperCallsiteCount=' + String(countText(afterTaskText, helperName + '(rows)')));
console.log('taskOldRenderCallsiteCount=' + String(countText(afterTaskText, 'renderPmlwMajorRows(rows)')));
console.log('globalOldRenderCallsiteCount=' + String(countText(after, 'renderPmlwMajorRows(rows)')));
console.log('directContextPmlwRefCount=' + String(countText(after, 'ctx.pmlw_major_items')));
console.log('handoffActionCount=' + String(countText(after, 'pmlw-major-leader-handoff')));
console.log('emptyTextCount=' + String(countText(after, '登録済み大項目はまだありません')));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
