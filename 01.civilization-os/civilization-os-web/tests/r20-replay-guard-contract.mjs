import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(
  new URL(path, import.meta.url),
  "utf8"
);

const handoff = read("../lib/persona-auth-handoff.ts");
const guard = read("../lib/persona-handoff-replay-guard.ts");
const sql = read("../sql/r20_persona_handoff_replay_guard.sql");

assert.match(
  handoff,
  /consumePersonaHandoffCode\(/
);

assert.match(
  handoff,
  /consumption === "replayed"/
);

assert.match(
  handoff,
  /consumption === "unavailable"/
);

assert.match(
  guard,
  /createHash\("sha256"\)/
);

assert.match(
  guard,
  /consume_persona_auth_handoff/
);

assert.match(
  sql,
  /WHEN unique_violation THEN/
);

assert.match(
  sql,
  /FORCE ROW LEVEL SECURITY/
);

assert.match(
  sql,
  /REVOKE ALL ON FUNCTION/
);

console.log("R20_REPLAY_GUARD_STATIC_CONTRACT=PASS");
console.log("DATABASE_RUNTIME_TEST=NOT_RUN");
console.log("CONCURRENT_EXCHANGE_TEST=NOT_RUN");
