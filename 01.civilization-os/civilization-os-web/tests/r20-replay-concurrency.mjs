import assert from "node:assert/strict";
import { Pool } from "pg";

const url = process.env.R20_CI_DATABASE_URL;

if (!url) {
  throw new Error("R20_CI_DATABASE_URL_REQUIRED");
}

assert.equal(process.env.CI, "true");
assert.equal(process.env.R20_REPLAY_ISOLATED_CI, "true");

const target = new URL(url);

assert.equal(target.protocol, "postgresql:");
assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.port, "5432");
assert.equal(target.pathname, "/r20_replay_ci");
assert.equal(
  decodeURIComponent(target.username),
  "r20_replay_runtime"
);
assert.equal(target.search, "");
assert.equal(target.hash, "");

const pool = new Pool({
  connectionString: url,
  max: 12,
  connectionTimeoutMillis: 5000
});

const hash = "c".repeat(64);
const expiry = new Date(Date.now() + 120000).toISOString();

try {
  const results = await Promise.all(
    Array.from({ length: 10 }, () =>
      pool.query(
        `SELECT civilization.consume_persona_auth_handoff(
           $1::text, $2::timestamptz
         ) AS consumed`,
        [hash, expiry]
      )
    )
  );

  const successes = results.filter(
    (result) => result.rows[0]?.consumed === true
  ).length;

  assert.equal(
    successes,
    1,
    `Expected exactly one successful exchange, got ${successes}`
  );

  console.log("R20_CONCURRENT_CONSUMPTION=PASS");
} finally {
  await pool.end();
}
