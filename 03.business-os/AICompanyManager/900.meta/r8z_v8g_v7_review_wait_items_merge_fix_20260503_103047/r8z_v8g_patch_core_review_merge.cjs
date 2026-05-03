const fs = require('fs');

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE';
const log = [];

let src = fs.readFileSync(corePath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

function findFunctionBlock(text, name) {
  const fnPattern = new RegExp('function\\s+' + name + '\\s*\\(');
  const m = text.match(fnPattern);
  if (!m || typeof m.index !== 'number') return null;

  const start = m.index;
  const brace = text.indexOf('{', start);
  if (brace < 0) return null;

  let depth = 0;
  let inStr = '';
  let esc = false;

  for (let i = brace; i < text.length; i++) {
    const ch = text[i];

    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === '\\') {
        esc = true;
      } else if (ch === inStr) {
        inStr = '';
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return { start, brace, end: i + 1, block: text.slice(start, i + 1) };
      }
    }
  }

  return null;
}

const blockInfo = findFunctionBlock(src, 'hydrateIfNeeded');
if (!blockInfo) {
  log.push('ERROR: hydrateIfNeeded block not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

if (!/r8z_v7_/.test(blockInfo.block) && !/aicmR8zV7Hydrating/.test(blockInfo.block)) {
  log.push('ERROR: hydrateIfNeeded block does not look like V7 hydrate block');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

const helper = `

  // ${marker}: helper begin
  function aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload) {
    appState = appState || {};
    payload = payload && typeof payload === "object" ? payload : {};

    var payloadContext = payload.context && typeof payload.context === "object" ? payload.context : {};
    var payloadData = payload.data && typeof payload.data === "object" ? payload.data : {};

    var rows = [];
    if (Array.isArray(payload.review_wait_items)) rows = payload.review_wait_items;
    else if (Array.isArray(payloadContext.review_wait_items)) rows = payloadContext.review_wait_items;
    else if (Array.isArray(payloadData.review_wait_items)) rows = payloadData.review_wait_items;
    else if (Array.isArray(payload.human_review_wait_items)) rows = payload.human_review_wait_items;
    else if (Array.isArray(payload.reviewWaitItems)) rows = payload.reviewWaitItems;
    else if (Array.isArray(payload.humanReviewWaitItems)) rows = payload.humanReviewWaitItems;

    if (!Array.isArray(rows)) rows = [];

    if (!appState.context || typeof appState.context !== "object") {
      appState.context = {};
    }

    appState.context.review_wait_items = rows;
    appState.review_wait_items = rows;

    if (payload.owner_civilization_id) {
      appState.context.owner_civilization_id = payload.owner_civilization_id;
      appState.owner_civilization_id = payload.owner_civilization_id;
    }

    if (payload.aicm_user_company_id) {
      appState.context.aicm_user_company_id = payload.aicm_user_company_id;
      appState.selectedCompanyId = payload.aicm_user_company_id;
    }

    if (typeof state !== "undefined" && state && state !== appState) {
      if (!state.context || typeof state.context !== "object") {
        state.context = {};
      }
      state.context.review_wait_items = rows;
      state.review_wait_items = rows;

      if (payload.owner_civilization_id) {
        state.context.owner_civilization_id = payload.owner_civilization_id;
        state.owner_civilization_id = payload.owner_civilization_id;
      }

      if (payload.aicm_user_company_id) {
        state.context.aicm_user_company_id = payload.aicm_user_company_id;
        state.selectedCompanyId = payload.aicm_user_company_id;
      }
    }

    appState.aicmR8zV8gReviewWaitItemsMergedCount = rows.length;
    return rows;
  }
  // ${marker}: helper end
`;

let block = blockInfo.block;

const insertHelperAfter = block.indexOf('{') + 1;
block = block.slice(0, insertHelperAfter) + helper + block.slice(insertHelperAfter);

const parsePattern = /try\s*\{\s*payload\s*=\s*bodyText\s*\?\s*JSON\.parse\(bodyText\)\s*:\s*\{\}\s*;\s*\}\s*catch\s*\([^)]*\)\s*\{\s*payload\s*=\s*\{\}\s*;\s*\}/m;
const parseMatch = block.match(parsePattern);

if (!parseMatch || typeof parseMatch.index !== 'number') {
  log.push('ERROR: payload JSON parse block not found inside hydrateIfNeeded');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(4);
}

const mergeCall = `

          // ${marker}: merge payload review_wait_items into appState/state
          aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
`;

const insertPos = parseMatch.index + parseMatch[0].length;
block = block.slice(0, insertPos) + mergeCall + block.slice(insertPos);

src = src.slice(0, blockInfo.start) + block + src.slice(blockInfo.end);

fs.writeFileSync(corePath, src, 'utf8');

log.push('PATCH_APPLIED: helper added inside hydrateIfNeeded');
log.push('PATCH_APPLIED: merge call added after payload JSON parse');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
