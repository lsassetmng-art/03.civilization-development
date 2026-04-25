import { SQL } from "./aiod_sql_catalog.js";

function env(name, fallback = "") {
  return globalThis.Deno?.env?.get?.(name) ?? fallback;
}

function dbUrl() {
  return env("PERSONA_DATABASE_URL", "");
}

function mode() {
  return (env("AIOD_DATA_MODE", "mock") || "mock").toLowerCase();
}

function requireDbUrl() {
  const url = dbUrl();
  if (!url) {
    throw new Error("PERSONA_DATABASE_URL is not set.");
  }
  return url;
}

function wrapJsonArrayQuery(innerSql) {
  return `
with q as (
${innerSql}
)
select coalesce(json_agg(q), '[]'::json)::text as json_result
from q;
`;
}

async function runPsqlArray(innerSql) {
  const databaseUrl = requireDbUrl();
  const query = wrapJsonArrayQuery(innerSql);

  const cmd = new Deno.Command("psql", {
    args: [
      databaseUrl,
      "-X",
      "-A",
      "-t",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      query
    ],
    stdout: "piped",
    stderr: "piped"
  });

  const result = await cmd.output();

  if (result.code !== 0) {
    const stderr = new TextDecoder().decode(result.stderr).trim();
    throw new Error(`psql failed: ${stderr}`);
  }

  const stdout = new TextDecoder().decode(result.stdout).trim();
  if (!stdout) {
    return [];
  }

  try {
    return JSON.parse(stdout);
  } catch (_e) {
    throw new Error(`psql returned non-JSON output: ${stdout}`);
  }
}

export function getDbGatewayMode() {
  return mode();
}

export async function fetchSupportedAppsPsql() {
  return {
    data_mode: "db_psql",
    items: await runPsqlArray(SQL.supportedApps)
  };
}

export async function fetchQueuePsql() {
  return {
    data_mode: "db_psql",
    items: await runPsqlArray(SQL.queue)
  };
}

export async function fetchFailuresPsql() {
  return {
    data_mode: "db_psql",
    items: await runPsqlArray(SQL.failures)
  };
}

export async function fetchReviewInboxPsql() {
  return {
    data_mode: "db_psql",
    items: await runPsqlArray(SQL.reviewInbox)
  };
}

export async function fetchApprovalInboxPsql() {
  return {
    data_mode: "db_psql",
    items: await runPsqlArray(SQL.approvalInbox)
  };
}

export async function fetchSummaryBatchesPsql() {
  return {
    data_mode: "db_psql",
    items: await runPsqlArray(SQL.summaryBatches)
  };
}
