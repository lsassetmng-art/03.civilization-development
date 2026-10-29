import assert from "node:assert/strict";

const PORTAL = "http://127.0.0.1:3110";
const MOCK = "http://127.0.0.1:3108";

function getSetCookies(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  throw new Error("Node.js getSetCookie support required");
}

function cookieJar(response) {
  const jar = new Map();

  for (const header of getSetCookies(response)) {
    const pair = header.split(";")[0];
    const index = pair.indexOf("=");

    if (index > 0) {
      jar.set(
        pair.slice(0, index),
        pair.slice(index + 1)
      );
    }
  }

  return jar;
}

function cookieHeader(jar) {
  return [...jar]
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

function mergeCookies(jar, response) {
  for (const [key, value] of cookieJar(response)) {
    if (value) {
      jar.set(key, value);
    } else {
      jar.delete(key);
    }
  }
}

async function request(url, jar, options = {}) {
  return fetch(url, {
    redirect: "manual",
    ...options,
    headers: {
      ...(jar ? { cookie: cookieHeader(jar) } : {}),
      ...(options.headers || {})
    }
  });
}

async function begin(returnTo = "/lifeos") {
  const initial = await request(PORTAL + returnTo);

  assert.ok(
    [302, 303, 307, 308].includes(initial.status),
    "Unauthenticated menu must redirect"
  );

  const startUrl = new URL(
    initial.headers.get("location"),
    PORTAL
  );

  assert.equal(
    startUrl.pathname,
    "/api/persona/auth/start"
  );

  const start = await request(startUrl, null);

  assert.equal(start.status, 302);

  const jar = cookieJar(start);

  for (const name of [
    "persona_auth_state_v1",
    "persona_auth_pkce_v1",
    "persona_auth_return_v1"
  ]) {
    assert.ok(jar.get(name), `Missing ${name}`);
  }

  const continueUrl = new URL(
    start.headers.get("location")
  );

  assert.equal(continueUrl.origin, MOCK);

  assert.equal(
    continueUrl.pathname,
    "/api/civilization/auth/continue"
  );

  assert.equal(
    continueUrl.searchParams.get("handoff_state"),
    jar.get("persona_auth_state_v1")
  );

  assert.equal(
    continueUrl.searchParams.get("code_challenge_method"),
    "S256"
  );

  const continuation = await request(continueUrl, null);

  assert.equal(continuation.status, 302);

  const callback = new URL(
    continuation.headers.get("location")
  );

  assert.equal(callback.origin, PORTAL);

  return {
    jar,
    callback
  };
}

async function exchange(code, state, verifier) {
  return fetch(
    MOCK + "/api/civilization/auth/handoff/persona-exchange",
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        code,
        state,
        code_verifier: verifier
      })
    }
  );
}

// --------------------------------------------------
// Successful handoff
// --------------------------------------------------

{
  const { jar, callback } = await begin();

  const response = await request(callback, jar);

  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get("location"),
    PORTAL + "/lifeos"
  );

  const issued = cookieJar(response);

  assert.ok(
    issued.get("portal_persona_server_session_v1"),
    "Session cookie was not issued"
  );

  const rawHeaders = getSetCookies(response).join("\n");

  assert.match(rawHeaders, /httponly/i);
  assert.match(rawHeaders, /samesite=lax/i);

  mergeCookies(jar, response);

  const lifeos = await request(PORTAL + "/lifeos", jar);

  assert.equal(lifeos.status, 200);

  const html = await lifeos.text();

  assert.ok(
    html.includes('aria-label="LifeOS menu"'),
    "LifeOS HTML marker missing"
  );

  console.log("R20_7A_SUCCESSFUL_HANDOFF=PASS");
  console.log("R20_7A_LIFEOS_RETURN_200=PASS");
}

// --------------------------------------------------
// State mismatch
// --------------------------------------------------

{
  const { jar, callback } = await begin();

  callback.searchParams.set("state", "invalid-state");

  const response = await request(callback, jar);

  assert.equal(response.status, 401);

  const body = await response.json();

  assert.equal(body.error, "invalid_handoff");

  console.log("R20_7A_STATE_MISMATCH=PASS");
}

// --------------------------------------------------
// Invalid PKCE
// --------------------------------------------------

{
  const { jar, callback } = await begin();

  const code = callback.searchParams.get("code");
  const state = callback.searchParams.get("state");

  const response = await exchange(
    code,
    state,
    "wrong-verifier"
  );

  assert.equal(response.status, 401);

  const callbackResponse = await request(callback, jar);

  assert.equal(callbackResponse.status, 401);

  console.log("R20_7A_PKCE_REJECTED=PASS");
}

// --------------------------------------------------
// Replay protection
// --------------------------------------------------

{
  const { jar, callback } = await begin();

  const first = await request(callback, jar);

  assert.equal(first.status, 303);

  const replay = await request(callback, jar);

  assert.equal(replay.status, 401);

  const body = await replay.json();

  assert.equal(body.error, "invalid_handoff");

  console.log("R20_7A_CODE_REPLAY_REJECTED=PASS");
}

// --------------------------------------------------
// Invalid code
// --------------------------------------------------

{
  const { jar, callback } = await begin();

  callback.searchParams.set("code", "invalid-code");

  const response = await request(callback, jar);

  assert.equal(response.status, 401);

  console.log("R20_7A_INVALID_CODE_REJECTED=PASS");
}

console.log("R20_7A_HANDOFF_E2E=PASS");
