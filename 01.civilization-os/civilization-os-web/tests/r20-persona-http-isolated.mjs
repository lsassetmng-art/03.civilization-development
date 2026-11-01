import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const host = "127.0.0.1";
const route = "/api/civilization/auth/handoff/persona-exchange";

assert.equal(process.env.CI, "true");
assert.equal(process.env.R20_REPLAY_ISOLATED_CI, "true");

const databaseUrl = process.env.R20_CI_DATABASE_URL;
assert.ok(databaseUrl, "R20_CI_DATABASE_URL_REQUIRED");

const target = new URL(databaseUrl);
assert.equal(target.protocol, "postgresql:");
assert.equal(target.hostname, host);
assert.equal(target.port, "5432");
assert.equal(target.pathname, "/r20_replay_ci");
assert.equal(decodeURIComponent(target.username), "r20_replay_runtime");
assert.equal(target.search, "");
assert.equal(target.hash, "");

const rootCert = process.env.PGSSLROOTCERT;
assert.ok(rootCert, "PGSSLROOTCERT_REQUIRED");
assert.ok(readFileSync(rootCert, "utf8").includes("BEGIN CERTIFICATE"));

const sealKey = randomBytes(32).toString("base64url");
const actor = `r20-http-${randomBytes(12).toString("hex")}`;
const verifier = randomBytes(32).toString("base64url");
const state = randomBytes(32).toString("base64url");
const challenge = createHash("sha256")
  .update(verifier, "ascii")
  .digest("base64url");

function loadIssuer() {
  const source = readFileSync(
    new URL("../lib/persona-auth-handoff.ts", import.meta.url),
    "utf8"
  );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    reportDiagnostics: true
  });

  const errors = (compiled.diagnostics ?? []).filter(
    (item) => item.category === ts.DiagnosticCategory.Error
  );
  assert.equal(errors.length, 0, "ISSUER_TRANSPILE_FAILED");

  const module = { exports: {} };
  const load = (name) => {
    if (name === "./persona-handoff-replay-guard") {
      return {
        consumePersonaHandoffCode() {
          throw new Error("ISSUER_MUST_NOT_CONSUME");
        }
      };
    }
    return require(name);
  };

  const factory = vm.runInThisContext(
    `(function(require,module,exports){\n${compiled.outputText}\n})`,
    { filename: "persona-auth-handoff.cjs" }
  );

  factory(load, module, module.exports);
  assert.equal(typeof module.exports.issuePersonaHandoff, "function");
  return module.exports.issuePersonaHandoff;
}

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, host, resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  await new Promise((resolve) => server.close(resolve));
  return address.port;
}

async function post(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });

  return {
    status: response.status,
    body: await response.json(),
    cache: response.headers.get("cache-control"),
    referrer: response.headers.get("referrer-policy")
  };
}

function checkHeaders(response) {
  assert.match(response.cache ?? "", /no-store/);
  assert.equal(response.referrer, "no-referrer");
}

async function runServer(connectionUrl, execute) {
  const port = await freePort();
  const url = `http://${host}:${port}${route}`;
  const env = {
    ...process.env,
    NODE_ENV: "development",
    NEXT_TELEMETRY_DISABLED: "1",
    CIVILIZATION_AUTH_HANDOFF_SEAL_KEY: sealKey,
    CIVILIZATION_PORTAL_PUBLIC_BASE_URL: `http://${host}:${port}`,
    PERSONA_DATABASE_URL: connectionUrl
  };

  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "dev", "-H", host, "-p", String(port)],
    { env, stdio: "ignore", detached: false }
  );

  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (child.exitCode !== null) {
        throw new Error("NEXT_SERVER_EXITED");
      }
      try {
        const response = await post(url, {});
        if (
          response.status === 400 &&
          response.body.error === "invalid_request"
        ) {
          ready = true;
          break;
        }
      } catch {
        // Next.js is still starting.
      }
      await sleep(1000);
    }
    assert.ok(ready, "NEXT_SERVER_TIMEOUT");
    await execute(url);
  } finally {
    if (child.exitCode === null) child.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => {
        if (child.exitCode !== null) resolve();
        else child.once("exit", resolve);
      }),
      sleep(5000).then(() => {
        if (child.exitCode === null) child.kill("SIGKILL");
      })
    ]);
  }
}

