const fs = require('fs');

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE';
const log = [];

let src = fs.readFileSync(corePath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

const renderNeedle = 'window.aicmR8zV7RenderReviewList = function aicmR8zV7RenderReviewList(appState) {';
if (!src.includes(renderNeedle)) {
  log.push('ERROR: V7 render needle not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

const hydrateCallNeedle = 'if (!list.length) hydrateIfNeeded(appState);';
if (!src.includes(hydrateCallNeedle)) {
  log.push('ERROR: V7 hydrate call needle not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

const helper = `

  // ${marker}: helper begin
  function aicmR8zV9ReviewRowsFromPayload(payload) {
    payload = payload && typeof payload === "object" ? payload : {};
    if (Array.isArray(payload.review_wait_items)) return payload.review_wait_items;
    if (payload.context && Array.isArray(payload.context.review_wait_items)) return payload.context.review_wait_items;
    if (payload.data && Array.isArray(payload.data.review_wait_items)) return payload.data.review_wait_items;
    if (Array.isArray(payload.human_review_wait_items)) return payload.human_review_wait_items;
    if (Array.isArray(payload.reviewWaitItems)) return payload.reviewWaitItems;
    if (Array.isArray(payload.humanReviewWaitItems)) return payload.humanReviewWaitItems;
    return [];
  }

  function aicmR8zV9MergeReviewPayload(appState, payload) {
    appState = appState || {};
    payload = payload && typeof payload === "object" ? payload : {};

    var rows = aicmR8zV9ReviewRowsFromPayload(payload);

    if (typeof aicmR8zV8gMergeReviewWaitItemsFromPayload === "function") {
      try {
        var mergedByV8g = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);
        if (Array.isArray(mergedByV8g)) rows = mergedByV8g;
      } catch (_) {}
    }

    if (!appState.context || typeof appState.context !== "object") appState.context = {};
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
      if (!state.context || typeof state.context !== "object") state.context = {};
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

    appState.aicmR8zV7Hydrating = false;
    appState.aicmR8zV7HydrationError = "";
    appState.aicmR8zV9Hydrating = false;
    appState.aicmR8zV9Hydrated = true;
    appState.aicmR8zV9Rows = rows.length;

    appState.aicmR8zV8kDebug = "v9-script-merged";
    appState.aicmR8zV8kPayloadCount = rows.length;
    appState.aicmR8zV8kMergedCount = rows.length;
    appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
    appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
    appState.aicmR8zV8kMergedAt = new Date().toISOString();

    if (typeof state !== "undefined" && state && state !== appState) {
      state.aicmR8zV7Hydrating = false;
      state.aicmR8zV7HydrationError = "";
      state.aicmR8zV9Hydrating = false;
      state.aicmR8zV9Hydrated = true;
      state.aicmR8zV9Rows = rows.length;
      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
      state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
      state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
      state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
      state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
      state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
    }

    return rows;
  }

  function aicmR8zV9RerenderReviewList() {
    try {
      if (typeof render === "function") {
        render();
        return;
      }
    } catch (_) {}

    try {
      if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
        window.aicmRender();
      }
    } catch (_) {}
  }

  function aicmR8zV9ReviewListScriptHydrate(appState) {
    appState = appState || {};

    var existingRows = [];
    try {
      existingRows = typeof rows === "function" ? rows(appState) : [];
    } catch (_) {
      existingRows = [];
    }

    if (Array.isArray(existingRows) && existingRows.length > 0) return;
    if (appState.aicmR8zV9Hydrating) return;

    var owner = "";
    var company = "";

    try {
      owner = typeof ownerId === "function" ? ownerId(appState) : "";
    } catch (_) {}

    try {
      company = typeof companyId === "function" ? companyId(appState) : "";
    } catch (_) {}

    if (!owner) {
      owner = (appState.owner_civilization_id || appState.ownerCivilizationId || (appState.context && (appState.context.owner_civilization_id || appState.context.ownerCivilizationId)) || "00000000-0000-4000-8000-000000000001");
    }

    if (!company) {
      company = (appState.selectedCompanyId || appState.aicm_user_company_id || appState.companyId || (appState.context && (appState.context.aicm_user_company_id || appState.context.selectedCompanyId || appState.context.company_id)) || "");
    }

    if (typeof document === "undefined" || !document.body) {
      appState.aicmR8zV8kDebug = "v9-document-unavailable";
      appState.aicmR8zV8kError = "document/body unavailable";
      return;
    }

    appState.aicmR8zV9Hydrating = true;
    appState.aicmR8zV7Hydrating = true;
    appState.aicmR8zV8kDebug = "v9-script-start";
    appState.aicmR8zV8kPayloadCount = -1;
    appState.aicmR8zV8kMergedCount = -1;
    appState.aicmR8zV8kError = "";
    appState.aicmR8zV9StartedAt = new Date().toISOString();

    if (typeof state !== "undefined" && state && state !== appState) {
      state.aicmR8zV9Hydrating = true;
      state.aicmR8zV7Hydrating = true;
      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
      state.aicmR8zV8kPayloadCount = -1;
      state.aicmR8zV8kMergedCount = -1;
      state.aicmR8zV8kError = "";
      state.aicmR8zV9StartedAt = appState.aicmR8zV9StartedAt;
    }

    try {
      var oldScript = document.getElementById("aicm-r8z-v9-context-script");
      if (oldScript && oldScript.parentNode) oldScript.parentNode.removeChild(oldScript);
    } catch (_) {}

    window.__aicmR8zV9ReviewContextCallback = function aicmR8zV9ReviewContextCallback(payload) {
      try {
        aicmR8zV9MergeReviewPayload(appState, payload);
      } catch (error) {
        appState.aicmR8zV8kDebug = "v9-merge-error";
        appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
        appState.aicmR8zV9Hydrating = false;
        appState.aicmR8zV7Hydrating = false;
      }

      try {
        setTimeout(aicmR8zV9RerenderReviewList, 0);
      } catch (_) {
        aicmR8zV9RerenderReviewList();
      }
    };

    var params = new URLSearchParams();
    params.set("owner_civilization_id", owner);
    if (company) params.set("aicm_user_company_id", company);
    params.set("callback", "__aicmR8zV9ReviewContextCallback");
    params.set("v", "r8z_v9_" + Date.now());

    var script = document.createElement("script");
    script.id = "aicm-r8z-v9-context-script";
    script.async = true;
    script.src = "/api/aicm/v2/context-script?" + params.toString();

    script.onerror = function aicmR8zV9ScriptError() {
      appState.aicmR8zV8kDebug = "v9-script-error";
      appState.aicmR8zV8kError = "context-script load failed";
      appState.aicmR8zV9Hydrating = false;
      appState.aicmR8zV7Hydrating = false;

      if (typeof state !== "undefined" && state && state !== appState) {
        state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
        state.aicmR8zV8kError = appState.aicmR8zV8kError;
        state.aicmR8zV9Hydrating = false;
        state.aicmR8zV7Hydrating = false;
      }

      aicmR8zV9RerenderReviewList();
    };

    document.body.appendChild(script);
  }
  // ${marker}: helper end
`;

src = src.replace(renderNeedle, helper + '\n' + renderNeedle);

const hydrateCallPatch = `if (!list.length && typeof aicmR8zV9ReviewListScriptHydrate === "function") aicmR8zV9ReviewListScriptHydrate(appState);
    ${hydrateCallNeedle}`;

src = src.replace(hydrateCallNeedle, hydrateCallPatch);

fs.writeFileSync(corePath, src, 'utf8');

log.push('PATCH_APPLIED: V9 review-list script hydrate helper inserted');
log.push('PATCH_APPLIED: V9 hydrate call inserted before legacy V7 hydrate');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
