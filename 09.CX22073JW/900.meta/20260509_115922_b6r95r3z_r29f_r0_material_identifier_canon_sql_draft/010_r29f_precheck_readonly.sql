\pset pager off
\pset border 2
\pset null ''

BEGIN READ ONLY;

select
  '01_readonly_guard' as section,
  current_setting('transaction_read_only') as transaction_read_only,
  current_setting('default_transaction_read_only') as default_transaction_read_only,
  current_database() as database_name,
  current_user as db_user;

select
  '02_model_public_registry_unique_indexes' as section,
  i.relname as index_name,
  ix.indisprimary,
  ix.indisunique,
  string_agg(a.attname, ', ' order by k.ord) as index_columns
from pg_class t
join pg_namespace n on n.oid = t.relnamespace
join pg_index ix on ix.indrelid = t.oid
join pg_class i on i.oid = ix.indexrelid
join lateral unnest(ix.indkey) with ordinality as k(attnum, ord) on true
join pg_attribute a on a.attrelid = t.oid and a.attnum = k.attnum
where n.nspname = 'aiworker'
  and t.relname = 'model_public_registry'
group by i.relname, ix.indisprimary, ix.indisunique
order by ix.indisprimary desc, ix.indisunique desc, i.relname;

select
  '03_material_legacy_identifier_count' as section,
  q.model_code as legacy_material_model_code,
  count(*) as row_count,
  case
    when q.model_code like 'SERIES:%' then 'SERIES_SCOPE'
    when exists (
      select 1
      from aiworker.model_public_registry r
      where r.model_no = q.model_code
        and r.status_code = 'active'
    ) then 'MODEL_PUBLIC_NO'
    when exists (
      select 1
      from aiworker.model_public_registry r
      where r.model_code = q.model_code
        and r.status_code = 'active'
    ) then 'RUNTIME_MODEL_CODE'
    when exists (
      select 1
      from aiworker.model_public_registry r
      where r.registry_code = q.model_code
        and r.status_code = 'active'
    ) then 'REGISTRY_CODE'
    else 'UNRESOLVED'
  end as legacy_identifier_shape
from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
group by q.model_code
order by
  case
    when q.model_code like 'SERIES:%' then 2
    when exists (select 1 from aiworker.model_public_registry r where r.model_no = q.model_code and r.status_code = 'active') then 1
    else 9
  end,
  row_count desc,
  q.model_code;

with material_codes as (
  select distinct q.model_code as legacy_material_model_code
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
),
series_legacy as (
  select
    legacy_material_model_code,
    regexp_replace(lower(replace(legacy_material_model_code, 'SERIES:', '')), '[^a-z0-9]', '', 'g') as normalized_legacy_series
  from material_codes
  where legacy_material_model_code like 'SERIES:%'
),
series_registry as (
  select distinct
    r.series_code,
    r.series_name,
    r.series_name_ja,
    regexp_replace(lower(coalesce(r.series_name, '')), '[^a-z0-9]', '', 'g') as normalized_series_name,
    regexp_replace(lower(coalesce(r.series_name_ja, '')), '[^a-z0-9一-龯ぁ-んァ-ン]', '', 'g') as normalized_series_name_ja,
    regexp_replace(lower(coalesce(r.series_code, '')), '[^a-z0-9]', '', 'g') as normalized_series_code
  from aiworker.model_public_registry r
  where r.status_code = 'active'
)
select
  '04_series_scope_mapping_candidate' as section,
  s.legacy_material_model_code,
  sr.series_code,
  sr.series_name,
  sr.series_name_ja,
  case
    when sr.series_code is null then 'UNRESOLVED_SERIES'
    else 'SERIES_MATCH'
  end as mapping_status
from series_legacy s
left join series_registry sr
  on sr.normalized_series_name = s.normalized_legacy_series || 'series'
  or sr.normalized_series_name = s.normalized_legacy_series
  or sr.normalized_series_code = s.normalized_legacy_series || 'series'
  or sr.normalized_series_code = s.normalized_legacy_series
  or (
    s.normalized_legacy_series = 'lovers'
    and (
      sr.normalized_series_name like '%lovers%'
      or sr.normalized_series_code like '%lovers%'
      or sr.normalized_series_name_ja like '%ラヴィ%'
    )
  )
order by s.legacy_material_model_code, sr.series_code;

with model_scope as (
  select distinct q.model_code as legacy_material_model_code
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
  where q.model_code not like 'SERIES:%'
),
resolved as (
  select
    m.legacy_material_model_code,
    r.registry_code,
    r.model_no as public_model_no,
    r.model_code as runtime_model_code,
    r.series_code
  from model_scope m
  left join aiworker.model_public_registry r
    on r.model_no = m.legacy_material_model_code
   and r.status_code = 'active'
)
select
  '05_model_scope_resolution' as section,
  legacy_material_model_code,
  registry_code,
  public_model_no,
  runtime_model_code,
  series_code,
  case when registry_code is null then 'UNRESOLVED_MODEL' else 'MODEL_MATCH' end as resolution_status
from resolved
order by resolution_status desc, legacy_material_model_code;

COMMIT;
