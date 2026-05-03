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

const MARK = 'AICM_R8_NAV_V5_RESTORE_IS_PENDING_MAJOR';
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

function insertBeforeNeedle(text, needle, block) {
  const idx = text.indexOf(needle);
  if (idx < 0) throw new Error('insert anchor not found: ' + needle);
  return text.slice(0, idx) + block.trimEnd() + '\n\n  ' + text.slice(idx);
}

const before = {
  coreMark: count(core, MARK),
  coreHelper: count(core, 'function isPendingMajor'),
  coreCall: count(core, 'isPendingMajor(row)'),
  serverOldVersion: count(server, '20260430_112432_clean_production_core'),
  serverCoreScriptRefs: count(server, 'aicm-production-core.js?v='),
};

core = removeMarkedBlock(core, START, END);

const helperBlock = `
${START}
  function isPendingMajor(row) {
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

if (count(core, 'function isPendingMajor') === 0) {
  core = insertBeforeNeedle(core, 'function aicmRenderManagerMajorRows', helperBlock);
}

/*
  Cache bust:
  Replace script refs in server and html files if present.
  The browser currently reports old ?v=20260430_112432_clean_production_core.
*/
const newScriptRef = 'aicm-production-core.js?v=' + cacheTag;

server = server.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

const htmlFiles = [];
for (const name of fs.readdirSync(appRoot)) {
  if (name.endsWith('.html') || name.endsWith('.htm')) {
    htmlFiles.push(path.join(appRoot, name));
  }
}

const htmlUpdates = [];
for (const htmlPath of htmlFiles) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  const beforeHtml = html;
  html = html.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

  if (html !== beforeHtml) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    htmlUpdates.push(htmlPath);
  }
}

const after = {
  coreMark: count(core, MARK),
  coreHelper: count(core, 'function isPendingMajor'),
  coreCall: count(core, 'isPendingMajor(row)'),
  serverOldVersion: count(server, '20260430_112432_clean_production_core'),
  serverCoreScriptRefs: count(server, 'aicm-production-core.js?v='),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.coreHelper !== 1) throw new Error('isPendingMajor helper count invalid: ' + after.coreHelper);
if (after.coreCall < 1) throw new Error('isPendingMajor call missing');
if (after.coreMark < 2) throw new Error('V5 helper markers missing');
if (after.serverCoreScriptRefs > 0 && after.serverNewVersion < 1) {
  throw new Error('server script ref exists but new cache tag not applied');
}

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED_OR_VERIFIED',
  method: 'ensure isPendingMajor helper exists and bump script cache tag',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
