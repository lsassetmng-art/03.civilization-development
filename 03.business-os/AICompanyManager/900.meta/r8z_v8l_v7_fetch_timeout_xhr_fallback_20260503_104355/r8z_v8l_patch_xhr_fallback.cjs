const fs = require('fs');

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V8L_V7_FETCH_TIMEOUT_XHR_FALLBACK';
const log = [];

let src = fs.readFileSync(corePath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

for (const required of [
  'AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE',
  'AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER',
  'AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG',
  'aicmR8zV8gMergeReviewWaitItemsFromPayload'
]) {
  if (!src.includes(required)) {
    log.push('ERROR: required marker/helper missing: ' + required);
    fs.writeFileSync(patchLog, log.join('\n') + '\n');
    process.exit(2);
  }
}

const needle = 'params.set("v", "r8z_v7_" + Date.now());';
const idx = src.indexOf(needle);

if (idx < 0) {
  log.push('ERROR: V7 params v needle not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

const insertPos = idx + needle.length;

const patch = `

    // ${marker}: timeout + XMLHttpRequest fallback begin
    try {
      setTimeout(function aicmR8zV8lFetchTimeoutXhrFallback() {
        try {
          var alreadyMerged = Number(appState && appState.aicmR8zV8kMergedCount);
          if (Number.isFinite(alreadyMerged) && alreadyMerged >= 0) return;

          if (!appState || typeof appState !== "object") return;

          appState.aicmR8zV8kDebug = "fetch-timeout-xhr-start";
          appState.aicmR8zV8kError = "";
          appState.aicmR8zV8lFallbackStartedAt = new Date().toISOString();

          if (typeof state !== "undefined" && state && state !== appState) {
            state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
            state.aicmR8zV8kError = "";
            state.aicmR8zV8lFallbackStartedAt = appState.aicmR8zV8lFallbackStartedAt;
          }

          if (typeof XMLHttpRequest === "undefined") {
            appState.aicmR8zV8kDebug = "xhr-unavailable";
            appState.aicmR8zV8kError = "XMLHttpRequest is undefined";
            appState.aicmR8zV7Hydrating = false;
            if (typeof state !== "undefined" && state) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kError = appState.aicmR8zV8kError;
              state.aicmR8zV7Hydrating = false;
            }
            try { if (typeof render === "function") render(); } catch (_) {}
            return;
          }

          var xhr = new XMLHttpRequest();
          var xhrUrl = "/api/aicm/v2/context?" + params.toString();

          xhr.open("GET", xhrUrl, true);
          xhr.setRequestHeader("cache-control", "no-store");

          xhr.onreadystatechange = function aicmR8zV8lXhrReadyStateChange() {
            if (xhr.readyState !== 4) return;

            try {
              if (xhr.status < 200 || xhr.status >= 300) {
                appState.aicmR8zV8kDebug = "xhr-error";
                appState.aicmR8zV8kError = "status=" + String(xhr.status);
                appState.aicmR8zV7Hydrating = false;

                if (typeof state !== "undefined" && state && state !== appState) {
                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
                  state.aicmR8zV7Hydrating = false;
                }

                try { if (typeof render === "function") render(); } catch (_) {}
                return;
              }

              var payload = {};
              try {
                payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
              } catch (parseError) {
                appState.aicmR8zV8kDebug = "xhr-parse-error";
                appState.aicmR8zV8kError = String(parseError && parseError.message ? parseError.message : parseError);
                appState.aicmR8zV7Hydrating = false;

                if (typeof state !== "undefined" && state && state !== appState) {
                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
                  state.aicmR8zV7Hydrating = false;
                }

                try { if (typeof render === "function") render(); } catch (_) {}
                return;
              }

              var payloadRows = [];
              if (Array.isArray(payload.review_wait_items)) payloadRows = payload.review_wait_items;
              else if (payload.context && Array.isArray(payload.context.review_wait_items)) payloadRows = payload.context.review_wait_items;
              else if (payload.data && Array.isArray(payload.data.review_wait_items)) payloadRows = payload.data.review_wait_items;

              var mergedRows = aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);

              appState.aicmR8zV8kDebug = "xhr-merged";
              appState.aicmR8zV8kPayloadCount = payloadRows.length;
              appState.aicmR8zV8kMergedCount = Array.isArray(mergedRows) ? mergedRows.length : -2;
              appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
              appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
              appState.aicmR8zV8kMergedAt = new Date().toISOString();
              appState.aicmR8zV7Hydrating = false;
              appState.aicmR8zV7HydrationError = "";

              if (typeof state !== "undefined" && state && state !== appState) {
                if (!state.context || typeof state.context !== "object") state.context = {};
                state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
                state.review_wait_items = appState.review_wait_items || state.context.review_wait_items || [];
                state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
                state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
                state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
                state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
                state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
                state.aicmR8zV7Hydrating = false;
                state.aicmR8zV7HydrationError = "";
              }

              try {
                setTimeout(function aicmR8zV8lRerenderAfterXhrMerge() {
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
                }, 0);
              } catch (_) {}
            } catch (runtimeError) {
              try {
                appState.aicmR8zV8kDebug = "xhr-runtime-error";
                appState.aicmR8zV8kError = String(runtimeError && runtimeError.message ? runtimeError.message : runtimeError);
                appState.aicmR8zV7Hydrating = false;
                if (typeof state !== "undefined" && state) {
                  state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                  state.aicmR8zV8kError = appState.aicmR8zV8kError;
                  state.aicmR8zV7Hydrating = false;
                }
                if (typeof render === "function") render();
              } catch (_) {}
            }
          };

          xhr.onerror = function aicmR8zV8lXhrError() {
            try {
              appState.aicmR8zV8kDebug = "xhr-network-error";
              appState.aicmR8zV8kError = "XMLHttpRequest onerror";
              appState.aicmR8zV7Hydrating = false;
              if (typeof state !== "undefined" && state) {
                state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
                state.aicmR8zV8kError = appState.aicmR8zV8kError;
                state.aicmR8zV7Hydrating = false;
              }
              if (typeof render === "function") render();
            } catch (_) {}
          };

          xhr.send();
        } catch (error) {
          try {
            appState.aicmR8zV8kDebug = "xhr-fallback-error";
            appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
            appState.aicmR8zV7Hydrating = false;
            if (typeof state !== "undefined" && state) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kError = appState.aicmR8zV8kError;
              state.aicmR8zV7Hydrating = false;
            }
            if (typeof render === "function") render();
          } catch (_) {}
        }
      }, 2500);
    } catch (_r8zV8lScheduleError) {}
    // ${marker}: timeout + XMLHttpRequest fallback end
`;

src = src.slice(0, insertPos) + patch + src.slice(insertPos);
fs.writeFileSync(corePath, src, 'utf8');

log.push('PATCH_APPLIED: V8L timeout XHR fallback inserted after V7 params setup');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
