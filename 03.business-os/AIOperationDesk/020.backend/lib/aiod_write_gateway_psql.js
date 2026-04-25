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

export async function createExecutionRequestPsql(payload) {
  const supportedAppCode = payload.supported_app_code || "";
  const workTypeCode = payload.work_type_code || "GENERIC_EXECUTION_REQUEST";
  const triggerMode = payload.trigger_mode || "none";
  const scheduledAt = payload.scheduled_at ? sqlLiteral(payload.scheduled_at) + "::timestamptz" : "null";
  const riskClass = payload.risk_class || "medium";
  const reviewRequired = riskClass !== "low";
  const approvalRequired = riskClass === "high" || riskClass === "privileged";
  const workOrderStatus = approvalRequired ? "approval_pending" : (reviewRequired ? "review_pending" : "ready");

  const sql = `
with app as (
  select supported_app_id, app_code
  from business.aiod_supported_app_registry
  where app_code = ${sqlLiteral(supportedAppCode)}
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
    ${sqlLiteral(`execution request for ${workTypeCode}`)},
    null,
    ${scheduledAt},
    app.supported_app_id,
    'execution',
    ${sqlLiteral(payload.requester_user_id || 'dev_stub_user')},
    ${sqlLiteral(payload.source_surface_type || 'main_console')},
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
    'execution',
    ${sqlLiteral(workTypeCode)},
    ${sqlLiteral(riskClass)},
    ${reviewRequired ? "true" : "false"},
    ${approvalRequired ? "true" : "false"},
    ${sqlLiteral(payload.scheduled_at ? 'scheduled' : 'immediate')},
    ${sqlLiteral(triggerMode)},
    ${scheduledAt},
    ${sqlLiteral(workOrderStatus)}
  from req
  returning work_order_id, supported_app_id, risk_class, review_required, approval_required, work_order_status
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
    ${sqlLiteral(payload.review_reason_code || 'RR004_EXECUTION_REQUEST_PRECHECK')},
    null,
    'pending'
  from wo
  where wo.review_required = true
  returning review_request_id, work_order_id
),
approval_insert as (
  insert into business.aiod_approval_request (
    work_order_id,
    approval_reason_code,
    approver_user_id,
    approval_status
  )
  select
    wo.work_order_id,
    ${sqlLiteral(payload.approval_reason_code || 'AR001_HIGH_RISK_FINALIZATION')},
    null,
    'pending'
  from wo
  where wo.approval_required = true
  returning approval_request_id, work_order_id
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
    'execution_request_created',
    ${sqlLiteral('Execution request created by db_psql gateway.')},
    'system',
    ${sqlLiteral('aiod_write_gateway_psql')}
  from wo
  returning audit_trace_id, work_order_id
)
select
  wo.work_order_id,
  app.app_code as supported_app_code,
  wo.risk_class,
  wo.review_required,
  wo.approval_required,
  wo.work_order_status
from wo
join app on app.supported_app_id = wo.supported_app_id;
`;

  return runPsqlObject(sql);
}

export async function decideReviewPsql(payload) {
  const decision = payload.decision || "returned";
  const nextStatus = decision === "approved" ? "ready" : (decision === "rejected" ? "cancelled" : "draft");

  const sql = `
with target as (
  select review_request_id, work_order_id
  from business.aiod_review_request
  where review_request_id = ${sqlLiteral(payload.review_request_id)}
  limit 1
),
review_upd as (
  update business.aiod_review_request r
     set review_status = ${sqlLiteral(decision)},
         reviewer_user_id = ${sqlLiteral(payload.reviewer_user_id || 'dev_stub_reviewer')},
         decided_at = now()
    from target
   where r.review_request_id = target.review_request_id
  returning r.review_request_id, r.work_order_id, r.review_status
),
wo_upd as (
  update business.aiod_work_order w
     set work_order_status = ${sqlLiteral(nextStatus)},
         updated_at = now()
    from review_upd
   where w.work_order_id = review_upd.work_order_id
  returning w.work_order_id, w.work_order_status
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
    wo_upd.work_order_id,
    'review_decided',
    ${sqlLiteral('Review decision applied by db_psql gateway.')},
    'user',
    ${sqlLiteral(payload.reviewer_user_id || 'dev_stub_reviewer')}
  from wo_upd
  returning audit_trace_id
)
select
  review_upd.review_request_id,
  review_upd.review_status as decision_status,
  wo_upd.work_order_status as affected_work_order_status
from review_upd
join wo_upd on wo_upd.work_order_id = review_upd.work_order_id;
`;

  return runPsqlObject(sql);
}

