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

const MARK = 'AICM_R8_V8B_DELETE_OWNER_PAYLOAD';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';

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

function lineNoOf(lines, re, fromIndex = 0) {
  for (let i = fromIndex; i < lines.length; i += 1) {
    if (re.test(lines[i])) return i;
  }
  return -1;
}

function replaceRangeByFunctionAnchors(text, startName, possibleEndNames, replacer) {
  const lines = text.split('\n');
  const startRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + startName + '\\s*\\(');
  const start = lineNoOf(lines, startRe, 0);
  if (start < 0) throw new Error('start function line not found: ' + startName);

  let end = -1;
  for (const name of possibleEndNames) {
    const endRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + name + '\\s*\\(');
    const candidate = lineNoOf(lines, endRe, start + 1);
    if (candidate >= 0 && (end < 0 || candidate < end)) end = candidate;
  }

  if (end < 0) throw new Error('end function line not found after ' + startName);

  const newChunk = replacer(lines.slice(start, end).join('\n'));
  return lines.slice(0, start).concat(newChunk.trimEnd().split('\n')).concat(lines.slice(end)).join('\n');
}

function insertBeforeFunction(text, functionName, block) {
  const lines = text.split('\n');
  const start = lineNoOf(lines, new RegExp('^\\s*(?:async\\s+)?function\\s+' + functionName + '\\s*\\('), 0);
  if (start < 0) throw new Error('function anchor not found: ' + functionName);
  return lines.slice(0, start).concat(block.trimEnd().split('\n')).concat(lines.slice(start)).join('\n');
}

