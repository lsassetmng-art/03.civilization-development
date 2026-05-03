const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9E_REVIEW_LIST_LOCAL_RENDER_ONLY";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE")) {
  log.push("ERROR: V9 helper marker not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

const fnName = "function aicmR8zV9RerenderReviewList()";
const start = src.indexOf(fnName);

if (start < 0) {
  log.push("ERROR: aicmR8zV9RerenderReviewList not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(3);
}

const braceStart = src.indexOf("{", start);
if (braceStart < 0) {
  log.push("ERROR: function opening brace not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(4);
}

let depth = 0;
let end = -1;
for (let i = braceStart; i < src.length; i += 1) {
  const ch = src[i];
  if (ch === "{") depth += 1;
  if (ch === "}") {
    depth -= 1;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}

if (end < 0) {
  log.push("ERROR: function closing brace not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(5);
}

const replacement = `function aicmR8zV9RerenderReviewList() {
    // ${marker}
    // Keep review-list hydration local. Do not call global render(), because it can re-enter
    // task-ledger/dashboard render paths and surface unrelated screen regressions.
    try {
      var appState = (typeof state !== "undefined" && state) ? state : {};
      var screen = String(appState.screen || "");

      if (screen && screen !== "review-list") {
        appState.aicmR8zV8kDebug = "v9-local-skip-non-review";
        appState.aicmR8zV8kError = "screen=" + screen;
        return;
      }

      if (typeof root === "undefined" || !root) {
        appState.aicmR8zV8kDebug = "v9-local-root-missing";
        appState.aicmR8zV8kError = "root is unavailable";
        return;
      }

      if (typeof window === "undefined" || typeof window.aicmR8zV7RenderReviewList !== "function") {
        appState.aicmR8zV8kDebug = "v9-local-renderer-missing";
        appState.aicmR8zV8kError = "aicmR8zV7RenderReviewList is unavailable";
        return;
      }

      appState.screen = "review-list";
      appState.aicmR8zV8kDebug = "v9-local-render-start";

      root.innerHTML = window.aicmR8zV7RenderReviewList(appState);

      appState.aicmR8zV8kDebug = "v9-local-render-done";
      appState.aicmR8zV8kError = "";
    } catch (error) {
      try {
        if (typeof state !== "undefined" && state) {
          state.aicmR8zV8kDebug = "v9-local-render-error";
          state.aicmR8zV8kError = String(error && error.message ? error.message : error);
        }
      } catch (_) {}
    }
  }`;

src = src.slice(0, start) + replacement + src.slice(end);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: aicmR8zV9RerenderReviewList replaced with local review-list renderer only");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
