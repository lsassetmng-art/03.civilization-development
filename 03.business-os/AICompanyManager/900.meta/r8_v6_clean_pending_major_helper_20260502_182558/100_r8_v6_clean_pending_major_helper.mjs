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

const MARK = 'AICM_R8_V6_CLEAN_PENDING_MAJOR_HELPER';
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

function findLine(text, re) {
  const lines = text.split('\n');
  return lineNoOf(lines, re, 0);
}

function replaceRangeByFunctionAnchors(text, startName, possibleEndNames, replacer) {
  const lines = text.split('\n');
  const startRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + startName + '\\s*\\(');
  const start = lineNoOf(lines, startRe, 0);
  if (start < 0) throw new Error('start function line not found: ' + startName);

  let end = -1;
  let endName = '';
  for (const name of possibleEndNames) {
    const endRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + name + '\\s*\\(');
    const candidate = lineNoOf(lines, endRe, start + 1);
    if (candidate >= 0 && (end < 0 || candidate < end)) {
      end = candidate;
      endName = name;
    }
  }

  if (end < 0) {
    throw new Error('end function line not found after ' + startName + ': ' + possibleEndNames.join(', '));
  }

  const oldChunk = lines.slice(start, end).join('\n');
  const newChunk = replacer(oldChunk, endName);

  return lines.slice(0, start).concat(newChunk.trimEnd().split('\n')).concat(lines.slice(end)).join('\n');
}

const before = {
  mark: count(core, MARK),
  helper: count(core, 'function aicmIsPendingManagerMajorRowR8V6'),
  renderMajor: count(core, 'function aicmRenderManagerMajorRows'),
  externalIsPendingCall: count(core, 'isPendingMajor(row)'),
  cleanCall: count(core, 'aicmIsPendingManagerMajorRowR8V6(row)'),
  safeRender: count(core, 'function aicmRenderTaskLedgerSafeR8V4'),
  reload: count(core, 'async function aicmReloadTaskLedgerContext'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);

/*
  Remove any previous V6-clean helper line range if marker removal left duplicate is impossible.
  If there is an unmarked helper from a failed manual patch, fail instead of guessing.
*/
if (count(core, 'function aicmIsPendingManagerMajorRowR8V6') > 0) {
  throw new Error('unmarked aicmIsPendingManagerMajorRowR8V6 already exists; review required');
}

const helperBlock = `
${START}
  function aicmIsPendingManagerMajorRowR8V6(row) {
    if (!row || typeof row !== "object") return false;

    var handoff = String(row.handoff_status_code || "").toLowerCase();
    var decomposition = String(row.decomposition_status_code || "").toLowerCase();
    var deleted = String(row.deleted_flag || row.is_deleted || "").toLowerCase();
    var archived = String(row.archived_flag || row.is_archived || "").toLowerCase();

    if (deleted === "true" || deleted === "1") return false;
    if (archived === "true" || archived === "1") return false;

    if (
      handoff === "archived" ||
      handoff === "deleted" ||
      handoff === "cancelled" ||
      handoff === "canceled" ||
      handoff === "sent" ||
      handoff === "handed_off" ||
      handoff === "completed" ||
      handoff === "done"
    ) {
      return false;
    }

    if (
      decomposition === "completed" ||
      decomposition === "complete" ||
      decomposition === "done"
    ) {
      return false;
    }

    return true;
  }
${END}
`;

core = replaceRangeByFunctionAnchors(
  core,
  'aicmRenderManagerMajorRows',
  ['aicmRenderTaskLedgerSafeR8V4', 'aicmOpenTaskLedgerScreenR8V3Clean', 'aicmReloadTaskLedgerContext', 'aicmHydrateManagerMajorContextArraysR8M'],
  function (oldChunk) {
    let updated = oldChunk.replace(/isPendingMajor\s*\(\s*row\s*\)/g, 'aicmIsPendingManagerMajorRowR8V6(row)');

    if (!updated.includes('aicmIsPendingManagerMajorRowR8V6(row)')) {
      throw new Error('renderer did not contain replaceable pending predicate call');
    }

    return helperBlock + '\n\n' + updated;
  }
);

const helperLine = findLine(core, /^\s*function\s+aicmIsPendingManagerMajorRowR8V6\s*\(/);
const renderLine = findLine(core, /^\s*function\s+aicmRenderManagerMajorRows\s*\(/);

if (helperLine < 0 || renderLine < 0 || helperLine >= renderLine) {
  throw new Error('helper must exist before renderer. helperLine=' + helperLine + ' renderLine=' + renderLine);
}

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
  helper: count(core, 'function aicmIsPendingManagerMajorRowR8V6'),
  renderMajor: count(core, 'function aicmRenderManagerMajorRows'),
  externalIsPendingCall: count(core, 'isPendingMajor(row)'),
  cleanCall: count(core, 'aicmIsPendingManagerMajorRowR8V6(row)'),
  safeRender: count(core, 'function aicmRenderTaskLedgerSafeR8V4'),
  reload: count(core, 'async function aicmReloadTaskLedgerContext'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef),
  helperLine: helperLine + 1,
  renderLine: renderLine + 1,
  htmlUpdates
};

if (after.mark < 2) throw new Error('V6-clean markers missing');
if (after.helper !== 1) throw new Error('helper count invalid: ' + after.helper);
if (after.renderMajor !== 1) throw new Error('renderer count invalid: ' + after.renderMajor);
if (after.externalIsPendingCall !== 0) throw new Error('external isPendingMajor(row) call still exists: ' + after.externalIsPendingCall);
if (after.cleanCall < 1) throw new Error('clean helper call missing');
if (after.safeRender !== 1) throw new Error('safe render helper count invalid: ' + after.safeRender);
if (after.reload !== 1) throw new Error('reload helper count invalid: ' + after.reload);
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V6-clean dedicated helper immediately before renderer',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
