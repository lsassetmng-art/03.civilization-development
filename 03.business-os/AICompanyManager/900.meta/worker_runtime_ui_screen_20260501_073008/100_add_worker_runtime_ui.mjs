import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
if (!coreFile) {
  console.error('CLEAN_CORE env missing');
  process.exit(1);
}

let src = fs.readFileSync(coreFile, 'utf8');
const before = src;

const marker = 'AICM_WORKER_RUNTIME_UI_AXT_V1';

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

function insertBeforeFunction(functionName, text) {
  const idx = src.indexOf(`function ${functionName}(`);
  if (idx < 0) {
    console.error(`Insertion anchor not found: ${functionName}`);
    process.exit(1);
  }
  src = src.slice(0, idx) + text + "\n" + src.slice(idx);
}

function replaceFirst(needle, replacement) {
  if (!src.includes(needle)) {
    console.error('Needle not found: ' + needle);
    process.exit(1);
  }
  src = src.replace(needle, replacement);
}

// ------------------------------------------------------------
// 1. Add Worker Runtime UI helper block before render().
// ------------------------------------------------------------
if (!src.includes(marker)) {
  insertBeforeFunction('render', `
// ${marker}
// Worker runtime request UI.
// This screen creates no request until the user reaches the confirmation screen and presses 確定して実行.
// Browser never receives AIWorkerOS auth token. It posts only to AICompanyManager local endpoint.
function aicmWrtText(value) {
    return String(value || "").trim();
  }

function aicmWrtEscape(value) {
    return escapeHtml(aicmWrtText(value));
  }

function aicmWrtOwnerId() {
    if (typeof aicmAvdOwnerId === "function") return aicmAvdOwnerId();
    if (state && state.ownerCivilizationId) return state.ownerCivilizationId;
    return "";
  }

function aicmWrtCompanies() {
    return state && state.context && Array.isArray(state.context.companies) ? state.context.companies : [];
  }

function aicmWrtCurrentCompany() {
    if (typeof aicmOrgSelectedCompany === "function") {
      var company = aicmOrgSelectedCompany();
      if (company) return company;
    }

    if (typeof selectedCompany === "function") {
      var selected = selectedCompany();
      if (selected) return selected;
    }

    if (typeof aicmAvdCurrentCompany === "function") {
      var avd = aicmAvdCurrentCompany();
      if (avd) return avd;
    }

    var rows = aicmWrtCompanies();
    if (state && state.selectedCompanyId) {
      for (var i = 0; i < rows.length; i += 1) {
        if (rows[i] && rows[i].aicm_user_company_id === state.selectedCompanyId) return rows[i];
      }
    }

    return rows[0] || null;
  }

function aicmWrtCompanyId() {
    var company = aicmWrtCurrentCompany();
    return company ? aicmWrtText(company.aicm_user_company_id) : "";
  }

function aicmWrtActiveWorkerPlacements() {
    var ctx = state && state.context ? state.context : {};
    var rows = Array.isArray(ctx.placements) ? ctx.placements : [];
    var companyId = aicmWrtCompanyId();

    return rows.filter(function (row) {
      if (!row) return false;
      if (aicmWrtText(row.app_code || "AICompanyManager") !== "AICompanyManager") return false;
      if (aicmWrtText(row.status_code || "active").toLowerCase() !== "active") return false;
      if (aicmWrtText(row.role_code).toLowerCase() !== "worker") return false;
      if (companyId && row.aicm_user_company_id && aicmWrtText(row.aicm_user_company_id) !== companyId) return false;
      return true;
    });
  }

function aicmWrtPlacementById(placementId) {
    var id = aicmWrtText(placementId);
    var rows = aicmWrtActiveWorkerPlacements();

    for (var i = 0; i < rows.length; i += 1) {
      if (aicmWrtText(rows[i].aicm_user_company_worker_placement_id) === id) return rows[i];
    }

    return null;
  }

function aicmWrtWorkerLabel(row) {
    row = row || {};

    var label = aicmWrtText(
      row.display_label ||
      row.internal_nickname ||
      row.placement_nickname ||
      row.aiworker_model_code ||
      row.robot_pool_id
    );

    var dept = aicmWrtText(row.department_name);
    var section = aicmWrtText(row.section_name);
    var model = aicmWrtText(row.aiworker_model_code);

    var parts = [];
    if (label) parts.push(label);
    if (model && label.indexOf(model) < 0) parts.push(model);
    if (dept) parts.push(dept);
    if (section) parts.push(section);

    return parts.length ? parts.join(" / ") : "Worker";
  }

function aicmWrtWorkerOptions() {
    var rows = aicmWrtActiveWorkerPlacements();

    if (!rows.length) {
      return '<option value="">配置済みWorkerがありません</option>';
    }

    return ['<option value="">Workerを選択</option>'].concat(rows.map(function (row) {
      return '<option value="' + aicmWrtEscape(row.aicm_user_company_worker_placement_id) + '">' + aicmWrtEscape(aicmWrtWorkerLabel(row)) + '</option>';
    })).join("");
  }

function aicmWrtDomainOptions() {
    var options = [
      ["business_operation", "業務作業"],
      ["design_document_creation", "設計書作成"],
      ["pg_development", "PG/SQL開発支援"],
      ["ui_implementation", "UI実装"],
      ["review_and_check", "レビュー/確認"],
      ["research_document_creation", "調査資料作成"],
      ["proposal_planning", "企画/提案"]
    ];

    return options.map(function (row) {
      return '<option value="' + aicmWrtEscape(row[0]) + '">' + aicmWrtEscape(row[1]) + '</option>';
    }).join("");
  }

function aicmWrtDefaultSourceRequestRef() {
    return "manual:" + String(Date.now());
  }

function aicmWrtBuildIdempotencyKey(sourceRequestRef, placementId) {
    return "aicm:" + aicmWrtText(sourceRequestRef) + ":" + aicmWrtText(placementId);
  }

function renderWorkerRuntimeRequest() {
    var company = aicmWrtCurrentCompany();
    var workers = aicmWrtActiveWorkerPlacements();
    var last = state.workerRuntimeLastResult || null;

    var lastHtml = "";
    if (last && last.runtime_request) {
      lastHtml = [
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">直近の実行依頼</p>',
        '  <h2>request_id</h2>',
        '  <p class="aicm-selected-note">' + aicmWrtEscape(last.runtime_request.request_id || "未返却") + '</p>',
        '  <p>status: ' + aicmWrtEscape(last.runtime_request.request_status_code || "-") + '</p>',
        '</section>'
      ].join("");
    }

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">Worker実行依頼</p>',
      '  <h2>配置済みWorkerに作業を依頼</h2>',
      company
        ? '  <p class="aicm-selected-note">対象会社: <strong>' + aicmWrtEscape(company.company_name || "") + '</strong></p>'
        : '  <p class="aicm-core-empty">AI企業が選択されていません。</p>',
      workers.length
        ? '  <p class="aicm-selected-note">配置済みWorker: ' + String(workers.length) + '件</p>'
        : '  <p class="aicm-core-empty">この会社に配置済みWorkerがありません。先に課変更で従業員Workerを配置してください。</p>',
      '</section>',
      '<section class="aicm-core-card">',
      '  <label>実行Worker<select id="aicm-worker-runtime-placement-id">' + aicmWrtWorkerOptions() + '</select></label>',
      '  <label>作業種別<select id="aicm-worker-runtime-task-domain">' + aicmWrtDomainOptions() + '</select></label>',
      '  <label>作業タイトル<input id="aicm-worker-runtime-title" type="text" placeholder="例: UI修正案の作成"></label>',
      '  <label>作業指示<textarea id="aicm-worker-runtime-instruction" rows="7" placeholder="何を、どの条件で、どこまで作業するかを書いてください。"></textarea></label>',
      '  <label>source_request_ref<input id="aicm-worker-runtime-source-ref" type="text" placeholder="空なら manual:<timestamp>"></label>',
      '  <p class="aicm-core-empty">AIWorkerOS tokenはブラウザには出しません。確定後、AICompanyManager serverが中継します。</p>',
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="worker-runtime-confirm">確認へ進む</button>',
      '    <button type="button" data-core-action="go" data-screen="dashboard">戻る</button>',
      '  </div>',
      '</section>',
      lastHtml
    ].join(""));
  }

function aicmWrtValue(id) {
    var el = document.getElementById(id);
    return el ? aicmWrtText(el.value) : "";
  }

function buildWorkerRuntimePendingPayload() {
    var company = aicmWrtCurrentCompany();
    if (!company) throw new Error("AI企業を選択してください。");

    var placementId = aicmWrtValue("aicm-worker-runtime-placement-id");
    if (!placementId) throw new Error("実行Workerを選択してください。");

    var worker = aicmWrtPlacementById(placementId);
    if (!worker) throw new Error("選択したWorker配置が見つかりません。");

    var title = aicmWrtValue("aicm-worker-runtime-title");
    if (!title) throw new Error("作業タイトルを入力してください。");

    var instruction = aicmWrtValue("aicm-worker-runtime-instruction");
    if (!instruction) throw new Error("作業指示を入力してください。");

    var sourceRef = aicmWrtValue("aicm-worker-runtime-source-ref") || aicmWrtDefaultSourceRequestRef();
    var idempotencyKey = aicmWrtBuildIdempotencyKey(sourceRef, placementId);

    return {
      endpoint: "/api/aicm/v2/worker-runtime/request",
      worker_label: aicmWrtWorkerLabel(worker),
      body: {
        owner_civilization_id: aicmWrtOwnerId(),
        aicm_user_company_id: aicmWrtText(company.aicm_user_company_id),
        aicm_user_company_department_id: aicmWrtText(worker.aicm_user_company_department_id),
        aicm_user_company_section_id: aicmWrtText(worker.aicm_user_company_section_id),
        aicm_user_company_worker_placement_id: placementId,
        model_code: aicmWrtText(worker.aiworker_model_code),
        robot_pool_id: aicmWrtText(worker.robot_pool_id),
        app_surface_code: "ai_company_manager_worker_execution",
        task_domain_code: aicmWrtValue("aicm-worker-runtime-task-domain") || "business_operation",
        task_title: title,
        task_instruction_ja: instruction,
        source_app_ref: "AICompanyManager",
        source_request_ref: sourceRef,
        requested_by_ref: "human",
        idempotency_key: idempotencyKey
      }
    };
  }

function renderWorkerRuntimeConfirm() {
    var payload = state.pendingWorkerRuntimeRequest || null;
    if (!payload || !payload.body) {
      return renderShell([
        '<section class="aicm-core-card">',
        '  <p class="aicm-eyebrow">Worker実行依頼</p>',
        '  <h2>確認対象がありません</h2>',
        '  <div class="aicm-dashboard-action-row"><button type="button" data-core-action="worker-runtime-cancel">戻る</button></div>',
        '</section>'
      ].join(""));
    }

    var body = payload.body;
    var rows = [
      ["実行Worker", payload.worker_label],
      ["model_code", body.model_code],
      ["app_surface_code", body.app_surface_code],
      ["task_domain_code", body.task_domain_code],
      ["作業タイトル", body.task_title],
      ["作業指示", body.task_instruction_ja],
      ["source_request_ref", body.source_request_ref],
      ["idempotency_key", body.idempotency_key]
    ];

    return renderShell([
      '<section class="aicm-core-card">',
      '  <p class="aicm-eyebrow">確認画面</p>',
      '  <h2>Worker実行依頼を確定しますか？</h2>',
      '  <p class="aicm-selected-note">この操作はAIWorkerOS Runtime Executionへ実行依頼を作成します。</p>',
      '</section>',
      '<section class="aicm-core-card aicm-confirm-card">',
      rows.map(function (row) {
        return '<div class="aicm-confirm-row"><strong>' + aicmWrtEscape(row[0]) + '</strong><p>' + aicmWrtEscape(row[1]) + '</p></div>';
      }).join(""),
      '</section>',
      '<section class="aicm-core-card aicm-operation-card">',
      '  <p class="aicm-eyebrow">操作</p>',
      '  <div class="aicm-dashboard-action-row">',
      '    <button type="button" data-core-action="worker-runtime-execute">確定して実行</button>',
      '    <button type="button" data-core-action="worker-runtime-cancel">戻る</button>',
      '  </div>',
      '</section>'
    ].join(""));
  }

async function aicmWrtPostJson(path, body) {
    var response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body || {})
    });

    var json = await response.json().catch(function () {
      return {};
    });

    if (!response.ok || !json || json.result !== "ok") {
      throw new Error((json && (json.error_message || json.message || json.error)) || "Worker実行依頼に失敗しました。");
    }

    return json;
  }

async function executeWorkerRuntimeConfirm() {
    var payload = state.pendingWorkerRuntimeRequest || null;
    if (!payload || !payload.endpoint || !payload.body) {
      setMessage("error", "確認対象がありません。");
      return;
    }

    try {
      var result = await aicmWrtPostJson(payload.endpoint, payload.body);
      state.pendingWorkerRuntimeRequest = null;
      state.workerRuntimeLastResult = result;
      state.screen = "worker-runtime-request";
      setMessage("ok", "Worker実行依頼を作成しました。");
      if (typeof render === "function") render();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "Worker実行依頼に失敗しました。");
      if (typeof render === "function") render();
    }
  }

function confirmWorkerRuntimeRequestFromForm() {
    try {
      state.pendingWorkerRuntimeRequest = buildWorkerRuntimePendingPayload();
      var rootEl = document.getElementById("aicm-root");
      if (rootEl) rootEl.innerHTML = renderWorkerRuntimeConfirm();
    } catch (error) {
      setMessage("error", error && error.message ? error.message : "確認画面を表示できません。");
      if (typeof render === "function") render();
    }
  }

function cancelWorkerRuntimeConfirm() {
    state.pendingWorkerRuntimeRequest = null;
    state.screen = "worker-runtime-request";
    if (typeof render === "function") render();
  }
`);
}

