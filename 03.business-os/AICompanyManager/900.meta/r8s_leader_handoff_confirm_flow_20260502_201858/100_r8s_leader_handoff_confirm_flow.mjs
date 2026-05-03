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

const MARK = 'AICM_R8S_LEADER_HANDOFF_CONFIRM_FLOW';
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
  const needle1 = 'if (action === "' + actionName + '")';
  const needle2 = "if (action === '" + actionName + "')";
  let idx = text.indexOf(needle1);
  if (idx < 0) idx = text.indexOf(needle2);
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
  let anchor = 'if (action === "pmlw-major-delete-open")';
  let idx = text.indexOf(anchor);

  if (idx < 0) {
    anchor = 'if (action === "task-ledger-refresh")';
    idx = text.indexOf(anchor);
  }

  if (idx < 0) {
    throw new Error('action insert anchor not found');
  }

  return text.slice(0, idx) + block.trimEnd() + '\n\n    ' + text.slice(idx);
}

const before = {
  mark: count(core, MARK),
  helperOpen: count(core, 'function aicmOpenMajorLeaderHandoffConfirmR8S'),
  helperExecute: count(core, 'async function aicmExecuteMajorLeaderHandoffConfirmR8S'),
  renderConfirm: count(core, 'function aicmRenderMajorLeaderHandoffConfirmCardR8S'),
  actionOpen: count(core, 'if (action === "pmlw-major-leader-handoff")'),
  actionExecute: count(core, 'if (action === "pmlw-major-leader-handoff-execute")'),
  actionCancel: count(core, 'if (action === "pmlw-major-leader-handoff-cancel")'),
  renderManager: count(core, 'function aicmRenderManagerMajorRows'),
  leaderButton: count(core, 'data-core-action="pmlw-major-leader-handoff"'),
  updateEndpoint: count(core, '/api/aicm/v2/manager-major/update'),
  assignedStatus: count(core, 'assigned_to_leader'),
  handedOffStatus: count(core, 'handed_off'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverUpdateRoute: count(server, '/api/aicm/v2/manager-major/update'),
  serverRequiresOwner: count(server, 'requiredUuid(body.owner_civilization_id, "owner_civilization_id")'),
  serverRequiresMajorId: count(server, 'requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, HELPER_START, HELPER_END);
core = removeMarkedBlock(core, ACTION_START, ACTION_END);

core = removeAllActionBlocks(core, 'pmlw-major-leader-handoff');
core = removeAllActionBlocks(core, 'pmlw-major-leader-handoff-execute');
core = removeAllActionBlocks(core, 'pmlw-major-leader-handoff-cancel');

if (count(core, 'function aicmOpenMajorLeaderHandoffConfirmR8S') > 0) {
  throw new Error('unmarked R8S leader handoff helper already exists; review required');
}

const helperBlock = [
  HELPER_START,
  '  function aicmLeaderHandoffTextR8S(value) {',
  '    if (value === null || typeof value === "undefined") return "";',
  '    return String(value).trim();',
  '  }',
  '',
  '  function aicmLeaderHandoffOwnerIdR8S(payload) {',
  '    var p = payload && typeof payload === "object" ? payload : {};',
  '    if (p.owner_civilization_id) return aicmLeaderHandoffTextR8S(p.owner_civilization_id);',
  '    if (p.ownerCivilizationId) return aicmLeaderHandoffTextR8S(p.ownerCivilizationId);',
  '    if (state && state.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.ownerCivilizationId);',
  '    if (state && state.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.owner_civilization_id);',
  '    if (state && state.context && state.context.owner_civilization_id) return aicmLeaderHandoffTextR8S(state.context.owner_civilization_id);',
  '    if (state && state.context && state.context.ownerCivilizationId) return aicmLeaderHandoffTextR8S(state.context.ownerCivilizationId);',
  '    if (typeof aicmHumanReviewOwnerId === "function") return aicmLeaderHandoffTextR8S(aicmHumanReviewOwnerId());',
  '    return "00000000-0000-4000-8000-000000000001";',
  '  }',
  '',
  '  function aicmLeaderHandoffActionTargetR8S(ev, btn) {',
  '    if (typeof aicmActionTargetSafe === "function") {',
  '      var safeTarget = aicmActionTargetSafe(ev, btn);',
  '      if (safeTarget && safeTarget.getAttribute) return safeTarget;',
  '    }',
  '',
  '    if (btn && btn.getAttribute) return btn;',
  '',
  '    if (ev && ev.target) {',
  '      if (ev.target.closest) {',
  '        var closest = ev.target.closest("[data-core-action]");',
  '        if (closest && closest.getAttribute) return closest;',
  '      }',
  '',
  '      if (ev.target.getAttribute) return ev.target;',
  '    }',
  '',
  '    return null;',
  '  }',
  '',
  '  function aicmLeaderHandoffMajorIdFromTargetR8S(target) {',
  '    if (!target || !target.getAttribute) return "";',
  '    return aicmLeaderHandoffTextR8S(',
  '      target.getAttribute("data-major-id") ||',
  '      target.getAttribute("data-pmlw-major-id") ||',
  '      target.getAttribute("data-manager-major-id") ||',
  '      ""',
  '    );',
  '  }',
  '',
  '  function aicmFindMajorForLeaderHandoffR8S(majorId) {',
  '    var id = aicmLeaderHandoffTextR8S(majorId);',
  '    if (!id) return null;',
  '',
  '    if (typeof aicmAxuR1FindMajorById === "function") {',
  '      var found = aicmAxuR1FindMajorById(id);',
  '      if (found) return found;',
  '    }',
  '',
  '    var ctx = state && state.context ? state.context : {};',
  '    var rows = [];',
  '    function add(list) {',
  '      if (Array.isArray(list)) rows = rows.concat(list);',
  '    }',
  '',
  '    add(ctx.pmlw_major_items);',
  '    add(ctx.pmlwMajorItems);',
  '    add(ctx.manager_major_items);',
  '    add(ctx.managerMajorItems);',
  '    add(ctx.major_items);',
  '    add(ctx.majorItems);',
  '',
  '    for (var i = 0; i < rows.length; i += 1) {',
  '      var row = rows[i] || {};',
  '      var rowId = aicmLeaderHandoffTextR8S(',
  '        row.aicm_manager_major_work_item_id ||',
  '        row.manager_major_work_item_id ||',
  '        row.majorId ||',
  '        row.major_id ||',
  '        row.id',
  '      );',
  '      if (rowId === id) return row;',
  '    }',
  '',
  '    return null;',
  '  }',
  '',
  '  function aicmLeaderHandoffSummaryR8S(row) {',
  '    var base = null;',
  '    if (typeof aicmMajorItemSummaryR8O === "function") {',
  '      base = aicmMajorItemSummaryR8O(row);',
  '    }',
  '',
  '    var title = base && base.title ? base.title : (row && (row.major_item_name || row.deliverable_name || row.task_name)) || "Manager大項目";',
  '    var description = base && base.description ? base.description : (row && (row.major_item_description || row.task_description || row.note)) || "";',
  '    var due = base && base.due ? base.due : (row && row.due_date ? String(row.due_date) : "未設定");',
  '    var status = base && base.status ? base.status : ((row && row.handoff_status_code) || "draft");',
  '    var leaderRaw = aicmLeaderHandoffTextR8S(row && (row.assigned_leader_label || row.leader_label || row.responsible_robot_label));',
  '    var leader = leaderRaw || "未設定（課へ引き継ぎ）";',
  '',
  '    return {',
  '      title: String(title),',
  '      description: String(description),',
  '      due: String(due),',
  '      status: String(status),',
  '      leader: String(leader),',
  '      leaderRaw: leaderRaw',
  '    };',
  '  }',
  '',
  '  function aicmOpenMajorLeaderHandoffConfirmR8S(ev, btn) {',
  '    try {',
  '      var target = aicmLeaderHandoffActionTargetR8S(ev, btn);',
  '      var majorId = aicmLeaderHandoffMajorIdFromTargetR8S(target);',
  '      if (!majorId) throw new Error("Manager大項目IDを特定できません。");',
  '',
  '      var row = aicmFindMajorForLeaderHandoffR8S(majorId);',
  '      if (!row) throw new Error("Manager大項目を特定できません。");',
  '',
  '      var summary = aicmLeaderHandoffSummaryR8S(row);',
  '',
  '      state.managerMajorLeaderHandoffConfirm = {',
  '        majorId: majorId,',
  '        title: summary.title,',
  '        description: summary.description,',
  '        leader: summary.leader,',
  '        leaderRaw: summary.leaderRaw,',
  '        due: summary.due,',
  '        status: summary.status',
  '      };',
  '',
  '      state.screen = "task-ledger";',
  '      setMessage("ok", "課長へ送る確認を表示しました。内容を確認してから確定してください。");',
  '      render();',
  '',
  '      setTimeout(function () {',
  '        try {',
  '          var card = document.getElementById("aicm-manager-major-leader-handoff-confirm");',
  '          if (card && card.scrollIntoView) card.scrollIntoView({ behavior: "smooth", block: "start" });',
  '        } catch (_) {}',
  '      }, 50);',
  '    } catch (error) {',
  '      setMessage("error", error && error.message ? error.message : "課長へ送る確認を表示できません。");',
  '      render();',
  '    }',
  '  }',
  '',
  '  function aicmRenderMajorLeaderHandoffConfirmCardR8S() {',
  '    var payload = state.managerMajorLeaderHandoffConfirm || null;',
  '    if (!payload) return "";',
  '',
  '    return [',
  '      \'<section id="aicm-manager-major-leader-handoff-confirm" class="aicm-core-card" style="border:2px solid #2563eb;">\',',
  '      \'  <p class="aicm-eyebrow">課長へ送る確認</p>\',',
  '      \'  <h2>このManager大項目を課長/Leaderへ送りますか？</h2>\',',
  '      \'  <p class="aicm-selected-note">確定するとDBへ保存されます。ステータスを assigned_to_leader / handed_off に更新し、登録済み大項目の未引き継ぎ一覧から外します。</p>\',',
  '      \'  <dl class="aicm-core-detail-list">\',',
  '      \'    <dt>大項目</dt><dd>\' + escapeHtml(payload.title || "") + \'</dd>\',',
  '      \'    <dt>課長/Leader</dt><dd>\' + escapeHtml(payload.leader || "未設定") + \'</dd>\',',
  '      \'    <dt>状態</dt><dd>\' + escapeHtml(payload.status || "") + \'</dd>\',',
  '      \'    <dt>期限</dt><dd>\' + escapeHtml(payload.due || "未設定") + \'</dd>\',',
  '      \'  </dl>\',',
  '      payload.description ? \'<p class="aicm-selected-note">\' + escapeHtml(payload.description) + \'</p>\' : \'\',',
  '      \'  <div class="aicm-dashboard-action-row">\',',
  '      \'    <button type="button" data-core-action="pmlw-major-leader-handoff-execute">課長へ送るを確定</button>\',',
  '      \'    <button type="button" data-core-action="pmlw-major-leader-handoff-cancel">キャンセル</button>\',',
  '      \'  </div>\',',
  '      \'</section>\'',
  '    ].join("");',
  '  }',
  '',
  '  function aicmCancelMajorLeaderHandoffConfirmR8S() {',
  '    state.managerMajorLeaderHandoffConfirm = null;',
  '    state.screen = "task-ledger";',
  '    setMessage("ok", "課長へ送るをキャンセルしました。");',
  '    render();',
  '  }',
  '',
  '  function aicmLeaderHandoffApiErrorTextR8S(response, json, rawText) {',
  '    var parts = [];',
  '    if (response && response.status) parts.push("HTTP " + response.status);',
  '    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));',
  '    if (json && json.error_message) parts.push(String(json.error_message));',
  '    if (json && json.error) parts.push(String(json.error));',
  '    if (json && json.message) parts.push(String(json.message));',
  '    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));',
  '    if (!parts.length) parts.push("課長へ送るAPIでエラーが発生しました。");',
  '    return parts.join(" / ");',
  '  }',
  '',
  '  async function aicmExecuteMajorLeaderHandoffConfirmR8S() {',
  '    var payload = state.managerMajorLeaderHandoffConfirm || null;',
  '    if (!payload || !payload.majorId) {',
  '      setMessage("error", "課長へ送る対象がありません。");',
  '      render();',
  '      return;',
  '    }',
  '',
  '    var ownerCivilizationId = aicmLeaderHandoffOwnerIdR8S(payload);',
  '    if (!ownerCivilizationId) {',
  '      setMessage("error", "owner_civilization_idを特定できません。");',
  '      render();',
  '      return;',
  '    }',
  '',
  '    try {',
  '      var body = {',
  '        owner_civilization_id: ownerCivilizationId,',
  '        aicm_manager_major_work_item_id: payload.majorId,',
  '        decomposition_status_code: "assigned_to_leader",',
  '        handoff_status_code: "handed_off"',
  '      };',
  '',
  '      if (payload.leaderRaw) {',
  '        body.assigned_leader_label = payload.leaderRaw;',
  '      }',
  '',
  '      var response = await fetch("/api/aicm/v2/manager-major/update", {',
  '        method: "POST",',
  '        headers: {',
  '          "content-type": "application/json"',
  '        },',
  '        body: JSON.stringify(body)',
  '      });',
  '',
  '      var rawText = await response.text();',
  '      var json = null;',
  '      try {',
  '        json = rawText ? JSON.parse(rawText) : null;',
  '      } catch (_) {',
  '        json = null;',
  '      }',
  '',
  '      if (!response.ok || (json && json.result && json.result !== "ok")) {',
  '        throw new Error(aicmLeaderHandoffApiErrorTextR8S(response, json, rawText));',
  '      }',
  '',
  '      state.managerMajorLeaderHandoffConfirm = null;',
  '      state.screen = "task-ledger";',
  '      setMessage("ok", "課長へ送信しました。");',
  '',
  '      if (typeof aicmReloadTaskLedgerContext === "function") {',
  '        await aicmReloadTaskLedgerContext();',
  '      } else {',
  '        render();',
  '      }',
  '    } catch (error) {',
  '      setMessage("error", error && error.message ? error.message : "課長へ送る処理に失敗しました。");',
  '      render();',
  '    }',
  '  }',
  HELPER_END
].join('\n');

core = insertBeforeFunction(core, 'aicmRenderManagerMajorRows', helperBlock);

const renderRange = findFunctionRange(core, 'aicmRenderManagerMajorRows');
let renderChunk = renderRange.oldText;

if (!renderChunk.includes('aicmRenderMajorLeaderHandoffConfirmCardR8S')) {
  renderChunk = renderChunk.replace(
    /var\s+confirmCard\s*=\s*aicmRenderMajorItemDeleteConfirmCardR8P\(\);\s*/,
    function (m) {
      return m + '\n    var leaderHandoffConfirmCard = aicmRenderMajorLeaderHandoffConfirmCardR8S();\n';
    }
  );

  if (!renderChunk.includes('leaderHandoffConfirmCard')) {
    throw new Error('failed to inject leaderHandoffConfirmCard variable into aicmRenderManagerMajorRows');
  }

  renderChunk = renderChunk.replace(
    /(\n\s*)confirmCard,/g,
    '$1confirmCard,$1leaderHandoffConfirmCard,'
  );
}

if (!renderChunk.includes('leaderHandoffConfirmCard')) {
  throw new Error('leaderHandoffConfirmCard missing from renderer');
}

core = core.slice(0, renderRange.start) + renderChunk + core.slice(renderRange.end);

const actionBlock = [
  ACTION_START,
  '    if (action === "pmlw-major-leader-handoff") {',
  '      aicmOpenMajorLeaderHandoffConfirmR8S(event, button);',
  '      return;',
  '    }',
  '',
  '    if (action === "pmlw-major-leader-handoff-cancel") {',
  '      aicmCancelMajorLeaderHandoffConfirmR8S();',
  '      return;',
  '    }',
  '',
  '    if (action === "pmlw-major-leader-handoff-execute") {',
  '      aicmExecuteMajorLeaderHandoffConfirmR8S();',
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
  helperOpen: count(core, 'function aicmOpenMajorLeaderHandoffConfirmR8S'),
  helperExecute: count(core, 'async function aicmExecuteMajorLeaderHandoffConfirmR8S'),
  helperCancel: count(core, 'function aicmCancelMajorLeaderHandoffConfirmR8S'),
  renderConfirm: count(core, 'function aicmRenderMajorLeaderHandoffConfirmCardR8S'),
  actionOpen: count(core, 'if (action === "pmlw-major-leader-handoff")'),
  actionExecute: count(core, 'if (action === "pmlw-major-leader-handoff-execute")'),
  actionCancel: count(core, 'if (action === "pmlw-major-leader-handoff-cancel")'),
  renderManager: count(core, 'function aicmRenderManagerMajorRows'),
  rendererCardCall: count(core, 'aicmRenderMajorLeaderHandoffConfirmCardR8S()'),
  rendererCardVariable: count(core, 'leaderHandoffConfirmCard'),
  leaderButton: count(core, 'data-core-action="pmlw-major-leader-handoff"'),
  updateEndpoint: count(core, '/api/aicm/v2/manager-major/update'),
  ownerPayload: count(core, 'owner_civilization_id'),
  majorPayload: count(core, 'aicm_manager_major_work_item_id'),
  assignedStatus: count(core, 'assigned_to_leader'),
  handedOffStatus: count(core, 'handed_off'),
  deleteConfirmStillThere: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverUpdateRoute: count(server, '/api/aicm/v2/manager-major/update'),
  serverRequiresOwner: count(server, 'requiredUuid(body.owner_civilization_id, "owner_civilization_id")'),
  serverRequiresMajorId: count(server, 'requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 4) throw new Error('R8S markers missing');
if (after.helperOpen !== 1) throw new Error('open helper count invalid: ' + after.helperOpen);
if (after.helperExecute !== 1) throw new Error('execute helper count invalid: ' + after.helperExecute);
if (after.helperCancel !== 1) throw new Error('cancel helper count invalid: ' + after.helperCancel);
if (after.renderConfirm !== 1) throw new Error('render confirm helper count invalid: ' + after.renderConfirm);
if (after.actionOpen !== 1) throw new Error('open action count invalid: ' + after.actionOpen);
if (after.actionExecute !== 1) throw new Error('execute action count invalid: ' + after.actionExecute);
if (after.actionCancel !== 1) throw new Error('cancel action count invalid: ' + after.actionCancel);
if (after.renderManager !== 1) throw new Error('manager renderer count invalid: ' + after.renderManager);
if (after.rendererCardCall < 1 || after.rendererCardVariable < 2) throw new Error('leader handoff confirm card not injected into renderer');
if (after.leaderButton < 1) throw new Error('leader handoff row button missing');
if (after.updateEndpoint < 1) throw new Error('update endpoint missing in core');
if (after.ownerPayload < 1) throw new Error('owner payload missing in core');
if (after.majorPayload < 1) throw new Error('major payload missing in core');
if (after.assignedStatus < 1) throw new Error('assigned_to_leader missing');
if (after.handedOffStatus < 1) throw new Error('handed_off missing');
if (after.deleteConfirmStillThere !== 1) throw new Error('delete confirm helper missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (after.serverUpdateRoute < 1) throw new Error('server update route missing');
if (after.serverRequiresOwner < 1) throw new Error('server owner requirement missing');
if (after.serverRequiresMajorId < 1) throw new Error('server major id requirement missing');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'R8S leader handoff confirm flow: helperized target resolution, confirm card, update POST, reload',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write_during_patch: 'NO',
  api_post_during_patch: 'NO',
  db_write_on_manual_confirm: 'YES'
}, null, 2));
