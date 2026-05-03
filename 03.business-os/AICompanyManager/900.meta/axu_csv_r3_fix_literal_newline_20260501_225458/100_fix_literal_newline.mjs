import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

const marker = 'AICM_AXU_CSV_R3_FIX1_LITERAL_NEWLINE_REPAIR_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

const brokenExact = '    if (action === "task-ledger-csv-import") {\\n      aicmCsvImportLoadedReadBeforeImport();\\n      return;\\n    }';

const fixedExact = [
  '    // ' + marker,
  '    if (action === "task-ledger-csv-import") {',
  '      aicmCsvImportLoadedReadBeforeImport();',
  '      return;',
  '    }'
].join('\n');

let exactCount = countText(core, brokenExact);

if (exactCount > 0) {
  core = core.split(brokenExact).join(fixedExact);
} else {
  const brokenLoose = /[ \t]*if \(action === "task-ledger-csv-import"\) \{\\n[ \t]*aicmCsvImportLoadedReadBeforeImport\(\);\\n[ \t]*return;\\n[ \t]*\}/g;
  core = core.replace(brokenLoose, fixedExact);
}

fs.writeFileSync(coreFile, core, 'utf8');

const after = fs.readFileSync(coreFile, 'utf8');

console.log('coreChanged=' + String(before !== after));
console.log('exactBrokenCountBefore=' + String(exactCount));
console.log('markerCount=' + String(countText(after, marker)));
console.log('remainingBrokenCsvImportLiteralCount=' + String(countText(after, 'if (action === "task-ledger-csv-import") {\\n')));
console.log('remainingReadBeforeLiteralCount=' + String(countText(after, 'aicmCsvImportLoadedReadBeforeImport();\\n')));
console.log('readBeforeImportCallCount=' + String(countText(after, 'aicmCsvImportLoadedReadBeforeImport();')));
console.log('badActionLiteralNewlineCount=' + String(
  countText(after, 'if (action === "task-ledger-csv-import") {\\n') +
  countText(after, 'if (action === "go") {\\n') +
  countText(after, 'if (action === "task-ledger-csv-file-open") {\\n')
));
console.log('tokenLeakCountCore=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(after, 'async async function')));
