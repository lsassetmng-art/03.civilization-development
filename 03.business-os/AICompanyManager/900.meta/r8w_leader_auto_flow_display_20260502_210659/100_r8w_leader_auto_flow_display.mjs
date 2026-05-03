import fs from 'node:fs';

const corePath = process.argv[2];
const serverPath = process.argv[3];
const cacheTag = process.argv[4];

if (!corePath || !serverPath || !cacheTag) {
  console.error('ERROR: args missing');
  process.exit(1);
}

let core = fs.readFileSync(corePath, 'utf8');
let server = fs.readFileSync(serverPath, 'utf8');

const MARK = 'AICM_R8W_LEADER_AUTO_FLOW_DISPLAY';
const START = '// ' + MARK + '_HELPER_START';
const END = '// ' + MARK + '_HELPER_END';

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

const before = {
  mark: count(core, MARK),
  helperRows: count(core, 'function aicmLeaderAutoFlowRowsR8W'),
  helperRender: count(core, 'function aicmRenderLeaderAutoFlowStatusR8W'),
  renderCall: count(core, 'aicmRenderLeaderAutoFlowStatusR8W()'),
  summaryCall: count(core, 'aicmRenderManagerMajorSummarySectionR8U()'),
  r8u: count(core, 'AICM_R8U_MANAGER_MAJOR_SUMMARY'),
  r8v: count(core, 'AICM_R8V_REMOVE_LEADER_INBOX_UI'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);

if (count(core, 'function aicmLeaderAutoFlowRowsR8W') > 0) {
  throw new Error('unmarked R8W auto-flow helper already exists; review required');
}

const helperBlock = [
  START,
  '  function aicmLeaderAutoTextR8W(value) {',
  '    if (value === null || typeof value === "undefined") return "";',
  '    return String(value).trim();',
  '  }',
  '',
  '  function aicmLeaderAutoMajorIdR8W(row) {',
  '    var r = row && typeof row === "object" ? row : {};',
  '    return aicmLeaderAutoTextR8W(',
  '      r.aicm_manager_major_work_item_id ||',
  '      r.manager_major_work_item_id ||',
  '      r.majorId ||',
  '      r.major_id ||',
  '      r.id',
  '    );',
  '  }',
  '',
  '  function aicmLeaderAutoSelectedCompanyIdR8W() {',
  '    if (state && state.selectedCompanyId) return aicmLeaderAutoTextR8W(state.selectedCompanyId);',
  '    if (typeof selectedCompany === "function") {',
  '      var company = selectedCompany();',
  '      if (company && company.aicm_user_company_id) return aicmLeaderAutoTextR8W(company.aicm_user_company_id);',
  '    }',
  '    return "";',
  '  }',
  '',
  '  function aicmLeaderAutoAllMajorRowsR8W() {',
  '    var ctx = state && state.context ? state.context : {};',
  '    var rows = [];',
  '    var seen = {};',
  '    var selectedCompanyId = aicmLeaderAutoSelectedCompanyIdR8W();',
  '',
  '    function add(list) {',
  '      if (!Array.isArray(list)) return;',
  '      for (var i = 0; i < list.length; i += 1) {',
  '        var row = list[i];',
  '        if (!row || typeof row !== "object") continue;',
  '',
  '        var rowCompanyId = aicmLeaderAutoTextR8W(row.aicm_user_company_id);',
  '        if (selectedCompanyId && rowCompanyId && selectedCompanyId !== rowCompanyId) continue;',
  '',
  '        var id = aicmLeaderAutoMajorIdR8W(row);',
  '        var key = id || ("auto_row_" + rows.length);',
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
  '  function aicmLeaderAutoFlowRowsR8W() {',
  '    var rows = aicmLeaderAutoAllMajorRowsR8W().filter(function (row) {',
  '      var handoff = aicmLeaderAutoTextR8W(row && row.handoff_status_code).toLowerCase();',
  '      var decomposition = aicmLeaderAutoTextR8W(row && row.decomposition_status_code).toLowerCase();',
  '',
  '      if (handoff === "archived" || decomposition === "archived") return false;',
  '      if (handoff === "deleted" || decomposition === "deleted") return false;',
  '',
  '      return handoff === "handed_off" || decomposition === "assigned_to_leader";',
  '    });',
  '',
  '    rows.sort(function (a, b) {',
  '      var au = aicmLeaderAutoTextR8W(a && (a.updated_at || a.created_at));',
  '      var bu = aicmLeaderAutoTextR8W(b && (b.updated_at || b.created_at));',
  '      if (au && bu && au !== bu) return au < bu ? 1 : -1;',
  '',
  '      var ad = Number(a && a.display_order);',
  '      var bd = Number(b && b.display_order);',
  '      if (!Number.isFinite(ad)) ad = 999999;',
  '      if (!Number.isFinite(bd)) bd = 999999;',
  '      return ad - bd;',
  '    });',
  '',
  '    return rows;',
  '  }',
  '',
  '  function aicmLeaderAutoFlowStatusLabelR8W(row) {',
  '    var handoff = aicmLeaderAutoTextR8W(row && row.handoff_status_code).toLowerCase();',
  '    var decomposition = aicmLeaderAutoTextR8W(row && row.decomposition_status_code).toLowerCase();',
  '',
  '    if (decomposition === "assigned_to_leader" || handoff === "handed_off") {',
  '      return "自動分解待ち";',
  '    }',
  '',
  '    return "自動処理対象";',
  '  }',
  '',
  '  function aicmLeaderAutoPriorityLabelR8W(value) {',
  '    var code = aicmLeaderAutoTextR8W(value).toLowerCase();',
  '    if (code === "urgent") return "緊急";',
  '    if (code === "high") return "高";',
  '    if (code === "normal") return "通常";',
  '    if (code === "low") return "低";',
  '    return code || "未設定";',
  '  }',
  '',
  '  function aicmRenderLeaderAutoFlowRowsR8W(rows) {',
  '    if (!Array.isArray(rows) || !rows.length) {',
  '      return \'<div class="aicm-empty-state"><strong>自動処理対象はまだありません</strong><p>課長へ送った大項目がここに表示されます。</p></div>\';',
  '    }',
  '',
  '    var limit = 5;',
  '    var visible = rows.slice(0, limit);',
  '    var cards = visible.map(function (row, index) {',
  '      var title = aicmLeaderAutoTextR8W(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";',
  '      var description = aicmLeaderAutoTextR8W(row && (row.major_item_description || row.task_description || row.note));',
  '      var leader = aicmLeaderAutoTextR8W(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "自動割当";',
  '      var due = aicmLeaderAutoTextR8W(row && row.due_date) || "未設定";',
  '      var status = aicmLeaderAutoFlowStatusLabelR8W(row);',
  '',
  '      return [',
  '        \'<article class="aicm-ledger-row">\',',
  '        \'  <p class="aicm-eyebrow">自動処理対象 #\' + escapeHtml(String(index + 1)) + \'</p>\',',
  '        \'  <h3>\' + escapeHtml(title) + \'</h3>\',',
  '        description ? \'  <p class="aicm-selected-note">\' + escapeHtml(description) + \'</p>\' : \'\',',
  '        \'  <dl class="aicm-ledger-meta">\',',
  '        \'    <div><dt>自動状態</dt><dd>\' + escapeHtml(status) + \'</dd></div>\',',
  '        \'    <div><dt>課長/Leader</dt><dd>\' + escapeHtml(leader) + \'</dd></div>\',',
  '        \'    <div><dt>優先度</dt><dd>\' + escapeHtml(aicmLeaderAutoPriorityLabelR8W(row && row.priority_code)) + \'</dd></div>\',',
  '        \'    <div><dt>期限</dt><dd>\' + escapeHtml(due) + \'</dd></div>\',',
  '        \'  </dl>\',',
  '        \'</article>\'',
  '      ].join("");',
  '    }).join("");',
  '',
  '    var more = rows.length > limit ? \'<p class="aicm-selected-note">ほか \' + escapeHtml(String(rows.length - limit)) + \'件はサマリ詳細で確認できます。</p>\' : \'\';',
  '',
  '    return [',
  '      \'<div class="aicm-ledger-list">\',',
  '      cards,',
  '      \'</div>\',',
  '      more',
  '    ].join("");',
  '  }',
  '',
  '  function aicmRenderLeaderAutoFlowStatusR8W() {',
  '    var rows = aicmLeaderAutoFlowRowsR8W();',
  '',
  '    return [',
  '      \'<section class="aicm-core-card">\',',
  '      \'  <p class="aicm-eyebrow">Leader以降自動処理</p>\',',
  '      \'  <h2>課長以降は自動処理</h2>\',',
  '      \'  <p class="aicm-selected-note">課長へ送ったManager大項目は、ユーザー操作なしでLeader分解・Worker展開へ進む前提です。ここでは自動処理対象の状態だけを確認します。</p>\',',
  '      \'  <p class="aicm-selected-note">自動分解対象: <strong>\' + escapeHtml(String(rows.length)) + \'件</strong></p>\',',
  '      aicmRenderLeaderAutoFlowRowsR8W(rows),',
  '      \'</section>\'',
  '    ].join("");',
  '  }',
  END
].join('\n');

core = insertBeforeFunction(core, 'renderTaskLedgerPlaceholder', helperBlock);

const renderRange = findFunctionRange(core, 'renderTaskLedgerPlaceholder');
let renderChunk = renderRange.oldText;

if (!renderChunk.includes('aicmRenderLeaderAutoFlowStatusR8W()')) {
  const anchor = 'aicmRenderManagerMajorSummarySectionR8U(),';
  const idx = renderChunk.indexOf(anchor);

  if (idx < 0) {
    throw new Error('summary render anchor not found in renderTaskLedgerPlaceholder');
  }

  const insertAt = idx + anchor.length;
  renderChunk = renderChunk.slice(0, insertAt) + '\n      aicmRenderLeaderAutoFlowStatusR8W(),' + renderChunk.slice(insertAt);
}

core = core.slice(0, renderRange.start) + renderChunk + core.slice(renderRange.end);

const newScriptRef = 'aicm-production-core.js?v=' + cacheTag;
server = server.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

const afterRange = findFunctionRange(core, 'renderTaskLedgerPlaceholder');
const afterChunk = afterRange.oldText;

const after = {
  mark: count(core, MARK),
  helperRows: count(core, 'function aicmLeaderAutoFlowRowsR8W'),
  helperRender: count(core, 'function aicmRenderLeaderAutoFlowStatusR8W'),
  helperRowRender: count(core, 'function aicmRenderLeaderAutoFlowRowsR8W'),
  renderCall: count(core, 'aicmRenderLeaderAutoFlowStatusR8W()'),
  renderCallInTaskLedger: count(afterChunk, 'aicmRenderLeaderAutoFlowStatusR8W()'),
  summaryCallInTaskLedger: count(afterChunk, 'aicmRenderManagerMajorSummarySectionR8U()'),
  title: count(core, 'Leader以降自動処理'),
  autoTarget: count(core, '自動分解対象'),
  assigned: count(core, 'assigned_to_leader'),
  handedOff: count(core, 'handed_off'),
  r8u: count(core, 'AICM_R8U_MANAGER_MAJOR_SUMMARY'),
  r8v: count(core, 'AICM_R8V_REMOVE_LEADER_INBOX_UI'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef)
};

if (after.mark < 2) throw new Error('R8W markers missing');
if (after.helperRows !== 1) throw new Error('auto rows helper count invalid: ' + after.helperRows);
if (after.helperRender !== 1) throw new Error('auto status renderer count invalid: ' + after.helperRender);
if (after.helperRowRender !== 1) throw new Error('auto row renderer count invalid: ' + after.helperRowRender);
if (after.renderCall < 1) throw new Error('auto status render call missing');
if (after.renderCallInTaskLedger !== 1) throw new Error('auto status render call missing or duplicated in task ledger: ' + after.renderCallInTaskLedger);
if (after.summaryCallInTaskLedger < 1) throw new Error('summary render call missing in task ledger');
if (after.title < 1) throw new Error('auto flow title missing');
if (after.autoTarget < 1) throw new Error('auto target label missing');
if (after.assigned < 1 || after.handedOff < 1) throw new Error('status labels missing');
if (after.r8u < 1) throw new Error('R8U summary marker missing');
if (after.r8v < 1) throw new Error('R8V remove leader inbox marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'R8W Leader auto-flow display only; no user operation after leader handoff',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  physical_delete: 'NO'
}, null, 2));
