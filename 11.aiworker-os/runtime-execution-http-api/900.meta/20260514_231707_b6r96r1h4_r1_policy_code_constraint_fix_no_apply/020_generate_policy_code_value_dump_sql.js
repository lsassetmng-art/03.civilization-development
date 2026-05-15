const fs = require("fs");

const structurePath = process.argv[2];
const outSqlPath = process.argv[3];

const records = fs.readFileSync(structurePath, "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s.startsWith("{") && s.endsWith("}"))
  .map((s) => JSON.parse(s));

const sql = [];
sql.push("\\pset pager off");
sql.push("\\pset tuples_only on");
sql.push("\\pset format unaligned");
sql.push("\\pset null null");
sql.push("");

let generated = 0;

for (const r of records) {
  const tableRef = r.table_ref;
  const cols = (r.columns || []).map((c) => c.column_name);

  if (!cols.includes("policy_code")) continue;

  const [schemaName, tableName] = tableRef.split(".");
  sql.push(`select jsonb_build_object(`);
  sql.push(`  'record_type', 'policy_code_values',`);
  sql.push(`  'table_ref', '${tableRef}',`);
  sql.push(`  'column_name', 'policy_code',`);
  sql.push(`  'values', coalesce(jsonb_agg(to_jsonb(v) order by v.row_count desc, v.value), '[]'::jsonb)`);
  sql.push(`)::text`);
  sql.push(`from (`);
  sql.push(`  select policy_code::text as value, count(*)::bigint as row_count`);
  sql.push(`  from ${schemaName}.${tableName}`);
  sql.push(`  group by policy_code`);
  sql.push(`) v;`);
  sql.push("");
  generated += 1;
}

if (generated === 0) {
  sql.push(`select jsonb_build_object('record_type','policy_code_values','table_ref','none','column_name','policy_code','values','[]'::jsonb)::text;`);
}

fs.writeFileSync(outSqlPath, sql.join("\n") + "\n");
