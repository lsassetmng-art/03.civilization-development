import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.argv[2];
const corePath = process.argv[3];
const serverPath = process.argv[4];
const cacheTag = process.argv[5];

if (!appRoot || !corePath || !serverPath || !cacheTag) {
  console.error('ERROR: args missing');
  process.exit(1);
}

let core = fs.readFileSync(corePath, 'utf8');
let server = fs.readFileSync(serverPath, 'utf8');

const MARK = 'AICM_R8U_MANAGER_MAJOR_SUMMARY';
const HELPER_START = '// ' + MARK + '_HELPER_START';
const HELPER_END = '// ' + MARK + '_HELPER_END';
const ACTION_START = '// ' + MARK + '_ACTION_HANDLER_START';
const ACTION_END = '// ' + MARK + '_ACTION_HANDLER_END';

function count(text, needle) {
  return text.split(needle).length - 1;
}

function removeMarkedBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return text;
  const e = text.indexOf(endMarker, s);
  if (e < 0) throw new Error('marked block end not found: ' + startMarker);
  return text.slice(0, s) + text.slice(e + endMarker.length);
}

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const match = re.exec(text);
  if (!match) throw new Error('function not found: ' + name);

  const start = match.index;
  const open = text.indexOf('{', start);
  if (open < 0) throw new Error('opening brace not found: ' + name);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < text.length; i += 1) {
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

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return { start, end: i + 1, oldText: text.slice(start, i + 1) };
      }
    }
  }

  throw new Error('closing brace not found: ' + name);
}

function insertBeforeFunction(text, functionName, block) {
  const range = findFunctionRange(text, functionName);
  return text.slice(0, range.start) + block.trimEnd() + '\n\n' + text.slice(range.start);
}

function findIfActionBlock(text, actionName) {
  const needle = 'if (action === "' + actionName + '")';
  const idx = text.indexOf(needle);
  if (idx < 0) return null;

  const open = text.indexOf('{', idx);
  if (open < 0) throw new Error('action block opening brace not found: ' + actionName);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < text.length; i += 1) {
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

    if (ch === '{') {
      depth += 1;
      continue;
    }

    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return { start: idx, end: i + 1 };
      }
    }
  }

  throw new Error('action block closing brace not found: ' + actionName);
}

function removeAllActionBlocks(text, actionName) {
  let out = text;
  for (;;) {
    const block = findIfActionBlock(out, actionName);
    if (!block) return out;
    out = out.slice(0, block.start) + out.slice(block.end);
  }
}

function insertBeforeActionOrRefresh(text, block) {
  let anchor = 'if (action === "task-ledger-refresh")';
  let idx = text.indexOf(anchor);

  if (idx < 0) {
    anchor = 'if (action === "reload")';
    idx = text.indexOf(anchor);
  }

  if (idx < 0) {
    throw new Error('action insert anchor not found');
  }

  return text.slice(0, idx) + block.trimEnd() + '\n\n    ' + text.slice(idx);
}

