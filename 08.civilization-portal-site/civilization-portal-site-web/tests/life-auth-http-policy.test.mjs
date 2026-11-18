import test from "node:test";
import assert from "node:assert/strict";

import {
  lifeSessionHttpResult,
  lifeLogoutHttpResult
} from "../lib/auth/life-auth-http-policy.mjs";

const validSession = {
  status: "ok",
  actorId: "11111111-1111-4111-8111-111111111111",
  sessionId: "22222222-2222-4222-8222-222222222222",
  expiresAtMs: Date.now() + 60000
};

test("valid session returns 200", () => {
  const r = lifeSessionHttpResult(validSession);
  assert.equal(r.status, 200);
  assert.equal(r.body.authenticated, true);
  assert.equal(r.clearCookie, false);
});

test("session identifiers never leak", () => {
  const r = lifeSessionHttpResult(validSession);
  const json = JSON.stringify(r.body);
  assert.equal(json.includes(validSession.sessionId), false);
  assert.equal(json.includes(validSession.actorId), false);
});

test("missing session returns 401", () => {
  assert.equal(lifeSessionHttpResult(null).status, 401);
});

test("expired session returns 401", () => {
  const r = lifeSessionHttpResult({
    ...validSession,
    expiresAtMs: Date.now() - 1000
  });
  assert.equal(r.status, 401);
  assert.equal(r.clearCookie, true);
});

test("DB outage returns 503", () => {
  const r = lifeSessionHttpResult({
    status: "unavailable"
  });
  assert.equal(r.status, 503);
  assert.equal(r.clearCookie, false);
});

test("logout success clears cookie", () => {
  const r = lifeLogoutHttpResult({
    status: "revoked"
  });
  assert.equal(r.status, 200);
  assert.equal(r.clearCookie, true);
});

test("cross-origin logout returns 403", () => {
  const r = lifeLogoutHttpResult({
    status: "forbidden"
  });
  assert.equal(r.status, 403);
  assert.equal(r.clearCookie, false);
});

test("logout DB outage returns 503", () => {
  const r = lifeLogoutHttpResult({
    status: "unavailable"
  });
  assert.equal(r.status, 503);
  assert.equal(r.clearCookie, false);
});

test("invalid logout returns 401", () => {
  const r = lifeLogoutHttpResult({
    status: "unauthorized"
  });
  assert.equal(r.status, 401);
  assert.equal(r.clearCookie, true);
});

test("all responses disable caching", () => {
  for (const r of [
    lifeSessionHttpResult(validSession),
    lifeSessionHttpResult({status:"unauthorized"}),
    lifeSessionHttpResult({status:"unavailable"}),
    lifeLogoutHttpResult({status:"revoked"}),
    lifeLogoutHttpResult({status:"forbidden"}),
    lifeLogoutHttpResult({status:"unavailable"})
  ]) {
    assert.equal(r.headers["cache-control"], "no-store");
  }
});
