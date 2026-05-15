\pset pager off
\pset tuples_only on
\pset format unaligned
\pset null null

with target_domains(domain_code) as (
  values
    ('security_crisis_response'),
    ('fictional_combat_design'),
    ('game_tactical_balance'),
    ('defense_planning_non_harmful'),
    ('threat_modeling_safe'),
    ('combat_lore_reference')
),
fk as (
  select
    con.conname as constraint_name,
    tgtn.nspname as referenced_schema,
    tgtc.relname as referenced_table,
    ta.attname as referenced_column
  from pg_constraint con
  join pg_class srcc on srcc.oid = con.conrelid
  join pg_namespace srcn on srcn.oid = srcc.relnamespace
  join pg_class tgtc on tgtc.oid = con.confrelid
  join pg_namespace tgtn on tgtn.oid = tgtc.relnamespace
  join unnest(con.conkey, con.confkey) with ordinality as u(source_attnum, referenced_attnum, ord) on true
  join pg_attribute sa on sa.attrelid = con.conrelid and sa.attnum = u.source_attnum
  join pg_attribute ta on ta.attrelid = con.confrelid and ta.attnum = u.referenced_attnum
  where con.contype = 'f'
    and srcn.nspname = 'aiworker'
    and srcc.relname = 'robot_brain_model_domain_policy'
    and sa.attname = 'brain_domain_code'
  limit 1
),
domain_check as (
  select
    d.domain_code,
    exists (
      select 1
      from aiworker.business_support_task_domain t
      where t.task_domain_code = d.domain_code
        and t.status_code = 'active'
    ) as task_domain_active
  from target_domains d
),
brain_fk_target_check as (
  select jsonb_build_object(
    'fk_target_schema', referenced_schema,
    'fk_target_table', referenced_table,
    'fk_target_column', referenced_column,
    'constraint_name', constraint_name
  ) as target_json
  from fk
)
select jsonb_build_object(
  'record_type', 'precheck_static',
  'task_domain_active_count', (select count(*) from domain_check where task_domain_active),
  'task_domain_missing_count', (select count(*) from domain_check where not task_domain_active),
  'fk_target', (select target_json from brain_fk_target_check)
)::text;
