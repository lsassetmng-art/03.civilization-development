import fs from 'node:fs';

const file = process.env.CORE;
let src = fs.readFileSync(file, 'utf8');
const before = src;

const marker = 'AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1';

const functionNamesToReplace = [
  'aicmGetManagerMajorRowsForSelectedCompany',
  'aicmRenderManagerMajorRows',
  'aicmReloadTaskLedgerContext',
  'aicmAxuCsvR10RenderPmlwMajorRows'
];

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
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
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

    ranges.push({ start, end: close + 1, text: source.slice(start, close + 1) });
    pos = close + 1;
  }

  return ranges;
}

function removeAllFunctions(source, name) {
  const ranges = findAllFunctionRanges(source, name);
  let out = source;

  for (let i = ranges.length - 1; i >= 0; i -= 1) {
    out = out.slice(0, ranges[i].start) + '\n' + out.slice(ranges[i].end);
  }

  return out;
}

function firstFunctionRange(source, name) {
  const ranges = findAllFunctionRanges(source, name);
  return ranges.length ? ranges[0] : null;
}

function replaceFunction(source, name, replacement) {
  const range = firstFunctionRange(source, name);
  if (!range) return null;
  return source.slice(0, range.start) + replacement + source.slice(range.end);
}

const canonicalBlock = `function aicmGetManagerMajorRowsForSelectedCompany(companyId) {
    // ${marker}: rows
    var ctx = state && state.context ? state.context : {};
    var selectedId = String(companyId || "");

    if (!selectedId && state && state.selectedCompanyId) {
      selectedId = String(state.selectedCompanyId || "");
    }

    if (!selectedId && typeof selectedCompany === "function") {
      var company = selectedCompany();
      if (company && company.aicm_user_company_id) {
        selectedId = String(company.aicm_user_company_id || "");
      }
    }

    function asArray(value) {
      return Array.isArray(value) ? value : [];
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

    function statusText(row, keys) {
      for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        if (row && row[key] != null && String(row[key]) !== "") {
          return String(row[key]).toLowerCase();
        }
      }

      return "";
    }

    function isPendingMajor(row) {
      var handoff = statusText(row, ["handoff_status_code", "handoff_status", "leader_handoff_status_code"]);
      var decomposition = statusText(row, ["decomposition_status_code", "work_status_code", "status_code"]);

      var closed = {
        sent: true,
        handed_off: true,
        leader_handoff_done: true,
        submitted: true,
        delivered: true,
        done: true,
        completed: true,
        complete: true,
        cancelled: true,
        canceled: true,
        archived: true
      };

      if (closed[handoff]) return false;
      if (closed[decomposition]) return false;

      return true;
    }

    function rowOrder(row) {
      var n = Number(row && (row.display_order || row.sort_order || row.row_order || 0));
      return Number.isFinite(n) ? n : 0;
    }

    var rows = []
      .concat(asArray(ctx.pmlw_major_items))
      .concat(asArray(ctx.manager_major_items))
      .concat(asArray(ctx.major_items));

    rows = rows.filter(function (row) {
      if (!row) return false;

      var cid = rowCompanyId(row);

      if (selectedId && cid && cid !== selectedId) return false;

      return isPendingMajor(row);
    });

    rows.sort(function (a, b) {
      var ao = rowOrder(a);
      var bo = rowOrder(b);

      if (ao !== bo) return ao - bo;

      var an = String((a && (a.major_item_name || a.title || a.task_name || a.deliverable_name)) || "");
      var bn = String((b && (b.major_item_name || b.title || b.task_name || b.deliverable_name)) || "");

      return an.localeCompare(bn, "ja");
    });

    return rows;
  }

  function aicmRenderManagerMajorRows(rows) {
    // ${marker}: render
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

      return "manager-major-row-" + String(index);
    }

    var list = Array.isArray(rows) ? rows.filter(function (row) { return !!row; }) : [];

    if (!list.length) {
      return [
        '<div class="aicm-empty-state">',
        '  <strong>登録済み大項目はまだありません</strong>',
        '  <p>未実行の大項目がDBに登録されていません。AI企業業務開始またはCSV取り込みを行うと、ここに表示されます。</p>',
        '</div>'
      ].join("");
    }

    return [
      '<div class="aicm-selected-note">未実行大項目: <strong>' + String(list.length) + '</strong>件</div>',
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
        var handoff = pick(row, ["handoff_status_code", "handoff_status"], "draft");
        var decomposition = pick(row, ["decomposition_status_code", "status_code"], "not_started");
        var id = rowId(row, index);

        return [
          '      <tr>',
          '        <td><strong>' + h(title) + '</strong>' + (description ? '<p class="aicm-selected-note">' + h(description) + '</p>' : '') + '</td>',
          '        <td>' + h(department) + '</td>',
          '        <td>' + h(section) + '</td>',
          '        <td>' + h(priority) + '</td>',
          '        <td>' + h(dueDate || "-") + '</td>',
          '        <td>' + h(decomposition) + ' / ' + h(handoff) + '</td>',
          '        <td><button type="button" data-core-action="pmlw-major-leader-handoff" data-pmlw-major-id="' + h(id) + '">課長へ送る</button></td>',
          '      </tr>'
        ].join("");
      }).join(""),
      '    </tbody>',
      '  </table>',
      '</div>'
    ].join("");
  }

  async function aicmReloadTaskLedgerContext() {
    // ${marker}: reload
    state.screen = "task-ledger";
    state.errorMessage = "";

    if (typeof loadContext === "function") {
      await loadContext();
    }

    state.screen = "task-ledger";

    if (typeof render === "function") {
      render();
    }
  }`;

