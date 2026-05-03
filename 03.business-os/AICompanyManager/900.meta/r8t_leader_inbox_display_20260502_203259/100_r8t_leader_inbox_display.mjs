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

const MARK = 'AICM_R8T_LEADER_INBOX_DISPLAY';
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
  helperRows: count(core, 'function aicmLeaderInboxRowsR8T'),
  helperRender: count(core, 'function aicmRenderLeaderInboxR8T'),
  actionBreakdown: count(core, 'if (action === "leader-inbox-middle-breakdown-open")'),
  renderTaskLedger: count(core, 'function renderTaskLedgerPlaceholder'),
  inboxTitle: count(core, '課長/Leader受信箱'),
  assigned: count(core, 'assigned_to_leader'),
  handedOff: count(core, 'handed_off'),
  r8s: count(core, 'AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, HELPER_START, HELPER_END);
core = removeMarkedBlock(core, ACTION_START, ACTION_END);
core = removeAllActionBlocks(core, 'leader-inbox-middle-breakdown-open');

if (count(core, 'function aicmLeaderInboxRowsR8T') > 0) {
  throw new Error('unmarked R8T leader inbox helper already exists; review required');
}

const helperBlock = [
  HELPER_START,
  '  function aicmLeaderInboxTextR8T(value) {',
  '    if (value === null || typeof value === "undefined") return "";',
  '    return String(value).trim();',
  '  }',
  '',
  '  function aicmLeaderInboxMajorIdR8T(row) {',
  '    var r = row && typeof row === "object" ? row : {};',
  '    return aicmLeaderInboxTextR8T(',
  '      r.aicm_manager_major_work_item_id ||',
  '      r.manager_major_work_item_id ||',
  '      r.majorId ||',
  '      r.major_id ||',
  '      r.id',
  '    );',
  '  }',
  '',
  '  function aicmLeaderInboxAllMajorRowsR8T() {',
  '    var ctx = state && state.context ? state.context : {};',
  '    var rows = [];',
  '    var seen = {};',
  '',
  '    function add(list) {',
  '      if (!Array.isArray(list)) return;',
  '      for (var i = 0; i < list.length; i += 1) {',
  '        var row = list[i];',
  '        var id = aicmLeaderInboxMajorIdR8T(row);',
  '        var key = id || ("row_" + rows.length);',
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
  '  function aicmLeaderInboxSelectedCompanyIdR8T() {',
  '    if (state && state.selectedCompanyId) return aicmLeaderInboxTextR8T(state.selectedCompanyId);',
  '    if (typeof selectedCompany === "function") {',
  '      var company = selectedCompany();',
  '      if (company && company.aicm_user_company_id) return aicmLeaderInboxTextR8T(company.aicm_user_company_id);',
  '    }',
  '    return "";',
  '  }',
  '',
  '  function aicmLeaderInboxIsRowR8T(row) {',
  '    if (!row || typeof row !== "object") return false;',
  '',
  '    var handoff = aicmLeaderInboxTextR8T(row.handoff_status_code).toLowerCase();',
  '    var decomposition = aicmLeaderInboxTextR8T(row.decomposition_status_code).toLowerCase();',
  '    var companyId = aicmLeaderInboxSelectedCompanyIdR8T();',
  '    var rowCompanyId = aicmLeaderInboxTextR8T(row.aicm_user_company_id);',
  '',
  '    if (companyId && rowCompanyId && companyId !== rowCompanyId) return false;',
  '    if (handoff === "archived" || decomposition === "archived") return false;',
  '',
  '    return handoff === "handed_off" || decomposition === "assigned_to_leader";',
  '  }',
  '',
  '  function aicmLeaderInboxRowsR8T() {',
  '    var rows = aicmLeaderInboxAllMajorRowsR8T().filter(aicmLeaderInboxIsRowR8T);',
  '',
  '    rows.sort(function (a, b) {',
  '      var au = aicmLeaderInboxTextR8T(a && (a.updated_at || a.created_at));',
  '      var bu = aicmLeaderInboxTextR8T(b && (b.updated_at || b.created_at));',
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
  '  function aicmLeaderInboxPriorityLabelR8T(value) {',
  '    var code = aicmLeaderInboxTextR8T(value).toLowerCase();',
  '    if (code === "urgent") return "緊急";',
  '    if (code === "high") return "高";',
  '    if (code === "normal") return "通常";',
  '    if (code === "low") return "低";',
  '    return code || "未設定";',
  '  }',
  '',
  '  function aicmRenderLeaderInboxR8T() {',
  '    var rows = aicmLeaderInboxRowsR8T();',
  '',
  '    if (!rows.length) {',
  '      return [',
  '        \'<div class="aicm-empty-state">\',',
  '        \'  <strong>Leader受信箱はまだ空です</strong>\',',
  '        \'  <p>課長へ送ったManager大項目がここに表示されます。</p>\',',
  '        \'</div>\'',
  '      ].join("");',
  '    }',
  '',
  '    var cards = rows.map(function (row, index) {',
  '      var majorId = aicmLeaderInboxMajorIdR8T(row);',
  '      var title = aicmLeaderInboxTextR8T(row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";',
  '      var description = aicmLeaderInboxTextR8T(row && (row.major_item_description || row.task_description || row.note));',
  '      var leader = aicmLeaderInboxTextR8T(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label)) || "未設定";',
  '      var due = aicmLeaderInboxTextR8T(row && row.due_date) || "未設定";',
  '      var handoff = aicmLeaderInboxTextR8T(row && row.handoff_status_code) || "handed_off";',
  '      var decomposition = aicmLeaderInboxTextR8T(row && row.decomposition_status_code) || "assigned_to_leader";',
  '',
  '      return [',
  '        \'<article class="aicm-ledger-row">\',',
  '        \'  <p class="aicm-eyebrow">Leader受信 #\' + escapeHtml(String(index + 1)) + \'</p>\',',
  '        \'  <h3>\' + escapeHtml(title) + \'</h3>\',',
  '        description ? \'  <p class="aicm-selected-note">\' + escapeHtml(description) + \'</p>\' : \'\',',
  '        \'  <dl class="aicm-ledger-meta">\',',
  '        \'    <div><dt>課長/Leader</dt><dd>\' + escapeHtml(leader) + \'</dd></div>\',',
  '        \'    <div><dt>優先度</dt><dd>\' + escapeHtml(aicmLeaderInboxPriorityLabelR8T(row && row.priority_code)) + \'</dd></div>\',',
  '        \'    <div><dt>期限</dt><dd>\' + escapeHtml(due) + \'</dd></div>\',',
  '        \'    <div><dt>状態</dt><dd>\' + escapeHtml(decomposition + " / " + handoff) + \'</dd></div>\',',
  '        \'  </dl>\',',
  '        \'  <div class="aicm-dashboard-action-row">\',',
  '        \'    <button type="button" data-core-action="leader-inbox-middle-breakdown-open" data-major-id="\' + escapeHtml(majorId) + \'">中項目へ分解</button>\',',
  '        \'  </div>\',',
  '        \'</article>\'',
  '      ].join("");',
  '    }).join("");',
  '',
  '    return [',
  '      \'<p class="aicm-selected-note">Leader受信箱: <strong>\' + escapeHtml(String(rows.length)) + \'件</strong></p>\',',
  '      \'<div class="aicm-ledger-list">\',',
  '      cards,',
  '      \'</div>\'',
  '    ].join("");',
  '  }',
  HELPER_END
].join('\n');

core = insertBeforeFunction(core, 'renderTaskLedgerPlaceholder', helperBlock);

const renderRange = findFunctionRange(core, 'renderTaskLedgerPlaceholder');
let renderChunk = renderRange.oldText;

if (!renderChunk.includes('aicmRenderLeaderInboxR8T()')) {
  const anchor = 'aicmRenderManagerMajorRows(rows),';
  const anchorIndex = renderChunk.indexOf(anchor);
  if (anchorIndex < 0) throw new Error('aicmRenderManagerMajorRows(rows) anchor not found in renderTaskLedgerPlaceholder');

  const sectionEndNeedle = "'</section>'";
  const sectionEndIndex = renderChunk.indexOf(sectionEndNeedle, anchorIndex);
  if (sectionEndIndex < 0) throw new Error('section end after manager major rows not found');

  const insertAt = sectionEndIndex + sectionEndNeedle.length;
  const insertion = [
    ',',
    '      \'<section class="aicm-core-card">\',',
    '      \'  <p class="aicm-eyebrow">Leader受信箱</p>\',',
    '      \'  <h2>課長/Leader受信箱</h2>\',',
    '      \'  <p class="aicm-selected-note">課長へ送ったManager大項目を表示します。次工程で中項目へ分解します。</p>\',',
    '      aicmRenderLeaderInboxR8T(),',
    '      \'</section>\''
  ].join('\n');

  renderChunk = renderChunk.slice(0, insertAt) + insertion + renderChunk.slice(insertAt);
}

core = core.slice(0, renderRange.start) + renderChunk + core.slice(renderRange.end);

const actionBlock = [
  ACTION_START,
  '    if (action === "leader-inbox-middle-breakdown-open") {',
  '      setMessage("ok", "中項目分解は次工程で実装します。まずLeader受信箱の表示を確認してください。");',
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
  helperRows: count(core, 'function aicmLeaderInboxRowsR8T'),
  helperRender: count(core, 'function aicmRenderLeaderInboxR8T'),
  helperIsRow: count(core, 'function aicmLeaderInboxIsRowR8T'),
  actionBreakdown: count(core, 'if (action === "leader-inbox-middle-breakdown-open")'),
  renderTaskLedger: count(core, 'function renderTaskLedgerPlaceholder'),
  renderCall: count(core, 'aicmRenderLeaderInboxR8T()'),
  inboxTitle: count(core, '課長/Leader受信箱'),
  assigned: count(core, 'assigned_to_leader'),
  handedOff: count(core, 'handed_off'),
  r8s: count(core, 'AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 4) throw new Error('R8T markers missing');
if (after.helperRows !== 1) throw new Error('leader inbox rows helper count invalid: ' + after.helperRows);
if (after.helperRender !== 1) throw new Error('leader inbox render helper count invalid: ' + after.helperRender);
if (after.helperIsRow !== 1) throw new Error('leader inbox is-row helper count invalid: ' + after.helperIsRow);
if (after.actionBreakdown !== 1) throw new Error('leader inbox action count invalid: ' + after.actionBreakdown);
if (after.renderTaskLedger !== 1) throw new Error('renderTaskLedgerPlaceholder count invalid: ' + after.renderTaskLedger);
if (after.renderCall < 1) throw new Error('leader inbox render call missing');
if (after.inboxTitle < 1) throw new Error('leader inbox title missing');
if (after.assigned < 1) throw new Error('assigned_to_leader missing');
if (after.handedOff < 1) throw new Error('handed_off missing');
if (after.r8s < 1) throw new Error('R8S handoff implementation marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'R8T Leader inbox display only from state.context handed_off / assigned_to_leader rows',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  physical_delete: 'NO'
}, null, 2));
