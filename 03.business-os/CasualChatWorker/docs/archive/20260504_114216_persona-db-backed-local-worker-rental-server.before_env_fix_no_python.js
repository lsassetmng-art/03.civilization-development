const http = require("http");
const { spawnSync } = require("child_process");

const APP_CODE = "CasualChatWorker";
const SERVICE_CODE = "casual_chat_worker";

function assertPersonaDbEnv() {
  if (!process.env.PERSONA_DATABASE_URL) {
    throw new Error("PERSONA_DATABASE_URL is required.");
  }
  if (process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must not be used for CasualChatWorker Persona-side DB path.");
  }
}

function runPsql(sql, variables = {}) {
  assertPersonaDbEnv();

  const args = [
    process.env.PERSONA_DATABASE_URL,
    "-X",
    "-q",
    "-t",
    "-A",
    "-v",
    "ON_ERROR_STOP=1"
  ];

  for (const [key, value] of Object.entries(variables)) {
    args.push("-v", `${key}=${String(value)}`);
  }

  args.push("-c", sql);

  const result = spawnSync("psql", args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8
  });

  if (result.status !== 0) {
    const err = new Error(result.stderr || "psql failed");
    err.stdout = result.stdout;
    err.stderr = result.stderr;
    err.status = result.status;
    throw err;
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("request body too large"));
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function requireCasualChatWorker(payload) {
  if (payload.app_code !== APP_CODE || payload.service_code !== SERVICE_CODE) {
    return {
      ok: false,
      reason: "UNSUPPORTED_APP_OR_SERVICE",
      app_code: payload.app_code,
      service_code: payload.service_code
    };
  }
  return null;
}

function getServiceCatalogPayload() {
  const sql = `
select jsonb_build_object(
  'ok', true,
  'app_code', app_code,
  'service_code', service_code,
  'service_name', service_name,
  'minimum_contract', jsonb_build_object(
    'unit_kind', minimum_contract_unit_kind,
    'unit_count', minimum_contract_unit_count,
    'total_minutes', minimum_contract_minutes
  ),
  'app_max_contract', jsonb_build_object(
    'unit_kind', app_max_contract_unit_kind,
    'unit_count', app_max_contract_unit_count,
    'total_minutes', app_max_contract_minutes
  ),
  'monthly_free_ticket', jsonb_build_object(
    'enabled', monthly_free_ticket_enabled,
    'quantity', monthly_free_ticket_quantity,
    'source_rule', monthly_free_ticket_source_rule,
    'unit_kind', monthly_free_ticket_unit_kind,
    'unit_count', monthly_free_ticket_unit_count,
    'carryover_enabled', monthly_free_ticket_carryover_enabled
  )
)::text
from business.v_worker_rental_service_catalog_active
where app_code = 'CasualChatWorker'
  and service_code = 'casual_chat_worker';
`;
  const rows = runPsql(sql);
  return rows[0] || { ok: false, reason: "SERVICE_NOT_FOUND" };
}

