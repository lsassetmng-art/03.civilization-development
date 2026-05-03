import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
const coreFile = process.env.CLEAN_CORE;

if (!serverFile || !coreFile) {
  console.error('SERVER_FILE / CLEAN_CORE env missing');
  process.exit(1);
}

let server = fs.readFileSync(serverFile, 'utf8');
let core = fs.readFileSync(coreFile, 'utf8');

const beforeServer = server;
const beforeCore = core;

const marker = 'AICM_WORKBENCH_RUNTIME_CODE_NORMALIZE_AXT_R7_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionRangeContaining(srcText, needle) {
  const needleIndex = srcText.indexOf(needle);
  if (needleIndex < 0) return null;

  const prefix = srcText.slice(0, needleIndex);
  const matches = [...prefix.matchAll(/(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*\{/g)];
  if (!matches.length) return null;

  for (let m = matches.length - 1; m >= 0; m -= 1) {
    const start = matches[m].index;
    const open = srcText.indexOf('{', start);
    if (open < 0) continue;

    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let i = open; i < srcText.length; i += 1) {
      const ch = srcText[i];
      const next = srcText[i + 1];

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

      if (depth === 0) {
        const fn = srcText.slice(start, i + 1);
        if (fn.includes(needle)) return { start, open, end: i + 1, text: fn };
        break;
      }
    }
  }

  return null;
}

function insertBeforeServerAnchor(anchor, text) {
  const idx = server.indexOf(anchor);
  if (idx < 0) {
    console.error('Server anchor not found: ' + anchor);
    process.exit(1);
  }
  server = server.slice(0, idx) + text + '\n\n' + server.slice(idx);
}

/*
 * 1. Add server-side canonicalization helpers.
 */
if (!server.includes('function aicmNormalizeWorkbenchRuntimeRequestBody')) {
  const helper = `
// ${marker}
// Normalize AICompanyManager Workbench request values to AIWorkerOS runtime profile canon.
// DB access here is read-only and uses the existing runPsqlJson/sqlLiteral pattern.
function aicmNormalizeWorkbenchRuntimeAppSurfaceCode(value) {
  const text = String(value || "").trim();

  if (!text || text === "ai_company_manager_worker_execution" || text === "AICompanyManager") {
    return "ai_company_manager";
  }

  return text;
}

function aicmNormalizeWorkbenchRuntimeModelCode(value) {
  const text = String(value || "").trim();

  if (!text) {
    return text;
  }

  const sql = [
    "SELECT jsonb_build_object(",
    "  'result', 'ok',",
    "  'input_model_code', " + sqlLiteral(text) + ",",
    "  'model_code', COALESCE((",
    "    SELECT c.model_code",
    "    FROM aiworker.vw_app_aiworker_robot_selection_card_v1 c",
    "    WHERE lower(c.model_code) = lower(" + sqlLiteral(text) + ")",
    "       OR lower(c.model_no) = lower(" + sqlLiteral(text) + ")",
    "       OR lower(replace(c.model_no, '-', '_')) = lower(replace(" + sqlLiteral(text) + ", '-', '_'))",
    "       OR lower(replace(c.model_code, '_', '-')) = lower(replace(" + sqlLiteral(text) + ", '_', '-'))",
    "    ORDER BY CASE",
    "      WHEN lower(c.model_code) = lower(" + sqlLiteral(text) + ") THEN 0",
    "      WHEN lower(c.model_no) = lower(" + sqlLiteral(text) + ") THEN 1",
    "      ELSE 2",
    "    END, c.sort_order",
    "    LIMIT 1",
    "  ), " + sqlLiteral(text) + ")",
    ")::text;"
  ].join("\\n");

  try {
    const result = runPsqlJson(sql);
    return result && result.model_code ? String(result.model_code) : text;
  } catch (error) {
    return text;
  }
}

function aicmNormalizeWorkbenchRuntimeRequestBody(body) {
  const input = body && typeof body === "object" ? body : {};
  const next = { ...input };

  const rawModelCode = (
    next.model_code ||
    next.aiworker_model_code ||
    next.model_no ||
    next.worker_model_code ||
    ""
  );

  next.app_surface_code = aicmNormalizeWorkbenchRuntimeAppSurfaceCode(next.app_surface_code);
  next.model_code = aicmNormalizeWorkbenchRuntimeModelCode(rawModelCode);

  return next;
}`;

  if (server.includes('// AICM_WORKER_RUNTIME_REQUEST_AXS_V1')) {
    insertBeforeServerAnchor('// AICM_WORKER_RUNTIME_REQUEST_AXS_V1', helper);
  } else if (server.includes('async function handleApi')) {
    insertBeforeServerAnchor('async function handleApi', helper);
  } else {
    console.error('Could not locate safe server helper insertion anchor');
    process.exit(1);
  }
}

/*
 * 2. Patch the outbound AIWorkerOS runtime request helper.
 * We keep function names and endpoint names stable.
 */
const outboundRange =
  findFunctionRangeContaining(server, '/aiworker/v1/runtime-execution/request') ||
  findFunctionRangeContaining(server, 'runtime-execution/request');

if (!outboundRange) {
  console.error('Could not locate outbound AIWorkerOS runtime request function');
  process.exit(1);
}

let fnText = outboundRange.text;

if (!fnText.includes(marker)) {
  const signature = fnText.match(/(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(\s*([A-Za-z_$][\w$]*)/);
  if (!signature) {
    console.error('Could not detect first parameter in outbound runtime function');
    process.exit(1);
  }

  const paramName = signature[1];
  const open = fnText.indexOf('{');

  fnText =
    fnText.slice(0, open + 1) +
    `\n  // ${marker}\n  ${paramName} = aicmNormalizeWorkbenchRuntimeRequestBody(${paramName});\n` +
    fnText.slice(open + 1);

  server = server.slice(0, outboundRange.start) + fnText + server.slice(outboundRange.end);
}

/*
 * 3. UI/core: use canonical AICompanyManager app_surface_code in Workbench display/payload.
 * Model normalization is server-side because placement rows may store model_no.
 */
core = core.split('ai_company_manager_worker_execution').join('ai_company_manager');

fs.writeFileSync(serverFile, server, 'utf8');
fs.writeFileSync(coreFile, core, 'utf8');

console.log('serverChanged=' + String(server !== beforeServer));
console.log('coreChanged=' + String(core !== beforeCore));
console.log('markerCountServer=' + String(countText(server, marker)));
console.log('helperCount=' + String(countText(server, 'function aicmNormalizeWorkbenchRuntimeRequestBody')));
console.log('modelNormalizeCount=' + String(countText(server, 'function aicmNormalizeWorkbenchRuntimeModelCode')));
console.log('surfaceNormalizeCount=' + String(countText(server, 'function aicmNormalizeWorkbenchRuntimeAppSurfaceCode')));
console.log('outboundRuntimeEndpointCount=' + String(countText(server, '/aiworker/v1/runtime-execution/request')));
console.log('oldSurfaceCountCore=' + String(countText(core, 'ai_company_manager_worker_execution')));
console.log('canonicalSurfaceCountCore=' + String(countText(core, 'ai_company_manager')));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(server, 'async async function')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
