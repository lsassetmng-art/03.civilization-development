-- ============================================================
-- BusinessOS WorkerRentalCore
-- Generic worker rental core DDL
-- App-specific max duration / app-specific price / shortest-contract free ticket
-- ============================================================
-- status: apply-package-generated
-- db_owner_schema: business
-- execution_env: PERSONA_DATABASE_URL
-- reviewed_by: 佐藤（DB担当）レビュー対象
--
-- Generic core:
-- - supports minute / hour / day / month / year
-- - generic maximum duration can support up to 2 years
--
-- App-specific rule:
-- - each app/service defines its own supported units, min contract, max contract, and prices
-- - CasualChatWorker max contract is 120 minutes
-- - prices are app-specific via app_code / service_code
--
-- Monthly free ticket rule:
-- - monthly free ticket makes the shortest contract duration of that app free
-- - CasualChatWorker shortest contract = 30 minutes
-- - therefore CasualChatWorker 1 free ticket = 30 minutes free
-- - another app may define 10 minutes, 60 minutes, etc.
-- ============================================================

create extension if not exists pgcrypto;

create schema if not exists business;

create or replace function business.worker_rental_unit_to_minutes(
  p_unit_kind text,
  p_unit_count integer
)
returns integer
language plpgsql
immutable
as $$
begin
  if p_unit_count is null or p_unit_count < 0 then
    raise exception 'unit_count must be non-negative';
  end if;

  if p_unit_kind = 'minute' then
    return p_unit_count;
  elsif p_unit_kind = 'hour' then
    return p_unit_count * 60;
  elsif p_unit_kind = 'day' then
    return p_unit_count * 1440;
  elsif p_unit_kind = 'month' then
    return p_unit_count * 43800;
  elsif p_unit_kind = 'year' then
    return p_unit_count * 525600;
  else
    raise exception 'unsupported rental unit kind: %', p_unit_kind;
  end if;
end;
$$;