export async function decideApprovalPsql(payload) {
  const decision = payload.decision || "returned";
  const nextStatus = decision === "approved" ? "ready" : (decision === "rejected" ? "cancelled" : "draft");

  const sql = `
with target as (
  select approval_request_id, work_order_id
  from business.aiod_approval_request
  where approval_request_id = ${sqlLiteral(payload.approval_request_id)}
  limit 1
),
approval_upd as (
  update business.aiod_approval_request a
     set approval_status = ${sqlLiteral(decision)},
         approver_user_id = ${sqlLiteral(payload.approver_user_id || 'dev_stub_approver')},
         decided_at = now()
    from target
   where a.approval_request_id = target.approval_request_id
  returning a.approval_request_id, a.work_order_id, a.approval_status
),
wo_upd as (
  update business.aiod_work_order w
     set work_order_status = ${sqlLiteral(nextStatus)},
         updated_at = now()
    from approval_upd
   where w.work_order_id = approval_upd.work_order_id
  returning w.work_order_id, w.work_order_status
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
    wo_upd.work_order_id,
    'approval_decided',
    ${sqlLiteral('Approval decision applied by db_psql gateway.')},
    'user',
    ${sqlLiteral(payload.approver_user_id || 'dev_stub_approver')}
  from wo_upd
  returning audit_trace_id
)
select
  approval_upd.approval_request_id,
  approval_upd.approval_status as decision_status,
  wo_upd.work_order_status as affected_work_order_status
from approval_upd
join wo_upd on wo_upd.work_order_id = approval_upd.work_order_id;
`;

  return runPsqlObject(sql);
}

export async function saveNotificationRulePsql(payload) {
  const userId = payload.user_id || "dev_stub_user";

  const sql = `
with upserted as (
  insert into business.aiod_notification_rule (
    user_id,
    notify_review_pending,
    notify_approval_pending,
    notify_confirmation_required,
    notify_execution_failed,
    notify_retry_scheduled,
    notify_completed_with_warning,
    notify_completed_summary_available,
    line_destination_ref,
    is_active
  )
  values (
    ${sqlLiteral(userId)},
    ${payload.notify_review_pending === false ? "false" : "true"},
    ${payload.notify_approval_pending === false ? "false" : "true"},
    ${payload.notify_confirmation_required === false ? "false" : "true"},
    ${payload.notify_execution_failed === false ? "false" : "true"},
    ${payload.notify_retry_scheduled === false ? "false" : "true"},
    ${payload.notify_completed_with_warning === false ? "false" : "true"},
    ${payload.notify_completed_summary_available === false ? "false" : "true"},
    ${sqlLiteral(payload.line_destination_ref || null)},
    ${payload.is_active === false ? "false" : "true"}
  )
  on conflict (user_id) do update
    set notify_review_pending = excluded.notify_review_pending,
        notify_approval_pending = excluded.notify_approval_pending,
        notify_confirmation_required = excluded.notify_confirmation_required,
        notify_execution_failed = excluded.notify_execution_failed,
        notify_retry_scheduled = excluded.notify_retry_scheduled,
        notify_completed_with_warning = excluded.notify_completed_with_warning,
        notify_completed_summary_available = excluded.notify_completed_summary_available,
        line_destination_ref = excluded.line_destination_ref,
        is_active = excluded.is_active,
        updated_at = now()
  returning notification_rule_id, user_id, line_destination_ref, is_active
)
select
  notification_rule_id,
  user_id,
  line_destination_ref,
  is_active,
  true as saved
from upserted;
`;

  return runPsqlObject(sql);
}
