import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const beforeCore = core;

const marker = 'AICM_AXU_R1C_TASK_LEDGER_NAV_FIX_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

/*
 * 1. Fallback:
 * If clicked element has data-screen but no data-core-action,
 * treat it as a normal go navigation.
 */
if (!core.includes('AICM_AXU_R1C_SCREEN_ONLY_NAV_FALLBACK')) {
  const needle = 'if (!button) return;';
  const replacement = `if (!button) {
      // AICM_AXU_R1C_SCREEN_ONLY_NAV_FALLBACK
      var aicmScreenOnlyTarget = aicmActionTarget && aicmActionTarget.closest
        ? aicmActionTarget.closest("[data-screen]")
        : null;

      if (aicmScreenOnlyTarget && aicmScreenOnlyTarget.getAttribute) {
        var aicmScreenOnlyName = String(aicmScreenOnlyTarget.getAttribute("data-screen") || "").trim();

        if (aicmScreenOnlyName) {
          state.screen = aicmScreenOnlyName;
          if (typeof aicmClearTransientMessage === "function") aicmClearTransientMessage();
          if (typeof render === "function") render();
          return;
        }
      }

      return;
    }`;

  if (!core.includes(needle)) {
    console.error('button missing guard anchor not found');
    process.exit(1);
  }

  core = core.replace(needle, replacement);
}

/*
 * 2. Make existing go branch more robust:
 * Prefer button data-screen, then clicked target data-screen.
 */
if (!core.includes('AICM_AXU_R1C_ROBUST_GO_SCREEN')) {
  const oldLine = 'go(button.getAttribute("data-screen") || "dashboard");';
  const newBlock = `// AICM_AXU_R1C_ROBUST_GO_SCREEN
      var aicmGoScreen = button.getAttribute("data-screen") ||
        (aicmActionTarget && aicmActionTarget.getAttribute ? aicmActionTarget.getAttribute("data-screen") : "") ||
        "dashboard";
      go(aicmGoScreen);`;

  if (core.includes(oldLine)) {
    core = core.replace(oldLine, newBlock);
  }
}

/*
 * 3. If task-ledger buttons exist without data-core-action, enrich the obvious HTML.
 * This is conservative and only touches exact data-screen="task-ledger" button strings.
 */
core = core.split('data-screen="task-ledger"').join('data-core-action="go" data-screen="task-ledger"');
core = core.split("data-screen='task-ledger'").join("data-core-action='go' data-screen='task-ledger'");

/*
 * 4. Avoid duplicate data-core-action if replacement hit a button that already had go.
 */
core = core.split('data-core-action="go" data-core-action="go"').join('data-core-action="go"');
core = core.split("data-core-action='go' data-core-action='go'").join("data-core-action='go'");

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== beforeCore));
console.log('markerCount=' + String(
  countText(core, 'AICM_AXU_R1C_SCREEN_ONLY_NAV_FALLBACK') +
  countText(core, 'AICM_AXU_R1C_ROBUST_GO_SCREEN')
));
console.log('screenOnlyFallbackCount=' + String(countText(core, 'AICM_AXU_R1C_SCREEN_ONLY_NAV_FALLBACK')));
console.log('robustGoCount=' + String(countText(core, 'AICM_AXU_R1C_ROBUST_GO_SCREEN')));
console.log('taskLedgerScreenCount=' + String(countText(core, 'task-ledger')));
console.log('taskLedgerGoCount=' + String(countText(core, 'data-core-action="go" data-screen="task-ledger"') + countText(core, "data-core-action='go' data-screen='task-ledger'")));
console.log('handleRootClickCount=' + String(countText(core, 'function handleRootClick')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
