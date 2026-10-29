import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync(
  new URL("../sql/r20_persona_handoff_replay_guard.sql", import.meta.url),
  "utf8"
);

if (
  !source.includes(
    "CREATE FUNCTION civilization.consume_persona_auth_handoff"
  ) ||
  !source.includes("FORCE ROW LEVEL SECURITY") ||
  !source.includes("WHEN unique_violation THEN") ||
  source.includes("CREATE ROLE r20_persona_handoff_owner")
) {
  throw new Error("R20_CANONICAL_MIGRATION_CONTRACT_FAILED");
}

const output = process.argv[2];

if (!output) {
  throw new Error("OUTPUT_PATH_REQUIRED");
}

writeFileSync(output, source);

console.log("R20_CI_CANONICAL_MIGRATION=PASS");