function getQuotePayload(payload) {
  const unsupported = requireCasualChatWorker(payload);
  if (unsupported) return unsupported;

  const rentalUnitKind = payload.rental_unit_kind || "minute";
  const rentalUnitCount = Number(payload.rental_unit_count || 0);
  const requestedTicketCount = Number(payload.requested_entitlement_count || 0);

  if (rentalUnitKind !== "minute" || !Number.isFinite(rentalUnitCount) || rentalUnitCount <= 0) {
    return { ok: false, reason: "INVALID_RENTAL_UNIT" };
  }

  const sql = `
with request as (
  select
    'CasualChatWorker'::text as app_code,
    'casual_chat_worker'::text as service_code,
    'minute'::text as rental_unit_kind,
    :rental_unit_count::int as rental_unit_count,
    :requested_ticket_count::int as requested_ticket_count
),
service as (
  select s.*
  from business.v_worker_rental_service_catalog_active s
  join request r
    on r.app_code = s.app_code
   and r.service_code = s.service_code
),
decision as (
  select
    case
      when not exists (select 1 from service) then jsonb_build_object(
        'ok', false,
        'reason', 'SERVICE_NOT_FOUND'
      )
      when (select rental_unit_count from request) > (select app_max_contract_minutes from service) then jsonb_build_object(
        'ok', false,
        'rejected', true,
        'reason', 'APP_MAX_CONTRACT_EXCEEDED',
        'app_code', (select app_code from request),
        'service_code', (select service_code from request),
        'requested_minutes', (select rental_unit_count from request),
        'app_max_contract_minutes', (select app_max_contract_minutes from service)
      )
      else (
        with price as (
          select p.*
          from business.v_worker_rental_price_catalog_active p
          join request r
            on r.app_code = p.app_code
           and r.service_code = p.service_code
           and r.rental_unit_kind = p.rental_unit_kind
           and r.rental_unit_count = p.rental_unit_count
        ),
        ticket_rule as (
          select t.*
          from business.v_worker_rental_monthly_free_ticket_rule t
          join request r
            on r.app_code = t.app_code
           and r.service_code = t.service_code
        ),
        quote as (
          select
            r.app_code,
            r.service_code,
            r.rental_unit_kind,
            r.rental_unit_count,
            p.base_price_jpy,
            least(r.requested_ticket_count, t.monthly_free_ticket_quantity) as applied_entitlement_count,
            least(r.requested_ticket_count, t.monthly_free_ticket_quantity) * t.free_ticket_minutes_each as free_unit_count,
            greatest(r.rental_unit_count - (least(r.requested_ticket_count, t.monthly_free_ticket_quantity) * t.free_ticket_minutes_each), 0) as paid_unit_count,
            greatest(
              p.base_price_jpy - ((least(r.requested_ticket_count, t.monthly_free_ticket_quantity) * t.free_ticket_minutes_each) / 30 * 500),
              0
            ) as final_price_jpy,
            t.monthly_free_ticket_source_rule as entitlement_source_rule,
            p.price_version,
            p.currency_code
          from request r
          join price p on true
          join ticket_rule t on true
        )
        select jsonb_build_object(
          'ok', true,
          'quote_status', 'quoted',
          'app_code', app_code,
          'service_code', service_code,
          'rental_unit_kind', rental_unit_kind,
          'rental_unit_count', rental_unit_count,
          'base_price_jpy', base_price_jpy,
          'applied_entitlement_count', applied_entitlement_count,
          'free_unit_count', free_unit_count,
          'paid_unit_count', paid_unit_count,
          'final_price_jpy', final_price_jpy,
          'entitlement_source_rule', entitlement_source_rule,
          'price_version', price_version,
          'currency_code', currency_code
        )
        from quote
      )
    end as payload
)
select payload::text from decision;
`;

  const rows = runPsql(sql, {
    rental_unit_count: rentalUnitCount,
    requested_ticket_count: requestedTicketCount
  });

  return rows[0] || { ok: false, reason: "QUOTE_NOT_FOUND" };
}

