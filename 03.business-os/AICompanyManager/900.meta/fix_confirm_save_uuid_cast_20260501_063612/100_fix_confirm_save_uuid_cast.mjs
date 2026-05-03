import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
const coreFile = process.env.CLEAN_CORE;

if (!serverFile || !coreFile) {
  console.error('SERVER_FILE or CLEAN_CORE env missing');
  process.exit(1);
}

let server = fs.readFileSync(serverFile, 'utf8');
let core = fs.readFileSync(coreFile, 'utf8');

const serverBefore = server;
const coreBefore = core;

const serverMarker = 'AICM_ROLE_SYNC_UUID_CAST_AXM_V1';
const coreMarker = 'AICM_CONFIRM_SAVE_ERROR_RENDER_AXM_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRange(src, functionName) {
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

// ------------------------------------------------------------
// 1. Server: syncRoleSettings UUID cast fix only.
// ------------------------------------------------------------
{
  const range = findFunctionRange(server, 'syncRoleSettings');
  if (!range) {
    console.error('syncRoleSettings function not found');
    process.exit(1);
  }

  let fn = server.slice(range.start, range.end);

  if (!fn.includes(serverMarker)) {
    const beforeSelect = '"  SELECT",';
    if (!fn.includes(beforeSelect)) {
      console.error('syncRoleSettings insert SELECT anchor not found');
      process.exit(1);
    }

    fn = fn.replace(
      beforeSelect,
      beforeSelect + '\n    "  -- ' + serverMarker + '",'
    );

    const replacements = [
      [
        '"    i.aicm_user_company_department_id,",',
        '"    i.aicm_user_company_department_id::uuid,",'
      ],
      [
        '"    i.aicm_user_company_section_id,",',
        '"    i.aicm_user_company_section_id::uuid,",'
      ],
      [
        '"    i.robot_pool_id,",',
        '"    i.robot_pool_id::uuid,",'
      ]
    ];

    for (const [from, to] of replacements) {
      if (!fn.includes(from)) {
        console.error('Expected server SQL line not found: ' + from);
        process.exit(1);
      }
      fn = fn.replace(from, to);
    }

    server = server.slice(0, range.start) + fn + server.slice(range.end);
  }
}

// ------------------------------------------------------------
// 2. Core: improve error visibility and error_message extraction.
// No flow rewrite.
// ------------------------------------------------------------
{
  const oldThrow = 'throw new Error(json.message || json.error || ("API failed: " + path));';
  const newThrow = 'throw new Error(json.error_message || json.message || json.error || ("API failed: " + path));';

  if (core.includes(oldThrow)) {
    core = core.replace(oldThrow, newThrow);
  }

  const range = findFunctionRange(core, 'executeAicmOrgUpdateConfirm');
  if (!range) {
    console.error('executeAicmOrgUpdateConfirm function not found');
    process.exit(1);
  }

  let fn = core.slice(range.start, range.end);

  if (!fn.includes(coreMarker)) {
    const catchLine = 'setMessage("error", error && error.message ? error.message : "保存に失敗しました。");';
    if (!fn.includes(catchLine)) {
      console.error('execute catch setMessage line not found');
      process.exit(1);
    }

    fn = fn.replace(
      catchLine,
      catchLine + '\n      // ' + coreMarker + '\n      if (typeof render === "function") render();'
    );

    core = core.slice(0, range.start) + fn + core.slice(range.end);
  }
}

fs.writeFileSync(serverFile, server, 'utf8');
fs.writeFileSync(coreFile, core, 'utf8');

console.log(`serverChanged=${server !== serverBefore}`);
console.log(`coreChanged=${core !== coreBefore}`);
console.log(`serverMarkerCount=${countText(server, serverMarker)}`);
console.log(`coreMarkerCount=${countText(core, coreMarker)}`);
console.log(`deptUuidCastCount=${countText(server, 'i.aicm_user_company_department_id::uuid')}`);
console.log(`sectionUuidCastCount=${countText(server, 'i.aicm_user_company_section_id::uuid')}`);
console.log(`robotPoolUuidCastCount=${countText(server, 'i.robot_pool_id::uuid')}`);
console.log(`errorMessageThrowCount=${countText(core, 'json.error_message || json.message')}`);
console.log(`nodeCheckRiskAsyncAsyncCount=${countText(core, 'async async function')}`);
