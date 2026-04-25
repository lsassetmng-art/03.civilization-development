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

async function runPsqlArray(sql) {
  const databaseUrl = requireDbUrl();
  const wrapped = `
with q as (
${sql}
)
select coalesce(json_agg(q), '[]'::json)::text as json_result
from q;
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
    return [];
  }

  return JSON.parse(stdout);
}

export async function fetchNotificationEventRetentionReview() {
  const sql = `
select
  notification_event_id,
  work_order_id,
  notification_type,
  destination_type,
  destination_ref,
  delivery_status,
  created_at
from business.aiod_notification_event
order by created_at desc
limit 200
`;
  return runPsqlArray(sql);
}

export async function fetchAuditTraceRetentionReview() {
  const sql = `
select
  audit_trace_id,
  work_order_id,
  event_type,
  event_summary,
  actor_type,
  actor_ref,
  created_at
from business.aiod_audit_trace
order by created_at desc
limit 200
`;
  return runPsqlArray(sql);
}

export async function fetchSummaryBatchRetentionReview() {
  const sql = `
select
  summary_batch_id,
  batch_type,
  batch_window_start_at,
  batch_window_end_at,
  batch_status,
  created_at
from business.aiod_summary_batch
order by created_at desc
limit 100
`;
  return runPsqlArray(sql);
}
