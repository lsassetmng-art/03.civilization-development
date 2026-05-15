\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'fk_rows',
  'rows', '[{"source_table":"business_support_role_domain_capability","source_column":"package_code","source_schema":"aiworker","constraint_def":"FOREIGN KEY (package_code) REFERENCES aiworker.business_support_control_package(package_code)","constraint_name":"business_support_role_domain_capability_package_code_fkey","referenced_table":"business_support_control_package","referenced_column":"package_code","referenced_schema":"aiworker"}]'::jsonb
)::text;

select jsonb_build_object(
  'record_type', 'referenced_package_values',
  'source_column', 'package_code',
  'referenced_schema', 'aiworker',
  'referenced_table', 'business_support_control_package',
  'referenced_column', 'package_code',
  'values', coalesce(jsonb_agg(to_jsonb(v) order by v.value), '[]'::jsonb)
)::text
from (
  select "package_code"::text as value, to_jsonb(t) as row_json
  from "aiworker"."business_support_control_package" t
  limit 300
) v;