function getConfirmPayload(payload) {
  const unsupported = requireCasualChatWorker(payload);
  if (unsupported) return unsupported;

  if (process.env.CCW_ALLOW_ROLLBACK_CONFIRM !== "1") {
    return { ok: false, reason: "ROLLBACK_CONFIRM_NOT_ALLOWED" };
  }

  const rentalUnitCount = Number(payload.rental_unit_count || 0);
  const applyEntitlementCount = Number(payload.apply_entitlement_count || 0);

  if (rentalUnitCount !== 90 || applyEntitlementCount !== 2) {
    return {
      ok: false,
      reason: "SMOKE_ONLY_SUPPORTS_90_MIN_TWO_TICKETS"
    };
  }

  const marker = `http-confirm-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  const sql = `
begin;

create temp table ccw_smoke_context (
  smoke_marker text not null,
  test_user_id uuid not null,
  worker_owner_schema text not null,
  worker_id text not null,
  worker_type text not null,
  entitlement_grant_id uuid,
  entitlement_balance_id uuid,
  rental_contract_id uuid,
  rental_period_id uuid,
  rental_payment_intent_id uuid,
  entitlement_usage_id uuid,
  rental_status_history_id uuid
) on commit drop;

insert into ccw_smoke_context (
  smoke_marker,
  test_user_id,
  worker_owner_schema,
  worker_id,
  worker_type
)
select
  :'smoke_marker',
  md5(clock_timestamp()::text || random()::text)::uuid,
  'aiworker',
  'rollback-smoke-lover-worker-' || :'smoke_marker',
  'Lover';

with inserted as (
  insert into business.worker_rental_entitlement_grant (
    app_code,
    service_code,
    user_id,
    grant_period,
    entitlement_kind,
    entitlement_source_rule,
    entitlement_unit_kind,
    entitlement_unit_count,
    granted_quantity,
    total_granted_units,
    carryover_enabled,
    grant_status
  )
  select
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    smoke_marker,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    'minute',
    30,
    2,
    60,
    false,
    'granted'
  from ccw_smoke_context
  returning entitlement_grant_id
)
update ccw_smoke_context c
set entitlement_grant_id = i.entitlement_grant_id
from inserted i;

with inserted as (
  insert into business.worker_rental_entitlement_balance (
    entitlement_grant_id,
    app_code,
    service_code,
    user_id,
    grant_period,
    entitlement_kind,
    entitlement_source_rule,
    entitlement_unit_kind,
    entitlement_unit_count,
    granted_quantity,
    used_quantity,
    remaining_quantity,
    remaining_total_units,
    balance_status
  )
  select
    entitlement_grant_id,
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    smoke_marker,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    'minute',
    30,
    2,
    0,
    2,
    60,
    'active'
  from ccw_smoke_context
  returning entitlement_balance_id
)
update ccw_smoke_context c
set entitlement_balance_id = i.entitlement_balance_id
from inserted i;

with inserted as (
  insert into business.worker_rental_contract (
    app_code,
    service_code,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    rental_unit_kind,
    rental_unit_count,
    base_price_jpy,
    applied_entitlement_count,
    free_unit_count,
    paid_unit_count,
    final_price_jpy,
    contract_status,
    price_version,
    locale
  )
  select
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    'minute',
    90,
    1500,
    2,
    60,
    30,
    500,
    'confirmed',
    'v1',
    'ja'
  from ccw_smoke_context
  returning rental_contract_id
)
update ccw_smoke_context c
set rental_contract_id = i.rental_contract_id
from inserted i;

insert into business.worker_rental_contract_line (
  rental_contract_id,
  line_type,
  rental_unit_kind,
  rental_unit_count,
  quantity,
  unit_price_jpy,
  amount_jpy,
  note
)
select
  rental_contract_id,
  'base_rental',
  'minute',
  90,
  1,
  1500,
  1500,
  'http rollback smoke base rental'
from ccw_smoke_context
union all
select
  rental_contract_id,
  'entitlement_discount',
  'minute',
  60,
  2,
  500,
  -1000,
  'http rollback smoke monthly free ticket'
from ccw_smoke_context;

with inserted as (
  insert into business.worker_rental_period (
    rental_contract_id,
    user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    period_status,
    remaining_seconds_snapshot
  )
  select
    rental_contract_id,
    test_user_id,
    worker_owner_schema,
    worker_id,
    worker_type,
    'scheduled',
    90 * 60
  from ccw_smoke_context
  returning rental_period_id
)
update ccw_smoke_context c
set rental_period_id = i.rental_period_id
from inserted i;

with inserted as (
  insert into business.worker_rental_payment_intent (
    rental_contract_id,
    user_id,
    amount_jpy,
    currency_code,
    payment_status
  )
  select
    rental_contract_id,
    test_user_id,
    500,
    'JPY',
    'pending'
  from ccw_smoke_context
  returning rental_payment_intent_id
)
update ccw_smoke_context c
set rental_payment_intent_id = i.rental_payment_intent_id
from inserted i;

with inserted as (
  insert into business.worker_rental_entitlement_usage (
    entitlement_grant_id,
    entitlement_balance_id,
    rental_contract_id,
    rental_period_id,
    app_code,
    service_code,
    user_id,
    entitlement_kind,
    entitlement_source_rule,
    used_quantity,
    used_unit_kind,
    used_unit_count,
    discounted_amount_jpy,
    final_price_jpy,
    usage_status
  )
  select
    entitlement_grant_id,
    entitlement_balance_id,
    rental_contract_id,
    rental_period_id,
    'CasualChatWorker',
    'casual_chat_worker',
    test_user_id,
    'monthly_shortest_contract_free_ticket',
    'shortest_contract_duration',
    2,
    'minute',
    60,
    1000,
    500,
    'reserved'
  from ccw_smoke_context
  returning entitlement_usage_id
)
update ccw_smoke_context c
set entitlement_usage_id = i.entitlement_usage_id
from inserted i;

update business.worker_rental_entitlement_balance b
set
  used_quantity = b.used_quantity + 2,
  remaining_quantity = b.remaining_quantity - 2,
  remaining_total_units = (b.remaining_quantity - 2) * b.entitlement_unit_count
from ccw_smoke_context c
where b.entitlement_balance_id = c.entitlement_balance_id
  and b.remaining_quantity >= 2;

with inserted as (
  insert into business.worker_rental_status_history (
    rental_contract_id,
    from_status,
    to_status,
    reason
  )
  select
    rental_contract_id,
    'quoted',
    'confirmed',
    'http rollback smoke confirm'
  from ccw_smoke_context
  returning rental_status_history_id
)
update ccw_smoke_context c
set rental_status_history_id = i.rental_status_history_id
from inserted i;

select jsonb_build_object(
  'ok', true,
  'status', 'confirmed',
  'rollback_only', true,
  'app_code', wr.app_code,
  'service_code', wr.service_code,
  'rental_contract_id', c.rental_contract_id,
  'rental_period_id', c.rental_period_id,
  'payment_intent_id', c.rental_payment_intent_id,
  'entitlement_usage_id', c.entitlement_usage_id,
  'worker_owner_schema', wr.worker_owner_schema,
  'worker_id', wr.worker_id,
  'worker_type', wr.worker_type,
  'rental_unit_kind', wr.rental_unit_kind,
  'rental_unit_count', wr.rental_unit_count,
  'base_price_jpy', wr.base_price_jpy,
  'applied_entitlement_count', wr.applied_entitlement_count,
  'free_unit_count', wr.free_unit_count,
  'paid_unit_count', wr.paid_unit_count,
  'final_price_jpy', wr.final_price_jpy,
  'remaining_entitlement_count', b.remaining_quantity,
  'remaining_entitlement_units', b.remaining_total_units,
  'line_count', line_summary.line_count,
  'line_amount_total', line_summary.line_amount_total,
  'remaining_seconds_snapshot', p.remaining_seconds_snapshot
)::text
from ccw_smoke_context c
join business.worker_rental_contract wr
  on wr.rental_contract_id = c.rental_contract_id
join business.worker_rental_period p
  on p.rental_period_id = c.rental_period_id
join business.worker_rental_entitlement_balance b
  on b.entitlement_balance_id = c.entitlement_balance_id
join (
  select
    rental_contract_id,
    count(*) as line_count,
    sum(amount_jpy) as line_amount_total
  from business.worker_rental_contract_line
  group by rental_contract_id
) line_summary
  on line_summary.rental_contract_id = c.rental_contract_id
where wr.rental_unit_count = 90
  and wr.base_price_jpy = 1500
  and wr.final_price_jpy = 500
  and b.used_quantity = 2
  and b.remaining_quantity = 0
  and line_summary.line_count = 2
  and line_summary.line_amount_total = 500
  and p.remaining_seconds_snapshot = 5400;

rollback;

select jsonb_build_object(
  'ok', true,
  'post_rollback_check', 'ALL_CLEAR',
  'grant_count', (
    select count(*)
    from business.worker_rental_entitlement_grant
    where grant_period = :'smoke_marker'
  ),
  'contract_count', (
    select count(*)
    from business.worker_rental_contract
    where worker_id = 'rollback-smoke-lover-worker-' || :'smoke_marker'
  )
)::text;
`;

  const rows = runPsql(sql, { smoke_marker: marker });
  const confirm = rows[0] || { ok: false, reason: "CONFIRM_PAYLOAD_NOT_RETURNED" };
  const residual = rows[1] || { ok: false, reason: "RESIDUAL_CHECK_NOT_RETURNED" };

  if (!confirm.ok) return confirm;
  if (residual.grant_count !== 0 || residual.contract_count !== 0) {
    return {
      ok: false,
      reason: "ROLLBACK_RESIDUAL_FOUND",
      confirm,
      residual
    };
  }

  return {
    ...confirm,
    residual
  };
}

function createPersonaDbBackedLocalWorkerRentalServer() {
  assertPersonaDbEnv();

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");

      if (req.method === "GET" && url.pathname === "/health") {
        sendJson(res, 200, {
          ok: true,
          app_code: APP_CODE,
          service_code: SERVICE_CODE,
          db_target: "Persona-side DB",
          db_env: "PERSONA_DATABASE_URL"
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/v1/business/worker-rental/service/catalog") {
        const payload = getServiceCatalogPayload();
        sendJson(res, payload.ok ? 200 : 404, payload);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/business/worker-rental/quote") {
        const body = await readRequestBody(req);
        const payload = getQuotePayload(body);
        sendJson(res, payload.ok ? 200 : 400, payload);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/v1/business/worker-rental/confirm") {
        const body = await readRequestBody(req);
        const payload = getConfirmPayload(body);
        sendJson(res, payload.ok ? 200 : 400, payload);
        return;
      }

      sendJson(res, 404, { ok: false, reason: "NOT_FOUND", path: url.pathname });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        reason: "SERVER_ERROR",
        message: error.message,
        stderr: error.stderr || ""
      });
    }
  });

  return server;
}

module.exports = {
  createPersonaDbBackedLocalWorkerRentalServer
};

if (require.main === module) {
  const port = Number(process.env.CCW_PERSONA_DB_BACKED_PORT || 8787);
  const server = createPersonaDbBackedLocalWorkerRentalServer();

  server.listen(port, "127.0.0.1", () => {
    console.log(`Persona DB-backed CasualChatWorker local server listening on 127.0.0.1:${port}`);
  });
}
