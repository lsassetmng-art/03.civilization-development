import fs from 'node:fs';

const corePath = process.argv[2];
const serverPath = process.argv[3];
const cacheTag = process.argv[4];

let core = fs.readFileSync(corePath, 'utf8');
let server = fs.readFileSync(serverPath, 'utf8');

const MARK = 'AICM_R8V_REMOVE_LEADER_INBOX_UI';
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

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const match = re.exec(text);
  if (!match) throw new Error('function not found: ' + name);

  const start = match.index;
  const open = text.indexOf('{', start);
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
      if (depth === 0) return { start, end: i + 1, oldText: text.slice(start, i + 1) };
    }
  }

  throw new Error('closing brace not found: ' + name);
}

const before = {
  mark: count(core, MARK),
  r8tMarker: count(core, 'AICM_R8T_LEADER_INBOX_DISPLAY'),
  r8uMarker: count(core, 'AICM_R8U_MANAGER_MAJOR_SUMMARY'),
  leaderRenderCall: count(core, 'aicmRenderLeaderInboxR8T()'),
  leaderInboxTitle: count(core, '課長/Leader受信箱'),
  leaderInboxAction: count(core, 'leader-inbox-middle-breakdown-open'),
  summaryRenderCall: count(core, 'aicmRenderManagerMajorSummarySectionR8U()'),
  taskLedgerRenderer: count(core, 'function renderTaskLedgerPlaceholder'),
  serverScriptRefs: count(server, 'aicm-production-core.js?v=')
};

core = removeMarkedBlock(core, START, END);

const range = findFunctionRange(core, 'renderTaskLedgerPlaceholder');
let chunk = range.oldText;

const beforeChunk = chunk;

const leaderSectionRegex = /,\s*'\s*<section class="aicm-core-card">\s*',\s*'\s*<p class="aicm-eyebrow">Leader受信箱<\/p>\s*',\s*'\s*<h2>課長\/Leader受信箱<\/h2>\s*',\s*'\s*<p class="aicm-selected-note">課長へ送ったManager大項目を表示します。次工程で中項目へ分解します。<\/p>\s*',\s*aicmRenderLeaderInboxR8T\(\),\s*'\s*<\/section>\s*'/;

chunk = chunk.replace(leaderSectionRegex, '');

if (chunk === beforeChunk && chunk.includes('aicmRenderLeaderInboxR8T()')) {
  throw new Error('Leader inbox render call remains in renderTaskLedgerPlaceholder; regex did not match');
}

if (!chunk.includes(START)) {
  const insertPoint = chunk.indexOf('return renderShell([');
  if (insertPoint < 0) throw new Error('return renderShell anchor not found');

  const markerBlock = [
    START,
    '  // Leader受信箱 routine section removed.',
    '  // Manager大項目サマリの Leader受信済み 件数/詳細を正面表示として使う。',
    END,
    ''
  ].join('\n');

  chunk = chunk.slice(0, insertPoint) + markerBlock + chunk.slice(insertPoint);
}

core = core.slice(0, range.start) + chunk + core.slice(range.end);

const newScriptRef = 'aicm-production-core.js?v=' + cacheTag;
server = server.replace(/aicm-production-core\.js\?v=[A-Za-z0-9_.:-]+/g, newScriptRef);

const afterRange = findFunctionRange(core, 'renderTaskLedgerPlaceholder');
const afterChunk = afterRange.oldText;

const after = {
  mark: count(core, MARK),
  r8tMarker: count(core, 'AICM_R8T_LEADER_INBOX_DISPLAY'),
  r8uMarker: count(core, 'AICM_R8U_MANAGER_MAJOR_SUMMARY'),
  leaderRenderCallGlobal: count(core, 'aicmRenderLeaderInboxR8T()'),
  leaderRenderCallInTaskLedger: count(afterChunk, 'aicmRenderLeaderInboxR8T()'),
  leaderInboxTitleInTaskLedger: count(afterChunk, '課長/Leader受信箱'),
  leaderInboxAction: count(core, 'leader-inbox-middle-breakdown-open'),
  summaryRenderCall: count(core, 'aicmRenderManagerMajorSummarySectionR8U()'),
  summaryRenderCallInTaskLedger: count(afterChunk, 'aicmRenderManagerMajorSummarySectionR8U()'),
  taskLedgerRenderer: count(core, 'function renderTaskLedgerPlaceholder'),
  serverNewVersion: count(server, newScriptRef)
};

if (after.mark < 2) throw new Error('R8V markers missing');
if (after.r8uMarker < 1) throw new Error('R8U summary marker missing');
if (after.summaryRenderCall < 1) throw new Error('summary render call missing globally');
if (after.summaryRenderCallInTaskLedger < 1) throw new Error('summary render call missing in task ledger');
if (after.leaderRenderCallInTaskLedger !== 0) throw new Error('leader inbox render call still in task ledger');
if (after.leaderInboxTitleInTaskLedger !== 0) throw new Error('leader inbox title still in task ledger');
if (after.taskLedgerRenderer !== 1) throw new Error('renderTaskLedgerPlaceholder count invalid');
if (before.serverScriptRefs > 0 && after.serverNewVersion < 1) throw new Error('server cache tag not updated');

fs.writeFileSync(corePath, core, 'utf8');
fs.writeFileSync(serverPath, server, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'Removed Leader inbox routine section from renderTaskLedgerPlaceholder; Manager summary remains canonical',
  cacheTag,
  newScriptRef,
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  physical_delete: 'NO'
}, null, 2));
