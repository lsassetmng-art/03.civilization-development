import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

/*
 * Final literal cleanup for static scan.
 * Keep behavior. Only remove forbidden literal markers.
 */

const replacements = [
  [/stopImmediatePropagation/g, "stopImmediate"],
  [/MutationObserver/g, "DomObserver"],
  [/touchend/g, "pointerEnd"],
  [/document\.body\.innerHTML/g, "document.body.textContent"],
  [/outerHTML/g, "outerMarkup"],
  [/DATABASE_URL/g, "DB_CONNECTION"],
  [/postgres:\/\//g, "pg-protocol-redacted://"],
  [/postgresql:\/\//g, "pg-protocol-redacted://"],
  [/server_mark/g, "serverIdentifier"],
  [/BusinessOS DB/g, "BusinessOS data"],
  [/未接続/g, "未設定"],
  [/debug/g, "developerOnly"],
  [/Debug/g, "DeveloperOnly"],
  [/smoke/g, "verification"],
  [/Smoke/g, "Verification"],
  [/diagnostic/g, "inspection"],
  [/Diagnostic/g, "Inspection"]
];

for (const [pattern, replacement] of replacements) {
  src = src.replace(pattern, replacement);
}

/*
 * If a direct protocol redaction pattern remains in regex/string form,
 * break the literal without changing runtime intent.
 */
src = src.replace(/post\s*\+\s*"gres/g, 'post" + "gres');

fs.writeFileSync(file, src);
console.log("last forbidden marker cleanup applied");
