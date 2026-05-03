import fs from 'node:fs';
import path from 'node:path';

const appRoot = process.argv[2];
const corePath = process.argv[3];
const serverPath = process.argv[4];
const cacheTag = process.argv[5];

let core = fs.readFileSync(corePath, 'utf8');
let server = fs.readFileSync(serverPath, 'utf8');

const MARK = 'AICM_R8_V7D2_DELETE_CONFIRM_VISIBLE';
const OLD_MARK = 'AICM_R8_V7D_DELETE_CONFIRM_VISIBLE';
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
  for (const name of possibleEndNames) {
    const endRe = new RegExp('^\\s*(?:async\\s+)?function\\s+' + name + '\\s*\\(');
    const candidate = lineNoOf(lines, endRe, start + 1);
    if (candidate >= 0 && (end < 0 || candidate < end)) end = candidate;
  }

  if (end < 0) {
    throw new Error('end function line not found after ' + startName);
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
  oldMark: count(core, OLD_MARK),
  confirmId: count(core, 'aicm-manager-major-delete-confirm'),
  scrollHelper: count(core, 'function aicmScrollMajorDeleteConfirmIntoViewR8V7D2'),
  confirmRenderer: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  deleteOpenWrapper: count(core, 'function aicmOpenMajorDeleteConfirmFromActionR8V7C2'),
  v7c2: count(core, 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER'),
  v6c: count(core, 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER'),
  literalBackslashN: count(core, '\\n\\n'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);
core = removeMarkedBlock(core, OLD_START, OLD_END);

/*
  Stable confirm-card id.
  Patch only inside confirm renderer so other orange cards are not affected.
*/
core = replaceRangeByFunctionAnchors(
  core,
  'aicmRenderMajorItemDeleteConfirmCardR8P',
  ['aicmOpenMajorItemDeleteConfirmR8P', 'aicmCancelMajorItemDeleteConfirmR8P', 'aicmExecuteMajorItemDeleteConfirmR8P'],
  function (oldChunk) {
    let updated = oldChunk;

    if (!updated.includes('aicm-manager-major-delete-confirm')) {
      updated = updated.replace(
        /'<section class="aicm-core-card" style="border:2px solid #f97316;">'/,
        '\'<section id="aicm-manager-major-delete-confirm" class="aicm-core-card" style="border:2px solid #f97316;">\''
      );
    }

    if (!updated.includes('aicm-manager-major-delete-confirm')) {
      updated = updated.replace(
        /'<section class="aicm-core-card/,
        '\'<section id="aicm-manager-major-delete-confirm" class="aicm-core-card'
      );
    }

    return updated;
  }
);

/*
  Scroll helper.
*/
const scrollHelper = [
  START,
  '  function aicmScrollMajorDeleteConfirmIntoViewR8V7D2() {',
  '    try {',
  '      var card = document.getElementById("aicm-manager-major-delete-confirm");',
  '      if (card && card.scrollIntoView) {',
  '        card.scrollIntoView({ behavior: "smooth", block: "start" });',
  '      }',
  '    } catch (_) {',
  '    }',
  '  }',
  END
].join('\n');

if (count(core, 'function aicmScrollMajorDeleteConfirmIntoViewR8V7D2') === 0) {
  core = insertBeforeNeedle(core, 'function aicmResolveMajorDeleteActionTargetR8V7C2', scrollHelper);
}

/*
  Patch open wrapper to scroll after confirmation is rendered.
  No literal "\\n" strings are inserted here.
*/
core = replaceRangeByFunctionAnchors(
  core,
  'aicmOpenMajorDeleteConfirmFromActionR8V7C2',
  ['aicmCancelMajorDeleteConfirmFromActionR8V7C2', 'aicmExecuteMajorDeleteConfirmFromActionR8V7C2', 'aicmMoveMajorItemPageFromActionR8V7C2'],
  function (oldChunk) {
    if (oldChunk.includes('aicmScrollMajorDeleteConfirmIntoViewR8V7D2')) return oldChunk;

    const lines = oldChunk.split('\n');
    const out = [];

    for (const line of lines) {
      out.push(line);

      if (/^\s*aicmOpenMajorItemDeleteConfirmR8P\(deleteTarget\);\s*$/.test(line)) {
        const indent = line.match(/^(\s*)/)[1];
        out.push('');
        out.push(indent + 'if (typeof aicmScrollMajorDeleteConfirmIntoViewR8V7D2 === "function") {');
        out.push(indent + '  setTimeout(aicmScrollMajorDeleteConfirmIntoViewR8V7D2, 50);');
        out.push(indent + '}');
      }
    }

    const updated = out.join('\n');

    if (!updated.includes('aicmScrollMajorDeleteConfirmIntoViewR8V7D2')) {
      throw new Error('failed to inject scroll call into delete open wrapper');
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
  oldMark: count(core, OLD_MARK),
  confirmId: count(core, 'aicm-manager-major-delete-confirm'),
  scrollHelper: count(core, 'function aicmScrollMajorDeleteConfirmIntoViewR8V7D2'),
  scrollCall: count(core, 'aicmScrollMajorDeleteConfirmIntoViewR8V7D2'),
  scrollIntoView: count(core, 'scrollIntoView'),
  confirmRenderer: count(core, 'function aicmRenderMajorItemDeleteConfirmCardR8P'),
  deleteOpenWrapper: count(core, 'function aicmOpenMajorDeleteConfirmFromActionR8V7C2'),
  deleteOpenHandler: count(core, 'if (action === "pmlw-major-delete-open")'),
  v7c2: count(core, 'AICM_R8_V7_CLEAN2_DELETE_ACTION_HELPER'),
  v6c: count(core, 'AICM_R8_V6C_CLEAN_PENDING_MAJOR_HELPER'),
  r8m: count(core, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(core, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1'),
  literalBackslashN: count(core, '\\n\\n'),
  serverNewVersion: count(server, newScriptRef),
  htmlUpdates
};

if (after.mark < 2) throw new Error('V7D2 markers missing');
if (after.oldMark !== 0) throw new Error('old V7D marker remains');
if (after.confirmId < 1) throw new Error('delete confirm id missing');
if (after.scrollHelper !== 1) throw new Error('scroll helper count invalid: ' + after.scrollHelper);
if (after.scrollCall < 2) throw new Error('scroll call missing: ' + after.scrollCall);
if (after.scrollIntoView < 1) throw new Error('scrollIntoView missing');
if (after.confirmRenderer !== 1) throw new Error('delete confirm renderer count invalid: ' + after.confirmRenderer);
if (after.deleteOpenWrapper !== 1) throw new Error('delete open wrapper count invalid: ' + after.deleteOpenWrapper);
if (after.deleteOpenHandler !== 1) throw new Error('delete open handler count invalid: ' + after.deleteOpenHandler);
if (after.v7c2 < 4) throw new Error('V7-clean2 marker missing');
if (after.v6c < 2) throw new Error('V6C marker missing');
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');
if (after.literalBackslashN > before.literalBackslashN) throw new Error('literal backslash-n increased');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'V7D2 stable confirm card id and scroll with safe newline insertion',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
