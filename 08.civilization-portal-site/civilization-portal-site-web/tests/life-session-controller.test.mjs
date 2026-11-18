import test from "node:test";
import assert from "node:assert/strict";

import {
  createLifePortalSessionController
} from "../lib/auth/life-session-controller.mjs";

const SESSION =
  "11111111-1111-4111-8111-111111111111";
const ACTOR =
  "22222222-2222-4222-8222-222222222222";

function makeService({
  authenticate = async () => ({
    status: "ok",
    sessionId: SESSION,
    actorId: ACTOR,
    expiresAtMs: Date.now() + 60000
  }),
  revokeAuthenticated = async () => ({
    status: "revoked"
  })
} = {}) {
  return createLifePortalSessionController({
    sessionService: {
      authenticate,
      revokeAuthenticated
    }
  });
}

test("valid session returns authenticated actor", async () => {
  const result = await makeService().authenticate("valid");
  assert.equal(result.status, "ok");
  assert.equal(result.actorId, ACTOR);
});

test("missing cookie is unauthorized", async () => {
  assert.deepEqual(
    await makeService().authenticate(""),
    {status: "unauthorized"}
  );
});

test("expired session is unauthorized", async () => {
  const controller = makeService({
    authenticate: async () => ({
      status: "ok",
      sessionId: SESSION,
      actorId: ACTOR,
      expiresAtMs: Date.now() - 1000
    })
  });

  assert.equal(
    (await controller.authenticate("valid")).status,
    "unauthorized"
  );
});

test("DB outage fails closed", async () => {
  const controller = makeService({
    authenticate: async () => {
      throw new Error("database_unavailable");
    }
  });

  assert.equal(
    (await controller.authenticate("valid")).status,
    "unavailable"
  );
});

test("same-origin logout revokes session", async () => {
  let calls = 0;

  const controller = makeService({
    revokeAuthenticated: async () => {
      calls++;
      return {status: "revoked"};
    }
  });

  const result = await controller.logout({
    token: "valid",
    origin: "https://portal.example",
    expectedOrigin: "https://portal.example"
  });

  assert.equal(result.status, "revoked");
  assert.equal(calls, 1);
});

test("cross-origin logout never calls repository", async () => {
  let calls = 0;

  const controller = makeService({
    revokeAuthenticated: async () => {
      calls++;
      return {status: "revoked"};
    }
  });

  const result = await controller.logout({
    token: "valid",
    origin: "https://evil.example",
    expectedOrigin: "https://portal.example"
  });

  assert.equal(result.status, "forbidden");
  assert.equal(calls, 0);
});

test("missing origin is rejected", async () => {
  const result = await makeService().logout({
    token: "valid",
    expectedOrigin: "https://portal.example"
  });

  assert.equal(result.status, "forbidden");
});

test("malformed origin is rejected", async () => {
  const result = await makeService().logout({
    token: "valid",
    origin: "https://portal.example.evil.example",
    expectedOrigin: "https://portal.example"
  });

  assert.equal(result.status, "forbidden");
});

test("logout DB failure is unavailable", async () => {
  const controller = makeService({
    revokeAuthenticated: async () => {
      throw new Error("database_unavailable");
    }
  });

  const result = await controller.logout({
    token: "valid",
    origin: "https://portal.example",
    expectedOrigin: "https://portal.example"
  });

  assert.equal(result.status, "unavailable");
});

test("invalid configuration fails", () => {
  assert.throws(
    () => createLifePortalSessionController({}),
    /not_configured/
  );
});
