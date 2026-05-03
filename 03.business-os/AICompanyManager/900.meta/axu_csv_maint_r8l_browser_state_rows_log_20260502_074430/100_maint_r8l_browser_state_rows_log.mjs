import fs from 'node:fs';

const file = process.env.CORE;
const before = fs.readFileSync(file, 'utf8');
let src = before;

const marker = 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1';
const fnNeedle = 'function renderTaskLedgerPlaceholder';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

const start = src.indexOf(fnNeedle);
if (start < 0) {
  console.error('renderTaskLedgerPlaceholder not found');
  process.exit(1);
}

let end = src.indexOf('// AICM_HUMAN_REVIEW_QUEUE_CORE_ARO_ART_V1', start);
if (end < 0) end = src.indexOf('function aicmHumanReviewOwnerId', start);
if (end < 0) {
  console.error('next anchor after renderTaskLedgerPlaceholder not found');
  process.exit(1);
}

let windowText = src.slice(start, end);

console.log('beforeMarkerCount=' + countText(src, marker));
console.log('placeholderCount=' + countText(src, fnNeedle));

if (countText(src, fnNeedle) !== 1) {
  console.error('Expected exactly one renderTaskLedgerPlaceholder');
  process.exit(1);
}

if (countText(src, marker) > 0) {
  console.log('alreadyInstrumented=true');
} else {
  const rowsLine = '    var rows = aicmGetManagerMajorRowsForSelectedCompany(companyId);\n';
  if (!windowText.includes(rowsLine)) {
    console.error('Expected rows assignment line not found in placeholder window.');
    process.exit(1);
  }

  const debugCode = `    var aicmR8lDebug = (function () {
      // ${marker}
      var ctx = (typeof state !== "undefined" && state && state.context) ? state.context : {};

      function isArray(value) {
        return Array.isArray(value);
      }

      function count(key) {
        return isArray(ctx[key]) ? ctx[key].length : -1;
      }

      function text(value) {
        return String(value == null ? "" : value);
      }

      function sampleRow(row) {
        if (!row) return null;

        return {
          aicm_user_company_id: text(row.aicm_user_company_id),
          company_name: text(row.company_name),
          id: text(row.aicm_manager_major_work_item_id || row.pmlw_major_item_id || row.major_item_id || row.id),
          major_item_name: text(row.major_item_name || row.title || row.task_name || row.deliverable_name),
          handoff_status_code: text(row.handoff_status_code || row.handoff_status),
          decomposition_status_code: text(row.decomposition_status_code || row.status_code),
          priority_code: text(row.priority_code),
          due_date: text(row.due_date)
        };
      }

      var rowsArray = Array.isArray(rows) ? rows : [];
      var pmlwRows = Array.isArray(ctx.pmlw_major_items) ? ctx.pmlw_major_items : [];
      var managerRows = Array.isArray(ctx.manager_major_items) ? ctx.manager_major_items : [];
      var majorRows = Array.isArray(ctx.major_items) ? ctx.major_items : [];
      var allRows = [].concat(pmlwRows).concat(managerRows).concat(majorRows);
      var selectedId = text(companyId);
      var contextSelectedRows = selectedId
        ? allRows.filter(function (row) { return text(row && row.aicm_user_company_id) === selectedId; })
        : allRows;

      var snapshot = {
        marker: "${marker}",
        screen: text(state && state.screen),
        selectedCompanyId_state: text(state && state.selectedCompanyId),
        selectedCompanyId_arg: selectedId,
        selectedCompanyName: text(company && company.company_name),
        contextType: Object.prototype.toString.call(ctx),
        contextKeys: Object.keys(ctx).sort(),
        contextCounts: {
          companies: count("companies"),
          departments: count("departments"),
          sections: count("sections"),
          task_ledger: count("task_ledger"),
          pmlw_major_items: count("pmlw_major_items"),
          manager_major_items: count("manager_major_items"),
          major_items: count("major_items")
        },
        contextAllMajorRowsLength: allRows.length,
        contextSelectedMajorRowsLength: contextSelectedRows.length,
        contextFirstSelectedMajorRow: sampleRow(contextSelectedRows[0]),
        rowsType: Object.prototype.toString.call(rows),
        rowsIsArray: Array.isArray(rows),
        rowsLength: rowsArray.length,
        rowsFirst: sampleRow(rowsArray[0]),
        displayScope: text(state && state.__managerMajorDisplayScope),
        errorMessage: text(state && state.errorMessage),
        noticeMessage: text(state && state.noticeMessage)
      };

      try {
        console.log("AICM_TASK_LEDGER_DEBUG", JSON.stringify(snapshot));
      } catch (_) {}

      var pretty = "";
      try {
        pretty = JSON.stringify(snapshot, null, 2);
      } catch (_) {
        pretty = String(snapshot);
      }

      var html = [
        '<section class="aicm-core-card aicm-debug-card" style="border:2px dashed #94a3b8;">',
        '  <p class="aicm-eyebrow">DEBUG / state.context & rows</p>',
        '  <h2>表示診断ログ</h2>',
        '  <p class="aicm-selected-note">このパネルは一時診断用です。DB/API書込はしていません。</p>',
        '  <pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:420px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(pretty) + '</pre>',
        '</section>'
      ].join("");

      return {
        snapshot: snapshot,
        html: html
      };
    })();
`;

  windowText = windowText.replace(rowsLine, rowsLine + debugCode);

  const insertNeedle = "      '  <div class=\"aicm-dashboard-action-row\">',\n";
  if (!windowText.includes(insertNeedle)) {
    console.error('dashboard action row anchor not found in placeholder window.');
    process.exit(1);
  }

  windowText = windowText.replace(insertNeedle, "      aicmR8lDebug.html,\n" + insertNeedle);

  src = src.slice(0, start) + windowText + src.slice(end);
  fs.writeFileSync(file, src, 'utf8');
}

const after = fs.readFileSync(file, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('markerCount=' + countText(after, marker));
console.log('placeholderCount=' + countText(after, fnNeedle));
console.log('debugConsoleCount=' + countText(after, 'AICM_TASK_LEDGER_DEBUG'));
console.log('debugPanelCount=' + countText(after, 'DEBUG / state.context & rows'));
console.log('contextCountRef=' + countText(after, 'contextCounts'));
console.log('rowsLengthRef=' + countText(after, 'rowsLength'));
console.log('contextSelectedRowsRef=' + countText(after, 'contextSelectedMajorRowsLength'));
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
