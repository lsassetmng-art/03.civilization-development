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

-- model_public_registry の active model_no 重複確認
with active_model_no as (
  select
    model_no,
    count(*) as row_count,
    string_agg(registry_code, ', ' order by registry_code) as registry_codes,
    string_agg(model_code, ', ' order by model_code) as runtime_model_codes
  from aiworker.model_public_registry
  where status_code = 'active'
    and app_reference_allowed_flag = true
    and nullif(model_no, '') is not null
  group by model_no
)
select
  '02_active_model_no_duplicates' as section,
  model_no,
  row_count,
  registry_codes,
  runtime_model_codes
from active_model_no
where row_count > 1
order by row_count desc, model_no;

-- material legacy model_code の分類
with material_codes as (
  select
    q.model_code as legacy_material_model_code,
    count(*) as material_rows
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
  group by q.model_code
),
classified as (
  select
    m.legacy_material_model_code,
    m.material_rows,
    case
      when m.legacy_material_model_code like 'SERIES:%' then 'SERIES_SCOPE'
      when exists (
        select 1
        from aiworker.model_public_registry r
        where r.status_code = 'active'
          and r.app_reference_allowed_flag = true
          and r.model_no = m.legacy_material_model_code
      ) then 'MODEL_PUBLIC_NO'
      when exists (
        select 1
        from aiworker.model_public_registry r
        where r.status_code = 'active'
          and r.app_reference_allowed_flag = true
          and r.model_code = m.legacy_material_model_code
      ) then 'RUNTIME_MODEL_CODE'
      when exists (
        select 1
        from aiworker.model_public_registry r
        where r.status_code = 'active'
          and r.app_reference_allowed_flag = true
          and r.registry_code = m.legacy_material_model_code
      ) then 'REGISTRY_CODE'
      else 'UNRESOLVED'
    end as identifier_shape
  from material_codes m
)
select
  '03_identifier_shape_summary' as section,
  identifier_shape,
  count(*) as distinct_legacy_codes,
  sum(material_rows) as material_rows
from classified
group by identifier_shape
order by identifier_shape;

select
  '04_unresolved_material_codes' as section,
  legacy_material_model_code,
  material_rows,
  identifier_shape
from (
  with material_codes as (
    select
      q.model_code as legacy_material_model_code,
      count(*) as material_rows
    from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
    group by q.model_code
  )
  select
    m.legacy_material_model_code,
    m.material_rows,
    case
      when m.legacy_material_model_code like 'SERIES:%' then 'SERIES_SCOPE'
      when exists (
        select 1 from aiworker.model_public_registry r
        where r.status_code = 'active'
          and r.app_reference_allowed_flag = true
          and r.model_no = m.legacy_material_model_code
      ) then 'MODEL_PUBLIC_NO'
      when exists (
        select 1 from aiworker.model_public_registry r
        where r.status_code = 'active'
          and r.app_reference_allowed_flag = true
          and r.model_code = m.legacy_material_model_code
      ) then 'RUNTIME_MODEL_CODE'
      when exists (
        select 1 from aiworker.model_public_registry r
        where r.status_code = 'active'
          and r.app_reference_allowed_flag = true
          and r.registry_code = m.legacy_material_model_code
      ) then 'REGISTRY_CODE'
      else 'UNRESOLVED'
    end as identifier_shape
  from material_codes m
) x
where identifier_shape = 'UNRESOLVED'
order by material_rows desc, legacy_material_model_code;

-- SERIES:* の解決候補
with series_legacy as (
  select distinct
    q.model_code as legacy_material_model_code,
    regexp_replace(lower(replace(q.model_code, 'SERIES:', '')), '[^a-z0-9]', '', 'g') as normalized_legacy_series
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
  where q.model_code like 'SERIES:%'
),
series_registry as (
  select distinct
    r.series_code,
    max(r.series_name) as series_name,
    max(r.series_name_ja) as series_name_ja,
    regexp_replace(lower(max(coalesce(r.series_name, ''))), '[^a-z0-9]', '', 'g') as normalized_series_name,
    regexp_replace(lower(max(coalesce(r.series_code, ''))), '[^a-z0-9]', '', 'g') as normalized_series_code,
    regexp_replace(lower(max(coalesce(r.series_name_ja, ''))), '[^a-z0-9一-龯ぁ-んァ-ン]', '', 'g') as normalized_series_name_ja
  from aiworker.model_public_registry r
  where r.status_code = 'active'
    and r.app_reference_allowed_flag = true
  group by r.series_code
),
matched as (
  select
    s.legacy_material_model_code,
    sr.series_code,
    sr.series_name,
    sr.series_name_ja
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
)
select
  '05_series_scope_mapping' as section,
  legacy_material_model_code,
  count(series_code) as matched_series_count,
  string_agg(series_code, ', ' order by series_code) as matched_series_codes,
  string_agg(coalesce(series_name_ja, series_name, ''), ', ' order by series_code) as matched_series_names
