import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
const before = fs.readFileSync(coreFile, 'utf8');
let src = before;

const canonicalMarker = 'AICM_MANAGER_MAJOR_RENDER_CANONICAL_V1';

const legacyHelperName = 'aicmAxuCsvR10RenderPmlwMajorRows';
const rowsHelperName = 'aicmGetManagerMajorRowsForSelectedCompany';
const renderHelperName = 'aicmRenderManagerMajorRows';

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

    ranges.push({ start, open, close, end: close + 1, text: source.slice(start, close + 1) });
    pos = close + 1;
  }

  return ranges;
}

function removeAllFunctions(source, name) {
  const ranges = findAllFunctionRanges(source, name);
  let out = source;

  for (let i = ranges.length - 1; i >= 0; i -= 1) {
    const r = ranges[i];
    out = out.slice(0, r.start) + '\n' + out.slice(r.end);
  }

  return { out, removedCount: ranges.length };
}

function firstFunctionRange(source, name) {
  const ranges = findAllFunctionRanges(source, name);
  return ranges.length ? ranges[0] : null;
}

const canonicalBlock = `function ${rowsHelperName}(companyId) {
    // ${canonicalMarker}: rows
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

    var rows = []
      .concat(asArray(ctx.pmlw_major_items))
      .concat(asArray(ctx.manager_major_items))
      .concat(asArray(ctx.major_items));

    rows = rows.filter(function (row) {
      if (!row) return false;

      var cid = rowCompanyId(row);

      if (!selectedId) return true;
      if (!cid) return true;

      return cid === selectedId;
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

  function ${renderHelperName}(rows) {
    // ${canonicalMarker}: render
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

const canonicalPlaceholder = `function renderTaskLedgerPlaceholder() {
    // ${canonicalMarker}: screen
    var company = typeof selectedCompany === "function" ? selectedCompany() : null;
    var companyId = company && company.aicm_user_company_id ? company.aicm_user_company_id : "";
    var rows = ${rowsHelperName}(companyId);

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">部門別タスク台帳</p>',
      '  <h2>部門別タスク台帳</h2>',
      company ? '<p class="aicm-selected-note">対象会社: <strong>' + escapeHtml(company.company_name) + '</strong></p>' : '<p class="aicm-core-empty">AI企業を選択してください。</p>',
      '  <p class="aicm-selected-note">President方針やユーザー依頼を、部長/Managerが大項目として整理し、課長/Leaderへ引き渡すための台帳です。CSV取り込みは部長/Manager分解の代替入力です。</p>',
      '</section>',
      renderCsvImportCard(company),
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Manager大項目</p>',
      '  <h2>登録済み大項目</h2>',
      ${renderHelperName}(rows),
      '</section>'
    ].join(""));
  }`;

const beforeLegacyHelperCount = findAllFunctionRanges(src, legacyHelperName).length;
const beforeRowsHelperCount = findAllFunctionRanges(src, rowsHelperName).length;
const beforeRenderHelperCount = findAllFunctionRanges(src, renderHelperName).length;
const beforePlaceholderCount = findAllFunctionRanges(src, 'renderTaskLedgerPlaceholder').length;

let result = removeAllFunctions(src, legacyHelperName);
src = result.out;
result = removeAllFunctions(src, rowsHelperName);
src = result.out;
result = removeAllFunctions(src, renderHelperName);
src = result.out;

const placeholderRange = firstFunctionRange(src, 'renderTaskLedgerPlaceholder');

if (!placeholderRange) {
  console.error('renderTaskLedgerPlaceholder not found');
  process.exit(1);
}

src = src.slice(0, placeholderRange.start) + canonicalBlock + '\n\n' + canonicalPlaceholder + src.slice(placeholderRange.end);

fs.writeFileSync(coreFile, src, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('beforeLegacyHelperCount=' + String(beforeLegacyHelperCount));
console.log('beforeRowsHelperCount=' + String(beforeRowsHelperCount));
console.log('beforeRenderHelperCount=' + String(beforeRenderHelperCount));
console.log('beforePlaceholderCount=' + String(beforePlaceholderCount));
console.log('afterLegacyHelperCount=' + String(findAllFunctionRanges(after, legacyHelperName).length));
console.log('afterRowsHelperCount=' + String(findAllFunctionRanges(after, rowsHelperName).length));
console.log('afterRenderHelperCount=' + String(findAllFunctionRanges(after, renderHelperName).length));
console.log('afterPlaceholderCount=' + String(findAllFunctionRanges(after, 'renderTaskLedgerPlaceholder').length));
console.log('canonicalMarkerCount=' + String(countText(after, canonicalMarker)));
console.log('pmlwMajorContextRefCount=' + String(countText(after, 'ctx.pmlw_major_items')));
console.log('managerMajorContextRefCount=' + String(countText(after, 'ctx.manager_major_items')));
console.log('majorItemsContextRefCount=' + String(countText(after, 'ctx.major_items')));
console.log('oldPlaceholderCallsiteCount=' + String(countText(after, 'renderPmlwMajorRows(rows)')));
console.log('handoffActionCount=' + String(countText(after, 'pmlw-major-leader-handoff')));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