// ------------------------------------------------------------
// 2. Add render branch.
// ------------------------------------------------------------
if (!src.includes('state.screen === "worker-runtime-request"')) {
  const anchors = [
    '    } else if (state.screen === "settings") {',
    '    } else if (state.screen === "department-edit") {',
    '    } else if (state.screen === "task-ledger") {'
  ];

  let done = false;
  for (const anchor of anchors) {
    if (!done && src.includes(anchor)) {
      src = src.replace(anchor, '    } else if (state.screen === "worker-runtime-request") {\n      html = renderWorkerRuntimeRequest();\n' + anchor);
      done = true;
    }
  }

  if (!done) {
    console.error('render branch anchor not found');
    process.exit(1);
  }
}

// ------------------------------------------------------------
// 3. Add click action branches after action variable.
// ------------------------------------------------------------
if (!src.includes('worker-runtime-confirm')) {
  const actionNeedle = '    var action = button.getAttribute("data-core-action") || "";';
  if (!src.includes(actionNeedle)) {
    console.error('action variable anchor not found');
    process.exit(1);
  }

  src = src.replace(actionNeedle, actionNeedle + `

    // ${marker}
    if (action === "worker-runtime-confirm") {
      confirmWorkerRuntimeRequestFromForm();
      return;
    }

    if (action === "worker-runtime-execute") {
      executeWorkerRuntimeConfirm();
      return;
    }

    if (action === "worker-runtime-cancel") {
      cancelWorkerRuntimeConfirm();
      return;
    }`);
}

