\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

select jsonb_build_object(
  'record_type', 'fk_rows',
  'rows', '[{"source_table":"brain_data_domain_catalog","source_column":"default_depth_code","source_schema":"cx22073jw","constraint_def":"FOREIGN KEY (default_depth_code) REFERENCES cx22073jw.brain_data_depth_catalog(depth_code)","constraint_name":"brain_data_domain_catalog_default_depth_code_fkey","referenced_table":"brain_data_depth_catalog","referenced_column":"depth_code","referenced_schema":"cx22073jw"}]'::jsonb
)::text;

select jsonb_build_object(
  'record_type', 'referenced_values',
  'source_column', 'default_depth_code',
  'referenced_schema', 'cx22073jw',
  'referenced_table', 'brain_data_depth_catalog',
  'referenced_column', 'depth_code',
  'values', coalesce(jsonb_agg(to_jsonb(v) order by v.value), '[]'::jsonb)
)::text
from (
  select "depth_code"::text as value, to_jsonb(t) as row_json
  from "cx22073jw"."brain_data_depth_catalog" t
  limit 300
) v;