from matched
group by legacy_material_model_code
order by legacy_material_model_code;

-- BYD2-003 が runtime code へ正しく解決できるか
select
  '06_byd2_003_resolution' as section,
  registry_code,
  model_no as public_model_no,
  model_code as runtime_model_code,
  series_code,
  status_code,
  app_reference_allowed_flag
from aiworker.model_public_registry
where model_no = 'BYD2-003'
order by registry_code;

-- 新canon view想定のBYD2-003 runtime lookup件数を事前シミュレーション
with material as (
  select *
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1
),
model_resolved as (
  select
    q.*,
    r.registry_code,
    r.model_no as public_model_no,
    r.model_code as runtime_model_code,
    r.series_code as canonical_series_code,
    'MODEL'::text as identifier_scope_code,
    q.model_code as legacy_material_model_code
  from material q
  join aiworker.model_public_registry r
    on r.model_no = q.model_code
   and r.status_code = 'active'
   and r.app_reference_allowed_flag = true
  where q.model_code not like 'SERIES:%'
),
series_legacy as (
  select distinct
    q.model_code as legacy_material_model_code,
    regexp_replace(lower(replace(q.model_code, 'SERIES:', '')), '[^a-z0-9]', '', 'g') as normalized_legacy_series
  from material q
  where q.model_code like 'SERIES:%'
),
series_registry as (
  select distinct
    r.series_code,
    regexp_replace(lower(coalesce(r.series_name, '')), '[^a-z0-9]', '', 'g') as normalized_series_name,
    regexp_replace(lower(coalesce(r.series_code, '')), '[^a-z0-9]', '', 'g') as normalized_series_code,
    regexp_replace(lower(coalesce(r.series_name_ja, '')), '[^a-z0-9一-龯ぁ-んァ-ン]', '', 'g') as normalized_series_name_ja
  from aiworker.model_public_registry r
  where r.status_code = 'active'
    and r.app_reference_allowed_flag = true
),
series_map as (
  select distinct
    s.legacy_material_model_code,
    sr.series_code
  from series_legacy s
  join series_registry sr
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
),
series_resolved as (
  select
    q.*,
    r.registry_code,
    r.model_no as public_model_no,
    r.model_code as runtime_model_code,
    r.series_code as canonical_series_code,
    'SERIES'::text as identifier_scope_code,
    q.model_code as legacy_material_model_code
  from material q
  join series_map sm
    on sm.legacy_material_model_code = q.model_code
  join aiworker.model_public_registry r
    on r.series_code = sm.series_code
   and r.status_code = 'active'
   and r.app_reference_allowed_flag = true
),
canon_sim as (
  select * from model_resolved
  union all
  select * from series_resolved
)
select
  '07_canon_sim_byd2_003_counts' as section,
  count(*) filter (where runtime_model_code = 'byd2_003_asic_leader3') as byd2_003_total_rows,
  count(*) filter (
    where runtime_model_code = 'byd2_003_asic_leader3'
      and to_jsonb(canon_sim)::text ilike '%大化%'
  ) as byd2_003_taika_rows,
  count(*) filter (
    where runtime_model_code = 'byd2_003_asic_leader3'
      and identifier_scope_code = 'MODEL'
  ) as byd2_003_model_scope_rows,
  count(*) filter (
    where runtime_model_code = 'byd2_003_asic_leader3'
      and identifier_scope_code = 'SERIES'
  ) as byd2_003_series_scope_rows
from canon_sim;

COMMIT;
