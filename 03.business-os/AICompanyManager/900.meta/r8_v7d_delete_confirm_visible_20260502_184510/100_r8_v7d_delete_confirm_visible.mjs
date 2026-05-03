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

const MARK = 'AICM_R8_V7D_DELETE_CONFIRM_VISIBLE';
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

  if (end < 0) {
    throw new Error('end function line not found after ' + startName + ': ' + possibleEndNames.join(', '));
  }

  const oldChunk = lines.slice(start, end).join('\n');
  const newChunk = replacer(oldChunk);

  return lines.slice(0, start).concat(newChunk.trimEnd().split('\n')).concat(lines.slice(end)).join('\n');
}

function insertBeforeNeedle(text, needle, block) {
  const idx = text.indexOf(needle);
  if (idx < 0) throw new Error('insert anchor not found: ' + needle);
  return text.slice(0, idx) + block.trimEnd() + '\n\n  ' + text.slice(idx);
}

const before = {
  mark: count(core, MARK),
  confirmId: count(core, 'aicm-manager-major-delete-confirm'),
  confirmRenderer: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  deleteOpenWrapper: count(core, 'function aicmOpenMajorDeleteConfirmFromActionR8V7C2'),
  oldOpenHelper: count(core, 'function aicmOpenMajorItemDeleteConfirmR8P'),
  deleteOpenHandler: count(core, 'if (action === "pmlw-major-delete-open")'),
  scrollIntoView: count(core, 'scrollIntoView'),
  v7c2: count(core, 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER'),
  v6c: count(core, 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);

/*
  Add a stable id to the existing delete confirmation card.
*/
core = core.replace(
  /'<section class="aicm-core-card" style="border:2px solid #f97316;">'/g,
  '\'<section id="aicm-manager-major-delete-confirm" class="aicm-core-card" style="border:2px solid #f97316;">\''
);

/*
  If the exact quote shape was already changed, do not fail yet.
  The assertions below will verify at least one id exists.
*/

/*
  Add scroll helper near delete action helpers.
*/
const scrollHelper = `
${START}
  function aicmScrollMajorDeleteConfirmIntoViewR8V7D() {
    try {
      var card = document.getElementById("aicm-manager-major-delete-confirm");
      if (card && card.scrollIntoView) {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (_) {
    }
  }
${END}
`;

if (count(core, 'function aicmScrollMajorDeleteConfirmIntoViewR8V7D') === 0) {
  core = insertBeforeNeedle(core, 'function aicmResolveMajorDeleteActionTargetR8V7C2', scrollHelper);
}

/*
  Patch wrapper to scroll after the existing helper renders.
*/
core = replaceRangeByFunctionAnchors(
  core,
  'aicmOpenMajorDeleteConfirmFromActionR8V7C2',
  ['aicmCancelMajorDeleteConfirmFromActionR8V7C2', 'aicmExecuteMajorDeleteConfirmFromActionR8V7C2', 'aicmMoveMajorItemPageFromActionR8V7C2'],
  function (oldChunk) {
    let updated = oldChunk;

    if (!updated.includes('aicmScrollMajorDeleteConfirmIntoViewR8V7D')) {
      updated = updated.replace(
        /aicmOpenMajorItemDeleteConfirmR8P\(deleteTarget\);\s*\n/,
        'aicmOpenMajorItemDeleteConfirmR8P(deleteTarget);\\n\\n    if (typeof aicmScrollMajorDeleteConfirmIntoViewR8V7D === "function") {\\n      setTimeout(aicmScrollMajorDeleteConfirmIntoViewR8V7D, 50);\\n    }\\n'
      );
    }

    return updated;
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
  confirmId: count(core, 'aicm-manager-major-delete-confirm'),
  scrollHelper: count(core, 'function aicmScrollMajorDeleteConfirmIntoViewR8V7D'),
  scrollCall: count(core, 'aicmScrollMajorDeleteConfirmIntoViewR8V7D'),
  scrollIntoView: count(core, 'scrollIntoView'),
  confirmRenderer: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  deleteOpenWrapper: count(core, 'function aicmOpenMajorDeleteConfirmFromActionR8V7C2'),
  oldOpenHelper: count(core, 'function aicmOpenMajorItemDeleteConfirmR8P'),
  deleteOpenHandler: count(core, 'if (action === "pmlw-major-delete-open")'),
  v7c2: count(core, 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER'),
  v6c: count(core, 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 2) throw new Error('V7D markers missing');
if (after.confirmId < 1) throw new Error('delete confirm id missing');
if (after.scrollHelper !== 1) throw new Error('scroll helper count invalid: ' + after.scrollHelper);
if (after.scrollCall < 2) throw new Error('scroll helper call missing: ' + after.scrollCall);
if (after.scrollIntoView < 1) throw new Error('scrollIntoView missing');
if (after.confirmRenderer !== 1) throw new Error('delete confirm renderer count invalid: ' + after.confirmRenderer);
if (after.deleteOpenWrapper !== 1) throw new Error('delete open wrapper count invalid: ' + after.deleteOpenWrapper);
if (after.oldOpenHelper !== 1) throw new Error('existing delete open helper count invalid: ' + after.oldOpenHelper);
if (after.deleteOpenHandler !== 1) throw new Error('delete open handler count invalid: ' + after.deleteOpenHandler);
if (after.v7c2 < 4) throw new Error('V7-clean2 markers missing');
if (after.v6c < 2) throw new Error('V6C marker/helper missing');
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V7D stable confirm card id and scroll into view',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
