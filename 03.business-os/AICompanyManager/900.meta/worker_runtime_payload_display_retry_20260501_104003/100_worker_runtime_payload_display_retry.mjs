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

const marker = 'AICM_RUNTIME_STATUS_PANEL_AXT_R9_R1_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionStart(srcText, functionName) {
  const patterns = [
    'async function ' + functionName + '(',
    'async function ' + functionName + ' (',
    'function ' + functionName + '(',
    'function ' + functionName + ' ('
  ];

  let best = -1;

  for (const pattern of patterns) {
    const idx = srcText.indexOf(pattern);
    if (idx >= 0 && (best < 0 || idx < best)) {
      best = idx;
    }
  }

  return best;
}

function findFunctionRange(srcText, functionName) {
  const start = findFunctionStart(srcText, functionName);

  if (start < 0) {
    return null;
  }

  const open = srcText.indexOf('{', start);

  if (open < 0) {
    return null;
  }

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

      if (ch === quote) {
        quote = null;
      }

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
      return {
        start,
        end: i + 1,
        text: srcText.slice(start, i + 1)
      };
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
 * 1. Server-side read-only proxy helpers.
 * These are intentionally generic enough to reuse in AIOperationDesk later.
 */
if (!server.includes('function aicmRuntimeStatusAiworkerGet')) {
  const helper = `
// ${marker}
// Reusable AIWorkerOS runtime read-only proxy helpers.
// Browser calls local app server only. AIWorkerOS token stays server-side.
function aicmRuntimeStatusAiworkerBaseUrl() {
  return String(process.env.PERSONA_AIWORKEROS_BASE_URL || "http://127.0.0.1:8787").replace(/\\/+$/, "");
}

function aicmRuntimeStatusAiworkerHeaders() {
  const headers = { "accept": "application/json" };
  const token = String(process.env.PERSONA_AIWORKEROS_AUTH_TOKEN || "").trim();

  if (token) {
    headers.authorization = "Bearer " + token;
  }

  return headers;
}

async function aicmRuntimeStatusAiworkerGet(pathname, searchParams) {
  const base = aicmRuntimeStatusAiworkerBaseUrl();
  const params = new URLSearchParams();

  if (searchParams && typeof searchParams.forEach === "function") {
    searchParams.forEach((value, key) => {
      if (key && value !== undefined && value !== null && String(value).length > 0) {
        params.set(key, String(value));
      }
    });
  }

  const upstreamUrl = base + pathname + (params.toString() ? "?" + params.toString() : "");
  const response = await fetch(upstreamUrl, {
    method: "GET",
    headers: aicmRuntimeStatusAiworkerHeaders()
  });

  const text = await response.text();

  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (error) {
    payload = { raw_text: text };
  }

  if (!response.ok) {
    return {
      result: "error",
      api_identifier: SERVER_MARK,
      upstream_status_code: response.status,
      upstream_path: pathname,
      error_message: "AIWorkerOS runtime GET failed: " + String(response.status),
      upstream_payload: payload
    };
  }

  return {
    result: "ok",
    api_identifier: SERVER_MARK,
    upstream_status_code: response.status,
    upstream_path: pathname,
    payload
  };
}`;

  if (server.includes('async function handleApi')) {
    insertBeforeServerAnchor('async function handleApi', helper);
  } else {
    console.error('Could not locate handleApi anchor');
    process.exit(1);
  }
}

/*
 * 2. Server local GET endpoints.
 */
if (!server.includes('/api/aicm/v2/worker-runtime/pipeline-board')) {
  const routeBlock = `
    // ${marker}
    if (route === "/api/aicm/v2/worker-runtime/pipeline-board" && req.method === "GET") {
      const payload = await aicmRuntimeStatusAiworkerGet("/aiworker/v1/runtime-execution/pipeline-board", url.searchParams);
      sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
      return true;
    }

    if (route === "/api/aicm/v2/worker-runtime/app-read-payload" && req.method === "GET") {
      const payload = await aicmRuntimeStatusAiworkerGet("/aiworker/v1/runtime-execution/app-read-payload", url.searchParams);
      sendJson(res, payload && payload.result === "error" ? 502 : 200, payload);
      return true;
    }
`;

  const unknownAnchor = 'if (route.startsWith("/api/aicm/v2/")) {';

  if (!server.includes(unknownAnchor)) {
    console.error('Unknown v2 endpoint anchor not found');
    process.exit(1);
  }

  server = server.replace(unknownAnchor, routeBlock + '\n    ' + unknownAnchor);
}

/*
 * 3. Core reusable status panel functions.
 */
if (!core.includes('function aicmRuntimeStatusPanelRender')) {
  const helper = `
// ${marker}
// Reusable runtime status panel candidate.
// This is intentionally generic so AIOperationDesk can reuse the same idea later.
function aicmRuntimeStatusRowsFromPayload(payload) {
    if (!payload) return [];

    function firstUsefulArray(value) {
      if (Array.isArray(value)) {
        if (value.some(function (row) {
          return row && typeof row === "object" && (
            row.request_id ||
            row.runtime_execution_request_id ||
            row.request_code ||
            row.task_title ||
            row.model_code
          );
        })) {
          return value;
        }

        for (var i = 0; i < value.length; i += 1) {
          var nested = firstUsefulArray(value[i]);
          if (nested.length) return nested;
        }

        return [];
      }

      if (value && typeof value === "object") {
        var keys = Object.keys(value);

        for (var k = 0; k < keys.length; k += 1) {
          var found = firstUsefulArray(value[keys[k]]);
          if (found.length) return found;
        }
      }

      return [];
    }

    if (Array.isArray(payload)) return firstUsefulArray(payload);
    if (payload.payload) return firstUsefulArray(payload.payload);

    return firstUsefulArray(payload);
  }

function aicmRuntimeStatusShort(value, max) {
    var text = String(value === undefined || value === null ? "" : value);
    var limit = Number(max || 120);

    return text.length > limit ? text.slice(0, limit) + "..." : text;
  }

function aicmRuntimeStatusField(row, names) {
    row = row || {};

    for (var i = 0; i < names.length; i += 1) {
      var value = row[names[i]];

      if (value !== undefined && value !== null && String(value).length > 0) {
        return value;
      }
    }

    return "";
  }

function aicmRuntimeStatusRowsHtml(rows) {
    rows = Array.isArray(rows) ? rows.slice(0, 5) : [];

    if (!rows.length) {
      return '<p class="aicm-core-empty">まだ表示できる実行状況がありません。作成後に「実行状況を更新」を押してください。</p>';
    }

    return rows.map(function (row) {
      var requestId = aicmRuntimeStatusField(row, ["request_id", "runtime_execution_request_id"]);
      var title = aicmRuntimeStatusField(row, ["task_title", "title"]);
      var model = aicmRuntimeStatusField(row, ["model_code", "aiworker_model_code", "model_no"]);
      var status = aicmRuntimeStatusField(row, ["request_status_code", "status_code"]);
      var outputStatus = aicmRuntimeStatusField(row, ["output_status_code"]);
      var deliveryStatus = aicmRuntimeStatusField(row, ["delivery_status_code"]);
      var reviewRequired = aicmRuntimeStatusField(row, ["review_required_flag"]);
      var humanGoRequired = aicmRuntimeStatusField(row, ["human_go_required_flag"]);

      return [
        '<article class="aicm-core-card aicm-runtime-status-row">',
        '  <p class="aicm-eyebrow">Runtime request</p>',
        '  <h3>' + escapeHtml(aicmRuntimeStatusShort(title || requestId || "実行依頼", 80)) + '</h3>',
        '  <div class="aicm-confirm-list">',
        '    <div class="aicm-confirm-row"><strong>request_id</strong><p>' + escapeHtml(String(requestId || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>model_code</strong><p>' + escapeHtml(String(model || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>request_status</strong><p>' + escapeHtml(String(status || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>output_status</strong><p>' + escapeHtml(String(outputStatus || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>delivery_status</strong><p>' + escapeHtml(String(deliveryStatus || "-")) + '</p></div>',
        '    <div class="aicm-confirm-row"><strong>review / human GO</strong><p>' + escapeHtml("review=" + String(reviewRequired || "-") + " / human_go=" + String(humanGoRequired || "-")) + '</p></div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

function aicmRuntimeStatusPanelRender() {
    var loading = !!state.runtimeStatusLoading;
    var error = state.runtimeStatusError || "";
    var rows = Array.isArray(state.runtimeStatusRows) ? state.runtimeStatusRows : [];
    var lastUpdated = state.runtimeStatusUpdatedAt || "";

    return [
      '<section class="aicm-core-card aicm-runtime-status-panel">',
      '  <p class="aicm-eyebrow">AIWorkerOS 実行状況</p>',
      '  <h2>Runtime request / pipeline</h2>',
      '  <p class="aicm-selected-note">AIWorkerOSの app-read-payload / pipeline-board をAICM server経由で読みます。DB書込は行いません。</p>',
      error ? '  <p class="aicm-core-error">' + escapeHtml(error) + '</p>' : '',
      lastUpdated ? '  <p class="aicm-core-empty">最終更新: ' + escapeHtml(lastUpdated) + '</p>' : '',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="worker-runtime-status-refresh">' + (loading ? '更新中...' : '実行状況を更新') + '</button>',
      '  </div>',
      aicmRuntimeStatusRowsHtml(rows),
      '</section>'
    ].join("");
  }

async function aicmRuntimeStatusRefresh() {
    state.runtimeStatusLoading = true;
    state.runtimeStatusError = "";

    if (typeof render === "function") render();

    try {
      var response = await fetch("/api/aicm/v2/worker-runtime/pipeline-board", { method: "GET" });
      var json = await response.json();

      if (!response.ok || (json && json.result === "error")) {
        var message = (json && json.error_message) || "実行状況の取得に失敗しました。";
        throw new Error(message);
      }

      state.runtimeStatusRows = aicmRuntimeStatusRowsFromPayload(json);
      state.runtimeStatusRaw = json;
      state.runtimeStatusUpdatedAt = new Date().toLocaleString();
      state.runtimeStatusLoading = false;
      state.runtimeStatusError = "";

      if (typeof render === "function") render();
    } catch (error) {
      state.runtimeStatusLoading = false;
      state.runtimeStatusError = error && error.message ? error.message : "実行状況の取得に失敗しました。";

      if (typeof render === "function") render();
    }
  }
`;

  const renderRange = findFunctionRange(core, 'renderWorkerRuntimeRequest');

  if (!renderRange) {
    console.error('renderWorkerRuntimeRequest function not found');
    process.exit(1);
  }

  core = core.slice(0, renderRange.start) + helper + '\n\n' + core.slice(renderRange.start);
}

/*
 * 4. Wrap renderWorkerRuntimeRequest without rewriting existing body.
 */
if (!core.includes('function renderWorkerRuntimeRequestBaseAxtR9R1')) {
  const range = findFunctionRange(core, 'renderWorkerRuntimeRequest');

  if (!range) {
    console.error('renderWorkerRuntimeRequest range not found for wrap');
    process.exit(1);
  }

  const original = range.text.replace('function renderWorkerRuntimeRequest', 'function renderWorkerRuntimeRequestBaseAxtR9R1');
  const wrapper = `function renderWorkerRuntimeRequest() {
    // ${marker}
    return renderWorkerRuntimeRequestBaseAxtR9R1() + aicmRuntimeStatusPanelRender();
  }`;

  core = core.slice(0, range.start) + original + '\n\n' + wrapper + core.slice(range.end);
}

/*
 * 5. Wrap executeWorkerRuntimeConfirm to refresh after successful create.
 */
if (!core.includes('function executeWorkerRuntimeConfirmBaseAxtR9R1')) {
  const execRange = findFunctionRange(core, 'executeWorkerRuntimeConfirm');

  if (execRange) {
    const originalExec = execRange.text.replace('function executeWorkerRuntimeConfirm', 'function executeWorkerRuntimeConfirmBaseAxtR9R1');
    const wrapperExec = `async function executeWorkerRuntimeConfirm() {
    // ${marker}
    var result = await executeWorkerRuntimeConfirmBaseAxtR9R1();

    setTimeout(function () {
      if (typeof aicmRuntimeStatusRefresh === "function") {
        aicmRuntimeStatusRefresh();
      }
    }, 250);

    return result;
  }`;

    core = core.slice(0, execRange.start) + originalExec + '\n\n' + wrapperExec + core.slice(execRange.end);
  }
}

/*
 * 6. Add click branch.
 */
if (!core.includes('action === "worker-runtime-status-refresh"')) {
  const actionNeedle = 'var action = button.getAttribute("data-core-action") || "";';
  const idx = core.indexOf(actionNeedle);

  if (idx < 0) {
    console.error('action variable anchor not found');
    process.exit(1);
  }

  const insertAt = idx + actionNeedle.length;

  core = core.slice(0, insertAt) + `

    // ${marker}
    if (action === "worker-runtime-status-refresh") {
      aicmRuntimeStatusRefresh();
      return;
    }` + core.slice(insertAt);
}

fs.writeFileSync(serverFile, server, 'utf8');
fs.writeFileSync(coreFile, core, 'utf8');

console.log('serverChanged=' + String(server !== beforeServer));
console.log('coreChanged=' + String(core !== beforeCore));
console.log('serverMarkerCount=' + String(countText(server, marker)));
console.log('coreMarkerCount=' + String(countText(core, marker)));
console.log('pipelineRouteCount=' + String(countText(server, '/api/aicm/v2/worker-runtime/pipeline-board')));
console.log('appReadRouteCount=' + String(countText(server, '/api/aicm/v2/worker-runtime/app-read-payload')));
console.log('aiworkerPipelineOutboundCount=' + String(countText(server, '/aiworker/v1/runtime-execution/pipeline-board')));
console.log('aiworkerAppReadOutboundCount=' + String(countText(server, '/aiworker/v1/runtime-execution/app-read-payload')));
console.log('statusPanelCount=' + String(countText(core, 'function aicmRuntimeStatusPanelRender')));
console.log('statusRefreshActionCount=' + String(countText(core, 'worker-runtime-status-refresh')));
console.log('renderWrapperCount=' + String(countText(core, 'renderWorkerRuntimeRequestBaseAxtR9R1')));
console.log('executeWrapperCount=' + String(countText(core, 'executeWorkerRuntimeConfirmBaseAxtR9R1')));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(server, 'async async function')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
