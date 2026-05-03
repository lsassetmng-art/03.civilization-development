const fs = require('fs');

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V8H_V7_MERGE_FINALIZER_RERENDER';
const log = [];

let src = fs.readFileSync(corePath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

if (!src.includes('AICM_R8Z_V8G_V7_REVIEW_WAIT_ITEMS_MERGE')) {
  log.push('ERROR: V8G marker not found. Apply V8G first.');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

const target = 'aicmR8zV8gMergeReviewWaitItemsFromPayload(appState, payload);';
const idx = src.indexOf(target);

if (idx < 0) {
  log.push('ERROR: V8G merge call not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

const insertPos = idx + target.length;

const patch = `

          // ${marker}: force finalizer and one-shot rerender after review_wait_items merge
          try {
            if (appState && typeof appState === "object") {
              appState.aicmR8zV7Hydrating = false;
              appState.aicmR8zV7HydrationError = "";
            }

            if (typeof state !== "undefined" && state && typeof state === "object") {
              state.aicmR8zV7Hydrating = false;
              state.aicmR8zV7HydrationError = "";

              if (appState && appState.review_wait_items && Array.isArray(appState.review_wait_items)) {
                state.review_wait_items = appState.review_wait_items;
              }

              if (appState && appState.context && typeof appState.context === "object") {
                if (!state.context || typeof state.context !== "object") state.context = {};
                state.context.review_wait_items = appState.context.review_wait_items || appState.review_wait_items || [];
              }
            }
          } catch (_r8zV8hFinalizeError) {}

          try {
            setTimeout(function aicmR8zV8hReviewListRerender() {
              try {
                if (typeof render === "function") {
                  render();
                  return;
                }
              } catch (_r8zV8hRenderError) {}

              try {
                if (typeof window !== "undefined" && typeof window.aicmRender === "function") {
                  window.aicmRender();
                  return;
                }
              } catch (_r8zV8hWindowRenderError) {}
            }, 0);
          } catch (_r8zV8hScheduleError) {}
`;

src = src.slice(0, insertPos) + patch + src.slice(insertPos);

fs.writeFileSync(corePath, src, 'utf8');

log.push('PATCH_APPLIED: V8H finalizer/rerender inserted after V8G merge call');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
