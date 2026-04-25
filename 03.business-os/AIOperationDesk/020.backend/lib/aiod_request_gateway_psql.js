function env(name, fallback = "") {
  return globalThis.Deno?.env?.get?.(name) ?? fallback;
}

function dbUrl() {
  return env("PERSONA_DATABASE_URL", "");
}

function requireDbUrl() {
  const url = dbUrl();
  if (!url) {
    throw new Error("PERSONA_DATABASE_URL is not set.");
  }
  return url;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }

  const text = String(value).replace(/'/g, "''");
  return `'${text}'`;
}

function sqlJson(value) {
  const text = JSON.stringify(value ?? {}).replace(/'/g, "''");
  return `'${text}'::jsonb`;
}

async function runPsqlObject(sql) {
  const databaseUrl = requireDbUrl();
  const wrapped = `
with result as (
${sql}
)
select row_to_json(result)::text
from result;
`;

  const cmd = new Deno.Command("psql", {
    args: [
      databaseUrl,
      "-X",
      "-A",
      "-t",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      wrapped
    ],
    stdout: "piped",
    stderr: "piped"
  });

  const output = await cmd.output();

  if (output.code !== 0) {
    const stderr = new TextDecoder().decode(output.stderr).trim();
    throw new Error(`psql failed: ${stderr}`);
  }

  const stdout = new TextDecoder().decode(output.stdout).trim();
  if (!stdout) {
    return {};
  }

  return JSON.parse(stdout);
}

function resolveLane(payload) {
  const laneType = payload.lane_type || "consult";
  if (laneType === "consult" || laneType === "draft" || laneType === "execution") {
    return laneType;
  }
  return "consult";
}

function resolveRisk(laneType) {
  if (laneType === "execution") {
    return "medium";
  }
  if (laneType === "draft") {
    return "medium";
  }
  return "low";
}

function resolveReviewRequired(laneType, riskClass) {
  if (laneType === "consult") {
    return false;
  }
  return riskClass !== "low";
}

function resolveApprovalRequired(laneType, riskClass) {
  if (laneType !== "execution") {
    return false;
  }
  return riskClass === "high" || riskClass === "privileged";
}

function resolveWorkOrderStatus(reviewRequired, approvalRequired) {
  if (approvalRequired) {
    return "approval_pending";
  }
  if (reviewRequired) {
    return "review_pending";
  }
  return "ready";
}

export async function createOperationRequestPsql(payload) {
  const laneType = resolveLane(payload);
  const riskClass = resolveRisk(laneType);
  const reviewRequired = resolveReviewRequired(laneType, riskClass);
  const approvalRequired = resolveApprovalRequired(laneType, riskClass);
  const workOrderStatus = resolveWorkOrderStatus(reviewRequired, approvalRequired);
  const hasSupportedApp = !!payload.supported_app_code;
  const wantsCompiledWorkOrder = hasSupportedApp && !!laneType;
  const requestedStartAt = payload.requested_start_at
    ? `${sqlLiteral(payload.requested_start_at)}::timestamptz`
    : "null";

  const sql = `
with app as (
  select supported_app_id, app_code
  from business.aiod_supported_app_registry
  where app_code = ${sqlLiteral(payload.supported_app_code || null)}
  limit 1
),
req as (
  insert into business.aiod_operation_request (
    request_channel,
    request_text,
    voice_transcript,
    requested_start_at,
    supported_app_id,
    lane_type,
    requester_user_id,
    source_surface_type,
    priority_level,
    request_status
  )
  values (
    ${sqlLiteral(payload.request_channel || "text")},
    ${sqlLiteral(payload.request_text || "")},
    ${sqlLiteral(payload.voice_transcript || null)},
    ${requestedStartAt},
    (select supported_app_id from app),
    ${sqlLiteral(laneType)},
    ${sqlLiteral(payload.requester_user_id || "dev_stub_user")},
    ${sqlLiteral(payload.source_surface_type || "main_console")},
    ${sqlLiteral(payload.priority_level || "normal")},
    ${sqlLiteral(wantsCompiledWorkOrder ? "compiled" : "parsed")}
  )
  returning operation_request_id, supported_app_id
),
ctx as (
  insert into business.aiod_resident_context_snapshot (
    source_surface_type,
    supported_app_id,
    current_screen_code,
    current_module_code,
    current_record_ref,
    current_field_code,
    current_company_ref,
    latest_error_code,
    entered_value_json,
    permission_context_json
  )
  select
    ${sqlLiteral(payload.source_surface_type || "main_console")},
    req.supported_app_id,
    ${sqlLiteral(payload.resident_context_snapshot?.current_screen_code || null)},
    ${sqlLiteral(payload.resident_context_snapshot?.current_module_code || null)},
    ${sqlLiteral(payload.resident_context_snapshot?.current_record_ref || null)},
    ${sqlLiteral(payload.resident_context_snapshot?.current_field_code || null)},
    ${sqlLiteral(payload.resident_context_snapshot?.current_company_ref || null)},
    ${sqlLiteral(payload.resident_context_snapshot?.latest_error_code || null)},
    ${sqlJson(payload.resident_context_snapshot?.entered_value_json || {})},
    ${sqlJson(payload.resident_context_snapshot?.permission_context_json || {})}
  from req
  where ${sqlLiteral(payload.source_surface_type || "main_console")} in ('erp_resident_surface', 'builder_resident_surface')
  returning resident_context_snapshot_id
),
wo as (
  insert into business.aiod_work_order (
    operation_request_id,
    supported_app_id,
    lane_type,
    work_type_code,
    risk_class,
    review_required,
    approval_required,
    execution_mode,
    trigger_mode,
    scheduled_at,
    work_order_status
  )
  select
    req.operation_request_id,
    req.supported_app_id,
    ${sqlLiteral(laneType)},
    ${sqlLiteral(payload.work_type_code || `${String(payload.supported_app_code || "GENERAL")}_${laneType.toUpperCase()}_REQUEST`)},
    ${sqlLiteral(riskClass)},
    ${reviewRequired ? "true" : "false"},
    ${approvalRequired ? "true" : "false"},
    ${sqlLiteral(payload.requested_start_at ? "scheduled" : "immediate")},
    ${sqlLiteral(payload.requested_start_at ? "time" : "none")},
    ${requestedStartAt},
    ${sqlLiteral(workOrderStatus)}
  from req
  where ${wantsCompiledWorkOrder ? "true" : "false"} = true
    and req.supported_app_id is not null
  returning work_order_id, risk_class, review_required, approval_required, work_order_status
),
audit_insert as (
  insert into business.aiod_audit_trace (
    work_order_id,
    event_type,
    event_summary,
    actor_type,
    actor_ref
  )
  select
    wo.work_order_id,
    'operation_request_compiled',
    ${sqlLiteral('Operation request compiled by db_psql gateway.')},
    'system',
    ${sqlLiteral('aiod_request_gateway_psql')}
  from wo
  returning audit_trace_id
)
select
  req.operation_request_id,
  (select work_order_id from wo limit 1) as compiled_work_order_id,
  ${sqlLiteral(hasSupportedApp)}::boolean as supported_app_resolved,
  ${sqlLiteral(laneType)} as lane_type_resolved,
  ${sqlLiteral(riskClass)} as risk_class,
  ${reviewRequired ? "true" : "false"} as review_required,
  ${approvalRequired ? "true" : "false"} as approval_required,
  (select resident_context_snapshot_id from ctx limit 1) as resident_context_snapshot_id
from req;
`;

  return runPsqlObject(sql);
}

export async function createProvisionalVoucherPsql(payload) {
  const requestedStartAt = payload.requested_start_at
    ? `${sqlLiteral(payload.requested_start_at)}::timestamptz`
    : "null";

  const lineItemsJson = sqlJson(payload.line_items || []);

  const sql = `
with app as (
  select supported_app_id, app_code
  from business.aiod_supported_app_registry
  where app_code = 'ERP'
    and support_status = 'supported'
  limit 1
),
req as (
  insert into business.aiod_operation_request (
    request_channel,
    request_text,
    voice_transcript,
    requested_start_at,
    supported_app_id,
    lane_type,
    requester_user_id,
    source_surface_type,
    priority_level,
    request_status
  )
  select
    'text',
    ${sqlLiteral(payload.draft_reason_text || 'ERP provisional voucher request')},
    null,
    ${requestedStartAt},
    app.supported_app_id,
    'draft',
    ${sqlLiteral(payload.requester_user_id || 'dev_stub_user')},
    ${sqlLiteral(payload.source_surface_type || 'erp_resident_surface')},
    ${sqlLiteral(payload.priority_level || 'normal')},
    'compiled'
  from app
  returning operation_request_id, supported_app_id
),
wo as (
  insert into business.aiod_work_order (
    operation_request_id,
    supported_app_id,
    lane_type,
    work_type_code,
    risk_class,
    review_required,
    approval_required,
    execution_mode,
    trigger_mode,
    scheduled_at,
    work_order_status
  )
  select
    req.operation_request_id,
    req.supported_app_id,
    'draft',
    'ERP_PROVISIONAL_VOUCHER_DRAFT',
    'medium',
    true,
    false,
    ${sqlLiteral(payload.requested_start_at ? "scheduled" : "immediate")},
    ${sqlLiteral(payload.requested_start_at ? "time" : "none")},
    ${requestedStartAt},
    'review_pending'
  from req
  returning work_order_id
),
target_company as (
  insert into business.aiod_work_order_target_binding (
    work_order_id,
    binding_type,
    target_ref,
    target_label
  )
  select
    wo.work_order_id,
    'company',
    ${sqlLiteral(payload.company_ref)},
    ${sqlLiteral(payload.company_ref)}
  from wo
  returning work_order_target_binding_id
),
target_voucher as (
  insert into business.aiod_work_order_target_binding (
    work_order_id,
    binding_type,
    target_ref,
    target_label
  )
  select
    wo.work_order_id,
    'voucher',
    ${sqlLiteral(payload.voucher_type_code)},
    ${sqlLiteral(payload.voucher_type_code)}
  from wo
  returning work_order_target_binding_id
),
output_binding as (
  insert into business.aiod_work_order_output_binding (
    work_order_id,
    output_type,
    destination_type,
    destination_ref
  )
  select
    wo.work_order_id,
    'provisional_voucher',
    'review',
    ${sqlLiteral(payload.currency_code || 'JPY')}
  from wo
  returning work_order_output_binding_id
),
review_insert as (
  insert into business.aiod_review_request (
    work_order_id,
    review_reason_code,
    reviewer_user_id,
    review_status
  )
  select
    wo.work_order_id,
    ${sqlLiteral(payload.review_reason_code || 'RR008_PROVISIONAL_VOUCHER_CHECK')},
    null,
    'pending'
  from wo
  returning review_request_id
),
audit_insert as (
  insert into business.aiod_audit_trace (
    work_order_id,
    event_type,
    event_summary,
    actor_type,
    actor_ref
  )
  select
    wo.work_order_id,
    'provisional_voucher_created',
    ${sqlLiteral('ERP provisional voucher draft created by db_psql gateway.')},
    'system',
    ${sqlLiteral('aiod_request_gateway_psql')}
  from wo
  returning audit_trace_id
)
select
  req.operation_request_id,
  wo.work_order_id,
  'draft' as lane_type,
  'prepared' as draft_status,
  true as review_required,
  false as approval_required,
  ${lineItemsJson} as line_items_echo
from req
join wo on true;
`;

  return runPsqlObject(sql);
}

export async function scheduleRetryPsql(payload) {
  const nextRetryAt = payload.next_retry_at
    ? `${sqlLiteral(payload.next_retry_at)}::timestamptz`
    : "now()";

  const sql = `
with target as (
  select
    ${sqlLiteral(payload.retry_plan_id || null)} as retry_plan_id,
    ${sqlLiteral(payload.work_order_id || null)} as work_order_id,
    ${sqlLiteral(payload.failure_record_id || null)} as failure_record_id
),
existing as (
  select rp.retry_plan_id, rp.work_order_id, rp.failure_record_id, rp.retry_count
  from business.aiod_retry_plan rp
  join target t on rp.retry_plan_id = t.retry_plan_id
),
created as (
  insert into business.aiod_retry_plan (
    work_order_id,
    failure_record_id,
    retry_status,
    next_retry_at,
    retry_count
  )
  select
    t.work_order_id,
    t.failure_record_id,
    'scheduled',
    ${nextRetryAt},
    1
  from target t
  where t.retry_plan_id is null
    and t.work_order_id is not null
    and t.failure_record_id is not null
  returning retry_plan_id, work_order_id, failure_record_id, retry_status, next_retry_at, retry_count
),
updated as (
  update business.aiod_retry_plan rp
     set retry_status = 'scheduled',
         next_retry_at = ${nextRetryAt},
         retry_count = rp.retry_count + 1
    from existing e
   where rp.retry_plan_id = e.retry_plan_id
  returning rp.retry_plan_id, rp.work_order_id, rp.failure_record_id, rp.retry_status, rp.next_retry_at, rp.retry_count
),
picked as (
  select * from created
  union all
  select * from updated
),
audit_insert as (
  insert into business.aiod_audit_trace (
    work_order_id,
    event_type,
    event_summary,
    actor_type,
    actor_ref
  )
  select
    p.work_order_id,
    'retry_scheduled',
    ${sqlLiteral('Retry scheduled by db_psql gateway.')},
    'system',
    ${sqlLiteral('aiod_request_gateway_psql')}
  from picked p
  returning audit_trace_id
)
select
  retry_plan_id,
  retry_status,
  next_retry_at,
  retry_count,
  work_order_id,
  failure_record_id
from picked
limit 1;
`;

  return runPsqlObject(sql);
}
