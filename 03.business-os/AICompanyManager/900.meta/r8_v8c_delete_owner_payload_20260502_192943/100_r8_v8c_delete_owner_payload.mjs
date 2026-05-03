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

const MARK = 'AICM_R8_V8C_DELETE_OWNER_PAYLOAD';
const OLD_B = 'AICM_R8_V8B_DELETE_OWNER_PAYLOAD';

const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';
const OLD_B_START = '// ' + OLD_B + '_START';
const OLD_B_END = '// ' + OLD_B + '_END';

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

      if (ch === quote) {
        quote = null;
      }

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
        return {
          start,
          end: i + 1,
          oldText: text.slice(start, i + 1)
        };
      }
    }
  }

  throw new Error('closing brace not found: ' + name);
}

const before = {
  mark: count(core, MARK),
  oldB: count(core, OLD_B),
  ownerHelper: count(core, 'function aicmDeleteOwnerCivilizationIdR8V8C'),
  executeHelper: count(core, 'async function aicmExecuteMajorItemDeleteConfirmR8P'),
  archiveEndpoint: count(core, '/api/aicm/v2/manager-major/archive'),
  payloadMajorKey: count(core, 'aicm_manager_major_work_item_id'),
  payloadOwnerKey: count(core, 'owner_civilization_id'),
  confirmState: count(core, 'managerMajorDeleteConfirm'),
  deleteExecuteAction: count(core, 'pmlw-major-delete-execute'),
  deleteExecuteWrapper: count(core, 'function aicmExecuteMajorDeleteConfirmFromActionR8V7C2'),
  deleteConfirmCard: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverArchiveRoute: count(server, '/api/aicm/v2/manager-major/archive'),
  serverRequiresOwner: count(server, 'requiredUuid(body.owner_civilization_id, "owner_civilization_id")'),
  serverRequiresMajorId: count(server, 'requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);
core = removeMarkedBlock(core, OLD_B_START, OLD_B_END);

if (count(core, 'function aicmDeleteOwnerCivilizationIdR8V8C') > 0) {
  throw new Error('unmarked V8C owner helper already exists; review required');
}

const executeRange = findFunctionRange(core, 'aicmExecuteMajorItemDeleteConfirmR8P');

const replacement = [
  START,
  '  function aicmDeleteTextR8V8C(value) {',
  '    if (value === null || typeof value === "undefined") return "";',
  '    return String(value).trim();',
  '  }',
  '',
  '  function aicmDeleteOwnerCivilizationIdR8V8C(payload) {',
  '    var p = payload && typeof payload === "object" ? payload : {};',
  '',
  '    if (p.owner_civilization_id) return aicmDeleteTextR8V8C(p.owner_civilization_id);',
  '    if (p.ownerCivilizationId) return aicmDeleteTextR8V8C(p.ownerCivilizationId);',
  '    if (state && state.ownerCivilizationId) return aicmDeleteTextR8V8C(state.ownerCivilizationId);',
  '    if (state && state.owner_civilization_id) return aicmDeleteTextR8V8C(state.owner_civilization_id);',
  '    if (state && state.context && state.context.owner_civilization_id) return aicmDeleteTextR8V8C(state.context.owner_civilization_id);',
  '    if (state && state.context && state.context.ownerCivilizationId) return aicmDeleteTextR8V8C(state.context.ownerCivilizationId);',
  '    if (typeof aicmHumanReviewOwnerId === "function") return aicmDeleteTextR8V8C(aicmHumanReviewOwnerId());',
  '',
  '    return "00000000-0000-4000-8000-000000000001";',
  '  }',
  '',
  '  function aicmDeleteApiErrorTextR8V8C(response, json, rawText) {',
  '    var parts = [];',
  '    if (response && response.status) parts.push("HTTP " + response.status);',
  '    if (json && json.result && json.result !== "ok") parts.push("result=" + String(json.result));',
  '    if (json && json.error_message) parts.push(String(json.error_message));',
  '    if (json && json.error) parts.push(String(json.error));',
  '    if (json && json.message) parts.push(String(json.message));',
  '    if (!parts.length && rawText) parts.push(String(rawText).slice(0, 500));',
  '    if (!parts.length) parts.push("削除APIでエラーが発生しました。");',
  '    return parts.join(" / ");',
  '  }',
  END,
  '',
  '  async function aicmExecuteMajorItemDeleteConfirmR8P() {',
  '    var payload = state.managerMajorDeleteConfirm || null;',
  '    if (!payload || !payload.majorId) {',
  '      setMessage("error", "削除確認対象がありません。");',
  '      render();',
  '      return;',
  '    }',
  '',
  '    var ownerCivilizationId = aicmDeleteOwnerCivilizationIdR8V8C(payload);',
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
  '        throw new Error(aicmDeleteApiErrorTextR8V8C(response, json, rawText));',
  '      }',
  '',
  '      state.managerMajorDeleteConfirm = null;',
  '      setMessage("ok", "大項目を削除済みにしました。");',
  '',
  '      if (typeof aicmReloadTaskLedgerContext === "function") {',
  '        await aicmReloadTaskLedgerContext();',
  '      } else {',
  '        state.screen = "task-ledger";',
  '        render();',
  '      }',
  '    } catch (error) {',
  '      setMessage("error", error && error.message ? error.message : "大項目の削除に失敗しました。");',
  '      render();',
  '    }',
  '  }'
].join('\n');

core = core.slice(0, executeRange.start) + replacement + core.slice(executeRange.end);

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
  oldB: count(core, OLD_B),
  ownerHelper: count(core, 'function aicmDeleteOwnerCivilizationIdR8V8C'),
  textHelper: count(core, 'function aicmDeleteTextR8V8C'),
  apiErrorHelper: count(core, 'function aicmDeleteApiErrorTextR8V8C'),
  executeHelper: count(core, 'async function aicmExecuteMajorItemDeleteConfirmR8P'),
  archiveEndpoint: count(core, '/api/aicm/v2/manager-major/archive'),
  payloadMajorKey: count(core, 'aicm_manager_major_work_item_id'),
  payloadOwnerKey: count(core, 'owner_civilization_id'),
  confirmState: count(core, 'managerMajorDeleteConfirm'),
  deleteExecuteAction: count(core, 'pmlw-major-delete-execute'),
  deleteExecuteWrapper: count(core, 'function aicmExecuteMajorDeleteConfirmFromActionR8V7C2'),
  deleteConfirmCard: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverArchiveRoute: count(server, '/api/aicm/v2/manager-major/archive'),
  serverRequiresOwner: count(server, 'requiredUuid(body.owner_civilization_id, "owner_civilization_id")'),
  serverRequiresMajorId: count(server, 'requiredUuid(body.aicm_manager_major_work_item_id, "aicm_manager_major_work_item_id")'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 2) throw new Error('V8C markers missing');
if (after.oldB !== 0) throw new Error('old V8B marker remains');
if (after.ownerHelper !== 1) throw new Error('owner helper count invalid: ' + after.ownerHelper);
if (after.textHelper !== 1) throw new Error('text helper count invalid: ' + after.textHelper);
if (after.apiErrorHelper !== 1) throw new Error('api error helper count invalid: ' + after.apiErrorHelper);
if (after.executeHelper !== 1) throw new Error('execute helper count invalid: ' + after.executeHelper);
if (after.archiveEndpoint < 1) throw new Error('archive endpoint missing in core');
if (after.payloadMajorKey < 1) throw new Error('payload major key missing in core');
if (after.payloadOwnerKey < 1) throw new Error('payload owner key missing in core');
if (after.deleteExecuteAction < 1) throw new Error('delete execute action missing');
if (after.deleteExecuteWrapper !== 1) throw new Error('delete execute wrapper count invalid: ' + after.deleteExecuteWrapper);
if (after.deleteConfirmCard !== 1) throw new Error('delete confirm card count invalid: ' + after.deleteConfirmCard);
if (after.serverArchiveRoute < 1) throw new Error('server archive route missing');
if (after.serverRequiresOwner < 1) throw new Error('server owner requirement missing');
if (after.serverRequiresMajorId < 1) throw new Error('server major id requirement missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V8C delete execute sends owner_civilization_id and major id required by archive route; no V6C marker dependency',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write_during_patch: 'NO',
  api_post_during_patch: 'NO',
  delete_executed_during_patch: 'NO'
}, null, 2));