const before = {
  mark: count(core, MARK),
  helperRows: count(core, 'function aicmManagerMajorSummaryRowsR8U'),
  helperCounts: count(core, 'function aicmManagerMajorSummaryCountsR8U'),
  helperRender: count(core, 'function aicmRenderManagerMajorSummarySectionR8U'),
  actionFilter: count(core, 'if (action === "manager-major-summary-filter")'),
  actionClear: count(core, 'if (action === "manager-major-summary-filter-clear")'),
  renderTaskLedger: count(core, 'function renderTaskLedgerPlaceholder'),
  renderCall: count(core, 'aicmRenderManagerMajorSummarySectionR8U()'),
  summaryTitle: count(core, 'Manager大項目サマリ'),
  r8s: count(core, 'AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW'),
  r8t: count(core, 'AICM_R8T_LEADER_INBOX_DISPLAY'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, HELPER_START, HELPER_END);
core = removeMarkedBlock(core, ACTION_START, ACTION_END);
core = removeAllActionBlocks(core, 'manager-major-summary-filter');
core = removeAllActionBlocks(core, 'manager-major-summary-filter-clear');

if (count(core, 'function aicmManagerMajorSummaryRowsR8U') > 0) {
  throw new Error('unmarked R8U summary helper already exists; review required');
}

const helperBlock = [
  HELPER_START,
  '  function aicmSummaryTextR8U(value) {',
  '    if (value === null || typeof value === "undefined") return "";',
  '    return String(value).trim();',
  '  }',
  '',
  '  function aicmSummaryMajorIdR8U(row) {',
  '    var r = row && typeof row === "object" ? row : {};',
  '    return aicmSummaryTextR8U(',
  '      r.aicm_manager_major_work_item_id ||',
  '      r.manager_major_work_item_id ||',
  '      r.majorId ||',
  '      r.major_id ||',
  '      r.id',
  '    );',
  '  }',
  '',
  '  function aicmSummarySelectedCompanyIdR8U() {',
  '    if (state && state.selectedCompanyId) return aicmSummaryTextR8U(state.selectedCompanyId);',
  '    if (typeof selectedCompany === "function") {',
  '      var company = selectedCompany();',
  '      if (company && company.aicm_user_company_id) return aicmSummaryTextR8U(company.aicm_user_company_id);',
  '    }',
  '    return "";',
  '  }',
  '',
  '  function aicmManagerMajorSummaryRowsR8U() {',
  '    var ctx = state && state.context ? state.context : {};',
  '    var rows = [];',
  '    var seen = {};',
  '    var selectedCompanyId = aicmSummarySelectedCompanyIdR8U();',
  '',
  '    function add(list) {',
  '      if (!Array.isArray(list)) return;',
  '      for (var i = 0; i < list.length; i += 1) {',
  '        var row = list[i];',
  '        if (!row || typeof row !== "object") continue;',
  '',
  '        var rowCompanyId = aicmSummaryTextR8U(row.aicm_user_company_id);',
  '        if (selectedCompanyId && rowCompanyId && selectedCompanyId !== rowCompanyId) continue;',
  '',
  '        var id = aicmSummaryMajorIdR8U(row);',
  '        var key = id || ("summary_row_" + rows.length);',
  '        if (seen[key]) continue;',
  '        seen[key] = true;',
  '        rows.push(row);',
  '      }',
  '    }',
  '',
  '    add(ctx.pmlw_major_items);',
  '    add(ctx.pmlwMajorItems);',
  '    add(ctx.manager_major_items);',
  '    add(ctx.managerMajorItems);',
  '    add(ctx.major_items);',
  '    add(ctx.majorItems);',
  '',
  '    return rows;',
  '  }',
  '',
  '  function aicmManagerMajorSummaryBucketR8U(row) {',
  '    var handoff = aicmSummaryTextR8U(row && row.handoff_status_code).toLowerCase();',
  '    var decomposition = aicmSummaryTextR8U(row && row.decomposition_status_code).toLowerCase();',
  '    var deleted = aicmSummaryTextR8U(row && (row.deleted_flag || row.is_deleted)).toLowerCase();',
  '    var archived = aicmSummaryTextR8U(row && (row.archived_flag || row.is_archived)).toLowerCase();',
  '',
  '    if (deleted === "true" || deleted === "1") return "archived";',
  '    if (archived === "true" || archived === "1") return "archived";',
  '    if (handoff === "archived" || decomposition === "archived" || handoff === "deleted" || decomposition === "deleted") return "archived";',
  '',
  '    if (',
  '      handoff === "completed" ||',
  '      handoff === "done" ||',
  '      decomposition === "completed" ||',
  '      decomposition === "complete" ||',
  '      decomposition === "done" ||',
  '      decomposition === "decomposed"',
  '    ) {',
  '      return "completed";',
  '    }',
  '',
  '    if (',
  '      decomposition === "leader_decomposing" ||',
  '      decomposition === "worker_assigned" ||',
  '      decomposition === "in_progress" ||',
  '      handoff === "accepted" ||',
  '      handoff === "in_progress"',
  '    ) {',
  '      return "auto_processing";',
  '    }',
  '',
  '    if (handoff === "handed_off" || decomposition === "assigned_to_leader") {',
  '      return "leader_received";',
  '    }',
  '',
  '    if (',
  '      handoff === "draft" ||',
  '      handoff === "ready_handoff" ||',
  '      decomposition === "not_started" ||',
  '      (!handoff && !decomposition)',
  '    ) {',
  '      return "pending";',
  '    }',
  '',
  '    return "other";',
  '  }',
  '',
  '  function aicmManagerMajorSummaryBucketsR8U() {',
  '    return [',
  '      { code: "pending", label: "未引き継ぎ", note: "Manager大項目として登録済み。まだ課長へ送っていない件数。" },',
  '      { code: "leader_received", label: "Leader受信済み", note: "課長/Leaderへ送信済み。以降は自動処理対象。" },',
  '      { code: "auto_processing", label: "自動処理中", note: "Leader以降の自動分解・Worker展開中の件数。" },',
  '      { code: "completed", label: "完了/分解済み", note: "分解または後続処理が完了した件数。" },',
  '      { code: "archived", label: "削除済み", note: "削除済みまたはアーカイブ済みの件数。" },',
  '      { code: "other", label: "その他", note: "想定外または移行中ステータスの件数。" }',
  '    ];',
  '  }',
  '',
  '  function aicmManagerMajorSummaryCountsR8U() {',
  '    var rows = aicmManagerMajorSummaryRowsR8U();',
  '    var buckets = aicmManagerMajorSummaryBucketsR8U();',
  '    var map = {};',
  '',
  '    for (var i = 0; i < buckets.length; i += 1) {',
  '      map[buckets[i].code] = {',
  '        code: buckets[i].code,',
  '        label: buckets[i].label,',
  '        note: buckets[i].note,',
  '        count: 0,',
  '        rows: []',
  '      };',
  '    }',
  '',
  '    for (var j = 0; j < rows.length; j += 1) {',
  '      var row = rows[j];',
  '      var code = aicmManagerMajorSummaryBucketR8U(row);',
  '      if (!map[code]) code = "other";',
  '      map[code].count += 1;',
  '      map[code].rows.push(row);',
  '    }',
  '',
  '    return {',
  '      total: rows.length,',
  '      buckets: buckets.map(function (bucket) { return map[bucket.code]; }),',
  '      map: map',
  '    };',
  '  }',
  '',
  '  function aicmManagerMajorSummaryPriorityLabelR8U(value) {',
  '    var code = aicmSummaryTextR8U(value).toLowerCase();',
  '    if (code === "urgent") return "緊急";',
  '    if (code === "high") return "高";',
  '    if (code === "normal") return "通常";',
  '    if (code === "low") return "低";',
  '    return code || "未設定";',
  '  }',
  '',
  '  function aicmRenderManagerMajorSummaryDetailRowsR8U(rows, label) {',
  '    if (!Array.isArray(rows) || !rows.length) {',
  '      return \'<div class="aicm-empty-state"><strong>該当する大項目はありません</strong><p>\' + escapeHtml(label || "選択条件") + \'の行はありません。</p></div>\';',
  '    }',
  '',
  '    var limit = 20;',
  '    var visible = rows.slice(0, limit);',
  '    var cards = visible.map(function (row, index) {',
  '      var title = aicmSummaryTextR8U(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";',
  '      var description = aicmSummaryTextR8U(row && (row.major_item_description || row.task_description || row.note));',
  '      var leader = aicmSummaryTextR8U(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "未設定";',
  '      var due = aicmSummaryTextR8U(row && row.due_date) || "未設定";',
  '      var handoff = aicmSummaryTextR8U(row && row.handoff_status_code) || "未設定";',
  '      var decomposition = aicmSummaryTextR8U(row && row.decomposition_status_code) || "未設定";',
  '',
  '      return [',
  '        \'<article class="aicm-ledger-row">\',',
  '        \'  <p class="aicm-eyebrow">詳細 #\' + escapeHtml(String(index + 1)) + \'</p>\',',
  '        \'  <h3>\' + escapeHtml(title) + \'</h3>\',',
  '        description ? \'  <p class="aicm-selected-note">\' + escapeHtml(description) + \'</p>\' : \'\',',
  '        \'  <dl class="aicm-ledger-meta">\',',
  '        \'    <div><dt>課長/Leader</dt><dd>\' + escapeHtml(leader) + \'</dd></div>\',',
  '        \'    <div><dt>優先度</dt><dd>\' + escapeHtml(aicmManagerMajorSummaryPriorityLabelR8U(row && row.priority_code)) + \'</dd></div>\',',
  '        \'    <div><dt>期限</dt><dd>\' + escapeHtml(due) + \'</dd></div>\',',
  '        \'    <div><dt>状態</dt><dd>\' + escapeHtml(decomposition + " / " + handoff) + \'</dd></div>\',',
  '        \'  </dl>\',',
  '        \'</article>\'',
  '      ].join("");',
  '    }).join("");',
  '',
  '    var more = rows.length > limit ? \'<p class="aicm-selected-note">表示は先頭\' + escapeHtml(String(limit)) + \'件です。全件確認は次工程で詳細画面化します。</p>\' : \'\';',
  '',
  '    return [',
  '      \'<div class="aicm-ledger-list">\',',
  '      cards,',
  '      \'</div>\',',
  '      more',
  '    ].join("");',
  '  }',
  '',
  '  function aicmRenderManagerMajorSummaryDetailR8U(summary) {',
  '    var filter = aicmSummaryTextR8U(state && state.managerMajorSummaryFilterR8U);',
  '    if (!filter) {',
  '      return \'<p class="aicm-selected-note">件数カードを押すと、その分類の詳細をここで確認できます。</p>\';',
  '    }',
  '',
  '    var bucket = summary.map[filter] || summary.map.other;',
  '    var label = bucket ? bucket.label : "詳細";',
  '    var rows = bucket ? bucket.rows : [];',
  '',
  '    return [',
  '      \'<section class="aicm-core-card" style="border:1px solid #c7d2fe;">\',',
  '      \'  <p class="aicm-eyebrow">サマリ詳細</p>\',',
  '      \'  <h3>\' + escapeHtml(label) + \' の詳細</h3>\',',
  '      \'  <p class="aicm-selected-note">対象: <strong>\' + escapeHtml(String(rows.length)) + \'件</strong></p>\',',
  '      \'  <div class="aicm-dashboard-action-row">\',',
  '      \'    <button type="button" data-core-action="manager-major-summary-filter-clear">詳細表示を閉じる</button>\',',
  '      \'  </div>\',',
  '      aicmRenderManagerMajorSummaryDetailRowsR8U(rows, label),',
  '      \'</section>\'',
  '    ].join("");',
  '  }',
  '',
  '  function aicmRenderManagerMajorSummarySectionR8U() {',
  '    var summary = aicmManagerMajorSummaryCountsR8U();',
  '    var cards = summary.buckets.map(function (bucket) {',
  '      var selected = aicmSummaryTextR8U(state && state.managerMajorSummaryFilterR8U) === bucket.code;',
  '      return [',
  '        \'<button type="button" data-core-action="manager-major-summary-filter" data-summary-filter="\' + escapeHtml(bucket.code) + \'" style="text-align:left;display:block;">\',',
  '        \'  <span style="display:block;font-size:12px;color:#64748b;font-weight:900;">\' + escapeHtml(bucket.label) + \'</span>\',',
  '        \'  <strong style="display:block;font-size:24px;margin-top:4px;">\' + escapeHtml(String(bucket.count)) + \'件</strong>\',',
  '        \'  <span style="display:block;font-size:12px;margin-top:4px;color:#64748b;">\' + escapeHtml(selected ? "選択中" : bucket.note) + \'</span>\',',
  '        \'</button>\'',
  '      ].join("");',
  '    }).join("");',
  '',
  '    return [',
  '      \'<section class="aicm-core-card">\',',
  '      \'  <p class="aicm-eyebrow">Manager大項目サマリ</p>\',',
  '      \'  <h2>大項目 件数サマリ</h2>\',',
  '      \'  <p class="aicm-selected-note">Manager大項目から現在の状態別件数を表示します。件数カードを押すと詳細を確認できます。</p>\',',
  '      \'  <p class="aicm-selected-note">合計: <strong>\' + escapeHtml(String(summary.total)) + \'件</strong></p>\',',
  '      \'  <div class="aicm-dashboard-action-row">\',',
  '      cards,',
  '      \'  </div>\',',
  '      aicmRenderManagerMajorSummaryDetailR8U(summary),',
  '      \'</section>\'',
  '    ].join("");',
  '  }',
  '',
  '  function aicmManagerMajorSummaryActionTargetR8U(ev, btn) {',
  '    if (typeof aicmActionTargetSafe === "function") {',
  '      var safeTarget = aicmActionTargetSafe(ev, btn);',
  '      if (safeTarget && safeTarget.getAttribute) return safeTarget;',
  '    }',
  '',
  '    if (btn && btn.getAttribute) return btn;',
  '',
  '    if (ev && ev.target && ev.target.closest) {',
  '      var closest = ev.target.closest("[data-core-action]");',
  '      if (closest && closest.getAttribute) return closest;',
  '    }',
  '',
  '    return null;',
  '  }',
  HELPER_END
].join('\n');

core = insertBeforeFunction(core, 'renderTaskLedgerPlaceholder', helperBlock);

const renderRange = findFunctionRange(core, 'renderTaskLedgerPlaceholder');
let renderChunk = renderRange.oldText;

if (!renderChunk.includes('aicmRenderManagerMajorSummarySectionR8U()')) {
  const anchor = 'renderCsvImportCard(company),';
  const idx = renderChunk.indexOf(anchor);
  if (idx < 0) throw new Error('renderCsvImportCard(company) anchor not found in renderTaskLedgerPlaceholder');

  renderChunk = renderChunk.slice(0, idx) + 'aicmRenderManagerMajorSummarySectionR8U(),\n      ' + renderChunk.slice(idx);
}

core = core.slice(0, renderRange.start) + renderChunk + core.slice(renderRange.end);

const actionBlock = [
  ACTION_START,
  '    if (action === "manager-major-summary-filter") {',
  '      var summaryTarget = aicmManagerMajorSummaryActionTargetR8U(event, button);',
  '      var filterCode = summaryTarget && summaryTarget.getAttribute ? summaryTarget.getAttribute("data-summary-filter") : "";',
  '      state.managerMajorSummaryFilterR8U = filterCode || "";',
  '      state.screen = "task-ledger";',
  '      setMessage("ok", "大項目サマリ詳細を表示します。");',
  '      render();',
  '      return;',
  '    }',
  '',
  '    if (action === "manager-major-summary-filter-clear") {',
  '      state.managerMajorSummaryFilterR8U = "";',
  '      state.screen = "task-ledger";',
  '      setMessage("ok", "大項目サマリ詳細を閉じました。");',
  '      render();',
  '      return;',
  '    }',
  ACTION_END
].join('\n');

core = insertBeforeActionOrRefresh(core, actionBlock);

const newScriptRef = 'aicm-production-core.js?v=' + cacheTag;
server = server.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

const htmlUpdates = [];
for (const name of fs.readdirSync(appRoot)) {
  if (!name.endsWith('.html') && !name.endsWith('.htm')) continue;

  const htmlPath = path.join(appRoot, name);
  let html = fs.readFileSync(htmlPath, 'utf8');
  const beforeHtml = html;

  html = html.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

  if (html !== beforeHtml) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    htmlUpdates.push(htmlPath);
  }
}

