import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_ROBOT_FILTER_RECOMMENDED_ROLE_CODES_AXP_V1';

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

replaceFunction('aicmRobotMatchesInlineRole', `function aicmRobotMatchesInlineRole(row, roleCode) {
    // ${marker}
    // Canonical source:
    // business.vw_ai_company_manager_system_robot_selector_options.recommended_role_codes
    //
    // Do not infer candidates from display_name / aiworker_model_code text.
    // Example:
    // - HD-R5P President must not appear in Manager unless Manager is explicitly recommended.
    // - BYD2-003 Leader3 must not appear in Worker unless Worker is explicitly recommended.
    // - HD-R2G General must not appear in Leader just because TacticalLeader contains "Leader".

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function canonicalRole(value) {
      var text = normalize(value);

      if (text === "president" || text === "社長" || text === "プレジデント") return "president";
      if (text === "manager" || text === "部長" || text === "マネージャ" || text === "マネージャー") return "manager";
      if (text === "leader" || text === "課長" || text === "リーダ" || text === "リーダー") return "leader";
      if (text === "worker" || text === "従業員" || text === "ワーカー") return "worker";

      return text;
    }

    function addRole(list, value) {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach(function (item) {
          addRole(list, item);
        });
        return;
      }

      var raw = String(value || "").trim();
      if (!raw) return;

      raw
        .replace(/^\\{/, "")
        .replace(/\\}$/, "")
        .split(/[;,|]/)
        .forEach(function (part) {
          var canonical = canonicalRole(part);
          if (canonical) list.push(canonical);
        });
    }

    var roles = [];

    addRole(roles, row && row.recommended_role_codes);
    addRole(roles, row && row.recommendedRoleCodes);

    // Optional compatibility with direct robot_pool columns when a future context includes them.
    addRole(roles, row && row.placement_role_code_1);
    addRole(roles, row && row.placement_role_code_2);
    addRole(roles, row && row.placement_role_code_3);

    // Optional compatibility with singular explicit role fields.
    // These are accepted only as exact role fields, not display/model text.
    addRole(roles, row && row.eligible_role_code);
    addRole(roles, row && row.available_role_code);

    var wanted = canonicalRole(roleCode);

    if (!wanted || !roles.length) {
      return false;
    }

    return roles.indexOf(wanted) >= 0;
  }`);

fs.writeFileSync(coreFile, src, 'utf8');

const range = findFunctionRange(src, 'aicmRobotMatchesInlineRole');
const fn = range ? src.slice(range.start, range.end) : '';

console.log(`coreChanged=${src !== before}`);
console.log(`markerCount=${countText(marker)}`);
console.log(`matchFunctionCount=${countText('function aicmRobotMatchesInlineRole')}`);
console.log(`recommendedRoleCodesCount=${countText('recommended_role_codes')}`);
console.log(`placementRoleCodeCount=${countText('placement_role_code_1') + countText('placement_role_code_2') + countText('placement_role_code_3')}`);
console.log(`functionUsesTextIndexOf=${fn.includes('indexOf("president")') || fn.includes('indexOf("manager")') || fn.includes('indexOf("leader")') || fn.includes('indexOf("worker")')}`);
console.log(`functionUsesRCodeFallback=${fn.includes('r5p') || fn.includes('r5') || fn.includes('r4') || fn.includes('r3')}`);
console.log(`asyncAsyncCount=${countText('async async function')}`);
