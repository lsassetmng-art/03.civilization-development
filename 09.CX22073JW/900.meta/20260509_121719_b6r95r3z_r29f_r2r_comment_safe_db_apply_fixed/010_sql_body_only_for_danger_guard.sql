















create table if not exists aiworker.robot_series_identifier_canon (
  series_code text primary key,
  series_name text,
  series_name_ja text,
  active_flag boolean not null default true,
  source_table text not null default 'aiworker.model_public_registry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into aiworker.robot_series_identifier_canon (
  series_code,
  series_name,
  series_name_ja,
  active_flag,
  source_table
)
select distinct
  r.series_code,
  max(r.series_name) as series_name,
  max(r.series_name_ja) as series_name_ja,
  true as active_flag,
  'aiworker.model_public_registry' as source_table
from aiworker.model_public_registry r
where r.status_code = 'active'
  and nullif(r.series_code, '') is not null
group by r.series_code
on conflict (series_code) do update
set
  series_name = excluded.series_name,
  series_name_ja = excluded.series_name_ja,
  active_flag = excluded.active_flag,
  updated_at = now();





create table if not exists aiworker.robot_material_model_identifier_canon (
  legacy_material_model_code text primary key,
  identifier_scope_code text not null,
  registry_code text null,
  public_model_no text null,
  runtime_model_code text null,
  series_code text null,
  active_flag boolean not null default true,
  source_note_ja text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint robot_material_model_identifier_scope_ck
    check (identifier_scope_code in ('MODEL', 'SERIES')),

  constraint robot_material_model_identifier_model_shape_ck
    check (
      (
        identifier_scope_code = 'MODEL'
        and registry_code is not null
        and public_model_no is not null
        and runtime_model_code is not null
        and series_code is not null
      )
      or
      (
        identifier_scope_code = 'SERIES'
        and registry_code is null
        and public_model_no is null
        and runtime_model_code is null
        and series_code is not null
      )
    ),

  constraint robot_material_model_identifier_registry_fk
    foreign key (registry_code)
    references aiworker.model_public_registry(registry_code),

  constraint robot_material_model_identifier_series_fk
    foreign key (series_code)
    references aiworker.robot_series_identifier_canon(series_code)
);

create index if not exists idx_robot_material_model_identifier_runtime_model_code
  on aiworker.robot_material_model_identifier_canon(runtime_model_code);

create index if not exists idx_robot_material_model_identifier_public_model_no
  on aiworker.robot_material_model_identifier_canon(public_model_no);

create index if not exists idx_robot_material_model_identifier_series_code
  on aiworker.robot_material_model_identifier_canon(series_code);






insert into aiworker.robot_material_model_identifier_canon (
  legacy_material_model_code,
  identifier_scope_code,
  registry_code,
  public_model_no,
  runtime_model_code,
  series_code,
  active_flag,
  source_note_ja
)
select distinct
  q.model_code as legacy_material_model_code,
  'MODEL' as identifier_scope_code,
  r.registry_code,
  r.model_no as public_model_no,
  r.model_code as runtime_model_code,
  r.series_code,
  true as active_flag,
  'legacy material model_code matched model_public_registry.model_no' as source_note_ja
from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
join aiworker.model_public_registry r
  on r.model_no = q.model_code
 and r.status_code = 'active'
where q.model_code not like 'SERIES:%'
on conflict (legacy_material_model_code) do update
set
  identifier_scope_code = excluded.identifier_scope_code,
  registry_code = excluded.registry_code,
  public_model_no = excluded.public_model_no,
  runtime_model_code = excluded.runtime_model_code,
  series_code = excluded.series_code,
  active_flag = excluded.active_flag,
  source_note_ja = excluded.source_note_ja,
  updated_at = now();







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
  group by r.series_code
),
matched as (
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
)
insert into aiworker.robot_material_model_identifier_canon (
  legacy_material_model_code,
  identifier_scope_code,
  registry_code,
  public_model_no,
  runtime_model_code,
  series_code,
  active_flag,
  source_note_ja
)
select
  legacy_material_model_code,
  'SERIES' as identifier_scope_code,
  null as registry_code,
  null as public_model_no,
  null as runtime_model_code,
  series_code,
  true as active_flag,
  'legacy material model_code is series scope and expands through model_public_registry.series_code' as source_note_ja
from matched
on conflict (legacy_material_model_code) do update
set
  identifier_scope_code = excluded.identifier_scope_code,
  registry_code = excluded.registry_code,
  public_model_no = excluded.public_model_no,
  runtime_model_code = excluded.runtime_model_code,
  series_code = excluded.series_code,
  active_flag = excluded.active_flag,
  source_note_ja = excluded.source_note_ja,
  updated_at = now();