const after = {
  mark: count(core, MARK),
  helperRows: count(core, 'function aicmManagerMajorSummaryRowsR8U'),
  helperCounts: count(core, 'function aicmManagerMajorSummaryCountsR8U'),
  helperRender: count(core, 'function aicmRenderManagerMajorSummarySectionR8U'),
  helperDetail: count(core, 'function aicmRenderManagerMajorSummaryDetailR8U'),
  actionFilter: count(core, 'if (action === "manager-major-summary-filter")'),
  actionClear: count(core, 'if (action === "manager-major-summary-filter-clear")'),
  renderTaskLedger: count(core, 'function renderTaskLedgerPlaceholder'),
  renderCall: count(core, 'aicmRenderManagerMajorSummarySectionR8U()'),
  summaryTitle: count(core, 'Manager大項目サマリ'),
  pendingLabel: count(core, '未引き継ぎ'),
  leaderLabel: count(core, 'Leader受信済み'),
  r8s: count(core, 'AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW'),
  r8t: count(core, 'AICM_R8T_LEADER_INBOX_DISPLAY'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 4) throw new Error('R8U markers missing');
if (after.helperRows !== 1) throw new Error('summary rows helper count invalid: ' + after.helperRows);
if (after.helperCounts !== 1) throw new Error('summary counts helper count invalid: ' + after.helperCounts);
if (after.helperRender !== 1) throw new Error('summary render helper count invalid: ' + after.helperRender);
if (after.helperDetail !== 1) throw new Error('summary detail helper count invalid: ' + after.helperDetail);
if (after.actionFilter !== 1) throw new Error('summary filter action count invalid: ' + after.actionFilter);
if (after.actionClear !== 1) throw new Error('summary clear action count invalid: ' + after.actionClear);
if (after.renderTaskLedger !== 1) throw new Error('renderTaskLedgerPlaceholder count invalid: ' + after.renderTaskLedger);
if (after.renderCall < 1) throw new Error('summary render call missing');
if (after.summaryTitle < 1) throw new Error('summary title missing');
if (after.pendingLabel < 1 || after.leaderLabel < 1) throw new Error('summary labels missing');
if (after.r8s < 1) throw new Error('R8S marker missing');
if (after.r8t < 1) throw new Error('R8T marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'R8U Manager major status count summary and same-screen detail filter',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  physical_delete: 'NO'
}, null, 2));
