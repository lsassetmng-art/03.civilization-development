const fs = require("fs");

const sourceSqlPath = process.argv[2];
const jsonlPath = process.argv[3];
const mappingPath = process.argv[4];
const correctedSqlPath = process.argv[5];
const decisionPath = process.argv[6];

const sourceSql = fs.readFileSync(sourceSqlPath, "utf8");

const records = fs.readFileSync(jsonlPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"))
  .map((line) => JSON.parse(line));

const brainCatalog = (records.find((r) => r.record_type === "brain_domain_catalog") || { rows: [] }).rows || [];
const taskDomains = (records.find((r) => r.record_type === "task_domains") || { rows: [] }).rows || [];
const existingPolicy = (records.find((r) => r.record_type === "model_policy_existing_values") || { rows: [] }).rows || [];

const taskDomainCodes = [
  "security_crisis_response",
  "fictional_combat_design",
  "game_tactical_balance",
  "defense_planning_non_harmful",
  "threat_modeling_safe",
  "combat_lore_reference"
];

function rowText(row) {
  return JSON.stringify(row || {}).toLowerCase();
}

function codeOf(row) {
  return String(row.brain_domain_code || row.domain_code || row.code || "");
}

function scoreBrainDomain(taskCode, brainRow) {
  const text = rowText(brainRow);
  const code = codeOf(brainRow).toLowerCase();
  let score = 0;

  const words = taskCode.split("_").filter(Boolean);
  for (const w of words) {
    if (code.includes(w)) score += 8;
    if (text.includes(w)) score += 4;
  }

  const mappingHints = {
    security_crisis_response: ["security", "crisis", "risk", "safety", "emergency", "operations"],
    fictional_combat_design: ["fiction", "game", "combat", "lore", "creative", "scenario"],
    game_tactical_balance: ["game", "tactical", "combat", "balance", "lore"],
    defense_planning_non_harmful: ["defense", "security", "safety", "risk", "crisis"],
    threat_modeling_safe: ["threat", "risk", "security", "safety", "crisis"],
    combat_lore_reference: ["combat", "lore", "history", "military", "game", "fiction"]
  };

  for (const hint of mappingHints[taskCode] || []) {
    if (code.includes(hint)) score += 10;
    if (text.includes(hint)) score += 5;
  }

  return score;
}

function chooseBrainDomain(taskCode) {
  const candidates = brainCatalog
    .map((row) => ({ row, code: codeOf(row), score: scoreBrainDomain(taskCode, row) }))
    .filter((x) => x.code)
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));

  const positive = candidates.filter((x) => x.score > 0);
  if (positive.length > 0) return positive[0];

  const existingTop = existingPolicy.find((x) => x.brain_domain_code);
  if (existingTop) {
    return {
      code: String(existingTop.brain_domain_code),
      score: 0,
      row: { fallback_from_existing_policy: true, brain_domain_code: String(existingTop.brain_domain_code) }
    };
  }

  return null;
}

const mapping = {};
const mappingDetails = [];

for (const taskCode of taskDomainCodes) {
  const chosen = chooseBrainDomain(taskCode);
  if (chosen) {
    mapping[taskCode] = chosen.code;
    mappingDetails.push({
      task_domain_code: taskCode,
      chosen_brain_domain_code: chosen.code,
      score: chosen.score,
      chosen_row: chosen.row
    });
  } else {
    mapping[taskCode] = null;
    mappingDetails.push({
      task_domain_code: taskCode,
      chosen_brain_domain_code: null,
      score: 0,
      chosen_row: null
    });
  }
}

let corrected = sourceSql;

// Replace task_domain_code used as brain_domain_code only in SQL string literals.
// This is intentionally broad but limited to six exact values.
for (const taskCode of taskDomainCodes) {
  const brainCode = mapping[taskCode];
  if (!brainCode) continue;
  const re = new RegExp("'" + taskCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "'\\s+as\\s+brain_domain_code", "g");
  corrected = corrected.replace(re, "'" + brainCode.replace(/'/g, "''") + "' as brain_domain_code");
}

// Add a header note.
corrected = corrected.replace(
  "-- B6R96R1H4_R1 HD-R2 Military/Security Policy Overlay Policy Code Fixed",
  "-- B6R96R1H4_R3 HD-R2 Military/Security Policy Overlay Brain Domain FK Fixed"
);

corrected = corrected.replace(
  "-- H4_R1 correction policy:",
  [
    "-- H4_R3 correction policy:",
    "-- - brain_domain_code fixed by mapping task_domain_code to aiworker.brain_data_domain_catalog values.",
    "-- - Original task_domain_code values violated FK brain_domain_code_fkey.",
    "--",
    "-- Mapping:",
    ...mappingDetails.map((m) => `-- - ${m.task_domain_code} -> ${m.chosen_brain_domain_code || "MANUAL_REVIEW_REQUIRED"}`),
    "--",
    "-- H4_R1 correction policy:"
  ].join("\n")
);

fs.writeFileSync(correctedSqlPath, corrected);

const remaining = [];
for (const taskCode of taskDomainCodes) {
  const re = new RegExp("'" + taskCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "'\\s+as\\s+brain_domain_code", "g");
  if (re.test(corrected)) remaining.push(taskCode);
}

const md = [];
md.push("# B6R96R1H4_R3 task_domain_code → brain_domain_code mapping proposal");
md.push("");
md.push("## Cause");
md.push("- H4_R2 failed because task_domain_code was inserted into brain_domain_code.");
md.push("- brain_domain_code has FK to aiworker.brain_data_domain_catalog.");
md.push("");
md.push("## Mapping proposal");
md.push("");
md.push("| task_domain_code | proposed brain_domain_code | score |");
md.push("|---|---|---:|");
for (const m of mappingDetails) {
  md.push(`| ${m.task_domain_code} | ${m.chosen_brain_domain_code || "MANUAL_REVIEW_REQUIRED"} | ${m.score} |`);
}
md.push("");
md.push("## Brain catalog size");
md.push(`- rows: ${brainCatalog.length}`);
md.push("");
md.push("## Existing model policy values");
md.push("```json");
md.push(JSON.stringify(existingPolicy.slice(0, 30), null, 2));
md.push("```");
fs.writeFileSync(mappingPath, md.join("\n") + "\n");

const dec = [];
dec.push("# B6R96R1H4_R3 brain domain FK fix decision");
dec.push("");
dec.push("## Result");
if (remaining.length === 0 && Object.values(mapping).every(Boolean)) {
  dec.push("- Corrected SQL generated.");
  dec.push("- No task_domain_code remains as `brain_domain_code`.");
  dec.push("- SQL is NOT APPLIED.");
} else {
  dec.push("- MANUAL_REVIEW_REQUIRED remains.");
  dec.push("- Some task domains could not be mapped to brain_data_domain_catalog.");
}
dec.push("");
dec.push("## Remaining task-as-brain");
dec.push(remaining.length ? remaining.join("\n") : "- none");
dec.push("");
dec.push("## Mapping JSON");
dec.push("```json");
dec.push(JSON.stringify(mappingDetails, null, 2));
dec.push("```");
fs.writeFileSync(decisionPath, dec.join("\n") + "\n");
