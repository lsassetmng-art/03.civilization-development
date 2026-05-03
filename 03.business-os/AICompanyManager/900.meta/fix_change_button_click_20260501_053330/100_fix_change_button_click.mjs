import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

function findFunctionRangeByName(src, functionName) {
  const start = src.indexOf(`function ${functionName}(`);
  if (start < 0) return null;
  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) return { start, open, end: i + 1 };
  }
  return null;
}

function findFunctionRangeContaining(src, needle) {
  const needleIndex = src.indexOf(needle);
  if (needleIndex < 0) return null;

  const functionIndex = src.lastIndexOf('function ', needleIndex);
  if (functionIndex < 0) return null;

  const open = src.indexOf('{', functionIndex);
  if (open < 0 || open > needleIndex) return null;

  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;
    if (depth === 0) return { start: functionIndex, open, end: i + 1 };
  }
  return null;
}

const marker = 'AICM_CHANGE_BUTTON_CLICK_TARGET_NORMALIZE_AXD_V1';

let range = findFunctionRangeByName(core, 'handleRootClick');
if (!range) {
  range = findFunctionRangeContaining(core, 'department-update-select');
}
if (!range) {
  console.error('Could not locate click handler function safely.');
  process.exit(1);
}

let fn = core.slice(range.start, range.end);

if (!fn.includes('department-update-select') && !fn.includes('section-update-select') && !fn.includes('company-update-save')) {
  console.error('Located function does not contain expected update actions. Refuse patch.');
  process.exit(1);
}

if (!fn.includes(marker)) {
  // Replace event.target usage inside the click handler only.
  // This keeps the existing handler and action cases intact.
  fn = fn.replace(/\bevent\.target\b/g, 'aicmActionTarget');

  const insertAt = fn.indexOf('{') + 1;
  const normalized = `
  // ${marker}
  var aicmRawClickTarget = event.target;
  var aicmActionTarget = aicmRawClickTarget && aicmRawClickTarget.closest
    ? (aicmRawClickTarget.closest("[data-core-action]") || aicmRawClickTarget)
    : aicmRawClickTarget;
`;

  fn = fn.slice(0, insertAt) + normalized + fn.slice(insertAt);
}

core = core.slice(0, range.start) + fn + core.slice(range.end);

fs.writeFileSync(coreFile, core, 'utf8');

console.log(`coreChanged=${core !== before}`);
console.log(`markerCount=${core.split(marker).length - 1}`);
console.log(`departmentSelectCount=${core.split('department-update-select').length - 1}`);
console.log(`sectionSelectCount=${core.split('section-update-select').length - 1}`);
console.log(`companySaveCount=${core.split('company-update-save').length - 1}`);
console.log(`closestActionCount=${core.split('closest("[data-core-action]")').length - 1}`);
