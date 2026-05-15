\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_codes(code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
), found as (
  select tc.code, exists (
    select 1 from "cx22073jw"."brain_data_domain_catalog" x where x."brain_domain_code" = tc.code
  ) as present
  from target_codes tc
)
select jsonb_build_object(
  'fk_target_schema', 'cx22073jw',
  'fk_target_table', 'brain_data_domain_catalog',
  'fk_target_column', 'brain_domain_code',
  'all_6_present', (select count(*) from found where present) = 6,
  'present_count', (select count(*) from found where present),
  'missing_count', (select count(*) from found where not present),
  'missing_codes', (select coalesce(jsonb_agg(code order by code), '[]'::jsonb) from found where not present)
)::text as verify_bool_json
from found
limit 1;
