const fs = require("fs");

const h3SqlPath = process.argv[2];
const structurePath = process.argv[3];
const valuesPath = process.argv[4];
const correctedSqlPath = process.argv[5];
const decisionPath = process.argv[6];

const h3Sql = fs.readFileSync(h3SqlPath, "utf8");

function readJsonl(path) {
  return fs.readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("{") && s.endsWith("}"))
    .map((s) => JSON.parse(s));
}

const structures = readJsonl(structurePath);
const valueRecords = readJsonl(valuesPath);

const structureByRef = new Map();
for (const r of structures) {
  if (r.record_type === "table_structure") structureByRef.set(r.table_ref, r);
}

const valuesByRef = new Map();
for (const r of valueRecords) {
  if (r.record_type === "policy_code_values") valuesByRef.set(r.table_ref, r.values || []);
}

function extractAllowedFromConstraints(tableRef) {
  const r = structureByRef.get(tableRef);
  const out = [];
  if (!r) return out;

  for (const c of r.constraints || []) {
    const def = String(c.constraint_def || "");
    const name = String(c.constraint_name || "");
    if (!/policy_code/i.test(def) && !/policy_code/i.test(name)) continue;

    const re = /'([^']+)'(?:::text)?/g;
    let m;
    while ((m = re.exec(def)) !== null) {
      out.push(m[1]);
    }
  }
  return Array.from(new Set(out));
}

function choosePolicyCode(tableRef) {
  const existing = (valuesByRef.get(tableRef) || [])
    .map((v) => String(v.value || ""))
    .filter(Boolean);

  const allowed = extractAllowedFromConstraints(tableRef);

  const combined = [
    ...existing.filter((v) => allowed.length === 0 || allowed.includes(v)),
    ...allowed
  ].filter(Boolean);

  const unique = Array.from(new Set(combined));

  const pref = unique.find((v) => /reference/i.test(v))
    || unique.find((v) => /allow/i.test(v))
    || unique.find((v) => /default/i.test(v))
    || unique.find((v) => /standard/i.test(v))
    || unique[0];

  return {
    tableRef,
    chosen: pref || null,
    existing,
    allowed
  };
}

const targetRefs = [
  "aiworker.robot_brain_model_domain_policy",
  "aiworker.robot_brain_role_policy",
  "aiworker.business_support_role_domain_capability"
];

const choices = targetRefs.map(choosePolicyCode);
const primary = choices.find((c) => c.tableRef === "aiworker.robot_brain_model_domain_policy" && c.chosen)
  || choices.find((c) => c.chosen);

if (!primary || !primary.chosen) {
  fs.writeFileSync(correctedSqlPath, [
    "-- B6R96R1H4_R1 correction failed",
    "-- STATUS: NOT APPLIED",
    "-- MANUAL_REVIEW_REQUIRED: could not infer valid policy_code from constraints or existing values."
  ].join("\n") + "\n");

  fs.writeFileSync(decisionPath, [
    "# B6R96R1H4_R1 policy_code fix decision",
    "",
    "## Result",
    "- MANUAL_REVIEW_REQUIRED: valid policy_code could not be inferred.",
    "",
    "## Choices",
    "```json",
    JSON.stringify(choices, null, 2),
    "```"
  ].join("\n") + "\n");

  process.exit(0);
}

const chosenPolicyCode = primary.chosen;

// Replace only generated B6R96R1H3 policy_code values.
// Pattern targets: 'b6r96r1h3_...' as policy_code
let corrected = h3Sql.replace(
  /'b6r96r1h3_[^']+'\s+as\s+policy_code/g,
  `'${chosenPolicyCode.replace(/'/g, "''")}' as policy_code`
);

corrected = corrected.replace(
  "-- B6R96R1H3 HD-R2 Military/Security Policy Overlay Correction",
  "-- B6R96R1H4_R1 HD-R2 Military/Security Policy Overlay Policy Code Fixed"
);

corrected = corrected.replace(
  "-- H3 correction policy:",
  [
    "-- H4_R1 correction policy:",
    `-- - policy_code fixed to '${chosenPolicyCode}' based on existing constraints/values.`,
    "-- - Original generated b6r96r1h3_* policy_code values violated check constraint.",
    "--",
    "-- H3 correction policy:"
  ].join("\n")
);

fs.writeFileSync(correctedSqlPath, corrected);

const remainingBad = [];
const badRe = /'b6r96r1h3_[^']+'\s+as\s+policy_code/g;
let m;
while ((m = badRe.exec(corrected)) !== null) {
  remainingBad.push(m[0]);
}

const md = [];
md.push("# B6R96R1H4_R1 policy_code fix decision");
md.push("");
md.push("## 1. Cause");
md.push("- H4 apply failed because `policy_code` used generated value like `b6r96r1h3_hd_r2_security_crisis_response`.");
md.push("- `robot_brain_model_domain_policy_policy_code_check` rejected that value.");
md.push("");
md.push("## 2. Fix");
md.push(`- chosen_policy_code: ${chosenPolicyCode}`);
md.push("- All generated `b6r96r1h3_* as policy_code` expressions were replaced.");
md.push("");
md.push("## 3. Inference data");
md.push("```json");
md.push(JSON.stringify(choices, null, 2));
md.push("```");
md.push("");
md.push("## 4. Remaining bad policy_code lines");
md.push(remainingBad.length ? remainingBad.join("\n") : "- none");
md.push("");
md.push("## 5. Status");
md.push("- SQL is NOT APPLIED.");
md.push("- Apply requires explicit GO.");
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