const canonicalPlaceholder = `function renderTaskLedgerPlaceholder() {
    // ${marker}: screen
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">未実行のManager大項目だけをDB/contextから表示します。CSV取り込みは部長/Manager分解済み大項目の新規追加です。</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="task-ledger-refresh">登録済み大項目をリロード</button>',
      '  </div>',
      '</section>',
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      aicmRenderManagerMajorRows(rows),
      '</section>'
    ].join(""));
  }`;

for (const name of functionNamesToReplace) {
  src = removeAllFunctions(src, name);
}

const placeholderRange = firstFunctionRange(src, 'renderTaskLedgerPlaceholder');
if (!placeholderRange) {
  console.error('renderTaskLedgerPlaceholder not found');
  process.exit(1);
}

src = src.slice(0, placeholderRange.start) + canonicalBlock + '\n\n' + canonicalPlaceholder + src.slice(placeholderRange.end);

const clickRange = firstFunctionRange(src, 'handleRootClick');
if (!clickRange) {
  console.error('handleRootClick not found');
  process.exit(1);
}

let clickText = clickRange.text;

if (clickText.indexOf('action === "task-ledger-refresh"') < 0) {
  const insertBlock = `
    if (action === "task-ledger-refresh") {
      aicmReloadTaskLedgerContext();
      return;
    }

`;

  const reloadNeedle = '    if (action === "reload")';
  const idx = clickText.indexOf(reloadNeedle);

  if (idx >= 0) {
    clickText = clickText.slice(0, idx) + insertBlock + clickText.slice(idx);
  } else {
    const lastBrace = clickText.lastIndexOf('}');
    clickText = clickText.slice(0, lastBrace) + insertBlock + clickText.slice(lastBrace);
  }

  src = src.slice(0, clickRange.start) + clickText + src.slice(clickRange.end);
}

src = src.split('await aicmPmlwReloadContext();').join('await aicmReloadTaskLedgerContext();');

fs.writeFileSync(file, src, 'utf8');

const after = fs.readFileSync(file, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('markerCount=' + countText(after, marker));
console.log('rowsHelperCount=' + findAllFunctionRanges(after, 'aicmGetManagerMajorRowsForSelectedCompany').length);
console.log('renderHelperCount=' + findAllFunctionRanges(after, 'aicmRenderManagerMajorRows').length);
console.log('reloadHelperCount=' + findAllFunctionRanges(after, 'aicmReloadTaskLedgerContext').length);
console.log('placeholderCount=' + findAllFunctionRanges(after, 'renderTaskLedgerPlaceholder').length);
console.log('legacyR10HelperCount=' + findAllFunctionRanges(after, 'aicmAxuCsvR10RenderPmlwMajorRows').length);
console.log('taskRefreshActionCount=' + countText(after, 'task-ledger-refresh'));
console.log('csvImportReloadCallCount=' + countText(after, 'await aicmReloadTaskLedgerContext();'));
console.log('oldCsvImportReloadCallCount=' + countText(after, 'await aicmPmlwReloadContext();'));
console.log('pendingFilterRefCount=' + countText(after, 'isPendingMajor'));
console.log('handoffActionCount=' + countText(after, 'pmlw-major-leader-handoff'));
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