create table if not exists business.worker_rental_unit_policy (
  rental_unit_kind text primary key check (rental_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  display_name text not null,
  max_unit_count integer not null check (max_unit_count > 0),
  max_total_minutes integer not null check (max_total_minutes > 0),
  max_human_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into business.worker_rental_unit_policy (
  rental_unit_kind,
  display_name,
  max_unit_count,
  max_total_minutes,
  max_human_label,
  is_active
)
values
  ('minute', '分', 1051200, 1051200, '最大2年相当', true),
  ('hour', '時間', 17520, 1051200, '最大17,520時間 / 2年相当', true),
  ('day', '日', 730, 1051200, '最大730日 / 2年相当', true),
  ('month', '月', 24, 1051200, '最大24か月 / 2年', true),
  ('year', '年', 2, 1051200, '最大2年', true)
on conflict (rental_unit_kind)
do update set
  display_name = excluded.display_name,
  max_unit_count = excluded.max_unit_count,
  max_total_minutes = excluded.max_total_minutes,
  max_human_label = excluded.max_human_label,
  is_active = excluded.is_active,
  updated_at = now();

create table if not exists business.worker_rental_service_catalog (
  service_catalog_id uuid primary key default gen_random_uuid(),

  app_code text not null,
  service_code text not null,
  service_name text not null,
  service_category text not null default 'worker_rental',
  worker_owner_schema text not null default 'aiworker',
  service_description text,

  supports_minute boolean not null default false,
  supports_hour boolean not null default false,
  supports_day boolean not null default false,
  supports_month boolean not null default false,
  supports_year boolean not null default false,

  minimum_contract_unit_kind text not null check (minimum_contract_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  minimum_contract_unit_count integer not null check (minimum_contract_unit_count > 0),

  app_max_contract_unit_kind text not null check (app_max_contract_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  app_max_contract_unit_count integer not null check (app_max_contract_unit_count > 0),

  generic_max_rental_years integer not null default 2 check (generic_max_rental_years = 2),

  monthly_free_ticket_enabled boolean not null default false,
  monthly_free_ticket_quantity integer not null default 0 check (monthly_free_ticket_quantity >= 0),
  monthly_free_ticket_source_rule text not null default 'none'
    check (monthly_free_ticket_source_rule in ('none', 'shortest_contract_duration')),
  monthly_free_ticket_unit_kind text not null default 'minute'
    check (monthly_free_ticket_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  monthly_free_ticket_unit_count integer not null default 0 check (monthly_free_ticket_unit_count >= 0),
  monthly_free_ticket_carryover_enabled boolean not null default false,

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (app_code, service_code),

  check (
    (supports_minute = true or supports_hour = true or supports_day = true or supports_month = true or supports_year = true)
  ),

  check (
    (minimum_contract_unit_kind = 'minute' and supports_minute = true)
    or (minimum_contract_unit_kind = 'hour' and supports_hour = true)
    or (minimum_contract_unit_kind = 'day' and supports_day = true)
    or (minimum_contract_unit_kind = 'month' and supports_month = true)
    or (minimum_contract_unit_kind = 'year' and supports_year = true)
  ),

  check (
    (app_max_contract_unit_kind = 'minute' and supports_minute = true)
    or (app_max_contract_unit_kind = 'hour' and supports_hour = true)
    or (app_max_contract_unit_kind = 'day' and supports_day = true)
    or (app_max_contract_unit_kind = 'month' and supports_month = true)
    or (app_max_contract_unit_kind = 'year' and supports_year = true)
  ),

  check (
    business.worker_rental_unit_to_minutes(minimum_contract_unit_kind, minimum_contract_unit_count)
    <= business.worker_rental_unit_to_minutes(app_max_contract_unit_kind, app_max_contract_unit_count)
  ),

  check (
    business.worker_rental_unit_to_minutes(app_max_contract_unit_kind, app_max_contract_unit_count)
    <= 1051200
  ),

  check (
    (
      monthly_free_ticket_enabled = false
      and monthly_free_ticket_quantity = 0
      and monthly_free_ticket_source_rule = 'none'
      and monthly_free_ticket_unit_count = 0
    )
    or
    (
      monthly_free_ticket_enabled = true
      and monthly_free_ticket_quantity > 0
      and monthly_free_ticket_source_rule = 'shortest_contract_duration'
      and monthly_free_ticket_unit_kind = minimum_contract_unit_kind
      and monthly_free_ticket_unit_count = minimum_contract_unit_count
    )
  )
);

create table if not exists business.worker_rental_price_catalog (
  price_catalog_id uuid primary key default gen_random_uuid(),

  app_code text not null,
  service_code text not null,
  price_version text not null default 'v1',

  worker_owner_schema text not null default 'aiworker',
  worker_type_scope text not null default 'ALL',
  worker_id_scope text not null default 'ALL',

  rental_unit_kind text not null check (rental_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  rental_unit_count integer not null check (rental_unit_count > 0),

  base_price_jpy integer not null check (base_price_jpy >= 0),
  currency_code text not null default 'JPY',

  is_active boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (app_code, service_code, price_version, worker_type_scope, worker_id_scope, rental_unit_kind, rental_unit_count),

  check (
    (rental_unit_kind = 'minute' and rental_unit_count between 1 and 1051200)
    or (rental_unit_kind = 'hour' and rental_unit_count between 1 and 17520)
    or (rental_unit_kind = 'day' and rental_unit_count between 1 and 730)
    or (rental_unit_kind = 'month' and rental_unit_count between 1 and 24)
    or (rental_unit_kind = 'year' and rental_unit_count between 1 and 2)
  )
);

create table if not exists business.worker_rental_contract (
  rental_contract_id uuid primary key default gen_random_uuid(),

  app_code text not null,
  service_code text not null,
  user_id uuid not null,

  worker_owner_schema text not null default 'aiworker',
  worker_id text not null,
  worker_type text not null,
  worker_snapshot_id text,

  rental_unit_kind text not null check (rental_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  rental_unit_count integer not null check (rental_unit_count > 0),

  rental_starts_at timestamptz,
  rental_ends_at timestamptz,

  base_price_jpy integer not null check (base_price_jpy >= 0),
  applied_entitlement_count integer not null default 0 check (applied_entitlement_count >= 0),
  free_unit_count integer not null default 0 check (free_unit_count >= 0),
  paid_unit_count integer not null default 0 check (paid_unit_count >= 0),
  final_price_jpy integer not null check (final_price_jpy >= 0),

  contract_status text not null default 'draft'
    check (contract_status in ('draft', 'quoted', 'confirmed', 'active', 'paused', 'ended', 'cancelled', 'failed', 'pending_review')),

  price_version text not null default 'v1',
  locale text not null default 'ja',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    (rental_unit_kind = 'minute' and rental_unit_count between 1 and 1051200)
    or (rental_unit_kind = 'hour' and rental_unit_count between 1 and 17520)
    or (rental_unit_kind = 'day' and rental_unit_count between 1 and 730)
    or (rental_unit_kind = 'month' and rental_unit_count between 1 and 24)
    or (rental_unit_kind = 'year' and rental_unit_count between 1 and 2)
  )
);

create or replace function business.enforce_worker_rental_contract_service_limits()
returns trigger
language plpgsql
as $$
declare
  svc record;
  requested_minutes integer;
  min_minutes integer;
  max_minutes integer;
begin
  select *
    into svc
  from business.worker_rental_service_catalog
  where app_code = new.app_code
    and service_code = new.service_code
    and is_active = true;

  if not found then
    raise exception 'active worker rental service not found: %.%', new.app_code, new.service_code;
  end if;

  if new.rental_unit_kind = 'minute' and svc.supports_minute = false then
    raise exception 'service %.% does not support minute rental', new.app_code, new.service_code;
  end if;

  if new.rental_unit_kind = 'hour' and svc.supports_hour = false then
    raise exception 'service %.% does not support hour rental', new.app_code, new.service_code;
  end if;

  if new.rental_unit_kind = 'day' and svc.supports_day = false then
    raise exception 'service %.% does not support day rental', new.app_code, new.service_code;
  end if;

  if new.rental_unit_kind = 'month' and svc.supports_month = false then
    raise exception 'service %.% does not support month rental', new.app_code, new.service_code;
  end if;

  if new.rental_unit_kind = 'year' and svc.supports_year = false then
    raise exception 'service %.% does not support year rental', new.app_code, new.service_code;
  end if;

  requested_minutes := business.worker_rental_unit_to_minutes(new.rental_unit_kind, new.rental_unit_count);
  min_minutes := business.worker_rental_unit_to_minutes(svc.minimum_contract_unit_kind, svc.minimum_contract_unit_count);
  max_minutes := business.worker_rental_unit_to_minutes(svc.app_max_contract_unit_kind, svc.app_max_contract_unit_count);

  if requested_minutes < min_minutes then
    raise exception 'rental contract below app minimum: requested=% minutes, minimum=% minutes', requested_minutes, min_minutes;
  end if;

  if requested_minutes > max_minutes then
    raise exception 'rental contract exceeds app maximum: requested=% minutes, maximum=% minutes', requested_minutes, max_minutes;
  end if;

  if requested_minutes > 1051200 then
    raise exception 'rental contract exceeds generic maximum 2 years';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_worker_rental_contract_service_limits
on business.worker_rental_contract;

create trigger trg_enforce_worker_rental_contract_service_limits
before insert or update of app_code, service_code, rental_unit_kind, rental_unit_count
on business.worker_rental_contract
for each row
execute function business.enforce_worker_rental_contract_service_limits();

create table if not exists business.worker_rental_contract_line (
  rental_contract_line_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  line_type text not null check (line_type in ('base_rental', 'entitlement_discount', 'payment', 'adjustment')),
  rental_unit_kind text not null check (rental_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  rental_unit_count integer not null default 0 check (rental_unit_count >= 0),
  quantity integer not null default 1 check (quantity >= 0),
  unit_price_jpy integer not null default 0 check (unit_price_jpy >= 0),
  amount_jpy integer not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists business.worker_rental_period (
  rental_period_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  user_id uuid not null,
  worker_owner_schema text not null default 'aiworker',
  worker_id text not null,
  worker_type text not null,
  period_status text not null default 'scheduled' check (period_status in ('scheduled', 'active', 'paused', 'ended', 'failed', 'pending_review')),
  starts_at timestamptz,
  ends_at timestamptz,
  actual_started_at timestamptz,
  actual_ended_at timestamptz,
  remaining_seconds_snapshot integer not null default 0 check (remaining_seconds_snapshot >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business.worker_rental_usage_log (
  rental_usage_log_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  rental_period_id uuid references business.worker_rental_period(rental_period_id) on delete restrict,
  app_code text not null,
  service_code text not null,
  user_id uuid not null,
  worker_owner_schema text not null default 'aiworker',
  worker_id text not null,
  worker_type text not null,
  usage_unit_kind text not null check (usage_unit_kind in ('minute', 'hour', 'day', 'month', 'year', 'event')),
  usage_unit_count integer not null default 0 check (usage_unit_count >= 0),
  usage_seconds integer not null default 0 check (usage_seconds >= 0),
  event_count integer not null default 0 check (event_count >= 0),
  safety_event_count integer not null default 0 check (safety_event_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists business.worker_rental_payment_intent (
  rental_payment_intent_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  user_id uuid not null,
  amount_jpy integer not null check (amount_jpy >= 0),
  currency_code text not null default 'JPY',
  payment_status text not null default 'not_required' check (payment_status in ('not_required', 'pending', 'authorized', 'captured', 'failed', 'refunded_candidate')),
  provider_code text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business.worker_rental_status_history (
  rental_status_history_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  from_status text,
  to_status text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists business.worker_rental_safety_event (
  rental_safety_event_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid references business.worker_rental_contract(rental_contract_id) on delete restrict,
  rental_period_id uuid references business.worker_rental_period(rental_period_id) on delete restrict,
  app_code text not null,
  service_code text not null,
  user_id uuid not null,
  worker_owner_schema text not null default 'aiworker',
  worker_id text not null,
  worker_type text not null,
  safety_state text not null check (safety_state in ('normal', 'soft_redirect', 'hard_block', 'period_review', 'forced_end_candidate')),
  safety_code text not null,
  event_summary text,
  created_at timestamptz not null default now()
);

create table if not exists business.worker_rental_end_summary (
  rental_end_summary_id uuid primary key default gen_random_uuid(),
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  rental_period_id uuid references business.worker_rental_period(rental_period_id) on delete restrict,
  app_code text not null,
  service_code text not null,
  user_id uuid not null,
  worker_owner_schema text not null default 'aiworker',
  worker_id text not null,
  worker_type text not null,
  ended_reason text not null default 'normal' check (ended_reason in ('normal', 'manual', 'time_expired', 'period_expired', 'safety', 'failed')),
  used_seconds integer not null default 0 check (used_seconds >= 0),
  summary_text text,
  created_at timestamptz not null default now()
);

create table if not exists business.worker_rental_entitlement_grant (
  entitlement_grant_id uuid primary key default gen_random_uuid(),

  app_code text not null,
  service_code text not null,
  user_id uuid not null,
  grant_period text not null,

  entitlement_kind text not null default 'monthly_shortest_contract_free_ticket',
  entitlement_source_rule text not null default 'shortest_contract_duration'
    check (entitlement_source_rule in ('shortest_contract_duration', 'manual_adjustment')),

  entitlement_unit_kind text not null check (entitlement_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  entitlement_unit_count integer not null check (entitlement_unit_count > 0),

  granted_quantity integer not null check (granted_quantity > 0),
  total_granted_units integer not null check (total_granted_units > 0),

  carryover_enabled boolean not null default false,
  grant_status text not null default 'granted' check (grant_status in ('granted', 'revoked', 'expired')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (app_code, service_code, user_id, grant_period, entitlement_kind),

  check (total_granted_units = granted_quantity * entitlement_unit_count)
);

create table if not exists business.worker_rental_entitlement_balance (
  entitlement_balance_id uuid primary key default gen_random_uuid(),

  entitlement_grant_id uuid references business.worker_rental_entitlement_grant(entitlement_grant_id) on delete restrict,
  app_code text not null,
  service_code text not null,
  user_id uuid not null,
  grant_period text not null,

  entitlement_kind text not null default 'monthly_shortest_contract_free_ticket',
  entitlement_source_rule text not null default 'shortest_contract_duration'
    check (entitlement_source_rule in ('shortest_contract_duration', 'manual_adjustment')),

  entitlement_unit_kind text not null check (entitlement_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  entitlement_unit_count integer not null check (entitlement_unit_count > 0),

  granted_quantity integer not null check (granted_quantity > 0),
  used_quantity integer not null default 0 check (used_quantity >= 0),
  remaining_quantity integer not null check (remaining_quantity >= 0),
  remaining_total_units integer not null check (remaining_total_units >= 0),

  balance_status text not null default 'active' check (balance_status in ('active', 'expired', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (app_code, service_code, user_id, grant_period, entitlement_kind),

  check (used_quantity + remaining_quantity = granted_quantity),
  check (remaining_total_units = remaining_quantity * entitlement_unit_count)
);

create table if not exists business.worker_rental_entitlement_usage (
  entitlement_usage_id uuid primary key default gen_random_uuid(),

  entitlement_grant_id uuid references business.worker_rental_entitlement_grant(entitlement_grant_id) on delete restrict,
  entitlement_balance_id uuid references business.worker_rental_entitlement_balance(entitlement_balance_id) on delete restrict,
  rental_contract_id uuid not null references business.worker_rental_contract(rental_contract_id) on delete restrict,
  rental_period_id uuid references business.worker_rental_period(rental_period_id) on delete restrict,

  app_code text not null,
  service_code text not null,
  user_id uuid not null,

  entitlement_kind text not null default 'monthly_shortest_contract_free_ticket',
  entitlement_source_rule text not null default 'shortest_contract_duration'
    check (entitlement_source_rule in ('shortest_contract_duration', 'manual_adjustment')),

  used_quantity integer not null check (used_quantity >= 0),
  used_unit_kind text not null check (used_unit_kind in ('minute', 'hour', 'day', 'month', 'year')),
  used_unit_count integer not null check (used_unit_count >= 0),

  discounted_amount_jpy integer not null default 0 check (discounted_amount_jpy >= 0),
  final_price_jpy integer not null check (final_price_jpy >= 0),
  usage_status text not null default 'reserved' check (usage_status in ('reserved', 'consumed', 'reverted')),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_worker_rental_service_catalog_active
  on business.worker_rental_service_catalog(app_code, service_code, is_active);

create index if not exists idx_worker_rental_price_catalog_active
  on business.worker_rental_price_catalog(app_code, service_code, rental_unit_kind, rental_unit_count, is_active);

create index if not exists idx_worker_rental_contract_user_created
  on business.worker_rental_contract(app_code, service_code, user_id, created_at desc);

create index if not exists idx_worker_rental_contract_worker
  on business.worker_rental_contract(worker_owner_schema, worker_id, created_at desc);

create index if not exists idx_worker_rental_period_contract
  on business.worker_rental_period(rental_contract_id);

create index if not exists idx_worker_rental_usage_contract
  on business.worker_rental_usage_log(rental_contract_id, rental_period_id);

create index if not exists idx_worker_rental_payment_contract
  on business.worker_rental_payment_intent(rental_contract_id);

create index if not exists idx_worker_rental_safety_contract
  on business.worker_rental_safety_event(rental_contract_id, created_at desc);

create index if not exists idx_worker_rental_entitlement_balance_user
  on business.worker_rental_entitlement_balance(app_code, service_code, user_id, grant_period);

create index if not exists idx_worker_rental_entitlement_usage_contract
  on business.worker_rental_entitlement_usage(rental_contract_id);

insert into business.worker_rental_service_catalog (
  app_code,
  service_code,
  service_name,
  service_category,
  worker_owner_schema,
  service_description,

  supports_minute,
  supports_hour,
  supports_day,
  supports_month,
  supports_year,

  minimum_contract_unit_kind,
  minimum_contract_unit_count,
  app_max_contract_unit_kind,
  app_max_contract_unit_count,

  generic_max_rental_years,

  monthly_free_ticket_enabled,
  monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count,
  monthly_free_ticket_carryover_enabled,

  is_active
)
values
  (
    'CasualChatWorker',
    'casual_chat_worker',
    '雑談ワーカー',
    'worker_rental',
    'aiworker',
    'Friend / Lover AIワーカーの時間契約型雑談サービス。このアプリでは最大2時間まで。月初無料チケットは最短契約時間30分を1回分無料にする。',

    true,
    false,
    false,
    false,
    false,

    'minute',
    30,
    'minute',
    120,

    2,

    true,
    2,
    'shortest_contract_duration',
    'minute',
    30,
    false,

    true
  )
on conflict (app_code, service_code)
do update set
  service_name = excluded.service_name,
  service_category = excluded.service_category,
  worker_owner_schema = excluded.worker_owner_schema,
  service_description = excluded.service_description,

  supports_minute = excluded.supports_minute,
  supports_hour = excluded.supports_hour,
  supports_day = excluded.supports_day,
  supports_month = excluded.supports_month,
  supports_year = excluded.supports_year,

  minimum_contract_unit_kind = excluded.minimum_contract_unit_kind,
  minimum_contract_unit_count = excluded.minimum_contract_unit_count,
  app_max_contract_unit_kind = excluded.app_max_contract_unit_kind,
  app_max_contract_unit_count = excluded.app_max_contract_unit_count,

  generic_max_rental_years = excluded.generic_max_rental_years,

  monthly_free_ticket_enabled = excluded.monthly_free_ticket_enabled,
  monthly_free_ticket_quantity = excluded.monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule = excluded.monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind = excluded.monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count = excluded.monthly_free_ticket_unit_count,
  monthly_free_ticket_carryover_enabled = excluded.monthly_free_ticket_carryover_enabled,

  is_active = excluded.is_active,
  updated_at = now();

insert into business.worker_rental_price_catalog (
  app_code,
  service_code,
  price_version,
  worker_owner_schema,
  worker_type_scope,
  worker_id_scope,
  rental_unit_kind,
  rental_unit_count,
  base_price_jpy,
  currency_code,
  is_active
)
values
  ('CasualChatWorker', 'casual_chat_worker', 'v1', 'aiworker', 'ALL', 'ALL', 'minute', 30, 500, 'JPY', true),
  ('CasualChatWorker', 'casual_chat_worker', 'v1', 'aiworker', 'ALL', 'ALL', 'minute', 60, 1000, 'JPY', true),
  ('CasualChatWorker', 'casual_chat_worker', 'v1', 'aiworker', 'ALL', 'ALL', 'minute', 90, 1500, 'JPY', true),
  ('CasualChatWorker', 'casual_chat_worker', 'v1', 'aiworker', 'ALL', 'ALL', 'minute', 120, 2000, 'JPY', true)
on conflict (app_code, service_code, price_version, worker_type_scope, worker_id_scope, rental_unit_kind, rental_unit_count)
do update set
  base_price_jpy = excluded.base_price_jpy,
  currency_code = excluded.currency_code,
  is_active = excluded.is_active,
  updated_at = now();

create or replace view business.v_worker_rental_service_catalog_active as
select
  service_catalog_id,
  app_code,
  service_code,
  service_name,
  service_category,
  worker_owner_schema,
  supports_minute,
  supports_hour,
  supports_day,
  supports_month,
  supports_year,
  minimum_contract_unit_kind,
  minimum_contract_unit_count,
  app_max_contract_unit_kind,
  app_max_contract_unit_count,
  business.worker_rental_unit_to_minutes(minimum_contract_unit_kind, minimum_contract_unit_count) as minimum_contract_minutes,
  business.worker_rental_unit_to_minutes(app_max_contract_unit_kind, app_max_contract_unit_count) as app_max_contract_minutes,
  monthly_free_ticket_enabled,
  monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count,
  monthly_free_ticket_carryover_enabled,
  is_active
from business.worker_rental_service_catalog
where is_active = true;

create or replace view business.v_worker_rental_monthly_free_ticket_rule as
select
  app_code,
  service_code,
  service_name,
  monthly_free_ticket_enabled,
  monthly_free_ticket_quantity,
  monthly_free_ticket_source_rule,
  monthly_free_ticket_unit_kind,
  monthly_free_ticket_unit_count,
  business.worker_rental_unit_to_minutes(monthly_free_ticket_unit_kind, monthly_free_ticket_unit_count) as free_ticket_minutes_each,
  monthly_free_ticket_quantity * business.worker_rental_unit_to_minutes(monthly_free_ticket_unit_kind, monthly_free_ticket_unit_count) as free_ticket_minutes_total,
  monthly_free_ticket_carryover_enabled
from business.worker_rental_service_catalog
where is_active = true
  and monthly_free_ticket_enabled = true;

create or replace view business.v_worker_rental_price_catalog_active as
select
  price_catalog_id,
  app_code,
  service_code,
  price_version,
  worker_owner_schema,
  worker_type_scope,
  worker_id_scope,
  rental_unit_kind,
  rental_unit_count,
  business.worker_rental_unit_to_minutes(rental_unit_kind, rental_unit_count) as rental_total_minutes,
  base_price_jpy,
  currency_code,
  is_active,
  effective_from,
  effective_to
from business.worker_rental_price_catalog
where is_active = true;

create or replace view business.v_worker_rental_contract_summary as
select
  rental_contract_id,
  app_code,
  service_code,
  user_id,
  worker_owner_schema,
  worker_id,
  worker_type,
  worker_snapshot_id,
  rental_unit_kind,
  rental_unit_count,
  business.worker_rental_unit_to_minutes(rental_unit_kind, rental_unit_count) as rental_total_minutes,
  rental_starts_at,
  rental_ends_at,
  base_price_jpy,
  applied_entitlement_count,
  free_unit_count,
  paid_unit_count,
  final_price_jpy,
  contract_status,
  price_version,
  locale,
  created_at,
  updated_at
from business.worker_rental_contract;

create or replace view business.v_worker_rental_entitlement_balance_active as
select
  entitlement_balance_id,
  entitlement_grant_id,
  app_code,
  service_code,
  user_id,
  grant_period,
  entitlement_kind,
  entitlement_source_rule,
  entitlement_unit_kind,
  entitlement_unit_count,
  business.worker_rental_unit_to_minutes(entitlement_unit_kind, entitlement_unit_count) as entitlement_minutes_each,
  granted_quantity,
  used_quantity,
  remaining_quantity,
  remaining_total_units,
  business.worker_rental_unit_to_minutes(entitlement_unit_kind, remaining_total_units) as remaining_total_minutes,
  balance_status,
  created_at,
  updated_at
from business.worker_rental_entitlement_balance
where balance_status = 'active';

comment on table business.worker_rental_unit_policy is 'Generic worker rental unit policy. Supports minute/hour/day/month/year. Generic max duration is 2 years.';
comment on table business.worker_rental_service_catalog is 'Generic worker rental service catalog. Each app/service defines supported units, min contract, max contract, monthly free ticket rule, and active status.';
comment on table business.worker_rental_price_catalog is 'App-specific worker rental price catalog. Prices are not globally shared.';
comment on table business.worker_rental_contract is 'Generic worker rental contract header. App-specific limits are enforced by service catalog trigger.';
comment on table business.worker_rental_entitlement_grant is 'Generic entitlement grant. Monthly free ticket uses app shortest contract duration.';
comment on table business.worker_rental_entitlement_balance is 'Generic entitlement balance. Unit count is app-specific.';
comment on table business.worker_rental_entitlement_usage is 'Generic entitlement usage linked to rental contract and period.';
