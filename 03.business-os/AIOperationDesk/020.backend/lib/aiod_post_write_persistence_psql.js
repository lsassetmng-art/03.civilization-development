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

export async function persistNotificationEventPsql(input = {}) {
  const notificationType = input.notification_type || null;
  const workOrderId = input.work_order_id || null;

  if (!notificationType || !workOrderId) {
    return {
      persisted: false,
      reason: "missing_notification_type_or_work_order_id"
    };
  }

  const sql = `
with inserted as (
  insert into business.aiod_notification_event (
    work_order_id,
    notification_type,
    destination_type,
    destination_ref,
    delivery_status
  )
  values (
    ${sqlLiteral(workOrderId)},
    ${sqlLiteral(notificationType)},
    'line',
    ${sqlLiteral(input.destination_ref || 'line_stub_default')},
    'pending'
  )
  returning
    notification_event_id,
    work_order_id,
    notification_type,
    destination_type,
    destination_ref,
    delivery_status,
    created_at
)
select
  notification_event_id,
  work_order_id,
  notification_type,
  destination_type,
  destination_ref,
  delivery_status,
  created_at,
  true as persisted
from inserted;
`;

  return runPsqlObject(sql);
}

export async function persistRuntimeAuditEventPsql(input = {}) {
  const workOrderId = input.work_order_id || null;

  if (!workOrderId) {
    return {
      persisted: false,
      reason: "missing_work_order_id"
    };
  }

  const sql = `
with inserted as (
  insert into business.aiod_audit_trace (
    work_order_id,
    event_type,
    event_summary,
    actor_type,
    actor_ref
  )
  values (
    ${sqlLiteral(workOrderId)},
    ${sqlLiteral(input.event_type || 'post_write_runtime_audit')},
    ${sqlLiteral(input.event_summary || 'Post-write runtime audit persisted by hardening bundle.')},
    ${sqlLiteral(input.actor_type || 'user')},
    ${sqlLiteral(input.actor_ref || 'unknown_actor')}
  )
  returning
    audit_trace_id,
    work_order_id,
    event_type,
    actor_type,
    actor_ref,
    created_at
)
select
  audit_trace_id,
  work_order_id,
  event_type,
  actor_type,
  actor_ref,
  created_at,
  true as persisted
from inserted;
`;

  return runPsqlObject(sql);
}
