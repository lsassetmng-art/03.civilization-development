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

const referenced = records.filter((r) => r.record_type === "referenced_values");

function valuesFor(sourceColumn) {
  const rec = referenced.find((r) => r.source_column === sourceColumn);
  return rec ? (rec.values || []) : [];
}

function chooseValue(sourceColumn) {
  const values = valuesFor(sourceColumn).map((v) => String(v.value || "")).filter(Boolean);
  if (values.length === 0) return null;

  const prefs = {
    default_depth_code: ["standard", "normal", "basic", "shallow", "lightweight", "verified", "deep"],
    default_access_tier_code: ["standard", "public", "basic", "verified", "internal"],
    default_reference_tier_code: ["standard", "basic", "verified_cx_canon", "source_backed"],
    status_code: ["active", "enabled"]
  };

  const list = prefs[sourceColumn] || ["standard", "active", "basic", "default"];
  for (const p of list) {
    const hit = values.find((v) => v.toLowerCase() === p.toLowerCase());
    if (hit) return hit;
  }

  for (const p of list) {
    const hit = values.find((v) => v.toLowerCase().includes(p.toLowerCase()));
    if (hit) return hit;
  }

  return values[0];
}

const targetColumns = [
  "default_depth_code",
  "default_access_tier_code",
  "default_reference_tier_code",
  "status_code"
];

const choices = {};
for (const col of targetColumns) {
  choices[col] = chooseValue(col);
}

let corrected = sourceSql;

for (const [col, value] of Object.entries(choices)) {
  if (!value) continue;

  const re = new RegExp("'b6r96r1h4_r4a_[^']+_" + col + "'\\s+as\\s+\"" + col + "\"", "g");
  corrected = corrected.replace(re, "'" + value.replace(/'/g, "''") + "' as \"" + col + "\"");

  const re2 = new RegExp("'b6r96r1h4_r4a_[^']+_" + col + "'\\s+as\\s+" + col, "g");
  corrected = corrected.replace(re2, "'" + value.replace(/'/g, "''") + "' as " + col);
}

corrected = corrected.replace(
  "-- B6R96R1H4_R4A FK-target Brain Domain Catalog Seed",
  "-- B6R96R1H5_R1 FK-target Brain Domain Catalog Seed Depth FK Fixed"
);

corrected = corrected.replace(
  "-- Purpose:",
  [
    "-- H5_R1 correction:",
    "-- - Replaced generated default_depth_code/default_* FK placeholders with existing catalog values.",
    "-- - Original H5 failed because default_depth_code referenced brain_data_depth_catalog.",
    "--",
    "-- Chosen referenced values:",
    ...Object.entries(choices).map(([k, v]) => `-- - ${k}: ${v || "NOT_FOUND"}`),
    "--",
    "-- Purpose:"
  ].join("\n")
);

fs.writeFileSync(outSqlPath, corrected);

const remaining = [];
for (const col of targetColumns) {
  const re = new RegExp("b6r96r1h4_r4a_[^']+_" + col, "g");
  if (re.test(corrected)) remaining.push(col);
}

const md = [];
md.push("# B6R96R1H5_R1 default depth FK fix decision");
md.push("");
md.push("## Cause");
md.push("- H5 apply failed because generated `default_depth_code` was not present in `brain_data_depth_catalog`.");
md.push("");
md.push("## Chosen values");
for (const [k, v] of Object.entries(choices)) {
  md.push(`- ${k}: ${v || "NOT_FOUND"}`);
}
md.push("");
md.push("## Remaining generated FK placeholders");
md.push(remaining.length ? remaining.join("\n") : "- none");
md.push("");
md.push("## Referenced values evidence");
md.push("```json");
md.push(JSON.stringify(referenced, null, 2));
md.push("```");
md.push("");
md.push("## Status");
md.push("- SQL is NOT APPLIED.");
md.push("- Apply requires explicit GO.");
fs.writeFileSync(decisionPath, md.join("\n") + "\n");