create or replace view aiworker.vw_robot_readable_brain_runtime_material_canon_v1 as
with src as (
  select
    q.profile_source_type,
    q.model_code as legacy_material_model_code,
    q.series_code as legacy_series_code,
    q.role_code,
    q.brain_data_code,
    q.brain_domain_code,
    q.brain_domain_label_ja,
    q.depth_code,
    q.data_depth_level,
    q.risk_class_code,
    q.granularity_code,
    q.effective_use_purpose_codes,
    q.access_decision_code,
    q.source_exists_flag,
    q.unit_code,
    q.unit_title_ja,
    q.unit_summary_ja,
    q.unit_detail_ja,
    q.practical_use_ja,
    q.example_prompt_ja,
    q.safety_boundary_ja,
    q.tags,
    q.material_source_kind,
    q.source_kind_score,
    q.full_load_priority,
    q.domain_priority_score,
    q.risk_base_score,
    q.depth_score,
    q.canon_status,
    q.reference_tier,
    q.verification_status,
    q.source_basis_codes,
    q.source_caution_ja,
    q.robot_use_summary_ja,
    q.misconception_guard_ja,
    q.lightweight_allowed_flag,
    q.deep_reference_allowed_flag,
    q.verified_canon_priority
  from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
),
model_scope as (
  select
    c.identifier_scope_code,
    c.legacy_material_model_code,
    c.registry_code,
    c.public_model_no,
    c.runtime_model_code,
    c.series_code as canonical_series_code,
    src.*
  from src
  join aiworker.robot_material_model_identifier_canon c
    on c.legacy_material_model_code = src.legacy_material_model_code
   and c.identifier_scope_code = 'MODEL'
   and c.active_flag = true
),
series_scope as (
  select
    c.identifier_scope_code,
    c.legacy_material_model_code,
    r.registry_code,
    r.model_no as public_model_no,
    r.model_code as runtime_model_code,
    r.series_code as canonical_series_code,
    src.*
  from src
  join aiworker.robot_material_model_identifier_canon c
    on c.legacy_material_model_code = src.legacy_material_model_code
   and c.identifier_scope_code = 'SERIES'
   and c.active_flag = true
  join aiworker.model_public_registry r
    on r.series_code = c.series_code
   and r.status_code = 'active'
   and r.app_reference_allowed_flag = true
)
select
  runtime_model_code as model_code,
  public_model_no as model_no,
  registry_code,
  public_model_no,
  runtime_model_code,
  canonical_series_code,
  identifier_scope_code,
  legacy_material_model_code,
  legacy_series_code,
  profile_source_type,
  role_code,
  brain_data_code,
  brain_domain_code,
  brain_domain_label_ja,
  depth_code,
  data_depth_level,
  risk_class_code,
  granularity_code,
  effective_use_purpose_codes,
  access_decision_code,
  source_exists_flag,
  unit_code,
  unit_title_ja,
  unit_summary_ja,
  unit_detail_ja,
  practical_use_ja,
  example_prompt_ja,
  safety_boundary_ja,
  tags,
  material_source_kind,
  source_kind_score,
  full_load_priority,
  domain_priority_score,
  risk_base_score,
  depth_score,
  canon_status,
  reference_tier,
  verification_status,
  source_basis_codes,
  source_caution_ja,
  robot_use_summary_ja,
  misconception_guard_ja,
  lightweight_allowed_flag,
  deep_reference_allowed_flag,
  verified_canon_priority
from model_scope
union all
select
  runtime_model_code as model_code,
  public_model_no as model_no,
  registry_code,
  public_model_no,
  runtime_model_code,
  canonical_series_code,
  identifier_scope_code,
  legacy_material_model_code,
  legacy_series_code,
  profile_source_type,
  role_code,
  brain_data_code,
  brain_domain_code,
  brain_domain_label_ja,
  depth_code,
  data_depth_level,
  risk_class_code,
  granularity_code,
  effective_use_purpose_codes,
  access_decision_code,
  source_exists_flag,
  unit_code,
  unit_title_ja,
  unit_summary_ja,
  unit_detail_ja,
  practical_use_ja,
  example_prompt_ja,
  safety_boundary_ja,
  tags,
  material_source_kind,
  source_kind_score,
  full_load_priority,
  domain_priority_score,
  risk_base_score,
  depth_score,
  canon_status,
  reference_tier,
  verification_status,
  source_basis_codes,
  source_caution_ja,
  robot_use_summary_ja,
  misconception_guard_ja,
  lightweight_allowed_flag,
  deep_reference_allowed_flag,
  verified_canon_priority
from series_scope;





select
  'verify_01_canon_rows' as section,
  identifier_scope_code,
  count(*) as row_count
from aiworker.robot_material_model_identifier_canon
group by identifier_scope_code
order by identifier_scope_code;

select
  'verify_02_unresolved_old_material_codes' as section,
  q.model_code as legacy_material_model_code,
  count(*) as row_count
from aiworker.vw_robot_brain_runtime_material_quality_overlay_v1 q
left join aiworker.robot_material_model_identifier_canon c
  on c.legacy_material_model_code = q.model_code
where c.legacy_material_model_code is null
group by q.model_code
order by row_count desc, q.model_code;

select
  'verify_03_byd2_003_runtime_lookup' as section,
  count(*) as row_count
from aiworker.vw_robot_readable_brain_runtime_material_canon_v1
where model_code = 'byd2_003_asic_leader3';

select
  'verify_04_taika_byd2_003_runtime_lookup' as section,
  count(*) as row_count
from aiworker.vw_robot_readable_brain_runtime_material_canon_v1
where model_code = 'byd2_003_asic_leader3'
  and to_jsonb(vw_robot_readable_brain_runtime_material_canon_v1)::text ilike '%大化%';




