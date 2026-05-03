import fs from 'node:fs';

const coreFile = process.env.CLEAN_CORE;
let core = fs.readFileSync(coreFile, 'utf8');
const before = core;

const marker = 'AICM_AXU_MAINT_R1_TASK_LEDGER_ROUTE_V1';

function countText(src, needle) {
  return String(src || '').split(needle).length - 1;
}

function findFunctionStart(src, name) {
  const targets = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];

  let best = -1;

  for (const t of targets) {
    const i = src.indexOf(t);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }

  return best;
}

function findFunctionRange(src, name) {
  const start = findFunctionStart(src, name);
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

    if (depth === 0) {
      return {
        start,
        end: i + 1,
        text: src.slice(start, i + 1)
      };
    }
  }

  return null;
}

function replaceFunction(name, newText) {
  const range = findFunctionRange(core, name);
  if (!range) {
    console.error('function not found: ' + name);
    process.exit(1);
  }

  core = core.slice(0, range.start) + newText + core.slice(range.end);
}

/*
 * 1. Ensure render() routes task-ledger to renderTaskLedgerPlaceholder().
 * This is the canonical fix: button -> go("task-ledger") -> render task ledger screen.
 */
{
  const range = findFunctionRange(core, 'render');

  if (!range) {
    console.error('render function range not found');
    process.exit(1);
  }

  let fn = range.text;

  if (!fn.includes('state.screen === "task-ledger"') && !fn.includes("state.screen === 'task-ledger'")) {
    const branch = [
      '    } else if (state.screen === "task-ledger") {',
      '      // ' + marker,
      '      html = renderTaskLedgerPlaceholder();',
      ''
    ].join('\n');

    const anchors = [
      '    } else if (state.screen === "review-list") {',
      '  } else if (state.screen === "review-list") {',
      '    } else if (state.screen === "worker-runtime-request") {',
      '  } else if (state.screen === "worker-runtime-request") {',
      '    } else {',
      '  } else {'
    ];

    let patched = false;

    for (const anchor of anchors) {
      if (fn.includes(anchor)) {
        fn = fn.replace(anchor, branch + anchor);
        patched = true;
        break;
      }
    }

    if (!patched) {
      console.error('render default/next branch anchor not found');
      process.exit(1);
    }

    replaceFunction('render', fn);
  }
}

/*
 * 2. Keep go navigation simple and canonical.
 * Remove AXU-R1C robust-go block if present.
 */
{
  const markerText = '// AICM_AXU_R1C_ROBUST_GO_SCREEN';
  const markerIndex = core.indexOf(markerText);

  if (markerIndex >= 0) {
    const endNeedle = 'go(aicmGoScreen);';
    const endIndex = core.indexOf(endNeedle, markerIndex);

    if (endIndex >= 0) {
      core = core.slice(0, markerIndex) +
        'go(button.getAttribute("data-screen") || "dashboard");' +
        core.slice(endIndex + endNeedle.length);
    }
  }

  core = core.split('nextScreenForMessageClear = target && target.getAttribute ? String(target.getAttribute("data-screen") || "") : "";')
    .join('nextScreenForMessageClear = button && button.getAttribute ? String(button.getAttribute("data-screen") || "") : "";');
}

/*
 * 3. Do not add broad/text navigation.
 * If R1D markers exist, fail by report count rather than silently preserving.
 */

fs.writeFileSync(coreFile, core, 'utf8');

console.log('coreChanged=' + String(core !== before));
console.log('markerCount=' + String(countText(core, marker)));
console.log('taskLedgerRenderBranchCount=' + String(countText(core, 'state.screen === "task-ledger"') + countText(core, "state.screen === 'task-ledger'")));
console.log('taskLedgerRenderCallCount=' + String(countText(core, 'renderTaskLedgerPlaceholder()')));
console.log('canonicalNavButtonCount=' + String(countText(core, 'data-core-action="go" data-screen="task-ledger"')));
console.log('robustGoMarkerCount=' + String(countText(core, 'AICM_AXU_R1C_ROBUST_GO_SCREEN')));
console.log('broadClickMarkerCount=' + String(countText(core, 'AICM_AXU_R1D_BROAD_CLICK_TARGET')));
console.log('textNavMarkerCount=' + String(countText(core, 'AICM_AXU_R1D_TASK_LEDGER_TEXT_NAV')));
console.log('standalonePanelCount=' + String(countText(core, 'aicmAxuR1BLeaderHandoffStandalonePanel')));
console.log('badLiteralNewlineCount=' + String(
  countText(core, ",\\n      '") +
  countText(core, ",\\n        '") +
  countText(core, ",\\n          '") +
  countText(core, ",\\n            '")
));
console.log('tokenLeakCountCore=' + String(countText(core, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountCore=' + String(countText(core, 'async async function')));