const issue = loadIssuer();

async function issueCode() {
  const result = await issue({
    serverSessionActorKey: actor,
    state,
    codeChallenge: challenge,
    codeChallengeMethod: "S256"
  });

  assert.equal(result.status, "ok", "HANDOFF_ISSUE_FAILED");
  const redirect = new URL(result.redirectTarget);
  const code = redirect.searchParams.get("code");
  assert.ok(code, "HANDOFF_CODE_MISSING");
  assert.equal(redirect.searchParams.get("state"), state);
  return { code, state, code_verifier: verifier };
}

const previousKey = process.env.CIVILIZATION_AUTH_HANDOFF_SEAL_KEY;
const previousBase = process.env.CIVILIZATION_PORTAL_PUBLIC_BASE_URL;

try {
  process.env.CIVILIZATION_AUTH_HANDOFF_SEAL_KEY = sealKey;
  process.env.CIVILIZATION_PORTAL_PUBLIC_BASE_URL = `http://${host}:3000`;

  const validBody = await issueCode();

  const tlsUrl = new URL(databaseUrl);
  tlsUrl.searchParams.set("sslrootcert", rootCert);
  tlsUrl.searchParams.set("sslmode", "verify-full");

  await runServer(tlsUrl.toString(), async (url) => {
    const invalid = await post(url, {});
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error, "invalid_request");
    checkHeaders(invalid);
    console.log("HTTP_400_INVALID_REQUEST=PASS");

    const opaque = "A".repeat(43);
    const malformed = await post(url, {
      code: "invalid",
      state: opaque,
      code_verifier: opaque
    });
    assert.equal(malformed.status, 401);
    assert.equal(malformed.body.error, "invalid_handoff");
    checkHeaders(malformed);
    console.log("HTTP_401_MALFORMED_CODE=PASS");

    const first = await post(url, validBody);
    assert.equal(first.status, 200, JSON.stringify(first.body));
    assert.equal(first.body.ok, true);
    assert.equal(first.body.server_session_actor_key, actor);
    checkHeaders(first);
    console.log("HTTP_200_DB_BACKED=PASS");

    const replay = await post(url, validBody);
    assert.equal(replay.status, 401);
    assert.equal(replay.body.error, "invalid_handoff");
    checkHeaders(replay);
    console.log("HTTP_401_REPLAY=PASS");
  });

  const outageUrl = new URL(tlsUrl);
  outageUrl.port = "1";

  const outageBody = await issueCode();

  await runServer(outageUrl.toString(), async (url) => {
    const unavailable = await post(url, outageBody);
    assert.equal(
      unavailable.status,
      503,
      JSON.stringify(unavailable.body)
    );
    assert.equal(unavailable.body.error, "handoff_unavailable");
    checkHeaders(unavailable);
    console.log("HTTP_503_DB_OUTAGE=PASS");
  });

  console.log("HTTP_HEADERS=PASS");
  console.log("R20_HTTP_INTEGRATION=PASS");
} finally {
  if (previousKey === undefined) {
    delete process.env.CIVILIZATION_AUTH_HANDOFF_SEAL_KEY;
  } else {
    process.env.CIVILIZATION_AUTH_HANDOFF_SEAL_KEY = previousKey;
  }
  if (previousBase === undefined) {
    delete process.env.CIVILIZATION_PORTAL_PUBLIC_BASE_URL;
  } else {
    process.env.CIVILIZATION_PORTAL_PUBLIC_BASE_URL = previousBase;
  }
}
