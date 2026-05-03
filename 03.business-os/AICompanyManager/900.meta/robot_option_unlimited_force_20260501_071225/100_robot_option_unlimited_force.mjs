import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_ROBOT_OPTION_UNLIMITED_FORCE_AXQ_R1_V1';

function countText(needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRange(functionName) {
  const start = src.indexOf(`function ${functionName}(`);
  if (start < 0) return null;

  const open = src.indexOf('{', start);
  if (open < 0) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = open; i < src.length; i += 1) {
    const ch = src[i];
    const next = src[i + 1];

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

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) return { start, open, end: i + 1 };
  }

  return null;
}

function replaceFunction(functionName, replacement) {
  const range = findFunctionRange(functionName);
  if (!range) {
    console.error(`Function not found: ${functionName}`);
    process.exit(1);
  }

  src = src.slice(0, range.start) + replacement + src.slice(range.end);
}

replaceFunction('aicmAxqUnlimited', `function aicmAxqUnlimited(row) {
    // ${marker}
    // AICompanyManager robot placement is unlimited allocation by app design.
    // Do not treat available_quantity=0 as unavailable in this app.
    // Candidate eligibility is controlled by recommended_role_codes, not inventory consumption.
    return true;
  }`);

replaceFunction('aicmAxqAvailabilityText', `function aicmAxqAvailabilityText(row) {
    // ${marker}
    return "利用可能:無制限";
  }`);

replaceFunction('aicmAxqSelectable', `function aicmAxqSelectable(row) {
    // ${marker}
    return true;
  }`);

fs.writeFileSync(coreFile, src, 'utf8');

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(marker)}`);
console.log(`unlimitedFunctionCount=${countText('function aicmAxqUnlimited')}`);
console.log(`availabilityTextFunctionCount=${countText('function aicmAxqAvailabilityText')}`);
console.log(`selectableFunctionCount=${countText('function aicmAxqSelectable')}`);
console.log(`unlimitedLabelCount=${countText('利用可能:無制限')}`);
console.log(`unavailableLabelCount=${countText('利用不可')}`);
console.log(`asyncAsyncCount=${countText('async async function')}`);
