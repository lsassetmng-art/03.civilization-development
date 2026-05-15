const fs = require("fs");

const precheckPath = process.argv[2];
const outSqlPath = process.argv[3];

const lines = fs.readFileSync(precheckPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"));

let target = null;
for (const line of lines) {
  const rec = JSON.parse(line);
  if (rec.record_type === "precheck_fk_target" && rec.rows && rec.rows.length > 0) {
    target = rec.rows[0];
    break;
  }
}

function q(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function qi(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}

const targetCodes = [
  "security_crisis_response",
  "fictional_combat_design",
  "game_tactical_balance",
  "defense_planning_non_harmful",
  "threat_modeling_safe",
  "combat_lore_reference"
];

const sql = [];
sql.push("\\pset pager off");
sql.push("\\pset tuples_only on");
sql.push("\\pset format unaligned");
sql.push("\\pset null null");
sql.push("");

if (!target) {
  sql.push("select jsonb_build_object('all_6_present', false, 'reason', 'fk target not found')::text as verify_bool_json;");
} else {
  const tableRef = qi(target.referenced_schema) + "." + qi(target.referenced_table);
  const col = qi(target.referenced_column);

  sql.push("with target_codes(code) as (");
  sql.push("  values");
  sql.push(targetCodes.map((t) => "    (" + q(t) + ")").join(",\n"));
  sql.push("), found as (");
  sql.push("  select tc.code, exists (");
  sql.push("    select 1 from " + tableRef + " x where x." + col + " = tc.code");
  sql.push("  ) as present");
  sql.push("  from target_codes tc");
  sql.push(")");
  sql.push("select jsonb_build_object(");
  sql.push("  'fk_target_schema', " + q(target.referenced_schema) + ",");
  sql.push("  'fk_target_table', " + q(target.referenced_table) + ",");
  sql.push("  'fk_target_column', " + q(target.referenced_column) + ",");
  sql.push("  'all_6_present', (select count(*) from found where present) = 6,");
  sql.push("  'present_count', (select count(*) from found where present),");
  sql.push("  'missing_count', (select count(*) from found where not present),");
  sql.push("  'missing_codes', (select coalesce(jsonb_agg(code order by code), '[]'::jsonb) from found where not present)");
  sql.push(")::text as verify_bool_json");
  sql.push("from found");
  sql.push("limit 1;");
}

fs.writeFileSync(outSqlPath, sql.join("\n") + "\n");
