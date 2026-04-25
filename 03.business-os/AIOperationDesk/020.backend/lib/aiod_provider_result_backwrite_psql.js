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

export async function backwriteNotificationDeliveryResultPsql(input = {}) {
  if (!input.notification_event_id) {
    return {
      persisted: false,
      reason: "missing_notification_event_id"
    };
  }

  const deliveryStatus = input.delivery_status || "failed";

  const sql = `
with updated as (
  update business.aiod_notification_event ne
     set delivery_status = ${sqlLiteral(deliveryStatus)}
   where ne.notification_event_id = ${sqlLiteral(input.notification_event_id)}
  returning
    ne.notification_event_id,
    ne.work_order_id,
    ne.notification_type,
    ne.destination_type,
    ne.destination_ref,
    ne.delivery_status,
    ne.created_at
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
    updated.work_order_id,
    'provider_delivery_result_backwritten',
    ${sqlLiteral('Provider delivery result back-written into notification_event.')},
    'system',
    ${sqlLiteral('aiod_provider_result_backwrite_psql')}
  from updated
  returning audit_trace_id
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
from updated
limit 1;
`;

  return runPsqlObject(sql);
}