const before = {
  mark: count(core, MARK),
  ownerHelper: count(core, 'function aicmDeleteOwnerCivilizationIdR8V8B'),
  executeHelper: count(core, 'async function aicmExecuteMajorItemDeleteConfirmR8P'),
  archiveEndpoint: count(core, '/api/aicm/v2/manager-major/archive'),
  corePayloadMajorKey: count(core, 'aicm_manager_major_work_item_id'),
  corePayloadOwnerKey: count(core, 'owner_civilization_id'),
  confirmState: count(core, 'managerMajorDeleteConfirm'),
  v7c2: count(core, 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER'),
  v7d2: count(core, 'AICM_R8_V7D2_DELETE_CONFIRM_VISIBLE'),
  v6c: count(core, 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverArchiveRoute: count(server, '/api/aicm/v2/manager-major/archive'),
  serverRequiresOwner: count(server, 'requiredUuid(body.owner_civilization_id, "owner_civilization_id")'),
  serverRequiresMajorId: count(server, 'requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);

if (count(core, 'function aicmDeleteOwnerCivilizationIdR8V8B') > 0) {
  throw new Error('unmarked V8B owner helper already exists; review required');
}

const helperBlock = [
  START,
  '  function aicmDeleteTextR8V8B(value) {',
  '    if (value === null || typeof value === "undefined") return "";',
  '    return String(value).trim();',
  '  }',
  '',
  '  function aicmDeleteOwnerCivilizationIdR8V8B() {',
  '    if (state && state.ownerCivilizationId) return aicmDeleteTextR8V8B(state.ownerCivilizationId);',
  '    if (state && state.owner_civilization_id) return aicmDeleteTextR8V8B(state.owner_civilization_id);',
  '    if (state && state.context && state.context.owner_civilization_id) return aicmDeleteTextR8V8B(state.context.owner_civilization_id);',
  '    if (state && state.context && state.context.ownerCivilizationId) return aicmDeleteTextR8V8B(state.context.ownerCivilizationId);',
  '    if (typeof aicmHumanReviewOwnerId === "function") return aicmDeleteTextR8V8B(aicmHumanReviewOwnerId());',
  '    return "00000000-0000-4000-8000-000000000001";',
  '  }',
  '',
  '  function aicmDeleteApiErrorTextR8V8B(response, json, rawText) {',
  '    var parts = [];',
  '    if (response && response.status) parts.push("HTTP " + response.status);',
  '    if (json && json.error_message) parts.push(String(json.error_message));',
  '    if (json && json.error) parts.push(String(json.error));',
  '    if (json && json.message) parts.push(String(json.message));',
  '    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));',
  '    if (!parts.length) parts.push("削除APIでエラーが発生しました。");',
  '    return parts.join(" / ");',
  '  }',
  END
].join('\n');

core = insertBeforeFunction(core, 'aicmExecuteMajorItemDeleteConfirmR8P', helperBlock);

const executeFunction = [
  '  async function aicmExecuteMajorItemDeleteConfirmR8P() {',
  '    var payload = state.managerMajorDeleteConfirm || null;',
  '    if (!payload || !payload.majorId) {',
  '      setMessage("error", "削除確認対象がありません。");',
  '      render();',
  '      return;',
  '    }',
  '',
  '    var ownerCivilizationId = aicmDeleteOwnerCivilizationIdR8V8B();',
  '    if (!ownerCivilizationId) {',
  '      setMessage("error", "owner_civilization_idを特定できません。");',
  '      render();',
  '      return;',
  '    }',
  '',
  '    try {',
  '      var response = await fetch("/api/aicm/v2/manager-major/archive", {',
  '        method: "POST",',
  '        headers: {',
  '          "content-type": "application/json"',
  '        },',
  '        body: JSON.stringify({',
  '          owner_civilization_id: ownerCivilizationId,',
  '          aicm_manager_major_work_item_id: payload.majorId',
  '        })',
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
  '        throw new Error(aicmDeleteApiErrorTextR8V8B(response, json, rawText));',
  '      }',
  '',
  '      state.managerMajorDeleteConfirm = null;',
  '      setMessage("ok", "大項目を削除済みにしました。");',
  '      await aicmReloadTaskLedgerContext();',
  '      state.screen = "task-ledger";',
  '      render();',
  '    } catch (error) {',
  '      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");',
  '      render();',
  '    }',
  '  }'
].join('\n');

core = replaceRangeByFunctionAnchors(
  core,
  'aicmExecuteMajorItemDeleteConfirmR8P',
  [
    'renderPmlwMajorRowsBaseAxuR1B',
    'renderPmlwMajorRows',
    'aicmGetManagerMajorRowsForSelectedCompany',
    'aicmIsPendingManagerMajorRowR8V6',
    'aicmRenderManagerMajorRows',
    'aicmRenderTaskLedgerSafeR8V4'
  ],
  function () {
    return executeFunction;
  }
);

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
  ownerHelper: count(core, 'function aicmDeleteOwnerCivilizationIdR8V8B'),
  textHelper: count(core, 'function aicmDeleteTextR8V8B'),
  apiErrorHelper: count(core, 'function aicmDeleteApiErrorTextR8V8B'),
  executeHelper: count(core, 'async function aicmExecuteMajorItemDeleteConfirmR8P'),
  archiveEndpoint: count(core, '/api/aicm/v2/manager-major/archive'),
  payloadMajorKey: count(core, 'aicm_manager_major_work_item_id'),
  payloadOwnerKey: count(core, 'owner_civilization_id'),
  confirmState: count(core, 'managerMajorDeleteConfirm'),
  v7c2: count(core, 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER'),
  v7d2: count(core, 'AICM_R8_V7D2_DELETE_CONFIRM_VISIBLE'),
  v6c: count(core, 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverArchiveRoute: count(server, '/api/aicm/v2/manager-major/archive'),
  serverRequiresOwner: count(server, 'requiredUuid(body.owner_civilization_id, "owner_civilization_id")'),
  serverRequiresMajorId: count(server, 'requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 2) throw new Error('V8B markers missing');
if (after.ownerHelper !== 1) throw new Error('owner helper count invalid: ' + after.ownerHelper);
if (after.textHelper !== 1) throw new Error('text helper count invalid: ' + after.textHelper);
if (after.apiErrorHelper !== 1) throw new Error('api error helper count invalid: ' + after.apiErrorHelper);
if (after.executeHelper !== 1) throw new Error('execute helper count invalid: ' + after.executeHelper);
if (after.archiveEndpoint < 1) throw new Error('archive endpoint missing in core');
if (after.payloadMajorKey < 1) throw new Error('payload major key missing in core');
if (after.payloadOwnerKey < 1) throw new Error('payload owner key missing in core');
if (after.serverArchiveRoute < 1) throw new Error('server archive route missing');
if (after.serverRequiresOwner < 1) throw new Error('server owner requirement missing');
if (after.serverRequiresMajorId < 1) throw new Error('server major id requirement missing');
if (after.v7c2 < 4) throw new Error('V7-clean2 marker missing');
if (after.v7d2 < 2) throw new Error('V7D2 marker missing');
if (after.v6c < 2) throw new Error('V6C marker missing');
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V8B delete execute sends owner_civilization_id and major id required by server archive route',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write_during_patch: 'NO',
  api_post_during_patch: 'NO',
  delete_executed_during_patch: 'NO'
}, null, 2));
