const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];

const marker = "AICM_R8Z_V9C_WINDOW_CALLBACK_SCRIPT_HYDRATE";
const log = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(0);
}

if (!src.includes("AICM_R8Z_V9_REVIEW_LIST_SCRIPT_CONTEXT_HYDRATE")) {
  log.push("ERROR: V9 helper marker not found. Apply V9 first.");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  process.exit(2);
}

function replaceOnce(needle, replacement, label) {
  const idx = src.indexOf(needle);
  if (idx < 0) {
    log.push("ERROR: needle not found: " + label);
    fs.writeFileSync(patchLog, log.join("\n") + "\n");
    process.exit(10);
  }
  src = src.slice(0, idx) + replacement + src.slice(idx + needle.length);
}

replaceOnce(
  'params.set("callback", "__aicmR8zV9ReviewContextCallback");',
  'params.set("callback", "window.__aicmR8zV9ReviewContextCallback"); // ' + marker,
  "callback param window prefix"
);

replaceOnce(
  'var params = new URLSearchParams();',
  `// ${marker}: expose callback on globalThis as well as window
    try {
      if (typeof globalThis !== "undefined" && typeof window !== "undefined" && window.__aicmR8zV9ReviewContextCallback) {
        globalThis.__aicmR8zV9ReviewContextCallback = window.__aicmR8zV9ReviewContextCallback;
      }
    } catch (_r8zV9cGlobalBindError) {}

    var params = new URLSearchParams();`,
  "globalThis callback bind"
);

replaceOnce(
  'document.body.appendChild(script);',
  `// ${marker}: loaded-without-callback diagnostics
    script.onload = function aicmR8zV9cScriptLoaded() {
      try {
        setTimeout(function aicmR8zV9cCheckCallbackCompletion() {
          try {
            var merged = Number(appState && appState.aicmR8zV8kMergedCount);
            if (Number.isFinite(merged) && merged >= 0) return;
            if (appState && appState.aicmR8zV9Hydrated) return;

            appState.aicmR8zV8kDebug = "v9-script-loaded-no-callback";
            appState.aicmR8zV8kError = String(
              (typeof window !== "undefined" && window.__aicmR8zV9ReviewContextError)
                ? window.__aicmR8zV9ReviewContextError
                : "script loaded but callback did not merge"
            );
            appState.aicmR8zV9Hydrating = false;
            appState.aicmR8zV7Hydrating = false;

            if (typeof state !== "undefined" && state && state !== appState) {
              state.aicmR8zV8kDebug = appState.aicmR8zV8kDebug;
              state.aicmR8zV8kError = appState.aicmR8zV8kError;
              state.aicmR8zV9Hydrating = false;
              state.aicmR8zV7Hydrating = false;
            }

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
          } catch (_) {}
        }, 600);
      } catch (_) {}
    };

    document.body.appendChild(script);`,
  "script onload diagnostics"
);

fs.writeFileSync(corePath, src, "utf8");
log.push("PATCH_APPLIED: V9C window callback + onload diagnostics inserted");
fs.writeFileSync(patchLog, log.join("\n") + "\n");
