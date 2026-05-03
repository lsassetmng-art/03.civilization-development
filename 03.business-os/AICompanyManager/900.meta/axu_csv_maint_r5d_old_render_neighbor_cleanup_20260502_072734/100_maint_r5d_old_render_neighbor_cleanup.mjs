import fs from 'node:fs';

const file = process.env.CORE;
const before = fs.readFileSync(file, 'utf8');
let src = before;

const renderNeedle = 'function aicmRenderManagerMajorRows';
const rowsNeedle = 'function aicmGetManagerMajorRowsForSelectedCompany';
const oldMarker = 'AICM_MANAGER_MAJOR_RENDER_CANONICAL_V1: render';
const pendingMarker = 'AICM_MANAGER_MAJOR_PENDING_DISPLAY_CANONICAL_V1: render';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

const beforeRenderCount = countText(src, renderNeedle);
const beforeRowsCount = countText(src, rowsNeedle);
const beforeOldMarkerCount = countText(src, oldMarker);
const beforePendingMarkerCount = countText(src, pendingMarker);

console.log('beforeRenderHelperCount=' + beforeRenderCount);
console.log('beforeRowsHelperCount=' + beforeRowsCount);
console.log('beforeOldMarkerCount=' + beforeOldMarkerCount);
console.log('beforePendingMarkerCount=' + beforePendingMarkerCount);

if (beforeRenderCount !== 2) {
  console.error('Expected exactly two render helpers before cleanup, found ' + beforeRenderCount);
  process.exit(1);
}

if (beforeRowsCount !== 1) {
  console.error('Expected exactly one rows helper, found ' + beforeRowsCount);
  process.exit(1);
}

if (beforeOldMarkerCount !== 1) {
  console.error('Expected exactly one old marker, found ' + beforeOldMarkerCount);
  process.exit(1);
}

if (beforePendingMarkerCount < 1) {
  console.error('Pending marker missing; stop.');
  process.exit(1);
}

const oldMarkerIndex = src.indexOf(oldMarker);
const oldFunctionStart = src.lastIndexOf(renderNeedle, oldMarkerIndex);
const rowsFunctionStart = src.indexOf(rowsNeedle, oldMarkerIndex);

if (oldFunctionStart < 0) {
  console.error('Could not locate old render function start.');
  process.exit(1);
}

if (rowsFunctionStart < 0) {
  console.error('Could not locate next rows helper after old marker.');
  process.exit(1);
}

if (oldFunctionStart >= rowsFunctionStart) {
  console.error('Invalid cleanup window: oldFunctionStart >= rowsFunctionStart.');
  process.exit(1);
}

const removeWindow = src.slice(oldFunctionStart, rowsFunctionStart);

console.log('removeWindowLength=' + removeWindow.length);
console.log('removeWindowRenderCount=' + countText(removeWindow, renderNeedle));
console.log('removeWindowRowsCount=' + countText(removeWindow, rowsNeedle));
console.log('removeWindowOldMarkerCount=' + countText(removeWindow, oldMarker));
console.log('removeWindowPendingMarkerCount=' + countText(removeWindow, pendingMarker));
console.log('removeWindowHasPlaceholder=' + String(removeWindow.includes('function renderTaskLedgerPlaceholder')));
console.log('removeWindowHasReload=' + String(removeWindow.includes('function aicmReloadTaskLedgerContext')));

if (countText(removeWindow, renderNeedle) !== 1) {
  console.error('Remove window does not contain exactly one render helper.');
  process.exit(1);
}

if (countText(removeWindow, rowsNeedle) !== 0) {
  console.error('Remove window unexpectedly contains rows helper.');
  process.exit(1);
}

if (countText(removeWindow, oldMarker) !== 1) {
  console.error('Remove window does not contain exactly one old marker.');
  process.exit(1);
}

if (countText(removeWindow, pendingMarker) !== 0) {
  console.error('Remove window contains pending marker; stop to avoid deleting current helper.');
  process.exit(1);
}

if (removeWindow.includes('function renderTaskLedgerPlaceholder')) {
  console.error('Remove window contains placeholder; stop.');
  process.exit(1);
}

if (removeWindow.includes('function aicmReloadTaskLedgerContext')) {
  console.error('Remove window contains reload helper; stop.');
  process.exit(1);
}

src = src.slice(0, oldFunctionStart) + '\n' + src.slice(rowsFunctionStart);

fs.writeFileSync(file, src, 'utf8');

const after = fs.readFileSync(file, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('afterRenderHelperCount=' + countText(after, renderNeedle));
console.log('afterRowsHelperCount=' + countText(after, rowsNeedle));
console.log('afterOldMarkerCount=' + countText(after, oldMarker));
console.log('afterPendingMarkerCount=' + countText(after, pendingMarker));
console.log('reloadHelperCount=' + countText(after, 'function aicmReloadTaskLedgerContext'));
console.log('placeholderCount=' + countText(after, 'function renderTaskLedgerPlaceholder'));
console.log('legacyR10HelperCount=' + countText(after, 'function aicmAxuCsvR10RenderPmlwMajorRows'));
console.log('refreshActionCount=' + countText(after, 'task-ledger-refresh'));
console.log('pendingFilterCount=' + countText(after, 'isPendingMajor'));
console.log('handoffActionCount=' + countText(after, 'pmlw-major-leader-handoff'));
console.log('tokenLeakCountCore=' + countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN'));
console.log('asyncAsyncCountCore=' + countText(after, 'async async function'));
