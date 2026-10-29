import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(
  new URL(
    "../sql/r20_persona_handoff_replay_guard.sql",
    import.meta.url
  ),
  "utf8"
);

const guard = readFileSync(
  new URL(
    "../lib/persona-handoff-replay-guard.ts",
    import.meta.url
  ),
  "utf8"
);

assert.match(
  sql,
  /R20_ISOLATED_MIGRATION_APPROVAL_REQUIRED/
);

assert.doesNotMatch(
  sql,
  /CREATE ROLE r20_persona_handoff_owner\s+NOLOGIN/
);

const bootstrap = readFileSync(
  new URL("../sql/r20_replay_guard_ci_bootstrap.sql", import.meta.url),
  "utf8"
);

assert.match(
  bootstrap,
  /CREATE ROLE r20_persona_handoff_owner\s+NOLOGIN/
);

assert.match(
  sql,
  /FORCE ROW LEVEL SECURITY/
);

assert.match(
  sql,
  /CREATE POLICY r20_persona_handoff_insert/
);

assert.match(
  sql,
  /TO r20_persona_handoff_owner/
);

assert.match(
  sql,
  /SECURITY DEFINER/
);

assert.match(
  sql,
  /SET search_path = pg_catalog/
);

assert.match(
  sql,
  /WHEN unique_violation THEN/
);

assert.match(
  sql,
  /GET STACKED DIAGNOSTICS/
);

assert.match(
  sql,
  /v_constraint_name\s*=\s*CONSTRAINT_NAME/
);

assert.match(
  sql,
  /persona_auth_handoff_consumption_pkey/
);

assert.match(
  sql,
  /RAISE;/
);

assert.match(
  sql,
  /OWNER TO r20_persona_handoff_owner/
);

assert.match(
  sql,
  /FROM PUBLIC/
);

assert.doesNotMatch(
  sql,
  /^\s*GRANT EXECUTE\b/im
);

assert.match(
  guard,
  /sslmode", "verify-full"/
);

assert.match(
  guard,
  /return "unavailable"/
);

console.log("R20_REPLAY_SECURITY_STATIC=PASS");
console.log("RLS_RUNTIME_TEST=NOT_RUN");
console.log("CONCURRENT_EXCHANGE_TEST=NOT_RUN");
console.log("PRODUCTION_DDL=NOT_APPLIED");
