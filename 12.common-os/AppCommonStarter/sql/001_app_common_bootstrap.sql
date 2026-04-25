-- ============================================================
-- CommonOS app_common bootstrap
-- additive-only starter
-- review note: DB apply should be reviewed by 佐藤（DB担当） before real rollout
-- ============================================================

create schema if not exists app_common;

create table if not exists app_common.theme_registry (
  theme_id uuid primary key,
  theme_key text not null unique,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.design_token_set (
  token_set_id uuid primary key,
  token_set_key text not null unique,
  display_name text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.design_token_value (
  token_value_id uuid primary key,
  token_set_id uuid not null references app_common.design_token_set(token_set_id),
  token_name text not null,
  token_value text not null,
  value_type text not null default 'string',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (token_set_id, token_name)
);

create table if not exists app_common.component_catalog (
  component_id uuid primary key,
  component_key text not null unique,
  display_name text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','deprecated')),
  package_name text,
  canonical_scope text not null default 'shared_ui',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.component_variant (
  component_variant_id uuid primary key,
  component_id uuid not null references app_common.component_catalog(component_id),
  variant_key text not null,
  density text,
  emphasis text,
  viewport_behavior text,
  state_display text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (component_id, variant_key)
);

create table if not exists app_common.locale_key (
  locale_key_id uuid primary key,
  locale_namespace text not null,
  locale_key text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale_namespace, locale_key)
);

create table if not exists app_common.locale_translation (
  locale_translation_id uuid primary key,
  locale_key_id uuid not null references app_common.locale_key(locale_key_id),
  locale_code text not null,
  translated_value text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locale_key_id, locale_code)
);

create table if not exists app_common.screen_template (
  screen_template_id uuid primary key,
  template_key text not null unique,
  display_name text not null,
  layout_family text not null,
  status text not null default 'draft' check (status in ('draft','reviewed','published','deprecated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.sync_policy (
  sync_policy_id uuid primary key,
  sync_policy_key text not null unique,
  launch_trigger_enabled boolean not null default true,
  foreground_resume_trigger_enabled boolean not null default true,
  online_recovery_trigger_enabled boolean not null default true,
  manual_sync_trigger_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.retry_policy (
  retry_policy_id uuid primary key,
  retry_policy_key text not null unique,
  max_attempt_count integer not null default 5,
  initial_backoff_seconds integer not null default 30,
  max_backoff_seconds integer not null default 1800,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.queue_visual_rule (
  queue_visual_rule_id uuid primary key,
  queue_visual_rule_key text not null unique,
  pending_label text not null,
  processing_label text not null,
  retry_wait_label text not null,
  sent_label text not null,
  failed_label text not null,
  conflict_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.accessibility_preset (
  accessibility_preset_id uuid primary key,
  preset_key text not null unique,
  keyboard_operable boolean not null default true,
  focus_visibility boolean not null default true,
  semantic_labels boolean not null default true,
  readable_contrast boolean not null default true,
  state_announcement_support boolean not null default true,
  touch_friendly_target boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_common.client_capability_registry (
  capability_id uuid primary key,
  capability_key text not null unique,
  capability_group text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace view app_common.v_published_component_variant as
select
  cc.component_key,
  cv.variant_key,
  cv.density,
  cv.emphasis,
  cv.viewport_behavior,
  cv.state_display
from app_common.component_catalog cc
join app_common.component_variant cv
  on cv.component_id = cc.component_id
where cc.status = 'published'
  and cv.is_active = true;
