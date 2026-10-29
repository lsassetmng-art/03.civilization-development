import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const guard = readFileSync(
  new URL("../lib/persona-handoff-replay-guard.ts", import.meta.url),
  "utf8"
);

const exchange = readFileSync(
  new URL("../lib/persona-auth-handoff.ts", import.meta.url),
  "utf8"
);

const route = readFileSync(
  new URL(
    "../app/api/civilization/auth/handoff/persona-exchange/route.ts",
    import.meta.url
  ),
  "utf8"
);

assert.match(
  guard,
  /catch\s*\{\s*return "unavailable"/
);

assert.match(
  exchange,
  /consumption === "unavailable"/
);

assert.match(
  route,
  /"handoff_unavailable"/
);

assert.match(
  route,
  /503/
);

console.log("R20_DB_FAILURE_MAPPING_STATIC=PASS");
console.log("R20_DB_OUTAGE_HTTP_RUNTIME=NOT_RUN");
