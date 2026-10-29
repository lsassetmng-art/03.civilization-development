import assert from "node:assert/strict";
import { Pool } from "pg";

assert.equal(process.env.CI, "true");
assert.equal(process.env.R20_REPLAY_ISOLATED_CI, "true");

const raw = process.env.R20_CI_DATABASE_URL;

assert.ok(raw, "Missing isolated CI database URL");

const url = new URL(raw);

assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "5432");
assert.equal(url.pathname, "/r20_replay_ci");
assert.equal(
  decodeURIComponent(url.username),
  "r20_replay_runtime"
);

assert.equal(url.protocol, "postgresql:");
assert.equal(url.search, "");
assert.equal(url.hash, "");

const pool = new Pool({
  connectionString: raw,
  max: 3,
  connectionTimeoutMillis: 5000
});

try {
  const identity = await pool.query(`
    SELECT
      current_database() AS db,
      current_user AS role
  `);

  assert.equal(identity.rows[0].db, "r20_replay_ci");
  assert.equal(
    identity.rows[0].role,
    "r20_replay_runtime"
  );

  const first = await pool.query(
    `SELECT civilization.consume_persona_auth_handoff(
      $1::text,
      $2::timestamptz
    ) AS consumed`,
    [
      "d".repeat(64),
      new Date(Date.now() + 120000).toISOString()
    ]
  );

  assert.equal(first.rows[0].consumed, true);

  const replay = await pool.query(
    `SELECT civilization.consume_persona_auth_handoff(
      $1::text,
      $2::timestamptz
    ) AS consumed`,
    [
      "d".repeat(64),
      new Date(Date.now() + 120000).toISOString()
    ]
  );

  assert.equal(replay.rows[0].consumed, false);

  console.log("R20_RUNTIME_EXCHANGE=PASS");

  const privileges = await pool.query(`
    SELECT
      has_table_privilege(
        current_user,
        'civilization.persona_auth_handoff_consumption',
        'INSERT'
      ) AS can_insert,
      has_table_privilege(
        current_user,
        'civilization.persona_auth_handoff_consumption',
        'SELECT'
      ) AS can_select,
      has_function_privilege(
        current_user,
        'civilization.consume_persona_auth_handoff(text,timestamptz)',
        'EXECUTE'
      ) AS can_execute
  `);

  assert.equal(privileges.rows[0].can_insert, false);
  assert.equal(privileges.rows[0].can_select, false);
  assert.equal(privileges.rows[0].can_execute, true);

  await assert.rejects(
    pool.query(
      `INSERT INTO civilization.persona_auth_handoff_consumption
       (code_hash, expires_at)
       VALUES ($1, clock_timestamp() + interval '120 seconds')`,
      ["e".repeat(64)]
    ),
    (error) => error?.code === "42501"
  );

  await assert.rejects(
    pool.query(
      `SELECT code_hash
       FROM civilization.persona_auth_handoff_consumption`
    ),
    (error) => error?.code === "42501"
  );

  console.log("R20_DIRECT_TABLE_ACCESS=DENIED");
  const catalog = await pool.query(`
    SELECT
      c.relowner::regrole::text AS table_owner,
      c.relrowsecurity AS rls_enabled,
      c.relforcerowsecurity AS rls_forced,
      p.proowner::regrole::text AS function_owner,
      p.prosecdef AS security_definer,
      (
        SELECT count(*)::integer
        FROM pg_policies
        WHERE schemaname = 'civilization'
          AND tablename = 'persona_auth_handoff_consumption'
          AND policyname = 'r20_persona_handoff_insert'
          AND cmd = 'INSERT'
      ) AS insert_policy_count
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    CROSS JOIN pg_proc p
    WHERE n.nspname = 'civilization'
      AND c.relname = 'persona_auth_handoff_consumption'
      AND p.oid =
        'civilization.consume_persona_auth_handoff(text,timestamptz)'::regprocedure
  `);

  assert.equal(catalog.rowCount, 1);

  const item = catalog.rows[0];

  assert.equal(
    item.table_owner,
    "r20_persona_handoff_owner"
  );
  assert.equal(item.rls_enabled, true);
  assert.equal(item.rls_forced, true);
  assert.equal(
    item.function_owner,
    "r20_persona_handoff_owner"
  );
  assert.equal(item.security_definer, true);
  assert.equal(item.insert_policy_count, 1);

  console.log("R20_CATALOG_SECURITY=PASS");
  console.log("R20_RUNTIME_ROLE_SECURITY=PASS");
} finally {
  await pool.end();
}
