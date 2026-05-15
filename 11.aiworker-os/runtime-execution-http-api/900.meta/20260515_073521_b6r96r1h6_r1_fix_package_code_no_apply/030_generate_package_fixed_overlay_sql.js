const fs = require("fs");

const sourceSqlPath = process.argv[2];
const valuesPath = process.argv[3];
const outSqlPath = process.argv[4];
const decisionPath = process.argv[5];

const sourceSql = fs.readFileSync(sourceSqlPath, "utf8");

const records = fs.readFileSync(valuesPath, "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s.startsWith("{") && s.endsWith("}"))
  .map((s) => JSON.parse(s));

const packageRec = records.find((r) => r.record_type === "referenced_package_values");
const values = packageRec ? (packageRec.values || []) : [];

function valueText(v) {
  return String(v.value || "");
}

function rowText(v) {
  return JSON.stringify(v || {}).toLowerCase();
}

function score(v) {
  const code = valueText(v).toLowerCase();
  const text = rowText(v);
  let s = 0;

  const positive = [
    "aiworker",
    "runtime",
    "worker",
    "business",
    "support",
    "standard",
    "core",
    "default",
    "general",
    "operation"
  ];

  for (const p of positive) {
    if (code.includes(p)) s += 20;
    if (text.includes(p)) s += 5;
  }

  if (code === "aiworker_runtime") s -= 1000;
  if (code.includes("deprecated") || text.includes("deprecated")) s -= 100;
  if (code.includes("inactive") || text.includes("inactive")) s -= 100;

  return s;
}

const candidates = values
  .map((v) => ({ value: valueText(v), score: score(v), row: v.row_json || v }))
  .filter((v) => v.value)
  .sort((a, b) => b.score - a.score || a.value.localeCompare(b.value));

const chosen = candidates.length > 0 ? candidates[0].value : null;

let corrected = sourceSql;

if (chosen) {
  corrected = corrected.replace(
    /'aiworker_runtime'\s+as\s+"?package_code"?/g,
    "'" + chosen.replace(/'/g, "''") + "' as package_code"
  );
}

corrected = corrected.replace(
  "-- B6R96R1H4_R1 HD-R2 Military/Security Policy Overlay Policy Code Fixed",
  "-- B6R96R1H6_R1 HD-R2 Military/Security Policy Overlay Package Code Fixed"
);

corrected = corrected.replace(
  "-- H4_R1 correction policy:",
  [
    "-- H6_R1 correction policy:",
    `-- - package_code fixed from 'aiworker_runtime' to '${chosen || "MANUAL_REVIEW_REQUIRED"}'.`,
    "-- - Original H6 failed because aiworker_runtime was not present in business_support_control_package.",
    "--",
    "-- H4_R1 correction policy:"
  ].join("\n")
);

if (!chosen) {
  corrected = [
    "-- MANUAL_REVIEW_REQUIRED: no valid referenced package_code found.",
    corrected
  ].join("\n");
}

fs.writeFileSync(outSqlPath, corrected);

const remainingBad = /'aiworker_runtime'\s+as\s+"?package_code"?/i.test(corrected);

const md = [];
md.push("# B6R96R1H6_R1 package_code fix decision");
md.push("");
md.push("## Cause");
md.push("- H6 failed because `business_support_role_domain_capability.package_code = aiworker_runtime` was not present in `business_support_control_package`.");
md.push("");
md.push("## Chosen package_code");
md.push(`- chosen_package_code: ${chosen || "MANUAL_REVIEW_REQUIRED"}`);
md.push("");
md.push("## Remaining bad package_code");
md.push(remainingBad ? "- aiworker_runtime still remains as package_code" : "- none");
md.push("");
md.push("## Candidate values");
md.push("```json");
md.push(JSON.stringify(candidates, null, 2));
md.push("```");
md.push("");
md.push("## Status");
md.push("- SQL is NOT APPLIED.");
md.push("- Apply requires explicit GO.");
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
