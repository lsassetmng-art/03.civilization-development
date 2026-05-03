import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let src = fs.readFileSync(corePath, 'utf8');

const MARK = 'AICM_R8_NAV_TASK_LEDGER_SAFE_RENDER_V4';
const START = '// ' + MARK + '_START';
const END = '// ' + MARK + '_END';

function count(text, needle) {
  return text.split(needle).length - 1;
}

function removeMarkedBlock(text, startMarker, endMarker) {
  const s = text.indexOf(startMarker);
  if (s < 0) return text;

  const e = text.indexOf(endMarker, s);
  if (e < 0) throw new Error('marked block end not found: ' + startMarker);

  return text.slice(0, s) + text.slice(e + endMarker.length);
}

function insertBeforeNeedle(text, needle, block) {
  const idx = text.indexOf(needle);
  if (idx < 0) throw new Error('insert anchor not found: ' + needle);
  return text.slice(0, idx) + block.trimEnd() + '\n\n  ' + text.slice(idx);
}

const before = {
  mark: count(src, MARK),
  v3Helper: count(src, 'function aicmOpenTaskLedgerScreenR8V3Clean'),
  safeHelper: count(src, 'function aicmRenderTaskLedgerSafeR8V4'),
  reload: count(src, 'async function aicmReloadTaskLedgerContext'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  renderMajor: count(src, 'function aicmRenderManagerMajorRows'),
  openHandler: count(src, 'if (action === "task-ledger-open")'),
  refreshHandler: count(src, 'if (action === "task-ledger-refresh")'),
  taskOpenButtons: count(src, 'data-core-action="task-ledger-open"'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

src = removeMarkedBlock(src, START, END);

const helperBlock = `
${START}
  function aicmRenderTaskLedgerSafeR8V4(sourceLabel) {
    state.screen = "task-ledger";

    try {
      if (!root) return;

      var html = renderTaskLedgerPlaceholder();
      root.innerHTML = html;

      return true;
    } catch (error) {
      var message = error && error.message ? error.message : String(error || "unknown error");
      var stack = error && error.stack ? String(error.stack) : "";

      if (typeof console !== "undefined" && console && console.error) {
        console.error("AICM task-ledger render failed", {
          sourceLabel: sourceLabel || "",
          message: message,
          stack: stack
        });
      }

      if (root) {
        root.innerHTML = renderShell([
          '<section class="aicm-core-card" style="border:2px solid #ef4444;">',
          '  <p class="aicm-eyebrow">TASK LEDGER RENDER ERROR</p>',
          '  <h2>部門別タスク台帳の描画でエラーが発生しました</h2>',
          '  <p class="aicm-selected-note">クリック処理と画面遷移は動いています。以下はブラウザ側の描画エラーです。</p>',
          '  <dl class="aicm-core-detail-list">',
          '    <dt>source</dt><dd>' + escapeHtml(sourceLabel || "") + '</dd>',
          '    <dt>message</dt><dd>' + escapeHtml(message) + '</dd>',
          '  </dl>',
          stack ? '<pre style="white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:320px;overflow:auto;background:#0f172a;color:#e5e7eb;padding:12px;border-radius:12px;">' + escapeHtml(stack) + '</pre>' : '',
          '  <div class="aicm-dashboard-action-row">',
          '    <button type="button" data-core-action="task-ledger-refresh">再読み込み</button>',
          '    <button type="button" data-core-action="go" data-screen="dashboard">ダッシュボードへ戻る</button>',
          '  </div>',
          '</section>'
        ].join(""));
      }

      return false;
    }
  }
${END}
`;

src = insertBeforeNeedle(src, 'function aicmOpenTaskLedgerScreenR8V3Clean', helperBlock);

/*
  V3-clean helper currently calls generic render().
  Replace only inside this helper block by routing through the safe task-ledger renderer.
*/
src = src.replace(
  /function aicmOpenTaskLedgerScreenR8V3Clean\(\) \{\n([\s\S]*?)\n  \}\n\/\/ AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_HELPER_END/,
  function (m, body) {
    var updated = body
      .replace(/render\(\);\n\n    Promise\.resolve\(\)/, 'aicmRenderTaskLedgerSafeR8V4("open:initial");\n\n    Promise.resolve()')
      .replace(/state\.screen = "task-ledger";\n            render\(\);/, 'state.screen = "task-ledger";\n            aicmRenderTaskLedgerSafeR8V4("open:after-reload");')
      .replace(/render\(\);\n      \}\);/, 'aicmRenderTaskLedgerSafeR8V4("open:error");\n      });');

    return 'function aicmOpenTaskLedgerScreenR8V3Clean() {\n' + updated + '\n  }\n// AICM_R8_NAV_TASK_LEDGER_V3_CLEAN_HELPER_END';
  }
);

/*
  Reload helper currently calls render().
  Replace the final render() only in aicmReloadTaskLedgerContext by safe render.
*/
src = src.replace(
  /async function aicmReloadTaskLedgerContext\(\) \{\n([\s\S]*?)\n  \}\n\n\n  function aicmHydrateManagerMajorContextArraysR8M/,
  function (m, body) {
    var updated = body.replace(
      /if \(typeof render === "function"\) \{\n      render\(\);\n    \}/,
      'if (typeof aicmRenderTaskLedgerSafeR8V4 === "function") {\n      aicmRenderTaskLedgerSafeR8V4("reload:complete");\n    } else if (typeof render === "function") {\n      render();\n    }'
    );

    return 'async function aicmReloadTaskLedgerContext() {\n' + updated + '\n  }\n\n\n  function aicmHydrateManagerMajorContextArraysR8M';
  }
);

const after = {
  mark: count(src, MARK),
  v3Helper: count(src, 'function aicmOpenTaskLedgerScreenR8V3Clean'),
  safeHelper: count(src, 'function aicmRenderTaskLedgerSafeR8V4'),
  safeCalls: count(src, 'aicmRenderTaskLedgerSafeR8V4('),
  reload: count(src, 'async function aicmReloadTaskLedgerContext'),
  renderTaskLedger: count(src, 'function renderTaskLedgerPlaceholder'),
  renderMajor: count(src, 'function aicmRenderManagerMajorRows'),
  openHandler: count(src, 'if (action === "task-ledger-open")'),
  refreshHandler: count(src, 'if (action === "task-ledger-refresh")'),
  taskOpenButtons: count(src, 'data-core-action="task-ledger-open"'),
  r8m: count(src, 'AICM_CONTEXT_HYDRATION_MANAGER_MAJOR_R8M_V1'),
  r8l: count(src, 'AICM_BROWSER_STATE_CONTEXT_ROWS_LOG_R8L_V1')
};

if (after.mark < 2) throw new Error('V4 markers missing');
if (after.safeHelper !== 1) throw new Error('safe helper count invalid: ' + after.safeHelper);
if (after.v3Helper !== 1) throw new Error('V3 open helper count invalid: ' + after.v3Helper);
if (after.safeCalls < 4) throw new Error('safe render call count too low: ' + after.safeCalls);
if (after.reload !== 1) throw new Error('reload helper count invalid: ' + after.reload);
if (after.renderTaskLedger !== 1) throw new Error('renderTaskLedgerPlaceholder count invalid: ' + after.renderTaskLedger);
if (after.renderMajor !== 1) throw new Error('aicmRenderManagerMajorRows count invalid: ' + after.renderMajor);
if (after.openHandler !== 1) throw new Error('task-ledger-open handler count invalid: ' + after.openHandler);
if (after.refreshHandler !== 1) throw new Error('task-ledger-refresh handler count invalid: ' + after.refreshHandler);
if (after.taskOpenButtons < 1) throw new Error('task-ledger-open button missing');
if (after.r8m < 1) throw new Error('R8M marker missing');
if (after.r8l !== 0) throw new Error('R8L marker returned');

fs.writeFileSync(corePath, src, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  method: 'safe task-ledger rendering helper with visible client-side error',
  before,
  after,
  db_write: 'NO',
  api_post: 'NO',
  delete_executed: 'NO'
}, null, 2));
