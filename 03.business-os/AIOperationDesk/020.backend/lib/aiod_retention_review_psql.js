import { readEnv } from "./aiod_env.js";

function dbUrl() {
  return readEnv("PERSONA_DATABASE_URL", "");
}

async function runPsqlScalar(sql) {
  const url = dbUrl();
  if (!url) {
    return "";
  }

  const cmd = new Deno.Command("psql", {
    args: [
      url,
      "-X",
      "-A",
      "-t",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql
    ],
    stdout: "piped",
    stderr: "piped"
  });

  const output = await cmd.output();

  if (output.code !== 0) {
    const stderr = new TextDecoder().decode(output.stderr).trim();
    throw new Error(`psql failed: ${stderr}`);
  }

  return new TextDecoder().decode(output.stdout).trim();
}

async function runPsqlArray(sql) {
  const wrapped = `
select coalesce(json_agg(t), '[]'::json)::text
from (
${sql}
) t;
`;

  const text = await runPsqlScalar(wrapped);
  if (!text) {
    return [];
  }

  return JSON.parse(text);
}

async function relationExists(relationName) {
  const url = dbUrl();
  if (!url) {
    return false;
  }

  try {
    const scalar = await runPsqlScalar(
      `select coalesce(to_regclass('${relationName}')::text, '');`
    );
    return scalar !== "";
  } catch (_e) {
    return false;
  }
}

export async function fetchNotificationEventRetentionReview() {
  if (!(await relationExists("business.aiod_notification_event"))) {
    return [];
  }

  return runPsqlArray(`
select
  notification_event_id,
  work_order_id,
  notification_type,
  destination_type,
  destination_ref,
  delivery_status,
  provider_error_code,
  created_at
from business.aiod_notification_event
order by created_at desc
limit 200
`);
}

export async function fetchAuditTraceRetentionReview() {
  if (!(await relationExists("business.aiod_audit_trace"))) {
    return [];
  }

  return runPsqlArray(`
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
`);
}

export async function fetchSummaryBatchRetentionReview() {
  if (!(await relationExists("business.aiod_summary_batch"))) {
    return [];
  }

  return runPsqlArray(`
select
  summary_batch_id,
  batch_type,
  batch_status,
  created_at
from business.aiod_summary_batch
order by created_at desc
limit 200
`);
}
