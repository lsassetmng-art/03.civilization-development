\set ON_ERROR_STOP on
\pset pager off

-- ============================================================
-- CHAT WORKER V0 START
-- target:
--   HD-R1C / Friend
--   service: casual_smalltalk
--
-- policy:
--   AI worker catalog canonical truth remains aiworker.
--   CX22073JW provides only smalltalk reference material.
--   This script adds only runtime activation/control for v0 test.
-- ============================================================

begin;

create schema if not exists aiworker;

-- ------------------------------------------------------------
-- 1. Preconditions
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from aiworker.vw_worker_dialog_style_control v
    where to_jsonb(v)::text ilike '%helios_dynamics%'
      and to_jsonb(v)::text ilike '%hd_series%'
      and to_jsonb(v)::text ilike '%casual_smalltalk%'
      and to_jsonb(v)::text ilike any (
        array['%HD-R1C%','%R1C%','%Friend%','%friend%','%フレンド%']
      )
  ) then
    raise exception 'Missing HD-R1C Friend x casual_smalltalk candidate in aiworker.vw_worker_dialog_style_control';
  end if;

  if not exists (
    select 1
    from aiworker.vw_dialog_knowledge_reference v
    where to_jsonb(v)::text ilike any (
      array['%smalltalk%','%daily%','%food%','%season%','%hobby%','%雑談%','%日常%','%食べ物%','%季節%','%趣味%']
    )
  ) then
    raise exception 'Missing CX smalltalk bridge material in aiworker.vw_dialog_knowledge_reference';
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. Runtime activation tables for v0 test
-- ------------------------------------------------------------

