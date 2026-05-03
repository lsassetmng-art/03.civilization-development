import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

/*
 * Fix broken injected literal backslash-n in action handler.
 */
src = src.replace(
  /if \(action === "task-ledger-create"\) \{\\n\s*createTaskLedgerFromForm\(\);\\n\s*return;\\n\s*\}\\n/g,
  [
    'if (action === "task-ledger-create") {',
    '      createTaskLedgerFromForm();',
    '      return;',
    '    }',
    ''
  ].join("\n")
);

src = src.replace(
  /if \(action === "task-ledger-create"\) \{\\n\s*createTaskLedgerFromForm\(\);\\n\s*return;\\n\s*\}\\nif/g,
  [
    'if (action === "task-ledger-create") {',
    '      createTaskLedgerFromForm();',
    '      return;',
    '    }',
    '',
    'if'
  ].join("\n")
);

/*
 * If the previous patch inserted escaped newlines in exactly this local area,
 * normalize that specific block.
 */
src = src.replace(
  /if \(action === "task-ledger-create"\) \{\\n\s*createTaskLedgerFromForm\(\);\\n\s*return;\\n\s*\}/g,
  [
    'if (action === "task-ledger-create") {',
    '      createTaskLedgerFromForm();',
    '      return;',
    '    }'
  ].join("\n")
);

/*
 * Add setMessage helper only if missing.
 */
if (!src.includes("function setMessage(")) {
  const marker = "function go(screen)";
  const pos = src.indexOf(marker);
  if (pos < 0) throw new Error("setMessage insertion point not found");

  const helper = `
function setMessage(kind, message) {
    if (kind === "ok") {
      state.noticeMessage = String(message || "");
      state.errorMessage = "";
      return;
    }

    state.errorMessage = String(message || "");
    state.noticeMessage = "";
  }

  `;

  src = src.slice(0, pos) + helper + src.slice(pos);
}

/*
 * Ensure taskLedger exists in context normalization if possible.
 */
if (src.includes("function normalizeContext(") && !src.includes("taskLedger:")) {
  src = src.replace(
    /robotCatalog:\s*list\(json\.robot_catalog \|\| json\.robotCatalog\)/,
    'robotCatalog: list(json.robot_catalog || json.robotCatalog),\n      taskLedger: list(json.task_ledger || json.taskLedger)'
  );
}

/*
 * Ensure task-ledger-create handler is before go/reload checks if missing.
 */
if (!src.includes('action === "task-ledger-create"')) {
  const marker = 'if (action === "go")';
  const pos = src.indexOf(marker);
  if (pos < 0) throw new Error("action insertion point not found");

  const actionBlock = [
    '    if (action === "task-ledger-create") {',
    '      createTaskLedgerFromForm();',
    '      return;',
    '    }',
    ''
  ].join("\n");

  src = src.slice(0, pos) + actionBlock + src.slice(pos);
}

fs.writeFileSync(file, src);
console.log("task ledger clean core syntax fixed");
