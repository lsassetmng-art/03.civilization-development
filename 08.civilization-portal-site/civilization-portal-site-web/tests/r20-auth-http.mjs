import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const BASE = "http://127.0.0.1:3107";
const SECRET = process.env.PORTAL_PERSONA_SESSION_SIGNING_SECRET;

assert.ok(SECRET?.length >= 32, "Missing isolated test secret");

const routes = [
  "/lifeos",
  "/streaming-menu",
  "/business-menu",
  "/staticart-menu",
  "/game-menu"
];

function sessionCookie({
  actor = "r20-test-actor",
  expiryOffset = 3600000
} = {}) {
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({
    version: 1,
    serverSessionActorKey: actor,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + expiryOffset).toISOString()
  })).toString("base64url");

  const signature = createHmac("sha256", SECRET)
    .update(payload, "utf8")
    .digest("base64url");

  return `portal_persona_server_session_v1=${payload}.${signature}`;
}

function cookies(response) {
  const value = response.headers.get("set-cookie") || "";
  return value;
}

function locationPath(response) {
  const location = response.headers.get("location");
  assert.ok(location, "Missing Location header");
  const url = new URL(location, BASE);
  return url.pathname + url.search;
}

async function get(path, cookie) {
  return fetch(BASE + path, {
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {}
  });
}

for (const route of routes) {
  const encoded = encodeURIComponent(route);

  const denied = await get(route);
  assert.ok(
    [302, 303, 307, 308].includes(denied.status),
    `Expected redirect for ${route}, got ${denied.status}`
  );
  assert.equal(
    locationPath(denied),
    `/api/persona/auth/start?return_to=${encoded}`
  );

  const allowed = await get(route, sessionCookie());
  assert.ok(
    ![302, 303, 307, 308].includes(allowed.status),
    `Valid session redirected on ${route}: ${allowed.status}`
  );
  assert.ok(
    allowed.status < 500,
    `Valid session server error on ${route}: ${allowed.status}`
  );

  const tampered = await get(route, sessionCookie() + "tampered");
  assert.ok(
    [302, 303, 307, 308].includes(tampered.status),
    `Tampered session accepted on ${route}`
  );

  const expired = await get(route, sessionCookie({
    expiryOffset: -60000
  }));
  assert.ok(
    [302, 303, 307, 308].includes(expired.status),
    `Expired session accepted on ${route}`
  );

  console.log(`AUTH_ROUTE_PASS=${route}`);
}

for (const route of routes) {
  const response = await get(
    `/api/persona/auth/start?return_to=${encodeURIComponent(route)}`
  );

  assert.equal(response.status, 302);
  assert.ok(
    cookies(response).includes("persona_auth_return_v1="),
    `Missing return cookie for ${route}`
  );
  assert.ok(
    cookies(response).includes("persona_auth_state_v1="),
    `Missing state cookie for ${route}`
  );
  console.log(`AUTH_START_PASS=${route}`);
}

for (const unsafe of [
  "https://evil.example/",
  "//evil.example/",
  "/lifeos/other",
  "/unknown",
  "/%2f%2fevil.example"
]) {
  const response = await get(
    `/api/persona/auth/start?return_to=${encodeURIComponent(unsafe)}`
  );
  assert.equal(response.status, 302);
  assert.ok(
    cookies(response).includes("persona_auth_return_v1=%2Fpersona-menu") ||
    cookies(response).includes("persona_auth_return_v1=/persona-menu"),
    `Unsafe return not normalized: ${unsafe}`
  );
  console.log("UNSAFE_RETURN_REJECTED");
}

const invalidCallback = await get(
  "/api/persona/auth/callback?code=invalid&state=invalid"
);
assert.equal(invalidCallback.status, 401);

const invalidBody = await invalidCallback.json();
assert.equal(invalidBody.error, "invalid_handoff");

console.log("INVALID_CALLBACK_REJECTED=PASS");
console.log("R20_AUTH_HTTP=PASS");
