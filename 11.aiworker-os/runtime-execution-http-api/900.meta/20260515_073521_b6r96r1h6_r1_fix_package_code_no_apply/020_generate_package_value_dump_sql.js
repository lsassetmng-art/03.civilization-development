const fs = require("fs");

const fkPath = process.argv[2];
const outSqlPath = process.argv[3];

const records = fs.readFileSync(fkPath, "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s.startsWith("{") && s.endsWith("}"))
  .map((s) => JSON.parse(s));

const fkRows = (records.find((r) => r.record_type === "package_code_fk") || { rows: [] }).rows || [];

function q(v) {
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function qi(v) {
  return '"' + String(v).replace(/"/g, '""') + '"';
}

const sql = [];
sql.push("\\pset pager off");
sql.push("\\pset tuples_only on");
sql.push("\\pset format unaligned");
sql.push("\\pset null null");
sql.push("");

sql.push("select jsonb_build_object(");
sql.push("  'record_type', 'fk_rows',");
sql.push("  'rows', " + q(JSON.stringify(fkRows)) + "::jsonb");
sql.push(")::text;");
sql.push("");

for (const fk of fkRows) {
  const tableRef = qi(fk.referenced_schema) + "." + qi(fk.referenced_table);
  const refCol = qi(fk.referenced_column);

  sql.push("select jsonb_build_object(");
  sql.push("  'record_type', 'referenced_package_values',");
  sql.push("  'source_column', " + q(fk.source_column) + ",");
  sql.push("  'referenced_schema', " + q(fk.referenced_schema) + ",");
  sql.push("  'referenced_table', " + q(fk.referenced_table) + ",");
  sql.push("  'referenced_column', " + q(fk.referenced_column) + ",");
  sql.push("  'values', coalesce(jsonb_agg(to_jsonb(v) order by v.value), '[]'::jsonb)");
  sql.push(")::text");
  sql.push("from (");
  sql.push("  select " + refCol + "::text as value, to_jsonb(t) as row_json");
  sql.push("  from " + tableRef + " t");
  sql.push("  limit 300");
  sql.push(") v;");
  sql.push("");
}

fs.writeFileSync(outSqlPath, sql.join("\n") + "\n");
