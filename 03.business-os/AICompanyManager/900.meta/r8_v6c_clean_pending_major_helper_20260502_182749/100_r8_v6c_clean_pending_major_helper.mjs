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

const MARK = 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER';
const OLD_MARK = 'AICM_R8_V6_CLEAN_PENDING_MAJOR_HELPER';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';
const OLD_START = '// ' + OLD_MARK + '_START';
const OLD_END = '// ' + OLD_MARK + '_END';

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

function rendererChunk(text) {
  const lines = text.split('\n');
  const start = lineNoOf(lines, /^\s*function\s+aicmRenderManagerMajorRows\s*\(/, 0);
  if (start < 0) throw new Error('renderer start not found');

  let end = -1;
  for (const name of ['aicmRenderTaskLedgerSafeR8V4', 'aicmOpenTaskLedgerScreenR8V3Clean', 'aicmReloadTaskLedgerContext', 'aicmHydrateManagerMajorContextArraysR8M']) {
    const re = new RegExp('^\\s*(?:async\\s+)?function\\s+' + name + '\\s*\\(');
    const candidate = lineNoOf(lines, re, start + 1);
    if (candidate >= 0 && (end < 0 || candidate < end)) end = candidate;
  }

  if (end < 0) throw new Error('renderer end not found');

  return {
    startLine: start + 1,
    endLine: end,
    text: lines.slice(start, end).join('\n')
  };
}

const before = {
  mark: count(core, MARK),
  oldMark: count(core, OLD_MARK),
  helper: count(core, 'function aicmIsPendingManagerMajorRowR8V6'),
  renderer: count(core, 'function aicmRenderManagerMajorRows'),
  globalIsPendingDeclaration: count(core, 'function isPendingMajor'),
  globalIsPendingText: count(core, 'isPendingMajor(row)'),
  cleanCall: count(core, 'aicmIsPendingManagerMajorRowR8V6(row)'),
  safeRender: count(core, 'function aicmRenderTaskLedgerSafeR8V4'),
  reload: count(core, 'async function aicmReloadTaskLedgerContext'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);
core = removeMarkedBlock(core, OLD_START, OLD_END);

/*
  If a previous unmarked V6 helper exists, stop. We do not want duplicate truth.
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

const chunk = rendererChunk(core);

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

const helperLine = core.split('\n').findIndex((line) => /^\s*function\s+aicmIsPendingManagerMajorRowR8V6\s*\(/.test(line)) + 1;
const renderLine = core.split('\n').findIndex((line) => /^\s*function\s+aicmRenderManagerMajorRows\s*\(/.test(line)) + 1;

const after = {
  mark: count(core, MARK),
  oldMark: count(core, OLD_MARK),
  helper: count(core, 'function aicmIsPendingManagerMajorRowR8V6'),
  renderer: count(core, 'function aicmRenderManagerMajorRows'),
  globalIsPendingDeclaration: count(core, 'function isPendingMajor'),
  globalIsPendingText: count(core, 'isPendingMajor(row)'),
  cleanCall: count(core, 'aicmIsPendingManagerMajorRowR8V6(row)'),
  rendererHasOldCall: /isPendingMajor\s*\(\s*row\s*\)/.test(chunk.text),
  rendererHasCleanCall: /aicmIsPendingManagerMajorRowR8V6\s*\(\s*row\s*\)/.test(chunk.text),
  safeRender: count(core, 'function aicmRenderTaskLedgerSafeR8V4'),
  reload: count(core, 'async function aicmReloadTaskLedgerContext'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef),
  helperLine,
  renderLine,
  rendererStartLine: chunk.startLine,
  rendererEndLine: chunk.endLine,
  htmlUpdates
};

if (after.mark < 2) throw new Error('V6C markers missing');
if (after.oldMark !== 0) throw new Error('old V6-clean marker still present');
if (after.helper !== 1) throw new Error('helper count invalid: ' + after.helper);
if (after.renderer !== 1) throw new Error('renderer count invalid: ' + after.renderer);
if (after.rendererHasOldCall) throw new Error('renderer still calls isPendingMajor(row)');
if (!after.rendererHasCleanCall) throw new Error('renderer does not call clean helper');
if (after.safeRender !== 1) throw new Error('safe render helper count invalid: ' + after.safeRender);
if (after.reload !== 1) throw new Error('reload helper count invalid: ' + after.reload);
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (after.helperLine <= 0 || after.renderLine <= 0 || after.helperLine >= after.renderLine) {
  throw new Error('helper must be before renderer. helperLine=' + after.helperLine + ' renderLine=' + after.renderLine);
}
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V6C verifies renderer chunk only; function declaration is not treated as call',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