// ------------------------------------------------------------
// 4. Add navigation button before first nav close if available.
// ------------------------------------------------------------
if (!src.includes('data-screen="worker-runtime-request"')) {
  const navClose = "      '</nav>',";
  if (src.includes(navClose)) {
    src = src.replace(navClose, "      '  <button type=\"button\" data-core-action=\"go\" data-screen=\"worker-runtime-request\">Worker実行依頼</button>',\n" + navClose);
  } else {
    const placementButtonLine = "      '      <button type=\"button\" data-core-action=\"go\" data-screen=\"placement-new\">Worker配置</button>',";
    if (src.includes(placementButtonLine)) {
      src = src.replace(placementButtonLine, placementButtonLine + "\n      '      <button type=\"button\" data-core-action=\"go\" data-screen=\"worker-runtime-request\">Worker実行依頼</button>',");
    }
  }
}

fs.writeFileSync(coreFile, src, 'utf8');

console.log("coreChanged=" + String(src !== before));
console.log("markerCount=" + String(countText(marker)));
console.log("screenBranchCount=" + String(countText('state.screen === "worker-runtime-request"')));
console.log("renderFunctionCount=" + String(countText('function renderWorkerRuntimeRequest')));
console.log("confirmFunctionCount=" + String(countText('function renderWorkerRuntimeConfirm')));
console.log("executeFunctionCount=" + String(countText('async function executeWorkerRuntimeConfirm')));
console.log("endpointRefCount=" + String(countText('/api/aicm/v2/worker-runtime/request')));
console.log("navButtonCount=" + String(countText('data-screen="worker-runtime-request"')));
console.log("tokenLeakCount=" + String(countText('PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log("asyncAsyncCount=" + String(countText('async async function')));
