import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");
const before = src;

/*
 * Fix the white-screen root cause:
 *
 * Bad:
 *   async
 *   function openTaskLedgerChatGptPrompt() { ... }
 *
 * Good:
 *   async function openTaskLedgerChatGptPrompt() { ... }
 *
 * Also handles similar split async function definitions created by earlier patches.
 */
const asyncFunctionNames = [
  "readTaskLedgerCsvFile",
  "openTaskLedgerChatGptPrompt",
  "importTaskLedgerCsv",
  "previewTaskLedgerCsv",
  "fillTaskLedgerCsvTemplate",
  "createTaskLedgerFromForm"
];

for (const name of asyncFunctionNames) {
  const re = new RegExp(
    "(^|\\n)([ \\t]*)async[ \\t]*\\n([ \\t]*)function[ \\t]+" + name + "[ \\t]*\\(",
    "g"
  );

  src = src.replace(re, function (_match, prefix, indent) {
    return prefix + indent + "async function " + name + "(";
  });
}

/*
 * If any standalone async remains, remove only the exact standalone line.
 * A standalone async at top-level is always unsafe here and caused:
 * ReferenceError: async is not defined
 */
src = src.replace(/(^|\n)[ \t]*async[ \t]*(?=\n)/g, "$1");

if (src === before) {
  throw new Error("No isolated async pattern was changed");
}

fs.writeFileSync(file, src);
console.log("isolated async runtime error fixed");