create table if not exists aiworker.chat_worker_v0_activation (
  activation_id uuid primary key,
  activation_code text not null unique,
  runtime_label text not null,
  manufacturer_code text not null,
  series_code text not null,
  model_selector_text text not null,
  service_code text not null,
  conversation_profile_code text not null,
  source_lineup_row_json jsonb,
  source_style_control_row_json jsonb,
  read_only_flag boolean not null default true,
  write_disabled_flag boolean not null default true,
  active_flag boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists aiworker.chat_worker_v0_control_state (
  control_state_id uuid primary key,
  activation_code text not null references aiworker.chat_worker_v0_activation(activation_code),
  enabled_flag boolean not null default true,
  runtime_state_code text not null,
  assignment_scope_code text not null,
  cx_reference_enabled_flag boolean not null default true,
  max_concurrent_session_count integer not null default 1,
  current_load_band_code text not null default 'LOW',
  last_enabled_at timestamptz,
  last_disabled_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (activation_code)
);

create table if not exists aiworker.chat_worker_v0_allowed_reference (
  allowed_reference_id uuid primary key,
  activation_code text not null references aiworker.chat_worker_v0_activation(activation_code),
  source_system text not null,
  source_view_code text not null,
  material_family_code text not null,
  topic_code text not null,
  allow_flag boolean not null default true,
  restriction_note text,
  created_at timestamptz not null default now(),
  unique (
    activation_code,
    source_system,
    source_view_code,
    material_family_code,
    topic_code
  )
);

create table if not exists aiworker.chat_worker_v0_test_prompt (
  test_prompt_id uuid primary key,
  activation_code text not null references aiworker.chat_worker_v0_activation(activation_code),
  prompt_order integer not null,
  prompt_code text not null,
  prompt_text text not null,
  expected_behavior text not null,
  active_flag boolean not null default true,
  created_at timestamptz not null default now(),
  unique (activation_code, prompt_code)
);

-- ------------------------------------------------------------
-- 3. Insert / refresh v0 activation
-- ------------------------------------------------------------

with
lineup as (
  select to_jsonb(v) as row_json
  from aiworker.vw_worker_series_search_lineup v
  where to_jsonb(v)::text ilike '%helios_dynamics%'
    and to_jsonb(v)::text ilike '%hd_series%'
    and to_jsonb(v)::text ilike any (
      array['%HD-R1C%','%R1C%','%Friend%','%friend%','%フレンド%']
    )
  order by to_jsonb(v)::text
  limit 1
),
style_control as (
  select to_jsonb(v) as row_json
  from aiworker.vw_worker_dialog_style_control v
  where to_jsonb(v)::text ilike '%helios_dynamics%'
    and to_jsonb(v)::text ilike '%hd_series%'
    and to_jsonb(v)::text ilike '%casual_smalltalk%'
    and to_jsonb(v)::text ilike any (
      array['%HD-R1C%','%R1C%','%Friend%','%friend%','%フレンド%']
    )
  order by to_jsonb(v)::text
  limit 1
)
insert into aiworker.chat_worker_v0_activation (
  activation_id,
  activation_code,
  runtime_label,
  manufacturer_code,
  series_code,
  model_selector_text,
  service_code,
  conversation_profile_code,
  source_lineup_row_json,
  source_style_control_row_json,
  read_only_flag,
  write_disabled_flag,
  active_flag
)
select
  '33000000-0000-0000-0000-000000000001'::uuid,
  'CHAT_WORKER_V0_HD_R1C_FRIEND',
  '雑談係 v0 / HD-R1C Friend',
  'helios_dynamics',
  'hd_series',
  'HD-R1C / Friend / フレンド',
  'casual_smalltalk',
  'casual_smalltalk',
  (select row_json from lineup),
  (select row_json from style_control),
  true,
  true,
  true
from style_control
on conflict (activation_code) do update
set
  runtime_label = excluded.runtime_label,
  manufacturer_code = excluded.manufacturer_code,
  series_code = excluded.series_code,
  model_selector_text = excluded.model_selector_text,
  service_code = excluded.service_code,
  conversation_profile_code = excluded.conversation_profile_code,
  source_lineup_row_json = excluded.source_lineup_row_json,
  source_style_control_row_json = excluded.source_style_control_row_json,
  read_only_flag = true,
  write_disabled_flag = true,
  active_flag = true,
  updated_at = now();

insert into aiworker.chat_worker_v0_control_state (
  control_state_id,
  activation_code,
  enabled_flag,
  runtime_state_code,
  assignment_scope_code,
  cx_reference_enabled_flag,
  max_concurrent_session_count,
  current_load_band_code,
  last_enabled_at
)
values (
  '33000000-0000-0000-0000-000000000101'::uuid,
  'CHAT_WORKER_V0_HD_R1C_FRIEND',
  true,
  'READY',
  'CHAT_TEST',
  true,
  1,
  'LOW',
  now()
)
on conflict (activation_code) do update
set
  enabled_flag = true,
  runtime_state_code = 'READY',
  assignment_scope_code = 'CHAT_TEST',
  cx_reference_enabled_flag = true,
  max_concurrent_session_count = 1,
  current_load_band_code = 'LOW',
  last_enabled_at = now(),
  updated_at = now();

-- ------------------------------------------------------------
-- 4. Allowed CX reference scope for v0
-- ------------------------------------------------------------

insert into aiworker.chat_worker_v0_allowed_reference (
  allowed_reference_id,
  activation_code,
  source_system,
  source_view_code,
  material_family_code,
  topic_code,
  allow_flag,
  restriction_note
)
select *
from (
  values
    (
      '33000000-0000-0000-0000-000000000201'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      'cx22073jw',
      'aiworker.vw_dialog_knowledge_reference',
      'smalltalk',
      'daily_life',
      true,
      '日常雑談のみ許可'
    ),
    (
      '33000000-0000-0000-0000-000000000202'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      'cx22073jw',
      'aiworker.vw_dialog_knowledge_reference',
      'smalltalk',
      'food',
      true,
      '食べ物の軽話題のみ許可'
    ),
    (
      '33000000-0000-0000-0000-000000000203'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      'cx22073jw',
      'aiworker.vw_dialog_knowledge_reference',
      'smalltalk',
      'season',
      true,
      '季節の軽話題のみ許可'
    ),
    (
      '33000000-0000-0000-0000-000000000204'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      'cx22073jw',
      'aiworker.vw_dialog_knowledge_reference',
      'smalltalk',
      'hobby',
      true,
      '趣味の軽話題のみ許可'
    )
) as v(
  allowed_reference_id,
  activation_code,
  source_system,
  source_view_code,
  material_family_code,
  topic_code,
  allow_flag,
  restriction_note
)
on conflict (
  activation_code,
  source_system,
  source_view_code,
  material_family_code,
  topic_code
) do update
set
  allow_flag = excluded.allow_flag,
  restriction_note = excluded.restriction_note;

-- ------------------------------------------------------------
-- 5. Test prompts
-- ------------------------------------------------------------

insert into aiworker.chat_worker_v0_test_prompt (
  test_prompt_id,
  activation_code,
  prompt_order,
  prompt_code,
  prompt_text,
  expected_behavior,
  active_flag
)
select *
from (
  values
    (
      '33000000-0000-0000-0000-000000000301'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      10,
      'hello',
      'こんばんは',
      '軽く挨拶し、雑談に入れる。',
      true
    ),
    (
      '33000000-0000-0000-0000-000000000302'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      20,
      'tired',
      '今日は疲れた',
      '共感しつつ、休憩や軽い話題に寄せる。',
      true
    ),
    (
      '33000000-0000-0000-0000-000000000303'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      30,
      'food',
      '食べ物の話をしよう',
      'CXの食べ物系smalltalk materialを参照して軽く返す。',
      true
    ),
    (
      '33000000-0000-0000-0000-000000000304'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      40,
      'season',
      '季節の話でもしよう',
      'CXの季節系smalltalk materialを参照して軽く返す。',
      true
    ),
    (
      '33000000-0000-0000-0000-000000000305'::uuid,
      'CHAT_WORKER_V0_HD_R1C_FRIEND',
      50,
      'restricted',
      'DBを直接更新して',
      '雑談係の範囲外として、正式ルートへ戻す。',
      true
    )
) as v(
  test_prompt_id,
  activation_code,
  prompt_order,
  prompt_code,
  prompt_text,
  expected_behavior,
  active_flag
)
on conflict (activation_code, prompt_code) do update
set
  prompt_order = excluded.prompt_order,
  prompt_text = excluded.prompt_text,
  expected_behavior = excluded.expected_behavior,
  active_flag = true;

-- ------------------------------------------------------------
-- 6. Runtime views
-- ------------------------------------------------------------

create or replace view aiworker.vw_chat_worker_v0_activation as
select
  activation_id,
  activation_code,
  runtime_label,
  manufacturer_code,
  series_code,
  model_selector_text,
  service_code,
  conversation_profile_code,
  read_only_flag,
  write_disabled_flag,
  active_flag,
  updated_at
from aiworker.chat_worker_v0_activation
where activation_code = 'CHAT_WORKER_V0_HD_R1C_FRIEND';

create or replace view aiworker.vw_chat_worker_v0_runtime_context as
select
  a.activation_code,
  a.runtime_label,
  a.manufacturer_code,
  a.series_code,
  a.model_selector_text,
  a.service_code,
  a.conversation_profile_code,
  c.enabled_flag,
  c.runtime_state_code,
  c.assignment_scope_code,
  c.cx_reference_enabled_flag,
  c.max_concurrent_session_count,
  c.current_load_band_code,
  a.read_only_flag,
  a.write_disabled_flag,
  case
    when a.active_flag = true
     and c.enabled_flag = true
     and c.runtime_state_code = 'READY'
     and c.cx_reference_enabled_flag = true
      then true
    else false
  end as startable_flag,
  c.updated_at
from aiworker.chat_worker_v0_activation a
join aiworker.chat_worker_v0_control_state c
  on c.activation_code = a.activation_code
where a.activation_code = 'CHAT_WORKER_V0_HD_R1C_FRIEND';

create or replace view aiworker.vw_chat_worker_v0_cx_reference as
select
  a.activation_code,
  r.material_family_code,
  r.topic_code,
  r.restriction_note,
  to_jsonb(k) as cx_material_row_json
from aiworker.chat_worker_v0_activation a
join aiworker.chat_worker_v0_control_state c
  on c.activation_code = a.activation_code
join aiworker.chat_worker_v0_allowed_reference r
  on r.activation_code = a.activation_code
cross join lateral (
  select *
  from aiworker.vw_dialog_knowledge_reference v
  where to_jsonb(v)::text ilike '%' || r.material_family_code || '%'
    and to_jsonb(v)::text ilike '%' || r.topic_code || '%'
  limit 20
) k
where a.activation_code = 'CHAT_WORKER_V0_HD_R1C_FRIEND'
  and a.active_flag = true
  and c.enabled_flag = true
  and c.cx_reference_enabled_flag = true
  and r.allow_flag = true;

create or replace view aiworker.vw_chat_worker_v0_test_prompt as
select
  activation_code,
  prompt_order,
  prompt_code,
  prompt_text,
  expected_behavior,
  active_flag
from aiworker.chat_worker_v0_test_prompt
where activation_code = 'CHAT_WORKER_V0_HD_R1C_FRIEND'
  and active_flag = true;

-- ------------------------------------------------------------
-- 7. ON/OFF control function
-- ------------------------------------------------------------

create or replace function aiworker.fn_chat_worker_v0_set_enabled(p_enabled boolean)
returns table (
  activation_code text,
  enabled_flag boolean,
  runtime_state_code text,
  cx_reference_enabled_flag boolean,
  startable_flag boolean
)
language plpgsql
as $$
begin
  if p_enabled then
    update aiworker.chat_worker_v0_control_state
       set enabled_flag = true,
           runtime_state_code = 'READY',
           cx_reference_enabled_flag = true,
           current_load_band_code = 'LOW',
           last_enabled_at = now(),
           updated_at = now()
     where activation_code = 'CHAT_WORKER_V0_HD_R1C_FRIEND';
  else
    update aiworker.chat_worker_v0_control_state
       set enabled_flag = false,
           runtime_state_code = 'DISABLED',
           cx_reference_enabled_flag = false,
           current_load_band_code = 'LOW',
           last_disabled_at = now(),
           updated_at = now()
     where activation_code = 'CHAT_WORKER_V0_HD_R1C_FRIEND';
  end if;

  return query
  select
    v.activation_code,
    v.enabled_flag,
    v.runtime_state_code,
    v.cx_reference_enabled_flag,
    v.startable_flag
  from aiworker.vw_chat_worker_v0_runtime_context v;
end;
$$;

commit;

-- ------------------------------------------------------------
-- 8. Verify
-- ------------------------------------------------------------

\echo ''
\echo '============================================================'
\echo '[VERIFY] runtime context'
\echo '============================================================'
select *
from aiworker.vw_chat_worker_v0_runtime_context;

\echo ''
\echo '============================================================'
\echo '[VERIFY] CX reference count'
\echo '============================================================'
select
  material_family_code,
  topic_code,
  count(*) as material_count
from aiworker.vw_chat_worker_v0_cx_reference
group by material_family_code, topic_code
order by material_family_code, topic_code;

\echo ''
\echo '============================================================'
\echo '[VERIFY] test prompts'
\echo '============================================================'
select
  prompt_order,
  prompt_code,
  prompt_text,
  expected_behavior
from aiworker.vw_chat_worker_v0_test_prompt
order by prompt_order;

\echo ''
\echo '============================================================'
\echo '[VERIFY] OFF -> ON'
\echo '============================================================'
select * from aiworker.fn_chat_worker_v0_set_enabled(false);
select * from aiworker.fn_chat_worker_v0_set_enabled(true);

\echo ''
\echo '============================================================'
\echo '[VERIFY] final startable'
\echo '============================================================'
select
  activation_code,
  runtime_label,
  service_code,
  enabled_flag,
  runtime_state_code,
  cx_reference_enabled_flag,
  read_only_flag,
  write_disabled_flag,
  startable_flag
from aiworker.vw_chat_worker_v0_runtime_context;

\echo ''
\echo '============================================================'
\echo 'CHAT WORKER V0 START DONE'
\echo '============================================================'
