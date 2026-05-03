const fs = require('fs');

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V8K_VISIBLE_RUNTIME_DEBUG';
const log = [];

let src = fs.readFileSync(corePath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

if (!src.includes('AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE')) {
  log.push('ERROR: V8G marker missing');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

if (!src.includes('AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER')) {
  log.push('ERROR: V8H marker missing');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

function replaceOnce(haystack, needle, replacement, label) {
  const idx = haystack.indexOf(needle);
  if (idx < 0) {
    log.push('ERROR: needle not found: ' + label);
    fs.writeFileSync(patchLog, log.join('\n') + '\n');
    process.exit(10);
  }
  return haystack.slice(0, idx) + replacement + haystack.slice(idx + needle.length);
}

const trueNeedle = 'appState.aicmR8zV7Hydrating = true;';
const truePatch = `${trueNeedle}
    // ${marker}: runtime debug start
    appState.aicmR8zV8kDebug = "fetch-start";
    appState.aicmR8zV8kFetchStartedAt = new Date().toISOString();
    appState.aicmR8zV8kOwner = owner;
    appState.aicmR8zV8kCompany = company;
    appState.aicmR8zV8kPayloadCount = -1;
    appState.aicmR8zV8kMergedCount = -1;
    appState.aicmR8zV8kError = "";
    if (typeof state !== "undefined" && state && state !== appState) {
      state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
      state.aicmR8zV8kFetchStartedAt = appState.aicmR8zV8kFetchStartedAt;
      state.aicmR8zV8kOwner = owner;
      state.aicmR8zV8kCompany = company;
      state.aicmR8zV8kPayloadCount = -1;
      state.aicmR8zV8kMergedCount = -1;
      state.aicmR8zV8kError = "";
    }
    // ${marker}: runtime debug end`;

src = replaceOnce(src, trueNeedle, truePatch, 'hydrating true debug insert');

const mergeNeedle = 'aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);';
const mergePatch = `var aicmR8zV8kMergedRows = ${mergeNeedle}
          // ${marker}: payload/merge debug
          try {
            var aicmR8zV8kPayloadRows = [];
            if (payload && Array.isArray(payload.review_wait_items)) aicmR8zV8kPayloadRows = payload.review_wait_items;
            else if (payload && payload.context && Array.isArray(payload.context.review_wait_items)) aicmR8zV8kPayloadRows = payload.context.review_wait_items;
            else if (payload && payload.data && Array.isArray(payload.data.review_wait_items)) aicmR8zV8kPayloadRows = payload.data.review_wait_items;

            appState.aicmR8zV8kDebug = "payload-merged";
            appState.aicmR8zV8kPayloadCount = aicmR8zV8kPayloadRows.length;
            appState.aicmR8zV8kMergedCount = Array.isArray(aicmR8zV8kMergedRows) ? aicmR8zV8kMergedRows.length : -2;
            appState.aicmR8zV8kAfterMergeStateRows = Array.isArray(appState.review_wait_items) ? appState.review_wait_items.length : -3;
            appState.aicmR8zV8kAfterMergeContextRows = appState.context && Array.isArray(appState.context.review_wait_items) ? appState.context.review_wait_items.length : -4;
            appState.aicmR8zV8kMergedAt = new Date().toISOString();

            if (typeof state !== "undefined" && state && state !== appState) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kPayloadCount = appState.aicmR8zV8kPayloadCount;
              state.aicmR8zV8kMergedCount = appState.aicmR8zV8kMergedCount;
              state.aicmR8zV8kAfterMergeStateRows = appState.aicmR8zV8kAfterMergeStateRows;
              state.aicmR8zV8kAfterMergeContextRows = appState.aicmR8zV8kAfterMergeContextRows;
              state.aicmR8zV8kMergedAt = appState.aicmR8zV8kMergedAt;
            }
          } catch (_r8zV8kMergeDebugError) {}`;

src = replaceOnce(src, mergeNeedle, mergePatch, 'merge debug insert');

const catchNeedle = 'appState.aicmR8zV7HydrationError = "fetch failed";';
const catchPatch = `${catchNeedle}
          // ${marker}: fetch error debug
          appState.aicmR8zV8kDebug = "fetch-error";
          appState.aicmR8zV8kError = String(error && error.message ? error.message : error);
          if (typeof state !== "undefined" && state && state !== appState) {
            state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
            state.aicmR8zV8kError = appState.aicmR8zV8kError;
          }`;

if (src.includes(catchNeedle)) {
  src = replaceOnce(src, catchNeedle, catchPatch, 'catch debug insert');
} else {
  log.push('WARN: catch hydration error needle not found; skip catch debug');
}

const debugNeedle = [
  '      "selectedCompanyId=" + companyId(appState),',
  '      "owner=" + ownerId(appState),',
  '      "rows=" + String(list.length),',
  '      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",',
  '      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : ""',
  '    ].filter(Boolean).join(" / ");'
].join('\n');

const debugPatch = [
  '      "selectedCompanyId=" + companyId(appState),',
  '      "owner=" + ownerId(appState),',
  '      "rows=" + String(list.length),',
  '      appState.aicmR8zV7Hydrating ? "hydrating=YES" : "hydrating=NO",',
  '      appState.aicmR8zV7HydrationError ? "error=" + t(appState.aicmR8zV7HydrationError) : "",',
  '      // ' + marker + ': visible debug fields',
  '      "v8k=" + t(appState.aicmR8zV8kDebug || (typeof state !== "undefined" && state ? state.aicmR8zV8kDebug : "") || "none"),',
  '      "payload=" + String(appState.aicmR8zV8kPayloadCount !== undefined ? appState.aicmR8zV8kPayloadCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kPayloadCount !== undefined) ? state.aicmR8zV8kPayloadCount : "na")),',
  '      "merged=" + String(appState.aicmR8zV8kMergedCount !== undefined ? appState.aicmR8zV8kMergedCount : ((typeof state !== "undefined" && state && state.aicmR8zV8kMergedCount !== undefined) ? state.aicmR8zV8kMergedCount : "na")),',
  '      "stRows=" + String(appState.aicmR8zV8kAfterMergeStateRows !== undefined ? appState.aicmR8zV8kAfterMergeStateRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeStateRows !== undefined) ? state.aicmR8zV8kAfterMergeStateRows : "na")),',
  '      "ctxRows=" + String(appState.aicmR8zV8kAfterMergeContextRows !== undefined ? appState.aicmR8zV8kAfterMergeContextRows : ((typeof state !== "undefined" && state && state.aicmR8zV8kAfterMergeContextRows !== undefined) ? state.aicmR8zV8kAfterMergeContextRows : "na")),',
  '      appState.aicmR8zV8kError ? "v8kError=" + t(appState.aicmR8zV8kError) : ""',
  '    ].filter(Boolean).join(" / ");'
].join('\n');

src = replaceOnce(src, debugNeedle, debugPatch, 'visible debug line patch');

fs.writeFileSync(corePath, src, 'utf8');

log.push('PATCH_APPLIED: visible V8K runtime debug inserted');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
