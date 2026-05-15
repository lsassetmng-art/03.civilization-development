const fs = require("fs");

const fkPath = process.argv[2];
const outSqlPath = process.argv[3];

const records = fs.readFileSync(fkPath, "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line.startsWith("{") && line.endsWith("}"))
  .map((line) => JSON.parse(line));

const fkRefs = (records.find((r) => r.record_type === "fk_references") || { rows: [] }).rows || [];

function qlit(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

function qident(s) {
  return '"' + String(s).replace(/"/g, '""') + '"';
}

let target = null;
for (const fk of fkRefs) {
  const map = fk.column_map || [];
  if (map.some((m) => m.source_column === "brain_domain_code")) {
    target = {
      schema: fk.referenced_schema,
      table: fk.referenced_table,
      referenced_column: map.find((m) => m.source_column === "brain_domain_code").referenced_column,
      constraint_name: fk.constraint_name,
      constraint_def: fk.constraint_def
    };
    break;
  }
}

const sql = [];
sql.push("\\pset pager off");
sql.push("\\pset tuples_only on");
sql.push("\\pset format unaligned");
sql.push("\\pset null null");
sql.push("");

if (!target) {
  sql.push("select jsonb_build_object('record_type','target_error','message','brain_domain_code FK target not found')::text;");
} else {
  const ref = qident(target.schema) + "." + qident(target.table);

  sql.push("select jsonb_build_object(");
  sql.push("  'record_type', 'resolved_fk_target',");
  sql.push("  'referenced_schema', " + qlit(target.schema) + ",");
  sql.push("  'referenced_table', " + qlit(target.table) + ",");
  sql.push("  'referenced_column', " + qlit(target.referenced_column) + ",");
  sql.push("  'constraint_name', " + qlit(target.constraint_name) + ",");
  sql.push("  'constraint_def', " + qlit(target.constraint_def));
  sql.push(")::text;");
  sql.push("");

  sql.push("select jsonb_build_object(");
  sql.push("  'record_type', 'target_table_structure',");
  sql.push("  'schema_name', " + qlit(target.schema) + ",");
  sql.push("  'table_name', " + qlit(target.table) + ",");
  sql.push("  'table_ref', " + qlit(target.schema + "." + target.table) + ",");
  sql.push("  'referenced_column', " + qlit(target.referenced_column) + ",");
  sql.push("  'columns', coalesce(jsonb_agg(jsonb_build_object(");
  sql.push("    'ordinal_position', ordinal_position,");
  sql.push("    'column_name', column_name,");
  sql.push("    'data_type', data_type,");
  sql.push("    'udt_name', udt_name,");
  sql.push("    'is_nullable', is_nullable,");
  sql.push("    'column_default', column_default");
  sql.push("  ) order by ordinal_position), '[]'::jsonb)");
  sql.push(")::text");
  sql.push("from information_schema.columns");
  sql.push("where table_schema = " + qlit(target.schema));
  sql.push("  and table_name = " + qlit(target.table) + ";");
  sql.push("");

  sql.push("select jsonb_build_object(");
  sql.push("  'record_type', 'target_constraints',");
  sql.push("  'schema_name', " + qlit(target.schema) + ",");
  sql.push("  'table_name', " + qlit(target.table) + ",");
  sql.push("  'constraints', coalesce(jsonb_agg(jsonb_build_object(");
  sql.push("    'constraint_name', con.conname,");
  sql.push("    'constraint_type', con.contype,");
  sql.push("    'constraint_def', pg_get_constraintdef(con.oid)");
  sql.push("  ) order by con.contype, con.conname), '[]'::jsonb)");
  sql.push(")::text");
  sql.push("from pg_class c");
  sql.push("join pg_namespace n on n.oid = c.relnamespace");
  sql.push("left join pg_constraint con on con.conrelid = c.oid");
  sql.push("where n.nspname = " + qlit(target.schema));
  sql.push("  and c.relname = " + qlit(target.table));
  sql.push("group by n.nspname, c.relname;");
  sql.push("");

  sql.push("select jsonb_build_object(");
  sql.push("  'record_type', 'target_existing_rows',");
  sql.push("  'schema_name', " + qlit(target.schema) + ",");
  sql.push("  'table_name', " + qlit(target.table) + ",");
  sql.push("  'referenced_column', " + qlit(target.referenced_column) + ",");
  sql.push("  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)");
  sql.push(")::text");
  sql.push("from (select * from " + ref + " limit 500) t;");
  sql.push("");

  sql.push("select jsonb_build_object(");
  sql.push("  'record_type', 'target_existing_six_check',");
  sql.push("  'schema_name', " + qlit(target.schema) + ",");
  sql.push("  'table_name', " + qlit(target.table) + ",");
  sql.push("  'referenced_column', " + qlit(target.referenced_column) + ",");
  sql.push("  'rows', coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text), '[]'::jsonb)");
  sql.push(")::text");
  sql.push("from (");
  sql.push("  select * from " + ref);
  sql.push("  where " + qident(target.referenced_column) + " in (");
  sql.push("    'security_crisis_response',");
  sql.push("    'fictional_combat_design',");
  sql.push("    'game_tactical_balance',");
  sql.push("    'defense_planning_non_harmful',");
  sql.push("    'threat_modeling_safe',");
  sql.push("    'combat_lore_reference'");
  sql.push("  )");
  sql.push(") t;");
}

fs.writeFileSync(outSqlPath, sql.join("\n") + "\n");
